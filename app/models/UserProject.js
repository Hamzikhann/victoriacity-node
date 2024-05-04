

module.exports = (sequelize, Sequelize) => {
    return sequelize.define("user_project", {
        user_Id: {
            type: Sequelize.INTEGER(),
              allowNull: true,
              notEmpty: true,
          },
          project_Id: {
            type: Sequelize.INTEGER(),
            allowNull: true,
            notEmpty: true,
          },
    });
};




