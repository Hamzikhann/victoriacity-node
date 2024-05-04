module.exports = (sequelize, Sequelize) => {
  return sequelize.define("MemNominee_MST", {
    MN_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    MEMBER_ID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      notEmpty: true,
    },
    NomineeName: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    NomineeFatherName: {
      type: Sequelize.STRING,
      notEmpty: true,
    },
    NomineeRealtion: {
      type: Sequelize.STRING,
      // type: Sequelize.ENUM('Father', 'Husband', 'Mother', 'Sibling', 'Nephew', 'Grand Son', 'Grand Daughter', 'Grand Mother', 'Grand Father', 'Uncle', "Aunt", 'Wife', 'N/A'),
      allowNull: true,
      notEmpty: true,
    },

    NomineeCNIC: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    RelationToOwner: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
  }
  )
};


