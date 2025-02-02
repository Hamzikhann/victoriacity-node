const expensecategory = require("../../models/ExpenseCategories.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AccountTransaction = require("../../models/AccountTransaction.js");
const EmployeeSalaryHistory = require("../../models/EmployeeSalaryHistory.js");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

class ExpenseCategoryController {
  static addExpenseCategory = async (req, res, next) => {
    try {
      const { title, parentId, projectId } = req.body;

      {
        if (parentId) {
          const result = await expensecategory.findAll({
            where: { id: parentId },
          });
          if (result.length <= 0) {
            return res
              .status(200)
              .json({ status: 200, Message: "Parent Not Exist" });
          }
        }
      }
      const accountCategory = await expensecategory.create({
        type: "Expense",
        title,
        parentId,
        projectId,
      });

      return res.status(200).send({
        status: 200,
        Message: "Add Category Successfull",
        Category: accountCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred", error: error });
    }
  };

  static getExpenseCategoryById = async (req, res, next) => {
    try {
      const parentId = req.query.parentId;

      const getParentCategory = async (categoryId) => {
        const category = await expensecategory.findOne({
          where: { id: categoryId },
          attributes: ["id", "title"],
          include: [
            {
              model: expensecategory,
              as: "child",
              attributes: ["id", "title", "type", "parentId"],
              include: [
                {
                  model: expensecategory,
                  as: "child",
                  attributes: ["id", "title", "type", "parentId"],
                  include: [
                    // Add more include statements for deeper levels if necessary
                  ],
                },
              ],
            },
          ],
        });

        return category;
      };

      const parentCategory = await getParentCategory(parentId);

      const formatCategory = async (category) => {
        const formattedCategory = {
          id: category.id,
          parentId: category.parentId,
          title: category.title,
          type: category.type,
          transactions: [],
          children: [],
        };

        if (category.child && category.child.length > 0) {
          formattedCategory.children = await Promise.all(
            category.child.map(async (child) => await formatCategory(child))
          );
        }

        if (category.id) {
          const transactions = await AccountTransaction.findAll({
            where: { categoryId: category.id },
            attributes: ["id", "amount", "date"],
            include: [
              {
                model: EmployeeSalaryHistory,
                as: "EmployeeSalaryHistory",
                attributes: ["employeeId", "salary", "date", "month"],
              },
            ],
          });
          formattedCategory.transactions = transactions;
        }

        return formattedCategory;
      };

      const formattedData = await formatCategory(parentCategory);

      res.status(200).json({
        status: 200,
        message: "Data retrieved successfully",
        data: formattedData,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };

  static getAllExpenseCategories = async (req, res, next) => {
    try {
      const getChildren = async (categoryId) => {
        const children = await expensecategory.findAll({
          where: { parentId: categoryId },
          attributes: ["id", "title", "type", "parentId"],
        });

        const formattedChildren = await Promise.all(
          children.map(async (child) => {
            const nestedChildren = await getChildren(child.id);
            const transactions = await AccountTransaction.findAll({
              where: { categoryId: child.id },
              attributes: ["id", "amount", "date"],
            });
            return {
              id: child.id,
              parentId: child.parentId,
              title: child.title,
              type: child.type,
              transactions: transactions,
              children: nestedChildren,
            };
          })
        );

        return formattedChildren;
      };

      const rootCategories = await expensecategory.findAll({
        where: { parentId: null },
        attributes: ["id", "title"],
      });

      const formattedData = await Promise.all(
        rootCategories.map(async (rootCategory) => {
          const children = await getChildren(rootCategory.id);
          const transactions = await AccountTransaction.findAll({
            where: { categoryId: rootCategory.id },
            attributes: ["id", "amount", "date"],
            include: [
              {
                model: EmployeeSalaryHistory,
                as: "EmployeeSalaryHistory",
                attributes: ["employeeId", "salary", "date", "month"],
              },
            ],
          });
          return {
            id: rootCategory.id,
            title: rootCategory.title,
            transactions: transactions,
            children: children,
          };
        })
      );

      res.status(200).json({
        status: 200,
        message: "Data retrieved successfully",
        data: formattedData,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };

  static getExpenseCategoriesList = async (req, res, next) => {
    try {
      const result = await expensecategory.findAll({});
      if (result.length > 0) {
        return res.status(200).json({
          status: 200,
          message: "Data retrieved successfully",
          data: result,
        });
      } else {
        return res.send(200).json({ Message: "No category Found" });
      }
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };

  static updateExpensecategory = async (req, res, next) => {
    try {
      const { id } = req.query;
      const { title, parentId, projectId } = req.body;

      if (!id) {
        return res.status(400).json({
          status: 400,
          message: "Missing category ID",
        });
      }

      const category = await expensecategory.findByPk(id);

      if (!category) {
        return res.status(404).json({
          status: 404,
          message: "Category not found",
        });
      }

      if (parentId) {
        if (parentId === id) {
          return res.status(400).json({
            status: 400,
            message: "Cannot set the parent category as its own child.",
          });
        }
        const isChild = await expensecategory.findOne({
          where: { id: parentId, parentId: id },
        });

        if (parentId && isChild) {
          return res.status(400).json({
            status: 400,
            message:
              "Cannot set the parent category as a child of its own child.",
          });
        }
      }
      let obj;
      if (parentId) {
        obj = {
          title: title,
          parentId: parentId,
          projectId: projectId,
        };
      } else {
        obj = {
          title: title,
          projectId: projectId,
        };
      }

      await category.update({
        ...obj,
        where: { id: id },
      });

      return res.status(200).json({
        status: 200,
        message: "Category updated successfully",
        updatedCategory: category,
      });
    } catch (error) {
      next(error);
    }
  };

  static deleteExpensecategory = async (req, res, next) => {
    try {
      const { id } = req.query;
      if (id) {
        // Find the account Category by ID
        const accountCategory = await expensecategory.findByPk(id);

        if (!accountCategory) {
          return res.status(404).json({ error: "Account Category not found" });
        }
        const deleteCategory = await accountCategory.destroy({
          where: { id: id },
        });

        return res.status(200).send({
          status: 200,
          Message: " Category Deleted Successfull",
          Category: deleteCategory,
        });
      } else {
        return res.status(400).json({
          status: 400,
          Message: "Id is required",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  };
  static expenseByProjectId = async (req, res, next) => {
    try {
      const projectId = req.query.id; // Assuming project ID is passed as a query parameter
      const getParentCategory = async (projectId) => {
        const category = await expensecategory.findAll({
          where: { projectId: projectId }, // Adjust the where clause to filter by projectId
          attributes: ["id", "title", "projectId", "parentId"],
          include: [
            {
              model: expensecategory,
              as: "child",
              attributes: ["id", "title", "type", "parentId", "projectId"],
              include: [
                {
                  model: expensecategory,
                  as: "child",
                  attributes: ["id", "title", "type", "parentId", "projectId"],
                  include: [
                    // Add more include statements for deeper levels if necessary
                  ],
                },
              ],
            },
          ],
        });
        if (!category) {
          return res
            .status(200)
            .json({ status: 200, Message: "No Record Found" });
        }

        return category;
      };

      const parentCategory = await getParentCategory(projectId);

      const formatCategory = async (category) => {
        const formattedCategory = {
          id: category.id,
          parentId: category.parentId,
          title: category.title,
          projectId: category.projectId,
          type: category.type,
          transactions: [],
          children: [],
        };

        if (category.child && category.child.length > 0) {
          formattedCategory.children = await Promise.all(
            category.child.map(async (child) => await formatCategory(child))
          );
        }

        if (category.id) {
          const transactions = await AccountTransaction.findAll({
            where: { categoryId: category.id },
            attributes: ["id", "amount", "date"],
            include: [
              {
                model: EmployeeSalaryHistory,
                as: "EmployeeSalaryHistory",
                attributes: ["employeeId", "salary", "date", "month"],
              },
            ],
          });
          formattedCategory.transactions = transactions;
        }

        return formattedCategory;
      };

      const formattedData = await Promise.all(
        parentCategory.filter((item)=> item.parentId == null).map(async (parentCategory) => {
          return await formatCategory(parentCategory);
        })
      );

      res.status(200).json({
        status: 200,
        message: "Data retrieved successfully",
        data: formattedData,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };
}
module.exports = ExpenseCategoryController;
