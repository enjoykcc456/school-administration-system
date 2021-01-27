import Sequelize from "sequelize";

import sequelize from "../config/database";
import Student from "./Student";
import SubjectClass from "./SubjectClass";
import ForeignKeys from "../const/ForeignKeys";

const { STUDENT_FOREIGN_KEY, SUBJECT_CLASS_FOREIGN_KEY } = ForeignKeys;

const StudentSubjectClass = sequelize.define("student_subject_class", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

Student.belongsToMany(SubjectClass, {
  through: StudentSubjectClass,
  foreignKey: STUDENT_FOREIGN_KEY,
  otherKey: SUBJECT_CLASS_FOREIGN_KEY,
});

SubjectClass.belongsToMany(Student, {
  through: StudentSubjectClass,
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
  otherKey: STUDENT_FOREIGN_KEY,
});

StudentSubjectClass.belongsTo(Student, { foreignKey: STUDENT_FOREIGN_KEY });
StudentSubjectClass.belongsTo(SubjectClass, {
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
});
Student.hasMany(StudentSubjectClass, { foreignKey: STUDENT_FOREIGN_KEY });
SubjectClass.hasMany(StudentSubjectClass, {
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
});

export default StudentSubjectClass;
