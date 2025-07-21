// import * as Notify from "../Helpers/Notify"
// // import * as Payload from "../Helpers/Payload"
// import * as Constants from "../Helpers/Constants"
// // import { analytics, auth } from 'firebase-functions';

// //  * Triggers when the app is removed from the user device and sends a notification to your developer device.
// //  * NOTE: for this trigger to  work, you must mark the `app_remove` event as a conversion event in Firebase's
// //  * Analytics dashboard.
// //  * The device model name, the city and the country of the user are sent in the notification message
// export const app_removed_analytics = Constants.runTimeoutShort
//     .analytics.event('app_remove')
//     .onLog((event) => {
//         // const payload = Payload.payload_analytics_notification(event, Constants.analytics_events.app_remove)
//         const geoInfo = event.user?.geoInfo.city + ", " + event.user?.geoInfo.country
//         const deviceInfo = event.user?.deviceInfo.mobileModelName
//         const payload = {
//             notification: {
//                 title: Constants.analytics_events.app_remove,//'You lost a user \uD83D\uDE1E',
//                 body: deviceInfo + " from " + geoInfo,
//             }
//         }
//         return Notify.notify_admin(payload)
//     })

// //App removed (admin)
// export const auth_created = Constants.runTimeoutShort
//     .auth.user()
//     .onCreate((user) => {
//         const payload = {
//             notification: {
//                 title: "New User",
//                 body: user.displayName + " signed up.", //user.metadata.creationTime
//                 image: user.photoURL
//             },
//             data: {
//                 click_action: 'FLUTTER_NOTIFICATION_CLICK',
//                 type: 'user_created',
//                 collection: 'users',
//                 onMessage: "New Sign Up",
//             }
//         }
//         return Notify.notify_admin(payload)
//     })
