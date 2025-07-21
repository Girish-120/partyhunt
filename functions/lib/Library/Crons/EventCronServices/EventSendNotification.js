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
exports.send_notification_event_owner_boosted_events = exports.send_notification_under_review_events_counts = exports.send_notification_under_review_events = exports.cron_daily_events_count_notification = void 0;
const Constants = __importStar(require("../../Helpers/Constants"));
const Helpers = __importStar(require("../../Helpers/Functions"));
const DateTimeUtils = __importStar(require("../../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const Notify = __importStar(require("../../Helpers/Notify"));
const functions = __importStar(require("firebase-functions"));
const __1 = require("../../..");
const BatchUpdates_1 = __importDefault(require("../../Services/FirebaseDB/Transaction/BatchUpdates"));
const SecretVariables_1 = __importDefault(require("../../Helpers/SecretVariables"));
const BrevoMail_1 = __importDefault(require("../../Services/BrevoMail"));
moment_timezone_1.default.tz.setDefault(Constants.timezone);
//Cron job every day at 16:20 PM. Remind all users if party count is more than 50.
exports.cron_daily_events_count_notification = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("20 16 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, -12, 0); //From 4:20AM on Same Day
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 12, 0); //To 4:20AM on Next Day
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            .where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 1)
            .get();
        console.log("find tribes from remote constants");
        const tribes = yield Constants.fcm_topics.tribes();
        const remoteConstant = yield Constants.Constants();
        const tribeLight = remoteConstant === null || remoteConstant === void 0 ? void 0 : remoteConstant.listTribes.map((m) => {
            return {
                UGlockPct: m.UGlockPct,
                listUG: [],
                tribe: m.name
            };
        });
        // create map of tribe and lock pct
        const tribeAutoLockPctDict = tribeLight.reduce((obj, item) => {
            const tribe = item.tribe;
            obj[tribe] = item;
            return obj;
        }, {});
        const tribeMapKey = {};
        // storing the tribe event count in map
        // calculating total event for respective tribe
        console.log("calculating total event for respective tribe");
        //let underGroundList: { docId: any; isUnderground: boolean;likesCount:number;tribe:string }[] =[]
        const payloaUnderGroundList = [];
        try {
            for (var _d = true, _e = __asyncValues(allEvents.docs), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const el = _c;
                const data = el.data();
                // let editedByuserIdisAdmin = false
                // if(data.editedBy!==undefined){
                //   const editedByUserDocRef = await data.editedBy.get()
                //   if(remoteConstant?.adminEmailIds.length>0){
                //     console.log(`edited by email : ${editedByUserDocRef.data().email}`)
                //     editedByuserIdisAdmin = remoteConstant?.adminEmailIds.includes(editedByUserDocRef.data().email)
                //   }
                // }
                // console.log(`editorby by admin ${editedByuserIdisAdmin}`)
                //Checking fo event to be not boosted and uploaded by admin team
                console.log(`event :${data.eventName} id : ${data.docId}`);
                console.log(`promotion package : ${data.promotionPackage}`);
                // Add precent logic and removing editedByadmin logic
                // if((data.promotionPackage===undefined || data.promotionPackage===0)&& editedByuserIdisAdmin)
                if (data.promotionPackage === undefined ||
                    data.promotionPackage === 0) {
                    let countLikes = 0;
                    let tribe = "";
                    if (data.listFollowers !== undefined) {
                        countLikes = data.listFollowers.length;
                    }
                    if (data.tribe !== undefined) {
                        tribe = data.tribe;
                    }
                    console.log(`auto ug with like : ${countLikes}  , promotion package : ${data.promotionPackage}`);
                    if (tribeAutoLockPctDict[tribe] !== undefined) {
                        tribeAutoLockPctDict[tribe].listUG.push({
                            docId: data.docId,
                            isUnderground: data.isUnderground,
                            likesCount: countLikes,
                            tribe: tribe
                        });
                    }
                }
                for (const tribe of tribes) {
                    const tribeCount = tribeMapKey[tribe];
                    if (tribeCount === undefined) {
                        tribeMapKey[tribe] = 0;
                    }
                    if (data.tribe === tribe) {
                        // event tribe matches incrementing to 1
                        tribeMapKey[tribe] = tribeMapKey[tribe] + 1;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        for (const key in tribeAutoLockPctDict) {
            const tribe = key.toString();
            const UGList = tribeAutoLockPctDict[tribe].listUG;
            if (UGList.length > 0) {
                UGList.sort((firstItem, secondItem) => secondItem.likesCount - firstItem.likesCount);
                const autoLockPct = tribeAutoLockPctDict[tribe].UGlockPct;
                //const autoLockPct = 25 // later to be replaced with remote constant
                const totalUGList = UGList.length;
                const takeElements = autoLockPct * 0.01 * totalUGList;
                const UGTrueList = UGList.slice(0, Math.ceil(takeElements));
                const UGFalseList = UGList.slice(Math.ceil(takeElements), UGList.length);
                const tUGList = UGTrueList.map((m) => {
                    return {
                        docId: m.docId,
                        isUnderground: true
                    };
                });
                const fUGList = UGFalseList.map((m) => {
                    return {
                        docId: m.docId,
                        isUnderground: false
                    };
                });
                payloaUnderGroundList.push(...tUGList);
                payloaUnderGroundList.push(...fUGList);
                console.log(`pct taken : totalUGList : ${totalUGList} , takeElements : ${Math.ceil(takeElements)} ,false  payloaUnderGroundList :${fUGList.length}, payloaUnderGroundList :${tUGList.length} , tribe :${tribe}`);
            }
        }
        if (payloaUnderGroundList.length > 0) {
            // Updating UG List
            // Updating Via transaction
            const iTransaction = new BatchUpdates_1.default(__1.db);
            console.log(`starting the transaction ... `);
            iTransaction
                .BatchUpdate({
                payload: payloaUnderGroundList,
                chunk: 200,
                collectionName: Constants.Collections[Constants.Collections.events],
                objectId: "docId"
            })
                .then(() => {
                console.log("transaction complete");
            })
                .catch((err) => {
                console.log(`error in transaction : ${err}`);
            });
        }
        const eventsCount = allEvents.docs.length;
        console.log("Total Daily Events from " + endTime + " Count - " + eventsCount);
        // find tribes from remote constants
        // const eventsCount = allEvents.docs.length;
        console.log(`tribe map key ${JSON.stringify(tribeMapKey)}`);
        for (const tribe of tribes) {
            console.log("Total Daily Events for tribe " +
                Helpers.toTileCase(tribe) +
                " from " +
                endTime +
                " Count - " +
                tribeMapKey[tribe]);
            const payload = {
                notification: {
                    title: "Where's the party tonight?",
                    body: "More than " +
                        tribeMapKey[tribe] +
                        " parties tonight in " +
                        Helpers.toTileCase(tribe)
                }
            };
            // Copying the already present criteria
            if (tribeMapKey[tribe] > 50) {
                // notifying to particular tribe
                yield Notify.notify_topic(payload, tribe);
            }
            else {
                yield Notify.notify_admin(payload);
            }
        }
        // const payload = {
        //   notification: {
        //     title: "Where's the party tonight?",
        //     body: "More than " + eventsCount + " parties tonight",
        //   },
        // };
        //Keep changing (30 Off Season to 80 Peak Season)
        // eventsCount > 60 ?
        //   // sending to respective tribe
        //   await Notify.notify_topic(payload, Constants.fcm_topics.all_users) :
        //   await Notify.notify_admin(payload)
        // const payload = {
        //   notification: {
        //     title: "Where's the party tonight?",
        //     body: "More than " + eventsCount + " parties tonight",
        //   },
        // };
        // //Keep changing (30 Off Season to 80 Peak Season)
        // eventsCount > 60 ?
        //   await Notify.notify_topic(payload, Constants.fcm_topics.all_users) :
        //   await Notify.notify_admin(payload)
        return "Success of Daily Events Reminder Notification";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
exports.send_notification_under_review_events = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("30 10 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 24, 0); //moment(now).subtract(25, "hours").toDate()
        //const endTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, 48, 0) //moment(firestore.Timestamp.now()).toDate()
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            //.where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 0)
            .get();
        console.log(`starttime : ${startTime.toDate()}`);
        console.log(`total event : ${allEvents.docs.length} `);
        const listEventUnderReview = [];
        //const datarwt: any[] = [];
        const remoteConstant = yield Constants.Constants();
        const remoteBoostPlans = remoteConstant === null || remoteConstant === void 0 ? void 0 : remoteConstant.boostPlans;
        allEvents.forEach(function (eventDoc) {
            return __awaiter(this, void 0, void 0, function* () {
                const event = eventDoc.data();
                // saving flyrs to the list
                if (remoteBoostPlans !== undefined && event.promotionPackage > 0) {
                    let filePrefix = "";
                    for (const b of remoteBoostPlans) {
                        if (event.promotionPackage === b.code) {
                            console.log(`boost type : ${event.promotionPackage}`);
                            filePrefix = b.boostType;
                        }
                    }
                    listEventUnderReview.push({
                        filename: filePrefix + "_" + event.eventName + ".jpg",
                        path: event.picture
                    });
                }
            });
        });
        if (listEventUnderReview.length > 0) {
            // initializing email sender
            const IEmailer = new BrevoMail_1.default(SecretVariables_1.default.brevoMailApiKey);
            // Send Email to Social Media Manager with image attachement
            console.log(`env vars : from ${process.env.EMAIL_FROM} , to ${process.env.SOCIAL_MEDIA_MANAGER_EMAIL}`);
            IEmailer.SendEmail({
                attachments: listEventUnderReview,
                from: process.env.EMAIL_FROM,
                to: process.env.SOCIAL_MEDIA_MANAGER_EMAIL,
                text: `Hi ${process.env.SOCIAL_MEDIA_MANAGER_NAME}<br>
        <br>Please review the following under review events <br>
        from : ${startTime
                    .toDate()
                    .toLocaleDateString("en-GB", { timeZone: "UTC" })} <br>
        Thanks`,
                subject: `Review Events !!  for ${startTime
                    .toDate()
                    .toLocaleDateString("en-GB", { timeZone: "UTC" })}`
            })
                .then((msg) => {
                console.log("sender message" + msg);
            })
                .catch((err) => {
                console.log(`mail chimp error : ${err}`);
            });
            return "Service complete";
        }
        return "Service complete";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
exports.send_notification_under_review_events_counts = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 11 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 0, 0); //from 11 am on same day
        //const endTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, 48, 0) //moment(firestore.Timestamp.now()).toDate()
        const allEvents = yield __1.db
            .collection("events")
            .where("toDate", ">=", startTime)
            //.where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 0)
            .get();
        console.log(`starttime : ${startTime.toDate()}`);
        console.log(`total event : ${allEvents.docs.length} `);
        const totalEvents = allEvents.docs.length;
        // Send Notification
        const notificationPayload = Notify.getPayload("total events count in under review : " + totalEvents, " ", "", "notification count  under review events", "events", "");
        return Notify.notify_admin(notificationPayload);
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
exports.send_notification_event_owner_boosted_events = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 16 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 24, 0); //from 11 am on same day
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 48, 0); //moment(firestore.Timestamp.now()).toDate()
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            .where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 1)
            .where("promotionPackage", "==", 0)
            .get();
        console.log(`starttime : ${startTime.toDate()}`);
        console.log(`total event : ${allEvents.docs.length} `);
        // Send Notification
        allEvents.docs.forEach((el) => {
            const data = el.data();
            const ownerEmail = data.ownerEmail;
            const ownerId = data.ownerId;
            const notificationPayload = Notify.getPayload("Boost your event", "Would you like to boost your event to get more audience?", "", "Boost reminder", "events", el.id);
            Notify.notify_email_list(notificationPayload, [ownerEmail])
                .then(() => {
                console.log(`notification sent to event owners`);
            })
                .catch((err) => {
                console.log(`error in sending notification with ${err}`);
            });
        });
        return;
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
//# sourceMappingURL=EventSendNotification.js.map