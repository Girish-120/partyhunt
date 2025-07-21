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
exports.cron_event_reminder_notification = void 0;
const Constants = __importStar(require("../../Helpers/Constants"));
const DateTimeUtils = __importStar(require("../../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const Notify = __importStar(require("../../Helpers/Notify"));
const functions = __importStar(require("firebase-functions"));
const __1 = require("../../..");
moment_timezone_1.default.tz.setDefault(Constants.timezone);
//Cron job every hour. If diamond boost, notify all users otherwise just notify followers.
exports.cron_event_reminder_notification = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("every 90 mins")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 0, 0); //Until now
        const endTime = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 0, 0, 95); //From  65 minutes ago
        const allEvents = yield __1.db
            .collection("events")
            .where("fromDate", ">=", startTime)
            .where("fromDate", "<=", endTime)
            .where("publishStatus", "==", 1)
            .get();
        console.log("In next 60 minutes Events Reminder Notification: " + allEvents.size);
        allEvents.forEach(function (eventDoc) {
            const event = eventDoc.data();
            return Notify.notifyDefault(eventDoc, 
            //Diamond Boost - For Festivals
            //ToDo: Send notification to 1000 recent people or people who checked that week (subscribe), and not to all
            event.promotionPackage >= 40
                ? Constants.UserRoles.all
                : Constants.UserRoles.followers, Constants.Collections[Constants.Collections.events], Constants.eventBrand_edit_actions.event_reminder);
        });
        return "Success of All Event Reminder Notification";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
//# sourceMappingURL=EventReminder.js.map