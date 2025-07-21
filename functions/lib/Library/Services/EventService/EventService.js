"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("firebase-admin");
const DateTimeUtils_1 = require("../../Helpers/DateTimeUtils");
// import moment from "moment-timezone";
class EventService {
    constructor(db) {
        this.GetDiamondEvents = (tribe) => __awaiter(this, void 0, void 0, function* () {
            const futureDate = (0, DateTimeUtils_1.addSubtractTime)(firebase_admin_1.firestore.Timestamp.now(), 7, 18, 0);
            const allTodayEvents = yield this.db
                .collection("events")
                .where("toDate", ">=", firebase_admin_1.firestore.Timestamp.now())
                .where("toDate", "<=", futureDate)
                .where("publishStatus", "==", 1)
                .where("promotionPackage", "==", 40)
                .where("tribe", "==", tribe)
                .orderBy("toDate")
                .get();
            console.log(`allTagsList :${allTodayEvents.docs.length}`);
            const eventList = [];
            allTodayEvents.docs.forEach((el) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                const eventData = el.data();
                const followers = [];
                // Parse list of followers into list of IDs
                if (eventData.listFollowers) {
                    for (const followerRef of eventData.listFollowers) {
                        if (followerRef !== undefined && followerRef !== null) {
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
                    publishStatus: (_a = eventData.publishStatus) !== null && _a !== void 0 ? _a : 0,
                    pictureThumbnail: (_b = eventData["picture_thumbnail"]) !== null && _b !== void 0 ? _b : "",
                    picture: eventData.picture,
                    toDate: eventData.toDate,
                    reward: eventData.reward,
                    name: eventData.eventName,
                    promotionPackage: eventData.promotionPackage,
                    idPlace: eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
                    venueName: eventData.placeData !== undefined ? eventData.placeData.name : "",
                    latLng: (_c = eventData.placeData.latLng) !== null && _c !== void 0 ? _c : "",
                    locality: eventData.placeData !== undefined && eventData.placeData !== null
                        ? eventData.placeData.locality
                        : "",
                    fromDate: eventData.fromDate,
                    entryFee: (_d = eventData.entryFee) !== null && _d !== void 0 ? _d : -1,
                    ownerId: eventData.ownerId,
                    urlTicket: (_e = eventData.urlTicket) !== null && _e !== void 0 ? _e : "",
                    listTags: (_f = eventData.listTags) !== null && _f !== void 0 ? _f : [],
                    userCheckinList: (_g = eventData.userCheckinList) !== null && _g !== void 0 ? _g : [],
                    listFollowers: followers !== null && followers !== void 0 ? followers : [],
                    listBlocked: (_h = eventData.listBlocked) !== null && _h !== void 0 ? _h : [],
                    tribe: (_j = eventData.tribe) !== null && _j !== void 0 ? _j : "goa",
                    isFeatured: (_k = eventData.isFeatured) !== null && _k !== void 0 ? _k : false,
                    specialOffer: (_l = eventData.specialOffer) !== null && _l !== void 0 ? _l : "",
                    hasTicket: (_m = eventData.hasTicket) !== null && _m !== void 0 ? _m : true,
                    sellTickets: (_o = eventData.sellTickets) !== null && _o !== void 0 ? _o : false,
                    anbocasEventId: (_p = eventData.anbocasEventId) !== null && _p !== void 0 ? _p : "",
                    eventUserBookings: eventUserBooking
                });
            });
            return eventList;
        });
        this.GetHomeEvents = (tribe, selectedDate, isAdmin) => __awaiter(this, void 0, void 0, function* () {
            //selectedDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);
            const midnightTimestamp = firebase_admin_1.firestore.Timestamp.fromDate(selectedDate);
            const midnightDate = midnightTimestamp.toDate();
            //let selectedDateIST = moment(selectedDate).startOf('day');
            midnightDate.setDate(midnightDate.getDate() + 1);
            midnightDate.setHours(midnightDate.getHours() + 4);
            //const midnightTimestamp = firestore.Timestamp.fromDate(selectedDateIST.toDate());
            //const midnightDate = midnightTimestamp.toDate();
            // Add one day (24 hours)
            //selectedDateIST.add(1, 'day');
            // Add 4 hours in IST timezone
            //selectedDateIST.add(4, 'hours');
            // Convert the updated date back to a Firestore Timestamp
            const updatedTimestamp = firebase_admin_1.firestore.Timestamp.fromDate(midnightDate);
            console.log(midnightTimestamp.toDate().toLocaleDateString());
            console.log(midnightTimestamp.toDate().toLocaleTimeString());
            console.log(updatedTimestamp.toDate().toLocaleDateString());
            console.log(updatedTimestamp.toDate().toLocaleTimeString());
            let baseQuery = this.db
                .collection("events")
                .where("fromDate", ">=", midnightTimestamp)
                .where("fromDate", "<", updatedTimestamp)
                .where("tribe", "==", tribe);
            if (!isAdmin) {
                baseQuery = baseQuery.where("publishStatus", "==", 1);
            }
            const allTodayEvents = yield baseQuery.get();
            console.log(`allTagsList :${allTodayEvents.docs.length}`);
            const eventList = [];
            allTodayEvents.docs.forEach((el) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                const eventData = el.data();
                const followers = [];
                // Parse list of followers into list of IDs
                if (eventData.listFollowers) {
                    for (const followerRef of eventData.listFollowers) {
                        if (followerRef !== undefined && followerRef !== null) {
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
                //eventList.push()
                eventList.push({
                    objectId: el.id,
                    isUnderground: eventData.isUnderground,
                    publishStatus: (_a = eventData.publishStatus) !== null && _a !== void 0 ? _a : 0,
                    pictureThumbnail: (_b = eventData["picture_thumbnail"]) !== null && _b !== void 0 ? _b : "",
                    picture: eventData.picture,
                    toDate: eventData.toDate,
                    reward: eventData.reward,
                    name: eventData.eventName,
                    promotionPackage: eventData.promotionPackage,
                    idPlace: eventData.placeData !== undefined ? eventData.placeData.idPlace : '',
                    venueName: eventData.placeData !== undefined ? eventData.placeData.name : "",
                    latLng: (_c = eventData.placeData.latLng) !== null && _c !== void 0 ? _c : "",
                    locality: eventData.placeData !== undefined && eventData.placeData !== null
                        ? eventData.placeData.locality
                        : "",
                    fromDate: eventData.fromDate,
                    entryFee: (_d = eventData.entryFee) !== null && _d !== void 0 ? _d : -1,
                    ownerId: eventData.ownerId,
                    urlTicket: (_e = eventData.urlTicket) !== null && _e !== void 0 ? _e : "",
                    listTags: (_f = eventData.listTags) !== null && _f !== void 0 ? _f : [],
                    userCheckinList: (_g = eventData.userCheckinList) !== null && _g !== void 0 ? _g : [],
                    listFollowers: followers !== null && followers !== void 0 ? followers : [],
                    listBlocked: (_h = eventData.listBlocked) !== null && _h !== void 0 ? _h : [],
                    tribe: (_j = eventData.tribe) !== null && _j !== void 0 ? _j : "goa",
                    isFeatured: (_k = eventData.isFeatured) !== null && _k !== void 0 ? _k : false,
                    specialOffer: (_l = eventData.specialOffer) !== null && _l !== void 0 ? _l : "",
                    sellTickets: (_m = eventData.sellTickets) !== null && _m !== void 0 ? _m : false,
                    hasTicket: (_o = eventData.hasTicket) !== null && _o !== void 0 ? _o : true,
                    anbocasEventId: (_p = eventData.anbocasEventId) !== null && _p !== void 0 ? _p : "",
                    eventUserBookings: eventUserBooking
                });
            });
            return eventList;
        });
        this.db = db;
    }
}
exports.default = EventService;
//# sourceMappingURL=EventService.js.map