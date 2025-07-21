import * as Constants from "../Helpers/Constants";
import * as DateTimeUtils from "../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import * as functions from "firebase-functions";
import { db } from "../..";
import * as SheetUtils from "../Helpers/SheetUtils";
import { createTableEmail } from "../Helpers/MailUtils";
import IMailSend from "../Interfaces/SendMail";
// import MailChimpSender from "../Services/MailChimp";
import SecretVariables from "../Helpers/SecretVariables";
import BrevoMailSender from "../Services/BrevoMail";
// import { constants } from "fs/promises";
interface TribeData {
  published_events: number;
  boosted_events: number;
  silver_boost: number;
  gold_boost: number;
  diamond_boost: number;
  underground_event: number;
}

interface UsersTribeData {
  newUsers: number;
  newUGUsers: number;
  expiringUGUsers: number;
}

// Function to get tribe-wise data for events
async function getEventsByTribe(): Promise<Record<string, TribeData>> {
  const startTime = DateTimeUtils.addSubtractTime(
    firestore.Timestamp.now(),
    -1,
    0,
    0
  ); // Until now
  const endTime = DateTimeUtils.addSubtractTime(
    firestore.Timestamp.now(),
    0,
    0,
    0
  ); // From  65 minutes ago

  const tribeData: Record<string, TribeData> = {};

  const allEvents = await db
    .collection("events")
    .where("fromDate", ">=", startTime)
    .where("fromDate", "<=", endTime)
    .get();

  allEvents.forEach(function (eventDoc) {
    const event = eventDoc.data();

    if (event.publishStatus !== undefined && event.publishStatus === 1) {
      const tribe = event.tribe || "goa"; // Default tribe is "goa"

      if (!tribeData[tribe]) {
        tribeData[tribe] = {
          published_events: 0,
          boosted_events: 0,
          silver_boost: 0,
          gold_boost: 0,
          diamond_boost: 0,
          underground_event: 0
        };
      }

      tribeData[tribe].published_events += 1;

      if (event.promotionPackage !== undefined && event.promotionPackage > 0) {
        tribeData[tribe].boosted_events += 1;

        if (event.promotionPackage === 10) tribeData[tribe].silver_boost += 1;
        else if (event.promotionPackage === 20)
          tribeData[tribe].gold_boost += 1;
        else if (event.promotionPackage === 40)
          tribeData[tribe].diamond_boost += 1;
      }

      if (event.isUnderground !== undefined && event.isUnderground)
        tribeData[tribe].underground_event += 1;
    }
  });

  return tribeData;
}


