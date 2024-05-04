module.exports = (sequelize, Sequelize) => {
  
  return sequelize.define("Member_Mst", {
    MEMBER_ID: {
      type: Sequelize.INTEGER(),
      autoIncrement: true,
      primaryKey: true,
    },
    Mem_Reg_Code: {
      type: Sequelize.INTEGER,
      allowNull: true,
      notEmpty: true,
    },
    BuyerName: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    BuyerContact: {//buyer contact
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    BuyerSecondContact: {//buyer contact
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    BuyerAddress: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    BuyerCNIC: {
      type: Sequelize.STRING,
      allowNull: true,
      notEmpty: true,
    },
    FathersName: {
      type: Sequelize.STRING,
      notEmpty: true,
    },
    PermanantAddress: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    DOB: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      nonEmpty: true,
    },
    Email: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Relation: {
      type: Sequelize.STRING,
      // type: Sequelize.ENUM('Father', 'Husband', 'Mother', 'Sibling', 'Nephew', 'Grand Son', 'Grand Daughter', 'Grand Mother', 'Grand Father', 'Uncle', "Aunt", 'Wife', 'N/A'),
      allowNull: true,
      notEmpty: true,
    },
    Rmarks: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
    },
    Image: {
      type: Sequelize.STRING,
      allowNull: true,
      nonEmpty: true,
      get() {
        const rawValue = this.getDataValue("Image");
        return `${process.env.APP_URL}/${rawValue}`
      }
    },
    IsActive: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      notEmpty: true,
    },
  })
};


// sequelize.sync().then(() => {
//   console.log('Member table created successfully!');
// }).catch((error) => {
//   console.error('Unable to create table : ', error);
// });


