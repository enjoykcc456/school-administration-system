import Sequelize from "sequelize";

import sequelize from "../config/database";

const Teacher = sequelize.define("teacher", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

export default Teacher;