// Export events collection to Google Sheet
export const cron_event_data_spreadsheet = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("0 0 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      console.log("Starting: Event Data SpreadSheet. ");
      const startTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        -1,
        0,
        0
      ); //Until now
      const endTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        0,
        0,
        0
      ); //From  65 minutes ago

      const allEvents = await db
        .collection("events")
        .where("fromDate", ">=", startTime) //toDate
        .where("fromDate", "<=", endTime) //toDate
        .get();

      const newUsers = await db
        .collection("users")
        .where("createdAt", ">=", startTime) //toDate
        .where("createdAt", "<=", endTime) //toDate
        .get();

      const newUGUsers = await db
        .collection("users")
        .where("undergroundPayment.dateStart", ">=", startTime) //toDate
        .where("undergroundPayment.dateStart", "<=", endTime) //toDate
        .get();

      const expiringUGUsers = await db
        .collection("users")
        .where("undergroundPayment.dateExpiry", ">=", startTime) //toDate
        .where("undergroundPayment.dateExpiry", "<=", endTime) //toDate
        .get();
      console.info(`Exporting Users To Spreadsheet.`);

      let published_events = 0;
      let boosted_events = 0;
      let silver_boost = 0;
      let gold_boost = 0;
      let diamond_boost = 0;
      let underground_event = 0;
      let totalCheckinCount = 0;

      allEvents.forEach(function (eventDoc) {
        const event = eventDoc.data();

        if (event.publishStatus !== undefined && event.publishStatus === 1) {
          published_events += 1;

          if (
            event.promotionPackage !== undefined &&
            event.promotionPackage > 0
          ) {
            boosted_events += 1;
            if (event.promotionPackage === 10) silver_boost += 1;
            else if (event.promotionPackage === 20) gold_boost += 1;
            else if (event.promotionPackage === 40) diamond_boost += 1;
          }
          if (event.totalCheckin !== undefined) {
            totalCheckinCount = totalCheckinCount + event.totalCheckin;
          }

          if (event.isUnderground !== undefined && event.isUnderground)
            underground_event += 1;
        }
      });

      const finalData = [
        endTime.toDate().toDateString(), // moment(now).subtract(24, "hours").toDate().toDateString(),
        allEvents.size.toString(),
        published_events.toString(),
        boosted_events.toString(),
        underground_event.toString(),
        newUsers.size.toString(),
        newUGUsers.size.toString(),
        expiringUGUsers.size.toString(),
        silver_boost.toString(),
        gold_boost.toString(),
        diamond_boost.toString(),
        totalCheckinCount.toString()
      ];

      // Send mail to admin

      const dataForEmail = [
        {
          EndTime: finalData[0],
          AllEvents: finalData[1],
          PublishedEvents: finalData[2],
          BoostedEvents: finalData[3],
          UndergroundEvents: finalData[4],
          NewUsers: finalData[5],
          NewUGUsers: finalData[6],
          ExpiringUGUsers: finalData[7],
          SilverBoost: finalData[8],
          GoldBoost: finalData[9],
          DiamondBoost: finalData[10]
        }
      ];

      const remoteData = await Constants.Constants();
      let adminEmails = "";
      if (remoteData?.adminEmailIds !== undefined) {
        adminEmails = remoteData?.adminEmailIds.toString();
      }
      console.log(`admin email ids : ${adminEmails}`);
      const htmlText = createTableEmail(dataForEmail);
      console.log(htmlText);
      const textData = `Hi Admin
      <br>Metrics for Events Users and Boost<br>
      for : ${startTime
        .toDate()
        .toLocaleDateString("en-GB", { timeZone: "UTC" })} <br>
      ${htmlText}`;

      const IEmailer: IMailSend = new BrevoMailSender(SecretVariables.brevoMailApiKey);
      //console.log(`mailchimpapi key ${SecretVariables.mailChimpApiKey}`)
      IEmailer.SendEmail({
        from: process.env.EMAIL_FROM,
        to: adminEmails,
        text: textData,
        html: textData,
        subject: `key metrics for last day ${finalData[0]}`
      })
        .then((msg) => {
          console.log("sender message" + msg);
        })
        .catch((err) => {
          console.log(`mail chimp error : ${err}`);
        });

      await SheetUtils.export_to_spreadsheet(finalData, "Daily");
      return "success";
    } catch (error) {
      console.error(error);
      return error;
    }
  });

