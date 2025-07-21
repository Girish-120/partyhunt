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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cron_weekly_event_duplication = void 0;
const Constants = __importStar(require("../../Helpers/Constants"));
const Helpers = __importStar(require("../../Helpers/Functions"));
const DateTimeUtils = __importStar(require("../../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const __1 = require("../../..");
const functions = __importStar(require("firebase-functions"));
moment_timezone_1.default.tz.setDefault(Constants.timezone);
exports.cron_weekly_event_duplication = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 11 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        const firestoreTimestampNow = firebase_admin_1.firestore.Timestamp.now(); //.toDate();
        // const istDate = moment(date).tz(Constants.timezone).toDate();
        // const firestoreTimestampNow = firestore.Timestamp.fromDate(istDate);
        const startTime = DateTimeUtils.addSubtractTime(firestoreTimestampNow, 0, -23, -59); //moment(now).subtract(25, "hours").toDate()
        const endTime = DateTimeUtils.addSubtractTime(firestoreTimestampNow, 0, 0, 0); //moment(firestore.Timestamp.now()).toDate()
        // const startTimeD = new Date('July 03, 2024 11:00:00'); //moment(now).subtract(25, "hours").toDate()
        // const endTimeD =  new Date('July 04, 2024 11:00:00');//moment(firestore.Timestamp.now()).toDate()
        // const startTime =  firestore.Timestamp.fromDate(startTimeD) //moment(now).subtract(25, "hours").toDate()
        // const endTime = firestore.Timestamp.fromDate(endTimeD) //moment(firestore.Timestamp.now()).toDate()
        // const startTime = new Date('May 17, 2024 11:00:00'); //moment(now).subtract(25, "hours").toDate()
        // const endTime =  new Date('May 18, 2024 11:00:00');//mo
        // console.log(`startime : ${startTimeD.toLocaleDateString()} : ${startTimeD.toLocaleTimeString()}`)
        // console.log(`endtime : ${endTimeD.toLocaleDateString()} : ${endTimeD.toLocaleTimeString()}`)
        // const defualtCap = 30
        // const UGCap = 30
        // const promotionSubscriptionFactor = 2
        console.log(`startime : ${startTime.toDate()}`);
        console.log(`endtime : ${endTime.toDate()}`);
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            .where("fromDate", "<=", endTime)
            .where("isWeekly", "==", true)
            // .orderBy("fromDate") // Dev Mode
            // .limit(1) // Dev Mode
            .get();
        const listEventIds = [];
        const listUpdatedEventIds = [];
        const allEventIds = [];
        const datarwt = [];
        // collect event place id
        console.log(`total events ${allEvents.docs.length}`);
        console.log("calculating place dictionary");
        const eventsPlaceids = allEvents.docs
            .filter((f) => {
            return f.data().placeData !== undefined;
        })
            .map((m) => {
            const event = m.data();
            return event.placeData.idPlace;
        });
        console.log(`events place id : ${eventsPlaceids.length}`);
        // Query all place data with given place ids from events
        let placeDataContext;
        let placeDataDict;
        if (eventsPlaceids.length > 0) {
            // break placeids upto upto 30 object
            const placeDataList = [];
            const eventPLaceIdsBatches = Helpers.splitIntoChunk(eventsPlaceids, 30);
            try {
                for (var _d = true, eventPLaceIdsBatches_1 = __asyncValues(eventPLaceIdsBatches), eventPLaceIdsBatches_1_1; eventPLaceIdsBatches_1_1 = yield eventPLaceIdsBatches_1.next(), _a = eventPLaceIdsBatches_1_1.done, !_a; _d = true) {
                    _c = eventPLaceIdsBatches_1_1.value;
                    _d = false;
                    let batch = _c;
                    //console.log(`batch size length : ${batch.length}`)
                    batch = batch.filter((f) => {
                        return f !== undefined;
                    });
                    placeDataContext = yield __1.db
                        .collection(Constants.Collections[Constants.Collections.places])
                        .where("idPlace", "in", batch)
                        .get();
                    //console.log(`db objects length: ${placeDataContext.docs.length}`)
                    placeDataList.push(...placeDataContext.docs.map((m) => {
                        return m.data();
                    }));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = eventPLaceIdsBatches_1.return)) yield _b.call(eventPLaceIdsBatches_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            //Make dictionary of the list
            placeDataDict = placeDataList.reduce((obj, item) => {
                obj[item.idPlace] = item;
                return obj;
            }, {});
        }
        // fetch all tags with publish status as 1
        const allTags = yield __1.db
            .collection("tags")
            .where("publishStatus", "==", 1)
            .get();
        const dataTagsList = allTags.docs.map((el) => {
            return el.data();
        });
        const listTagDict = dataTagsList.reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {});
        //console.log(`tags dictionary : ${JSON.stringify(listTagDict)}`)
        console.log("place dictionary prepared");
        allEvents.forEach(function (eventDoc) {
            return __awaiter(this, void 0, void 0, function* () {
                const event = eventDoc.data();
                const eventId = eventDoc.id;
                allEventIds.push(eventId);
                //const eventObjectId =
                if (listEventIds.includes(eventId))
                    datarwt.push(eventDoc.ref.delete()); //.then().catch() await
                else if (event.publishStatus !== -2) {
                    // Check logic to copy
                    // const editedAt = event.editedAt;
                    // //const daysToLastUpdate = DateTimeUtils.getDaysFromToday(editedAt);
                    // const countFollowers = event.countFollowers;
                    // last update less than 60 days and likes more than 10
                    //console.log(`days to Last update ${daysToLastUpdate}`)
                    //console.log(`count followers ${countFollowers}`)
                    //console.log(`logging event id MqH6HYpM5FCzBq7qLIbF`)
                    // if (daysToLastUpdate < 90) {
                    listEventIds.push(eventId);
                    event.fromDate = (0, moment_timezone_1.default)(event.fromDate.toDate())
                        .add(7, "days")
                        .toDate();
                    event.toDate = (0, moment_timezone_1.default)(event.toDate.toDate()).add(7, "days").toDate();
                    event.eventDates = DateTimeUtils.getEventDates(event.fromDate, event.toDate);
                    // ToDo: Reset Promotion Package (Boost ID) only for single boost and not for seasonal package
                    //  is the
                    event.promotionPackage = 0;
                    // Disable the duplicate isunderground to false
                    // event.isUnderground=false
                    // Reseting checkin list
                    event.totalCheckin = 0;
                    event.userCheckinList = [];
                    event.anbocasEventId = "";
                    event.sellTickets = false;
                    event.hasTicket = false;
                    event.listFollowers = [];
                    event.countFollowers = 0;
                    // reseting owner id
                    // event.ownerId=""
                    // event.ownerId = null
                    // Update Promotion package with venue .
                    // Check place data
                    if (event.placeData !== undefined) {
                        const eventPlaceId = event.placeData.idPlace;
                        // ToDo : Fetch from cache layer and remove db call
                        // updating event promotion package with place data promotion package
                        // Avoided DB call every time in the loop
                        // Created a dictionary of place data to fetch the relevant promotion package
                        if (placeDataDict[eventPlaceId] !== undefined) {
                            const placeDataPromotionSubscription = placeDataDict[eventPlaceId].promotionsSubscription;
                            if (placeDataPromotionSubscription !== undefined) {
                                event.promotionPackage = placeDataPromotionSubscription;
                            }
                        }
                    }
                    // Reseting Likes of the event : -
                    // Formula : Cut off : defaultCap=30 + promotionSubscription*10 + undergroundCap=30
                    // const cutOff = defualtCap + event.promotionPackage * promotionSubscriptionFactor + UGCap
                    //const cutOff=1
                    // if (event.listFollowers !== undefined) {
                    //   const noOfLikes = event.listFollowers.length
                    //   //console.log(`no likes  , cutoff : ${noOfLikes} , ${cutOff}`)
                    //   if (noOfLikes > cutOff) {
                    //     // cutting off likes 
                    //     // console.log(`docId : ${event.docId}`)
                    //     const cutOffFollowers = event.listFollowers.slice(noOfLikes - cutOff, noOfLikes)
                    //     // console.log(JSON.stringify(cutOffFollowers),folliowers.length)
                    //     event.listFollowers = cutOffFollowers
                    //   }
                    //   event.countFollowers = event.listFollowers.length
                    // }
                    if (event.listTags !== undefined) {
                        const updatedListTags = [];
                        const eventTags = event.listTags;
                        if (Array.isArray(eventTags)) {
                            eventTags.forEach(el => {
                                if (listTagDict[el] !== undefined) {
                                    console.log(`tags updating for event :${eventId} : ${el}`);
                                    updatedListTags.push(el);
                                }
                            });
                        }
                        event.listTags = updatedListTags;
                    }
                    //if()code correc
                    if (event.publishStatus === -1) {
                        // Update Date for ToBeUpdated Events
                        listUpdatedEventIds.push(eventId);
                        datarwt.push(__1.db.collection("events").add(event));
                    }
                    else {
                        //Under review will stay under review for the next week & Published will become ToBeUpdated
                        event.publishStatus = event.publishStatus === 0 ? 0 : -1;
                        event.commentsCount = 0;
                        if (Constants.projectKey === "dev") {
                            event.publishStatus = 1;
                        }
                        event.isDiscount = false;
                        event.reward = "";
                        //Stay rejected for the next week
                        // event.publishStatus = event.publishStatus === -2 ? -2 : -1
                        //Create new doc for underReview & Published events
                        // emptying boostPayment object
                        event.boostPayment = {};
                        //event.createdAt = new Date() not to be reset
                        //console.log(`boost payment is empty ${event.boostPayment}`)
                        listUpdatedEventIds.push(eventId);
                        datarwt.push(__1.db.collection("events").add(event));
                    }
                }
                // event.countFollowers = 0
                // event.listFollowers = []
                // docId remains unchanged to identify parent (first) weekly event in the series
                // event.docId = null
                // Using the last event picture until changed again from
                // event.picture = null
                // event.picture_thumbnail = null
                // }
            });
        });
        console.log(`list events length ${listEventIds.length}`);
        console.log(`all events length ${allEvents.docs.length}`);
        console.log(`all datawrts length ${datarwt.length}`);
        console.log(`executing promise`);
        const listDifference = Helpers.Listdifference(allEventIds, listUpdatedEventIds);
        console.log(`ids not updated : ${listDifference}`);
        // const _dataloaded =
        yield Promise.all(datarwt);
        console.log("Total Events Duplicated event after (& until now) " +
            startTime.toDate().toUTCString() +
            " Count - " +
            listEventIds.length +
            " / " +
            allEvents.docs.length);
        return "Success of weeklyEventDuplication";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
//# sourceMappingURL=EventDuplicateCron.js.map