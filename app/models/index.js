const { Sequelize } = require("sequelize");
const sequelize = require("../../config/connectdb");
const User = require("./User");
const memberAddress= require("../models/MemberAddress");
const Member_MST = require("./Member_MST");
const Booking_Mst = require("./Booking_Mst");
// const SurCharge = require("./SurCharge");
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.OpenFile = require('./OpenFile_Mst')(sequelize, Sequelize);
db.FileSubmission = require('./File_Sub_RC_Mst')(sequelize, Sequelize);
db.FileSubmissionDetail = require('./File_Sub_RC_Detail')(sequelize, Sequelize);
db.UnitType = require('./Unit_Type')(sequelize, Sequelize);
db.UnitNature = require('./Unit_Nature_Mst')(sequelize, Sequelize);
db.Phase = require('./Phase_Mst')(sequelize, Sequelize);
db.Sector = require('./Sector_Mst')(sequelize, Sequelize);
db.Block = require('./Block_Mst')(sequelize, Sequelize);
db.PaymentPlan = require('./Payment_PlanPack_Mst')(sequelize, Sequelize);
db.PlotSize = require('./Plot_Size_Mst')(sequelize, Sequelize);
db.Booking = require('./Booking_Mst')(sequelize, Sequelize);
db.Member = require('./Member_MST')(sequelize, Sequelize);
db.Unit = require('./Unit_MST')(sequelize, Sequelize);
db.UnitCategory = require('./Unit_Category')(sequelize, Sequelize);
db.MemNominee = require('./MemNominee_MST')(sequelize, Sequelize);
db.Voucher = require('./VOUCHER_MST')(sequelize, Sequelize);
db.VoucherType = require('./VOUCH_TYPE_MST')(sequelize, Sequelize);
db.VoucherReason = require('./Vouch_Reason_MST')(sequelize, Sequelize);
db.NDCChanges = require('./NDC_Charges_MST')(sequelize, Sequelize);
db.TRSRequest = require('./TRS_Request_Mst')(sequelize, Sequelize);
db.Street = require('./Street_Mst')(sequelize, Sequelize);
db.Floor = require('./Floor_Mst')(sequelize, Sequelize);
db.InstallmentType = require('./InstallmentType')(sequelize, Sequelize);
db.Payment_Mode = require('./Payment_Mode')(sequelize, Sequelize);
db.InstallmentReceipts = require('./Installment_Receipts')(sequelize, Sequelize);
db.BookingInstallmentDetails = require('./Booking_Installment_Details')(sequelize, Sequelize);
db.TaxPayeeCategory = require('./Tax_Payee_Category')(sequelize, Sequelize);
db.TaxTag = require('./Tax_Tag_Mst')(sequelize, Sequelize);
db.TRFS = require('./TRS_Fee_Struct_Mst')(sequelize, Sequelize);
db.MYLocation = require('./Location')(sequelize, Sequelize);
db.Liability = require('./Liability')(sequelize, Sequelize);
db.PayOff = require('./PayOff')(sequelize, Sequelize);
db.Withdrawal = require('./Withdrawal')(sequelize, Sequelize);
db.Withdraw = require('./Withdraw')(sequelize, Sequelize);
db.SurCharge = require("./SurCharge")(sequelize, Sequelize);

db.Sector.belongsTo(db.Phase, { as: 'Phase', foreignKey: 'PHS_ID' });
db.Block.belongsTo(db.Sector, { as: 'Sector', foreignKey: 'SECT_ID' })
db.OpenFile.belongsTo(db.Phase, { as: 'Phase', foreignKey: 'PHS_ID' })
db.OpenFile.belongsTo(db.UnitType, { as: 'UnitType', foreignKey: 'UType_ID' })
db.OpenFile.belongsTo(db.PaymentPlan, { as: 'PaymentPlan', foreignKey: 'PP_ID' })
db.OpenFile.belongsTo(db.PlotSize, { as: 'PlotSize', foreignKey: 'PS_ID' })
db.OpenFile.belongsTo(db.Sector, { as: 'Sector', foreignKey: 'SECT_ID' })
db.OpenFile.belongsTo(db.Block, { as: 'Block', foreignKey: 'BK_ID' })
db.OpenFile.belongsTo(db.UnitNature, { as: 'UnitNature', foreignKey: 'NType_ID' })

db.PayOff.belongsTo(db.Liability,{as:'Liability',foreignKey:'liabilityId'})
db.Withdraw.belongsTo(db.Withdrawal,{as:'Withdrawal',foreignKey:'withdrawalId'})
// db.BookingInstallmentDetails.belongsTo(User, { as: 'User', foreignKey: 'USER_ID' })

db.FileSubmission.belongsTo(User, { as: 'User', foreignKey: 'USER_ID' })
db.FileSubmissionDetail.belongsTo(db.FileSubmission, { as: 'FileSubmission', foreignKey: 'FSRC_ID' })
db.FileSubmissionDetail.belongsTo(db.OpenFile, { as: 'OpenFile', foreignKey: 'OF_ID' })
db.FileSubmissionDetail.belongsTo(db.UnitType, { as: 'UnitType', foreignKey: 'UType_ID' })
db.FileSubmissionDetail.belongsTo(db.PlotSize, { as: 'PlotSize', foreignKey: 'PS_ID' })
db.FileSubmissionDetail.belongsTo(User, { as: 'User', foreignKey: 'USER_ID' })