//Export any firestore collection to google sheet
export const cron_firestore_to_spreadsheet =
  Constants.runTimeoutLong.https.onRequest(async (_request, response) => {
    try {
      //Keep it dynamic for each collection
      let collection = "brands";

      console.log(
        "Starting: Exporting Collection To Spreadsheet - " + collection
      );

      const allDocs = await db
        .collection(collection)
        // .where("publishStatus", "==", 1) //toDate
        .limit(5)
        .get();

      console.info(`Docs Fetched`);

      const finalData: Array<Array<object>> = [];

      allDocs.forEach(function (doc) {
        const data = doc.data();
        let arrObj: Array<object> = [];

        switch (collection) {
          case "places":
            arrObj = [
              doc.id ?? "",
              data.name ?? "",

              data.publishStatus ?? "",
              data.promotionsSubscription ?? "",

              data.phone ?? "",
              data.rating ?? "",

              data.area ?? "",
              data.locality ?? "",
              data.fixedLocality ?? "",

              data.address ?? "",
              data.state ?? "",
              data.country ?? "",

              data.idPlace ?? "",
              data.icon ?? ""

              // data.listPhotos, - arr
              // data.type, - arr
            ];
            break;

          case "tags":
            arrObj = [
              doc.id ?? "",
              data.name ?? "",
              data.createdAt ?? "",
              data.publishStatus ?? "",
              data.docId ?? ""
            ];
            break;

          case "brands":
            arrObj = [
              data.name ?? "",

              data.category ?? "",
              data.country ?? "",
              data.createdAt ?? "",

              data.profileId ?? "",
              data.shortBio ?? "",
              data.description ?? "",
              data.tribe ?? "",

              data.promotionPackage ?? "",
              data.publishStatus ?? "",

              data.ownerEmail ?? "",
              data.ownerId ?? "",
              data.email ?? "",
              data.isByEditor ?? "",

              data.picture ?? "",
              data.picture_thumbnail ?? "",

              doc.id ?? "",
              data.docId ?? "",

              data.createdAt ?? "",
              data.editedAt ?? "",
              data.featuredAt ?? "",

              data.mapSocialLinks.email ?? "",
              data.mapSocialLinks.facebook ?? "",
              data.mapSocialLinks.instagram ?? "",
              data.mapSocialLinks.phone ?? "",
              data.mapSocialLinks.website ?? "",
              data.mapSocialLinks.youtube ?? ""

              // data.listTags ?? "",
              // data.listTribes ?? "",
            ];
            break;

          default:
            break;
        }

        finalData.push(arrObj);
      });

      await SheetUtils.export_to_spreadsheet(finalData, collection);
      response.send("Success of cron_firestore_to_spreadsheet: " + collection);
    } catch (error) {
      // functions.logger.error(error)
      console.error(error);
      response.status(500).send(error);
    }

    //     try {
    //       console.log("Starting: Event Data SpreadSheet. ");
    //       const startTime = DateTimeUtils.addSubtractTime(
    //         firestore.Timestamp.now(),
    //         -1,
    //         0,
    //         0
    //       ); // Until now
    //       const endTime = DateTimeUtils.addSubtractTime(
    //         firestore.Timestamp.now(),
    //         0,
    //         0,
    //         0
    //       ); // From  65 minutes ago

    //       const eventsByTribe = await getEventsByTribe();
    //       const usersByTribe = await getUsersByTribe();

    //       console.info(`Exporting Users To Spreadsheet.`);

    //       const finalData: any[] = [
    //         endTime.toDate().toDateString(),
    //         Object.keys(eventsByTribe).length.toString(),
    //         Object.keys(usersByTribe).length.toString(),
    //       ];

    //       Object.keys(eventsByTribe).forEach((tribe) => {
    //         const eventTribeData = eventsByTribe[tribe];
    //         const userTribeData = usersByTribe[tribe];

    //         finalData.push(
    //           tribe,
    //           eventTribeData.published_events.toString(),
    //           eventTribeData.boosted_events.toString(),
    //           eventTribeData.silver_boost.toString(),
    //           eventTribeData.gold_boost.toString(),
    //           eventTribeData.diamond_boost.toString(),
    //           eventTribeData.underground_event.toString(),
    //           userTribeData.newUsers.toString(),
    //           userTribeData.newUGUsers.toString(),
    //           userTribeData.expiringUGUsers.toString()
    //         );
    //       });

    //       await SheetUtils.export_to_spreadsheet(finalData, "Daily");
    //     } catch (error) {
    //       console.error(error);
    //       return error;
    //     }
    //   });

    // //Export any firestore collection to google sheet
    // export const cron_firestore_to_spreadsheet =
    //   Constants.runTimeoutLong.https.onRequest(async (_request, response) => {
    //     try {
    //       //Keep it dynamic for each collection
    //       let collection = "brands";

    //       console.log(
    //         "Starting: Exporting Collection To Spreadsheet - " + collection
    //       );

    //       const allDocs = await db
    //         .collection(collection)
    //         // .where("publishStatus", "==", 1) //toDate
    //         .limit(5)
    //         .get();

    //       console.info(`Docs Fetched`);

    //       const finalData: Array<Array<object>> = [];

    //       allDocs.forEach(function (doc) {
    //         const data = doc.data();
    //         let arrObj: Array<object> = [];

    //         switch (collection) {
    //           case "places":
    //             arrObj = [
    //               doc.id ?? "",
    //               data.name ?? "",

    //               data.publishStatus ?? "",
    //               data.promotionsSubscription ?? "",

    //               data.phone ?? "",
    //               data.rating ?? "",

    //               data.area ?? "",
    //               data.locality ?? "",
    //               data.fixedLocality ?? "",

    //               data.address ?? "",
    //               data.state ?? "",
    //               data.country ?? "",

    //               data.idPlace ?? "",
    //               data.icon ?? "",

    //               // data.listPhotos, - arr
    //               // data.type, - arr
    //             ];
    //             break;

    //           case "tags":
    //             arrObj = [
    //               doc.id ?? "",
    //               data.name ?? "",
    //               data.createdAt ?? "",
    //               data.publishStatus ?? "",
    //               data.docId ?? "",
    //             ];
    //             break;

    //           case "brands":
    //             arrObj = [
    //               data.name ?? "",

    //               data.category ?? "",
    //               data.country ?? "",
    //               data.createdAt ?? "",

    //               data.profileId ?? "",
    //               data.shortBio ?? "",
    //               data.description ?? "",
    //               data.tribe ?? "",

    //               data.promotionPackage ?? "",
    //               data.publishStatus ?? "",

    //               data.ownerEmail ?? "",
    //               data.ownerId ?? "",
    //               data.email ?? "",
    //               data.isByEditor ?? "",

    //               data.picture ?? "",
    //               data.picture_thumbnail ?? "",

    //               doc.id ?? "",
    //               data.docId ?? "",

    //               data.createdAt ?? "",
    //               data.editedAt ?? "",
    //               data.featuredAt ?? "",

    //               data.mapSocialLinks.email ?? "",
    //               data.mapSocialLinks.facebook ?? "",
    //               data.mapSocialLinks.instagram ?? "",
    //               data.mapSocialLinks.phone ?? "",
    //               data.mapSocialLinks.website ?? "",
    //               data.mapSocialLinks.youtube ?? "",

    //               // data.listTags ?? "",
    //               // data.listTribes ?? "",
    //             ];
    //             break;

    //           default:
    //             break;
    //         }

    //         finalData.push(arrObj);
    //       });

    //       await SheetUtils.export_to_spreadsheet(finalData, collection);
    //       response.send("Success of cron_firestore_to_spreadsheet: " + collection);
    //     } catch (error) {
    //       // functions.logger.error(error)
    //       console.error(error);
    //       response.status(500).send(error);
    //     }
  });



