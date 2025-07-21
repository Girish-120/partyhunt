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
exports.checkinsUpdateTrigger = exports.checkinsCreationTrigger = void 0;
const Checkins_1 = __importDefault(require("../Services/FirebaseDB/Checkins"));
const Constants = __importStar(require("../Helpers/Constants"));
const __1 = require("../..");
const Notify_1 = require("../Helpers/Notify");
//Trigger when checkin is created
exports.checkinsCreationTrigger = Constants.runTimeoutShort.firestore
    .document("checkins/{docId}")
    .onCreate(function (snap, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const objectId = snap.id;
        const userId = snap.data().userId;
        const username = snap.data().userData.name;
        const eventId = snap.data().eventId;
        const eventName = snap.data().eventData.eventName;
        const placeId = snap.data().placeId;
        const checkInStatus = snap.data().status;
        let ownerEmails = [];
        const eventDoc = yield __1.db.collection("events").doc(eventId).get();
        if (eventDoc.exists) {
            const eventData = eventDoc.data();
            ownerEmails.push(eventData === null || eventData === void 0 ? void 0 : eventData.ownerEmail);
            // send notification to event eventOwner
        }
        const placeDoc = yield __1.db.collection("places").doc(placeId).get();
        if (placeDoc.exists) {
            const placeData = placeDoc.data();
            const placeOwnerEmails = placeData === null || placeData === void 0 ? void 0 : placeData.listOwners;
            if (placeOwnerEmails !== undefined) {
                ownerEmails = [...ownerEmails, ...placeOwnerEmails];
            }
        }
        // Send notification to event owner and place owner
        const notificationPayload = (0, Notify_1.getPayload)(`New check-in`, `${username} just checked-in at ${eventName}`, "", "notification user check-in", "users", userId);
        (0, Notify_1.notify_email_list)(notificationPayload, ownerEmails)
            .then(() => {
            console.log(`notification sent to event owners`);
        })
            .catch((err) => {
            console.log(`error in sending notification with ${err}`);
        });
    });
});
//Trigger when checkin is updated
exports.checkinsUpdateTrigger = Constants.runTimeoutLong.firestore
    .document("checkins/{docId}")
    .onUpdate((snap, context) => __awaiter(void 0, void 0, void 0, function* () {
    const objectId = snap.after.id;
    const userId = snap.after.data().userId;
    const eventId = snap.after.data().eventId;
    const placeId = snap.after.data().placeId;
    const checkInStatusBefore = snap.before.data().status;
    const checkInStatusAfter = snap.after.data().status;
    console.log(`before status : ${checkInStatusBefore}`);
    console.log(`after status : ${checkInStatusAfter}`);
    if ((checkInStatusBefore < 0 || checkInStatusBefore === undefined) &&
        checkInStatusAfter >= 0) {
        const iCheckins = new Checkins_1.default(__1.db, snap.after);
        iCheckins
            .UpdateCheckins({
            objectId,
            userId,
            eventId,
            placeId
        })
            .then(() => {
            console.log("checking data updated successfully");
        })
            .catch((err) => {
            console.log(`error while updating checkin data : ${err}`);
        });
    }
    return null;
}));
//# sourceMappingURL=CheckinTriggers.js.map