const sequelize = require("../../config/connectdb");
const { Sequelize } = require("../models");

class AccountTransactionService {
  static getIncomeTransaction = async (limit, page) => {
    let limitQuery = '';
    let result;
    let total;
    if (limit) {
      limitQuery = ` LIMIT ${limit} OFFSET ${limit * page}`;
    }
    const unionQuery = `
        SELECT * FROM (
                          SELECT 
                            'Installment_Receipts' AS sourceTable,
                            InsType_ID ,
                            INS_RC_ID as id,
                            SUM(Installment_Paid) AS amount,
                            Installment_Month,
                            INSTRUMENT_NO as description,
                            PMID,
                            IRC_Date as date,
                            MONTH(IRC_Date) AS month,
                            YEAR(IRC_Date) AS year,
                            IRC_Date
                          FROM Installment_Receipts
                          GROUP BY InsType_ID, MONTH(IRC_Date), YEAR(IRC_Date)

                          UNION

                          SELECT 
                            'accounttransactions' AS sourceTable,
                            id,
                            amount,
                            balance,
                            categoryId, 
                            date,
                            type,
                            description,
                            projectId,
                            MONTH(date) AS month,
                            YEAR(date) AS year
                          FROM accounttransactions where projectId = 2 and type = 'Income'
                          GROUP BY MONTH(date), YEAR(date)
                        )  AS combined_result
                      ORDER BY year, month
                     ${limitQuery}
                        `;

    result = await sequelize.query(unionQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });
    if (limitQuery !== '') {
      const countQuery = `
        SELECT COUNT(*) AS total_count FROM (
          SELECT 
              'Installment_Receipts' AS sourceTable,
              InsType_ID,
              INS_RC_ID as id,
              SUM(Installment_Paid) AS amount,
              Installment_Month,
              INSTRUMENT_NO as description,
              PMID,
              IRC_Date as date,
              MONTH(IRC_Date) AS month,
              YEAR(IRC_Date) AS year,
              IRC_Date
          FROM Installment_Receipts
          GROUP BY InsType_ID, MONTH(IRC_Date), YEAR(IRC_Date)
      
          UNION
      
          SELECT 
              'accounttransactions' AS sourceTable,
              id,
              amount,
              balance,
              categoryId, 
              date,
              type,
              description,
              projectId,
              MONTH(date) AS month,
              YEAR(date) AS year
          FROM accounttransactions 
          WHERE projectId = 2 AND type = 'Income'
          GROUP BY MONTH(date), YEAR(date)
      ) AS total_count_result      
                        `;

      total = await sequelize.query(countQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });
    }

    return {result, total}
  };
}

module.exports = AccountTransactionService;