db.Voucher.belongsTo(db.VoucherType, { as: 'VoucherType', foreignKey: 'Vouch_Type_ID' })
db.Voucher.belongsTo(db.VoucherReason, { as: 'VoucherReason', foreignKey: 'VR_ID' })
db.Voucher.belongsTo(db.TaxPayeeCategory, { as: 'TaxPayeeCategory', foreignKey: 'TPC_ID' })
db.Voucher.belongsTo(db.TaxTag, { as: 'TaxTag', foreignKey: 'TT_ID' })
// db.Voucher.belongsTo(db.TRSRequest, { as: 'TRSRequest', foreignKey: 'TRSR_ID' })
db.PaymentPlan.belongsTo(db.UnitType, {as: "UnitType",foreignKey: "UType_ID",});
db.PaymentPlan.belongsTo(db.PlotSize, { as: "PlotSize", foreignKey: "PS_ID" });

db.Booking.belongsTo(db.Member, { as: "Member", foreignKey: "MEMBER_ID" });
db.Booking.belongsTo(db.Member, { as: "SecondMember", foreignKey: "Sec_MEM_ID" });
db.Booking.belongsTo(db.MemNominee, { as: "MemNominee", foreignKey: "MN_ID" });
db.Booking.belongsTo(db.UnitType, { as: "UnitType", foreignKey: "UType_ID" });
db.Booking.belongsTo(db.PlotSize, { as: "PlotSize", foreignKey: "PS_ID" });
db.Booking.belongsTo(db.PaymentPlan, { as: "PaymentPlan", foreignKey: "PP_ID" });
db.Booking.belongsTo(db.UnitNature, { as: "UnitNature", foreignKey: "NType_ID" });
db.Booking.belongsTo(db.Phase, { as: "Phase", foreignKey: "PHASE_ID" });
db.Booking.belongsTo(db.Sector, { as: "Sector", foreignKey: "SECTOR_ID" });
db.Booking.belongsTo(db.Unit, { as: "Unit", foreignKey: "Unit_ID" });
db.Booking.belongsTo(User, { as: "User", foreignKey: "USER_ID" });
db.Booking.belongsTo(db.MYLocation, { as: "Location", foreignKey: "Location_ID" });
db.Booking.hasMany(db.SurCharge, { as: "SurCharge", foreignKey: "SC_ID"})

db.SurCharge.belongsTo(db.Booking, { as: "Booking", foreignKey: "BK_ID"});

db.Unit.belongsTo(db.Block, { as: "Block", foreignKey: "BLK_ID" });
db.Unit.belongsTo(db.UnitType, { as: "UnitType", foreignKey: "UType_ID" });
db.Unit.belongsTo(db.PlotSize, { as: "PlotSize", foreignKey: "PS_ID" });
db.Unit.belongsTo(db.Member, { as: "Member", foreignKey: "MEMBER_ID" });
db.Unit.belongsTo(db.MemNominee, { as: "MemNominee", foreignKey: "MN_ID" });
db.Unit.belongsTo(db.Street, { as: "Street", foreignKey: "ST_ID" });
db.MemNominee.belongsTo(db.Member, { as: "Member", foreignKey: "MEMBER_ID" });

db.InstallmentReceipts.belongsTo(db.Member,{as:"Member",foreignKey:"MEMBER_ID"})
db.InstallmentReceipts.belongsTo(db.Payment_Mode,{as:"Payment_Mode",foreignKey:"PMID"})
db.InstallmentReceipts.belongsTo(db.BookingInstallmentDetails,{as:"Booking_Installment_Details",foreignKey:"BKI_DETAIL_ID"})
db.InstallmentReceipts.belongsTo(db.Booking,{as:"Booking", foreignKey:"BK_ID"})
db.InstallmentReceipts.belongsTo(db.InstallmentType,{as:"Installment_Type",foreignKey:"InsType_ID"})
db.InstallmentReceipts.belongsTo(User, { as: "User", foreignKey: "USER_ID" });
db.InstallmentReceipts.belongsTo(db.Voucher, { as: "Voucher", foreignKey: "voucher_ID" });
db.Member.belongsTo(memberAddress,{as:"Member_Adress",foreignKey:"Member_ID"})

db.TRSRequest.belongsTo(User,{as:"User",foreignKey:"USER_ID"})
db.TRSRequest.belongsTo(db.Booking,{as:"Booking", foreignKey:"BK_ID"})
db.TRSRequest.belongsTo(db.Member,{as:"Member", foreignKey:"BUYER_MEMBER_ID"})
db.TRSRequest.belongsTo(db.Member,{as:"secondMember", foreignKey:"BUYER_SECOND_MEMBER_ID"})
db.TRSRequest.belongsTo(db.Voucher,{as:"VoucherBuyerTaxId", foreignKey:"VOUCHER_BUYER_ID"})
db.TRSRequest.belongsTo(db.Voucher,{as:"VoucherSellerTaxId", foreignKey:"VOUCHER_SELLER_ID"})
db.TRFS.belongsTo(db.UnitType, { as: 'UnitType', foreignKey: 'UType_ID' })
db.TRFS.belongsTo(db.PlotSize, { as: "PlotSize", foreignKey: "PS_ID" })


module.exports = db;