import Teacher from '../models/Teacher'
import Subject from '../models/Subject'
import Class from '../models/Class'
import SubjectClass from '../models/SubjectClass'

interface Workload {
  subjectCode: string
  subjectName: string
  numberOfClasses: number
}

export const getWorkloadReport = async () => {
  const teachers = await Teacher.findAll({
    include: {
      model: SubjectClass,
      attributes: ['id'],
      include: [
        {
          model: Subject,
          attributes: ['name', 'subjectCode'], // Get only fields 'name' and 'subjectCode'
        },
        {
          model: Class,
          attributes: ['name', 'classCode'], // Get only fields 'name' and 'classCode'
        },
      ],
      through: { attributes: [] }, // Hide unwanted `TeacherSubjectClass` nested object from results
    },
  })
  const report: { [key: string]: Workload[] } = {}

  // For each of the teacher, count the number of class taught for each subject
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i] as any
    report[teacher.name] = []
    const subjectClasses = teacher.subject_classes
    let tmpObj: { [key: string]: number } = {}

    for (let j = 0; j < subjectClasses.length; j++) {
      const subjectCode: string = subjectClasses[j].subject.subjectCode
      const subjectName: string = subjectClasses[j].subject.name
      const codeName: string = `${subjectCode} | ${subjectName}`

      if (!(codeName in tmpObj)) {
        tmpObj[codeName] = 1
      } else {
        tmpObj[codeName] += 1
      }
    }

    const teacherWorkload = Object.entries(tmpObj).map(
      ([subject, numOfClass]) => {
        const [subjectCode, subjectName] = subject.split('|')
        return {
          subjectCode: subjectCode,
          subjectName: subjectName,
          numberOfClasses: numOfClass,
        }
      }
    )
    report[teacher.name] = teacherWorkload
  }
  return report
}
