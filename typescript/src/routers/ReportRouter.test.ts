import supertest from 'supertest'

import App from '../app'
import sequelize from '../config/database'
import { RegisterBody } from '../utils/RegistrationUtils'

const request = supertest(App)

describe('Test The Teacher Workload Report API - /api/reports/workload', () => {
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
    class: [
      {
        name: 'P1-1 Int',
        classCode: 'P1-1',
      },
      {
        name: 'P2-1 Int',
        classCode: 'P2-1',
      },
    ],
  }

  beforeAll(async () => {
    await sequelize.sync({ force: true })
    await request.post('/api/register').send(input)
  })

  afterAll(async () => {
    await sequelize.sync({ force: true })
    await sequelize.close()
  })

  test('it should be able to get the response with workload of all teachers', async () => {
    const expectedOutput = {
      'teacher1@gmail.com': [
        { subjectCode: 'ENG ', subjectName: ' English', numberOfClasses: 2 },
        { subjectCode: 'MATH ', subjectName: ' Maths', numberOfClasses: 2 },
      ],
      'teacher2@gmail.com': [
        { subjectCode: 'ENG ', subjectName: ' English', numberOfClasses: 2 },
        { subjectCode: 'MATH ', subjectName: ' Maths', numberOfClasses: 2 },
      ],
    }

    const response = await request.get('/api/reports/workload')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(expectedOutput)
  })
})
