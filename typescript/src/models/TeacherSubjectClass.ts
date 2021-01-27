import Sequelize from "sequelize";

import sequelize from "../config/database";
import Teacher from "./Teacher";
import SubjectClass from "./SubjectClass";
import ForeignKeys from "../const/ForeignKeys";

const { SUBJECT_CLASS_FOREIGN_KEY, TEACHER_FOREIGN_KEY } = ForeignKeys;

const TeacherSubjectClass = sequelize.define("teacher_subject_class", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

Teacher.belongsToMany(SubjectClass, {
  through: TeacherSubjectClass,
  foreignKey: TEACHER_FOREIGN_KEY,
  otherKey: SUBJECT_CLASS_FOREIGN_KEY,
});

SubjectClass.belongsToMany(Teacher, {
  through: TeacherSubjectClass,
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
  otherKey: TEACHER_FOREIGN_KEY,
});

TeacherSubjectClass.belongsTo(Teacher, { foreignKey: TEACHER_FOREIGN_KEY });
TeacherSubjectClass.belongsTo(SubjectClass, {
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
});
Teacher.hasMany(TeacherSubjectClass, { foreignKey: TEACHER_FOREIGN_KEY });
SubjectClass.hasMany(TeacherSubjectClass, {
  foreignKey: SUBJECT_CLASS_FOREIGN_KEY,
});

export default TeacherSubjectClass;
