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
exports.cron_send_event_flyer = void 0;
const Constants = __importStar(require("../../Helpers/Constants"));
const DateTimeUtils = __importStar(require("../../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const functions = __importStar(require("firebase-functions"));
const __1 = require("../../..");
const SecretVariables_1 = __importDefault(require("../../Helpers/SecretVariables"));
const BrevoMail_1 = __importDefault(require("../../Services/BrevoMail"));
moment_timezone_1.default.tz.setDefault(Constants.timezone);
exports.cron_send_event_flyer = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("30 10 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 24, 0); //moment(now).subtract(25, "hours").toDate()
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 48, 0); //moment(firestore.Timestamp.now()).toDate()
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            .where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 1)
            .get();
        console.log(`starttime : ${startTime.toDate()} : endtime : ${endTime.toDate()}`);
        console.log(`total event : ${allEvents.docs.length} `);
        const listEventFlyrsAttachements = [];
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
                    listEventFlyrsAttachements.push({
                        filename: filePrefix + "_" + event.eventName + ".jpg",
                        path: event.picture
                    });
                }
            });
        });
        console.log(`attachments length ${listEventFlyrsAttachements.length}`);
        console.log(`brevo api key ${SecretVariables_1.default.brevoMailApiKey}`);
        if (listEventFlyrsAttachements.length > 0) {
            // initializing email sender
            const IEmailer = new BrevoMail_1.default(SecretVariables_1.default.brevoMailApiKey);
            // Send Email to Social Media Manager with image attachement
            console.log(`env vars : from ${process.env.EMAIL_FROM} , to ${process.env.SOCIAL_MEDIA_MANAGER_EMAIL}`);
            IEmailer.SendEmail({
                attachments: listEventFlyrsAttachements,
                from: process.env.EMAIL_FROM,
                to: process.env.SOCIAL_MEDIA_MANAGER_EMAIL,
                text: `Hi ${process.env.SOCIAL_MEDIA_MANAGER_NAME}<br>
          <br>Please post story for instagram from the attached boosted events <br>
          from : ${startTime
                    .toDate()
                    .toLocaleDateString("en-GB", { timeZone: "UTC" })} <br>
          to : ${endTime
                    .toDate()
                    .toLocaleDateString("en-GB", { timeZone: "UTC" })}<br><br>
          Thanks`,
                subject: `Daily Reminder !! Boost Events Insta Story for ${startTime
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
//# sourceMappingURL=EventSendFlyer.js.map