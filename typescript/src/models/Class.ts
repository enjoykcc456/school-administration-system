import Sequelize from "sequelize";

import sequelize from "../config/database";

const Class = sequelize.define("class", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  classCode: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
    },
  },
});

export default Class;
