import sequelize from '../config/database'
import { register, RegisterBody } from './RegistrationUtils'
import { getWorkloadReport } from './ReportUtils'

describe('Test Get Workload Function', () => {
  const input: RegisterBody = {
    teacher: [
      {
        name: 'Teacher 1',
        email: 'teacher1@gmail.com',
      },
      {
        name: 'Teacher 2',
        email: 'teacher2@gmail.com',
      },
    ],
    students: {
      name: 'Student 1',
      email: 'student1@gmail.com',
    },
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

  beforeAll(async () => {
    await sequelize.sync({ force: true })
    const transaction = await sequelize.transaction()
    await register(input, transaction)
  })

  afterAll(async () => {
    await sequelize.sync({ force: true })
    await sequelize.close()
  })

  test("it should be able to return an object with all the teachers' workload", async () => {
    const expectedOutput = {
      'Teacher 1': [
        { subjectCode: 'ENG ', subjectName: ' English', numberOfClasses: 1 },
        { subjectCode: 'MATH ', subjectName: ' Maths', numberOfClasses: 1 },
      ],
      'Teacher 2': [
        { subjectCode: 'ENG ', subjectName: ' English', numberOfClasses: 1 },
        { subjectCode: 'MATH ', subjectName: ' Maths', numberOfClasses: 1 },
      ],
    }

    const results = await getWorkloadReport()
    expect(results).toEqual(expectedOutput)
  })
})
