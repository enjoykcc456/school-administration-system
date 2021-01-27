import { BulkCreateOptions, Op } from 'sequelize'
import { Model, ModelCtor, Transaction } from 'sequelize/types'
import { BAD_REQUEST } from 'http-status-codes'

import ErrorBase from '../errors/ErrorBase'
import UniqueKeys from '../const/UniqueKeys'
import Teacher from '../models/Teacher'
import Student from '../models/Student'
import Subject from '../models/Subject'
import Class from '../models/Class'
import SubjectClass from '../models/SubjectClass'
import TeacherSubjectClass from '../models/TeacherSubjectClass'
import StudentSubjectClass from '../models/StudentSubjectClass'
import ForeignKeys from '../const/ForeignKeys'

interface TeacherBody {
  name: string
  email: string
}

interface StudentBody {
  name: string
  email: string
}

interface SubjectBody {
  name: string
  subjectCode: string
}

interface ClassBody {
  name: string
  classCode: string
}

export interface RegisterBody {
  teacher: TeacherBody | TeacherBody[]
  students: StudentBody | StudentBody[]
  subject: SubjectBody | SubjectBody[]
  class: ClassBody | ClassBody[]
}

const {
  TEACHER_UNIQUE_KEY,
  STUDENT_UNIQUE_KEY,
  CLASS_UNIQUE_KEY,
  SUBJECT_UNIQUE_KEY,
} = UniqueKeys

const {
  SUBJECT_FOREIGN_KEY,
  CLASS_FOREIGN_KEY,
  TEACHER_FOREIGN_KEY,
  STUDENT_FOREIGN_KEY,
  SUBJECT_CLASS_FOREIGN_KEY,
} = ForeignKeys

// Validate the body to make sure the unique keys for each model are unique at insert
export const validateRegisterBody = (registerBody: RegisterBody) => {
  if (Object.keys(registerBody).length !== 4) {
    throw new ErrorBase('All inputs are mandatory!', BAD_REQUEST, BAD_REQUEST)
  }

  const {
    teacher: teacherBody,
    students: studentsBody,
    subject: subjectBody,
    class: classBody,
  } = registerBody
  const regBodyArray = Object.entries(registerBody)

  const uniqueKeyMap = new Map()
  uniqueKeyMap.set('teacher', TEACHER_UNIQUE_KEY)
  uniqueKeyMap.set('students', STUDENT_UNIQUE_KEY)
  uniqueKeyMap.set('subject', SUBJECT_UNIQUE_KEY)
  uniqueKeyMap.set('class', CLASS_UNIQUE_KEY)

  // For each key in the request body, get their respective unique input key
  regBodyArray.forEach(([k, v]) => {
    let uniqueKey: string = uniqueKeyMap.get(k)

    // If the body of the key (e.g. teacher) is an array, make sure they are all unique
    if (Array.isArray(v)) {
      const uniqueIds = v.map(item => item[uniqueKey])
      const uniqueIdsSet = new Set(uniqueIds)

      if (uniqueIds.length !== uniqueIdsSet.size) {
        throw new ErrorBase(
          `Duplicate value found for key '${k}' on field '${uniqueKey}'`,
          BAD_REQUEST,
          BAD_REQUEST
        )
      }
    }
  })
  return { teacherBody, studentsBody, subjectBody, classBody }
}

// Update or Insert the Data
export const upsert = async (
  reqBody: { [key: string]: any },
  model: ModelCtor<Model>,
  transaction: Transaction,
  updateOnDuplicate?: BulkCreateOptions['updateOnDuplicate']
) => {
  const data = Array.isArray(reqBody) ? reqBody : [reqBody]
  return await model.bulkCreate(data, {
    transaction,
    updateOnDuplicate,
    validate: true,
  })
}

