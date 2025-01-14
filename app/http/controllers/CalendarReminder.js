const { google } = require("googleapis");
const dotenv = require("dotenv");
const { CalenderReminder } = require("../../models/index");
const { CalenderComment } = require("../../models/index");
const { Booking } = require("../../models/index");
dotenv.config();

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = "https://www.googleapis.com/auth/calendar";
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(CREDENTIALS.client_email, null, CREDENTIALS.private_key, SCOPES);

// Insert new event to Google Calendar
const insertEvent = async (event) => {
	try {
		let response = await calendar.events.insert({
			auth: auth,
			calendarId: calendarId,
			resource: event
		});

		if (response["status"] == 200 && response["statusText"] === "OK") {
			return response.data.id;
		} else {
			return 0;
		}
	} catch (error) {
		console.log(`Error at insertEvent --> ${error}`);
		return 0;
	}
};

const getEvent = async (eventId) => {
	try {
		let response = await calendar.events.get({
			auth: auth,
			calendarId: calendarId,
			eventId: eventId
		});

		// let items = response['data']['items'];
		return response.data;
	} catch (error) {
		console.log(`Error at getEvent --> ${error}`);
		return 0;
	}
};

const getMultipleEventsByIds = async (eventIds) => {
	try {
		// Create an array of promises to get events for each eventId
		const eventPromises = eventIds.map((eventId) => {
			return calendar.events.get({
				auth: auth,
				calendarId: calendarId,
				eventId: eventId
			});
		});

		// Wait for all promises to resolve
		const events = await Promise.all(eventPromises);

		// Return the data of the events
		return events.map((event) => event.data); // Extract event data from response
	} catch (error) {
		console.log(`Error at getMultipleEventsByIds --> ${error}`);
		return null;
	}
};

const deleteEvent = async (eventId) => {
	try {
		let response = await calendar.events.delete({
			auth: auth,
			calendarId: calendarId,
			eventId: eventId
		});

		if (response.status === 204) {
			// 204 No Content is returned by Google Calendar on successful deletion
			return 1;
		} else {
			return 0;
		}
	} catch (error) {
		console.log(`Error at deleteEvent --> ${error}`);
		return 0;
	}
};

exports.create = async (req, res) => {
	try {
		// console.log(req);
		console.log("entered");

		let callDisposition = req.body.callDisposition;
		let reminderDate = req.body.reminderDate;
		let Reminder_Time = req.body.Reminder_Time;
		let USER_ID = req.user.id;
		let BK_ID = req.body.BK_ID;
		let Comment = req.body.Comment ? req.body.Comment : null;

		// Parse the Reminder_Time from the body (user's specified time)
		// let reminderTime = new Date(Date.parse(Reminder_Time));

		// Event for Google Calendar with provided start and end times
		// let event = {
		// 	summary: `${Summary}`,
		// 	description: `${Description}`,
		// 	start: {
		// 		dateTime: reminderTime.toISOString(),
		// 		timeZone: "Asia/Karachi" // Set the time zone to Pakistan
		// 	},
		// 	end: {
		// 		dateTime: new Date(reminderTime.getTime() + 5 * 60 * 1000).toISOString(),
		// 		timeZone: "Asia/Karachi" // Set the time zone to Pakistan
		// 	},
		// 	reminders: {
		// 		useDefault: false, // Disable default reminders
		// 		overrides: [
		// 			{ method: "popup", minutes: 0 } // Trigger exactly at the specified time
		// 		]
		// 	}
		// };

		// const eventId = await insertEvent(event);

		// if (!eventId) {
		// 	return res.status(500).send({ message: "Failed to create calendar event." });
		// }

		const reminderData = {
			Start_Date: reminderDate,
			End_Date: reminderDate,
			reminderTime: Reminder_Time,
			// End_Date: new Date(Reminder_Time.getTime() + 5 * 60 * 1000).toISOString(),
			BK_ID
			// Event_ID: eventId,
		};
		let commentObj = {
			callDisposition,
			Comment,
			USER_ID,

		};

		console.log(reminderData.USER_ID)
		let findReminder =await CalenderReminder.findOne({ where: { BK_ID: reminderData.BK_ID } })
			// .then(async (response) => {
				console.log(findReminder)
				if (findReminder) {

						let updatereminder = await CalenderReminder.update(reminderData, {
							where: { BK_ID: reminderData.BK_ID }
						});
						let getUpdatedReminder = await CalenderReminder.findOne({ where: { BK_ID: reminderData.BK_ID } });
						console.log(updatereminder);
						commentObj.CR_ID = getUpdatedReminder.CR_ID;
	
						let createComment = await CalenderComment.create(commentObj);
	
						res.send({ message: "Reminder Created" });
				} else {
					console.log("in else");
					let createReminder = await CalenderReminder.create(reminderData);

					commentObj.CR_ID = createReminder.CR_ID;

					let createComment = await CalenderComment.create(commentObj);

					res.send({ message: "Reminder Created" });
				}
			// })
			// .catch((err) => {
				// res.status(500).send(err);
			// });

		// const booking = await Booking.findOne({ where: { BK_ID: reminder.BK_ID } });

		// console.log(booking);

		// if (!booking) {
		// 	res.status(404).send({ message: "Booking not FOund!" });
		// }

		// booking.update({
		// 	CR_ID: reminder.CR_ID
		// });

		// if (Comment !== null) {
		// 	console.log(7);
		// 	const commentBody = {
		// 		Comment,
		// 		CR_ID: reminder.CR_ID
		// 	};
		// 	const createComment = await CalenderComment.create(commentBody);

		// 	await reminder.update({
		// 		COMMENT_ID: createComment.id
		// 	});

		// 	await reminder.reload();
		// }

		// res.status(200).send({
		// 	message: "Reminder created Successfully!"
		// 	// data: reminder
		// });
	} catch (error) {
		console.log(error)
		res.status(500).send(error);
	}
};

