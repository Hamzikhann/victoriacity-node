module.exports = (sequelize, Sequelize) => {
  // let FSRC_Code_value
  return sequelize.define("File_Sub_RC_Mst", {
    
    FSRC_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    FSRC_Code: {
      type: Sequelize.INTEGER(11),
      unique: true,
      defaultValue: 1
    },
    Date: {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.NOW
    },
    Doc_Delivery_Date: {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.NOW
    },
    DD_Time: {
      type: Sequelize.TIME,
      defaultValue: Sequelize.NOW
    },
    Name: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    FatherName: {
      type: Sequelize.STRING,
      allowNull: true
      // notEmpty: true,
    },
    SecondName: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    SecondFatherName: {
      type: Sequelize.STRING,
      allowNull: true
      // notEmpty: true,
    },
    CNIC: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Mobile: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    Remarks: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    FileSub_Fee_Amt: {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: 0.00
    },
    USER_ID: {
      type: Sequelize.INTEGER(11),
      allowNull: true,
      notEmpty: true,
    },
    TIME_STAMP: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    LAST_UPDATE: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    Is_APProved: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
      defaultValue: 0
    },
    IsDeleted: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
      defaultValue: 0
    }
  }, {
    timestamps: false,
})
}
