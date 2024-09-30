// import express from "express";
// import UserController from "../app/http/controllers/userController.js"
// import JobController from "../app/http/controllers/jobController.js"

const express = require("express");
const UserController = require("../app/http/controllers/userController.js");
const JobController = require("../app/http/controllers/jobController.js");

// import JobCandidatesController from "../app/http/controllers/jobCandidatesController.js"
// import DepartmentController from "../app/http/controllers/departmentController.js"
// import DesignationController from "../app/http/controllers/designationController.js"
// import EmployeeController from "../app/http/controllers/employeeController.js"
// import checkUserAuth from "../app/http/middlewares/authUser.js"
// import projectController from "../app/http/controllers/projectController.js";
// import User from "../app/models/User.js";
// import EmployeeActionController from "../app/http/controllers/employeeActionController.js";
// import CustomerController from "../app/http/controllers/customerController.js";
// import AssetController from "../app/http/controllers/assetController.js";
// import EmployeeAssetController from "../app/http/controllers/employeeAssetController.js";
// import EmployeeProjectController from "../app/http/controllers/employeeProjectController.js";
// import FileIssueController from "../app/http/controllers/fileIssueController.js";
// import employeeRelationController from "../app/http/controllers/employeeRelationController.js";
// import plotController from "../app/http/controllers/plotController.js";
// import userRoleController from "../app/http/controllers/userRoleController.js";
// import conversionUserController from "../app/http/controllers/conversionUserController.js";
// import leaveController from "../app/http/controllers/leaveController.js";
// import multer from 'multer'
// import AttendanceController from "../app/http/controllers/attendenceController.js";
// import attendanceController from "../app/http/controllers/attendenceController.js";
// import MemberController from "../app/http/controllers/memberController.js";
// import NomineeController from "../app/http/controllers/nomineeController.js";
// import UnitCategory from "../app/models/UnitCategory.js";
// import UnitCategoryController from "../app/http/controllers/unitCategoryController.js";
// import UnitTypeController from "../app/http/controllers/unitTypeController.js";
// import FloorController from "../app/http/controllers/FloorController.js";
// import { upload } from "../app/http/middlewares/Storages.js";
// import BlockController from "../app/http/controllers/blockController.js";
// import StreetController from "../app/http/controllers/streetController.js";
// import UnitController from "../app/http/controllers/unitController.js";
// import adminAuth from "../app/http/middlewares/admin.js";
// import adminHrAuth from "../app/http/middlewares/adminHr.js";
// import AssetTypeController from "../app/http/controllers/assetTypeController.js";

const JobCandidatesController = require("../app/http/controllers/jobCandidatesController.js");
const DepartmentController = require("../app/http/controllers/departmentController.js");
const DesignationController = require("../app/http/controllers/designationController.js");
const EmployeeController = require("../app/http/controllers/employeeController.js");
const checkUserAuth = require("../app/http/middlewares/authUser.js");
const projectController = require("../app/http/controllers/projectController.js");
const User = require("../app/models/User.js");
const EmployeeActionController = require("../app/http/controllers/employeeActionController.js");
const CustomerController = require("../app/http/controllers/customerController.js");
const AssetController = require("../app/http/controllers/assetController.js");
const EmployeeAssetController = require("../app/http/controllers/employeeAssetController.js");
const EmployeeProjectController = require("../app/http/controllers/employeeProjectController.js");
const FileIssueController = require("../app/http/controllers/FileController.js");
const employeeRelationController = require("../app/http/controllers/employeeRelationController.js");
const plotController = require("../app/http/controllers/plotController.js");
const userRoleController = require("../app/http/controllers/userRoleController.js");
const conversionUserController = require("../app/http/controllers/conversionUserController.js");
const leaveController = require("../app/http/controllers/leaveController.js");
const multer = require("multer");
const AttendanceController = require("../app/http/controllers/attendenceController.js");
const attendanceController = require("../app/http/controllers/attendenceController.js");
const MemberController = require("../app/http/controllers/memberController.js");
const NomineeController = require("../app/http/controllers/nomineeController.js");
const UnitCategory = require("../app/models/Unit_Category.js");
const UnitCategoryController = require("../app/http/controllers/unitCategoryController.js");
const UnitTypeController = require("../app/http/controllers/unitTypeController.js");
const FloorController = require("../app/http/controllers/FloorController.js");
const Upload = require("../app/http/middlewares/Storages.js");
const BlockController = require("../app/http/controllers/blockController.js");
const StreetController = require("../app/http/controllers/streetController.js");
const UnitController = require("../app/http/controllers/unitController.js");
const adminAuth = require("../app/http/middlewares/admin.js");
const adminHrAuth = require("../app/http/middlewares/adminHr.js");
const AssetTypeController = require("../app/http/controllers/assetTypeController.js");
const ProjectTaskController = require("../app/http/controllers/projectTaskController.js");
const MultiProjectTaskController = require("../app/http/controllers/MultiProjectTaskController.js");
const PackageController = require("../app/http/controllers/packagesController.js");
const BookingController = require("../app/http/controllers/bookingController.js");
const UnVarifiedTransactionController = require("../app/http/controllers/unVarifiedTransactionController.js");
const TransactionController = require("../app/http/controllers/TransactionController.js");
const PhaseController = require("../app/http/controllers/phaseController.js");
const SectorController = require("../app/http/controllers/sectorController.js");
const UnitNatureTypeController = require("../app/http/controllers/unitNatureTypeController.js");
const PlotSizeController = require("../app/http/controllers/plotSizeController.js");
const VoucherController = require("../app/http/controllers/voucherController.js");
const VoucherTypeController = require("../app/http/controllers/voucherTypeController.js");
const VoucherReasonController = require("../app/http/controllers/voucherReasonController.js");
const FileSubmissionController = require("../app/http/controllers/FileSubmissionController.js");
const InstallmentReceiptsController = require("../app/http/controllers/Installment_ReceiptsController.js");
const InstallmentTypeController = require("../app/http/controllers/InstallmentTypeController.js");
const PaymentModeController = require("../app/http/controllers/PaymentModeController.js");
const CustomerProjectController = require("../app/http/controllers/customerProjectController.js");
const policyController = require("../app/http/controllers/policyController.js");
const AccountCategoryController = require("../app/http/controllers/accountCategoryController.js");
const AccountTransactionController = require("../app/http/controllers/accountTransactionController.js");
const EmployeeSalaryHistoryController = require("../app/http/controllers/employeeSalaryHistoryController.js");
const SettingsController = require("../app/http/controllers/settingsController.js");
const memberAddressController = require("../app/http/controllers/memberAddressController.js");
// const DispatchedSalariesController = require("../app/http/controllers/DispatchedSalariesController.js");
const ExpenseCategoryController = require("../app/http/controllers/expenseCategoryController.js");
const IncomeCategoryController = require("../app/http/controllers/incomeCategoryController.js");
const NdcChangesController = require("../app/http/controllers/ndcChangesController.js");
const UserGroupController = require("../app/http/controllers/userGroupController.js");
const MenuController = require("../app/http/controllers/menuController.js");
const GroupMenuController = require("../app/http/controllers/groupMenuController.js");
const TaxPayeeController = require("../app/http/controllers/taxPayeeCategoryController.js");
const TaxTagController = require("../app/http/controllers/taxTagController.js");
const FileTransferController = require("../app/http/controllers/fileTransferController.js");
const TransferFeeController = require("../app/http/controllers/TRFSController.js");
const LocationContollers = require("../app/http/controllers/locationController.js");
const LiabilityController = require("../app/http/controllers/liabilityController.js");
const PayOffController = require("../app/http/controllers/payOffController.js");
const WithdrawalController = require("../app/http/controllers/withdrawalController.js");
const WithdrawController = require("../app/http/controllers/withdrawController.js");
const ReminderController = require("../app/http/controllers/CalendarReminder.js");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

