"use strict";
// export const cron_event_reminder_notification = Constants.runTimeout.https.onRequest(async (_request, response) => {
//   try {
//     const initialDate = parseDate(Date())
//     const afterTime = initialDate.getTime() + (Constants.oneDay * 10) //40 mins
//     const finalDate = new Date(afterTime)
//     const allEvents = await firestore().collection("events")
//       .where("fromDate", ">=", initialDate)
//       .where("fromDate", "<=", finalDate)
//       .where("publishStatus", '==', 1)
//       .get()
//     console.log('finalDate: ' + finalDate + ' Total Events: ' + allEvents.size.toString()) //Timezone is UTC,but still working
//  const seasonalSilver: string[] = []
// 	const seasonalGold: string[] = ['ChIJ5YSCX4PpvzsRYh1VPt__4rA', 'ChIJ5YSCX4PpvzsRYh1VPt__4rA']//Purple Martini
// 	const seasonalDiamond: string[] = []
// 	let promotionPackage = 0
// 	if (seasonalSilver.includes(idPlace)) promotionPackage = 10
// 	else if (seasonalGold.includes(idPlace)) promotionPackage = 30
// 	else if (seasonalDiamond.includes(idPlace)) promotionPackage = 40
// 	if (promotionPackage > 0) {
// 		firestore().collection("events").doc(docId).update({
// 			'promotionPackage': promotionPackage,
// 			// 'publishStatus': 1
// 		})
// 			.then(a => console.log("Success: Updating Promotion Package. Event docId: " + docId))
// 			.catch(e => console.error("Error: Updating Promotion Package. Event docId: " + docId + "\n" + e))
// 	}
//     allEvents.forEach(function (eventDoc) {
//       const event = eventDoc.data()
//       const payload = Payload.payload_event_notification(event, Constants.event_edit_actions.event_reminder)
//       if (event.promotionPackage >= 40)
//         return Notify.notify_all_users(payload)
//       else
//         return Notify.notify_followers(event.likesRefsArray, payload)
//     })
//     response.send('Success of All Event Reminder Notification')
//   }
//   catch (error) {
//     console.error(error)
//     response.status(500).send(error)
//   }
// })
//Cron job every day at 9 AM. Duplicate weekly events to the next week.
// export const cron_weekly_event_duplication_old = Constants.runTimeout.https.onRequest(async (_request, response) => {
//     try {
//       const finalDate = parseDate(Date())
//       const initialTime = finalDate.getTime() - (Constants.oneDay * 5)
//       const initialDate = new Date(initialTime)
//       console.log('weeklyEventDuplication initialDate: ' + initialDate) //Timezone is UTC,but still working
//       const allEvents = await firestore().collection("events")
//         .where("fromDate", ">=", initialDate)
//         .where("fromDate", "<=", finalDate)
//         .where("isWeekly", '==', true)
//         .get()
//       allEvents.forEach(async function (eventDoc) {
//         const event = eventDoc.data()
//         const newFromDate = new Date(event.fromDate.toDate().getTime() + Constants.oneDay * 7)
//         const newToDate = new Date(event.toDate.toDate().getTime() + Constants.oneDay * 7)
//         // console.log('weeklyEventDuplication newToDate:' + newToDate)
//         await firestore().collection("events").doc(event.docId).update({
//           'fromDate': newFromDate,
//           'toDate': newToDate,
//           'promotionPackage': 0, //Todo: Reset only for single boost and not for seasonal package
//           'publishStatus': event.publishStatus === -2 ? -2 : -1 //Stay rejected for the next week
//         })
//       })
//       response.send('Success of weeklyEventDuplication')
//     }
//     catch (error) {
//       console.error(error)
//       response.status(500).send(error)
//     }
//   });
//Cron job every day at 9 AM. Duplicate weekly events to the next week.
// export const cron_weekly_event_duplication_new = Constants.runTimeout.https.onRequest(async (_request, response) => {
//   try {
//     const nowDate = Date.now();
//     // console.log('weeklyEventDuplicationNew nowDate: ' + nowDate.toLocaleString())
//     const allEvents = await firestore().collection("events")
//       .where("toDate", ">=", moment(nowDate).subtract(5, "days").toDate())
//       // .where("toDate", "<=", moment(nowDate).toDate())
//       // .where("isWeekly", '==', true)
//       // .orderBy("fromDate")
//       .limit(1)
//       .get()
//     allEvents.forEach(async function (eventDoc: DocumentData) {
//       const event = eventDoc.data()
//       event.fromDate = moment(event.fromDate.toDate()).add(7, "days").toDate()
//       event.toDate = moment(event.toDate.toDate()).add(7, "days").toDate()
//       event.eventDates = getEventDates(event.fromDate, event.toDate)
//       event.promotionPackage = 0 //Todo: Reset only for single boost and not for seasonal package
//       event.publishStatus = event.publishStatus === -2 ? -2 : -1 //Stay rejected for the next week
//       event.commentsCount = 0
//       event.likesRefsArray = []
//       event.isDuplicated = true
//       await firestore().collection("events").add(event)
//     })
//     response.send('Success of weeklyEventDuplication')
//   }
//   catch (error) {
//     console.error(error)
//     response.status(500).send(error)
//   }
// });
// Consistent timestamp
// const now = firestore.Timestamp.now();
// // Query all documents ready to perform
// const query = db.collection("events")
//   .where("fromDate", ">=", moment(Date.now()).toDate())
//   .where("fromDate", "<=", moment(Date.now()).add(20, "hours").toDate())
//   .where("publishStatus", '==', 1)
// const query = db.collection('tasks').where('performAt', '<=', now).where('status', '==', 'scheduled');
// const tasks = await query.get();
// Jobs to execute concurrently. 
// const jobs: Promise<any>[] = [];
// Loop over documents and push job.
// tasks.forEach(snapshot => {
//   const { worker, options } = snapshot.data();
//   const job = workers[worker](options)
//     // Update doc with status on success or error
//     .then(() => snapshot.ref.update({ status: 'complete' }))
//     .catch((err) => snapshot.ref.update({ status: 'error' }));
//   jobs.push(job);
// });
// console.log("Pub Sub executed")
// Execute all jobs concurrently
// return await Promise.all(jobs);
// export const cron_weekly_event_duplication_delete = Constants.runTimeoutLong.https.onRequest(async (_request, response) => {
//   try {
//     const allEvents = await db.collection("events")
//       .where("toDate", ">=", moment(Date.now()).subtract(25, "hours").toDate())
//       .where("isWeekly", '==', true)
//       .get()
//     const listEventIds: String[] = []
//     allEvents.forEach(async function (eventDoc) {
//       const eventId = eventDoc.data().docId
//       if (listEventIds.includes(eventId))
//         eventDoc.ref.delete().then().catch()
//       else
//         listEventIds.push(eventId)
//     })
//     console.log('Total Events Duplicated: ' + listEventIds.length + " / " + allEvents.docs.length)
//     response.send('Success of cron_weekly_event_duplication_delete')
//   }
//   catch (error) {
//     console.error(error)
//     response.status(500).send(error)
//   }
// });
//# sourceMappingURL=FirestoreCrons.js.map