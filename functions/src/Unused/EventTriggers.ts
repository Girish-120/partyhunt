// import * as Constants from "../Helpers/Constants";
// import * as DateTimeUtils from "../Helpers/DateTimeUtils";
// import { firestore } from "firebase-admin"; //admin,
// import moment from "moment-timezone";
// import { db } from "..";

//trigger job every day at 11 AM. Duplicate weekly events to the next week.
// export const cron_weekly_event_duplication_trigger = 
// Constants.runTimeoutLong.https.onRequest(async (_request, response) =>{
//     try {
//       const year = _request.body.year
//       const month = _request.body.month-1
//       const day = _request.body.day
//       const startTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.fromDate(new Date(year,month,day,11,0,0)), 0, -25, 0) //moment(now).subtract(25, "hours").toDate()
//       const endTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.fromDate(new Date(year,month,day,11,0,0)), 0, 0, 0) //moment(firestore.Timestamp.now()).toDate()
//       console.log(`running for : ${year}-${month}-${day}` )
//       console.log(`startTime : ${startTime.toDate().toUTCString()}` )
//       console.log(`endTime : ${endTime.toDate().toUTCString()}` )
//       const allEvents = await db
//         .collection("events")
//         .where("fromDate", ">=", startTime)
//         .where("fromDate", "<=", endTime)
//         .where("isWeekly", "==", true)
//         // .orderBy("fromDate") // Dev Mode
//         // .limit(1) // Dev Mode
//         .get();

//       const listEventIds: String[] = [];
//       const datarwt: any[] = [];

//       allEvents.forEach(async function (eventDoc) {
//         const event = eventDoc.data();
//         const eventId = event.docId;

//         if (listEventIds.includes(eventId))
//           datarwt.push(eventDoc.ref.delete()); //.then().catch() await 
//         else if (event.publishStatus !== -2) {
//           listEventIds.push(eventId);

//           event.fromDate = moment(event.fromDate.toDate())
//             .add(7, "days")
//             .toDate();
//           event.toDate = moment(event.toDate.toDate()).add(7, "days").toDate();
//           event.eventDates = DateTimeUtils.getEventDates(event.fromDate, event.toDate);

//           // ToDo: Reset Promotion Package (Boost ID) only for single boost and not for seasonal package
//           //  is the 
//           event.promotionPackage = 0;
//           // event.ownerId = null

//           if (event.publishStatus === -1) {
//             // Update Date for ToBeUpdated Events
//             datarwt.push(eventDoc.ref.update(event))
//           }
//           else {
//             //Under review will stay under review for the next week & Published will become ToBeUpdated
//             event.publishStatus = event.publishStatus === 0 ? 0 : -1
//             event.commentsCount = 0;

//             //Stay rejected for the next week
//             // event.publishStatus = event.publishStatus === -2 ? -2 : -1

//             //Create new doc for underReview & Published events
//             datarwt.push(db.collection("events").add(event))
//           }

//           // event.countFollowers = 0
//           // event.listFollowers = []

//           // docId remains unchanged to identify parent (first) weekly event in the series
//           // event.docId = null

//           // Using the last event picture until changed again from
//           // event.picture = null
//           // event.picture_thumbnail = null
//         }
//       });

//       // const _dataloaded =
//       await Promise.all(datarwt);
//       const eventResponse = "Total Events Duplicated event after (& until now) " +
//       startTime.toDate().toUTCString() +
//       " Count - " +
//       listEventIds.length +
//       " / " +
//       allEvents.docs.length
//       console.log(eventResponse
//       );
//       //return "Success of weeklyEventDuplication";
//       response.status(200).send(eventResponse);
//       return 
//     } catch (error) {
//       console.error(error);
//       response.status(500).send(`error with ${error}`);
//     }
//   });