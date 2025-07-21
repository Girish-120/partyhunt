
// 'use strict';

// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// admin.initializeApp();
// const mkdirp = require('mkdirp-promise');
// const vision = require('@google-cloud/vision')();
// const spawn = require('child-process-promise').spawn;
// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// /**
//  * When an image is uploaded we check if it is flagged as Adult or Violence by the Cloud Vision
//  * API and if it is we blur it using ImageMagick.
//  */
// exports.blurOffensiveImages = functions.storage.object().onFinalize(async (object) => {
//   const file = admin.storage().bucket(object.bucket).file(object.name);

//   // Check the image content using the Cloud Vision API.
//   const data = await vision.detectSafeSearch(file);
//   const safeSearch = data[0];
//   console.log('SafeSearch results on image', safeSearch);

//   if (safeSearch.adult || safeSearch.violence) {
//     return blurImage(object.name, object.bucket, object.metadata);
//   }
//   return null;
// });

// /**
//  * Blurs the given image located in the given bucket using ImageMagick.
//  */
// async function blurImage(filePath, bucketName, metadata) {
//   const tempLocalFile = path.join(os.tmpdir(), filePath);
//   const tempLocalDir = path.dirname(tempLocalFile);
//   const bucket = admin.storage().bucket(bucketName);

//   // Create the temp directory where the storage file will be downloaded.
//   await mkdirp(tempLocalDir);
//   console.log('Temporary directory has been created', tempLocalDir);
//   // Download file from bucket.
//   await bucket.file(filePath).download({destination: tempLocalFile});
//   console.log('The file has been downloaded to', tempLocalFile);
//   // Blur the image using ImageMagick.
//   await spawn('convert', [tempLocalFile, '-channel', 'RGBA', '-blur', '0x8', tempLocalFile]);
//   console.log('Blurred image created at', tempLocalFile);
//   // Uploading the Blurred image.
//   await bucket.upload(tempLocalFile, {
//     destination: filePath,
//     metadata: {metadata: metadata}, // Keeping custom metadata.
//   });
//   console.log('Blurred image uploaded to Storage at', filePath);
//   fs.unlinkSync(tempLocalFile);
//   console.log('Deleted local file', filePath);
// }