//public routes
router.post("/register", UserController.Register);
router.post("/login", UserController.Login);
router.post("/change", UserController.changePassword);
router.post("/expire", UserController.timeExpire);
router.post("/genrate", UserController.generate);
router.post("/file/get", FileIssueController.getFiles);
router.post("/ballot", UserController.ballotSearch);
router.post("/pay/surcharges", UserController.paySurcharges);
router.post("/surcharge/pdf", UserController.downloadSurchargeReport);
router.post("/search/file", UserController.search);
router.post("/surcharge", UserController.surcharges);
router.post("/reminder/create", [checkUserAuth], ReminderController.create);
router.post("/reminder/getbyid", ReminderController.getById);
router.post("/reminder/getallbyids", ReminderController.getAllByIds);
router.post("/reminder/delete", ReminderController.delete);
router.post("/reminder/through", ReminderController.getFromBookingId);
// router.post("/change/status/ballot", UserController.changeBallotStatus);
router.get("/job/active/list", JobController.getAllActiveJobs);
router.get("/job/details/:id", JobController.getJobDetailsById);
router.get("/dashboard/data", UserController.dashboardData);
router.get("/surcharge/list", UserController.getAllSurcharges);
router.post("/dashboard", [checkUserAuth], BookingController.getTotalAmountOfAllBookings);
router.post("/dashboard/total", [checkUserAuth], BookingController.dashboardTotal);
router.post("/booking/searchvcno", [checkUserAuth], BookingController.searchBookingByVCNO);
router.post("/booking/searchcontact", [checkUserAuth], BookingController.searchBookingByContact);
router.post("/booking/searchname", [checkUserAuth], BookingController.searchBookingByName);
router.post("/booking/searchcnic", [checkUserAuth], BookingController.searchBookingByCNIC);
router.post("/booking/searchplotno", [checkUserAuth], BookingController.searchBookingByPlotNo);
// router.post("/dashboard/detail", BookingController.dashboardDetail);
//protected routes

//Job Routes
router.get("/job/dashboard", [checkUserAuth], JobController.jobDashboard);

router.post("/job/add", [checkUserAuth], JobController.addJob);
router.post("/job/delete", [checkUserAuth], JobController.deleteJob);

router.put("/job/update", [checkUserAuth], JobController.updateJob);

router.get("/job/list", [checkUserAuth, adminHrAuth], JobController.getAllJobs);
router.get("/job", [checkUserAuth], JobController.getJobById);
router.put("/job/status/update", [checkUserAuth], JobController.updateJobStatus);

//Department RoutesCCCC

router.post("/department/add", [checkUserAuth], DepartmentController.addDeparment);
router.get("/department/list", [checkUserAuth], DepartmentController.getAllDepartments);
router.get("/department/active/list", [checkUserAuth], DepartmentController.getAllActiveDepartments);
router.get("/department/active/id", [checkUserAuth], DepartmentController.getDepartmentById);
router.put("/department/update", [checkUserAuth], DepartmentController.updateDepartment);
router.delete("/department/delete", [checkUserAuth], DepartmentController.deleteDepartment);
//Designation Routes
router.post("/designation/add", [checkUserAuth], DesignationController.addDesignation);
router.get("/designation/list", [checkUserAuth], DesignationController.getAllDesignations);
router.get("/designation/active/list", [checkUserAuth], DesignationController.getAllActiveDesignations);
router.put("/designation/update", [checkUserAuth], DesignationController.updateDesignation);
router.delete("/designation/delete", [checkUserAuth], DesignationController.deleteDesignation);

//Job Candidates Routes
router.post("/job/candidates/add", [checkUserAuth], JobCandidatesController.addJobCandidate);
router.put("/job/candidates/update", [checkUserAuth], JobCandidatesController.updateJobCandidate);

router.get("/job/candidates/list", [checkUserAuth], JobCandidatesController.getAllJobCandidates); //all candidates
router.get("/job/candidates/job/list", [checkUserAuth], JobCandidatesController.getAllJobCandidatesByJob); //candidates by job id
router.get(
	"/job/candidates/job/short-list/list",
	[checkUserAuth],
	JobCandidatesController.getAllShortListJobCandidates
); //candidates by job id
router.get(
	"/job/candidates/job/offer-list/list",
	[checkUserAuth],
	JobCandidatesController.getAllOfferListJobCandidates
); //candidates by job id

//router.post('/job/candidate/status/update', [checkUserAuth], JobCandidatesController.updateJobCandidateStatus)
//router.get('/job/candidate/mail/send', [checkUserAuth], JobCandidatesController.sendMailToCandidate) //send mail to candidate by candidate id
router.get("/job/candidate/shortlisted/list", [checkUserAuth], JobCandidatesController.getAllShortlistedCandidates);
router.put("/job/candidates/status/update", JobCandidatesController.updateStatusCandidates); //update candidate status by candidate id
router.put("/job/candidates/status/called/update", JobCandidatesController.updateStatusCalledCandidates); //update candidate status by candidate id

//Employee Routes
router.post("/employee/add", [checkUserAuth, Upload.single("image")], EmployeeController.addEmployee); //ADD NEW EMPLOYEES TO DATABASE
router.get("/employee/id/list", [checkUserAuth], EmployeeController.getEmployeeById); //Search Employee by ID
router.get("/employee/list", [checkUserAuth], EmployeeController.getAllEmployee); //Get the list of all employees
router.delete("/employee/delete", [checkUserAuth], EmployeeController.deleteEmployee); //Search employee by id and delete
router.put("/employee/update", [checkUserAuth, Upload.single("image")], EmployeeController.updateEmployee); //Search employee by id and update
router.get("/employeeAsset/id/list", [checkUserAuth], EmployeeController.getEmployeeAssetById);
router.get("/employee/projectTask/list", [checkUserAuth], EmployeeController.getprojectTaskByEmployeeId);

//EmployeeAction Routes
router.post("/employeeAction/add", [checkUserAuth], EmployeeActionController.addAction); // Add Action Against Employee

