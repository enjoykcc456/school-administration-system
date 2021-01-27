import { BAD_REQUEST } from 'http-status-codes'

import ErrorBase from '../errors/ErrorBase'
import sequelize from '../config/database'
import Teacher from '../models/Teacher'
import Subject from '../models/Subject'
import Class from '../models/Class'
import SubjectClass from '../models/SubjectClass'
import {
  validateRegisterBody,
  upsert,
  getIds,
  mixArrs,
  populateJunctionModel,
  register,
} from './RegistrationUtils'
import UniqueKeys from '../const/UniqueKeys'
import ForeignKeys from '../const/ForeignKeys'
import { RegisterBody } from '../utils/RegistrationUtils'

const {
  TEACHER_UNIQUE_KEY,
  SUBJECT_UNIQUE_KEY,
  CLASS_UNIQUE_KEY,
  STUDENT_UNIQUE_KEY,
} = UniqueKeys

const {
  TEACHER_FOREIGN_KEY,
  SUBJECT_FOREIGN_KEY,
  CLASS_FOREIGN_KEY,
  STUDENT_FOREIGN_KEY,
} = ForeignKeys

afterAll(async () => {
  await sequelize.sync({ force: true })
  await sequelize.close()
})

describe('Test Validate Register Body Function', () => {
  test('it should be able to validate the input register body to make sure the unique input fields of each class \
    (e.g. "email" field for class "teacher") are not having duplicated values and returns an object', () => {
    const input = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student1@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }

    const expectedOutput = {
      teacherBody: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      studentsBody: [
        {
          name: 'Student 1',
          email: 'student1@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subjectBody: {
        subjectCode: 'ENG',
        name: 'English',
      },
      classBody: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }

    expect(validateRegisterBody(input)).toEqual(expectedOutput)
  })

  test('it should be able to throw an Error when there are duplicate values in the fields that are supposed to be unique in each class', () => {
    const input = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student2@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
      class: {
        classCode: 'P1-1',
        name: 'P1 Integrity',
      },
    }

    expect(() => validateRegisterBody(input)).toThrow(
      new ErrorBase(
        "Duplicate value found for key 'students' on field 'email'",
        BAD_REQUEST,
        BAD_REQUEST
      )
    )
  })

  test('it should be able to throw an Error when any of the key inputs is missing', () => {
    const input: any = {
      teacher: {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      students: [
        {
          name: 'Student 1',
          email: 'student2@gmail.com',
        },
        {
          name: 'Student 2',
          email: 'student2@gmail.com',
        },
      ],
      subject: {
        subjectCode: 'ENG',
        name: 'English',
      },
    }

    expect(() => validateRegisterBody(input)).toThrow(
      new ErrorBase('All inputs are mandatory!', BAD_REQUEST, BAD_REQUEST)
    )
  })
})

