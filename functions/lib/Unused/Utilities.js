"use strict";
// import firestoreService from '@crapougnax/firestore-export-import'
// import path from 'path'
// import FirestoreBackup from '@crapougnax/firestore-export-import'
// import firestoreService from 'firestore-export-import'
// import firestoreService from 'firestore-export-import';
// const serviceAccount = '/Users/rachitr/Documents/partyhunt_flutter/functions/src/JSONs/serviceAccountKey_dev.json';
// // Initiate Firebase App
// // appName is optional, you can omit it.
// const appName = '[DEFAULT]';
// firestoreService.initializeApp(
//   serviceAccount, "https://party-hunt.firebaseio.com"
//   // credential: admin.credential.applicationDefault(serviceAccount),
//   // {serviceAccount, databaseURL, appName}
//   );
// // Start exporting your data
// async function exportData() {
//   try {
//     await firestoreService
//       .backup('collection-name')
//       .then((data) => console.log(JSON.stringify(data)));
//   }
//   catch (e) {
//   }
// }
// list of JSON files generated with the export service
// Must be in the same folder as this script
// const collections = ['languages', 'roles']
// Start your firestore emulator for (at least) firestore
// firebase emulators:start --only firestore
// Initiate Firebase Test App
// function event_edit_actions() {
//   const db = firestoreService.initializeTestApp('test', {
//     uid: 'john',
//     email: 'john@doe.com',
//   })
//   // Start importing your data
//   const promises: any[] = []
//   try {
//     collections.map(collection =>
//       promises.push(
//         firestoreService.fixtures(
//           path.resolve(__dirname, `./${collection}.json`),
//           [],
//           [],
//           db,
//         ),
//       ),
//     )
//     Promise.all(promises).then(process.exit)
//   } catch (err) {
//     console.error(err)
//   }
// }
//# sourceMappingURL=Utilities.js.map