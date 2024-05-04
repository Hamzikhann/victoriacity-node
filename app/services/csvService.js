// services/csvUploadService.js
const csvParser = require("csv-parser");
const csv = require("csv-parser");
const { Readable } = require("stream");
const fs = require("fs");
const path = require("path");

function parseCSV(csvData) {
  return new Promise((resolve, reject) => {
    const records = [];

    require("stream")
      .Readable.from(csvData)
      .pipe(csvParser())
      .on("data", (row) => {
        // records.push({
        //   amount: row.amount,
        //   categoryId: row.categoryId,
        //   date: row.date,

        // });
        records.push(row);
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function downloadCsv(transactions) {
 
  function checkCategory(category = {}) {
    if (category) return category.name;
    return "";
  }
  function checkInstallmentRecept(receipt = {}) {
    if (receipt) return receipt.id;
    return "";
  }

  function checkDate(date = "") {
    if (date instanceof Date) return date.toISOString().split("T")[0];
    return "";
  }

  try {
    const mappedTransactions = transactions.map((item = {}) => ({
      Amount: item.amount || "",
      Balance: item.balance || "",
      "Category Name": checkCategory(item.category),
      "Ledger No": item.ledgerNo || "",
      Date: checkDate(item.date), // Check if it's a valid date
      // 'Employee Salary History': item.EmployeeSalaryHistory.name || '',
      Type: item.type || "",
      Description: item.description || "",
      "Project ID": item.projectId || "",
      "Receipt ID": checkInstallmentRecept(item.InstallmentReceipts),
      "PM ID": item.pmId || "",
    }));

    const csvStream = convertArrayToCSV(mappedTransactions);
    fs.writeFileSync(path.resolve("csv/file1.csv"), csvStream);
    return csvStream;
  } catch (error) {
    console.error("Error exporting leads to CSV:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  parseCSV,
  downloadCsv,
};