//Customer Routes
router.post("/customer/add", [checkUserAuth, Upload.single("image")], CustomerController.addCustomer); //ADD NEW  Customer TO DATABASE
router.get("/customer/id/list", [checkUserAuth], CustomerController.getCustomerById); //Search Customer by ID
router.get("/customer/list", [checkUserAuth], CustomerController.getAllCustomer); //Get the list of all  Customer
router.delete("/customer/delete", [checkUserAuth], CustomerController.deleteCustomer); //Search Customer by id and delete
router.put("/customer/update", [checkUserAuth, Upload.single("image")], CustomerController.updateCustomer); //Search Customer by id and update
router.get("/customer/id/project", [checkUserAuth], CustomerController.getCustomerProject);
//Project Routes
router.post("/project/add", [checkUserAuth, Upload.single("image")], projectController.addproject); //Create and Add new project
router.get("/project/id/list", [checkUserAuth], projectController.getProjectById); //Search project by project ID
router.get("/project/list", [checkUserAuth], projectController.getAllProjects); //Get the list of all available Projects
router.put("/project/update", [checkUserAuth, Upload.single("image")], projectController.updateProject); //Search project by Id and update
router.delete("/project/delete", [checkUserAuth], projectController.deleteProject); //Search Project by Id and delete
router.get("/project/income", [checkUserAuth], projectController.projectIncome);

//ProjectTask Routes
router.post("/ProjectTask/add", [checkUserAuth], ProjectTaskController.addProjectTask); //Create and Add new ProjectTask
router.get("/ProjectTask/id/list", [checkUserAuth], ProjectTaskController.getProjectTaskById); //Search ProjectTask by ProjectTask ID
router.get("/ProjectTask/list", [checkUserAuth], ProjectTaskController.getAllProjectTasks); //Get the list of all available ProjectTasks
router.put("/ProjectTask/update", [checkUserAuth], ProjectTaskController.updateProjectTask); //Search ProjectTask by Id and update
router.delete("/ProjectTask/delete", [checkUserAuth], ProjectTaskController.deleteProjectTask); //Search ProjectTask by Id and delete
router.get("/projectTask/project/id", [checkUserAuth], ProjectTaskController.getProjectTaskByProjectId);

// Multi Task Assign to Multi Users
router.post("/ProjectTask/User/add", [checkUserAuth], MultiProjectTaskController.addMultiProjectTask); //Create and Add new ProjectTask

// Assets Routes
router.post("/asset/add", [checkUserAuth], AssetController.addAsset); //Create and Add new project
router.get("/asset/id/list", [checkUserAuth], AssetController.getAssetById); //Search project by project ID
router.get("/asset/list", [checkUserAuth], AssetController.getAllAsset); //Get the list of all available Projects
router.put("/asset/update", [checkUserAuth], AssetController.updateAsset); //Search project by Id and update
router.delete("/asset/delete", [checkUserAuth], AssetController.deleteAsset); //Search Project by Id and delete
router.get("/asset/emplyee/id/", [checkUserAuth], AssetController.getAssetByEmployeeId); //Search project by project ID

// AssetTypes Routes
router.post("/AssetType/add", [checkUserAuth], AssetTypeController.addAssetType);
router.get("/AssetType/id/list", [checkUserAuth], AssetTypeController.getAssetTypeById);
router.get("/AssetType/list", [checkUserAuth], AssetTypeController.getAllAssetType);
router.put("/AssetType/update", [checkUserAuth], AssetTypeController.updateAssetType);
router.delete("/AssetType/delete", [checkUserAuth], AssetTypeController.deleteAssetType);

// Employee Assets Routes

router.post("/employee/asset", [checkUserAuth], EmployeeAssetController.addEmployeeAsset); //Add Employee Assets in Database
router.delete("/employee/asset/delete", [checkUserAuth], EmployeeAssetController.deleteEmployeeAsset); // Delete Employee Asset by Employee ID

// Employee Project Routes

router.post("/employee/project", [checkUserAuth], EmployeeProjectController.addEmployeeProject); //Add Employee Assets in Database

//Customer Project Rout
router.post("/customer/project", [checkUserAuth], CustomerProjectController.addCustomerProject);
// Files issues Routes
router.post("/file/add", [checkUserAuth], FileIssueController.create); //Create and Add new file
router.get("/file/id/list", [checkUserAuth], FileIssueController.getFileById); //Search File by File ID
router.get("/file/getFile", [checkUserAuth], FileIssueController.getFileByFromNo); //Search File by File ID
router.get("/file/getFileByCode", FileIssueController.getFileByFromCode); //Search File by File ID
router.get("/file/getBookingByCode", [checkUserAuth], BookingController.getBookingByCode);
router.get("/file/getBookingByName", [checkUserAuth], BookingController.getBookingMemberName);
router.post("/updateBooking/status", [checkUserAuth], BookingController.checkStatus);

router.get("/file/list", [checkUserAuth], FileIssueController.get); //Get the list of all available Files
router.put("/file/update", [checkUserAuth], FileIssueController.update); //Search Files by Id and update
router.delete("/file/delete", [checkUserAuth], FileIssueController.deleteFile); //Search Fileby Id and delete

// Files Submission Routes
router.post("/bookingTransaction/add", [checkUserAuth], BookingController.transactionCreate); //Create and Add new file
router.get("/ndc/requests/all", [checkUserAuth], BookingController.getAllNDCFees); //Create and Add new file
router.post("/fileSub/add", [checkUserAuth], FileSubmissionController.create); //Create and Add new file
router.get("/fileSub/getFile", [checkUserAuth], FileSubmissionController.getFileSubById); //Search File by File ID
router.get("/fileSubDel/getFile", [checkUserAuth], FileSubmissionController.getFileSubDelByFormNo); //Search File by File ID
router.get("/fileSub/list", [checkUserAuth], FileSubmissionController.get); //Get the list of all available Files
router.get("/fileSub/getPdf", [checkUserAuth], FileSubmissionController.createSubReceipt); //Get the list of all available Files
router.get("/fileSub/filterFile", [checkUserAuth], FileSubmissionController.getFilterFileSub);

router.get("/fileSubDel/list", [checkUserAuth], FileSubmissionController.getAllFileSubDel); //Get the list of all available Files
router.put("/fileSub/update", [checkUserAuth], FileSubmissionController.update); //Search Files by Id and update
router.delete("/fileSub/delete", [checkUserAuth], FileSubmissionController.deleteFile); //Search Fileby Id and delete

//Employee Relation ROUTES
router.post("/employee-relation/add", [checkUserAuth], employeeRelationController.addEmployeeRelation);
router.get("/employee-relation/id/list", [checkUserAuth], employeeRelationController.getEmployeeRelationById); //Search File by EmployeeRelation ID
router.get(
	"/employee-relation/employee/id/list",
	[checkUserAuth],
	employeeRelationController.getEmployeeRelationByEmployeeId
); //Search File by EmployeeRelation ID

