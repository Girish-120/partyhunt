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
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("firebase-admin");
const Constants = __importStar(require("../../Helpers/Constants"));
class Checkins {
    constructor(db, snap) {
        this.UpdateCheckins = (data) => __awaiter(this, void 0, void 0, function* () {
            //const user= await this.db.collection("users").doc(userId).get()
            try {
                const userRef = yield this.db
                    .collection(Constants.Collections[Constants.Collections.users])
                    .doc(data.userId)
                    .get();
                const userData = userRef.data();
                const eventRef = yield this.db
                    .collection(Constants.Collections[Constants.Collections.events])
                    .doc(data.eventId)
                    .get();
                const eventData = eventRef.data();
                const placeRef = yield this.db
                    .collection(Constants.Collections[Constants.Collections.places])
                    .doc(data.placeId)
                    .get();
                const placeData = placeRef.data();
                let totalChekinUser = 0;
                let totalCheckinEvent = 0;
                let totalCheckinPlace = 0;
                if ((userData === null || userData === void 0 ? void 0 : userData.totalCheckin) === undefined) {
                    totalChekinUser = 1;
                }
                else {
                    totalChekinUser = (userData === null || userData === void 0 ? void 0 : userData.totalCheckin) + 1;
                }
                if ((eventData === null || eventData === void 0 ? void 0 : eventData.totalCheckin) === undefined) {
                    totalCheckinEvent = 1;
                }
                else {
                    totalCheckinEvent = (eventData === null || eventData === void 0 ? void 0 : eventData.totalCheckin) + 1;
                }
                if ((placeData === null || placeData === void 0 ? void 0 : placeData.totalCheckin) === undefined) {
                    totalCheckinPlace = 1;
                }
                else {
                    totalCheckinPlace = (placeData === null || placeData === void 0 ? void 0 : placeData.totalCheckin) + 1;
                }
                // updating the docId of the checkin document and count user checkin ,  event checkin an place checkin
                this.snap.ref
                    .update({
                    docId: data.objectId,
                    userCheckinCount: totalChekinUser,
                    eventCheckinCount: totalCheckinEvent,
                    placeCheckinCount: totalCheckinPlace
                })
                    .then(() => {
                    console.log(`checkin data is updated`);
                })
                    .catch((err) => {
                    console.log(`there was an error : ${err}`);
                });
                // Updating user
                if ((userData === null || userData === void 0 ? void 0 : userData.eventCheckinList) === undefined) {
                    userRef.ref
                        .update({
                        totalCheckin: totalChekinUser,
                        eventCheckinList: [data.eventId]
                    })
                        .then(() => {
                        console.log(`user checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                else {
                    userRef.ref
                        .update({
                        totalCheckin: totalChekinUser,
                        eventCheckinList: firebase_admin_1.firestore.FieldValue.arrayUnion(data.eventId)
                    })
                        .then(() => {
                        console.log(`user checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                // Updating event
                if ((eventData === null || eventData === void 0 ? void 0 : eventData.userCheckinList) === undefined) {
                    eventRef.ref
                        .update({
                        totalCheckin: totalCheckinEvent,
                        userCheckinList: [data.userId]
                    })
                        .then(() => {
                        console.log(`user checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                else {
                    eventRef.ref
                        .update({
                        totalCheckin: totalCheckinEvent,
                        userCheckinList: firebase_admin_1.firestore.FieldValue.arrayUnion(data.userId)
                    })
                        .then(() => {
                        console.log(`event checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                if ((placeData === null || placeData === void 0 ? void 0 : placeData.userCheckinList) === undefined) {
                    placeRef.ref
                        .update({
                        totalCheckin: totalCheckinPlace,
                        userCheckinList: [data.userId]
                    })
                        .then(() => {
                        console.log(`place checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                else {
                    placeRef.ref
                        .update({
                        totalCheckin: totalCheckinPlace,
                        userCheckinList: firebase_admin_1.firestore.FieldValue.arrayUnion(data.userId)
                    })
                        .then(() => {
                        console.log(`place checkin data is updated`);
                    })
                        .catch((err) => {
                        console.log(`there was an error : ${err}`);
                    });
                }
                return true;
            }
            catch (err) {
                throw err;
            }
        });
        this.db = db;
        this.snap = snap;
    }
}
exports.default = Checkins;
//# sourceMappingURL=Checkins.js.map