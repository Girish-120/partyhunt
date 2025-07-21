"use strict";
// import { spawn } from 'child_process';
// import path = require('path');
// import os = require('os');
// import fs = require('fs');
// import { storage as storageInstance, firestore } from 'firebase-admin';
// import { storage } from 'firebase-functions';
// export const generate_thumbnail = storage.object().onFinalize(async function (object) {
//   try {
//     // const fileBucket = object.bucket // The Storage bucket that contains the file.
//     // const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
//     const filePath = object.name // File path in the bucket.
//     const fileName = path.basename(filePath);
//     const contentType = object.contentType // File content type.
//     // Exit if this is triggered on a file that is not an image.
//     if (!contentType.startsWith('image/')) {
//       console.log('This is not an image : ' + contentType)
//       return
//     }
//     // Get the file name.
//     // Exit if the image is already a thumbnail.
//     if (fileName.startsWith('thumb_') ||fileName.startsWith('full_')  ) {
//       //full_ is for event picture. Already handled on the frontend
//       console.log('Already a Thumbnail : ' + fileName)
//       return
//     }
//     // Exit if the image is an event picture
//     // if (filePath.startsWith('eventPicture')) {
//     //   console.log('Event Picture handled on frontend : ' + fileName)
//     //   return
//     // }
//     // Download file from bucket to local tempFilePath
//     const bucket = storageInstance().bucket(object.bucket)
//     const tempFilePath = path.join(os.tmpdir(), fileName)
//     const metadata = { contentType: contentType }
//     // console.log('tempFilePath: ', tempFilePath)
//     await bucket.file(filePath).download({ destination: tempFilePath })
//     // Generate a thumbnail using ImageMagick. //From 200x200
//     await spawn('convert', [tempFilePath, '-thumbnail', '250x250>', tempFilePath])
//     console.log('Thumbnail created temp at', tempFilePath)
//     // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
//     const thumbFileName = `thumb_${fileName}`
//     const thumbFilePath = path.join(path.dirname(filePath), thumbFileName)
//     // Uploading the thumbnail.
//     const thumbnails = await bucket.upload(tempFilePath, {
//       destination: thumbFilePath,
//       metadata: metadata,
//     })
//     const picture_thumbnail_urls = await thumbnails[0].getSignedUrl({
//       action: 'read',
//       expires: '03-09-2491'
//     })
//     //Update firestore
//     setTimeout(async function () { //Wait 5 secs because client is setting thumbnsil url to ""
//       if (filePath.startsWith('eventPicture')) {
//         const eventId = filePath.replace('eventPicture/', '').replace(fileName, '')
//         await firestore().collection("events").doc(eventId).update({ 'picture_thumbnail': picture_thumbnail_urls[0] })
//         console.log('File uploaded for eventId: ' + eventId)
//       }
//       else if (filePath.startsWith('userPicture')) {
//         const userId = filePath.replace('userPicture/', '').replace(fileName, '')
//         await firestore().collection("users").doc(userId).update({ 'picture_thumbnail': picture_thumbnail_urls[0] })
//         console.log('File uploaded for userId: ' + userId)
//       }
//     }, 5000);
//     // Once the thumbnail has been uploaded delete the local file to free up disk space.
//     fs.unlinkSync(tempFilePath)
//     return
//   }
//   catch (error) {
//     console.error(error)
//   }
// })
// [START generateThumbnail]
/**
 * When an image is uploaded in the Storage bucket We generate a thumbnail automatically using
 * ImageMagick.
 */
// [START generateThumbnailTrigger]
// export const update_event_promotion_plan = firestore.document('/events/{eventId}/promotions_collection/{promotion}')
//   .onCreate(async function (snap: DocumentSnapshot, context: EventContext) {
//     try {
//       const eventId = context.params.eventId
//       //const promotion = context.params.promotion
//       const promotionData = snap.data()
//       await firestoreInstance().collection('events').doc(eventId).update({ promotionPackage: promotionData["promotionPackage"], publishStatus: 1 })
//       console.log('Succesful ' + eventId + ' PromotionPackage: ' + promotionData['promotionPackage'])
//       //where("expiryTimestamp", isGreaterThan: event.fromDate)
//       // .orderBy('expiryTimestamp', descending: true)
//     }
//     catch (error) {
//       console.error(error)
//     }
//   })
//# sourceMappingURL=StorageTriggers.js.map