router.get("/employee-relation/list", [checkUserAuth], employeeRelationController.getAllEmployeeRelation); //Get the list of all available  EmployeeRelation
router.put("/employee-relation/update", [checkUserAuth], employeeRelationController.updateEmployeeRelation); //Search  EmployeeRelation by Id and update
router.delete("/employee-relation/delete", [checkUserAuth], employeeRelationController.deleteEmployeeRelation); //Search EmployeeRelationby Id and delete

//Plots Record Routes
router.post("/plot/add", [checkUserAuth], plotController.addplot); // Add Plot in DataBase
router.get("/plot/id/list", [checkUserAuth], plotController.getPlotById); //Search Plot Detailby Id
router.get("/plot/list", [checkUserAuth], plotController.getAllPlot); //GET All the Plots List
router.put("/plot/update", [checkUserAuth], plotController.updatePlot); //Search plot by id and Update
router.delete("/plot/delete", [checkUserAuth], plotController.deletePlot); //Search Plot by ID and Delete

// USER ROLES ROUTES

router.post("/userRole/add", [checkUserAuth], userRoleController.addUserRole); // Add User ROLE In DatabaseF
router.get("/userRole/id/list", [checkUserAuth], userRoleController.getUserRoleById); //Search User Role by Id
router.get("/userRole/list", [checkUserAuth], userRoleController.getAllUserRole); //Get All the USer Roles
router.put("/userRole/update", [checkUserAuth], userRoleController.updateUserRole); //Search User Role by Id and Update it
router.delete("/userRole/delete", [checkUserAuth], userRoleController.deleteUserRole); //Search User role by id and delete

// User Conversion Routes

router.post("/user/add", [checkUserAuth, Upload.single("image")], UserController.addUser); //Add Conversion User in Database
router.get("/user/id/list", [checkUserAuth], UserController.getUserById); // Search Conversion User By ID
router.get("/user/list", [checkUserAuth], UserController.getAllUser); //Get List of All Conversion User
router.get("/user/cashier", [checkUserAuth], UserController.getCashier);
router.put("/user/update", [checkUserAuth, Upload.single("image")], UserController.updateUser); //Search Conversion User by Id and Update
router.delete("/user/delete", [checkUserAuth], UserController.deleteUser); //Search Conversion User by Id and Delete

// Installments Reciepts Routes

router.post("/installmentReceipts/add", [checkUserAuth], InstallmentReceiptsController.create); //Add Conversion User in Database
router.get("/installmentReceipts/id/list", [checkUserAuth], InstallmentReceiptsController.getInstallmentReceiptsById); // Search Conversion User By ID
router.get("/installmentReceipts/list", [checkUserAuth], InstallmentReceiptsController.getInstallmentReceipts); //Get List of All Conversion User
router.put("/installmentReceipts/update", [checkUserAuth], InstallmentReceiptsController.update); //Search Conversion User by Id and Update
router.delete("/installmentReceipts/delete", [checkUserAuth], InstallmentReceiptsController.deleteInstallmentReceipts); //Search Conversion User by Id and Delete
router.get(
	"/installmentReceipts/bk_id/list",
	[checkUserAuth],
	InstallmentReceiptsController.getInstallmentReceiptsByBK_ID
);
router.get(
	"/installmentReceipts/bk_reg_code/list",
	[checkUserAuth],
	InstallmentReceiptsController.getInstallmentReceiptsByBK_Reg_Code
);
router.get(
	"/installmentReceipts/unVarified/list",
	[checkUserAuth],
	InstallmentReceiptsController.getUnVarifiedReceipts
);
router.put(
	"/installmentReceipts/unVarified/update",
	[checkUserAuth],
	InstallmentReceiptsController.updateUnVarifiedReceipts
);
router.put(
	"/installmentReceipts/unVarified/pdf",
	[checkUserAuth],
	InstallmentReceiptsController.getUnVarifiedReceiptsPdf
);
router.put(
	"/installmentReceipts/unVarifiedByUsers/pdf",
	[checkUserAuth],
	InstallmentReceiptsController.getUnVarifiedPdfByUsers
);

//Attendence Routes
router.post("/attendance/add", [checkUserAuth], attendanceController.addAttendence);
// router.post(
//   "/attendance/checkleave",
//   [checkUserAuth],
//   attendanceController.checkLeave
// );

router.get("/attendance/list", [checkUserAuth], attendanceController.getAttendence);
router.get("/attendance/employee/id", [checkUserAuth], attendanceController.getAttendenceByEmployeeId);
router.get("/attendance/id", [checkUserAuth], attendanceController.getAttendenceById);
router.get("/searchattendance/id", [checkUserAuth], attendanceController.searchAttendence);
router.post("/attendance/date", [checkUserAuth], attendanceController.getAttendanceByDate);
router.post("/attendance/punch_in", [checkUserAuth], attendanceController.punchInAttendance);
router.post("/attendance/punch_out", [checkUserAuth], attendanceController.punchOutAttendance);
router.get("/attendance/employeeId", [checkUserAuth], attendanceController.getAttendanceByEmployeeId);

// EMPLOYEE ATTENDANCE ROUTES

router.post("/leave/add", [checkUserAuth], leaveController.addleave);
router.get("/leave/list", [checkUserAuth], leaveController.getAllLeave);
router.put("/leave/update", [checkUserAuth], leaveController.updateLeave);
router.put("/leave/status/update", leaveController.updateStatusLeave);
router.delete("/leave/delete", [checkUserAuth], leaveController.deleteLeave);
router.get("/leave/id", [checkUserAuth], leaveController.getLeaveById);
router.get("/leave/employee/id", [checkUserAuth], leaveController.getLeaveByEmployeeId);

// Member Routes
router.post("/member/add", [checkUserAuth, Upload.single("Image")], MemberController.addMember);
router.get("/member/id/list", [checkUserAuth], MemberController.getMemberById);
router.get("/member/list", [checkUserAuth], MemberController.getAllMember);
router.put("/member/update", [checkUserAuth], Upload.single("Image"), MemberController.updateMember);
router.delete("/member/delete", [checkUserAuth], MemberController.deleteMember);
router.get("/member/name/list", [checkUserAuth], MemberController.getMemberByName);
router.get("/member/cnic/list", [checkUserAuth], MemberController.getMemberByCNIC);
router.get("/members/nomineeId/list", MemberController.getMembersByNomineeid);
router.get("/nominees/memId/list", MemberController.getNomineesByMemId);
// Member Adress Routes

router.post("/memberAddress/add", [checkUserAuth], memberAddressController.addMemberAdress);
router.get("/memberAddress/id/list", [checkUserAuth], memberAddressController.getMemberAddressById);
router.get("/memberAddress/list", [checkUserAuth], memberAddressController.getAllMemberAddress);
router.put("/memberAddress/update", [checkUserAuth], memberAddressController.updateMemberAddress);
router.delete("/memberAddress/delete", [checkUserAuth], memberAddressController.deleteMemberAddress);

