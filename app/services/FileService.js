const fs = require("fs");
const {
	OpenFile,
	Phase,
	UnitType,
	PaymentPlan,
	PlotSize,
	Sector,
	Block,
	UnitNature,
	InstallmentReceipts,
	InstallmentType
} = require("../models");
const Jimp = require("jimp");
const path = require("path");

class FileService {
	static createFileFroms = async (body, maxCodeId, userId) => {
		const {
			SR_Prefix,
			SR_Start,
			SR_End,
			Code_Prefix,
			Code_Start,
			PS_ID,
			UType_ID,
			PHS_ID,
			SECT_ID,
			BK_ID,
			PP_ID,
			NType_ID
		} = body;
		let Code_StartInc = Number(Code_Start);
		let arr = [];

		for (let i = SR_Start; i <= SR_End; i++) {
			let it = i + "";
			if ((i + "").length != (SR_Start + "").length) {
				for (let k = 0; k < (SR_Start + "").length - (i + "").length; k++) {
					it = "0" + it;
				}
			}

			let cit = Code_StartInc + "";
			if ((Code_StartInc + "").length != (Code_Start + "").length) {
				for (let k = 0; k < (Code_Start + "").length - (Code_StartInc + "").length; k++) {
					cit = "0" + cit;
				}
			}

			const createFile = {
				SR_Name: SR_Prefix + "-" + SR_Start + "-" + SR_End,
				SR_Prefix: SR_Prefix,
				SR_Start: SR_Start,
				SR_End: SR_End,
				SRForm_No: SR_Prefix + it,
				Code_Prefix: Code_Prefix,
				Code_Start: Code_Start,
				Form_Code: Code_Prefix + cit,
				PS_ID: PS_ID,
				UType_ID: UType_ID,
				PHS_ID: PHS_ID,
				SECT_ID: SECT_ID,
				PP_ID: PP_ID,
				BK_ID: BK_ID,
				NType_ID: NType_ID,
				OF_MaxCode: maxCodeId,
				USER_ID: userId
			};
			console.log(createFile);
			arr.push(createFile);
			Code_StartInc++;
			maxCodeId++;
		}
		return arr;
	};

