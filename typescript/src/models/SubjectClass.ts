import Sequelize from "sequelize";

import sequelize from "../config/database";
import Subject from "./Subject";
import Class from "./Class";
import ForeignKeys from "../const/ForeignKeys";

const { SUBJECT_FOREIGN_KEY, CLASS_FOREIGN_KEY } = ForeignKeys;

const SubjectClass = sequelize.define("subject_class", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

Subject.belongsToMany(Class, {
  through: SubjectClass,
  foreignKey: SUBJECT_FOREIGN_KEY,
  otherKey: CLASS_FOREIGN_KEY,
});
Class.belongsToMany(Subject, {
  through: SubjectClass,
  foreignKey: CLASS_FOREIGN_KEY,
  otherKey: SUBJECT_FOREIGN_KEY,
});

SubjectClass.belongsTo(Subject, { foreignKey: SUBJECT_FOREIGN_KEY });
SubjectClass.belongsTo(Class, { foreignKey: CLASS_FOREIGN_KEY });
Subject.hasMany(SubjectClass, { foreignKey: SUBJECT_FOREIGN_KEY });
Class.hasMany(SubjectClass, { foreignKey: CLASS_FOREIGN_KEY });

export default SubjectClass;