//Nominee Record Routes
router.post("/nominee/add", [checkUserAuth], NomineeController.addNominee);
router.get("/nominee/id/list", [checkUserAuth], NomineeController.getNomineeById);
router.get("/nominee/list", [checkUserAuth], NomineeController.getAllNominee);
router.put("/nominee/update", [checkUserAuth], NomineeController.updateNominee);
router.delete("/nominee/delete", [checkUserAuth], NomineeController.deleteNominee);
router.get("/nominee/name/list", [checkUserAuth], NomineeController.getNomineeByName);
router.get("/nominee/cnic/list", [checkUserAuth], NomineeController.getNomineeByCNIC);
//UnitCategoryRoutes
router.post("/unitCategory/add", [checkUserAuth], UnitCategoryController.addUnitCategory);
router.get("/unitCategory/id/list", [checkUserAuth], UnitCategoryController.getUnitCategoryById);
router.get("/unitCategory/list", [checkUserAuth], UnitCategoryController.getAllUnitCategory);
router.put("/unitCategory/update", [checkUserAuth], UnitCategoryController.updateUnitCategory);
router.delete("/unitCategory/delete", [checkUserAuth], UnitCategoryController.deleteUnitCategory);

//Unit TYPE Routes
router.post("/unitType/add", [checkUserAuth], UnitTypeController.create);
router.get("/unitType/id/list", [checkUserAuth], UnitTypeController.getUnitTypeById);
router.get("/unitType/list", [checkUserAuth], UnitTypeController.get);
router.put("/unitType/update", [checkUserAuth], UnitTypeController.update);
router.delete("/unitType/delete", [checkUserAuth], UnitTypeController.delete);

//Unit Routes
router.post("/unit/add", [checkUserAuth], UnitController.addUnit);
router.get("/unit/id/list", [checkUserAuth], UnitController.getUnitById);
router.get("/unit/list", [checkUserAuth], UnitController.getAllUnit);
router.get("/unit/all/list", [checkUserAuth], UnitController.getAllUnits);
router.put("/unit/update", [checkUserAuth], UnitController.updateUnit);
router.delete("/unit/delete", [checkUserAuth], UnitController.deleteUnit);
router.post("/unit/unitForPlot", [checkUserAuth], UnitController.createUnitForPlot);
router.get("/unit/filter", [checkUserAuth], UnitController.unitFilters);
//Floor Routes
router.post("/floor/add", [checkUserAuth], FloorController.addFloor);
router.get("/floor/id/list", [checkUserAuth], FloorController.getFloorById);
router.get("/Floor/list", [checkUserAuth], FloorController.getAllFloor);
router.put("/Floor/update", [checkUserAuth], FloorController.updateFloor);
router.delete("/Floor/delete", [checkUserAuth], FloorController.deleteFloor);

//Blocks Record Routes
router.post("/block/add", [checkUserAuth], BlockController.create); // Add Block in DataBase
router.get("/block/id/list", [checkUserAuth], BlockController.getBlockById); //Search Block Detailby Id
router.get("/block/sect/list", [checkUserAuth], BlockController.getBlockBySecId); //Search Block Detailby Id
router.get("/block/list", [checkUserAuth], BlockController.get); //GET All the Blocks List
router.put("/block/update", [checkUserAuth], BlockController.update); //Search block by id and Update
router.delete("/block/delete", [checkUserAuth], BlockController.delete); //Search Block by ID and Delete

//Streets Record Routes
router.post("/street/add", [checkUserAuth], StreetController.addStreet); // Add Street in DataBase
router.get("/street/id/list", [checkUserAuth], StreetController.getStreetById); //Search Street Detailby Id
router.get("/street/list", [checkUserAuth], StreetController.getAllStreet); //GET All the Streets List
router.put("/street/update", [checkUserAuth], StreetController.updateStreet); //Search street by id and Update
router.delete("/street/delete", [checkUserAuth], StreetController.deleteStreet); //Search Street by ID and Delete

// PACKAGES ROUTES
router.post("/package/add", [checkUserAuth], PackageController.addPackage); //Create and Add new Packages
router.get("/package/id/list", [checkUserAuth], PackageController.getPackageById); //Search Packages by Packages ID

router.get("/package/list", [checkUserAuth], PackageController.getAllPackages); //Get the list of all available Packagess
router.put("/package/update", [checkUserAuth], PackageController.updatePackage); //Search Packages by Id and update
router.delete("/package/delete", [checkUserAuth], PackageController.deletePackage);
//Search Packages by Id and delete

//Booking Routes
router.post("/booking/add", [checkUserAuth], BookingController.addBooking);
//Create and Add new Bookings
router.post("/booking/createDevelopmentPlan", [checkUserAuth], BookingController.createDevelopmentPlan);
router.get("/booking/id/list", [checkUserAuth], BookingController.getBookingById);
router.get("/booking/cnic/list", [checkUserAuth], BookingController.getBookingByCNIC);
//Search Bookings by Bookings ID

router.get("/booking/id/getFile", [checkUserAuth], BookingController.createfileAcknowlegmentLetter);
router.get("/booking/id/sampleLetter", [checkUserAuth], BookingController.sampleLetter);
router.get("/booking/ballotAllotLetter", BookingController.ballotAllotLetter);
router.get("/booking/developmetChargesLetter", [checkUserAuth], BookingController.developmetChargesLetter);
router.get("/booking/transferLetter", [checkUserAuth], BookingController.transferLetter);
router.get("/booking/plotSizeData", [checkUserAuth], BookingController.plotSizeData);
router.get("/booking/plotNoAllot", [checkUserAuth], BookingController.plotNumberAllot);
router.get("/booking/locationAssign", [checkUserAuth], BookingController.locationAssign);
router.put("/updateBookingInstallmentStatus", [checkUserAuth], BookingController.updateBookingInstallmentStatus);

router.get("/booking/list", [checkUserAuth], BookingController.getAllBookings);
//Get the list of all available Bookingss

router.put("/booking/update", [checkUserAuth], BookingController.updateBooking);
router.put("/booking/updateUser", [checkUserAuth], BookingController.updateUser);

router.put("/booking/update/status", [checkUserAuth], BookingController.updateBookingStatus);

router.put("/ndc/update/status", [checkUserAuth], BookingController.updateNdcStatus);

//Search Bookings by Id and update

router.delete("/booking/delete", [checkUserAuth], BookingController.deleteBooking);
//Search Bookings by Id and delete

router.get("/booking/id/getPPFile", [checkUserAuth], BookingController.createpaymentPlan);
//Search Packages by Packages ID

router.get("/booking/id/getStatementFile", [checkUserAuth], BookingController.createStatement);
router.post("/booking/getStatementFile/bulk", BookingController.createStatementForTest);

