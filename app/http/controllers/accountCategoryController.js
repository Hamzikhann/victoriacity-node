const AccountCategory = require("../../models/AccountsCategory.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const AccountTransaction = require("../../models/AccountTransaction.js")
const EmployeeSalaryHistory = require('../../models/EmployeeSalaryHistory.js');

class AccountCategoryController {
  static addCategory = async (req, res, next) => {
    try {
      const { type, title, parentId } = req.body;
     
      {
        if (parentId) {
          const result = await AccountCategory.findAll({ where :{id:parentId}});
          if (result.length <= 0) {
            return res.status(200).json({ status: 200, Message: "Parent Not Exist" });
          }
        }
      }
      const accountCategory = await AccountCategory.create({
        type,
        title,
        parentId,
      });

     return res.status(200).send({
        status: 200,
        Message: "Add Category Successfull",
        Category: accountCategory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred",error:error });
    }
  };

  static getCategoryById = async (req, res, next) => {
    try {
      const parentId = req.query.parentId;
  
      const getParentCategory = async (categoryId) => {
        const category = await AccountCategory.findOne({
          where: { id: categoryId },
          attributes: ['id', 'title'],
          include: [
            {
              model: AccountCategory,
              as: 'child',
              attributes: ['id', 'title', 'type','parentId'],
              include: [
                {
                  model: AccountCategory,
                  as: 'child',
                  attributes: ['id', 'title', 'type','parentId'],
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
          parentId:category.parentId,
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
            attributes: ['id', 'amount', 'date'],
            include: [
              {
                model: EmployeeSalaryHistory,
                as: 'EmployeeSalaryHistory',
                attributes: ['employeeId', 'salary', 'date', 'month'],
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
        message: 'Data retrieved successfully',
        data: formattedData,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };
  
  
  
  /////////
  // Get All Category
  static getAllCategories = async (req, res, next) => {
    try {
      const getChildren = async (categoryId) => {
        const children = await AccountCategory.findAll({
          where: { parentId: categoryId },
          attributes: ['id', 'title', 'type','parentId'],
        });
  
        const formattedChildren = await Promise.all(children.map(async (child) => {
          const nestedChildren = await getChildren(child.id);
          const transactions = await AccountTransaction.findAll({
            where: { categoryId: child.id },
            attributes: ['id', 'amount', 'date'],
          });
          return {
            id: child.id,
            parentId:child.parentId,
            title: child.title,
            type: child.type,
            transactions: transactions,
            children: nestedChildren,
          };
        }));
  
        return formattedChildren;
      };
  
      const rootCategories = await AccountCategory.findAll({
        where: { parentId: null },
        attributes: ['id', 'title'],
      });
  
      const formattedData = await Promise.all(rootCategories.map(async (rootCategory) => {
        const children = await getChildren(rootCategory.id);
        const transactions = await AccountTransaction.findAll({
          where: { categoryId: rootCategory.id },
          attributes: ['id', 'amount', 'date'],
          include: [
            {
              model: EmployeeSalaryHistory,
              as: 'EmployeeSalaryHistory',
              attributes: ['employeeId', 'salary', 'date', 'month'],
            },
          ],
        });
        return {
          id: rootCategory.id,
          title: rootCategory.title,
          transactions: transactions,
          children: children,
        };
      }));
  
      res.status(200).json({
        status: 200,
        message: 'Data retrieved successfully',
        data: formattedData,
      });
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };
  
  static getCategoriesList = async (req, res, next) => {
    try {
      
        const result = await AccountCategory.findAll({ });
      if(result.length>0){

      
     return res.status(200).json({
        status: 200,
        message: 'Data retrieved successfully',
        data: result,
      });
    }
    else{
     return res.send(200).json({Message:"No category Found"})
    }
    } catch (error) {
      // Handle any errors that occur during the process
      next(error);
    }
  };

  static updateAccountCategory = async (req, res, next) => {
    try {
      const { id } = req.query;
      const { title, type, parentId } = req.body;
  
      if (!id) {
        return res.status(400).json({
          status: 400,
          message: 'Missing category ID',
        });
      }
  
      const category = await AccountCategory.findByPk(id);
  
      if (!category) {
        return res.status(404).json({
          status: 404,
          message: 'Category not found',
        });
      }
  
      if (parentId) {
        if (parentId === id) {
          return res.status(400).json({
            status: 400,
            message: "Cannot set the parent category as its own child.",
          });
        }
      }
  
      const isChild = await AccountCategory.findOne({
        where: { id: parentId, parentId: id },
      });
  
      if (parentId && isChild) {
        return res.status(400).json({
          status: 400,
          message: "Cannot set the parent category as a child of its own child.",
        });
      }
  
      await category.update({
        title: title || category.title,
        type: type || category.type,
        parentId: parentId || category.parentId,
      });
  
      return res.status(200).json({
        status: 200,
        message: 'Category updated successfully',
        updatedCategory: category,
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  

  static deleteAccountCategory = async (req, res, next) => {
    try {
      const { id } = req.query;
      if (id) {
        // Find the account Category by ID
        const accountCategory = await AccountCategory.findByPk(id);

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
}
module.exports = AccountCategoryController;
