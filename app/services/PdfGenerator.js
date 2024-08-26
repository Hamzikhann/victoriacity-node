const Pdfmake = require("pdfmake");
const fs = require("fs");
const path = require("path");
const request = require("request");
const { InstallmentType, UnitType, PlotSize } = require("../models");
const { InstallmentReceipts } = require("../models");
const { Booking } = require("../models");
const { Payment_Mode } = require("../models");
const PDFDocument = require("pdfkit");
const FileService = require("./FileService");
const moment = require("moment");
const BookingService = require("./BookingService");
class pdfGenerator {
	static FileReceiptGenerator = async (body, rows) => {
		function formatTimestamp(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);

			if (!(typeof simple != "undefined" && simple == 1)) {
				// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);
				dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			}

			let timestampDay = dateFromTimeStamp.getDate();

			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			const printer = new Pdfmake(fonts);

			var data = [];
			data["invoicenumber"] = `${body?.User?.name} ${body?.User?.lastName}`;
			data["buyeraddress"] = "";
			data["item"] = "";
			data["price"] = 0;

			let dataArr = [];
			let dataArr1 = [];

			dataArr.push([
				{
					text: "Sr No",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Application No",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Category",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Application",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);

			dataArr1.push([
				{
					text: "Sr No",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Application No",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Category",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Application",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);

			for (let i = 0; i < rows.length; i++) {
				dataArr.push([
					{
						text: i + 1,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.Form_Code ? rows[i]?.Form_Code : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.UnitType?.Name ? rows[i]?.UnitType?.Name : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.PlotSize?.Size_Marla ? rows[i]?.PlotSize?.Size_Marla + " Marla" : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					}
				]);

				dataArr1.push([
					{
						text: i + 1,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.Form_Code ? rows[i]?.Form_Code : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.UnitType?.Name ? rows[i]?.UnitType?.Name : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${rows[i]?.PlotSize?.Size_Marla ? rows[i]?.PlotSize?.Size_Marla + " Marla" : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					}
				]);
			}

			let marginSign = 28;

			if (rows.length == 1) {
				marginSign = 78;
			} else if (rows.length == 2) {
				marginSign = 58;
			} else if (rows.length == 3) {
				marginSign = 48;
			} else if (rows.length == 4) {
				marginSign = 38;
			}

			// dataArr1 = dataArr;

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "File Submission Receipt",
								fontSize: 12,
								decoration: "underline",
								bold: true,
								margin: [0, 36, 0, 0]
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},

							// 2nd Heading with below sub-heading
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: FSRC-${body?.FileSubmission?.FSRC_Code}`,
										bold: true,
										fontSize: 10,
										margin: [0, 10, 50, 0]
									},
									{
										text: `Processing Fee: ${body?.FileSubmission?.FileSub_Fee_Amt}`,
										bold: true,
										fontSize: 10,
										margin: [0, 4, 50, 0]
									}
								],

								alignment: "right"
							}
						]
					},

					// Horizontal Line
					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 25,
										y1: 97,
										x2: 570,
										y2: 97,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},

					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 570,
										y2: 25,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 820,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 25,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 570,
										y1: 25,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									}
								]
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 110 },
						alignment: "center"
					},
					// Details Section
					{
						columns: [
							// Name
							{
								width: "41%",
								fontSize: 10,
								text: [
									{
										text: "Name : " + `${body?.FileSubmission?.Name || ""}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "38%",
								fontSize: 10,
								text: [
									{
										text: "CNIC No : " + `${body?.FileSubmission?.CNIC ? body?.FileSubmission?.CNIC : ""}`,
										bold: true
									}
								],
								alignment: "center",
								margin: [25, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "16%",
								fontSize: 11,
								text: "Customer Copy",
								alignment: "right",
								decoration: "underline",
								bold: true,
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 20, 0, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "48.3%",
								fontSize: 10,
								text: [
									{
										text:
											"Date : " + `${body?.FileSubmission?.Date ? formatTimestamp(body?.FileSubmission?.Date, 0) : ""}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "50%",
								fontSize: 10,
								text: [
									{
										text:
											"Delivery Date : " +
											`${
												body?.FileSubmission?.Doc_Delivery_Date
													? formatTimestamp(body?.FileSubmission?.Doc_Delivery_Date, 0)
													: ""
											} (Tentative)`,
										bold: true
									}
								],
								alignment: "left",
								margin: [11, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "34%",
								fontSize: 10,
								text: [
									{
										text: "Mobile No : " + `${body?.FileSubmission?.Mobile ? body?.FileSubmission?.Mobile : ""}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "38%",
								fontSize: 10,
								text: [
									{
										text:
											"Delivery Time : " +
											`${
												body?.FileSubmission?.DD_Time ? FileService.convertToAMPM(body?.FileSubmission?.DD_Time) : ""
											}`,
										bold: true
									}
								],
								alignment: "right",
								margin: [0, 0, 6, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "27%", "27%", "27%"],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					// Terms & Conditions Section
					{
						text: "Terms & Condition:",
						bold: true,
						fontSize: 9,
						margin: [10, 5, 0, 5]
					},
					{
						ul: [
							{
								text: "In case any or all forms turn out to be fake; all deposits made shall be forfeited.",
								margin: [20, 0, 0, 0],
								fontSize: 9,
								lineHeight: 1.1
							},
							{
								text: "Original Submission Receipt shall be produced to receive files, without which no files shall be delivered.",
								margin: [20, 0, 0, 0],
								fontSize: 9,
								lineHeight: 1.1
							}
						]
					},
					{
						text: "Contact No: 03-111-444-274 | 0800-18888",
						bold: true,
						margin: [33, 2, 0, 0],
						fontSize: 9
						// lineHeight: 1.2
					},
					// Signature Section
					{
						columns: [
							{
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 0,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "left",
										margin: [5, 0, 0, 8]
									},
									{
										// absolutePosition: { x: 50, y: 350 },
										text: `Applicant (${body?.FileSubmission?.Name || ""})`,
										alignment: "left",
										fontSize: 11,
										bold: true,
										margin: [20, 5, 0, 0]
									}
								],
								alignment: "left"
							},
							{
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 10,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "center",
										margin: [15, 0, 0, 8]
									},
									{
										text: body?.User?.name + " (" + body?.User?.lastName + ")",
										alignment: "center",
										fontSize: 11,
										bold: true,
										margin: [10, 5, 0, 0]
									}
								],
								alignment: "right"
							}
						],
						margin: [0, marginSign, 0, 0]
					},

					//hillo
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 5, 0, 0]
					},
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 15, 0, 10]
					},

					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "File Submission Receipt",
								fontSize: 12,
								decoration: "underline",
								bold: true,
								margin: [5, 36, 0, 0]
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},
							// 2nd Heading with below sub-heading
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: FSRC-${body?.FileSubmission?.FSRC_Code}`,
										bold: true,
										fontSize: 10,
										margin: [0, 10, 50, 0]
									},
									{
										text: `Processing Fee: ${body?.FileSubmission?.FileSub_Fee_Amt}`,
										bold: true,
										fontSize: 10,
										margin: [0, 4, 50, 0]
									}
								],

								alignment: "right"
							}
						]
					},
					// Horizontal Line
					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -15,
										y1: 10,
										x2: 529,
										y2: 10,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 410 },
						alignment: "center"
					},
					// Details Section
					{
						columns: [
							// Name
							{
								width: "41%",
								fontSize: 10,
								text: [
									{
										text: "Name : " + `${body?.FileSubmission?.Name || ""}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "38%",
								fontSize: 10,
								text: [
									{
										text: "CNIC No : " + `${body?.FileSubmission?.CNIC ? body?.FileSubmission?.CNIC : ""}`,
										bold: true
									}
								],
								alignment: "center",
								margin: [25, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "13%",
								fontSize: 11,
								text: "Office Copy",
								alignment: "right",
								decoration: "underline",
								bold: true,
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 20, 0, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "48.3%",
								fontSize: 10,
								text: [
									{
										text:
											"Date : " + `${body?.FileSubmission?.Date ? formatTimestamp(body?.FileSubmission?.Date, 0) : ""}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "50%",
								fontSize: 10,
								text: [
									{
										text:
											"Delivery Date : " +
											`${
												body?.FileSubmission?.Doc_Delivery_Date
													? formatTimestamp(body?.FileSubmission?.Doc_Delivery_Date, 0)
													: ""
											} (Tentative)`,
										bold: true
									}
								],
								alignment: "left",
								margin: [11, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "48.3%",
								fontSize: 10,
								text: [
									{
										text: "Mobile No : " + `${body?.FileSubmission?.Mobile ? body?.FileSubmission?.Mobile : ""} `,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text:
											"Delivery Time : " +
											`${
												body?.FileSubmission?.DD_Time ? FileService.convertToAMPM(body?.FileSubmission?.DD_Time) : ""
											}`,
										bold: true
									}
								],
								margin: [11, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "27%", "27%", "27%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					// Terms & Conditions Section
					{
						text: "Terms & Condition:",
						bold: true,
						fontSize: 9,
						margin: [10, 5, 0, 5]
					},
					{
						ul: [
							{
								text: "In case any or all forms turn out to be fake; all deposits made shall be forfeited.",
								margin: [20, 0, 0, 0],
								fontSize: 10,
								lineHeight: 1.1
							},
							{
								text: "Original Submission Receipt shall be produced to receive files, without which no files shall be delivered.",
								margin: [20, 0, 0, 0],
								fontSize: 10,
								lineHeight: 1.1
							}
						]
					},
					{
						text: "Contact No: 03-111-444-274 | 0800-18888",
						bold: true,
						margin: [33, 2, 0, 0],
						fontSize: 9
						// lineHeight: 1.2
					},
					// Signature Section
					{
						columns: [
							{
								absolutePosition: { x: 40, y: 705 },
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 0,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "left",
										margin: [5, 70, 0, 8]
									},
									{
										// absolutePosition: { x: 70, y: 780 },
										text: `Applicant (${body?.FileSubmission?.Name || ""})`,
										alignment: "left",
										fontSize: 11,
										bold: true,
										margin: [20, 5, 0, 0]
									}
								],
								alignment: "left"
							},
							{
								absolutePosition: { x: 290, y: 705 },
								width: "50%",
								stack: [
									{
										canvas: [
											{
												// absolutePosition: { x: 290, y: 580 },
												type: "line",
												x1: 10,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "center",
										margin: [10, 70, 0, 8]
									},
									{
										// absolutePosition: { x: 270, y: 780 },
										text: body?.User?.name + " (" + body?.User?.lastName + ")",
										alignment: "center",
										fontSize: 11,
										bold: true,
										margin: [0, 5, 0, 0]
									}
								],
								alignment: "right"
							}
						],
						margin: [0, 40, 0, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			let fullName = data?.invoicenumber;
			let username = fullName.replace(/\s/g, "").toLowerCase();
			const filePath = "uploads/fileReceipt/" + `FileSubReceipt-FSRC-${body.FileSubmission.FSRC_Code}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			return "";
			// return error;
			// console.log('error==========', error)
		}
	};

	static acknowlegmentLetterGenerator = async (body, user) => {
		try {
			var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
			var currentDate = new Date();
			var year = currentDate.getFullYear();
			var month = monthsArr[currentDate.getMonth() + 1]; // Months are zero-based, so we add 1
			var day = currentDate.getDate();

			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var params = process.argv;
			var data = [];
			data["invoicenumber"] = body?.Member?.BuyerName;
			data["buyeraddress"] = "";
			data["item"] = "";
			data["price"] = 0;

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					// {
					//   columns: [
					//     // {
					//     //   width: "53%",
					//     //   stack: [
					//     //     {
					//     //       columns: [
					//     //         {
					//     //           width: "33%",
					//     //           text: "",
					//     //           fontSize: 12,
					//     //           //   margin:[0,10,0,0]
					//     //         },
					//     //       ],
					//     //     },
					//     //     // Booking Details Section
					//     //     {
					//     //       text: [
					//     //         { text: "Member Name : ", bold: true },
					//     //         `${body?.Member?.BuyerName}`,
					//     //       ],
					//     //       margin: [0, 10, 0, 0],
					//     //     },
					//     //     {
					//     //       text: [
					//     //         { text: "CNIC : ", bold: true },
					//     //         `${body?.Member?.BuyerCNIC}`,
					//     //       ],
					//     //       margin: [0, 10, 0, 0],
					//     //     },
					//     //     {
					//     //       text: `${body?.Member?.PermanantAddress}`,
					//     //       margin: [0, 10, 0, 0],
					//     //     },
					//     //   ],

					//     //   alignment: "left",
					//     //   fontSize: 12,
					//     // },
					//     // Registration column
					//     // {
					//     //   width: "13%",
					//     //   text: "",
					//     //   alignment: "center",
					//     //   fontSize: 12,
					//     // },
					//     // Booking column
					//     // {
					//     //   width: "33%",
					//     //   stack: [
					//     //     {
					//     //       columns: [
					//     //         {
					//     //           width: "75%",
					//     //           text: "",
					//     //           bold: true,
					//     //         },
					//     //       ],
					//     //     },
					//     //     // Booking Details Section
					//     //     {
					//     //       text: [
					//     //         {
					//     //           text: "Printing Date : ",
					//     //           bold: true,
					//     //         },
					//     //         {
					//     //           text: `${day + "-" + month + "-" + year}`,
					//     //           bold: true,
					//     //         },
					//     //       ],
					//     //       fontSize: 10,
					//     //       margin: [0, 5, 43, 0],
					//     //     },
					//     //     // Table Section
					//     //     {
					//     //       table: {
					//     //         headerRows: 1,
					//     //         widths: ["50%", "50%"],
					//     //         body: [
					//     //           // Table Data Rows
					//     //           [
					//     //             {
					//     //               text: "Registration No",
					//     //               bold: true,
					//     //               alignment: "left",
					//     //               fontSize: 10,
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //             {
					//     //               text: `${body?.Reg_Code_Disply}`,
					//     //               fontSize: 10,
					//     //               alignment: "left",
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //           ],
					//     //           // [
					//     //           //   {
					//     //           //     text: `${
					//     //           //       body?.Phase?.NAME +
					//     //           //       " ( " +
					//     //           //       body?.Sector?.NAME +
					//     //           //       ")"
					//     //           //     }`,
					//     //           //     bold: true,
					//     //           //     alignment: "center",
					//     //           //     fontSize: 10,
					//     //           //     colSpan: 2,
					//     //           //     bold: true,
					//     //           //     border: [true, true, true, true],
					//     //           //     borderColor: " #91CBFF",
					//     //           //   },
					//     //           //   {}, // Empty cell to span the entire row
					//     //           // ],
					//     //           [
					//     //             {
					//     //               text: "Category",
					//     //               bold: true,
					//     //               alignment: "left",
					//     //               fontSize: 10,
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //             {
					//     //               text: `${body?.UnitType?.Name}`,
					//     //               fontSize: 10,
					//     //               alignment: "left",
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //           ],
					//     //           [
					//     //             {
					//     //               text: "Application For",
					//     //               bold: true,
					//     //               alignment: "left",
					//     //               fontSize: 10,
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //             {
					//     //               text: `${body?.PlotSize?.Size_Marla + " Marla"}`,
					//     //               fontSize: 10,
					//     //               alignment: "left",
					//     //               border: [true, true, true, true],
					//     //               borderColor: " #91CBFF",
					//     //             },
					//     //           ],
					//     //         ],
					//     //       },

					//     //       // Margin top for the table
					//     //       margin: [0, 5, 0, 0],
					//     //     },
					//     //   ],

					//     //   alignment: "right",
					//     //   fontSize: 12,
					//     // },
					//   ],
					//   margin: [0, 80, 0, 0],
					// },

					{
						width: "40%",
						columns: [
							{
								width: "100%",
								stack: [
									{
										columns: [
											{
												width: "75%",
												text: "",
												bold: true
											}
										]
									},
									// Booking Details Section
									{
										text: [
											{
												text: "Printing Date : ",
												bold: true
											},
											{
												text: `${day + "-" + month + "-" + year}`,
												bold: true
											}
										],
										fontSize: 10,
										margin: [0, 5, 43, 0]
									},
									// Table Section
									{
										table: {
											headerRows: 1,
											widths: ["50%", "50%"],
											body: [
												// Table Data Rows
												[
													{
														text: "Registration No",
														bold: true,
														alignment: "left",
														fontSize: 10,
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													},
													{
														text: `${body?.Reg_Code_Disply}`,
														fontSize: 10,
														alignment: "left",
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													}
												],
												// [
												//   {
												//     text: `${
												//       body?.Phase?.NAME +
												//       " ( " +
												//       body?.Sector?.NAME +
												//       ")"
												//     }`,
												//     bold: true,
												//     alignment: "center",
												//     fontSize: 10,
												//     colSpan: 2,
												//     bold: true,
												//     border: [true, true, true, true],
												//     borderColor: " #91CBFF",
												//   },
												//   {}, // Empty cell to span the entire row
												// ],
												[
													{
														text: "Category",
														bold: true,
														alignment: "left",
														fontSize: 10,
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													},
													{
														text: `${body?.UnitType?.Name}`,
														fontSize: 10,
														alignment: "left",
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													}
												],
												[
													{
														text: "Application For",
														bold: true,
														alignment: "left",
														fontSize: 10,
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													},
													{
														text: `${body?.PlotSize?.Size_Marla + " Marla"}`,
														fontSize: 10,
														alignment: "left",
														border: [true, true, true, true],
														borderColor: " #91CBFF"
													}
												]
											]
										},

										// Margin top for the table
										margin: [0, 5, 0, 0]
									}
								],

								alignment: "right",
								fontSize: 12
							}
						],
						margin: [320, 40, 0, 0]
					},

					{
						width: "100%",
						columns: [
							{
								width: "53%",
								stack: [
									{
										columns: [
											{
												width: "33%",
												text: "",
												fontSize: 12
												//   margin:[0,10,0,0]
											}
										]
									},
									// Booking Details Section
									{
										text: [{ text: "Member Name : ", bold: true }, `${body?.Member?.BuyerName}`],
										margin: [0, 10, 0, 0]
									},
									{
										text: [{ text: "CNIC : ", bold: true }, `${body?.Member?.BuyerCNIC}`],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.Member?.PermanantAddress}`,
										margin: [0, 10, 0, 0]
									}
								],

								alignment: "left",
								fontSize: 12
							},
							{
								width: "50%",
								stack: [
									{
										text: body?.SecondMember?.BuyerName
											? [
													{
														text: [{ text: "Member Name : ", bold: true }, `${body?.SecondMember?.BuyerName}`]
													}
											  ]
											: "",
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: body?.SecondMember?.BuyerCNIC
													? [{ text: "CNIC : ", bold: true }, `${body?.SecondMember?.BuyerCNIC}`]
													: ""
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.SecondMember?.BuyerAddress || ""}`,
										margin: [0, 10, 0, 0]
									}
								],

								alignment: "left",
								fontSize: 12,
								margin: [50, 0, 0, 0]
							}
						],
						margin: [0, 10, 0, 0]
					},

					{
						text: "Subject: Acknowledgment Letter for Booking Application (" + body.Reg_Code_Disply + ")",
						//   alignment: 'center',
						margin: [0, 45, 0, 0],
						fontSize: 12,
						bold: true
					},
					{
						text: "Dear Valued Member",
						margin: [0, 23, 0, 0],
						fontSize: 12,
						bold: true
					},
					{
						text: `The Management is pleased to inform that the above mentioned application for booking has
                been received subject to the terms and conditions as mentioned on the booking Application and
                those which may be enforced in future by the Management of Victoria Estates Private Limited or
                any authority/entity competent to do so.

                Please keep this Acknowledgement letter and the certified copy of the Booking Application Form
                In safe custody for all future correspondence.

                Assuring you the best services and co-operation`,
						margin: [0, 23, 0, 0],
						fontSize: 11,
						lineHeight: 1.5
						//   bold:true,
					},
					{
						text: "Regards",
						margin: [0, 23, 0, 0],
						fontSize: 12,
						bold: true
					},
					{
						text: "Lt.Col. Anwer Mahmood",
						margin: [0, 80, 0, 0],
						fontSize: 11
					},
					{
						text: "Society Administrator",
						margin: [0, 23, 0, 0],
						fontSize: 12,
						bold: true
					},
					{
						text:
							`(For any discrepancy, please contact this office within 15 days from the Printing date)

                Generated By: ` +
							(body?.User?.name + " " + body?.User?.lastName),
						margin: [0, 23, 0, 0],
						fontSize: 11
					}
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

			const filePath = "uploads/acknowlegmentLetters/" + `VC-Acknowlegment-Letter-` + body.BK_ID + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", error);
		}
	};

	static paymentPlanGenerator = async (
		bookingData,
		insRecpData,
		installmentReceipt,
		receipt_head,
		TRSData,
		devInsReceipts
	) => {
		const installmentTypes = await InstallmentType.findAll({ raw: true });
		let plotType = "Normal";
		let percentage = 0;
		if (bookingData?.Location_ID) {
			plotType = bookingData?.Location?.Plot_Location;
			percentage = bookingData?.Location.Percentage;
		}

		let array1 = [
			{
				text: "Sr No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Type",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Month",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Due Date",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Amount",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];
		let array6 = [
			{
				text: "Sr No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Type",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Month",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Due Date",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Amount",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];
		let array4 = [
			{
				text: "Location",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Percentage",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Total Amount To be Paid",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];

		let array2;
		let array7;
		let headingText, lastHeading;
		if (receipt_head) {
			headingText = "Payment Schedule of Remaining Cost of Land (COL) ";
			lastHeading = "Total Remaining Amount";
		} else {
			headingText = "Payment Schedule (Cost of Land)";
			lastHeading = "Total Installment Amount ";
		}
		function formatTimestamp(timestamp, simple) {
			let dateFromTimeStamp = ("" + timestamp).split("T")[0]; //new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			let timestampMonth;
			let timestampDay;
			let timestampYear;

			if (simple == 1) {
				dateFromTimeStamp = dateFromTimeStamp.split("-");
				timestampDay = dateFromTimeStamp[2];
				timestampMonth = monthsArr[parseInt(dateFromTimeStamp[1])];
				timestampYear = dateFromTimeStamp[0];
			} else {
				dateFromTimeStamp = dateFromTimeStamp.split(" ");
				timestampMonth = dateFromTimeStamp[1];
				timestampDay = dateFromTimeStamp[2];
				timestampYear = dateFromTimeStamp[3];
			}

			if (typeof timestampDay == "undefined") {
				return "";
			}
			return `${timestampDay}-${timestampMonth}-${timestampYear}`;
		}

		let arr = [];
		let arr1 = [];
		let arr2 = [];
		arr.push(array1);
		arr1.push(array4);
		arr2.push(array6);
		let total = 0;
		let totalRemaining = 0;
		let remainingTotal = 0;
		insRecpData.map(async (item, i) => {
			let remaining = 0;
			let remi = +item.Installment_Due;
			let rem = +item.Installment_Due;
			total += +item.Installment_Due;
			const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
			if (receipt_head) {
				const filterIns = installmentReceipt.filter((el) => el.BKI_DETAIL_ID == item.BKI_DETAIL_ID);
				remaining = filterIns.reduce((total, ins) => total + ins.Remaining_Amount, 0);

				for (let h = 0; h < filterIns.length; h++) {
					remi = remi - filterIns[h].Installment_Paid;
				}
				remainingTotal += remi;
				if (remaining) {
					totalRemaining += +remaining;
				} else {
					totalRemaining += +rem;
				}
			}

			const Installment_Month = formatTimestamp(item.Installment_Month, 1);
			const Due_Date = formatTimestamp(item.Due_Date, 1);

			array2 = [
				{
					text: `${i + 1}`,
					alignment: "center",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${insType && insType.Name ? insType.Name : ""}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${Installment_Month}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${Due_Date}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					// text: `${item.Installment_Due - parseFloat(remaining)}`,
					text: remi,
					alignment: "right",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];
			arr.push(array2);
		});
		let totalAmount = 0;
		devInsReceipts.map(async (item, i) => {
			let remaining = 0;
			let remi = +item.Installment_Due;
			let rem = +item.Installment_Due;
			totalAmount = totalAmount + remi;
			// total += +item.Installment_Due;
			const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
			// if(receipt_head){
			//   const filterIns = installmentReceipt.filter((el)=> el.BKI_DETAIL_ID == item.BKI_DETAIL_ID)
			//   remaining = filterIns.reduce((total, ins) => total + ins.Remaining_Amount, 0);

			//   for(let h = 0;h<filterIns.length;h++) {
			//     remi = remi - filterIns[h].Installment_Paid;
			//   }
			//   remainingTotal += remi
			//   if(remaining){
			//     totalRemaining += +remaining
			//   }else{
			//     totalRemaining += +rem
			//   }
			// }

			const Installment_Month = formatTimestamp(item.Installment_Month, 1);
			const Due_Date = formatTimestamp(item.Due_Date, 1);

			array7 = [
				{
					text: `${i + 1}`,
					alignment: "center",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${insType && insType.Name ? insType.Name : ""}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${Installment_Month}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${Due_Date}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					// text: `${item.Installment_Due - parseFloat(remaining)}`,
					text: remi,
					alignment: "right",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];
			arr2.push(array7);
		});
		let array3 = [
			{
				text: "",
				alignment: "center",
				fontSize: 8,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				fontSize: 8,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${lastHeading}`,
				bold: true,
				alignment: "right",
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${receipt_head ? remainingTotal : total}`,
				alignment: "right",
				bold: true,
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		let array8 = [
			{
				text: "",
				alignment: "center",
				fontSize: 8,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				fontSize: 8,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Total Installment Amount",
				bold: true,
				alignment: "right",
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${totalAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 12,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		arr.push(array3);
		arr2.push(array8);
		let array5 = [
			{
				text: `${plotType}`,
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: `${percentage > 0 ? percentage : ""}`,
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: `${(percentage / 100) * +bookingData.Total_Amt > 0 ? (percentage / 100) * +bookingData.Total_Amt : ""}`,
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];
		arr1.push(array5);

		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			// console.log("arr",arr)

			const printer = new Pdfmake(fonts);
			// console.log("bookingData",insRecpData[0].INS_RC_ID)
			// console.log("insRecpData",insRecpData)

			var params = process.argv;
			var data = [];
			data["invoicenumber"] = `${TRSData ? TRSData?.Member?.BuyerName : bookingData?.Member?.BuyerName}`;
			data["buyeraddress"] = "KJKAJSKJSKAJSKAJSKA";
			data["item"] = "JKAHKHSJKAHSA";
			data["price"] = 120;

			if (!bookingData.PaymentPlan.IncludeLC) {
				arr1 = [
					array4,
					[
						{
							text: "Location Charges Are Inclusive of Cost of Land",
							alignment: "center",
							fontSize: 9,
							border: [true, true, true, true],
							borderColor: " #91CBFF",
							colSpan: array4.length
						}
					]
				];
			}
			if (!bookingData.PaymentPlan.IncludeDC) {
				arr2 = [
					array6,
					[
						{
							text: "Development Charges Are Inclusive of Cost of Land",
							alignment: "center",
							fontSize: 9,
							border: [true, true, true, true],
							borderColor: " #91CBFF",
							colSpan: array6.length
						}
					]
				];
			}

			var docDefinition = {
				pageSize: {
					width: 610, // Change this value to your desired width in points (1 inch = 72 points)
					height: 940 // Keep the height as per your requirement, here it's the default A4 height
				},
				pageMargins: [25, 230, 25, 150],
				header: {
					columns: [
						{
							width: "40%",
							stack: [
								// Booking Details Section

								{
									text: [
										{ text: "Name: ", bold: true },
										`${TRSData ? TRSData?.Member?.BuyerName : bookingData?.Member?.BuyerName}`
									],
									margin: [40, 30, 0, 0],
									bold: true
								},
								{
									text: [
										{ text: "CNIC: ", bold: true },
										`${TRSData ? TRSData?.Member?.BuyerCNIC : bookingData?.Member?.BuyerCNIC}`
									],
									margin: [40, 5, 0, 0]
								},
								{
									text: `${TRSData ? TRSData?.Member?.PermanantAddress : bookingData?.Member?.PermanantAddress}`,
									margin: [40, 5, 0, 5]
								}
							],

							alignment: "left",
							fontSize: 11
						},
						// Registration column
						{
							width: "30%",
							text: [{ text: "Registration No : ", bold: true }, `${"" + bookingData?.Reg_Code_Disply}`],
							bold: true,
							alignment: "left",
							fontSize: 11,
							margin: [-15, 15, 0, 0]
						},
						// Booking column
						{
							width: "41%",

							stack: [
								{
									columns: [
										{
											width: "75%",
											text: "Booking Application for ",
											fontSize: 11,
											bold: true,
											margin: [-50, 30, 0, 0]
										},
										{
											width: "75%",
											height: "200px",
											text: ""
										}
									]
								},
								{
									absolutePosition: { x: 35, y: 50 },
									canvas: [
										{
											type: "line",
											x1: 357,
											y1: 75,
											x2: 520,
											y2: 75,
											lineWidth: 1,
											lineColor: "black"
										},
										{
											type: "line",
											x1: 357,
											y1: 75,
											x2: 357,
											y2: 110,
											lineWidth: 1,
											lineColor: "black"
										},
										{
											type: "line",
											x1: 357,
											y1: 110,
											x2: 520,
											y2: 110,
											lineWidth: 1,
											lineColor: "black"
										},
										{
											type: "line",
											x1: 520,
											y1: 75,
											x2: 520,
											y2: 110,
											lineWidth: 1,
											lineColor: "black"
										}
									]
								},

								{
									text: [{ text: "Category : " }, `${bookingData?.UnitType?.Name}`],
									margin: [-50, 5, 0, 0],
									bold: true,
									fontSize: 9
								},
								{
									text: [
										{
											text: `Application for : ${bookingData?.PlotSize?.Name}`,
											bold: true,
											fontSize: 9
										}
									],
									margin: [-50, 5, 50, 0]
								}
							],

							alignment: "left",
							fontSize: 8,
							margin: [20, 0, 0, 0]
						},
						{
							absolutePosition: { x: 35, y: 50 },
							width: "100%",
							stack: [
								{
									absolutePosition: { x: 35, y: 50 },
									canvas: [
										{
											type: "line",
											x1: 5,
											y1: 155,
											x2: 527,
											y2: 155,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 527,
											y1: 160,
											x2: 5,
											y2: 160,
											lineWidth: 0.5,
											lineColor: "grey"
										}
									]
								}
							]
						}
					],
					margin: [0, 80, 0, 30]
				},

				// footer: {
				//   columns: [
				//     {
				//       // width: '50%',
				//       stack: [
				//         {
				//           canvas: [
				//             {
				//               type: "line",
				//               x1: 0,
				//               y1: 0,
				//               x2: 140,
				//               y2: 0,
				//               lineWidth: 0.8,
				//             },
				//           ],
				//           alignment: "right",
				//           margin: [20, 50, 20, 0],
				//         },
				//         {
				//           text: "Applicant",
				//           alignment: "right",
				//           fontSize: 12,
				//           bold: true,
				//           margin: [0, 10, 100, 0],
				//         },
				//       ],

				//       // alignment: 'right'
				//     },
				//   ],
				// },

				footer: {
					columns: [
						{
							width: "100%",
							stack: [
								{
									canvas: [
										{
											type: "line",
											x1: 0,
											y1: 0,
											x2: 140,
											y2: 0,
											lineWidth: 0.8
										}
									],
									alignment: "right",
									margin: [20, 50, 20, 0]
								},
								{
									text: "Applicant",
									alignment: "right",
									fontSize: 12,
									bold: true,
									margin: [0, 10, 100, 0]
								},
								{
									text: "Disclaimer: This is a system generated document, no signatures required. Possibility of error is not precluded and is subject to correction. This Statement is only for information purposes and is not a proof of ownership or payments.",
									alignment: "left",
									fontSize: 9,
									bold: false,
									margin: [75, 20, 70, 0]
								}
							]
							// stack: [

							// ],
							// alignment: 'right'
						}
						// {
						//   width: "100%",

						//   // alignment: "center",
						// },
					],

					margin: [0, 0, 0, 8]
				},

				// playground requires you to assign document definition to a variable called dd
				// margin:[0,600,0,0],
				content: [
					// Add two horizontal lines below the content

					{
						text: `${headingText}`,
						alignment: "center",
						margin: [0, 10, 0, 0],
						fontSize: 12,
						bold: true
					},
					// Table Section
					{
						table: {
							headerRows: 1,

							widths: ["8%", "25%", "25%", "20%", "20%"],
							body: arr
						},

						// Margin top for the table
						margin: [50, 10, 50, 0],
						alignment: "center"
					},
					{
						text: "Location Charges",
						alignment: "center",
						fontSize: 14,
						bold: true,
						margin: !bookingData.PaymentPlan.IncludeDC ? [20, 20, 0, 0] : [-120, 20, 0, 0]
					},
					{
						table: {
							headerRows: 1,
							widths: !bookingData.PaymentPlan.IncludeLC ? ["33%", "33%", "34%"] : ["26%", "27%", "27%"],
							body: arr1
						},

						// Margin top for the table
						margin: [50, 2, 55, 0],
						alignment: "center"
					},
					{
						text: "Development Charges",
						alignment: "center",
						margin: !bookingData.PaymentPlan.IncludeDC ? [20, 60, 0, 5] : [-120, 60, 0, 5],
						fontSize: 12,
						bold: true
					},
					{
						table: {
							headerRows: 1,

							widths: !bookingData.PaymentPlan.IncludeDC
								? ["25%", "25%", "30%", "25%", "25%"]
								: ["8%", "25%", "25%", "20%", "20%"],
							body: arr2
						},

						// Margin top for the table
						margin: [50, 0, 150, 0],
						alignment: "center"
					}
					// Signature Section
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};
			// let fullName = data?.invoicenumber;
			// let username = fullName.replace(/\s/g, '').toLowerCase();
			// create invoice and save it to invoices_pdf folder
			// console.log("username", username)
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/paymentPlan/VC-Payment-Plan" + bookingData.BK_ID + ".pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			// console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", error)
		}
	};

	static statementGenerator = async (bookingData, insRecpData, dcInsRecpData, installmentPaidReceipts) => {
		const PaymentModes = await Payment_Mode.findAll({ raw: true });
		const installmentTypes = await InstallmentType.findAll({ raw: true });
		const installmentReceipts = await InstallmentReceipts.findAll({
			where: { BK_ID: bookingData.BK_ID },
			raw: true
		});
		var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
		var currentDate = new Date();
		var year = currentDate.getFullYear();
		var month = monthsArr[currentDate.getMonth() + 1]; // Months are zero-based, so we add 1

		var day = currentDate.getDate();

		var formattedDate = `${day}-${month}-${year}`;

		let totalAmount = 0;
		let paidAmount = 0;
		let dcTotalAmount = 0;
		let dcPaidAmount = 0;

		let newArray = [
			{
				text: "Name",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Registration No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Category",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Plot No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Block",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Application For",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];

		let arrHeader = [];
		// Add the new table header to the beginning of the array

		// Populate the new table data
		const arrayNewTableData = [
			{
				text: `${bookingData?.Member?.BuyerName ? bookingData?.Member?.BuyerName : "NIL"}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.Reg_Code_Disply}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.UnitType?.Name}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.Unit?.Plot_No ? bookingData?.Unit?.Plot_No : "NIL"}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.Unit?.Block?.Name ? bookingData?.Unit?.Block.Name : "NIL"}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.PlotSize?.Name}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		arrHeader.push(newArray);
		arrHeader.push(arrayNewTableData);
		let array1 = [
			// {
			// 	text: "SrNo",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	bold: true,
			// 	fillColor: "#D3D3D3",
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Installment Type/Month",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			// {
			// 	text: "Installment Month",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	bold: true,
			// 	fillColor: "#D3D3D3",
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "IRC No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Payment Mode",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Paid Date",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Instrument Descrip",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Due",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Paid",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Remaining",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "SurCharges",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];
		let array = [
			{
				text: "SrNo",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Type",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Month",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "IRC No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Payment Mode",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Paid Date",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Instrument Descrip",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Due",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Paid",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Remaining",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];

		function formatTimestamp(timestamp, simple) {
			let dateFromTimeStamp = ("" + timestamp).split("T")[0]; //new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
			if (!dateFromTimeStamp) {
				dateFromTimeStamp = ("" + timestamp).split(" ")[0];
			}

			let timestampMonth;
			let timestampDay;
			let timestampYear;

			if (simple == 1) {
				dateFromTimeStamp = dateFromTimeStamp.split("-");
				timestampDay = dateFromTimeStamp[2];
				timestampMonth = monthsArr[parseInt(dateFromTimeStamp[1])];
				timestampYear = dateFromTimeStamp[0];
			} else {
				dateFromTimeStamp = dateFromTimeStamp.split(" ");
				timestampMonth = dateFromTimeStamp[1];
				timestampDay = dateFromTimeStamp[2];
				timestampYear = dateFromTimeStamp[3];
			}
			if (timestampMonth && timestampDay && timestampYear) {
				return `${timestampDay}-${timestampMonth}-${timestampYear}`;
			}
			return "";
		}
		function formatTimestampf(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);

			if (!(typeof simple != "undefined" && simple == 1)) {
				// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);
				dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			}

			let timestampDay = dateFromTimeStamp.getDate();

			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}

		let array2;
		let array3;
		let array4;
		let array5;
		let array7;
		let array8;
		let array9;
		let array10;

		let arrayTotalSurCharge;
		let arrayRemainingSurCharge;
		let arrayPendingSurCharge;
		let remain = 0;

		let arr = [];
		let arr6 = [];
		arr.push(array1);
		arr6.push(array);

		var remainingOst = 0;
		let tillDatePaidAmt = 0;
		let remainingPaidOstBreak = 0;
		var remainingOstBreak = 0;
		let inc = 0;
		let totalAmounts = 0;
		var totalSurchagreAmounts = 0;
		let ostamtnew = await BookingService.outStandingAmount(bookingData.BK_ID);
		var dcRemainingOst = 0;
		let dcTillDatePaidAmt = 0;
		let dcRemainingPaidOstBreak = 0;
		var dcRemainingOstBreak = 0;
		let dcInc = 0;
		let dcTotalAmounts = 0;
		let dcOstamtnew = await BookingService.outStandingAmount(bookingData.BK_ID, "DC");
		insRecpData.map(async (item, i) => {
			totalAmounts += +item.Installment_Due;
			const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
			const IR = installmentReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const PaidR = installmentPaidReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const paymentMode = PaymentModes.find((el) => el.PMID == IR?.PMID);
			if (typeof IROBJECTS[k] != null || typeof IROBJECTS[k] != undefined) {
				totalSurchagreAmounts = totalSurchagreAmounts + IROBJECTS[k]?.surCharges;
			}

			const FormatedStampDate = formatTimestampf(item.IRC_Date, 1);
			const FormatedMonth = formatTimestamp(item.Installment_Month, 1);

			const instDay = parseInt(item.Due_Date ? item.Due_Date.split("-")[2] : "");
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
			// console.log('FormatedStampDate', FormatedStampDate);
			let paidAmt = item.Installment_Paid;
			let totalPaidAmt = 0;
			for (var k = 0; k < IROBJECTS.length; k++) {
				totalPaidAmt += IROBJECTS[k].Installment_Paid;
			}

			remain += item.Installment_Due - item.Installment_Paid;

			if (remainingOstBreak == 0) {
				remainingOst += +item.Installment_Due;
				// tillDatePaidAmt += +PaidR.Installment_Paid
			}

			if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 1;
			}

			if (IROBJECTS.length == 0) {
				if (PaidR) {
					paidAmt = PaidR.Installment_Paid;
				}

				totalAmount += +item.Installment_Due;
				paidAmount += +paidAmt;
				// remain = totalAmount - paidAmount;

				array2 = [
					// {
					// 	text: `${++inc}`,
					// 	alignment: "left",
					// 	fontSize: 9,
					// 	border: [true, true, true, true],
					// 	borderColor: " #91CBFF"
					// },
					{
						text: `${++inc} - ${insType?.Name || ""} - ${FormatedMonth}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					// {
					// 	text: `${FormatedMonth}`,
					// 	fontSize: 8,
					// 	border: [true, true, true, true],
					// 	borderColor: " #91CBFF"
					// },
					{
						text: `${IR ? "VCIRC-" + IR.IRC_NO : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paymentMode ? paymentMode.Description : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? FormatedStampDate : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? IR.INSTRUMENT_NO : ""}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due - paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IROBJECTS[i]?.surCharges ? IROBJECTS[i].surCharges : item.surCharges}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];

				arr.push(array2);
			} else {
				for (var k = 0; k < IROBJECTS.length; k++) {
					const paymentMode = PaymentModes.find((el) => el.PMID == IROBJECTS[k]?.PMID);
					var insTypeO = installmentTypes.find((el) => el.InsType_ID === IROBJECTS[k].InsType_ID);

					const FormatedStampDateO = formatTimestampf(IROBJECTS[k].IRC_Date, 0);
					const FormatedMonthO = formatTimestamp(IROBJECTS[k].Installment_Month, 1);
					if (PaidR) {
						paidAmt = IROBJECTS[k].Installment_Paid;
					}
					if (typeof IROBJECTS[k] != null || typeof IROBJECTS[k] != undefined) {
						totalSurchagreAmounts = totalSurchagreAmounts + IROBJECTS[k]?.surCharges;
					}

					totalAmount += +IROBJECTS[k].Installment_Due;
					paidAmount += +paidAmt;

					if (
						remainingPaidOstBreak == 1 &&
						parseInt(instMonth) === new Date().getMonth() + 1 &&
						new Date().getFullYear() == instYear
					) {
						remainingPaidOstBreak = 0;
					}

					if (remainingPaidOstBreak == 0) {
						tillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
					}

					if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
						remainingPaidOstBreak = 1;
					}
					// remain = totalAmount - paidAmount;

					array2 = [
						// {
						// 	text: `${++inc}`,
						// 	alignment: "left",
						// 	fontSize: 9,
						// 	border: [true, true, true, true],
						// 	borderColor: " #91CBFF"
						// },
						{
							text: `${++inc} - ${insTypeO?.Name || ""} - ${FormatedMonthO}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						// {
						// 	text: `${FormatedMonthO}`,
						// 	fontSize: 8,
						// 	border: [true, true, true, true],
						// 	borderColor: " #91CBFF"
						// },
						{
							text: `${IROBJECTS[k] ? "VCIRC-" + IROBJECTS[k].IRC_NO : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${paymentMode ? paymentMode.Description : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${FormatedStampDateO}`,
							fontSize: 7,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k] ? IROBJECTS[k].INSTRUMENT_NO : ""}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Due}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Paid}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Remaining_Amount}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k]?.surCharges ? IROBJECTS[k].surCharges : item.surCharges}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						}
					];

					arr.push(array2);
				}
			}

			// arr.push(array2)
		});

		dcInsRecpData.map(async (item, i) => {
			dcTotalAmounts += +item.Installment_Due;
			const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
			const IR = installmentReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const PaidR = installmentPaidReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const paymentMode = PaymentModes.find((el) => el.PMID == IR?.PMID);

			const FormatedStampDate = formatTimestampf(item.IRC_Date, 1);
			const FormatedMonth = formatTimestamp(item.Installment_Month, 1);

			const instDay = parseInt(item.Due_Date ? item.Due_Date.split("-")[2] : "");
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
			// console.log('FormatedStampDate', FormatedStampDate);
			let paidAmt = item.Installment_Paid;

			let totalPaidAmt = 0;
			for (var k = 0; k < IROBJECTS.length; k++) {
				totalPaidAmt += IROBJECTS[k].Installment_Paid;
			}

			remain += item.Installment_Due - item.Installment_Paid;

			if (dcRemainingOstBreak == 0) {
				dcRemainingOst += +item.Installment_Due;
				// tillDatePaidAmt += +PaidR.Installment_Paid
			}

			if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				dcRemainingOstBreak = 1;
			}

			if (IROBJECTS.length == 0) {
				if (PaidR) {
					paidAmt = PaidR.Installment_Paid;
				}

				dcTotalAmount += +item.Installment_Due;
				dcPaidAmount += +paidAmt;
				// remain = totalAmount - paidAmount;

				array7 = [
					{
						text: `${++dcInc}`,
						alignment: "left",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${insType?.Name || ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${FormatedMonth}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? "VCIRC-" + IR.IRC_NO : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paymentMode ? paymentMode.Description : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? FormatedStampDate : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? IR.INSTRUMENT_NO : ""}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due - paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];

				arr6.push(array7);
			} else {
				for (var k = 0; k < IROBJECTS.length; k++) {
					const paymentMode = PaymentModes.find((el) => el.PMID == IROBJECTS[k]?.PMID);
					var insTypeO = installmentTypes.find((el) => el.InsType_ID === IROBJECTS[k].InsType_ID);

					const FormatedStampDateO = formatTimestampf(IROBJECTS[k].IRC_Date, 0);
					const FormatedMonthO = formatTimestamp(IROBJECTS[k].Installment_Month, 1);
					if (PaidR) {
						paidAmt = IROBJECTS[k].Installment_Paid;
					}

					dcTotalAmount += +IROBJECTS[k].Installment_Due;
					dcPaidAmount += +paidAmt;

					if (
						dcRemainingPaidOstBreak == 1 &&
						parseInt(instMonth) === new Date().getMonth() + 1 &&
						new Date().getFullYear() == instYear
					) {
						dcRemainingPaidOstBreak = 0;
					}

					if (dcRemainingPaidOstBreak == 0) {
						dcTillDatePaidAmt += +IROBJECTS[k].Installment_Paid;
					}

					if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
						dcRemainingPaidOstBreak = 1;
					}
					// remain = totalAmount - paidAmount;

					array7 = [
						{
							text: `${++dcInc}`,
							alignment: "left",
							fontSize: 9,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${insTypeO?.Name || ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${FormatedMonthO}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k] ? "VCIRC-" + IROBJECTS[k].IRC_NO : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${paymentMode ? paymentMode.Description : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${FormatedStampDateO}`,
							fontSize: 7,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k] ? IROBJECTS[k].INSTRUMENT_NO : ""}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Due}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Paid}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Remaining_Amount}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						}
					];

					arr6.push(array7);
				}
			}

			// arr.push(array2)
		});

		array3 = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Total Installment Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${paidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		array4 = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Pending Ost Amount (Till date)",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				// text: `${
				//   remainingOst - tillDatePaidAmt > 0
				//     ? remainingOst - tillDatePaidAmt
				//     : 0
				// }`,
				text: `${ostamtnew}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		array5 = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Total Remaining Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${totalAmounts - paidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		arrayTotalSurCharge = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Total Surcharge Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				// ${paidAmount}
				text: `${bookingData.totalSurcharges ? bookingData.totalSurcharges : 0}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		arrayPendingSurCharge = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Paid Surcharge Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				// text: `${
				//   remainingOst - tillDatePaidAmt > 0
				//     ? remainingOst - tillDatePaidAmt
				//     : 0
				// }`,
				// `${ostamtnew}`
				text: `${bookingData.paidSurcharges ? bookingData.paidSurcharges : 0}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		arrayRemainingSurCharge = [
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			// {
			// 	text: "",
			// 	alignment: "center",
			// 	fontSize: 9,
			// 	border: [true, true, true, true],
			// 	borderColor: " #91CBFF"
			// },
			{
				text: "Total Remaining Surcharge Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				// `${bookingData.remainingSurcharges ? bookingData.remainingSurcharges : 0}`
				// `${totalAmounts - paidAmount}`
				text: `${parseFloat(bookingData.totalSurcharges) - parseFloat(bookingData.paidSurcharges)}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		array8 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Total Installment Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${dcPaidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		array9 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Pending Ost Amount (Till date)",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				// text: `${
				//   remainingOst - tillDatePaidAmt > 0
				//     ? remainingOst - tillDatePaidAmt
				//     : 0
				// }`,
				text: `${dcOstamtnew}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		array10 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Total Remaining Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${dcTotalAmounts - dcPaidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		arr.push(array3);
		arr.push(array4);
		arr.push(array5);
		arr.push(arrayTotalSurCharge);
		arr.push(arrayPendingSurCharge);
		arr.push(arrayRemainingSurCharge);
		arr6.push(array8);
		arr6.push(array9);
		arr6.push(array10);

		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var params = process.argv;
			var data = [];
			data["invoicenumber"] = `${bookingData?.Member?.BuyerName}`;
			data["buyeraddress"] = "KJKAJSKJSKAJSKAJSKA";
			data["item"] = "JKAHKHSJKAHSA";
			data["price"] = 120;

			if (!bookingData.PaymentPlan.IncludeDC) {
				arr6 = [
					array,
					[
						{
							text: "Development Charges Are Inclusive of Cost of Land",
							alignment: "center",
							fontSize: 9,
							bold: true,
							fillColor: "#D3D3D3",
							borderColor: " #91CBFF",
							colSpan: array.length
						}
					]
				];
			}

			var docDefinition = {
				pageMargins: [15, 130, 15, 75],
				// playground requires you to assign document definition to a variable called dd

				header: {
					columns: [
						{
							width: 70,
							height: 50,
							image:
								"data:image/png;base64,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",
							fit: [160, 160],
							alignment: "center",
							margin: [0, 40, -270, 100]
						},
						{
							text: "Installment Statement",
							decoration: "underline",
							bold: true,
							alignment: "left",
							margin: [-40, 86, 0, 0]
						},
						{
							text: `File Status: ${bookingData?.Status || ""}`,
							// decoration: "underline",
							bold: true,
							alignment: "left",
							fontSize: 12,
							margin: [15, 110, 0, 40]
						},
						{
							width: "33%",
							stack: [
								// Booking Details Section
								{
									absolutePosition: { x: 0, y: 30 },
									canvas: [
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 560,
											y2: 2,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 5,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 800,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 560,
											y1: 2,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Header Down Border
											type: "line",
											x1: 5,
											y1: 75,
											x2: 560,
											y2: 75,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Status Down Border
											type: "line",
											x1: 5,
											y1: 96,
											x2: 560,
											y2: 96,
											lineWidth: 0.5,
											lineColor: "grey"
										}
									]
								}
								// Booking Details Section
							],

							alignment: "center",
							fontSize: 12
						}
					]
				},
				footer: {
					columns: [
						{
							width: "100%",
							stack: [
								// {
								//   canvas: [
								//     {
								//       type: "line",
								//       x1: 20,
								//       y1: 20,
								//       x2: 200,
								//       y2: 20,
								//       lineWidth: 0.5,
								//     },
								//   ],
								//   alignment: "left",
								//   margin: [20, 0, 0, 8],
								// },
								{
									text: "This is a system generated document, no signatures required. Possibility of error is not precluded and is subject to correction.This Statement is only for information purposes and is not a proof of ownership or payments.",
									alignment: "center",
									fontSize: 9,
									bold: false,
									margin: [30, 20, 30, 0]
								},
								{
									text: `Printing Date: ${formattedDate}`,
									alignment: "Right",
									fontSize: 7,
									bold: true,
									margin: [450, 8, 0, 0]
								}
							],
							alignment: "right"
						}
					],

					margin: [0, 0, 0, 8]
				},
				content: [
					{
						text: [
							// `${bookingData?.Phase?.NAME} (${bookingData?.Sector?.NAME})`,
						],
						border: [true, true, true, true],
						borderColor: "black",
						bold: true,
						fontSize: 11,
						margin: [0, 10, 0, 0],
						alignment: "center"
					},
					{
						table: {
							body: arrHeader,

							widths: ["25%", "15%", "15%", "15%", "15%", "15%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [15, 2, 45, 0]
					},
					{
						text: "Installment Statement (Cost of Land)",
						alignment: "center",
						margin: [0, 20, 0, 0],
						fontSize: 12,
						bold: true
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["22%", "9%", "9%", "9%", "10%", "10%", "10%", "10%", "10%"],
							body: arr
						},

						// Margin top for the table
						margin: [15, 2, 15, 0]
					},
					{
						text: "Development Charges Statement",
						alignment: "center",
						margin: [0, 40, 0, 0],
						fontSize: 12,
						bold: true
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["6%", "10%", "10%", "10%", "10%", "10%", "10%", "9%", "9%", "10%"],
							body: arr6
						},

						// Margin top for the table
						margin: [15, 2, 15, 0]
					}
					// Signature Section
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 0]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 0, 0, 0]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/statement/VC-Statement-" + bookingData.BK_ID + ".pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			return error;
		}
	};

	static statementGeneratorZip = async (bookingData, insRecpData, installmentPaidReceipts) => {
		const PaymentModes = await Payment_Mode.findAll({ raw: true });
		const installmentTypes = await InstallmentType.findAll({ raw: true });
		const installmentReceipts = await InstallmentReceipts.findAll({
			where: { BK_ID: bookingData.BK_ID },
			raw: true
		});
		var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
		var currentDate = new Date();
		var year = currentDate.getFullYear();
		var month = monthsArr[currentDate.getMonth() + 1]; // Months are zero-based, so we add 1

		var day = currentDate.getDate();

		var formattedDate = `${day}-${month}-${year}`;

		let totalAmount = 0;
		let paidAmount = 0;

		let newArray = [
			{
				text: "Name",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Registration No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Category",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Application For",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];

		let arrHeader = [];
		// Add the new table header to the beginning of the array

		// Populate the new table data
		const arrayNewTableData = [
			{
				text: `${bookingData?.Member?.BuyerName}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.Reg_Code_Disply}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.UnitType?.Name}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${bookingData?.PlotSize?.Name}`,
				alignment: "left",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		arrHeader.push(newArray);
		arrHeader.push(arrayNewTableData);
		let array1 = [
			{
				text: "SrNo",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Type",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Month",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "IRC No",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Payment Mode",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Paid Date",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Instrument Descrip",
				alignment: "left",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Due",
				alignment: "center",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Installment Paid",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			},
			{
				text: "Remaining",
				alignment: "right",
				fontSize: 9,
				bold: true,
				fillColor: "#D3D3D3",
				borderColor: " #91CBFF"
			}
		];

		function formatTimestamp(timestamp, simple) {
			let dateFromTimeStamp = ("" + timestamp).split("T")[0]; //new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
			if (!dateFromTimeStamp) {
				dateFromTimeStamp = ("" + timestamp).split(" ")[0];
			}

			let timestampMonth;
			let timestampDay;
			let timestampYear;

			if (simple == 1) {
				dateFromTimeStamp = dateFromTimeStamp.split("-");
				timestampDay = dateFromTimeStamp[2];
				timestampMonth = monthsArr[parseInt(dateFromTimeStamp[1])];
				timestampYear = dateFromTimeStamp[0];
			} else {
				dateFromTimeStamp = dateFromTimeStamp.split(" ");
				timestampMonth = dateFromTimeStamp[1];
				timestampDay = dateFromTimeStamp[2];
				timestampYear = dateFromTimeStamp[3];
			}
			if (timestampMonth && timestampDay && timestampYear) {
				return `${timestampDay}-${timestampMonth}-${timestampYear}`;
			}
			return "";
		}
		function formatTimestampf(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);

			if (!(typeof simple != "undefined" && simple == 1)) {
				// dateFromTimeStamp.setDate(dateFromTimeStamp.getDate() + 1);
				dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			}

			let timestampDay = dateFromTimeStamp.getDate();

			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}

		let array2;
		let array3;
		let array4;
		let array5;
		let remain = 0;

		let arr = [];
		arr.push(array1);

		var remainingOst = 0;
		var remainingOstBreak = 0;
		let inc = 0;
		let totalAmounts = 0;
		insRecpData.map(async (item, i) => {
			totalAmounts += +item.Installment_Due;
			const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
			const IR = installmentReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const IROBJECTS = installmentPaidReceipts.filter((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const PaidR = installmentPaidReceipts.find((el) => el.BKI_DETAIL_ID === item.BKI_DETAIL_ID);
			const paymentMode = PaymentModes.find((el) => el.PMID == IR?.PMID);

			const FormatedStampDate = formatTimestampf(item.IRC_Date, 1);
			const FormatedMonth = formatTimestamp(item.Installment_Month, 1);

			const instDay = parseInt(item.Due_Date ? item.Due_Date.split("-")[2] : "");
			const instMonth = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[1] : "");
			const instYear = parseInt(item.Installment_Month ? item.Installment_Month.split("-")[0] : "");
			// console.log('FormatedStampDate', FormatedStampDate);
			let paidAmt = item.Installment_Paid;

			let totalPaidAmt = 0;
			for (var k = 0; k < IROBJECTS.length; k++) {
				totalPaidAmt += IROBJECTS[k].Installment_Paid;
			}

			remain += item.Installment_Due - item.Installment_Paid;

			if (remainingOstBreak == 0) {
				remainingOst += +item.Installment_Due;
			}

			if (parseInt(instMonth) === new Date().getMonth() + 1 && new Date().getFullYear() == instYear) {
				remainingOstBreak = 1;
			}

			if (IROBJECTS.length == 0) {
				if (PaidR) {
					paidAmt = PaidR.Installment_Paid;
				}

				totalAmount += +item.Installment_Due;
				paidAmount += +paidAmt;
				// remain = totalAmount - paidAmount;

				array2 = [
					{
						text: `${++inc}`,
						alignment: "left",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${insType?.Name || ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${FormatedMonth}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? "VCIRC-" + IR.IRC_NO : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paymentMode ? paymentMode.Description : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? FormatedStampDate : ""}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${IR ? IR.INSTRUMENT_NO : ""}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.Installment_Due - paidAmt}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];

				arr.push(array2);
			} else {
				for (var k = 0; k < IROBJECTS.length; k++) {
					var insTypeO = installmentTypes.find((el) => el.InsType_ID === IROBJECTS[k].InsType_ID);

					const FormatedStampDateO = formatTimestampf(IROBJECTS[k].IRC_Date, 0);
					const FormatedMonthO = formatTimestamp(IROBJECTS[k].Installment_Month, 1);
					if (PaidR) {
						paidAmt = IROBJECTS[k].Installment_Paid;
					}

					totalAmount += +IROBJECTS[k].Installment_Due;
					paidAmount += +paidAmt;

					// remain = totalAmount - paidAmount;

					array2 = [
						{
							text: `${++inc}`,
							alignment: "left",
							fontSize: 9,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${insTypeO?.Name || ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${FormatedMonthO}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k] ? "VCIRC-" + IROBJECTS[k].IRC_NO : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${paymentMode ? paymentMode.Description : ""}`,
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${FormatedStampDateO}`,
							fontSize: 7,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k] ? IROBJECTS[k].INSTRUMENT_NO : ""}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Due}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Installment_Paid}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${IROBJECTS[k].Remaining_Amount}`,
							alignment: "right",
							fontSize: 8,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						}
					];

					arr.push(array2);
				}
			}

			// arr.push(array2)
		});

		array3 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Total Installment Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${paidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];
		array4 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Pending Ost Amount (Till date)",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${remainingOst - paidAmount > 0 ? remainingOst - paidAmount : 0}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		array5 = [
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "center",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "Total Remaining Amount",
				bold: true,
				alignment: "right",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 5
			},
			{
				text: "",
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "5000000.00",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			},
			{
				text: `${totalAmounts - paidAmount}`,
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF",
				colSpan: 2
			},
			{
				text: "",
				alignment: "right",
				bold: true,
				fontSize: 9,
				border: [true, true, true, true],
				borderColor: " #91CBFF"
			}
		];

		arr.push(array3);
		arr.push(array4);
		arr.push(array5);

		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var params = process.argv;
			var data = [];
			data["invoicenumber"] = `${bookingData?.Member?.BuyerName}`;
			data["buyeraddress"] = "KJKAJSKJSKAJSKAJSKA";
			data["item"] = "JKAHKHSJKAHSA";
			data["price"] = 120;

			var docDefinition = {
				pageMargins: [15, 130, 15, 75],
				// playground requires you to assign document definition to a variable called dd

				header: {
					columns: [
						{
							width: 70,
							height: 50,
							image:
								"data:image/png;base64,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",
							fit: [160, 160],
							alignment: "center",
							margin: [0, 40, -270, 100]
						},
						{
							text: "Installment Statement",
							decoration: "underline",
							bold: true,
							alignment: "left",
							margin: [-40, 86, 0, 0]
						},
						{
							text: `File Status: ${bookingData?.Status || ""}`,
							// decoration: "underline",
							bold: true,
							alignment: "left",
							fontSize: 12,
							margin: [15, 110, 0, 40]
						},
						{
							width: "33%",
							stack: [
								// Booking Details Section
								{
									absolutePosition: { x: 0, y: 30 },
									canvas: [
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 560,
											y2: 2,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 5,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 800,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 560,
											y1: 2,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Header Down Border
											type: "line",
											x1: 5,
											y1: 75,
											x2: 560,
											y2: 75,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Status Down Border
											type: "line",
											x1: 5,
											y1: 96,
											x2: 560,
											y2: 96,
											lineWidth: 0.5,
											lineColor: "grey"
										}
									]
								}
								// Booking Details Section
							],

							alignment: "center",
							fontSize: 12
						}
					]
				},
				footer: {
					columns: [
						{
							width: "100%",
							stack: [
								// {
								//   canvas: [
								//     {
								//       type: "line",
								//       x1: 20,
								//       y1: 20,
								//       x2: 200,
								//       y2: 20,
								//       lineWidth: 0.5,
								//     },
								//   ],
								//   alignment: "left",
								//   margin: [20, 0, 0, 8],
								// },
								{
									text: "This is a system generated document, no signatures required. Possibility of error is not precluded and is subject to correction.This Statement is only for information purposes and is not a proof of ownership or payments.",
									alignment: "center",
									fontSize: 9,
									bold: false,
									margin: [30, 20, 30, 0]
								},
								{
									text: `Printing Date: ${formattedDate}`,
									alignment: "Right",
									fontSize: 7,
									bold: true,
									margin: [450, 8, 0, 0]
								}
							],
							alignment: "right"
						}
					],

					margin: [0, 0, 0, 8]
				},
				content: [
					{
						text: [`${bookingData?.Phase?.NAME} (${bookingData?.Sector?.NAME})`],
						border: [true, true, true, true],
						borderColor: "black",
						bold: true,
						fontSize: 11,
						margin: [0, 10, 0, 0],
						alignment: "center"
					},
					{
						table: {
							body: arrHeader,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [15, 2, 45, 0]
					},
					{
						text: "Installment Statement (Cost of Land)",
						alignment: "center",
						margin: [0, 20, 0, 0],
						fontSize: 12,
						bold: true
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["6%", "12%", "11%", "10%", "10%", "10%", "12%", "10%", "10%", "10%"],
							body: arr
						},

						// Margin top for the table
						margin: [15, 2, 15, 0]
					}
					// Signature Section
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 0]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 0, 0, 0]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/statementZip/VC-" + bookingData.BK_ID + ".pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {}
	};

	static getUnVarifiedReceiptsPdf = async (installment) => {
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const arr = [
				[
					{
						text: "Sr No ",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "IRC_NO",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "IRC_Date",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Reg NO",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Category",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Plot Size",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Owner",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Intallment Type",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Month",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Payment Mode",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Due Amt",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Paid Amt",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Verification By",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					}
				]
			];

			let i = 0;
			let array3 = [];
			let paidAmount = 0;
			const installmentTypes = await InstallmentType.findAll({ raw: true });
			const PaymentModes = await Payment_Mode.findAll({ raw: true });

			installment.forEach(async (item) => {
				// const BookingObj = await Booking.findOne({ where: {BK_Reg_Code: item.BK_Reg_Code} });
				// const BookingObj = await Booking.findOne({ where: { BK_Reg_Code: item?.BK_Reg_Code } });
				const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);
				const paymentMode = PaymentModes.find((el) => el.PMID == item.PMID);
				// const BookingObj = await Booking.findAll({ where: { BK_Reg_Code: item?.BK_Reg_Code } });

				paidAmount += +item.Installment_Paid;
				i = i + 1;
				//let InstallmentTypeDetails = await InstallmentType.findOne({where: {InsType_ID: item?.InsType_ID}})
				let array2 = [
					{
						text: `${i}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.IRC_NO}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item.IRC_Date}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},

					{
						text: `VC${item?.BK_Reg_Code}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item?.Member?.BuyerName || ""}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},

					{
						text: `${insType?.Name}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item?.Installment_Month}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item?.Payment_Mode?.Description || ""}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item?.Installment_Due}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${item?.Installment_Paid}`,
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];

				array3 = [
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "center",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "Total Receipt Amt",
						bold: true,
						alignment: "right",
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						colSpan: 2
					},
					{
						text: "",
						alignment: "right",
						bold: true,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${paidAmount}`,
						alignment: "right",
						bold: true,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: "",
						alignment: "right",
						bold: true,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];
				arr.push(array2);
			});

			arr.push(array3);

			const printer = new Pdfmake(fonts);

			const docDefinition = {
				pageSize: {
					width: 900, // Change this value to your desired width in points (1 inch = 72 points)
					height: 500 // Keep the height as per your requirement, here it's the default A4 height
				},

				pageMargins: [30, 110, 25, 80],

				header: {
					columns: [
						{
							width: 300,
							height: 400,
							image:
								"data:image/png;base64,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",
							fit: [140, 140],
							alignment: "center",
							margin: [0, 28, -300, 100]
						},
						// {

						//   text: 'Un-Verify Installment Receipts',
						//   fontSize: 12 ,
						//   bold: true,
						//   decoration: 'underline',
						//   margin: [0, 25, 0, 0],

						// },

						{
							stack: [
								{
									absolutePosition: { x: 0, y: 0 },
									canvas: [
										{
											// Top Border
											type: "line",
											x1: 15,
											y1: 15,
											x2: 810,
											y2: 15,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											// Bottom Border
											type: "line",
											x1: 15,
											y1: 430,
											x2: 810,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											//Left Border
											type: "line",
											x1: 15,
											y1: 15,
											x2: 15,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											//Right
											type: "line",
											x1: 810,
											y1: 15,
											x2: 810,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											// Header Bottom
											type: "line",
											x1: 15,
											y1: 100,
											x2: 810,
											y2: 100,
											lineWidth: 1,
											lineColor: "grey"
										}
									],
									alignment: "center"
								}
							]
						}
					]
				},

				footer: {
					columns: [
						{
							width: "50%",
							stack: [
								{
									canvas: [
										{
											type: "line",
											x1: 0,
											y1: 0,
											x2: 150,
											y2: 0,
											lineWidth: 0.5
										}
									],
									alignment: "center",
									margin: [20, 40, 0, 2]
								},
								{
									text: `Verification By`,
									alignment: "center",
									fontSize: 10,
									bold: true,
									margin: [0, 2, 0, 40]
								}
							],
							alignment: "left"
						},
						{
							width: "50%",
							stack: [
								{
									canvas: [
										{
											type: "line",
											x1: 0,
											y1: 0,
											x2: 150,
											y2: 0,
											lineWidth: 0.5
										}
									],
									alignment: "center",
									margin: [20, 40, 0, 2]
								},
								{
									text: "Admin Verification ",
									alignment: "center",
									fontSize: 10,
									bold: true,
									margin: [0, 2, 0, 40]
								}
							],
							alignment: "right"
						}
					],

					margin: [0, 0, 0, 40]
				},
				content: [
					{
						text: "Un-Verify Installment Receipts",
						fontSize: 14,
						bold: true,
						decoration: "underline",
						margin: [320, -35, 0, 15]
					},

					{
						stack: [
							{
								table: {
									headerRows: 1,
									widths: [
										"4%",
										"5%",
										"10%",
										"8%",
										"7.5%",
										"7.5%",
										"7.5%",
										"7.5%",
										"9%",
										"7.5%",
										"7.5%",
										"7.5%",
										"7.5%"
									],
									body: arr,
									// Set borders for each cell in the table
									borderColor: "#91CBFF", // Color for the table border
									fillColor: "#D3D3D3" // Color for the table header
								},
								margin: [35, 0, 0, 0]
							}
						],

						// Set border around the entire page
						border: [true, true, true, true], // [left, top, right, bottom]
						// Optionally, you can set the borderColor property for the page border
						borderColor: "#000", // Color for the page border
						// Set margin to control the distance of the table from the page border
						margin: [10, 10, 10, 10] // [left, top, right, bottom]
					}
				]
				// styles: {
				//   header: {
				//     fontSize: 18,
				//     bold: true,
				//     alignment: 'center',
				//     margin: [0, 100]
				//   },
				//   tableExample: {
				//     margin: [0, 5, 0, 15]
				//   },
				//   tableHeader: {

				//     bold: true,
				//     fontSize: 13,
				//     color: 'black'
				//   }
				// },
				// defaultStyle: {
				//   // alignment: 'justify'
				// }
			};

			const options = {};
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/unVarifiedTransactions/VC-unVarifiedTransactions.pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();

			return filePath;
		} catch (error) {
			console.log(error);
			return null;
		}
	};
	static getUnVarifiedPdfByUser = async (data, grandTotalAmount) => {
		// console.log(data)
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const arr = [
				[
					{
						text: "Verification By",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Payment Mode",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "IRC Date",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "IRC No",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Reg NO",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Category",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Plot Size",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Owner",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Intallment Type",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Month",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Payment Mode",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Due Amt",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					},
					{
						text: "Installment Paid Amt",
						alignment: "center",
						fontSize: 9,
						bold: true,
						fillColor: "#D3D3D3",
						borderColor: " #91CBFF"
					}
				]
			];

			let i = 0;
			let array3 = [];
			let array4 = [];
			let array5 = [];
			let paidAmount = 0;
			const installmentTypes = await InstallmentType.findAll({ raw: true });
			const PaymentModes = await Payment_Mode.findAll({ raw: true });
			const UnitTypes = await UnitType.findAll({ raw: true });
			const PlotSizes = await PlotSize.findAll({ raw: true });

			for (let key in data) {
				if (data.hasOwnProperty(key)) {
					const rowLenght = data[key].items.length + 2;
					data[key].items.forEach(async (item) => {
						// const BookingObj = await Booking.findOne({ where: {BK_Reg_Code: item.BK_Reg_Code} });
						// const BookingObj = await Booking.findOne({ where: { BK_Reg_Code: item?.BK_Reg_Code } });
						const insType = installmentTypes.find((el) => el.InsType_ID === item.InsType_ID);

						const unitType = UnitTypes.find((el) => el.UType_ID == item["Booking.UType_ID"]);
						const plotSize = PlotSizes.find((el) => el.PS_ID == item["Booking.PS_ID"]);
						// const BookingObj = await Booking.findAll({ where: { BK_Reg_Code: item?.BK_Reg_Code } });

						paidAmount += +item.Installment_Paid;
						i = i + 1;

						//let InstallmentTypeDetails = await InstallmentType.findOne({where: {InsType_ID: item?.InsType_ID}})
						let array2 = [
							{
								text: `${item["User.name"]} ${item["User.lastName"]}`,
								fontSize: 9,
								alignment: "center",
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								rowSpan: rowLenght >= 11 ? 11 : rowLenght
							},
							{
								text: `${item["Payment_Mode.Description"]}`,
								fontSize: 9,
								alignment: "center",
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								rowSpan: rowLenght >= 11 ? 11 : rowLenght
							},
							{
								text: `${item.IRC_Date}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item.IRC_NO}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `VC${item?.BK_Reg_Code}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${unitType.Name}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${plotSize.Name}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item["Member.BuyerName"] || ""}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},

							{
								text: `${insType?.Name}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item?.Installment_Month}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item["Payment_Mode.Description"]}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item?.Installment_Due}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item?.Installment_Paid}`,
								fontSize: 9,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							}
						];

						array3 = [
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},

							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${item["Payment_Mode.Description"]} Total`,
								bold: true,
								alignment: "right",
								fontSize: 11,
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								colSpan: 10,
								fillColor: "#CCCCCC"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "right",
								bold: true,
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "right",
								bold: true,
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${data[key].payOrderTotal}`,
								alignment: "right",
								bold: true,
								fontSize: 11,
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								fillColor: "#CCCCCC"
							}
						];
						array4 = [
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},

							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `Verification By ${item["User.name"]} Total`,
								bold: true,
								alignment: "right",
								fontSize: 11,
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								colSpan: 10,
								fillColor: "#CCCCCC"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "center",
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},

							{
								text: "",
								alignment: "right",
								bold: true,
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: "",
								alignment: "right",
								bold: true,
								fontSize: 10,
								border: [true, true, true, true],
								borderColor: " #91CBFF"
							},
							{
								text: `${data[key].total}`,
								alignment: "right",
								bold: true,
								fontSize: 11,
								border: [true, true, true, true],
								borderColor: " #91CBFF",
								fillColor: "#CCCCCC"
							}
						];
						arr.push(array2);
					});
					array5 = [
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},

						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `Grand Total Receipt Amt`,
							bold: true,
							alignment: "right",
							fontSize: 11,
							border: [true, true, true, true],
							borderColor: " #91CBFF",
							colSpan: 10,
							fillColor: "#CCCCCC"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "center",
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},

						{
							text: "",
							alignment: "right",
							bold: true,
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: "",
							alignment: "right",
							bold: true,
							fontSize: 10,
							border: [true, true, true, true],
							borderColor: " #91CBFF"
						},
						{
							text: `${grandTotalAmount}`,
							alignment: "right",
							bold: true,
							fontSize: 11,
							border: [true, true, true, true],
							borderColor: " #91CBFF",
							fillColor: "#CCCCCC"
						}
					];
					arr.push(array3);
					arr.push(array4);
				}
			}
			arr.push(array5);
			const printer = new Pdfmake(fonts);

			const docDefinition = {
				pageSize: {
					width: 900, // Change this value to your desired width in points (1 inch = 72 points)
					height: 500 // Keep the height as per your requirement, here it's the default A4 height
				},

				pageMargins: [30, 104, 25, 66],

				header: {
					columns: [
						{
							width: 300,
							height: 400,
							image:
								"data:image/png;base64,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",
							fit: [140, 140],
							alignment: "center",
							margin: [0, 28, -300, 100]
						},
						// {

						//   text: 'Un-Verify Installment Receipts',
						//   fontSize: 12 ,
						//   bold: true,
						//   decoration: 'underline',
						//   margin: [0, 25, 0, 0],

						// },

						{
							stack: [
								{
									absolutePosition: { x: 0, y: 0 },
									canvas: [
										{
											// Top Border
											type: "line",
											x1: 0,
											y1: 15,
											x2: 810,
											y2: 15,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											// Bottom Border
											type: "line",
											x1: 0,
											y1: 430,
											x2: 810,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											//Left Border
											type: "line",
											x1: 0,
											y1: 15,
											x2: 0,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											//Right
											type: "line",
											x1: 810,
											y1: 15,
											x2: 810,
											y2: 430,
											lineWidth: 1,
											lineColor: "grey"
										},
										{
											// Header Bottom
											type: "line",
											x1: 0,
											y1: 100,
											x2: 810,
											y2: 100,
											lineWidth: 1,
											lineColor: "grey"
										}
									],
									alignment: "center"
								}
							]
						}
					]
				},

				footer: {
					columns: [
						{
							width: "50%",
							stack: [
								{
									canvas: [
										{
											type: "line",
											x1: 0,
											y1: 0,
											x2: 150,
											y2: 0,
											lineWidth: 0.5
										}
									],
									alignment: "center",
									margin: [20, 40, 0, 2]
								},
								{
									text: `Verification By`,
									alignment: "center",
									fontSize: 10,
									bold: true,
									margin: [0, 2, 0, 40]
								}
							],
							alignment: "left"
						},
						{
							width: "50%",
							stack: [
								{
									canvas: [
										{
											type: "line",
											x1: 0,
											y1: 0,
											x2: 150,
											y2: 0,
											lineWidth: 0.5
										}
									],
									alignment: "center",
									margin: [20, 40, 0, 2]
								},
								{
									text: "Admin Verification ",
									alignment: "center",
									fontSize: 10,
									bold: true,
									margin: [0, 2, 0, 40]
								}
							],
							alignment: "right"
						}
					],

					margin: [0, 0, 0, 40]
				},
				content: [
					{
						text: "Un-Verify Installment Receipts Payment Wise",
						fontSize: 14,
						bold: true,
						decoration: "underline",
						margin: [320, -35, 0, 15]
					},

					{
						stack: [
							{
								table: {
									headerRows: 1,
									widths: [
										"8%",
										"8%",
										"6%",
										"6%",
										"7.5%",
										"7.5%",
										"7.5%",
										"7.5%",
										"9%",
										"7.5%",
										"7.5%",
										"7.5%",
										"7.5%"
									],
									body: arr,
									// Set borders for each cell in the table
									borderColor: "#91CBFF", // Color for the table border
									fillColor: "#D3D3D3" // Color for the table header
								},
								margin: [16, 0, 0, 0]
							}
						],

						// Set border around the entire page
						border: [true, true, true, true], // [left, top, right, bottom]
						// Optionally, you can set the borderColor property for the page border
						borderColor: "#000", // Color for the page border
						// Set margin to control the distance of the table from the page border
						margin: [0, 0, 0, 0] // [left, top, right, bottom]
					}
				]
				// styles: {
				//   header: {
				//     fontSize: 18,
				//     bold: true,
				//     alignment: 'center',
				//     margin: [0, 100]
				//   },
				//   tableExample: {
				//     margin: [0, 5, 0, 15]
				//   },
				//   tableHeader: {

				//     bold: true,
				//     fontSize: 13,
				//     color: 'black'
				//   }
				// },
				// defaultStyle: {
				//   // alignment: 'justify'
				// }
			};

			const options = {};
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/unVarifiedTransactions/VC-unVarifiedTransactionsPaymentWise.pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();

			return filePath;
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	static cashReceiptGenerator = async (body, rows, trsrequest) => {
		const fonts = {
			Roboto: {
				normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
				bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
				italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
				bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
			}
		};

		function formatTimestampf(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			let timestampDay = dateFromTimeStamp.getDate();

			// if(typeof simple != "undefined" && simple == 1) {
			//     timestampDay = dateFromTimeStamp.getDate();
			// }
			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}

		let FormatedDate = "";
		if (body && body?.INSTRUMENT_DATE) {
			FormatedDate = formatTimestampf(body.INSTRUMENT_DATE);
		}
		var FormatedDueDate = "";
		if (body && body?.Booking_Installment_Details?.Due_Date) {
			FormatedDueDate = formatTimestampf(body?.Booking_Installment_Details?.Due_Date);
		}
		let FormatedInstallmentDate = "";
		if (body && body?.Booking_Installment_Details?.Installment_Month) {
			FormatedInstallmentDate = formatTimestampf(body?.Booking_Installment_Details?.Installment_Month, 1);
		}

		const IRC_FormatedDate = formatTimestampf(body?.IRC_Date);
		const printer = new Pdfmake(fonts);

		try {
			let dataArr = [];
			let dataArr1 = [];

			let dataNArr = [
				{
					text: "Sr No",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Detail",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Status",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				}
			];

			dataArr.push(dataNArr);

			dataArr1.push([
				{
					text: "Sr No",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Detail",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Status",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);
			let total = 0;
			for (let i = 0; i < rows.length; i++) {
				total += +rows[i]?.Installment_Paid;

				let dataNeArr = [
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${
							rows[i]?.Voucher?.TaxPayeeCategory?.Name == "Seller"
								? `${trsrequest?.VoucherSellerTaxId?.PAYEE_NAME || ""} (${
										rows[i]?.Voucher?.TaxPayeeCategory?.Name
								  }) \n ${trsrequest?.VoucherSellerTaxId?.Cnic}`
								: `${trsrequest?.VoucherBuyerTaxId.PAYEE_NAME || " "} (${
										rows[i]?.Voucher?.TaxPayeeCategory?.Name
								  }) \n ${trsrequest?.VoucherBuyerTaxId?.Cnic}` || " "
						}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					}
				];

				dataNeArr.push({
					text: `${rows[i]?.Voucher?.TaxTag?.Name || " "}`,
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "left"
				});

				dataNeArr.push({
					text: `${rows[i]?.Installment_Paid}`,
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				});

				dataArr.push(dataNeArr);

				dataArr1.push([
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${
							rows[i]?.Voucher?.TaxPayeeCategory?.Name == "Seller"
								? `${trsrequest?.VoucherSellerTaxId?.PAYEE_NAME || ""} (${
										rows[i]?.Voucher?.TaxPayeeCategory?.Name
								  }) \n ${trsrequest?.VoucherSellerTaxId?.Cnic}`
								: `${trsrequest?.VoucherBuyerTaxId.PAYEE_NAME || ""} (${rows[i]?.Voucher?.TaxPayeeCategory?.Name}) \n ${
										trsrequest?.VoucherBuyerTaxId?.Cnic
								  }` || " "
						}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${rows[i]?.Voucher?.TaxTag?.Name || " "}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${rows[i]?.Installment_Paid}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					}
				]);
			}

			const totalAmout = [
				{
					text: "",
					fontSize: 11,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},

				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			const totalAmout1 = [
				{
					text: "",
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},

				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			dataArr.push(totalAmout);

			dataArr1.push(totalAmout1);

			// dataArr1 = dataArr;

			let newArray = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];

			let newArray1 = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];
			let arrHeader = [newArray];
			let arrHeader1 = [newArray1];

			const arrayNewTableData = [
				{
					text: `${body?.Member?.BuyerName}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];

			const arrayNewTableData1 = [
				{
					text: `${body?.Member?.BuyerName}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];
			arrHeader.push(arrayNewTableData);
			arrHeader1.push(arrayNewTableData1);

			var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			var fullMonthsArr = [
				"",
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			];

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Payment Receipt",
								fontSize: 11,
								bold: true,
								margin: [-10, 40, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},

							// 2nd Heading with below sub-heading///
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User?.name || ""}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],

								alignment: "right"
							}
						]
					},

					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 570,
										y2: 25,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 820,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 25,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 570,
										y1: 25,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									}
								]
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 110 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Customer Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 79, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											`${body?.Installment_Month ? "Installment Month: " : ""}` +
											`${
												body?.Installment_Month
													? body?.Installment_Month?.split("-")[1] == 10
														? body?.Installment_Month
															? fullMonthsArr[body?.Installment_Month?.split("-")[1] + ""]
															: ""
														: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
													: ""
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: `${
									body?.Installment_Month ? "Installment Year : " + body?.Installment_Month?.split("-")[0] : ""
								}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `${
											typeof FormatedDueDate != "undefined" && FormatedDueDate
												? "Due Date : " + `${FormatedDueDate}`
												: ""
										}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							},
							{
								width: "30%",
								fontSize: 11,
								text: `${body?.INSTRUMENT_NO ? "Instrument No : " + `${body?.INSTRUMENT_NO}` : ""}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "34%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `${FormatedDate ? `Instrument Date: ${FormatedDate}` : ""}`,

										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},

					// Horizontal Line
					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -5,
										y1: 12,
										x2: 530,
										y2: 12,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: "Tax Payment Detail",
										bold: true
									}
								],
								margin: [0, 5, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "35%", "35%", "20%"],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								width: "100%",
								stack: [
									{
										// absolutePosition: { x: 50, y: 350 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, -30, 20, 0]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					},

					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 1 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 0, 0, 0]
					},
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 15, 0, 10]
					},

					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Payment Receipt",
								fontSize: 11,
								bold: true,
								margin: [3, 50, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPQAAABECAIAAAA5h4/cAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAB6NSURBVHhe7Z1XcBvXuYCTp2QymUwmbTLJJJnJOA+ZZMYvtyU317ETW7Kui2xLVrOK1SWrS1aXqEKqN1IkxV4kir0XkCDAAjYQBAmABCvYQYJEIUiAKAQBktL9d8/BYrEAuJAjx47vfnOGs2d3sVgsvj37n38Plt96zsHxDYWTm+MbCyc3xzcWTm6Obyyc3BzfWFjkFtzeJLzzCZSqu5tr7m+pub8VSu2DbVBEUMI/rYvYXv8Qyo4GKJE7G6N2NkXtFEfvEj/a3fxoT3PMHknMXigtMXulsfukcftbEz6D0pZwAIos8YA86aAi+ZAi+bAi5Uh7yhFl6lHl46PKJ8c6045D6Uo70f30RE86lJM9Gad6M09NdQrxnnFwsMEq90ZKbobfIHcdyI393oH8bkR+g9zRu+l+t8TugwJyS+MJv9tIv2WJB2VJB7HfKYfbU49AIeR+fMzj91Pw+/OedCiE35zcHMHDInflrY1CsvGuukv4XX0P+137wI/fWG6a380B/Cbl9vjtbrwJvzvcfnf6+p1x0tApwHvGwcEGi9z8WxuJyMTLb5Cb5nc46TctOKHk9vYb5Cb8JuSm+U3IzeY3khv5bVBycnMEC7vc0HiTkfcX9ZuQm/CbbLw9frdiv8nGO9EdnHj5fYzhNyc3xwvBJvfNDWx+E51LWnASyG8qOKH5TQ9O/PhNBt/gNy04MXRU4j3j4GCDTe4b68FvkLvyNt1vonNJ99s7+Kb5Tcrt47c7+A7sN8jt8ZsWfHNycwRPUHJTfqPgm/Ibye3Pb5w8MfRLZWlnCbkDdy4ZyRN64w2FkTzRc3JzBA2L3OVuud3BiVfyhPLbK/h2+w1yW3TD89YZ2dNz3n7j4ITym5Tbv9+MzqW+g4/3jIODDRa5edfWVTD9foHkCcgNG3HazLL0C+7gxMtvHJx4J0/8dS6x3zpObo6gYZe7/Pq6CiQ3u9/knUua30huwGmflWdc9ATfXzR5omvn5OYIFla5P+ZdD+B3EMmTWbfcgHPOosi67NO5pPlND04CJE84uTmCh1XutUhuCL4pv1HnkpE88du5nNUN4Q2RLLrme3iRL3xnnpY80Skq8LY4ONhgkbssbC3VeHs6l8smT+h35me1XnIDS4sLPbyoL3ZnHoqv3IsLztHOBnVXw1h343hPk6a3aVLVjBY5LAbDsNQ40jqtbjONySzaLjTfbp6C9TU9xJr6wRZYAZYuLbrQUjow0zjeM6ooH5BkqxWleFPjMqd9Gq/x/Hlfc4m6C966Ed56ok+s7W/WDUgMQy1TI9Lp0daZMZl5vA2v6o3LYdMNyVRN2f3i7Ime2jmzDi/wxjjeDx+Q+nTEWwxIHFbPDjAwqHtgZVgT9gR2A/ZhdrITL/MBwkX1F01A2c16TU/dQHP2qLyY+rC2qQG8+PlzOCxjPY2ww8QBGZbCoZubUaNF431S6iuDFeCLgA8F38UUfF+wHXWbcaie+kZGuxrp3y+sbxwjvkpYgfp+ieOskaP1KVjkLg1bWwZy+/qNgxPGyBMqOCH9Dt/mKzeg7aoLJnmCghOG335bbuuMrj4zjP/oYGbISnBxwelA858tLTrnZme1feKkDcahpoV5K5q/tLRomZ5UifOlBdfLbrxl0nS65mbRIjoD0jJexPb80FVtxbdHFTxNl3Ciu3JYnNxVcsY4UIPWWXDOp4e831WXNSDlddWm1T3+XJR8uOT6m91V0RolT9dXre0u7+NfQitTwB7K+fHZl96qSzszJC1Wd/B7ahNqHm1ozTlhMQzildzA2WucGKh7eqkhK7T0/ieDLUWNaZ8LozbJCq8uzNvxSjRg/emJfnFOqDT/iiTzc+vU0NLCPF7mw5C0sODKX+0mLa4Hx6xBXZ8eknP5rfrHJwYkOZpOwWR31YgkTVV1RyUIxSs9fz4/Z5ka6xbE7uNHrO3k37dNqylfq1JDpCWP+lvK+iVFbaXhlVHb+OEfN2eeHG7J1vZW6VU13WXn5q0GtLJ91gjnSUn4jsyQFW2lEWbdMHxGtGhh3mae7GlO3qTvq3LZZ9BMCja5Q9dC40332yd5spzfy8jt128cfAdOnmgV5Xgr3ricc+LcW2mn/mLWj+BZbkDu3spbuEJjekKlFMbxbq/CdW8khfcrovfVJB93zdvwLDdzZo1xUISmjZr+zrocNA0Yx7rFGecqHnyE6yQaeQaeIoGvvCrpZPaVd/TD7XgWCcRsSl6YNH2vcbQFz6Ihr4iXlcc0Zl1B1aGWPEXpjZbMo3ACozkMlMJEZWVkR/k9XPfHs6Ul/sMtDU+OdVY+xLOCQDuo4EXuKbjxkXG8F8+iMd76BE+5aefHCKI2TvbiI4ZoLoyEd8eV589bi24KojZpVU24/vw5NMMWXQ+ukAzLBaIn53OvvrMwP4dnkYy0ZA43P8YVb1jkLrm6hmi8GX4juT1+U8E3w++AcrOPPKEHJzS/A8kN9Dbm1qSclBYzv85e4QPzZDeu0Ji3z4LclREf4zqNIUV1ZcKJ0gfbIIjCs7yxaPGFfs5qctjMaBpw2EwgN99bbqoFQtSmXc6+unpY4WfsLvjdVR4my97vsDBDlN7GfJC7XZCAqmBGLzT20WssemZLjxhprwS5u6qicd0fBrVSGLu7Je9Kxf3VC04/FwFfnA47P+Zo5qVVU/7MBqjAgwJOM5Bb1+8RF4BGAU+RdFUnMeRedDmcNiOuuJHxossfbldUeD6UZWpYnn/m2TPPeUKHRe7iqx+VhCK/SbnZ/fa6Mx9Q7oAjT9zBSQC/JwPLDReo5vzb2SFvLjg9ZzbEG/K807jiDYgLctcl78N1GrXpobnX14124NgjeJDcEDPgug8aVasw5Vze9XX0douOrq+qv/bBUEMUrrsZVlTR5QZUDY/FT/bNjCtx3Ru1shrkHpLm4bo/xNlXptTKrqq4xieHoUeB5y6LQvik5slFftwRXA8CZZUfuRkguadGmEEzAzi8zXk38q+uNE0S5wa0BW05p+dm9WipL8HJHbrW47c7+GYkT8jgxOP38nLTR1a9UPJkUh5QbkBZlcqP3j3YWoLr4ERLpravFle8wXInMeU26dWNefdiD7zq8r78BQOSuzHtGK77IC4Ir069ICl8gOs+zJknh8WJ8gy4aHh1cBlyw/cqKw6riV7rtHuuG3RY5YYLlyCG+Oy2mUl56c36xO3Pnj1Di5ahIfs2L3J/T0MurgdB8HLbpydwPTDqztqmzAuC6E+XFlydlRHjyuWyZ0HI7fabCE68/caNt3fyBAUnyG//cneKsNw0v6nge/nkyfJym3TDDRkh5RFbUBXiUWnm8UChRSC5h9pr67NvpV/0H4svD6vckpJHJeG7O0WZuO4DhAdqaXpr6hrXnAnPIqHLbTGONTw+XB2zyTAoRkt9YZVb1VwwJMMHU9XwRBS3ZXq8A1WXofrJ5YyL76gknuaDlZcrNyAvfyiM2VETv1Oaew7PCgCr3B8y/aYFJ2zJk81+5Z7sFHmGDUb58dtv8gT5PSnn4a0EoEOQUHJnrW5QCtNaVd2gmNm/oQgk93CHqD7rVtLxP+H6i8Aqd1NBxD8id2tpBEwrBY/K776v4N1aWvJ/3gKscvMf7aMuTUZ1e3vpdUVhCKougyjjWu61dV+t3GbdsDjzXMmNFQ4rMyhnwCJ30ZUPsN+ha/z67Wfkyb2t4pRTyG+/cmvahdTIKq/g2+03s3NJS55MyFjknuhrbsoKqU8l9JJkn5y3BcwHB5LbZtI35hJhiUnHTLywguSuTzmA6z60VSQJEk+L0pjJQQqLYWCw/lF79i5GGoTecjus0+3lD2pjtw41e+Vh6Cwvt25YISm4gytwiXu21CV8WBv94ZyJRS9Rxg1Bwglxrp/sUyCCl9tiCOqAO+esIDfv7nu4HhgWuQsvf1B0BeSm+U0EJwGTJzURuw2Dsl5BMmq/zZNMuY3D7R0Ftwdq0+r9+u0VfNP8djferHIDcl5k8fW3h6T5irKbeJY/FlzzILcoaQ+u0xAkneVF7W8uuIvrQYPkZmRL6MwaxstjjqSde8vlL0UNqFszewU3x3wSakNyAT3mnpno7ai4Vx35wazOK+1AgeTuF6fjujeitAtm71NX3V7aURo22JiE6wEYlAkasm+lnX0DQnY8iw2/2RIGSG56tmQZXqLcq91+4+DE7Tcpt7ff1Q/3WgxEJqiHkJuIT8yTXomqCWVtbfg2eVYo9F1GJUV1wf9m3u13MHIPt5VJci4WXv3rtMZPBpAC5bnL/OW5J/plwsST6ef/rh1oxbO8mfdJ1SFsJi3IzchzM5CWxhTd3Qqm4joN+8x4e9EZec6BRRdTfZTnpmdL1IrSbsEDydP9i/7u0XRVp4LccALgOo05q4kXyTylIRzqrrzbEP+xy2HBs/zxbGmpOvV8eeTeqkTozPi5p2uf9owmQgTTcncK478KuS8RcjP89ps8qYs7ap0aR6/qESSh5Aldbk17VQ05rEqWhW9ioeDb12938O0neTLRVoZeuwwLLock55LIJ95gsPxNHHVnXXnUnpzLK7tqUqlbnsCia14tfWIzqHDdG/2wHOTm3Xk3UC8WWFx0SQruwZmjFCZRd9oA02SP+PEuWc4R+8wYnkUDyV3/9AKuk93lnqrItpzj/TVEIM5gmZs4cn5Cd30WrtDor4uX550YbXmK6wGYmzUKE46XhW/jR++cUnsSkRDb6PsEEx3MQEiccxXkXj6tIc68AHJrgntuh92sB7nLbq5aWvBzdtFhkbsgZHUwfjcknnTaPWc8yI2SJ5Tc+j5JDZH8Ju5cUnID+j5x46P9IHeQfgcjN6CsjB6VB1xzfs460l7TmHmlMf1sybW/jbblmcblvrf6zPpRcXZoefgnEOQ0Z56SF11tL7nclLB+oDYcr0EDLtOjHdWS/OtVsbuLQl8bbs03quV0dxlo+pqF8Yfyr73bnHNJwbvf+ORgfdL24ZYM35splmntQBu/4PYn1ckni+9uGG0XzEziU8s1b+uriWyM+3CkKY66+TyjHRlsrSiP+LQp/ZQobquur8Y6hb8Fs2GsuyEv5cRfZOWx471NLge++eqwTE321cGnk+Uca05ap++tZHRnGcCFd0Ba2pB+nnd3DT9iXVt+iLzwgjh5c1vGLvr+D8mrOqof88I38+6ubs09M9nNtxmZYeqosqZblMaP3Mq794Ek89R4B89qHMXLfLDOaIdkFS0FNyujthaFvt5bm6DtEy1zqWGXuwDkxn67g2+33yj4Lru+nm420F2ZhJInlNyDjXnUnZ22TI/cwPSIEuJvZvAdIHmiCU5u2/SEM/BnhnjXrFfPTo1ZjOO2aY3dNDFnngx0HxuAYMM6PW6b0YBMC04ofsJlEIXY4NSY1TiOVrabNKxNCzTwsA+w/jIdf/usEfaW2GHDGHoL2Hu8jAQuJo7ZyQX357WZDWYD8elgT8jdmJi34PUZm6KuSPN2E9ph6FDCoSC2Nh/w6DGAPZ+zeN2C/frAInd+yPsgN+G3p/Em/aYnT8LWWo1evWyQGyVP6HKTyUHC77bMq2gmwmHS+0+eEHITftM7l0HKzcEBsMidF/Iei99hRHxindLgF5B08xNR8oQhN/K71b/cQSVPNK2c3BzBwib3RY/c3n7TkiehPi03kvvmBprcudSd+dZMPLQNQchN+9nlsn6D3EENgeDgAFjkzr3wXj7Nb7+dSyiMlruLn4iSgwy5kd+tGT5yo1/ukMGJb/KE7vd4ALkhYv4nl6VlymIwZeEFC+Pl/gpjN2iFsfNfegkwTO+fDIvcORfeJRrvi+8v77ev3OjOvHmCJrf7zrw0/TKaiZgz6YN/oKZfuV1z5tGiS1+4DBdcHMg9359zti/rdG/mqe6nJzrTjitTjyhSDsuSDrYmHIBYH84r2IGmqJ0NkTtgJ2sfbIOeMXwW4Z1NcBpX3FgPHevS0DVwQODIwFGCg5Zz/p3sc/+beWZVxumVT0+tSPv8zScn/p56/G8pR19PPvLXhMOvJRz6n/gD/x3z2Z9j9v9X9N7/jNzzHw93/dvD3f8OE1CN2f+n2AN/hhVgNVgZXgIvfHz877CRtJNvpZ9amXl6ZebZVfAuueffySO/ncIrHxBDlEPX8NCd41sb4ICTzy4lhh8TvfbIneKonXAYW2L2thKp1QPy5EOKFOLhAp1pJ3qefg4fX5V9eiD33GDe+ZHCEMaBCr7oxGn4u/lKYZX7ndyAfuPguy7xlKIkmn6ydlYkoDvzvW0NaM5gQy5xZ570my43vKpPmNSWcZnlgYNuv/3KDRtZsJv/keKym3CxEcVJlBmiWFGZnkfFQhQHUYxEmSXK3OwULmai2IliIIqJKDZP0eMyo7fiosNlWmfBReueIGa6VyBWhlcRhdqIe7PoXfA7kjtAFLxL5B6iXbUY0c4Thfws7o9Gfkyi4M9OHQrGIXqhsujzC4+vBDa5oWG48C4EJ0y/ycYbSlvBg0XXfHHompbsm9RAHJAb3dyhWu6Bhhw88uTOJkpukLK3MqHm/hbXnEWec43Fb0Lu3WNSLubmCBZ2uSm/UfBN97s+5fyzpSUoRHwSuqYh5dyii7htQchN3twxTeCfiw7UE3Ijv1ue4mFDQ+KC6ntboCwuOOEMac+9QQtO/Ps9Jn2B8Wgc/88JSm6G30huKM2Z12EdQu4rH6LgG66MMKezIh6NPKHk7q/PgRCc8Pv2RkrubkEimRzcjO7kWafGAj5Q0+03JzdH8LDIDV0imtzv5nn7TclNjowlOpdIbmVFPLozT8kt4yWh5CD4vYzc0O/x+0BNyu8xaTF6LQcHKyxyZ51dlX2O3nh7dS4puSFEQZ1LLHc5yE3cmWe03ES5tVGShgfFd1eC3ER+kCY30a/Hwbfbbyw36fdYix+5IyMjj9KorPR6EMelS5cGB3HoPz09DSssef9+MS4uDr0QkEgkeG4AVCoVXvXoUXjh4qLXTXu73Q7z4S+uu+np6blw4cLKlSt3795dUVHh+4OuW7duKZV4EJLD4YCNWK34QRRAV1cX+YaY06f9/yqUTlhYWEMD7s0j2trarl27his0RCLRZ599Bvt29uzZzk7mE06qq6vv3fMafQXVpibP8D04Ani3SGy2r0VXEhGM3P8byG+P3Jdw8oSSG92Zp8tN/azBIzc/EcwWRe1DmRaQG42s8vjtE5yo/cnd3t5eV1e3atUqEAgmRke9Rt784he/gO8PTQ8PD3/rW99aWPAasvf2228fOXIEXghotSxP8BAKhT//+c9hzfz8/Ndeew20wAtIjEYjbB/+4jpJeXn5T37yk2PHjvF4vNu3b8PLDx06hJe5+eMf/wgbRNNmsxk2otd7BpDABuEdU1NTX3nlFZhobGzECwLz29/+9vXXX8cVkjfeeON3v/sdrriB/fnlL38ZEREBm4Xz4cc//nFWlteAwf7+/u9973saDU71joyMfPe73x0fx8M/gfn5edjbnJwc2ALAOLZfLUHKzfAbJ09ochP9y6IrWO6O8jiIv0vpctdlU8O+m59cRDNJuTc1xuMfZVkNIDcaOch8oCblt1+5EZ9++unTp36GawYj98OHwT64A+T+zW9+g6bLysqoaYSv3C6XC8wGL3EdDk5Hx+rVqycnJ3GdZHm5EdB+v/rqq7jCBsj97W9/m/rgra2tP/jBDxhyd3d3f+c736GuGACcfj/60Y9MJq8hgStWrLh//z6ahrYfdh5NI5DcajXziQ5fB9jlDuQ3BN/iDOIyB3JDiIIyg3YzMUAMyQ2FkltVl42Sg+C3R+6KBMHtTQ3xR1EV5KZGDiK/acEJ9lvdUoRW9mUZuXfs2HGFBJpPv3LDCrkkrA0PkhsCG5Bv06ZNcLnAC0h85YarCrR8aBpaXPQuwNCQ1+BPkHvDhg1oJ8+dO/dS5F67di14iaoffvghxAwMuSGsYrTuAHy6qqoqXCGBo/r73/8eJuDgwBby8rxGbCO5Y2Ji4ENR59LXBDa5z7xN9xvJTflNlxv5jeXmxaHkia/c5TfW0+SOr7y9sSEePwQD5Ib+JZIb+e2bPFFLvojce/bsuUFy8uRJv3K/9957aAX4qvDcAIDc0NqBZNAufvTRR3SPAV+5pVLpD3/4QzQN7d9Wkp/97GexsbFoJgLk3rx5M9oH6CS8FLmLiorgs8tkMugnQOwB8TRDbuirQKiNK25gHYijcIXE6XRCKAURPEQdv/rVrxhHD8kN3QDY8/R0/79q+6pgkTvz9Ntuv1Hj7ZU8EaeHwToeuS+tRnK38+JQ8mSGkluUhTLf4Lf4MZa7C+S+tbHB/YQXJPfy/+py9AvJ/WWEJWvWrFm/fj2aSeErN3Swvv/97/P5nicv63Q6mNPS4vXMtC8jLIGe6927d9etW7d9+/bLly9DuMyQG/YB9oSKpwG5XA5zfN8aGgVoILZs2XLxIv7uKP6Fw5L00yszQW4vvz2Nd5Nbbio56JY7FiVPZibwz1f7RFnUb4rFj/FvpTor4vm3NtbFHUZVUm5iZBUtOCH9piVPviS5Q0NDJ0h8Ex0MKLmh2wpRLKOR85UbSEhI+OlPfxodHQ16gXAg6K5du/AyN1+S3BaLBd4agF3ylRuAy8gf/vAH+FDw2aEr+etf/9pvRgXeGq4/AJV3okBywwUKHUBGJuqrhVXuFRnIbzI4Yfjd9JSQG+A/2IP8xnKXxaJh3zPuR8IRcpPJQfC7ySN3HPQv62Kx3BbDGBpZFdDvZeUODw/3G/Nt27aNynBBqwkRCOMLgDAAZiIEApb/cwkxNAToaDopKenwYbzzCJAJNgJ/cd0N2AMh9SuvvPLmm2+C676pwIMHD4rF+Ak7cILBRkBxVKWA1pHxdsuwe/duCEhg4tGjRxERxI8s4WzZu3cvudDD4uJicnIyhOawb3CSFxYW4gU+HDhw4MSJE7hCA1oK8shhZmeD/VX8P4Gg5A7kd9NT/IMxfvg+lBxEcivKYlHyhC43+ZtLwu9Gb7lFXnLjkYPefnuSJyOSgEefg4MBm9ynsNwZZ96m/EbBN/hNyV0RvhfduXTLHYOSJ3S5UXKwLOzjxtTzaCbIXQFyx1Byq9HIKtJvrwdqIr8JuZs5uTmChUVuSe59Sd4DVFrywqX54dKCCFRaCx4OSvCPvjqFaW2FkW1Fkc454r7aWIdIXhwlL4mym3DgqFVJFaWPOspioAyIsaAaZZ2yPE4lwo9Nclinuyviu/lQEnoqySJI6iVLHyrCZOOQAq3MwcEKi9wcHP+6sMhtJp4BMO6wziwtOMkf/WufPVuyGCes05o5s+dOtXNu1jZDPBVgwWl7trQ0axgnn1igsZuIl+CVyGcq2KY1iy6cS15wOtCa8HI0B3BYzRYj8UL6ExScc8E+aYCDg4JFbpWkNDNkpc2kXXQ51G25elX1s6VFo6a/MPRN82QP6vU3ZIW1ltzXdAl1fTVTg3V2y3QrL3agpVgQvWWiS6BuTXtODh1pKYlsK3s4phQoK26PKYi0l9NhUzUX8x/tay+PkBfj8N1mMoizL3dXx7oc2Hg4tSqjtqDxJxwcwcMellTGHDCOEQ/dG5Z4ssiFYSvQI12GFTU1KWfRTGDRNYd+kQrTkhxigBR6zO6gTFgRi2/WgKaK/M+t5BPJZiaHFHzi+XcNyZ7Ur7wsYlDi+Ucz/c35opRDE73+nyHPwREIdrnHuxuaMkNs0+P6Ac9gNEpuSXGUjOd1J5kCyY1oLopqK4/HFehxyrJ0vcTD40BuGS96sCWvWxiJFgF0ueHi0FOfMT3eJc09g+ZwcAQJu9wQQ1dEbFbyw+lPvqPkVtZmidxDWBnQ5e4Vl9Q88VS7eVfMGiLvgVpu3YAEWm6IfNBSutyaXrFhlBi2Jk7bbzX4edo3B0cg2OUGBppzVQ1eT4ym5IY+Iu/hrg5BvNWoNmk6zJN4/CT0Eatid1C+QqDCjz2iEudBv3NIktFX/QDF69oBuTjnBkz01SeqavF/OaLL3VqG/3XVRCdfVe3nCZQcHIEISm6n3eykPWx8pEOk7hBMDTahTh6Iqx+SabqqdKpayuaxrroxpdAwTPz7DgTYbBzvhQ6lZQo/wtk+axyUVQ7LK826YVhqGlc4zBqjZmBEIdD2iRyzWoO6Z7CNPzMxACfSZF+dvl/kMHmGyXNwLE9QcgcPhC6mSZVFP+ByzFqmtTMTKseszmY2gNZ4/pzJbBiDqt2st89obFNDqAnn4HjpvEy5bSZ9RfS+6fFum3EUQmrnnLU6fo/LYdEOtZt0w8KYHbaZcYu2e846U3znE5N2aLJHOKMmBvdwcHwZvEy5m4uiBtu8HqDfTOtT0vuXU+ouUfLhUVnAIX4cHP84L1Pu9uqMjiqvfmcguQFR4v5A/yCUg+Ol8DLldjlsdemXekQpY4oii65nemKg7N5am5H4r1kQZJc/+NjizuVZjJrKh58YR7lRUBxfIi+5Q8nB8fWBk5vjG8rz5/8HqDio9V579GIAAAAASUVORK5CYII=",
								fit: [160, 160],
								alignment: "center"
							},
							// 2nd Heading with below sub-heading
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User?.name || ""}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],
								alignment: "right"
							}
						]
					},

					{
						image:
							"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAHhCAIAAADhwwlEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAsJSURBVHhe7Z37VxNnGsf3b9nTFgg3od1qt65JJhFJALkTCOQCiK4FRBCSTAIIBbSe1nvbUy/YBRLuwbZaL1jbWmtVUFwEEsJNRVM1IAiCYXJj3wlQTcaQxDE7CWbO96BiPrzP832/8+TNL8zf5nFcf8Gm+Xn9/LwR/GGcn0fMAv9e/lqEDXrdtObezPh97fSYbu6ZwaAzmAxGk8G0dC28zOpahHXamfsdZ0b/OPngxtlHPb9N3buNTKqNyMwiujyMzEwOnTrc31ShbKpSyL+4c6F6rLt95uGAfm7WaAQloO0s/pSXftDSyjMT6jP77jWJR+pF/VJhb41Q2frZ6O8t02qVbm5Gb9TrTSaj0TY8fOaAqkmirBcpZMI+mVAhFfY3lY2cOzp5t+f57DRiMultw5PDZ81wg1BRb5a0SCkVKRsr+y82jN3tRZ5PGQ06k9HgEKyUCfrrBMo6uLtx990rbU/vK0y6GZNR7yg8UFc4XFOgqilUtX2uvvEjMvUQLG4LPqhqKlY2iBSgbXPng3WF92q2jdZkD0oFI2ePjA126eeeL/WNajm4v65wsDZ/uHY7gFWtlcO/1OiePDDo55B5k3YeNGBcDjZLoJQVoX+pF6nkVZOq69rpiTmTaXbeiFjClm6b1bcgsHnSIkWD+B7Y+YcjiB55bjKCzbMDL6hPJgBwX71IeergxFCnXjuFGAwgNg7BQOjiMmFvy87xnrO6p2qj3ggC5xzcIy1QX6mdVSuNejSttg3DCOVr8kcvfD09fN1kQMDSTsCo5zU77pzeP9H3s0kP7lZ7blvIHNiBtj2Pu86akKcg587BKqkA3PD3r32vf/7kdWBFUxUYOHPTGivYfs8qaVFvY/mdy82zE2qjQb8II88mVKf29tXD4BXKBnhBGFjQLyvoaRAPXap9NjYC7rBFWDs1frO+/No3OR1HsrtObO+pK1piXi67qF+27XZD0cCvx6c0A0YDsgjPTmrOH8yRl8aeLI05XZl05avNt77d3isVoMEEMid8WfhQTmtpdBPMBGotjvqxKum3Q5ndNTscgw8DOKZZHNEEo2qRRP3wacLFvXxzFyi/PJwr3xnbIolsFqMCPPjaVhr78z7+jeN5IJuoYVLH4AUeSF4S/euBjFvf5i8P58h3xrRIwIIvBOBGERPUf/lwlrJe2C/Lcw5esPDMLtaNY9nOwQtqFDHaSqN/2cdV1Ob0OAuDlYEXpyribx3L6pbtGHTEsJcF6m8tjrxyMPVmbd7gJefhZjiivSrmenX20KXqKc2g0/D3JWGXvt7Uf/EIFrbZM5AZZrSKqO37OT3nv3IORgUzmoXk03tYXacPTI05UzYq4LmI+l1VXMfJz5+NDb24nx2EW2GotTz6j5bdz5wyDBXMlMO05rKoy42VToRkUahhUGNJxK+y8slHSoPeSRj03FDM/Llu57i6F7xRv4DbHVkZBjDjYm3p49Hbet0SPDOhufBlbhuAwZaaZW4SAECRS99hyMVQvSS8/VuJeqRLr9MuwpNPNMeqBAcK074RJNcVJzUWgxIi5cBe0V8wo1kcJhdTZOIN507AD4ZvvoAfa8Y+yStJSOTwkuIEGRsPFMTWiEEVkXIRA5hshpnN4g2vhtWPxzduLg/ZkL5mfVxEBDOLHVmRG3dMFNcELIAZ5nkA4h3ZCtOXYFD2Us8AZvy7gsTcTKKnhFKjP6YxU5LjSnKSjkviGkGw4PAWOKIBjm2GN0jF4ecx8FhE9k6/qE0+YZwAekoQxPoQikuMT6jMY0tF0SdFdDlMr5cwGyT0OsmG89XWsCYmuyA4KjkgLDGIxgqGUkLIaeugVE4062hewkkRtU2yWlb6UUPJ2jpJmDX852NN/Nai0IjUQHpyEI0dBKUGUNODKfx1dHYBJ+5IPqNZQmmSrG4Wf1Qnpp+rFlvBYwlbxKGM9EA6J5DGBSLRMvygzCCIExUZXbo55j9C4BZZDv9TCuAT1vB4wpaSUMamADpvQX40vh8twx/iraZuzEqJ258XDzw7KVong8NeCReHMjID6NxFQdxAKi+YzFtFToyMiBVmxNeLE+UimgzGbBUWBgWHUrjvk/kB5Mw1VBY/MfFoIVsuCpfB4a+EF8v2NysY4rxP4X5ATvejbg0mp0VHJu7anADeemRipnXCzHBpKCMrgM73NysA4gWiyvClZQVSkmlh0dnsjceFMTWSjWCr1OAEiljAFoaR6Hyf9envhKWT1qeugkDmwuNimHsLk6rFce3V8MPB61awRc8kOs+Hzn8PlEBPDYHiP6RG0sOYZZ8kHhEkXqgueTjYAc7NNmF/VDwSjRdESwuBWKGUhI9psQXc+K8KUn6qrng0CMqetVl2AIgKxA2mcldROSFUzipK2odQSlZ8zP4c9sXjux4N3QCfPl9h2IICacBwbggVVTCVH0jhh0DcJEbUZ1uSfzpW9WgAlG0bDgAFg5VRAc/5/lB6EMRbD0WVZCSe/6ZMo/pdj8zYLttSoH/QyD+osds4sT98CT8ZuKSzNMw+HEiO5bNiG/YD+IoTMJA/jetLSYqPTzj+RcnYUKdumZBgBbbtHSgtPCb50J5yzUg3YpltS8MwAvDfIT45ir1nd+WjuwpEt/R24wjsT+O9C6WtYaaUVu4avTOgcxb2hdgfbGAJy6qGh6xhy2GAkT+NQ6KxQ+nx+eKy/n4FgjgNgzssdpuwWNHXiyC2ZxhWYKsAHAxyIpAo+nqsYPs9k6C0YEp8blFJX2/P3JyzMJUfTEnN2VHRfcsatls2gDOD1qVt3V5xs/O/Wq0FbNcwLgnKDPxX6pbc8s7rXc7D1MyAtezNOWWd16xhuz3z/aiZ/mvZWQTAPlCm7zp2Zm5ZBwa27/Z7tEwfMjtjW1kHxjB7MJ33Hv21YVwrLwvbN8xVMK6y7cfTVbCHuo0LdsSwDDyG2YQ91DDi7ue3MZ4e6raHbpUjZdu8n9/GSeKhCcMFe93GyIUnQOLcxgXjGgYunyRuaBiusolz20Pj6aHDYAVn2zXx9NBJgmtl9zbMJrxChwEu2HuseJM9Ewd7qNvETRIPNcxD4+mh2fa6jRHBbnuPFS/BxIXEEbddAxPntvtulfcQ9xo9EzdJ3HCrcK2MyzDv3MYIX0hwDYOVOElwhcS9s02cYa6BiXObuHi671Z5jxVvsmcPhd3bbeJGrxtOEg9NGC7Y6zZG7moYLth7MsBoeRhXSBwxzDWwdxhg5P1E9zplu2YY4IKJcxvXyrhglxvmndtOwN5PdFawhw4D4rYK18ru7bYbThKXhsR7rHiTZXsoTJzbuGDvsQKj5WFvPDHyuv1GYfd22zXHCuJOgMTF03uIw8hTh4H346AV/DYOA+KyTZzbHhpPDx0GKzjbromnh04SXCu7t2E24RU6DNwUJs7tt3Gr7PYMYHBjpKCw879LC8A8H3IyCl/tdhJG36s4PhRWRm55x9XbTvZM575LT1uAO6/1WMH2JgmdA2BfCmtT3qc3O/q0Wmd/Nx4tzZfMysqv6OpSzs39P2FfiONHTt6UX9F5S6m1hO2GhEuC0khk1qaCio7uFQLbN4wEcUjAsDcOe93GyF3dtnus4LgKdqTslRZP4twmLp4eulW44LfRbfeeJK7ZKq9hGLlrPD0UJs5tXLA32xitSLc91DDvJMHI6/YbhT3U7dccBibzUxnRR/MZlp7SaDT/x/IXCuuR51MPh2efPECePdEjswaT3vyURvMzCl961h/2QmHtU82dy62jV79T32wfU16d+VNlmB03GhA78Pz8/wCEjIQrevfW1wAAAABJRU5ErkJggg==",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 410 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Office Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 98, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											`${body?.Installment_Month ? "Installment Month: " : ""}` +
											`${
												body?.Installment_Month
													? body?.Installment_Month?.split("-")[1] == 10
														? body?.Installment_Month
															? fullMonthsArr[body?.Installment_Month?.split("-")[1] + ""]
															: ""
														: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
													: ""
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: `${
									body?.Installment_Month ? "Installment Year : " + body?.Installment_Month?.split("-")[0] : ""
								}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `${
											typeof FormatedDueDate != "undefined" && FormatedDueDate
												? "Due Date : " + `${FormatedDueDate}`
												: ""
										}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							},
							{
								width: "30%",
								fontSize: 11,
								text: `${body?.INSTRUMENT_NO ? "Instrument No : " + `${body?.INSTRUMENT_NO}` : ""}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "34%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `${FormatedDate ? `Instrument Date: ${FormatedDate}` : ""}`,

										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Horizontal Line

					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -15,
										y1: 10,
										x2: 529,
										y2: 10,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader1,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: "Tax Payment Detail",
										bold: true
									}
								],
								margin: [0, 5, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "35%", "35%", "20%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								absolutePosition: { x: 40, y: 700 },
								width: "50%",
								stack: [
									{
										// absolutePosition: { x: 70, y: 780 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, 70, 20, 0]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/voucherRCReport/" + `VoucherRCReport-${body.INS_RC_ID}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			return error;
		}
	};
	static transferFeeGenerator = async (body, rows) => {
		const fonts = {
			Roboto: {
				normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
				bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
				italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
				bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
			}
		};

		function formatTimestampf(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			let timestampDay = dateFromTimeStamp.getDate();

			// if(typeof simple != "undefined" && simple == 1) {
			//     timestampDay = dateFromTimeStamp.getDate();
			// }
			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}

		let FormatedDate = "";
		if (body && body?.INSTRUMENT_DATE) {
			FormatedDate = formatTimestampf(body.INSTRUMENT_DATE);
		}
		let FormatedDueDate = "";
		if (body && body?.Booking_Installment_Details?.Due_Date) {
			FormatedDueDate = formatTimestampf(body?.Booking_Installment_Details?.Due_Date);
		}
		let FormatedInstallmentDate = "";
		if (body && body?.Booking_Installment_Details?.Installment_Month) {
			FormatedInstallmentDate = formatTimestampf(body?.Booking_Installment_Details?.Installment_Month, 1);
		}
		const formattedDate = formatTimestampf(new Date());
		const IRC_FormatedDate = formatTimestampf(body?.IRC_Date);
		const printer = new Pdfmake(fonts);

		try {
			let dataArr = [];
			let dataArr1 = [];

			let dataNArr = [
				{
					text: "Sr No",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Details",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				}
			];

			dataNArr.push({
				text: "Date",
				fontSize: 9,
				bold: true,
				fillColor: "#c8c5c8",
				borderColor: " #91CBFF",
				margin: 2,
				alignment: "center"
			});

			dataNArr.push({
				text: "Amount",
				fontSize: 9,
				bold: true,
				fillColor: "#c8c5c8",
				borderColor: " #91CBFF",
				margin: 1,
				alignment: "center"
			});

			dataArr.push(dataNArr);

			dataArr1.push([
				{
					text: "Sr No",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Details",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Date",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);
			let total = 0;
			for (let i = 0; i < rows.length; i++) {
				total += +rows[i]?.Installment_Paid;

				let dataNeArr = [
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${body?.Installment_Type?.Name}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					}
				];

				dataNeArr.push({
					text: `${formattedDate}`,
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				});

				dataNeArr.push({
					text: `${rows[i]?.Installment_Paid}`,
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				});

				dataArr.push(dataNeArr);

				dataArr1.push([
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: `${body?.Installment_Type?.Name}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${formattedDate}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					},
					{
						text: `${rows[i]?.Installment_Paid}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					}
				]);
			}

			const totalAmout = [
				{
					text: "",
					fontSize: 11,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					alignment: "right"
				},
				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			const totalAmout1 = [
				{
					text: "",
					fontSize: 11,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					alignment: "right"
				},
				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			dataArr.push(totalAmout);

			dataArr1.push(totalAmout1);

			// dataArr1 = dataArr;

			let newArray = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];

			let newArray1 = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];
			let arrHeader = [newArray];
			let arrHeader1 = [newArray1];

			const arrayNewTableData = [
				{
					text: `${body?.Member?.BuyerName}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];

			const arrayNewTableData1 = [
				{
					text: `${body?.Member?.BuyerName}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];
			arrHeader.push(arrayNewTableData);
			arrHeader1.push(arrayNewTableData1);

			var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			var fullMonthsArr = [
				"",
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			];

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Payment Receipt",
								fontSize: 11,
								bold: true,
								margin: [-10, 40, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},

							// 2nd Heading with below sub-heading///
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User?.name || ""}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],

								alignment: "right"
							}
						]
					},

					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 570,
										y2: 25,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 820,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 25,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 570,
										y1: 25,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									}
								]
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 110 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Customer Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 79, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											`${body?.Installment_Month ? "Installment Month: " : ""}` +
											`${
												body?.Installment_Month
													? body?.Installment_Month?.split("-")[1] == 10
														? body?.Installment_Month
															? fullMonthsArr[body?.Installment_Month?.split("-")[1] + ""]
															: ""
														: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
													: ""
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: `${
									body?.Installment_Month ? "Installment Year : " + body?.Installment_Month?.split("-")[0] : ""
								}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
							//   {
							//   width: "17%",
							//   fontSize: 11,
							//   text: "Customer Copy",
							//   alignment: "right",
							//   decoration: "underline",
							//   bold: true,
							// },
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "70%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},