describe('Test Upsert Data Function', () => {
  // Before all tests run, clear the DB and run migrations with Sequelize sync()
  beforeAll(async () => await sequelize.sync({ force: true }))

  test('it should be able to create new records in the database', async () => {
    const input = [
      {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      {
        name: 'Teacher 2',
        email: 'teacher2@gmail.com',
      },
    ]

    // Create records in the Teacher table
    const transaction = await sequelize.transaction()
    const results = await upsert(input, Teacher, transaction, [
      TEACHER_UNIQUE_KEY,
    ])
    await transaction.commit()

    // Get the result array with objects of created Teacher records
    const resultsArr = results.map((result: any) => ({
      name: result.name,
      [TEACHER_UNIQUE_KEY]: result[TEACHER_UNIQUE_KEY],
    }))

    // Compare the input and result array to expect the result array to equal to the input array
    expect(resultsArr).toEqual(expect.arrayContaining(input))
  })

  test('it should be able to update existing records in the database', async () => {
    const input = [
      {
        name: 'Teacher A',
        email: 'teacher1@gmail.com',
      },
      {
        name: 'Teacher 2',
        email: 'teacher2@gmail.com',
      },
    ]

    // Create records in the Teacher table
    const transaction = await sequelize.transaction()
    const results = await upsert(input, Teacher, transaction, ['name'])
    await transaction.commit()

    // Get the result array with objects of created Teacher records
    const resultsArr = results.map((result: any) => ({
      name: result.name,
      [TEACHER_UNIQUE_KEY]: result[TEACHER_UNIQUE_KEY],
    }))

    // Compare the input and result array to expect the result array to equal to the input array
    expect(resultsArr).toEqual(expect.arrayContaining(input))
  })
})

describe('Test Populate Junction Table Function', () => {
  const input1 = [
    {
      name: 'English',
      subjectCode: 'ENG',
    },
    {
      name: 'Maths',
      subjectCode: 'MATH',
    },
  ]

  const input2 = [
    {
      name: 'P1-1 Int',
      classCode: 'P1-1',
    },
    {
      name: 'P2-1 Int',
      classCode: 'P2-1',
    },
  ]

  // Before each test run, clear the DB and run migrations with Sequelize sync()
  beforeEach(async () => {
    await sequelize.sync({ force: true })
    const transaction = await sequelize.transaction()

    // Create records in the Subject table
    const subjects = await upsert(input1, Subject, transaction, ['name'])

    // Create records in the Class table
    const classes = await upsert(input2, Class, transaction, ['name'])
    await transaction.commit()
  })

  test('it should be able to populate the junction table with ids arrays from 2 Models', async () => {
    const expectedOutput = [
      { subject_id: 1, class_id: 1 },
      { subject_id: 1, class_id: 2 },
      { subject_id: 2, class_id: 1 },
      { subject_id: 2, class_id: 2 },
    ]

    const transaction = await sequelize.transaction()
    const subjects = await Subject.findAll({ transaction })
    const classes = await Class.findAll({ transaction })

    // Get the Subject Ids
    const subjectIds = await getIds(
      subjects,
      Subject,
      SUBJECT_UNIQUE_KEY,
      transaction
    )

    // Get the Class Ids
    const classIds = await getIds(classes, Class, CLASS_UNIQUE_KEY, transaction)

    // Populate SubjectClass table with subjectIds and classIds as Foreign Keys
    const subjectClasses = await populateJunctionModel(
      subjectIds,
      classIds,
      SUBJECT_FOREIGN_KEY,
      CLASS_FOREIGN_KEY,
      SubjectClass,
      transaction
    )
    await transaction.commit()

    const subjectClassesResult = subjectClasses.map((record: any) => ({
      [SUBJECT_FOREIGN_KEY]: record[SUBJECT_FOREIGN_KEY],
      [CLASS_FOREIGN_KEY]: record[CLASS_FOREIGN_KEY],
    }))

    expect(subjectClassesResult).toEqual(expectedOutput)
  })
})

describe('Test Get Ids Function', () => {
  const input1 = [
    {
      name: 'English',
      subjectCode: 'ENG',
    },
    {
      name: 'Maths',
      subjectCode: 'MATH',
    },
  ]

  const input2 = [
    {
      name: 'P1-1 Int',
      classCode: 'P1-1',
    },
    {
      name: 'P2-1 Int',
      classCode: 'P2-1',
    },
  ]

  // Before each test run, clear the DB and run migrations with Sequelize sync()
  beforeEach(async () => {
    await sequelize.sync({ force: true })
    const transaction = await sequelize.transaction()

    // Create records in the Teacher table
    const subjects = await upsert(input1, Subject, transaction, ['name'])

    // Create records in the Class table
    const classes = await upsert(input2, Class, transaction, ['name'])

    await transaction.commit()
  })

  test('it should be able to return an array of ids for each record based on the Model', async () => {
    const expectedOutput = [1, 2]

    // Get the records from the Subject table
    const transaction = await sequelize.transaction()
    const subjects = await Subject.findAll({ transaction })

    // Get the subject ids based on unique key
    const resultIds = await getIds(
      subjects,
      Subject,
      SUBJECT_UNIQUE_KEY,
      transaction
    )
    await transaction.commit()

    expect(resultIds).toEqual(expect.arrayContaining(expectedOutput))
  })

  test('it should be able to return an array of ids for each record based on the Model (with pair of keys as \
    filter option from the junction table)', async () => {
    const expectedOutput = [1, 2, 3, 4]

    const transaction = await sequelize.transaction()

    // Get records from the Subject and Class tables
    const subjects = await Subject.findAll({ transaction })
    const classes = await Class.findAll({ transaction })

    // Get the subject ids based on unique key
    const subjectIds = await getIds(
      subjects,
      Subject,
      SUBJECT_UNIQUE_KEY,
      transaction
    )

    // Get the class ids based on unique key
    const classIds = await getIds(classes, Class, CLASS_UNIQUE_KEY, transaction)

    // Populate the SubjectClass junction table with subjectIds and classIds as Foreign Keys
    const subjectClasses = await populateJunctionModel(
      subjectIds,
      classIds,
      SUBJECT_FOREIGN_KEY,
      CLASS_FOREIGN_KEY,
      SubjectClass,
      transaction
    )

    // Get the subjectClass Ids from the junction table with pair of keys as filter
    const subjectClassIds = await getIds(
      subjectClasses,
      SubjectClass,
      [SUBJECT_FOREIGN_KEY, CLASS_FOREIGN_KEY],
      transaction
    )
    await transaction.commit()
    expect(subjectClassIds).toEqual(expect.arrayContaining(expectedOutput))
  })
})

describe('Test Mix Arrays Function', () => {
  test('it should mix the input arrays equally and return an array of objects in format of {[foreignKeyA]: idA, [foreignKeyB]: idB', () => {
    const input1 = [1, 2]
    const input2 = [1, 2]
    const input1ForeignKey = 'input1_key'
    const input2ForeignKey = 'input2_key'
    const expectedOutput = [
      { input1_key: 1, input2_key: 1 },
      { input1_key: 1, input2_key: 2 },
      { input1_key: 2, input2_key: 1 },
      { input1_key: 2, input2_key: 2 },
    ]

    expect(mixArrs(input1, input2, input1ForeignKey, input2ForeignKey)).toEqual(
      expectedOutput
    )
  })
})

describe('Test Register Function', () => {
  let input: RegisterBody = {
    teacher: {
      name: 'Teacher 1',
      email: 'teacher1@gmail.com',
    },
    students: [
      {
        name: 'Student 1',
        email: 'student1@gmail.com',
      },
      {
        name: 'Student 2',
        email: 'student2@gmail.com',
      },
    ],
    subject: [
      {
        name: 'English',
        subjectCode: 'ENG',
      },
      {
        name: 'Maths',
        subjectCode: 'MATH',
      },
    ],
    class: {
      name: 'P1-1 Int',
      classCode: 'P1-1',
    },
  }

  beforeAll(async () => await sequelize.sync({ force: true }))

  test('it should be able to register the the request body successfully without error', async () => {
    const transaction = await sequelize.transaction()
    const response = await register(input, transaction)
    expect(response).toBeUndefined()
  })

  test('it should be able to create and update record at the same time successfully without error', async () => {
    // Add new Teacher record to the input
    input['teacher'] = [
      {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      {
        name: 'Teacher 2',
        email: 'teacher2@gmail.com',
      },
    ]

    // Modify the name of class from 'P1-1 Int' to 'P2-1 Int'
    input['class'] = {
      name: 'P2-1 Int',
      classCode: 'P1-1',
    }

    const transaction = await sequelize.transaction()
    const response = await register(input, transaction)
    expect(response).toBeUndefined()
  })
})