// Function to get tribe-wise data for users
// async function getUsersByTribe(): Promise<Record<string, UsersTribeData>> {
//   const startTime = DateTimeUtils.addSubtractTime(
//     firestore.Timestamp.now(),
//     -1,
//     0,
//     0
//   ); // Until now
//   const endTime = DateTimeUtils.addSubtractTime(
//     firestore.Timestamp.now(),
//     0,
//     0,
//     0
//   ); // From  65 minutes ago

//   const tribeData: Record<string, UsersTribeData> = {};

//   const newUsers = await db
//     .collection("users")
//     .where("createdAt", ">=", startTime)
//     .where("createdAt", "<=", endTime)
//     .get();

//   const newUGUsers = await db
//     .collection("users")
//     .where("undergroundPayment.dateStart", ">=", startTime)
//     .where("undergroundPayment.dateStart", "<=", endTime)
//     .get();

//   const expiringUGUsers = await db
//     .collection("users")
//     .where("undergroundPayment.dateExpiry", ">=", startTime)
//     .where("undergroundPayment.dateExpiry", "<=", endTime)
//     .get();

//   newUsers.forEach(function (userDoc) {
//     const user = userDoc.data();
//     const tribe = user.tribe || "goa"; // Default tribe is "goa"

//     if (!tribeData[tribe]) {
//       tribeData[tribe] = {
//         newUsers: 0,
//         newUGUsers: 0,
//         expiringUGUsers: 0,
//       };
//     }

//     tribeData[tribe].newUsers += 1;
//   });

//   newUGUsers.forEach(function (userDoc) {
//     const user = userDoc.data();
//     const tribe = user.tribe || "goa"; // Default tribe is "goa"

//     if (!tribeData[tribe]) {
//       tribeData[tribe] = {
//         newUsers: 0,
//         newUGUsers: 0,
//         expiringUGUsers: 0,
//       };
//     }

//     tribeData[tribe].newUGUsers += 1;
//   });

//   expiringUGUsers.forEach(function (userDoc) {
//     const user = userDoc.data();
//     const tribe = user.tribe || "goa"; // Default tribe is "goa"

//     if (!tribeData[tribe]) {
//       tribeData[tribe] = {
//         newUsers: 0,
//         newUGUsers: 0,
//         expiringUGUsers: 0,
//       };
//     }

//     tribeData[tribe].expiringUGUsers += 1;
//   });

//   return tribeData;
// }