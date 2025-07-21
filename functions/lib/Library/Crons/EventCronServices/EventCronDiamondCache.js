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
exports.cron_cache_diamond_events = void 0;
const Constants = __importStar(require("../../Helpers/Constants"));
const DateTimeUtils = __importStar(require("../../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const functions = __importStar(require("firebase-functions"));
const __1 = require("../../..");
moment_timezone_1.default.tz.setDefault(Constants.timezone);
exports.cron_cache_diamond_events = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 04 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    const futureDate = DateTimeUtils.addSubtractTime(firebase_admin_1.firestore.Timestamp.now(), 7, 18, 0);
    const allTodayEvents = yield __1.db
        .collection("events")
        .where("toDate", ">=", firebase_admin_1.firestore.Timestamp.now())
        .where("toDate", "<=", futureDate)
        .where("publishStatus", "==", 1)
        .where("promotionPackage", "==", 40)
        .orderBy("toDate")
        .get();
    console.log(`allTagsList :${allTodayEvents.docs.length}`);
    const eventList = [];
    allTodayEvents.docs.forEach((el) => {
        var _a, _b, _c, _d, _e;
        const eventData = el.data();
        const followers = [];
        // Parse list of followers into list of IDs
        if (eventData.listFollowers) {
            for (const followerRef of eventData.listFollowers) {
                if (followerRef !== undefined) {
                    const followerId = followerRef.id; // Assuming listFollowers is an array of DocumentReference
                    followers.push(followerId);
                }
            }
        }
        const eventUserBooking = {
            anbocasOrderId: eventData.eventUserBookings !== undefined
                ? eventData.eventUserBookings.anbocasOrderId
                : "",
            ticketsCount: eventData.eventUserBookings !== undefined
                ? eventData.eventUserBookings.ticketsCount
                : 0,
            userId: eventData.eventUserBookings !== undefined
                ? eventData.eventUserBookings.userId
                : ""
        };
        eventList.push({
            objectId: el.id,
            isUnderground: eventData.isUnderground,
            publishStatus: eventData.publishStatus !== undefined ? eventData.publishStatus : 0,
            pictureThumbnail: eventData["picture_thumbnail"] !== undefined
                ? eventData["picture_thumbnail"]
                : "",
            picture: eventData.picture,
            toDate: eventData.toDate,
            reward: eventData.reward,
            name: eventData.eventName,
            locality: eventData.placeData !== undefined && eventData.placeData !== null
                ? eventData.placeData.locality
                : "",
            promotionPackage: eventData.promotionPackage,
            idPlace: eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
            venueName: eventData.placeData !== undefined ? eventData.placeData.name : "",
            latLng: eventData.placeData.latLng !== undefined
                ? eventData.placeData.latLng
                : "",
            fromDate: eventData.fromDate,
            entryFee: eventData.entryFee,
            ownerId: eventData.ownerId,
            urlTicket: eventData.urlTicket,
            listTags: eventData.listTags,
            userCheckinList: eventData.userCheckinList,
            listFollowers: followers,
            listBlocked: eventData.listBlocked,
            tribe: eventData.tribe,
            isFeatured: (_a = eventData.isFeatured) !== null && _a !== void 0 ? _a : false,
            specialOffer: (_b = eventData.specialOffer) !== null && _b !== void 0 ? _b : "",
            sellTickets: (_c = eventData.sellTickets) !== null && _c !== void 0 ? _c : false,
            hasTicket: (_d = eventData.hasTicket) !== null && _d !== void 0 ? _d : true,
            anbocasEventId: (_e = eventData.anbocasEventId) !== null && _e !== void 0 ? _e : "",
            eventUserBookings: eventUserBooking
        });
    });
    // const redisClient = connectRedis();
    // for(let key in eventDict){
    //   if (eventDict.hasOwnProperty(key)) {
    //     const value = eventDict[key];
    //     (await redisClient).set(key,JSON.stringify(value)).catch((e)=>{
    //       console.log(`error is logged for redis ${e.toString()}`)
    //     });
    //     console.log(`diamond events written to ${key}`);
    //  }
    // }
}));
//# sourceMappingURL=EventCronDiamondCache.js.map