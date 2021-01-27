import Sequelize from "sequelize";

import sequelize from "../config/database";

const Subject = sequelize.define("subject", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  subjectCode: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
    },
  },
});

export default Subject;