exports.getById = async (req, res) => {
	try {
		const bkid = req.body.bkid;
		const userid = req.user.id;

		const findEvent = await CalenderReminder.findOne({
			where: { BK_ID: bkid,  },
			include: [
				{
					as: "Comments",
					model: CalenderComment,
					where:{
						USER_ID: userid
					}
				}
			]
		});

		// Fetch the event by its ID
		// const event = await getEvent(findEvent.Event_ID);

		// If event is found, return it
		return res.status(200).send({
			message: "Event fetched successfully!",
			data: {
				Reminder: findEvent
			}
		});
	} catch (error) {
		res.status(500).send({
			message: `Error fetching event: ${error.message}`
		});
	}
};

exports.getAllByIds = async (req, res) => {
	try {
		const bkid = req.body.bkid;

		const reminders = await CalenderReminder.findAll({
			where: { BK_ID: bkid },
			include: [
				{
					as: "Comments",
					model: CalenderComment
				}
			]
		});

		if (!reminders || reminders.length === 0) {
			return res.status(404).send({ message: "No reminders found" });
		}

		const eventIds = reminders.map((reminder) => reminder.Event_ID);

		const events = await getMultipleEventsByIds(eventIds);

		if (events) {
			return res.status(200).send({
				message: "Events fetched successfully!",
				data: {
					Reminders: reminders,
					events: events
				}
			});
		} else {
			return res.status(404).send({
				message: "No events found for the provided event IDs"
			});
		}
	} catch (error) {
		res.status(500).send({
			message: `Error extracting Event IDs: ${error.message}`
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const bkid = req.body.bkid;
		const crid = req.body.crid;

		const findEvent = await CalenderReminder.findOne({
			where: { BK_ID: bkid, CR_ID: crid },
			include: [
				{
					as: "Comments",
					model: CalenderComment
				}
			]
		});

		const deleteStatus = await deleteEvent(findEvent.Event_ID);

		findEvent.update({
			status: false
		});

		if (deleteStatus === 1) {
			return res.status(200).send({ message: "Event deleted successfully" });
		} else {
			return res.status(500).send({ message: "Failed to delete the event" });
		}
	} catch (error) {
		res.status(500).send({
			message: `Error extracting Event IDs: ${error.message}`
		});
	}
};

exports.getFromBookingId = async (req, res) => {
	try {
		const bkid = req.body.bkid;

		const bookings = await Booking.findAll({
			where: { BK_ID: bkid },
			include: [
				{
					as: "Reminder",
					model: CalenderReminder,
					include: [
						{
							as: "Comments",
							model: CalenderComment
						}
					]
				}
			]
		});

		res.send({ message: "Fetched through booking", data: bookings });
	} catch (error) {}
};