							{
								width: "30%",
								fontSize: 11,
								text: "Instrument No : " + `${body?.INSTRUMENT_NO}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
								// margin: [0, 0, -25, 0],
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "70%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "30%",
								fontSize: 11,
								text: [
									{
										text: `Instrument Date: ${FormatedDate}`,
										bold: true
									}
								],
								alignment: "left"
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},

					// Horizontal Line
					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -5,
										y1: 12,
										x2: 530,
										y2: 12,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: "Transfer Fee Receipt",
										bold: true
									}
								],
								margin: [0, 20, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "35%", "35%", "20%"],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								width: "100%",
								stack: [
									// {
									//   canvas: [
									//     {
									//       type: "line",
									//       x1: 0,
									//       y1: 0,
									//       x2: 200,
									//       y2: 0,
									//       lineWidth: 0.5,
									//     },
									//   ],
									//   alignment: "left",
									//   margin: [10, 50, 0, 8],
									// },
									{
										// absolutePosition: { x: 50, y: 350 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, 5, 20, 0]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					},

					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 5, 0, 0]
					},
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 15, 0, 10]
					},

					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Payment Receipt",
								fontSize: 11,
								bold: true,
								margin: [3, 50, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},
							// 2nd Heading with below sub-heading
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User?.name || ""}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],
								alignment: "right"
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 410 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Office Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 98, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											`${body?.Installment_Month ? "Installment Month: " : ""}` +
											`${
												body?.Installment_Month
													? body?.Installment_Month?.split("-")[1] == 10
														? body?.Installment_Month
															? fullMonthsArr[body?.Installment_Month?.split("-")[1] + ""]
															: ""
														: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
													: ""
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: `${
									body?.Installment_Month ? "Installment Year : " + body?.Installment_Month?.split("-")[0] : ""
								}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
							//   {
							//   width: "17%",
							//   fontSize: 11,
							//   text: "Customer Copy",
							//   alignment: "right",
							//   decoration: "underline",
							//   bold: true,
							// },
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "70%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},

							{
								width: "30%",
								fontSize: 11,
								text: "Instrument No : " + `${body?.INSTRUMENT_NO}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "70%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "30%",
								fontSize: 11,
								text: [
									{
										text: `Instrument Date: ${FormatedDate}`,

										bold: true
									}
								],
								alignment: "left"
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Horizontal Line

					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -15,
										y1: 10,
										x2: 529,
										y2: 10,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader1,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: "Transfer Fee Receipt",
										bold: true
									}
								],
								margin: [0, 20, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["10%", "35%", "35%", "20%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								absolutePosition: { x: 40, y: 700 },
								width: "50%",
								stack: [
									// {
									//   canvas: [
									//     {
									//       type: "line",
									//       x1: 0,
									//       y1: 0,
									//       x2: 200,
									//       y2: 0,
									//       lineWidth: 0.5,
									//     },
									//   ],
									//   alignment: "left",
									//   margin: [10, 50, 0, 8],
									// },
									{
										// absolutePosition: { x: 70, y: 780 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, 60, 20, 80]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/voucherRCReport/" + `VoucherRCReport-${body.INS_RC_ID}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			// console.log('error==========', error)
			return error;
			// return error;
			// console.log('error==========', error)
		}
	};
	static NDC_Report_Generator = async (body, rows, outstandingAmt, user) => {
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			const printer = new Pdfmake(fonts);

			var data = [];
			data["invoicenumber"] = `${"ZXCV"} ${"CVBX"}`;
			data["buyeraddress"] = "";
			data["item"] = "";
			data["price"] = 0;

			let dataArr = [];
			let dataArr1 = [];

			function formatTimestampf(timestamp, simple) {
				if (!timestamp) {
					return "n/a";
				}

				const dateFromTimeStamp = new Date(timestamp);
				const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

				dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
				let timestampDay = dateFromTimeStamp.getDate();

				// if(typeof simple != "undefined" && simple == 1) {
				//     timestampDay = dateFromTimeStamp.getDate();
				// }
				const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
				const timestampYear = dateFromTimeStamp.getFullYear();

				const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

				return formattedStampDate;
			}
			const FormatedStampDate = formatTimestampf(body.IRC_Date, 1);
			const expiryDate = formatTimestampf(body?.Voucher?.VOUCHER_EXPIRY_DATE);

			dataArr.push([
				{
					text: "Details",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr.push([
				{
					text: "Outstanding Installment Amount (Cost of Land)",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: outstandingAmt,
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr.push([
				{
					text: "Surcharge Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: "0",
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr.push([
				{
					text: "Other Charges Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: "0",
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr.push([
				{
					text: "Total OutStanding Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: outstandingAmt,
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);

			dataArr1.push([
				{
					text: "Details",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 8,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);
			dataArr1.push([
				{
					text: "Outstanding Installment Amount (Cost of Land)",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: outstandingAmt,
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr1.push([
				{
					text: "Surcharge Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: "0",
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr1.push([
				{
					text: "Other Charges Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: "0",
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);
			dataArr1.push([
				{
					text: "Total OutStanding Amount",
					fontSize: 8,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "right"
				},
				{
					text: outstandingAmt,
					fontSize: 8,
					bold: true,
					margin: 2,
					alignment: "right"
				}
			]);

			let marginSign = 28;

			if (rows.length == 1) {
				marginSign = 78;
			} else if (rows.length == 2) {
				marginSign = 58;
			} else if (rows.length == 3) {
				marginSign = 48;
			} else if (rows.length == 4) {
				marginSign = 38;
			}

			// dataArr1 = dataArr;

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						// Header Section
						columns: [
							// Image
							{
								image:
									"data:image/png;base64,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",
								fit: [150, 150],
								alignment: "left",
								margin: [0, 0, 0, 0]
							},
							// First Heading
							{
								width: "40%",
								text: "Victoria Estate (Pvt) Ltd",
								fontSize: 16,
								bold: true,
								alignment: "center",
								margin: [0, 7, 0, 0]
							},
							// 2nd Heading with below sub-heading
							{
								// width: "38%",
								stack: [
									{
										width: "40%",
										text: "VICTORIA CUSTOMER SUPPORT CENTER 11-F-2 Wapda Town Lahore.Phone Toll Fee 0800-18888",
										alignment: "left",
										fontSize: 9,
										margin: [0, 10, 0, 0]
									}
								]
							}
						]
					},
					{
						fontSize: 12,
						text: "NDC Report (Client Copy)",
						alignment: "center",
						bold: true,
						margin: [0, 0, 0, 0]
					},
					{
						fontSize: 9,
						text:
							"NDC Report is hereby being issued on the Request of " +
							body?.Member?.BuyerName +
							" ,S/O,D/O,W/O, having CNIC " +
							body?.Member?.BuyerCNIC,
						alignment: "left",
						margin: [3, 15, -20, 10]
					},

					// Details Section
					{
						columns: [
							// Name

							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Registration NO : " + body?.Booking?.Reg_Code_Disply,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "40%",
								fontSize: 10,
								text: [
									{
										text: "NDC/RC No : " + body.IRC_NO,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 20, 0, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Category : " + body?.Booking?.UnitType?.Name,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "45%",
								fontSize: 10,
								text: [
									{
										text: "NDC Date : " + FormatedStampDate,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 12, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Application For : " + body?.Booking?.PlotSize?.Name,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "38%",
								fontSize: 10,
								text: [
									{
										text: "Expire Date : " + expiryDate,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "",
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "45%",
								fontSize: 10,
								text: [
									{
										text: "NDC Fee Paid : " + body.Installment_Paid,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 6, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["70%", "30%"],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					//  Note Section
					{
						text: "Note : This NDC Report shall expire after expiry date thereafter new NDC report shall be needed for transfer.",
						bold: true,
						fontSize: 9,
						margin: [10, 5, 0, 5]
					},
					{
						text: "For Futher Details Contact 0800-18888",
						bold: true,
						fontSize: 9,
						margin: [38, 0, 0, 5]
					},

					// Signature Section
					{
						columns: [
							{
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 0,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "left",
										margin: [5, -40, 0, 8]
									},
									{
										// absolutePosition: { x: 50, y: 350 },
										text: `Generated By: ${user.name}`,
										alignment: "left",
										fontSize: 11,
										bold: true,
										margin: [25, 5, 0, 0]
									}
								],
								alignment: "left"
							},
							{
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 10,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "center",
										margin: [15, -40, 0, 8]
									},
									{
										text: "Applicant Signature ",
										alignment: "center",
										fontSize: 11,
										bold: true,
										margin: [15, 5, 0, 0]
									}
								],
								alignment: "right"
							}
						],
						margin: [0, marginSign, 0, 0]
					},

					//hillo
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 10,
								x2: 516,
								y2: 10,
								dash: { length: 4, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 5, 0, 0]
					},
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 10,
								x2: 516,
								y2: 10,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 15, 0, 10]
					},

					{
						columns: [
							{
								width: "100%",
								stack: [
									{
										text: "Office Use Only",
										bold: true,
										fontSize: 10,
										bold: true,
										margin: [0, 0, 0, 0]
									}
								],

								alignment: "center"
							}
						]
					},
					{
						fontSize: 9,
						text:
							"NDC Report is hereby being issued on the Request of " +
							body?.Member?.BuyerName +
							" ,S/O,D/O,W/O, having CNIC " +
							body?.Member?.BuyerCNIC,
						alignment: "left",
						margin: [3, 15, -20, 5]
					},

					{
						columns: [
							// Name

							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Registration NO : " + body?.Booking?.Reg_Code_Disply,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "40%",
								fontSize: 10,
								text: [
									{
										text: "NDC/RC No : " + body.IRC_NO,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this details section
						margin: [0, 20, 0, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Category : " + body?.Booking?.UnitType?.Name,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "45%",
								fontSize: 10,
								text: [
									{
										text: "NDC Date : " + FormatedStampDate,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 12, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "Application For : " + body?.Booking?.PlotSize?.Name,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "38%",
								fontSize: 10,
								text: [
									{
										text: "Expire Date : " + expiryDate,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "55%",
								fontSize: 10,
								text: [
									{
										text: "",
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "45%",
								fontSize: 10,
								text: [
									{
										text: "NDC Fee Paid : " + body.Installment_Paid,
										bold: true
									}
								],
								alignment: "left",
								margin: [0, 0, 6, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					{
						table: {
							headerRows: 1,
							widths: ["70%", "30%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					// Terms & Conditions Section
					{
						text: "Note : This NDC Report shall expire after expiry date thereafter new NDC report shall be needed for transfer.",
						bold: true,
						fontSize: 9,
						margin: [10, 5, 0, 5]
					},
					{
						text: "For Futher Details Contact 0800-18888",
						bold: true,
						fontSize: 9,
						margin: [38, 0, 0, 5]
					},

					{
						columns: [
							{
								absolutePosition: { x: 40, y: 705 },
								width: "50%",
								stack: [
									{
										canvas: [
											{
												type: "line",
												x1: 0,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "left",
										margin: [5, 70, 0, 8]
									},
									{
										// absolutePosition: { x: 70, y: 780 },
										text: `Generated By: ${user.name}`,
										alignment: "left",
										fontSize: 11,
										bold: true,
										margin: [25, 5, 0, 0]
									}
								],
								alignment: "left"
							},
							{
								absolutePosition: { x: 290, y: 705 },
								width: "50%",
								stack: [
									{
										canvas: [
											{
												// absolutePosition: { x: 290, y: 580 },
												type: "line",
												x1: 10,
												y1: 0,
												x2: 200,
												y2: 0,
												lineWidth: 0.5
											}
										],
										alignment: "center",
										margin: [10, 70, 0, 8]
									},
									{
										// absolutePosition: { x: 270, y: 780 },
										text: " Applicant Signature",
										alignment: "center",
										fontSize: 11,
										bold: true,
										margin: [5, 5, 0, 0]
									}
								],
								alignment: "right"
							}
						],
						margin: [0, 40, 0, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			let fullName = data?.invoicenumber;
			let username = fullName.replace(/\s/g, "").toLowerCase();
			const filePath = "uploads/ndcfee/" + `NDCFee-Report-${body.INS_RC_ID}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM", filePath);
			return filePath;
		} catch (error) {
			// return "";
			return error;
			// console.log('error==========', error)
		}
	};

	static padWithZeros = (number, width) => {
		const numberString = number.toString();
		const zerosToAdd = width - numberString.length;
		if (zerosToAdd <= 0) {
			return numberString;
		} else {
			const zeroString = "0".repeat(zerosToAdd);
			return zeroString + numberString;
		}
	};

	static sampleLetter = async (index, body, user) => {
		const { Status, Reg_Code_Disply } = body;
		try {
			// var monthsArr = [
			//   "",
			//   "Jan",
			//   "Feb",
			//   "Mar",
			//   "Apr",
			//   "May",
			//   "Jun",
			//   "Jul",
			//   "Aug",
			//   "Sept",
			//   "Oct",
			//   "Nov",
			//   "Dev",
			// ];
			// var currentDate = new Date();
			// var year = currentDate.getFullYear();
			// var month = monthsArr[currentDate.getMonth() + 1]; // Months are zero-based, so we add 1
			// var day = currentDate.getDate();

			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var docDefinition = {
				header: {
					columns: [
						{
							width: "100%",
							height: 400,
							image:
								"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAQ4CAYAAADsEGyPAAAgAElEQVR4nOzdB9gkVZU47jMwZAQRBQwoillWFnHFnDDn1TWnFcWcc44omN01R8yrrmtY2TXjKmBAkTVgwIgoooAgMOSZ+T9398zz/3693zdf3erq7qru932efmBmuqtu3aqurjp17zkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAhQcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBUPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAVDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgyiLi3zcZ6EWRBwk5AAAAAElFTkSuQmCC",
							fit: [260, 260],
							alignment: "center",
							margin: [0, -50, 0, 5]
						}
					]
				},
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						width: "100%",
						columns: [
							{
								width: "53%",
								stack: [
									{
										text: `File Status : ${Status}`,
										bold: true,
										fontSize: 12,
										margin: [147, 0, 0, 0]
									},
									{
										text: [
											{
												text: `Member Name : ${body["Member.BuyerName"]} `,
												fontSize: 9
											}
										],
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `Phone NO :          ${body["Member.BuyerContact"]}`,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body["Member.PermanantAddress"]}`,
										margin: [0, 10, 0, 0],
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10
							},
							[
								{
									text: `Reference # CROS3${this.padWithZeros(index, 4)}`,
									alignment: "left",
									fontSize: 7,
									bold: true,
									margin: [100, -10, 0, 0]
								},
								{
									text: `Registration No : ${Reg_Code_Disply}`,
									alignment: "left",
									fontSize: 9,
									bold: true,
									margin: [30, 52, 0, 0]
								},
								{
									text: `Category : ${body["UnitType.Name"]}`,
									alignment: "left",
									bold: true,
									fontSize: 9,
									margin: [30, 50, 0, 0]
								},
								{
									text: `Size : ${body["PlotSize.Name"]}`,
									fontSize: 9,
									bold: true,
									alignment: "left",
									margin: [30, 0, 0, 0]
								},

								{
									text: `Printing Date : ${moment(new Date()).format("DD-MMM-YYYY")}`,
									fontSize: 8,
									bold: true,
									margin: [30, 5, 0, 0],
									bold: true
								}
							]
						],
						margin: [0, 80, 0, 0]
					},

					{
						text: "Subject :",
						margin: [0, 45, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: "Third Notice For Clearance of Outstanding Dues.",
						margin: [40, -12, 0, 0],
						fontSize: 10,
						bold: true,
						decoration: "underline"
					},

					{
						text: "Respected Client,",
						margin: [0, 23, 0, 0],
						fontSize: 10
					},
					{
						text: `I hope this letter finds you well.

            You are requested to kindly clear your outstanding dues within 7 days of receipt of this notice to avoid
            any adverse action being taken against your booking.

            Kindly ignore this notice if you have already cleared the outstanding amount.

            Thanking you in anticipation!`,
						margin: [0, 23, 0, 0],
						fontSize: 10,
						lineHeight: 1.5
						//   bold:true,
					},
					{
						text: "Sincerely , ",
						margin: [0, 50, 0, 0],
						fontSize: 10
					},
					{
						image:
							"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCACGAO8DASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAUGBwgJBAMBAv/EADoQAAEEAgIBAgMFBgILAAAAAAEAAgMEBQYHERIIIRMiMQkUMkFxFTNCUWGBJJIjJWNzg4SRlKGxwf/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAJhEBAQABAwEHBQAAAAAAAAAAAAERAiExEgMEExRRcaEiQbHh8P/aAAwDAQACEQMRAD8A6poiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAq1vfImk8Y6/NtW+7LSwuLhIZ8e1J0XyH8McbR26SR30axgLnH2AJVC5B5mz1vPWuL+CcHV2fdK7mx5K5Ze5uH1wOHYfemb7ul6+ZtWPuVw6J+G0h69Ohen/DYHOV+QuRc3b37fo2EDPZdjfCj3+JmPqj/AEVKP/dj4jh+N7z7qySb0VeztvqU5nhB4twlTirWZwfDYNroG1mrDPykr4vyayAH8jZf5dEdxBYq9QnDdjgjhzZeZbfqf5kt7nia4lxdqfYya1nJPcGwVm49jBC6KSUtaYvF3ykn8u1uRlsrjsHjLWazF+CjQowvsWbNiQMihiY0uc9zj7NaACST+QWsGkYzI+sDkvEc47LWuU+JtLtmxoeIssMbs9kGEj9tzxn3ETPpXY4dn3k+UHp29F3zxINhuN724ZTj3Wclv+Ohx+y2sRTmzFSE9sguuhaZmD+geXDr8uvqfqrOiLnQREQEREBERAREQEREBERAREQEREBERAREQERQ+z7Pr2mYC/tO2ZqpisPi4HWLl23KI4oI2/VznH6f/T0B7pyPfct1cfUmvXbMUFavG6WWaV4YyNjR25znH2AABJJWB6++7f6mJpqHEWUua5xnHK6ve3WIfDu5vxJbJDiA4fJF2C111w+vYhBI+I3E+FzG5faFbBJMyHJaz6cMRbLHNcHV7u9Txu92u+jo6LXD5gOi4jo/N2IdzcZjsfhsdVxOJowUqNKFletWrxiOKGJgDWsY0ezWgAAAewAW9Wno2vP4TlFaVoup8ca7W1TS8HXxWKqdlkMIPb3uPb5HuPbpJHHsue4lziSSSSpW9kKWKoz5PJW4KlOpE6exYnkEccUbR257nO6DWgAkk+wAXw2HYcHqWDvbJsuWq4zFY2B9m3ctSCOKCJo7c5zj7AALXhmG2D1jW4MrslXI4Lg+GRk9HDzsdXubm5rvJli032dDj+wHRwnp83s9/i3xacyZ3qoSxHnfXNsVfqO9iPT/AIS6XvMhdDNvtiJ3ygN9nNxzXN77P70/Qe3bNrKlWvQqw0qdeOCvAxsUUUTA1kbGjprWtHsAAAAAlOnVx9WCjRqx1q1eNsMMMTAxkbGjprWtHsAAAAB7AL0pbnb7AiIoCIiAiIgIiICIiAiIgIiICIiAiIgIiICIiDy3LlbHVJ8jetRVq1aN0000rwxkcbR25znH2AABJJ+gC0NvYHZvtJOT2371nI4j026ZeLKrGOfBJud6N3TpW/Qiu0jxD/qB2G9Pe74Vz9Z+zZ7lblrjv0R6xk7OOg3sOze5W6ziyVuBhLyYGu/ITGCZp/q1jT21zgdstY1vA6br+O1TWMVXxmJxVZlOnUrs8Y4YmDprQP0H6n6ldNN8KdU5vwnL74XC4jXMTSwGBxtbH43HwMrVKlaMRxQRMAa1jGj2a0AAABRe+8gafxfqt7dd8z1bD4bHM8p7M5PXZ9msa0due9x6DWtBc4kAAlV7mrnHSeC9aZndqnms3r0n3bD4aiz4t/LWj+GCvEPdx7I7d+FoPbiAtZ/TpyVxR6m+QpeTOWOW9azO265bJwWixW3Nx2skeQEsfxWsbkbfQPlaZ5xsP7sgeLlmabZ1XhWS8Bo25epvN0uQ+asLZwnHtKVlvWdBtDqS84HuO/mG/Rzvo6Ooe2s9i/t3YGyDWhoDWgAD2AH5LAvKPrZ9P3G3GE/J1PesZtcDrsuJxtHA247VjI5FgaTWjDSeiPNhc4+zWvaffyaHYes/aq8OatmsVrPJumbBruXmxbrmbr13R3hhLnzllGYt8XOmLWs8gGgxukax4a5snhqaNeviJlu6i540vtT9hOGsftTgiZuzbTYibx7r9W+ZrmSrzOLYprkYb5QsJ8Cwj3l8vkb4j4imOVvtBeQMPicPxro+t6i3l+KD79uPxch9717Vq8TiZRYtNcwGQN8A5rXEMc4sDnv8Q6+Br9DMb7IuT3I/2i3L2bua3ydiM7X1jVsK5kFLDY4N+8bvkWgMsv8AhzNc+vjmvD2h72+X8Le5fL4NOy/qv5W1Hb7cOG53s7BytvvjTyl5+UFfTtSieQDFVY5xhnliAIdZ/dR9P8fiuJetTu2umY7FMs15ZpK0diN8sPRkja8FzO/p2PqO+j0vPm87hdaxdnO7Fl6WLxtKMy2bl2wyCCBg+rnveQ1o/qSuMWzczavw/hLfEvAUe27RvfJ9aKrtHJ9+C067l4ZZCHsxVd/Uj43EOa2U9Od0fcnxc37Yufn7mS9FxHs3HPK25Y3jyFww+lZgzQC9O3ye61mbjywhjT4hkDT5FpZFG9p7kffLXm3Yy6v7P6h+DtPoa5kth5V1yvU2+ZkODnZeZMzIFzg0OiMfkHM7IBf+AEjsjtTUvLHGEF7PY2bkPXG3NWg+85uucpD8XGRdd+dhnl3E3oj3cB9VyL070v8Ard5Jx2b5Dp8PswmyY1rKuHfmGMxMlGsHdCrh6MgZFWLfN7/jP6A/FG5snk5+R+F/s3OdLe2anjeaMFj8XomSfLe3GHH51s2RvTR+UkUV2Vp+dr5RH02FzmtaC4kSfObey0aZvqMuiPCHPvG/qG129tXGWQu3MbQvyY+SazRlrh72fxM8wA9hBBBH6EA9hZKUZr2u4PU8JS1zWsTVxmKx0La9SnViEcUEbR0GtaPYBSa81xnZRERAREQEREBERAREQEREBERBql6huKuRtX9R2kerrizVJNufgcTNrmz69WmbHdsY17pHNnqB5DZJYzK8mMkF3iwD6kjw8pfaG6Tg6VrU+I+Pd53HlPwDY9Pk1XI1LVJzmgiS22SIERgFp6j8i7tvRAPmJvmL1B73vO+2fTf6UxUu7dA0DadtlYJsbqEDux831bNcPR8Iffoj5genBt74i4x4b9OeNtYOps1OXZsoRdz+czeRjdlsvO7smexI93kR2XeLR8rez0OySemZidX97p7OTm8WfWdz5yXkNFi4r22Lf83F90z2Rv1HQzQ1Xg91YZHhsOOx/j2CGEOl7d8SSQPDBGVvswfWPQkxN2/xLXuRT3hDZp19ipMmjhaR258nxC1jHDyAc3yI692/QHsXsPqe9OOqlzNg530GnK36wv2GqZf7Rh5cf+i8FL1S8V50AaVBuG2F34X4TUMpZgP/ADPwBAP7yBdp3jXJ9OnZMRzm0/0C+s+Dk3IBup6XrEeLxktXWM9+0/i43BtJc4GjC0vn+8ElwE8zC9he+Yky+DxNU/sbOSqtHXMyOaddGxMtGzmo7GOktU4nB4cww+Y/xB9vmErGhxPX0+vRNvJ/IeT+XBen7a2A/hnzGRxdKF39mWZZh/eIL5nJepLIkCHUuOsBG76ST567k5B+sTKldvf9BIf1U8x2vrIuI1hs/ZWa7HvuK5BwvqA3ihlvurodgvubHLfyUkjSyaWGySDUL2Ocz2a/xb0Afr3J6j9k56dNd2HN3Mrmdsz2AyocYsBayJhrwPIIa90kPjJM6Pyd8MuPy9nvyPutjo9b9QltwdkuWdOqMI/d43TZ2uH/ABJr8gP6+A/RetnHO9ytDr3PW3h/XTm08dh4oz+gfSkeP86x43acdRhibU/s5vSHqurSarLxTWzkctltqS9lrMk10ub34tEzS1zGAE9sZ4td/EHH3WR8/wCl/wBPG0w69W2DhrUrkGqRiDDwvxsYjqxA+Xwg0AB0fkS7wcC3sk9dklS0fEtSUf633/eskfz8tgmqd/8AafB6/t0knCmg2O/vw2K+D7Ft7acpab1/LxlsOHX9ljr1W72rhbP2XhoJK9sY+nG+hEYq8nwWAwR9dFrD18regB0Oh7KJy3J3G2A7Gd5B1rGkfUW8tXh6/wAzwq8/04cBzuDr/DenZB49w/IYeC27v+flM1x7Uxj+H+JsT4fsri/Uafw/Zn3fCVo/H9PFg6WdhVMp6tPTJhpPg3OedGfKPb4dbNwWX9/y8YnOP/hVzHeun0s5Tc4dGh5WqwZG1G19d9ylZq1p3Od4iNk8sbWOd2R7A+/fsT0QM6V8bjqQ/wAFQr1x/soms/8AQX9SU6s0sc8teOSSEkxvcwFzCfr0T9EzPT5/QWrdWjWku3LMVevC0vklleGMY0fUkn2A/qq/o/JfHnJtCfJ8dbxgtmq1Jvu9ibFX4rTYZeu/B5jJ8Xde/R6PSl83gsJs2LsYPY8PSyuNtt8LFO7XZPBM3sHp8bwWuHYB6I/JROm8acdccx2oOPdB1zV4772yW2YbFwUm2HN7DXSCJrfIjs9E99dlTbAs6IiAiIgIiICIiAiIgIiICIiCC1jStP0qO/Bp+rYrCR5O7LkbrcfUjrizakPck0gYB5Pd0O3H3Kx5yL6SfTjy1uI37kXiTC53PljI33bIkDpWsaGsEjWuDZAGgAeQPsOlmBEzZcik6dwrw/x6WO0TivUtecz3EmMw1es/v+ZcxgJP9Se1dV+ombeQREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQf/Z",
						fit: [180, 180],
						margin: [-30, 15, 0, 0]
					},

					{
						text: "Lt.Col. Anwer Mahmood",
						margin: [0, 45, 0, 0],
						fontSize: 10
					},
					{
						text: "Society Administrator",
						margin: [0, 15, 0, 0],
						fontSize: 10,
						bold: true
					}
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

			const filePath = "uploads/sampleLetter/" + body.Reg_Code_Disply + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO", error);
		}
	};

	static ballotAllotLetter = async (body, index, data) => {
		try {
			// const UnitTypes = await UnitType.findOne({ UType_ID: body.UType_ID });

			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var docDefinition = {
				pageMargins: [70, 0, 70, 0],
				content: [
					{
						width: "40%",
						columns: [
							{
								width: "100%",
								stack: [
									{
										text: `Reference # VCPAL02${this.padWithZeros(index + 1, 4)}`,
										alignment: "left",
										fontSize: 9,
										bold: true
										// margin: [350,40,0,0],
									},
									{
										text: `Registration No : ${body.Reg_Code_Disply}`,
										alignment: "left",
										fontSize: 9,
										bold: true
										// margin:[350,10,0,0]
									},
									// {
									//   text: `Phase 1 ( Sector A )`,
									//   alignment: "left",
									//   fontSize: 9,
									//   bold:true,
									//   margin:[30,10,0,0]
									// },
									// Block: ${data.Block}
									{
										text: [
											{ text: `Plot Number:` },
											{ text: `( ${data.Plot} )`, bold: true },
											{ text: " Block: " },
											{ text: `${data.Block}`, bold: true }
										],
										alignment: "left",
										fontSize: 9
										// margin:[350,7,0,0]
									},
									{
										text: [{ text: "Category : " }, { text: `${data?.Category}`, bold: true }],
										alignment: "left",
										fontSize: 9
										// margin:[350,5,0,0]
									},
									{
										text: [{ text: "Plot Size : " }, { text: `${data.Size}`, bold: true }],
										fontSize: 9,
										alignment: "left"
										// margin:[350,5,0,0]
									},

									{
										text: `Printing Date : ${moment(new Date()).format("DD-MMM-YYYY")}`,
										fontSize: 8,
										// margin:[350,5,0,0],
										bold: true
									}
								]
							}
						],
						margin: [320, 40, 0, 0]
					},

					{
						width: "100%",
						columns: [
							{
								width: "50%",
								stack: [
									{
										text: [
											{
												text: `Member Name :  ${body?.Member?.BuyerName}`,
												fontSize: 9
											}
										],
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `Member CNIC :   ${body?.Member?.BuyerCNIC}`,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `Phone No :          ${body?.Member?.BuyerContact}`,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.Member?.BuyerAddress}`,
										margin: [0, 10, 0, 0],
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10
							},
							{
								width: "50%",
								stack: [
									{
										text: [
											{
												text: `${
													body?.SecondMember?.BuyerName ? `Member Name :  ${body?.SecondMember?.BuyerName}` : ""
												}`,
												fontSize: 9
											}
										],
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `${
													body?.SecondMember?.BuyerCNIC ? `Member CNIC :   ${body?.SecondMember?.BuyerCNIC}` : ""
												}`,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `${
													body?.SecondMember?.BuyerContact
														? `Phone No :          ${body?.SecondMember?.BuyerContact}`
														: ""
												}`,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.SecondMember?.BuyerAddress || ""}`,
										margin: [0, 10, 0, 0],
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10,
								margin: [60, 0, 0, 0]
							}
						],
						margin: [0, 10, 0, 0]
					},

					{
						text: "Subject :",
						margin: [0, 45, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: "Provisional Allotment Letter",
						margin: [50, -12, 0, 0],
						fontSize: 10,
						bold: true,
						decoration: "underline"
					},

					{
						text: "Dear Valued Member,",
						margin: [0, 23, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: "Congratulations!",
						margin: [0, 8, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: `The Management of Victoria City is pleased to inform you that the above cited Plot Number has been provisionally allotted (to you) subject to the terms and conditions as mentioned on Booking Application Form and submission of necessary documents.


            (This letter is only for the purpose of information and is not a proof of ownership.)

            Regards ,`,
						margin: [0, 23, 0, 0],
						fontSize: 10,
						lineHeight: 1.5
					},

					{
						text: "Lt.Col. Anwer Mahmood",
						margin: [0, 80, 0, 0],
						fontSize: 10
					},
					{
						text: "Society Administrator",
						margin: [0, 10, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: [
							{
								text: "(For any discrepancy, please contact this office within 15 days from the Printing date i.e "
							},
							{
								text: `${moment(new Date()).format("DD-MMM-YYYY")}`,
								bold: true
							},
							{
								text: " Possibility of an error is not precluded and is subject to correction.)"
							}
						],
						margin: [0, 10, 0, 0],
						fontSize: 10
					}
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

			const filePath = "uploads/ballotAllotLetter/" + body.Reg_Code_Disply + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("ERRRRRRRRRRRRRRRRRRRRR", error);
		}
	};

	static developmentChargesLetter = async (body, index, data) => {
		try {
			// const UnitTypes = await UnitType.findOne({ UType_ID: body.UType_ID });

			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);
			let letterDetail;

			if (body?.SecondMember?.BuyerName) {
				letterDetail = [
					{
						width: "40%",
						columns: [
							{
								width: "100%",
								stack: [
									{
										text: `Reference # VCDC01${this.padWithZeros(index + 1, 4)}`,
										alignment: "left",
										fontSize: 9,
										bold: true
										// margin: [350,40,0,0],
									},
									{
										text: `Registration No : ${body.Reg_Code_Disply}`,
										alignment: "left",
										fontSize: 9,
										bold: true
										// margin:[350,10,0,0]
									},
									// {
									//   text: `Phase 1 ( Sector A )`,
									//   alignment: "left",
									//   fontSize: 9,
									//   bold:true,
									//   margin:[30,10,0,0]
									// },
									// Block: ${data.Block}
									{
										text: [
											{ text: `Plot Number:`, bold: true },
											{ text: `( ${body?.Unit?.Plot_No ?? "NIL"} )`, bold: true },
											{ text: " Block: ", bold: true },
											{ text: `${body?.Unit?.Block?.Name ?? "NIL"}`, bold: true }
										],
										alignment: "left",
										bold: true,
										fontSize: 9
										// margin:[350,7,0,0]
									},
									{
										text: [{ text: "Category : " }, { text: `${body?.UnitType?.Name ?? "NIL"}`, bold: true }],
										alignment: "left",
										bold: true,
										fontSize: 9
										// margin:[350,5,0,0]
									},
									{
										text: [{ text: "Plot Size : " }, { text: `${body?.PlotSize?.Name}`, bold: true }],
										fontSize: 9,
										bold: true,
										alignment: "left"
										// margin:[350,5,0,0]
									}

									// {
									//   text: `Printing Date : ${moment(new Date('2023-12-26')).format(
									//     "DD-MMM-YYYY"
									//   )}`,
									//   fontSize: 8,
									//   // margin:[350,5,0,0],
									//   bold: true,
									// },
								]
							}
						],
						margin: [320, 40, 0, 0]
					},
					{
						width: "100%",
						columns: [
							{
								width: "50%",
								stack: [
									{
										text: [
											{
												text: `Name  ${body?.Member?.BuyerName}`,
												bold: true,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `S/O, D/O, W/O  ${body?.Member?.FathersName}`,
												bold: true,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `Phone No  +${body?.Member?.BuyerContact.replace(/-/g, "")}`,
												bold: true,
												fontSize: 9
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.Member?.BuyerAddress}`,
										bold: true,
										margin: [0, 10, 0, 0],
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10
							},
							{
								width: "50%",
								stack: [
									{
										text: [
											{
												text: `${body?.SecondMember?.BuyerName ? `Name  ${body?.SecondMember?.BuyerName}` : ""}`,
												bold: true,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `${
													body?.SecondMember?.FathersName ? `S/O, D/O, W/O  ${body?.SecondMember?.FathersName}` : ""
												}`,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `${
													body?.SecondMember?.BuyerContact
														? `Phone No  +${body?.SecondMember?.BuyerContact.replace(/-/g, "")}`
														: ""
												}`,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.SecondMember?.BuyerAddress || ""}`,
										margin: [0, 10, 0, 0],
										bold: true,
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10,
								margin: [60, 0, 0, 0]
							}
						],
						margin: [0, 10, 0, 0]
					}
				];
			} else {
				letterDetail = [
					{
						width: "100%",
						columns: [
							{
								width: "50%",
								stack: [
									{
										text: [
											{
												text: `Name  ${body?.Member?.BuyerName}`,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 40, 0, 0]
									},
									{
										text: [
											{
												text: `S/O, D/O, W/O   ${body?.Member?.FathersName}`,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `Phone  +${body?.Member?.BuyerContact.replace(/-/g, "")}`,
												fontSize: 9
											}
										],
										bold: true,
										margin: [0, 10, 0, 0]
									},
									{
										text: `${body?.Member?.BuyerAddress}`,
										margin: [0, 10, 0, 0],
										bold: true,
										fontSize: 9
									}
								],

								alignment: "left",
								fontSize: 10
							},
							{
								width: "50%",

								stack: [
									{
										text: `Reference # VCDC01${this.padWithZeros(index + 1, 4)}`,
										fontSize: 9,
										margin: [0, 40, 0, 0],
										bold: true
										// margin: [350,40,0,0],
									},
									{
										text: `Registration No : ${body.Reg_Code_Disply}`,
										fontSize: 9,
										margin: [0, 10, 0, 0],
										bold: true
										// margin:[350,10,0,0]
									},
									// {
									//   text: `Phase 1 ( Sector A )`,
									//   alignment: "left",
									//   fontSize: 9,
									//   bold:true,
									//   margin:[30,10,0,0]
									// },
									// Block: ${data.Block}
									{
										text: [
											{ text: `Plot Number:`, bold: true },
											{ text: `( ${body?.Unit?.Plot_No ?? "NIL"} )`, bold: true },
											{ text: " Block: ", bold: true },
											{ text: `${body?.Unit?.Block?.Name ?? "NIL"}`, bold: true }
										],
										margin: [0, 10, 0, 0],
										bold: true,
										fontSize: 9
										// margin:[350,7,0,0]
									},
									{
										text: [{ text: "Category : " }, { text: `${body?.UnitType?.Name ?? "NIL"}`, bold: true }],
										margin: [0, 10, 0, 0],
										bold: true,
										fontSize: 9
										// margin:[350,5,0,0]
									},
									{
										text: [{ text: "Plot Size : " }, { text: `${body?.PlotSize?.Name}`, bold: true }],
										margin: [0, 10, 0, 0],
										bold: true,
										fontSize: 9
										// margin:[350,5,0,0]
									}
								],
								alignment: "left",
								margin: [60, 0, 0, 0]
							}
						],
						margin: [0, 10, 0, 0]
					}
				];
			}

			var docDefinition = {
				pageMargins: [70, 42, 70, 120],
				header: {
					columns: [
						{
							width: 300,
							height: 400,
							image:
								"data:image/jpeg;base64,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",
							fit: [140, 140],
							alignment: "left",
							margin: [70, 28, 0, 100]
						}
						// {

						//   text: 'Un-Verify Installment Receipts',
						//   fontSize: 12 ,
						//   bold: true,
						//   decoration: 'underline',
						//   margin: [0, 25, 0, 0],

						// },
					]
				},
				footer: {
					columns: [
						{
							width: "100%",
							stack: [
								{
									text: `Printed on ${moment(new Date()).format(
										"Do MMMM YYYY"
									)}. Please note this document is not a proof of ownership. Error and omissions can be expected.`,
									alignment: "left",
									fontSize: 9,
									bold: true,
									margin: [75, 70, 70, 0]
								}
							]
							// stack: [

							// ],
							// alignment: 'right'
						}
						// {
						//   width: "100%",

						//   // alignment: "center",
						// },
					],

					margin: [0, 0, 0, 8]
				},
				content: [
					...letterDetail,
					// {
					//   width: "40%",
					//   columns: [
					//     {
					//       width: "100%",
					//       stack: [
					//         {
					//           text: `Reference # VCDC01${this.padWithZeros(
					//             index + 1,
					//             4
					//           )}`,
					//           alignment: "left",
					//           fontSize: 9,
					//           bold: true,
					//           // margin: [350,40,0,0],
					//         },
					//         {
					//           text: `Registration No : ${body.Reg_Code_Disply}`,
					//           alignment: "left",
					//           fontSize: 9,
					//           bold: true,
					//           // margin:[350,10,0,0]
					//         },
					//         // {
					//         //   text: `Phase 1 ( Sector A )`,
					//         //   alignment: "left",
					//         //   fontSize: 9,
					//         //   bold:true,
					//         //   margin:[30,10,0,0]
					//         // },
					//         // Block: ${data.Block}
					//         {
					//           text: [
					//             { text: `Plot Number:` },
					//             { text: `( ${body?.Unit?.Plot_No ?? '' } )`, bold: true },
					//             { text: " Block: " },
					//             { text: `${body?.Unit?.Block?.Name ?? ''}`, bold: true },
					//           ],
					//           alignment: "left",
					//           fontSize: 9,
					//           // margin:[350,7,0,0]
					//         },
					//         {
					//           text: [
					//             { text: "Category : " },
					//             { text: `${body?.UnitType?.Name ?? ''}`, bold: true },
					//           ],
					//           alignment: "left",
					//           fontSize: 9,
					//           // margin:[350,5,0,0]
					//         },
					//         {
					//           text: [
					//             { text: "Plot Size : " },
					//             { text: `${body?.PlotSize?.Name}`, bold: true },
					//           ],
					//           fontSize: 9,
					//           alignment: "left",
					//           // margin:[350,5,0,0]
					//         },

					//         {
					//           text: `Printing Date : ${moment(new Date('2023-12-26')).format(
					//             "DD-MMM-YYYY"
					//           )}`,
					//           fontSize: 8,
					//           // margin:[350,5,0,0],
					//           bold: true,
					//         },
					//       ],
					//     },
					//   ],
					//   margin: [320, 40, 0, 0],
					// },

					// {
					//   width: "100%",
					//   columns: [
					//     {
					//       width: "50%",
					//       stack: [
					//         {
					//           text: [
					//             {
					//               text: `Name :  ${body?.Member?.BuyerName}`,
					//               fontSize: 9,
					//             },
					//           ],
					//           margin: [0, 40, 0, 0],
					//         },
					//         {
					//           text: [
					//             {
					//               text: `S/O, D/O, W/O :   ${body?.Member?.Relation}`,
					//               fontSize: 9,
					//             },
					//           ],
					//           margin: [0, 10, 0, 0],
					//         },
					//         {
					//           text: [
					//             {
					//               text: `Phone :          ${body?.Member?.BuyerContact}`,
					//               fontSize: 9,
					//             },
					//           ],
					//           margin: [0, 10, 0, 0],
					//         },
					//         {
					//           text: `${body?.Member?.BuyerAddress}`,
					//           margin: [0, 10, 0, 0],
					//           fontSize: 9,
					//         },
					//       ],

					//       alignment: "left",
					//       fontSize: 10,
					//     },
					//     {
					//       width: "50%",

					//           stack: [
					//             {
					//               text: `Reference # VCDC01${this.padWithZeros(
					//                 index + 1,
					//                 4
					//               )}`,
					//               fontSize: 9,
					//               margin: [0, 40, 0, 0],
					//               bold: true,
					//               // margin: [350,40,0,0],
					//             },
					//             {
					//               text: `Registration No : ${body.Reg_Code_Disply}`,
					//               fontSize: 9,
					//               margin: [0, 10, 0, 0],
					//               bold: true,
					//               // margin:[350,10,0,0]
					//             },
					//             // {
					//             //   text: `Phase 1 ( Sector A )`,
					//             //   alignment: "left",
					//             //   fontSize: 9,
					//             //   bold:true,
					//             //   margin:[30,10,0,0]
					//             // },
					//             // Block: ${data.Block}
					//             {
					//               text: [
					//                 { text: `Plot Number:` },
					//                 { text: `( ${body?.Unit?.Plot_No ?? '' } )`, bold: true },
					//                 { text: " Block: " },
					//                 { text: `${body?.Unit?.Block?.Name ?? ''}`, bold: true },
					//               ],
					//               margin: [0, 10, 0, 0],
					//               fontSize: 9,
					//               // margin:[350,7,0,0]
					//             },
					//             {
					//               text: [
					//                 { text: "Category : " },
					//                 { text: `${body?.UnitType?.Name ?? ''}`, bold: true },
					//               ],
					//               margin: [0, 10, 0, 0],
					//               fontSize: 9,
					//               // margin:[350,5,0,0]
					//             },
					//             {
					//               text: [
					//                 { text: "Plot Size : " },
					//                 { text: `${body?.PlotSize?.Name}`, bold: true },
					//               ],
					//               margin: [0, 10, 0, 0],
					//               fontSize: 9,
					//               // margin:[350,5,0,0]
					//             },

					//             {
					//               text: `Printing Date : ${moment(new Date('2023-12-26')).format(
					//                 "DD-MMM-YYYY"
					//               )}`,
					//               fontSize: 8,
					//               margin: [0, 10, 0, 0],
					//               // margin:[350,5,0,0],
					//               bold: true,
					//             },
					//           ],
					//           alignment: "left",
					//           margin: [60, 0, 0, 0],
					//     },
					//     // {
					//     //   width: "50%",
					//     //   stack: [
					//     //     {
					//     //       text: [
					//     //         {
					//     //           text: `${body?.SecondMember?.BuyerName ? `Member Name :  ${body?.SecondMember?.BuyerName}` : ""}`,
					//     //           fontSize: 9,
					//     //         },
					//     //       ],
					//     //       margin: [0, 40, 0, 0],
					//     //     },
					//     //     {
					//     //       text: [
					//     //         {
					//     //           text: `${body?.SecondMember?.BuyerCNIC ? `Member CNIC :   ${body?.SecondMember?.BuyerCNIC}` : ""}`,
					//     //           fontSize: 9,
					//     //         },
					//     //       ],
					//     //       margin: [0, 10, 0, 0],
					//     //     },
					//     //     {
					//     //       text: [
					//     //         {
					//     //           text: `${body?.SecondMember?.BuyerContact ? `Phone No :          ${body?.SecondMember?.BuyerContact}` : ""}`,
					//     //           fontSize: 9,
					//     //         },
					//     //       ],
					//     //       margin: [0, 10, 0, 0],
					//     //     },
					//     //     {
					//     //       text: `${body?.SecondMember?.BuyerAddress || ""}`,
					//     //       margin: [0, 10, 0, 0],
					//     //       fontSize: 9,
					//     //     },
					//     //   ],

					//     //   alignment: "left",
					//     //   fontSize: 10,
					//     //   margin: [60, 0, 0, 0],
					//     // },
					//   ],
					//   margin: [0, 10, 0, 0],
					// },

					{
						text: "Subject :",
						margin: [0, 45, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: "Development Charges",
						margin: [50, -12, 0, 0],
						fontSize: 10,
						bold: true,
						decoration: "underline"
					},

					{
						text: "Dear,",
						margin: [0, 23, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: [
							{
								text: `
              1. This is to inform you that development work at Victoria City’s site is in full swing and you are requested to please clear your development charges as per the attached payment schedule.
              `
							},
							{
								text: `2. Development Charges may be paid in Cash at Customer Support Center and/or online in the following Bank Account:
              `
							},
							{
								text: `Account Title: Victoria Estates Private Limited
              IBAN Account No. PK37MPBL1206027140102757
              SWIFT CODE: MPBLPKKA069
              Habib Metropolitan Bank LTD. Plot No.11-A, Block D, Commercial Market, Valencia Town, Lahore.`,
								margin: [0, 10, 0, 0],
								fontSize: 10,
								bold: true,
								lineHeight: 1.5
							},
							{
								text: `
              3. Please be advised that the above Bank Account details are for Development Charge Payments ONLY. Please Do Not send your monthly Cost of Land installments in this account.

              Regards ,`,
								margin: [0, 0, 0, 2]
							}
						],
						margin: [0, 10, 0, 0],
						fontSize: 10,
						lineHeight: 1.5
					},
					{
						text: `Regards ,`,
						margin: [0, 23, 0, 0],
						fontSize: 10
					},
					// {
					//   text: [
					//     {text: `
					//     1. This is to inform you that development work at Victoria City’s site is in full swing and you are requested to please clear your development charges as per the attached payment schedule.
					//     `,
					//     margin: [0, 23, 0, 0],
					//   },
					//     {text: `2. Development Charges may be paid in Cash at Customer Support Center and/or online in the following Bank Account:
					//     `,
					//   },
					//   {
					//     text: `Bank: Habib Metropolitan Bank Limited
					//     Branch: Valencia Town, Lahore
					//     Branch Code:
					//     Account Title: Victoria Estates (Private) Lmited
					//     Account # 6-12-6-20311-714-102757
					//     IBAN # PK37MPBL1206027140102757`,
					//     bold: true,
					//     margin: [0, 0, 0, 2],
					//   },
					//   {
					//     text: `
					//     3. Please be advised that the above Bank Account details are for Development Charge Payments ONLY. Please Do Not send your monthly Cost of Land installments in this account.

					//     Regards ,`,
					//     margin: [0, 0, 0, 2],
					//   }
					//   ],
					//   margin: [0, 10, 0, 0],
					//   fontSize: 10,
					//   lineHeight: 1.5,
					// },

					{
						image:
							"data:image/jpeg;base64,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",
						fit: [180, 180],
						margin: [-35, 15, 0, 0]
					},

					{
						text: "Lt.Col (R) Anwer Mahmood",
						margin: [0, 0, 0, 0],
						fontSize: 10
					}
					// {
					//   text: "Society Administrator",
					//   margin: [0, 10, 0, 0],
					//   fontSize: 10,
					//   bold: true,
					// },
					// {
					//   text: [
					//     {
					//       text: "(For any discrepancy, please contact this office within 15 days from the Printing date i.e ",
					//     },
					//     {
					//       text: `${moment(new Date()).format("DD-MMM-YYYY")}`,
					//       bold: true,
					//     },
					//     {
					//       text: " Possibility of an error is not precluded and is subject to correction.)",
					//     },
					//   ],
					//   margin: [0, 10, 0, 0],
					//   fontSize: 10,
					// },
				],

				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

			const filePath =
				"uploads/developmentChargesLetter/" +
				body?.PlotSize.Size_Marla +
				"-" +
				body?.UnitType.Name +
				"-" +
				body.Reg_Code_Disply +
				".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("ERRRRRRRRRRRRRRRRRRRRR", error);
		}
	};

	static transferLetter = async (body, index, data, user, total, paid, TRSData) => {
		try {
			const totalPaid = paid ? paid : 0;
			const totalIns = total ? total : 0;
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};

			const printer = new Pdfmake(fonts);

			var docDefinition = {
				pageMargins: [70, 20, 70, 0],
				content: [
					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 350,
										y1: 40,
										x2: 520,
										y2: 40,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 350,
										y1: 120,
										x2: 520,
										y2: 120,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 350,
										y1: 40,
										x2: 350,
										y2: 120,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 520,
										y1: 40,
										x2: 520,
										y2: 120,
										lineWidth: 0.5,
										lineColor: "grey"
									}
								]
							}
						]
					},
					{
						text: `Printing Date : ${moment(new Date()).format("DD-MMM-YYYY")}`,
						fontSize: 8,
						margin: [290, 30, 0, 0],
						bold: true
					},
					{
						text: `TL NO: VCTL${this.padWithZeros(TRSData?.TRSR_ID || 1, 5)}   VC No: ${body.Reg_Code_Disply}`,
						alignment: "left",
						fontSize: 9,
						bold: true,
						margin: [290, 10, 0, 0]
					},

					{
						text: `Plot No: ${data?.Plot ? data?.Plot : "NIL"}     Block: ${data?.Block ? data?.Block : "NIL"}`,
						alignment: "left",
						fontSize: 9,
						bold: true,
						margin: [290, 7, 0, 0]
					},

					{
						text: `Size: ${data?.Size ? data?.Size : "NIL"}     Category: ${data?.Category ? data?.Category : "NIL"}`,
						fontSize: 9,
						alignment: "left",
						bold: true,
						margin: [290, 5, 0, 0]
					},

					{
						width: "100%",
						columns: [
							{
								width: "53%",
								stack: [
									{
										text: [
											{
												text: `Member Name: ${TRSData?.Member?.BuyerName || ""}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: [
											{
												text: `CNIC: ${TRSData?.Member?.BuyerCNIC || ""}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 10, 0, 0]
									},

									{
										text: [
											{
												text: `Contact: ${TRSData?.Member?.BuyerContact || ""}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${TRSData?.Member?.BuyerAddress || ""} `,
										margin: [0, 10, 0, 0],
										fontSize: 9,
										bold: true
									}
								],

								alignment: "left",
								fontSize: 10,
								margin: [0, 20, 0, 0]
							},
							{
								width: "53%",
								stack: [
									{
										text: [
											{
												text: `${
													TRSData?.secondMember?.BuyerName ? `Member Name: ${TRSData?.secondMember?.BuyerName}` : ""
												}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 0, 0, 0]
									},
									{
										text: [
											{
												text: `${TRSData?.secondMember?.BuyerCNIC ? `CNIC: ${TRSData?.secondMember?.BuyerCNIC}` : ""}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 10, 0, 0]
									},

									{
										text: [
											{
												text: `${
													TRSData?.secondMember?.BuyerContact ? `Contact: ${TRSData?.secondMember?.BuyerContact}` : ""
												}`,
												fontSize: 9,
												bold: true
											}
										],
										margin: [0, 10, 0, 0]
									},
									{
										text: `${TRSData?.secondMember?.BuyerAddress || ""} `,
										margin: [0, 10, 0, 0],
										fontSize: 9,
										bold: true
									}
								],

								alignment: "left",
								fontSize: 10,
								margin: [0, 29, 0, 0]
							}
						]
					},

					{
						text: "Subject :",
						margin: [0, 45, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: "Transfer Letter",
						margin: [50, -12, 0, 0],
						fontSize: 10,
						bold: true,
						decoration: "underline"
					},

					{
						text: "Dear Valued Member,",
						margin: [0, 23, 0, 0],
						fontSize: 10
					},
					{
						text: "Congratulations!",
						margin: [0, 8, 0, 0],
						fontSize: 10,
						bold: true
					},
					{
						text: `The Management of Victoria City is pleased to inform you that the Transfer Application of the above-said Booking Application/Plot has been accepted and transferred in your name with all rights, deposits, liabilities as per the existing Rules & Regulations and those which may be enforced in future by the Management of the Victoria City or any authority competent to do so.

            It is intimated that this transfer is also subject to the terms of the Indemnity Bond, Transfer Application Form along with affidavits/undertakings executed by the purchaser/s and the sellers/s of the above said Booking Application/Plot respectively.

            Please keep this Transfer Letter along with Transfer Application form in safe custody and for all future correspondence with the Victoria City.

            Assuring you the best services and co-operation.

            Best Regards`,
						margin: [0, 23, 0, 0],
						fontSize: 10,
						lineHeight: 1.5
					},

					{
						text: "",
						fit: [180, 180],
						margin: [0, 50, 0, 0]
					},

					{
						text: `Col. (R) Anwer Mahmood
                      (Administrator) `,
						margin: [0, 5, 0, 0],
						bold: true,
						fontSize: 10
					},
					{
						text: [
							{
								text: "For any discrepancy, please contact this office within 15 days from the date of transfer."
							}
						],
						margin: [0, 10, 0, 0],
						fontSize: 10
					},
					{
						text: [{ text: `Generated By: ${user.name} ( ${user.lastName} )` }],
						margin: [0, 10, 0, 0],
						fontSize: 10
					}
					// {
					//   text: [
					//     {
					//       text: `1. Plot No. To show NIL if no plot has been allotted.
					//              2. This letter will be accompanied by a statement of remaining cost of land with a clear heading of Remaining Cost of Land Only
					//   `,
					//     },
					//   ],
					//   margin: [0, 10, 0, 0],
					//   fontSize: 10,
					// },
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 5, 0, 15]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

			const filePath = "uploads/transferLetter/" + body.Reg_Code_Disply + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("ERRRRRRRRRRRRRRRRRRRRR", error);
		}
	};

	static transferEventCapture = async (body, rows, TRSData, user) => {
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			const printer = new Pdfmake(fonts);
			var data = [];
			var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
			var currentDate = new Date();
			var year = currentDate.getFullYear();
			var month = monthsArr[currentDate.getMonth() + 1]; // Months are zero-based, so we add 1
			var day = currentDate.getDate();
			data["invoicenumber"] = `${"ZXCV"} ${"CVBX"}`;
			data["buyeraddress"] = "";
			data["item"] = "";
			data["price"] = 0;

			// // Usage inside your function
			const sellerImageDataUrl = body.Seller_Image;
			const combineImageDataUrl = body.Combine_Image;
			const buyerImageDataUrl = body.Buyer_Image;

			let sellerImageObj;
			let combineImageObj;
			let buyerImageObj;

			if (sellerImageDataUrl) {
				sellerImageObj = {
					width: 200,
					height: 150,
					image: path.resolve(__dirname, `../../${sellerImageDataUrl}`),
					fit: [130, 170],
					alignment: "center"
				};
			} else {
				sellerImageObj = {
					width: 200,
					height: 150,
					text: "NO IMAGE",
					fit: [130, 170],
					alignment: "center",
					margin: [0, 50, 0, 0]
				};
			}
			if (combineImageDataUrl) {
				combineImageObj = {
					width: 200,
					height: 150,
					image: path.resolve(__dirname, `../../${combineImageDataUrl}`),
					fit: [130, 170],
					alignment: "center"
				};
			} else {
				combineImageObj = {
					width: 200,
					height: 150,
					text: "NO IMAGE",
					fit: [130, 170],
					alignment: "center",
					margin: [0, 50, 0, 0]
				};
			}
			if (buyerImageDataUrl) {
				buyerImageObj = {
					width: 200,
					height: 150,
					image: path.resolve(__dirname, `../../${buyerImageDataUrl}`),
					fit: [130, 170],
					alignment: "center"
				};
			} else {
				buyerImageObj = {
					width: 200,
					height: 150,
					text: "NO IMAGE",
					fit: [130, 170],
					alignment: "center",
					margin: [0, 45, 0, 0]
				};
			}

			let dataArr = [];
			let dataArr1 = [];
			let dataArr2 = [];

			dataArr.push([
				{
					text: "Seller Picture",
					fontSize: 12,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					alignment: "center"
				},
				{
					text: "Buyer Picture",
					fontSize: 12,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					alignment: "center"
				},
				{
					text: "Buyer & Seller Picture",
					fontSize: 12,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					alignment: "center"
				}
			]);
			dataArr.push([sellerImageObj, buyerImageObj, combineImageObj]);
			dataArr1.push([
				{
					text: "Seller",
					fontSize: 14,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Purchaser",
					fontSize: 14,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);
			dataArr1.push([
				{
					text: `The undersigned hereby undertakes that it was in presence at Victoria City Office on _____/_____/20_____ for transfer of his Booking bearing VC # ___________________.`,
					fontSize: 14,
					bold: true,
					// border:[true,true,true,true],
					margin: 2,
					alignment: "left"
				},
				{
					text: `The undersigned hereby undertakes that it was in presence at Victoria City Office on _____/_____/20_____ for purchase of Booking bearing VC # ___________________.`,
					fontSize: 14,
					bold: true,
					margin: 2,
					alignment: "left"
				}
			]);

			dataArr2.push([
				{
					text: `______________________________
           Signature / Thumb Impression\n\nName _______________________`,
					fontSize: 14,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: [0, 60, 0, 0],
					alignment: "center"
				},
				{
					text: `______________________________
           Signature / Thumb Impression\n\nName _______________________`,
					fontSize: 14,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: [0, 60, 0, 0],
					alignment: "center"
				}
			]);

			var docDefinition = {
				content: [
					{
						width: "100%",
						text: "Transfer Event",
						fontSize: 18,
						bold: true,
						decoration: "underline",
						alignment: "center",
						margin: [0, 80, 0, 10]
					},
					{
						text: [
							{
								text: "Printing Date : ",
								bold: true
							},
							{
								text: `${day + "-" + month + "-" + year}`,
								bold: true
							}
						],
						fontSize: 10,
						alignment: "left",
						margin: [360, 10, 0, 0]
					},
					{
						text: [
							{
								text: `Registration No : ${body.Booking_Temp}`,
								bold: true
							}
						],
						fontSize: 10,
						margin: [360, 1, 0, 0],
						alignment: "left"
					},
					{
						text: [
							{
								text: `ETL No : VCTL${this.padWithZeros(TRSData?.TRSR_ID, 5)}`,
								bold: true
							}
						],
						fontSize: 10,
						margin: [360, 1, 0, 0],
						alignment: "left"
					},
					// Table Section
					{
						table: {
							widths: ["33.33%", "33.33%", "33.34%"],
							// heights:[100,100,100],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},

					{
						table: {
							headerRows: 1,
							widths: ["50%", "50%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					{
						table: {
							widths: ["50%", "50%"],
							heights: [120, 120],
							body: dataArr2
						},
						// Margin top for the table
						margin: [5, 10, 0, 0]
					},
					{
						text: "Note: This document is for internal use only and is not a valid proof of ownership.",
						bold: true,
						fontSize: 12,
						alignment: "left",
						margin: [5, 20, 10, 0]
					},
					{
						text: `Generated BY : ${user.name} ( ${user.lastName} )`,
						bold: true,
						fontSize: 14,
						margin: [5, 20, 43, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			let fullName = data?.invoicenumber;
			let username = fullName.replace(/\s/g, "").toLowerCase();
			const filePath = "uploads/transferEvent/" + `transfer-Event-${body.id}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			// return "";
			return error;
		}
	};

	static cashReceiptGeneratorOld = async (body, rows, receiptHead) => {
		const fonts = {
			Roboto: {
				normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
				bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
				italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
				bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
			}
		};

		function formatTimestampf(timestamp, simple) {
			if (!timestamp) {
				return "n/a";
			}

			const dateFromTimeStamp = new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			dateFromTimeStamp.setDate(dateFromTimeStamp.getDate());
			let timestampDay = dateFromTimeStamp.getDate();

			// if(typeof simple != "undefined" && simple == 1) {
			//     timestampDay = dateFromTimeStamp.getDate();
			// }
			const timestampMonth = monthsArr[dateFromTimeStamp.getMonth() + 1]; // Months are zero-based, so we add 1
			const timestampYear = dateFromTimeStamp.getFullYear();

			const formattedStampDate = `${timestampDay}-${timestampMonth}-${timestampYear}`;

			return formattedStampDate;
		}
		function formatTimestampd(timestamp, simple) {
			let dateFromTimeStamp = ("" + timestamp).split("T")[0]; //new Date(timestamp);
			const monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
			if (!dateFromTimeStamp) {
				dateFromTimeStamp = ("" + timestamp).split(" ")[0];
			}

			let timestampMonth;
			let timestampDay;
			let timestampYear;

			if (simple == 1) {
				dateFromTimeStamp = dateFromTimeStamp.split("-");
				timestampDay = dateFromTimeStamp[2];
				timestampMonth = monthsArr[parseInt(dateFromTimeStamp[1])];
				timestampYear = dateFromTimeStamp[0];
			} else {
				dateFromTimeStamp = dateFromTimeStamp.split(" ");
				timestampMonth = dateFromTimeStamp[1];
				timestampDay = dateFromTimeStamp[2];
				timestampYear = dateFromTimeStamp[3];
			}
			if (timestampMonth && timestampDay && timestampYear) {
				return `${timestampDay}-${timestampMonth}-${timestampYear}`;
			}
			return "";
		}

		let FormatedDate = "";
		if (body && body?.INSTRUMENT_DATE) {
			FormatedDate = formatTimestampf(body.INSTRUMENT_DATE);
		}
		let FormatedDueDate = "";
		if (body && body?.Booking_Installment_Details?.Due_Date) {
			FormatedDueDate = formatTimestampf(body?.Booking_Installment_Details?.Due_Date);
		}
		let FormatedInstallmentDate = "";
		if (body && body?.Booking_Installment_Details?.Installment_Month) {
			FormatedInstallmentDate = formatTimestampf(body?.Booking_Installment_Details?.Installment_Month, 1);
		}

		const IRC_FormatedDate = formatTimestampf(body?.IRC_Date);
		const printer = new Pdfmake(fonts);

		try {
			let dataArr = [];
			let dataArr1 = [];

			dataArr.push([
				{
					text: "Sr No",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Installment Type",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Installment Month",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				},
				{
					text: "Due Date",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Installmt Due",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 9,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 1,
					alignment: "center"
				}
			]);

			dataArr1.push([
				{
					text: "Sr No",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Installment Type",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Installment Month",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Due Date",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Installmt Due",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: "Amount",
					fontSize: 10,
					bold: true,
					fillColor: "#c8c5c8",
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				}
			]);
			let total = 0;
			for (let i = 0; i < rows.length; i++) {
				total += +rows[i]?.Installment_Paid;
				dataArr.push([
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: receiptHead == "development_charges" ? "Development Charge" : `${body?.Installment_Type?.Name}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${FormatedInstallmentDate}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${FormatedDueDate}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${body?.Installment_Due}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					},
					{
						text: `${rows[i]?.Installment_Paid}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					}
				]);

				dataArr1.push([
					{
						text: i + 1,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "center"
					},
					{
						text: receiptHead == "development_charges" ? "Development Charge" : `${body?.Installment_Type?.Name}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${FormatedInstallmentDate}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${FormatedDueDate}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "left"
					},
					{
						text: `${body?.Installment_Due}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					},
					{
						text: `${rows[i]?.Installment_Paid}`,
						fontSize: 10,
						border: [true, true, true, true],
						borderColor: " #91CBFF",
						margin: 2,
						alignment: "right"
					}
				]);
			}

			const totalAmout = [
				{
					text: "",
					fontSize: 11,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			const totalAmout1 = [
				{
					text: "",
					fontSize: 10,
					border: [true, true, true, true],
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "center"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `Total Amount`,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: ``,
					fontSize: 11,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				},
				{
					text: `${total}`,
					fontSize: 10,
					border: [true, true, true, true],
					bold: true,
					borderColor: " #91CBFF",
					margin: 2,
					alignment: "right"
				}
			];

			dataArr.push(totalAmout);

			dataArr1.push(totalAmout1);

			// dataArr1 = dataArr;

			let newArray = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];

			let newArray1 = [
				{
					text: "Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Registration No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Category",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Application For",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];
			let arrHeader = [newArray];
			let arrHeader1 = [newArray1];

			const arrayNewTableData = [
				{
					text: `${body?.Member?.BuyerName ? body?.Member?.BuyerName : "NIL"}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];

			const arrayNewTableData1 = [
				{
					text: `${body?.Member?.BuyerName ? body?.Member?.BuyerName : "NIL"}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.Reg_Code_Disply}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.UnitType?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				},
				{
					text: `${body?.Booking?.PlotSize?.Name}`,
					alignment: "left",
					fontSize: 9,
					border: [true, true, true, true],
					borderColor: " #91CBFF"
				}
			];
			arrHeader.push(arrayNewTableData);
			arrHeader1.push(arrayNewTableData1);

			var monthsArr = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

			var fullMonthsArr = [
				"",
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			];

			var docDefinition = {
				// playground requires you to assign document definition to a variable called dd
				content: [
					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Installment Receipt",
								fontSize: 11,
								bold: true,
								margin: [-10, 40, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},

							// 2nd Heading with below sub-heading///
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User.name}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],

								alignment: "right"
							}
						]
					},

					{
						columns: [
							{
								absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 570,
										y2: 25,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 820,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 25,
										y1: 25,
										x2: 25,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									},
									{
										type: "line",
										x1: 570,
										y1: 25,
										x2: 570,
										y2: 820,
										lineWidth: 0.5,
										lineColor: "grey"
									}
								]
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 110 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Customer Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 79, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											"Installment Month: " +
											`${
												body?.Installment_Month?.split("-")[1] == 10
													? fullMonthsArr[body?.Installment_Month.split("-")[1] + ""]
													: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: "Installment Year : " + `${body?.Installment_Month?.split("-")[0]}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
							//   {
							//   width: "17%",
							//   fontSize: 11,
							//   text: "Customer Copy",
							//   alignment: "right",
							//   decoration: "underline",
							//   bold: true,
							// },
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: "Due Date : " + `${FormatedDueDate}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							},
							{
								width: "30%",
								fontSize: 11,
								text: "Instrument No : " + `${body?.INSTRUMENT_NO}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "34%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `Instrument Date: ${FormatedDate}`,

										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},

					// Horizontal Line
					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -5,
										y1: 12,
										x2: 530,
										y2: 12,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: `Installment Details ${receiptHead == "development_charges" ? "" : "(Cost of Land)"} `,
										bold: true
									}
								],
								margin: [0, 20, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["7%", "25%", "20%", "15%", "15%", "18%"],
							body: dataArr
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								width: "100%",
								stack: [
									// {
									//   canvas: [
									//     {
									//       type: "line",
									//       x1: 0,
									//       y1: 0,
									//       x2: 200,
									//       y2: 0,
									//       lineWidth: 0.5,
									//     },
									//   ],
									//   alignment: "left",
									//   margin: [10, 50, 0, 8],
									// },
									{
										// absolutePosition: { x: 50, y: 350 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, 5, 20, 0]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					},

					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 5, 0, 0]
					},
					// Horizontal Line
					{
						canvas: [
							{
								type: "line",
								x1: 0,
								y1: 12,
								x2: 516,
								y2: 12,
								dash: { length: 3, space: 2 }, // Customize the dash pattern [dash length, gap length]
								lineWidth: 2, // Change the line width value here
								lineColor: "#000000" // Change the line color if needed
							}
						],
						margin: [0, 15, 0, 10]
					},

					{
						// Header Section
						columns: [
							// First Heading
							{
								width: "30%",
								text: "Installment Receipt",
								fontSize: 11,
								bold: true,
								margin: [3, 50, 0, 0],
								decoration: "underline"
							},
							// Image

							{
								width: 200,
								height: 150,
								image:
									"data:image/png;base64,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",
								fit: [160, 160],
								alignment: "center"
							},
							// 2nd Heading with below sub-heading
							{
								width: "38%",
								stack: [
									{
										text: `Receipt No: ${body?.IRC_NO}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									},
									{
										text: `Generated By: ${body?.User.name}`,
										bold: true,
										fontSize: 10,
										margin: [0, 5, 50, 0]
									}
								],
								alignment: "right"
							}
						]
					},

					{
						image:
							"data:image/png;base64,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",
						fit: [280, 300],
						width: 50,
						height: 740,
						absolutePosition: { x: -491, y: 410 },
						alignment: "center"
					},
					// Details Section
					{
						// absolutePosition: { x: 0, y: 200 },
						columns: [
							// Name

							// Customer Copy
							{
								width: "100%",
								fontSize: 11,
								text: "Office Copy",
								alignment: "right",
								decoration: "underline",
								bold: true
							}
						],
						// Margin top for this details section
						margin: [0, 10, 98, 0]
					},
					{
						columns: [
							// Name

							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt No : " + `${body?.IRC_NO}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// CNIC
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text:
											"Installment Month: " +
											`${
												body?.Installment_Month?.split("-")[1] == 10
													? fullMonthsArr[body?.Installment_Month.split("-")[1] + ""]
													: fullMonthsArr[(body?.Installment_Month?.split("-")[1] + "").replace("0", "")]
											}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [12, 0, 0, 0]
							},
							// Customer Copy
							{
								width: "30%",
								fontSize: 11,
								text: "Installment Year : " + `${body?.Installment_Month?.split("-")[0]}`,
								alignment: "left",
								// decoration: "underline",
								bold: true,
								margin: [14, 0, 0, 0]
							}
							//   {
							//   width: "17%",
							//   fontSize: 11,
							//   text: "Customer Copy",
							//   alignment: "right",
							//   decoration: "underline",
							//   bold: true,
							// },
						],
						// Margin top for this details section
						margin: [0, 5, 20, 0]
					},
					// Date and Deliver Date Section
					{
						columns: [
							// Date
							{
								width: "34%",
								fontSize: 11,
								text: [
									{
										text: "Receipt Date : " + `${IRC_FormatedDate}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Date
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: "Due Date : " + `${FormatedDueDate}`,
										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							},
							{
								width: "30%",
								fontSize: 11,
								text: "Instrument No : " + `${body?.INSTRUMENT_NO}`,
								alignment: "left",
								// decoration: "underline",
								bold: true
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Mobile No and Delivery Time Section
					{
						columns: [
							// Mobile No
							{
								width: "34%",
								fontSize: 10,
								text: [
									{
										text: "Payment Mode : " + `${body?.Payment_Mode?.Description}`,
										bold: true
									}
								],
								margin: [5, 0, 0, 0]
							},
							// Deliver Time
							{
								width: "36%",
								fontSize: 11,
								text: [
									{
										text: `Instrument Date: ${FormatedDate}`,

										bold: true
									}
								],
								alignment: "left",
								margin: [7, 0, 0, 0]
							}
						],
						// Margin top for this section
						margin: [0, 4, 0, 0]
					},
					// Horizontal Line

					{
						columns: [
							{
								// absolutePosition: { x: 0, y: 0 },
								canvas: [
									{
										type: "line",
										x1: -15,
										y1: 10,
										x2: 529,
										y2: 10,
										lineWidth: 0.5 // Change the line width value here
									}
								]
							}
						]
					},
					{
						table: {
							body: arrHeader1,

							widths: ["50%", "17%", "17%", "16%"],
							alignment: "center"
						},
						layout: {
							defaultBorder: true
						},
						margin: [5, 15, 0, 0]
					},
					{
						columns: [
							// Mobile No
							{
								width: "100%",
								fontSize: 13,
								text: [
									{
										text: `Installment Details ${receiptHead == "development_charges" ? "" : "(Cost of Land)"} `,
										bold: true
									}
								],
								margin: [0, 20, 0, 0],
								alignment: "center"
							}
							// Deliver Time
						]
					},

					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["7%", "25%", "20%", "15%", "15%", "18%"],
							body: dataArr1
						},
						// Margin top for the table
						margin: [5, 2, 0, 0]
					},
					// Signature Section
					{
						columns: [
							{
								absolutePosition: { x: 40, y: 700 },
								width: "50%",
								stack: [
									// {
									//   canvas: [
									//     {
									//       type: "line",
									//       x1: 0,
									//       y1: 0,
									//       x2: 200,
									//       y2: 0,
									//       lineWidth: 0.5,
									//     },
									//   ],
									//   alignment: "left",
									//   margin: [10, 50, 0, 8],
									// },
									{
										// absolutePosition: { x: 70, y: 780 },
										text: `This is a System Generated Document, No Signature Required. Possibility of an error is not Precluded and is subject to correction`,
										alignment: "center",
										fontSize: 10,
										bold: true,
										margin: [20, 60, 20, 80]
									}
								],
								alignment: "left"
							}
						],
						margin: [0, 40, 0, 0]
					}
				],

				styles: {
					tableHeader: {
						padding: [0, 5, 0, 0]
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};

			// create invoice and save it to invoices_pdf folder
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/voucherRCReport/" + `VoucherRCReport-${body.INS_RC_ID}` + ".pdf";
			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			return filePath;
		} catch (error) {
			console.log("error==========", error);
			return "";
			// return error;
			// console.log('error==========', error)
		}
	};
	static testing = async (bookings) => {
		try {
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			let pdfObj;
			// bookings.forEach((booking,index)=>
			// 	image:
			// "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAAAXNSR0IArs4c6QAAIABJREFUeF7snQlczdn//7UphJIsDRISRdYsbUKbJUUYUYQZy1jGvpZ9GWObYeyypewpFZWylNBirEWKqKbsMbb2+/u/7/ce/8/cafncuhk+Xvfx8Cjd8znL87w/53WW9zlHoQo+IAACIAACIAACXz0Bha++BCgACIAACIAACIBAFQg6jAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAE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",

			for (let i = 0; i < bookings.length; i++) {
				const printer = new Pdfmake(fonts);
				// ${moment(new Date()).format("DD-MMM-YYYY")}
				console.log(bookings[i].BK_ID);
				var formattedAddress;
				let address = bookings[i].Member?.BuyerAddress ?? bookings[i].Member?.PermanantAddress ?? null;
				if (address == null) {
					formattedAddress = null;
				} else {
					formattedAddress = this.splitAddress(
						bookings[i].Member?.BuyerAddress ?? bookings[i].Member?.PermanantAddress ?? null,
						40
					);
				}

				var filePath;
				var docDefinition = {
					pageMargins: [70, 20, 70, 0],
					content: [
						{
							columns: [
								{
									width: "auto",
									image:
										"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAAAXNSR0IArs4c6QAAIABJREFUeF7snQlczdn//7UphJIsDRISRdYsbUKbJUUYUYQZy1jGvpZ9GWObYeyypewpFZWylNBirEWKqKbsMbb2+/u/7/ce/8/cafncuhk+Xvfx8Cjd8znL87w/53WW9zlHoQo+IAACIAACIAACXz0Bha++BCgACIAACIAACIBAFQg6jAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAEQAAEIOiwARAAARAAARAQAAEIugAqEUUAARAAARAAAQg6bAAEQAAEQAAEBEAAgi6ASkQRQAAEQAAEQACCDhsAARAAARAAAQEQgKALoBJRBBAAARAAARCAoMMGQAAEQAAEQEAABCDoAqhEFAEEQAAE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",

									fit: [210, 210], // Adjust the width and height as needed
									margin: [0, 0, 0, 0], // Adjust the margin as needed
									absolutePosition: { x: 350, y: -10 } // Center align the image horizontally and vertically
								}
							]
						},
						{
							width: [200], // This ensures the text column takes up the remaining space
							margin: [0, 40, 0, 0], // Add top margin to align with the image
							stack: [
								{
									text: `Name : ${bookings[i].Member?.BuyerName ? bookings[i].Member.BuyerName : null}`,
									fontSize: 10,
									margin: [0, 10, 0, 0],
									bold: true
								},
								{
									text: `Phone No: ${bookings[i].Member?.BuyerContact ? bookings[i].Member.BuyerContact : null}`,
									alignment: "left",
									fontSize: 10,
									bold: true,
									margin: [0, 10, 0, 0]
								},
								{
									text: `Address: ${formattedAddress}`,
									alignment: "left",
									fontSize: 10,
									bold: true,
									margin: [0, 7, 0, 0],
									width: 100
								},
								{
									width: "100%",
									columns: [
										{
											width: "53%",
											stack: [
												{
													text: [
														{
															text: `Date: ${moment(new Date()).format("DD-MMM-YYYY")}`,
															fontSize: 10,
															bold: true
														}
													],
													margin: [0, 10, 0, 0]
												}
											],
											alignment: "left",
											fontSize: 10,
											margin: [0, 40, 0, 0]
										}
									]
								},
								{
									text: "Subject :",
									margin: [0, 45, 0, 0],
									fontSize: 10,
									bold: true
								},
								{
									text: "Victoria City Update",
									margin: [50, -12, 0, 0],
									fontSize: 10,
									bold: true,
									decoration: "underline"
								},
								{
									text: "Respected Member,",
									margin: [0, 23, 0, 0],
									fontSize: 10
								},
								{
									text: "Please find enclosed:",
									fontSize: 10,
									margin: [0, 20, 0, 5]
								},
								{
									ul: [
										{ text: "Monthly Newsletter / Construction Update at Victoria City site.", fontSize: 10 },
										{ text: "Account Statement / Surcharge Report.", fontSize: 10 }
									],
									margin: [0, 5, 0, 15]
								},
								{
									text: `Also, please know that Victoria City’s Ballot results have been uploaded on our website (www.victoriacitypk.com). You may follow this link to see your allotted plot number. Allotment Letters are available at Victoria City Customer Support Center; please bring your original CNIC to collect them.`,
									fontSize: 10,
									margin: [0, 3, 0, 15],
									lineHeight: 1.5
								},
								{
									text: `For any questions/queries, you may get in touch with:`,
									fontSize: 10,
									margin: [0, 3, 0, 5],
									lineHeight: 1.5
								},
								{
									text: `Farhan Subhani (GM Sales & Marketing) 0311-4342278`,
									fontSize: 10,
									margin: [0, 3, 0, 5]
								},
								{
									text: `Mumtaz Sandhu (Sr. Manager Operations) 0311-5994424`,
									fontSize: 10,
									margin: [0, 3, 0, 15]
								},
								{
									text: "Regards,",
									fontSize: 10,
									margin: [0, 20, 0, 50] // Increased margin to create space between Regards and signature
								},
								{
									columns: [
										{ width: "*", text: "" }, // Left side empty
										{
											width: "auto",
											stack: [
												{
													canvas: [{ type: "line", x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 1 }],
													margin: [0, 10, 0, 10]
												},
												{
													text: "Lt. Col (R) Anwer Mahmood",
													fontSize: 10,
													bold: true,
													margin: [0, 0, 0, 2]
												},
												{
													text: "(Administrator)",
													fontSize: 10,
													bold: true
												}
											],
											alignment: "right"
										}
									]
								}
							]
						}
					],
					styles: {
						header: {
							fontSize: 18,
							bold: true,
							margin: [0, 0, 0, 10]
						},
						subheader: {
							fontSize: 16,
							bold: true,
							margin: [0, 10, 0, 5]
						},
						tableExample: {
							margin: [0, 5, 0, 15]
						},
						tableHeader: {
							bold: true,
							fontSize: 13,
							color: "black"
						}
					},
					defaultStyle: {
						// alignment: 'justify'
					}
				};

				const options = {};

				// create invoice and save it to invoices_pdf folder
				const pdfDoc = printer.createPdfKitDocument(docDefinition, options);

				filePath = "uploads/newFiles/" + `noticeLetter${i}` + ".pdf";
				pdfDoc.pipe(fs.createWriteStream(filePath));
				pdfDoc.end();
			}
			// )

			// console.log('QQQQQQQQQQQQQQQQQQQQ', pdfDoc)
			return filePath;
		} catch (error) {
			console.log("ERRRRRRRRRRRRRRRRRRRRR", error);
		}
	};

	static filesPdf = async (files) => {
		try {
			let array1 = [
				{
					text: "NO",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "SR_Name",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "SRForm_No",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Form_Code",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Unit Type",
					alignment: "left",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Payment Plan",
					alignment: "left",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "PlotSize",
					alignment: "left",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				},
				{
					text: "Sector",
					alignment: "center",
					fontSize: 9,
					bold: true,
					fillColor: "#D3D3D3",
					borderColor: " #91CBFF"
				}
			];

			let arr = [];
			let array2;
			arr.push(array1);
			for (let i = 0; i < files.length; i++) {
				// console.log("IN ARRAY");
				// console.log(files[i]);
				array2 = [
					{
						text: `${i}`,
						alignment: "left",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].SR_Name}`,
						alignment: "left",
						fontSize: 9,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].SRForm_No}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].Form_Code}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},

					{
						text: `${files[i].UnitType.Name}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].PaymentPlan.Name}`,
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].PlotSize.Name}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					},
					{
						text: `${files[i].Sector.NAME}`,
						alignment: "right",
						fontSize: 8,
						border: [true, true, true, true],
						borderColor: " #91CBFF"
					}
				];

				arr.push(array2);
			}
			console.log("AFTER ARRAY");
			const fonts = {
				Roboto: {
					normal: path.resolve("./resources/fonts/roboto/Roboto-Regular.ttf"),
					bold: path.resolve("./resources/fonts/roboto/Roboto-Medium.ttf"),
					italics: path.resolve("./resources/fonts/roboto/Roboto-Italic.ttf"),
					bolditalics: path.resolve("./resources/fonts/roboto/Roboto-MediumItalic.ttf")
				}
			};
			const printer = new Pdfmake(fonts);
			var docDefinition = {
				pageMargins: [15, 130, 15, 75],
				// playground requires you to assign document definition to a variable called dd

				header: {
					columns: [
						{
							width: 70,
							height: 50,
							image:
								"data:image/png;base64,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",
							fit: [160, 160],
							alignment: "center",
							margin: [0, 40, -270, 100]
						},
						{
							text: "Files",
							decoration: "underline",
							bold: true,
							alignment: "left",
							margin: [-40, 86, 0, 0]
						},

						{
							width: "33%",
							stack: [
								// Booking Details Section
								{
									absolutePosition: { x: 0, y: 30 },
									canvas: [
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 560,
											y2: 2,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 2,
											x2: 5,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 5,
											y1: 800,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											type: "line",
											x1: 560,
											y1: 2,
											x2: 560,
											y2: 800,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Header Down Border
											type: "line",
											x1: 5,
											y1: 75,
											x2: 560,
											y2: 75,
											lineWidth: 0.5,
											lineColor: "grey"
										},
										{
											//Status Down Border
											type: "line",
											x1: 5,
											y1: 96,
											x2: 560,
											y2: 96,
											lineWidth: 0.5,
											lineColor: "grey"
										}
									]
								}
								// Booking Details Section
							],

							alignment: "center",
							fontSize: 12
						}
					]
				},
				footer: {
					columns: [
						{
							width: "100%",
							stack: [
								// {
								//   canvas: [
								//     {
								//       type: "line",
								//       x1: 20,
								//       y1: 20,
								//       x2: 200,
								//       y2: 20,
								//       lineWidth: 0.5,
								//     },
								//   ],
								//   alignment: "left",
								//   margin: [20, 0, 0, 8],
								// },
								{
									text: "This is a system generated document, no signatures required. Possibility of error is not precluded and is subject to correction.This Statement is only for information purposes and is not a proof of ownership or payments.",
									alignment: "center",
									fontSize: 9,
									bold: false,
									margin: [30, 20, 30, 0]
								}
								// {
								// 	text: `Printing Date: ${formattedDate}`,
								// 	alignment: "Right",
								// 	fontSize: 7,
								// 	bold: true,
								// 	margin: [450, 8, 0, 0]
								// }
							],
							alignment: "right"
						}
					],

					margin: [0, 0, 0, 8]
				},
				content: [
					{
						text: [
							// `${bookingData?.Phase?.NAME} (${bookingData?.Sector?.NAME})`,
						],
						border: [true, true, true, true],
						borderColor: "black",
						bold: true,
						fontSize: 11,
						margin: [0, 10, 0, 0],
						alignment: "center"
					},
					// {
					// 	table: {
					// 		body: arrHeader,

					// 		widths: ["25%", "15%", "15%", "15%", "15%", "15%"],
					// 		alignment: "center"
					// 	},
					// 	layout: {
					// 		defaultBorder: true
					// 	},
					// 	margin: [15, 2, 45, 0]
					// },
					{
						text: "All Files",
						alignment: "center",
						margin: [0, 20, 0, 0],
						fontSize: 12,
						bold: true
					},
					// Table Section
					{
						table: {
							headerRows: 1,
							widths: ["4%", "14%", "14%", "14%", "14%", "14%", "13%", "13%"],
							body: arr
						},

						// Margin top for the table
						margin: [15, 2, 15, 0]
					}

					// Signature Section
				],
				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 0]
					},
					subheader: {
						fontSize: 16,
						bold: true,
						margin: [0, 10, 0, 5]
					},
					tableExample: {
						margin: [0, 0, 0, 0]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: "black"
					}
				},
				defaultStyle: {
					// alignment: 'justify'
				}
			};

			const options = {};
			const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
			const filePath = "uploads/files/files" + ".pdf";

			pdfDoc.pipe(fs.createWriteStream(filePath));
			pdfDoc.end();
			// return filePath;
		} catch (err) {}
	};

	static splitAddress(address, maxLineLength) {
		const words = address.split(" ");
		let lines = [];
		let currentLine = "";

		words.forEach((word) => {
			if (currentLine.length + word.length + 1 <= maxLineLength) {
				currentLine += (currentLine.length > 0 ? " " : "") + word;
			} else {
				lines.push(currentLine);
				currentLine = word;
			}
		});

		if (currentLine.length > 0) {
			lines.push(currentLine);
		}

		return lines.join("\n");
	}
	static array = () => {};
}
module.exports = pdfGenerator;
