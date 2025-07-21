// const updatePromotionPackage = function (idPlace: string, docId: string) {
// 	const seasonalSilver: string[] = []
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
// 			.then(a => console.log("Success: Up dating Promotion Package. Event docId: " + docId))
// 			.catch(e => console.error("Error: Updating Promotion Package. Event docId: " + docId + "\n" + e))
// 	}
// }



// export const set_publish_status = Constants.runTimeout.https.onRequest(async (_request, response) => {
//   try {
//     const todayDate = parseDate(Date())
//     const initialTime = todayDate.getTime() - (Constants.oneDay)
//     const initialDate = new Date(initialTime)

//     console.log('set_publish_status initialDate: ' + initialDate) //Timezone is UTC,but still working

//     const allEvents = await firestore().collection("events")
//       .where("fromDate", ">=", initialDate)
//       .where("publish", '==', true)
//       .get()

//     allEvents.forEach(async function (eventDoc) {
//       const event = eventDoc.data()
//       console.log('set_publish_status eventName:' + event.eventName)

//       await firestore().collection("events").doc(event.docId).update({
//         'publishStatus': 1
//       })
//     })

//     response.send('Success of set_publish_status')
//   }
//   catch (error) {
//     console.error(error)
//     response.status(500).send(error)
//   }
// });



// export const update_event_likes = Constants.runTimeout.https.onRequest(async (_request, response) => {
//   try {
//     const todayDate = parseDate(Date())
//     const initialTime = todayDate.getTime() - (Constants.oneDay)
//     const initialDate = new Date(initialTime)

//     console.log('update_event_likes initialDate: ' + initialDate) //Timezone is UTC,but still working

//     const allEvents = await firestore().collection("events")
//       .where("fromDate", ">=", initialDate)
//       .get()

//     allEvents.forEach(async function (eventDoc) {
//       const eventLikes = eventDoc.data()['likes']
      
//       likesRefsArray
//       likes
//       const event = eventDoc.data().likes
//       console.log('set_publish_status eventName:' + event.eventName)

//       await firestore().collection("events").doc(event.docId).update({
//         'publishStatus': 1
//       })
//     })
//   }
//   catch (error) {
//     console.error(error)
//     response.status(500).send(error)
//   }
// });



// Notify All Users
// const allTokens: string[] = []
// const allUsers = await firestore().collection("users").limit(6000)
//     .get()
// allUsers.forEach(function (userDoc) {
//     const fcmToken = userDoc.data().fcmToken

//     if (fcmToken.length > 0)
//         allTokens.push(fcmToken)
// })

// // Max devices per request    
// const batchLimit = 1000

// // Traverse tokens and split them up into batches of 1,000 devices each  
// for (let start = 0; start < allTokens.length; start += batchLimit) {
//     await send_notification(allTokens.slice(start, start + batchLimit), payload)
// }