// UnvarifiedTransaction Routes
// router.post('/unvarifiedTransaction/add', [checkUserAuth], UnVarifiedTransactionController.addUnvarifiedTransaction)//Create and Add new UnvarifiedTransactions
// router.get('/unvarifiedTransaction/id/list', [checkUserAuth], UnVarifiedTransactionController.getUnVarifiedTransactionById)//Search UnvarifiedTransactions by UnvarifiedTransactions ID
// router.get('/unvarifiedTransaction/list', [checkUserAuth], UnVarifiedTransactionController.getAllUnvarifiedTransactions)//Get the list of all available UnvarifiedTransactionss
// router.put('/unvarifiedTransaction/update', [checkUserAuth], UnVarifiedTransactionController.updateUnvarifiedTransaction)//Search UnvarifiedTransactions by Id and update
// router.delete('/unvarifiedTransaction/delete', [checkUserAuth], UnVarifiedTransactionController.deleteUnvarifiedTransaction)//Search UnvarifiedTransactions by Id and delete

// Transaction Routes
router.post("/transaction/add", [checkUserAuth], TransactionController.addTransaction); //Create and Add new Transactions
router.get("/transaction/id/list", [checkUserAuth], TransactionController.getTransactionById); //Search Transactions by Transactions ID
router.get("/transaction/BK_Reg_Code/list", [checkUserAuth], TransactionController.getTransactionByBK_Reg_Code);
router.get("/transaction/file", [checkUserAuth], TransactionController.transactionPdf); //Search Transactions by Transactions ID
router.get("/transaction/list", [checkUserAuth], TransactionController.getAllTransactions); //Get the list of all available Transactionss
router.put("/transaction/update", [checkUserAuth], TransactionController.updateTransaction); //Search Transactions by Id and update
router.delete("/transaction/delete", [checkUserAuth], TransactionController.deleteTransaction); //Search Transactions by Id and delete

// Phase Routes
router.post("/phase/add", [checkUserAuth], PhaseController.create); //Create and Add new Phases
router.get("/phase/id/list", [checkUserAuth], PhaseController.getPhaseById); //Search Phases by Phases ID
router.get("/phase/list", [checkUserAuth], PhaseController.get); //Get the. list of all available Phasess
router.put("/phase/update", [checkUserAuth], PhaseController.update); //Search Phases by Id and update
router.delete("/phase/delete", [checkUserAuth], PhaseController.delete); //Search Phases by Id and delete

// Sector Routes
router.post("/sector/add", [checkUserAuth], SectorController.create); //Create and Add new Sectors
router.get("/sector/id/list", [checkUserAuth], SectorController.getSectorById); //Search Sectors by Sectors ID
router.get("/sector/phs/list", [checkUserAuth], SectorController.getSectorByPhsId); //Search Sectors by PHS ID
router.get("/sector/list", [checkUserAuth], SectorController.get); //Get the list of all available Sectorss
router.put("/sector/update", [checkUserAuth], SectorController.update); //Search Sectors by Id and update
router.delete("/sector/delete", [checkUserAuth], SectorController.delete); //Search Sectors by Id and delete

//PlotSize Routes
router.post("/plotSize/add", [checkUserAuth], PlotSizeController.create);
router.get("/plotSize/id/list", [checkUserAuth], PlotSizeController.getPlotSizeById);
router.get("/plotSize/list", [checkUserAuth], PlotSizeController.get);
router.put("/plotSize/update", [checkUserAuth], PlotSizeController.update);
router.delete("/plotSize/delete", [checkUserAuth], PlotSizeController.delete);

//Unit Nature TYPE Routes
router.post("/unitNatureType/add", [checkUserAuth], UnitNatureTypeController.create);
router.get("/unitNatureType/id/list", [checkUserAuth], UnitNatureTypeController.getUnitNatureTypeById);
router.get("/unitNatureType/list", [checkUserAuth], UnitNatureTypeController.get);
router.put("/unitNatureType/update", [checkUserAuth], UnitNatureTypeController.update);
router.delete("/unitNatureType/delete", [checkUserAuth], UnitNatureTypeController.delete);

//Voucher Controller
router.post("/voucher/add", [checkUserAuth], VoucherController.create);
router.get("/voucher/id/list", [checkUserAuth], VoucherController.getVoucherById);
router.get("/voucher/list", [checkUserAuth], VoucherController.get);
router.put("/voucher/update", [checkUserAuth], VoucherController.update);
router.put("/voucher/userUpdate", [checkUserAuth], VoucherController.updateUser);
router.delete("/voucher/delete", [checkUserAuth], VoucherController.delete);
router.get("/voucher/pdf", [checkUserAuth], VoucherController.createNDCReport);

//Voucher Type Controller
router.post("/voucherType/add", [checkUserAuth], VoucherTypeController.create);
router.get("/voucherType/id/list", [checkUserAuth], VoucherTypeController.getVoucherTypeById);
router.get("/voucherType/list", [checkUserAuth], VoucherTypeController.get);
router.put("/voucherType/update", [checkUserAuth], VoucherTypeController.update);
router.delete("/voucherType/delete", [checkUserAuth], VoucherTypeController.delete);

//Voucher Reason Controller
router.post("/voucherReason/add", [checkUserAuth], VoucherReasonController.create);
router.get("/voucherReason/id/list", [checkUserAuth], VoucherReasonController.getVoucherReasonById);
router.get("/voucherReason/list", [checkUserAuth], VoucherReasonController.get);
router.put("/voucherReason/update", [checkUserAuth], VoucherReasonController.update);
router.delete("/voucherReason/delete", [checkUserAuth], VoucherReasonController.delete);

//Installment_Types Routes
router.post("/installmentType/add", [checkUserAuth], InstallmentTypeController.create);
router.get("/installmentType/id/list", [checkUserAuth], InstallmentTypeController.getInstallmentTypeById);
router.get("/installmentType/list", [checkUserAuth], InstallmentTypeController.get);
router.put("/installmentType/update", [checkUserAuth], InstallmentTypeController.update);
router.delete("/installmentType/delete", [checkUserAuth], InstallmentTypeController.delete);

// Payemnt Mode Routes
router.post("/paymentMode/add", [checkUserAuth], PaymentModeController.create);
router.get("/paymentMode/id/list", [checkUserAuth], PaymentModeController.getPaymentModeById);
router.get("/paymentMode/list", [checkUserAuth], PaymentModeController.get);
router.put("/paymentMode/update", [checkUserAuth], PaymentModeController.update);
router.delete("/paymentMode/delete", [checkUserAuth], PaymentModeController.delete);

// Policy Routes
router.post("/policy/create", [checkUserAuth], policyController.createPolicy);
router.get("/policy/list", [checkUserAuth], policyController.getAllPolicies);
router.put("/policy/update", [checkUserAuth], policyController.updatePolicy);
router.delete("/policy/delete", [checkUserAuth], policyController.deletePolicy);
router.get("/policies/download", [checkUserAuth], policyController.downloadPolicyPDF);

