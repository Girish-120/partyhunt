"use strict";
// import { DocumentData } from '@google-cloud/firestore';
// import { firestore } from 'firebase-functions';
// import * as Notify from "../Helpers/Notify"
// import * as Constants from "../Helpers/Constants"
// import { firestore } from 'firebase-admin';
// import { DocumentData } from "@google-cloud/firestore";
// import * as Payload from "../Helpers/Payload"
//User created (admin)
// export const user_created_notify_admin = firestore.document('/users/{userId}')
//     .onCreate(function (snap, _context) {
//         const payload = Payload.payload_user_created(snap.data());
//         return Notify.notify_admin(payload)
//     })
//User created (admin)
// export const user_follow_notify_following = Constants.runTimeout.firestore.document('/users/{userId}')
//     .onUpdate(function (snap, context) {
//         const beforeData = snap.before.data()
//         const afterData = snap.after.data()
//         if (afterData['listFollowers'] !== beforeData['listFollowers']) {
//             // const followerUID = afterData['listFollowers'][0]
//             const followerUID:string = snap.after.get('listFollowers').first
//             firestore().doc(followerUID).get().then((user) => {
//                 const follower = user.data()
//                 const payload = {
//                     notification: {
//                         title: "New Follower",
//                         body: follower['displayName'],
//                         image: follower['photoUrl']
//                     },
//                 }
//                 const fcmToken = afterData['fcmToken']
//                 return Notify.send_notification(fcmToken, payload)
//             }
//             ).catch(err => console.error(err))
//         }
//         return null
//     })
//# sourceMappingURL=UserNotifications.js.map