"use strict";
// // import { DocumentReference, QueryDocumentSnapshot } from '@google-cloud/firestore';
// // import { firestore } from 'firebase-admin' //admin,
// // import moment from 'moment-timezone'
// // import * as Notify from "../Helpers/Notify"
// import * as Constants from "../Helpers/Constants"
// import * as functions from 'firebase-functions'
// import { db } from '..'
// //Cron job every day at 4 AM. Deduplicate tags daily.
// export const cron_tag_daily_job = functions.runWith(Constants.runTimeOptionsLong)
//   .pubsub
//   .schedule('00 04 * * *')
//   .timeZone(Constants.timezone)
//   .onRun(async _context => {
//     try {
//       const allTags = await db.collection("tags").orderBy("name").get()//createdAt
//       const mapSavedTags = new Map()
//       const datarwt: any[] = []
//       allTags.forEach(async function (tagDoc) {
//         const tag = tagDoc.data()
//         const tagName = tag.name.replace(/\s/g, "").toLowerCase()
//         if (Array.from(mapSavedTags.keys()).includes(tagName)) {
//           console.log('tagName deleted ' + datarwt.length + tag.name)
//           ///Copy Indexes from deleted to saved
//           const updateTag = mapSavedTags.get(tagName)
//           const mergedListIndexes: any[] = updateTag.data().listIndexes.concat(tag.listIndexes)
//           const deduplicatedListIndexes = mergedListIndexes.filter((item, pos) => mergedListIndexes.indexOf(item) === pos)
//           datarwt.push(updateTag.ref.update({
//             'listIndexes': deduplicatedListIndexes
//           }))
//           ///Delete Old Tag
//           datarwt.push(tagDoc.ref.delete())
//         }
//         else
//           mapSavedTags.set(tagName, tagDoc)
//       })
//       // const _dataloaded = 
//       await Promise.all(datarwt);
//       console.log('Total Tags Saved: ' + Array.from(mapSavedTags.keys()).length + " / " + allTags.docs.length)
//       return 'Success of cron_tag_daily_job'
//     }
//     catch (error) {
//       console.error(error)
//       return error
//     }
//   })
//# sourceMappingURL=TagCrons.js.map