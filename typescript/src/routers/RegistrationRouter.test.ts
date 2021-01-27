import supertest from 'supertest'

import App from '../app'
import sequelize from '../config/database'
import { RegisterBody } from '../utils/RegistrationUtils'

const request = supertest(App)

describe('Test The Registration API - /api/register', () => {
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
    subject: {
      name: 'English',
      subjectCode: 'ENG',
    },
    class: {
      name: 'P1-1 Int',
      classCode: 'P1-1',
    },
  }

  beforeAll(async () => await sequelize.sync({ force: true }))
  afterAll(async () => {
    await sequelize.sync({ force: true })
    await sequelize.close()
  })

  test('it should be able to register the body and returns status code 204', async () => {
    const response = await request.post('/api/register').send(input)

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})
  })

  test('it should be able to create and update the record at the same time and return status code 204', async () => {
    // Adding new subject record
    input['subject'] = [
      {
        name: 'English',
        subjectCode: 'ENG',
      },
      {
        name: 'Maths',
        subjectCode: 'MATH',
      },
    ]

    // Modify exisitng class record's name from 'P1-1 Int' to 'P2-1 Int'
    input['class'] = {
      name: 'P2-1 Int',
      classCode: 'P1-1',
    }

    const response = await request.post('/api/register').send(input)

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})
  })

  test('it should returns error response with status code 400 when the posted body has insufficient input keys', async () => {
    delete input.class
    const response = await request.post('/api/register').send(input)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('All inputs are mandatory!')
  })

  test('it should returns error response with status code 400 when the posted body has duplicated values in unique key field', async () => {
    input['class'] = [
      {
        name: 'P1-1 Int',
        classCode: 'P1-1',
      },
      {
        name: 'P2-1 Int',
        classCode: 'P1-1',
      },
    ]
    const response = await request.post('/api/register').send(input)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe(
      "Duplicate value found for key 'class' on field 'classCode'"
    )
  })

  test('it should returns error response with status code 400 when the posted body has empty field', async () => {
    input['class'] = [
      {
        name: null,
        classCode: 'P1-1',
      },
    ]
    const response = await request.post('/api/register').send(input)

    expect(response.status).toBe(400)
    expect(response.body.message[0]).toBe(
      'notNull Violation: class.name cannot be null'
    )
  })
})
