"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cron_firestore_to_spreadsheet = exports.cron_event_data_spreadsheet = void 0;
const Constants = __importStar(require("../Helpers/Constants"));
const DateTimeUtils = __importStar(require("../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const functions = __importStar(require("firebase-functions"));
const __1 = require("../..");
const SheetUtils = __importStar(require("../Helpers/SheetUtils"));
const MailUtils_1 = require("../Helpers/MailUtils");
// import MailChimpSender from "../Services/MailChimp";
const SecretVariables_1 = __importDefault(require("../Helpers/SecretVariables"));
const BrevoMail_1 = __importDefault(require("../Services/BrevoMail"));
// Function to get tribe-wise data for events
function getEventsByTribe() {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), -1, 0, 0); // Until now
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 0, 0); // From  65 minutes ago
        const tribeData = {};
        const allEvents = yield __1.db
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
                    if (event.promotionPackage === 10)
                        tribeData[tribe].silver_boost += 1;
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
    });
}
// Export events collection to Google Sheet
exports.cron_event_data_spreadsheet = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("0 0 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Starting: Event Data SpreadSheet. ");
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), -1, 0, 0); //Until now
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 0, 0); //From  65 minutes ago
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime) //toDate
            .where("fromDate", "<=", endTime) //toDate
            .get();
        const newUsers = yield __1.db
            .collection("users")
            .where("createdAt", ">=", startTime) //toDate
            .where("createdAt", "<=", endTime) //toDate
            .get();
        const newUGUsers = yield __1.db
            .collection("users")
            .where("undergroundPayment.dateStart", ">=", startTime) //toDate
            .where("undergroundPayment.dateStart", "<=", endTime) //toDate
            .get();
        const expiringUGUsers = yield __1.db
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
                if (event.promotionPackage !== undefined &&
                    event.promotionPackage > 0) {
                    boosted_events += 1;
                    if (event.promotionPackage === 10)
                        silver_boost += 1;
                    else if (event.promotionPackage === 20)
                        gold_boost += 1;
                    else if (event.promotionPackage === 40)
                        diamond_boost += 1;
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
        const remoteData = yield Constants.Constants();
        let adminEmails = "";
        if ((remoteData === null || remoteData === void 0 ? void 0 : remoteData.adminEmailIds) !== undefined) {
            adminEmails = remoteData === null || remoteData === void 0 ? void 0 : remoteData.adminEmailIds.toString();
        }
        console.log(`admin email ids : ${adminEmails}`);
        const htmlText = (0, MailUtils_1.createTableEmail)(dataForEmail);
        console.log(htmlText);
        const textData = `Hi Admin
      <br>Metrics for Events Users and Boost<br>
      for : ${startTime
            .toDate()
            .toLocaleDateString("en-GB", { timeZone: "UTC" })} <br>
      ${htmlText}`;
        const IEmailer = new BrevoMail_1.default(SecretVariables_1.default.brevoMailApiKey);
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
        yield SheetUtils.export_to_spreadsheet(finalData, "Daily");
        return "success";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
//Export any firestore collection to google sheet
exports.cron_firestore_to_spreadsheet = Constants.runTimeoutLong.https.onRequest((_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Keep it dynamic for each collection
        let collection = "brands";
        console.log("Starting: Exporting Collection To Spreadsheet - " + collection);
        const allDocs = yield __1.db
            .collection(collection)
            // .where("publishStatus", "==", 1) //toDate
            .limit(5)
            .get();
        console.info(`Docs Fetched`);
        const finalData = [];
        allDocs.forEach(function (doc) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21;
            const data = doc.data();
            let arrObj = [];
            switch (collection) {
                case "places":
                    arrObj = [
                        (_a = doc.id) !== null && _a !== void 0 ? _a : "",
                        (_b = data.name) !== null && _b !== void 0 ? _b : "",
                        (_c = data.publishStatus) !== null && _c !== void 0 ? _c : "",
                        (_d = data.promotionsSubscription) !== null && _d !== void 0 ? _d : "",
                        (_e = data.phone) !== null && _e !== void 0 ? _e : "",
                        (_f = data.rating) !== null && _f !== void 0 ? _f : "",
                        (_g = data.area) !== null && _g !== void 0 ? _g : "",
                        (_h = data.locality) !== null && _h !== void 0 ? _h : "",
                        (_j = data.fixedLocality) !== null && _j !== void 0 ? _j : "",
                        (_k = data.address) !== null && _k !== void 0 ? _k : "",
                        (_l = data.state) !== null && _l !== void 0 ? _l : "",
                        (_m = data.country) !== null && _m !== void 0 ? _m : "",
                        (_o = data.idPlace) !== null && _o !== void 0 ? _o : "",
                        (_p = data.icon) !== null && _p !== void 0 ? _p : ""
                        // data.listPhotos, - arr
                        // data.type, - arr
                    ];
                    break;
                case "tags":
                    arrObj = [
                        (_q = doc.id) !== null && _q !== void 0 ? _q : "",
                        (_r = data.name) !== null && _r !== void 0 ? _r : "",
                        (_s = data.createdAt) !== null && _s !== void 0 ? _s : "",
                        (_t = data.publishStatus) !== null && _t !== void 0 ? _t : "",
                        (_u = data.docId) !== null && _u !== void 0 ? _u : ""
                    ];
                    break;
                case "brands":
                    arrObj = [
                        (_v = data.name) !== null && _v !== void 0 ? _v : "",
                        (_w = data.category) !== null && _w !== void 0 ? _w : "",
                        (_x = data.country) !== null && _x !== void 0 ? _x : "",
                        (_y = data.createdAt) !== null && _y !== void 0 ? _y : "",
                        (_z = data.profileId) !== null && _z !== void 0 ? _z : "",
                        (_0 = data.shortBio) !== null && _0 !== void 0 ? _0 : "",
                        (_1 = data.description) !== null && _1 !== void 0 ? _1 : "",
                        (_2 = data.tribe) !== null && _2 !== void 0 ? _2 : "",
                        (_3 = data.promotionPackage) !== null && _3 !== void 0 ? _3 : "",
                        (_4 = data.publishStatus) !== null && _4 !== void 0 ? _4 : "",
                        (_5 = data.ownerEmail) !== null && _5 !== void 0 ? _5 : "",
                        (_6 = data.ownerId) !== null && _6 !== void 0 ? _6 : "",
                        (_7 = data.email) !== null && _7 !== void 0 ? _7 : "",
                        (_8 = data.isByEditor) !== null && _8 !== void 0 ? _8 : "",
                        (_9 = data.picture) !== null && _9 !== void 0 ? _9 : "",
                        (_10 = data.picture_thumbnail) !== null && _10 !== void 0 ? _10 : "",
                        (_11 = doc.id) !== null && _11 !== void 0 ? _11 : "",
                        (_12 = data.docId) !== null && _12 !== void 0 ? _12 : "",
                        (_13 = data.createdAt) !== null && _13 !== void 0 ? _13 : "",
                        (_14 = data.editedAt) !== null && _14 !== void 0 ? _14 : "",
                        (_15 = data.featuredAt) !== null && _15 !== void 0 ? _15 : "",
                        (_16 = data.mapSocialLinks.email) !== null && _16 !== void 0 ? _16 : "",
                        (_17 = data.mapSocialLinks.facebook) !== null && _17 !== void 0 ? _17 : "",
                        (_18 = data.mapSocialLinks.instagram) !== null && _18 !== void 0 ? _18 : "",
                        (_19 = data.mapSocialLinks.phone) !== null && _19 !== void 0 ? _19 : "",
                        (_20 = data.mapSocialLinks.website) !== null && _20 !== void 0 ? _20 : "",
                        (_21 = data.mapSocialLinks.youtube) !== null && _21 !== void 0 ? _21 : ""
                        // data.listTags ?? "",
                        // data.listTribes ?? "",
                    ];
                    break;
                default:
                    break;
            }
            finalData.push(arrObj);
        });
        yield SheetUtils.export_to_spreadsheet(finalData, collection);
        response.send("Success of cron_firestore_to_spreadsheet: " + collection);
    }
    catch (error) {
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
}));
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
//# sourceMappingURL=SheetCrons.js.map