"use strict";
// import * as Notify from "../Helpers/Notify"
// // import * as Payload from "../Helpers/Payload"
// import * as Constants from "../Helpers/Constants"
// import { firestore } from 'firebase-admin';
// 'Event Created' : Notify Editors
// export const tags_created_indexing =
// 	Constants.runTimeout.firestore.document('/tags/{tagId}')
// 		.onCreate(function (snap, _context) {
//             const name = snap.data()["name"] as String
//             const indexes: string[] = [];
//             for (let i = 1; i<=name.length ; i++){
//                 const index = name.substr(0,i).toLowerCase()
//                 console.log ("Index no." + i + index)
//                 indexes.push(index)
//             }
//             return firestore().collection("tags").doc(eventId).update({
// 				'commentsCount': FieldValue.increment(snap.after.exists ? 1 : -1)
// 			})
// 			return Notify.notify_editors()
// 		})
/**
 * Writes all logs from the Realtime Database into bigquery.
 */
// export const addtobigquery = functions.runWith(runtimeOpts).firestore.document('/events/{eventId}').onUpdate(async (change, context)  => {
// });
// functions.auth.user().onCreate(user => {
// 	const userObject = {
// 		displayName : user.displayName,
// 		email : user.email,
//     photoUrl : user.photoURL,
//     createdOn : user.metadata.creationTime,
//     // id: user.providerData.last.uid,
//     // "uid": user.uid,
//     // "phone": user.phoneNumber,
//     // "providerData": user.providerData.last.toString(),
//     // "providerId": user.providerData.last.providerId,
//     // //"username": 'User Name Test',
//     // // "photoUrl": user.photoURL,
//     // // "email": user.providerData.last.email, //Use this for left drawer
//     // // "displayName": user.displayName,
//     // "bio": "",
//     // "followers": {},
//     // "following": {},
//     // "followingEvents": {},
// 	};
// 	admin.database().ref('users/' + user.uid).set(userObject);
// });
// // TODO: Make sure you configure the 'dev_motivator.device_token' Google Cloud environment variables.
// const deviceToken = functions.config().dev_motivator.device_token;
// /**
//  * Triggers when the app is opened the first time in a user device and sends a notification to your developer device.
//  *
//  * The device model name, the city and the country of the user are sent in the notification message
//  */
// exports.appinstalled = functions.analytics.event('first_open').onLog((event) => {
//   const user = event.user;
//   const payload = {
//     notification: {
//       title: 'You have a new user \uD83D\uDE43',
//       body: `${user.deviceInfo.mobileModelName} from ${user.geoInfo.city}, ${user.geoInfo.country}`,
//     }
//   };
//   return admin.messaging().sendToDevice(deviceToken, payload);
// });
// Add one like to the like count
// let likesCount;
// let likesArray;
// if (!) {
// 'liked'
// }
// else if (!snap.after.exists) {
// 'unliked'
// likesCount = doc.data()['likesCount'] ? doc.data()['likesCount'] - 1 : 0;
// doc.data()['likessArray']? doc.data()['likessArray'].arrayRemove(userId) : ;
// const _ = t.update(eventRef,{
//   likessArray: FieldValue.arrayRemove(userId),
//   // likesCount: likesCount
// });
// }
// t.update(eventRef, { likesCount: likesCount });
// export const update_event_likes_count = firestore.document('/events/{eventId}/likes_collection/{userId}')
// .onWrite(async (snap, context) => {
//   TriggerHandler.update_event_likes_count(snap, context);
// }) 
// export const update_event_likes_count = function (snap, context) {
//   const eventRef = firestore().collection('events').doc(context.params.eventId);
//   const userId = context.params.userId;
//   firestore().runTransaction(async t => {
//     // const doc = await t.get(eventRef);
//     t.update(eventRef, {
//       likesArray: snap.after.exists ?
//         FieldValue.arrayUnion(userId) :
//         FieldValue.arrayRemove(userId),
//     });
//   }).then(result => {
//     console.log('Transaction success!');
//   }).catch(err => {
//     console.log('Transaction failure:', err);
//   });
// }
//# sourceMappingURL=FirestoreTriggers.js.map