// Account Transaction
router.post("/accountTransaction/add", [checkUserAuth], AccountTransactionController.addAccountTransaction);
router.post("/receiptsToTransaction", [checkUserAuth], AccountTransactionController.receiptsToTransaction);
router.get("/accountTransaction/list/id", [checkUserAuth], AccountTransactionController.getTransactionById);
router.get("/accountTransaction/list", [checkUserAuth], AccountTransactionController.getAllTransaction);
router.put("/accountTransaction/update", [checkUserAuth], AccountTransactionController.updateAccountTransaction);
router.delete("/accountTransaction/delete", [checkUserAuth], AccountTransactionController.deleteAccountTransaction);
router.get("/accountTransaction/projectId", [checkUserAuth], AccountTransactionController.getTransactionByProjectId);
router.get("/accountTransaction/partnerData", [checkUserAuth], AccountTransactionController.partnerData);
router.get("/specificIncomeToTransaction", [checkUserAuth], AccountTransactionController.specificIncomeToTransaction);
router.post(
	"/accountTransaction/uploadCSV",
	[checkUserAuth, Upload.single("csv")],
	AccountTransactionController.uploadCSV
);
router.get("/accountTransaction/downloadCsv", [checkUserAuth], AccountTransactionController.downloadCsv);
//Account Categories Amount
router.post("/accountCategory/add", [checkUserAuth], AccountCategoryController.addCategory);
router.get("/accountCategory/list/id", [checkUserAuth], AccountCategoryController.getCategoryById);
router.get("/accountCategory/list", [checkUserAuth], AccountCategoryController.getAllCategories);
router.put("/accountCategory/update", [checkUserAuth], AccountCategoryController.updateAccountCategory);
router.delete("/accountCategory/delete", [checkUserAuth], AccountCategoryController.deleteAccountCategory);
router.get("/accountCategory/all/list", [checkUserAuth], AccountCategoryController.getCategoriesList);

///Expense Categories
router.post("/expenseCategory/add", [checkUserAuth], ExpenseCategoryController.addExpenseCategory);
router.get("/expenseCategory/list/id", [checkUserAuth], ExpenseCategoryController.getExpenseCategoryById);
router.get("/expenseCategory/list", [checkUserAuth], ExpenseCategoryController.getAllExpenseCategories);
router.put("/expenseCategory/update", [checkUserAuth], ExpenseCategoryController.updateExpensecategory);
router.delete("/expenseCategory/delete", [checkUserAuth], ExpenseCategoryController.deleteExpensecategory);
router.get("/expenseCategory/all/list", [checkUserAuth], ExpenseCategoryController.getExpenseCategoriesList);
router.get("/expenseCategory/projectId", [checkUserAuth], ExpenseCategoryController.expenseByProjectId);

//Income Categories
router.post("/incomeCategory/add", [checkUserAuth], IncomeCategoryController.addIncomeCategory);
router.get("/incomeCategory/list/id", [checkUserAuth], IncomeCategoryController.getIncomeCategoryById);
router.get("/incomeCategory/list", [checkUserAuth], IncomeCategoryController.getAllIncomeCategories);
router.put("/incomeCategory/update", [checkUserAuth], IncomeCategoryController.updateIncomeCategory);
router.delete("/incomeCategory/delete", [checkUserAuth], IncomeCategoryController.deleteIncomeCategory);
router.get("/incomeCategory/all/list", [checkUserAuth], IncomeCategoryController.getIncomeCategoriesList);
router.get("/incomeCategory/projectId", [checkUserAuth], IncomeCategoryController.incomeByProjectId);

//Employee Salary History Controller
router.post("/employeeSalaryHisory/add", [checkUserAuth], EmployeeSalaryHistoryController.createEmployeeSalaryHistory);
router.get(
	"/employeeSalaryHisory/id/list",
	[checkUserAuth],
	EmployeeSalaryHistoryController.getEmployeeSalaryHistoryById
);
router.get("/employeeSalaryHisory/list", [checkUserAuth], EmployeeSalaryHistoryController.getAllEmployeeSalaryHistory);
router.put(
	"/employeeSalaryHisory/update",
	[checkUserAuth],
	EmployeeSalaryHistoryController.updateEmployeeSalaryHistory
);
router.delete(
	"/employeeSalaryHisory/delete",
	[checkUserAuth],
	EmployeeSalaryHistoryController.deleteEmployeeSalaryHistory
);
router.post("/dispatchSalary/employee", [checkUserAuth], EmployeeSalaryHistoryController.dispatchSalariesBulk);
router.post("/dispatchSalary/employee/id", [checkUserAuth], EmployeeSalaryHistoryController.dispatchSalaryByEmployeeId);

// NDC charges Controller
router.post("/ndcCharges/add", [checkUserAuth], NdcChangesController.create);
router.get("/ndcCharges/list", [checkUserAuth], NdcChangesController.get);
router.get("/ndcActiveCharges/list", [checkUserAuth], NdcChangesController.getActive);
router.get("/ndcCharges/id", [checkUserAuth], NdcChangesController.getNDCChangesById);
router.put("/ndcCharges/update", [checkUserAuth], NdcChangesController.update);
router.delete("/ndcCharges/delete", [checkUserAuth], NdcChangesController.delete);

//Employee Salary History
// router.get('/dispatchSalary/employee/Id', [checkUserAuth],DispatchedSalariesController.getDispatchedSalariesById)
// router.put('/dispatch/salary', [checkUserAuth],DispatchedSalariesController.dispatchSalariesBulk)
// router.put('/dispatch/salary/employeeId', [checkUserAuth],DispatchedSalariesController.dispatchSalaryOfEmployee)
// router.get('/dispatchedSalaries/list', [checkUserAuth],DispatchedSalariesController.getAllDispatchedSalaries)

// Settings Rout
router.post("/settings/add", [checkUserAuth], SettingsController.addSettings);
// router.get('/settings/id/list', [checkUserAuth], SettingsController.getSettingsById)
router.get("/settings/list", [checkUserAuth], SettingsController.getAllSettings);
// router.put('/settings/update', [checkUserAuth], SettingsController.updateSettings)
// router.delete('/settings/delete', [checkUserAuth], SettingsController.deleteSettings)
// router.get('/settings/incomeCategory', [checkUserAuth], SettingsController.getIncomeCategories)
// router.get('/settings/expenseCategory', [checkUserAuth], SettingsController.getExpenseCategories)

// USER GROUP ROUTES
router.post("/userGroup/add", [checkUserAuth], UserGroupController.create);
router.get("/userGroup/id/list", [checkUserAuth], UserGroupController.getUserGroupById);
router.get("/userGroup/list", [checkUserAuth], UserGroupController.get);
router.put("/userGroup/update", [checkUserAuth], UserGroupController.update);
router.delete("/userGroup/delete", [checkUserAuth], UserGroupController.delete);

// Menu Routes
router.get("/menu/list", [checkUserAuth], MenuController.get);

// GroupMenu Routes
router.post("/groupMenu/add", [checkUserAuth], GroupMenuController.create);
router.get("/groupMenu/id/list", [checkUserAuth], GroupMenuController.getGroupMenuById);
router.get("/groupMenu/list", [checkUserAuth], GroupMenuController.get);
router.put("/groupMenu/update", [checkUserAuth], GroupMenuController.update);
router.delete("/groupMenu/delete", [checkUserAuth], GroupMenuController.delete);