	static createPaymentPlan = async (body) => {
		const { USER_ID, OF_ID } = body;
		const data = await OpenFile.findByPk(OF_ID, {
			include: [
				{ as: "Phase", model: Phase },
				{ as: "UnitType", model: UnitType },
				{ as: "PaymentPlan", model: PaymentPlan },
				{ as: "PlotSize", model: PlotSize },
				{ as: "Sector", model: Sector },
				{ as: "Block", model: Block },
				{ as: "UnitNature", model: UnitNature }
			]
		});
		//  console.log("data",data)
		const instTypeData = await InstallmentType.findAll({ raw: true });
		// console.log("instTypeData",instTypeData)

		let sr = 0;
		let installmentType;
		let installmentMonth = data?.PaymentPlan?.INS_Start_Date;
		let byAnnualTimePeriod = data?.PaymentPlan?.ByAnnual_TimePeriod;
		let installmentAmount = data?.PaymentPlan?.InstallmentAmount;
		let ByAnnual_Charges = data?.PaymentPlan?.ByAnnual_Charges;
		let ballotAmt = data?.PaymentPlan?.Ballot_Amt;
		let Possession_Amt = data?.PaymentPlan?.Possession_Amt;
		let amount = installmentAmount;
		let ballotInstallmentMonth = installmentMonth;
		let PossessionInstallmentMonth = installmentMonth;
		let ballotDueDate = installmentMonth;
		let possessionDueDate = installmentMonth;

		var dueDate = installmentMonth;
		var date1 = new Date(dueDate);
		var currentDate = date1.getDate(); // Get the current date value
		var newDate = currentDate + 10;
		date1.setDate(newDate); // Set the new date value
		console.log(date1);

		// Increment the month by 1 while keeping the same day

		var myDate = new Date(installmentMonth);
		let paymentpdf = [];

		let maxId = await InstallmentReceipts.max("IRC_NO");

		for (let i = 0; i < data?.PaymentPlan?.No_Of_Installments + 1; i++) {
			myDate.setMonth(myDate.getMonth() + 1);
			if (myDate.getMonth() === 11) {
				myDate.setFullYear(myDate.getFullYear() + 1);
			}
			console.log(myDate);
			// const date = new Date(myDate);
			// const options = { day: '2-digit', month: 'long', year: 'numeric' };
			// const Installment_Month = date.toLocaleDateString('en-US', options).replace(/ /g, '-').toLowerCase();

			sr++;
			if (sr % byAnnualTimePeriod == 0) {
				installmentType = instTypeData.find((item) => item.Name === "Bi-Annual Installment").InsType_ID;

				amount = ByAnnual_Charges;
			} else {
				installmentType = instTypeData.find((item) => item.Name === "Monthly Installment ").InsType_ID;
				// installmentType = instTypeData.find((item)=> item.Name === 'Monthly Installment').InsType_ID

				amount = installmentAmount;
			}

			// if(i==)
			if (sr == data?.PaymentPlan?.No_Of_Installments) {
				installmentType = instTypeData.find((item) => item.Name === "Ballot Installment").InsType_ID;

				amount = ballotAmt;
			} else if (sr == data?.PaymentPlan?.No_Of_Installments + 1) {
				installmentType = instTypeData.find((item) => item.Name === "Possession Installment").InsType_ID;

				amount = Possession_Amt;
			}
			date1.setMonth(date1.getMonth() + 1);
			if (date1.getMonth() === 11) {
				date1.setFullYear(date1.getFullYear() + 1);
			}
			const duedate = new Date(Date.now());

			const formattedDate = duedate.toISOString().substring(0, 10);
			console.log(formattedDate); // Output: 2022-08-01
			let createFile = {
				IRC_NO: ++maxId || 1,
				IRC_Date: formattedDate,
				INSTRUMENT_NO: "CASH RECEIVED DATED " + formattedDate,
				InsType_ID: installmentType,
				USER_ID: USER_ID,
				TIME_STAMP: Date.now(),
				LAST_UPDATE: Date.now(),
				Installment_Due: amount,
				Installment_Month: myDate
			};
			paymentpdf.push(createFile);
		}
		console.log("createFile", paymentpdf);
		return paymentpdf;
	};

	static convertToAMPM = (time) => {
		// Parse the time string into a Date object
		const parsedTime = new Date(`1970-01-01T${time}`);

		// Get the hours and minutes
		const hours = parsedTime.getHours();
		const minutes = parsedTime.getMinutes();

		// Determine whether it's AM or PM
		const period = hours >= 12 ? "PM" : "AM";

		// Convert 24-hour format to 12-hour format
		const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

		// Add leading zero to minutes if necessary
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

		// Create the formatted time string
		const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

		return formattedTime;
	};

	static storegeImage = async (image, id) => {
		const buffer = Buffer.from(image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), "base64");
		const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
		const dest = "uploads/transferImages/" + id;
		const filePath = `${dest}/${imagePath}`;
		const exists = fs.existsSync(dest);
		if (!exists) {
			fs.mkdirSync(dest, { recursive: true });
		}
		try {
			const jimResp = await Jimp.read(buffer);
			jimResp.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../../${filePath}`));
			return filePath;
		} catch (err) {
			console.log("IIIIIIIIIIIIIIII", err);
		}
	};

	static getBase64FromUrl = (url) => {
		return new Promise((resolve, reject) => {
			var img = new Image();
			img.setAttribute("crossOrigin", "anonymous");

			img.onload = () => {
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;

				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);

				var dataURL = canvas.toDataURL("image/png");

				resolve(dataURL);
			};

			img.onerror = (error) => {
				reject(error);
			};

			img.src = url;
		});
	};
}

module.exports = FileService;