// Given the model, returns the id of each record in an array
export const getIds = async (
  models: Model<any>[],
  modelDef: ModelCtor<any>,
  uniqueKey: string | string[],
  transaction: Transaction
) => {
  let idsArr: number[] = []

  // Given the array of models, get the list of object where each object is the
  // mapping of its unique key to its values as a filter option for Model.findAll
  // e.g. [{email: 'a@gmail.com'}, {email: 'b@gmail.com'}]
  const filterOption = models.map(model => {
    if (Array.isArray(uniqueKey)) {
      return { [Op.and]: uniqueKey.map(key => ({ [key]: model.get(key) })) }
    } else {
      return { [uniqueKey]: model.get(uniqueKey) }
    }
  })

  // With the values as filter option, get the models arr
  const modelsArr = await modelDef.findAll({
    where: { [Op.or]: filterOption },
    transaction,
  })

  modelsArr.forEach(model => {
    idsArr.push((model as any).id)
  })

  return idsArr
}

export const populateJunctionModel = async (
  idsArrA: number[],
  idsArrB: number[],
  foreignKeyA: string,
  foreignKeyB: string,
  junctionModel: ModelCtor<any>,
  transaction: Transaction
) => {
  const mixedBody = mixArrs(idsArrA, idsArrB, foreignKeyA, foreignKeyB)

  return await upsert(mixedBody, junctionModel, transaction, [
    foreignKeyA,
    foreignKeyB,
  ])
}

// Mix the id arrays and return an array with data suitable for upserting into a model
export const mixArrs = (
  arrA: number[],
  arrB: number[],
  arrAForeignKey: string,
  arrBForeignKey: string
) => {
  let resultArr: { [key: string]: number }[] = []
  for (let i = 0; i < arrA.length; i++) {
    for (let j = 0; j < arrB.length; j++) {
      resultArr.push({
        [arrAForeignKey]: arrA[i],
        [arrBForeignKey]: arrB[j],
      })
    }
  }
  return resultArr
}

export const register = async (
  registerBody: RegisterBody,
  transaction: Transaction
) => {
  const {
    teacherBody,
    studentsBody,
    subjectBody,
    classBody,
  } = validateRegisterBody(registerBody)

  // Update or insert the data for respective models
  const teachers = await upsert(teacherBody, Teacher, transaction, ['name'])
  const students = await upsert(studentsBody, Student, transaction, ['name'])
  const subjects = await upsert(subjectBody, Subject, transaction, ['name'])
  const classes = await upsert(classBody, Class, transaction, ['name'])

  const subjectIds = await getIds(
    subjects,
    Subject,
    SUBJECT_UNIQUE_KEY,
    transaction
  )

  const classesIds = await getIds(classes, Class, CLASS_UNIQUE_KEY, transaction)

  // Populate SubjectClass model with subjectIds and classIds as Foreign Keys
  const subjectClasses = await populateJunctionModel(
    subjectIds,
    classesIds,
    SUBJECT_FOREIGN_KEY,
    CLASS_FOREIGN_KEY,
    SubjectClass,
    transaction
  )

  const subjectClassesIds = await getIds(
    subjectClasses,
    SubjectClass,
    [SUBJECT_FOREIGN_KEY, CLASS_FOREIGN_KEY],
    transaction
  )

  const teacherIds = await getIds(
    teachers,
    Teacher,
    TEACHER_UNIQUE_KEY,
    transaction
  )

  // Populate TeacherSubjectClass model with teacherIds and subjectClassesIds as Foreign Keys
  await populateJunctionModel(
    teacherIds,
    subjectClassesIds,
    TEACHER_FOREIGN_KEY,
    SUBJECT_CLASS_FOREIGN_KEY,
    TeacherSubjectClass,
    transaction
  )

  const studentIds = await getIds(
    students,
    Student,
    STUDENT_UNIQUE_KEY,
    transaction
  )

  // Populate StudentSubjectClass model with studentIds and subjectClassesIds as Foreign Keys
  await populateJunctionModel(
    studentIds,
    subjectClassesIds,
    STUDENT_FOREIGN_KEY,
    SUBJECT_CLASS_FOREIGN_KEY,
    StudentSubjectClass,
    transaction
  )

  await transaction.commit()
}