// Tax Payee Routes
router.post("/taxPayee/add", [checkUserAuth], TaxPayeeController.create);
router.get("/taxPayee/id/list", [checkUserAuth], TaxPayeeController.getTaxPayeeCategoryById);
router.get("/taxPayee/list", [checkUserAuth], TaxPayeeController.get);
router.put("/taxPayee/update", [checkUserAuth], TaxPayeeController.update);
router.delete("/taxPayee/delete", [checkUserAuth], TaxPayeeController.delete);

// Tax Tag Routes
router.post("/taxTag/add", [checkUserAuth], TaxTagController.create);
router.get("/taxTag/id/list", [checkUserAuth], TaxTagController.getTaxTagById);
router.get("/taxTag/list", [checkUserAuth], TaxTagController.get);
router.put("/taxTag/update", [checkUserAuth], TaxTagController.update);
router.delete("/taxTag/delete", [checkUserAuth], TaxTagController.delete);

router.post("/transferFee/add", [checkUserAuth], TransferFeeController.create);
router.get("/transferFee/id/list", [checkUserAuth], TransferFeeController.getTRFSById);
router.get("/transferFee/list", [checkUserAuth], TransferFeeController.get);
router.put("/transferFee/update", [checkUserAuth], TransferFeeController.update);
router.delete("/transferFee/delete", [checkUserAuth], TransferFeeController.delete);

//route for create location
router.post("/location/create", [checkUserAuth], LocationContollers.create);
//route for get all location
router.get("/location/getAll", [checkUserAuth], LocationContollers.getAllLocation);
//router for get single location
router.get("/location/id", [checkUserAuth], LocationContollers.getLocationById);
//router for update location
router.put("/location/update", [checkUserAuth], LocationContollers.updateLocation);
//router for delete location
router.delete("/location/delete", [checkUserAuth], LocationContollers.deleteLocation);

//File Transfer Dummy Routes
// router.post('/fileTransfer/add', [checkUserAuth,Upload.single('image')], FileTransferController.addfileTransfer)
router.post(
	"/fileTransfer/add",
	[
		checkUserAuth,
		upload.fields([
			{ name: "Buyer_Image" }, // Single file upload for Buyer_Picture
			{ name: "Seller_Image" }, // Single file upload for Seller_Picture
			{ name: "Combine_Image" } // Single file upload for Combine_Picture
		])
	],
	FileTransferController.addfileTransfer
);
router.get("/fileTransfer/id/list", [checkUserAuth], FileTransferController.getFileTransferById);
router.get("/fileTransfer/list", [checkUserAuth], FileTransferController.getAllFileTransfer);
router.delete("/fileTransfer/delete", [checkUserAuth], FileTransferController.deleteFileTransfer);
router.get("/transferEvent/pdf", [checkUserAuth], FileTransferController.transferEventPdf);

// adminAuth
router.post("/liability/add", [checkUserAuth, adminAuth], LiabilityController.createLiability); //Create and Add new liability
router.get("/liability/id/list", [checkUserAuth, adminAuth], LiabilityController.getLiabilityById); //Search liability by liability ID
router.get("/liability/list", [checkUserAuth, adminAuth], LiabilityController.getAllLiabilities); //Get the list of all available liabilitys
router.put("/liability/update", [checkUserAuth, adminAuth], LiabilityController.updateLiability); //Search liability by Id and update
router.delete("/liability/delete", [checkUserAuth, adminAuth], LiabilityController.deleteLiability); //Search liability by Id and delete
router.get("/liability/totalAmount", [checkUserAuth], LiabilityController.liabilityTotalAmount);
router.get("/liability/userList", [checkUserAuth], LiabilityController.getAllLiabilitiesForUser);
router.get("/liability/id/userList", [checkUserAuth], LiabilityController.getLiabilityForUserById);

router.post("/payOff/add", [checkUserAuth, adminAuth], PayOffController.createPayOff); //Create and Add new payOff
router.get("/payOff/id/list", [checkUserAuth, adminAuth], PayOffController.getPayOffById); //Search payOff by payOff ID
router.get("/payOff/list", [checkUserAuth, adminAuth], PayOffController.getAllPayOffs); //Get the list of all available payOffs
router.put("/payOff/update", [checkUserAuth, adminAuth], PayOffController.updatePayOff); //Search payOff by Id and update
router.delete("/payOff/delete", [checkUserAuth, adminAuth], PayOffController.deletePayOff); //Search payOff by Id and delete
router.get("/payOff/liabilityId", [checkUserAuth, adminAuth], PayOffController.getPayOffByLiabilityId);
router.get("/payOff/liabilityById", [checkUserAuth], PayOffController.getAllPayoff);

router.post("/withdrawal/add", [checkUserAuth, adminAuth], WithdrawalController.createWithdrawal); //Create and Add new withdrawal
router.get("/withdrawal/id/list", [checkUserAuth, adminAuth], WithdrawalController.getWithdrawalById); //Search withdrawal by withdrawal ID
router.get("/withdrawal/list", [checkUserAuth, adminAuth], WithdrawalController.getAllWithdrawal); //Get the list of all available withdrawals
router.put("/withdrawal/update", [checkUserAuth, adminAuth], WithdrawalController.updateWithdrawal); //Search withdrawal by Id and update
router.delete("/withdrawal/delete", [checkUserAuth, adminAuth], WithdrawalController.deleteWithdrawal); //Search withdrawal by Id and delete
router.get("/withdrawal/totalAmount", [checkUserAuth], WithdrawalController.withdrawalTotalAmount);
router.get("/withdrawal/userList", [checkUserAuth], WithdrawalController.getAllWithdrawalForUser);
router.get("/withdrawal/id/userList", [checkUserAuth], WithdrawalController.getWithdrawalForUserById);

router.post("/withdraw/add", [checkUserAuth, adminAuth], WithdrawController.createWithdraw); //Create and Add new withdraw
router.get("/withdraw/id/list", [checkUserAuth, adminAuth], WithdrawController.getWithdrawById); //Search withdraw by withdraw ID
router.get("/withdraw/list", [checkUserAuth, adminAuth], WithdrawController.getAllWithdraws); //Get the list of all available withdraws
router.put("/withdraw/update", [checkUserAuth, adminAuth], WithdrawController.updateWithdraw); //Search withdraw by Id and update
router.delete("/withdraw/delete", [checkUserAuth, adminAuth], WithdrawController.deleteWithdraw); //Search withdraw by Id and delete
router.get("/withdraw/withdrawalId", [checkUserAuth, adminAuth], WithdrawController.getWithdrawByWithdrawalId);
router.get("/withdraw/withdrawalById", [checkUserAuth], WithdrawController.getAllWithdraw);

// Scripts
router.get("/bookings", BookingController.bookingScriptRun);

// export default router;
module.exports = router;
