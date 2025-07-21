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
exports.eventBrand_deleted_notification = exports.eventBrand_created_notification = exports.eventBrandUser_edited_notification = void 0;
const Constants = __importStar(require("../Helpers/Constants"));
const Notify = __importStar(require("../Helpers/Notify"));
const __1 = require("../..");
const Functions_1 = require("../Helpers/Functions");
//Event, Brand or User is Edited: publish (Owner), under review (Admins), promotion (Everyone)
exports.eventBrandUser_edited_notification = Constants.runTimeoutShort.firestore
    .document("/{collectionId}/{docId}")
    .onUpdate(function (snap, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const docId = context.params.docId;
        const collectionId = context.params.collectionId;
        const beforeData = snap.before.data();
        const afterData = snap.after.data();
        if (isEvent(collectionId)) {
            const maxLikeBoostedEvent = yield getMaxLikeBoostedEvents({
                beforeData,
                afterData
            });
            if (maxLikeBoostedEvent.maxcountFollowers > 0) {
                console.log(`count followers before : ${afterData.countFollowers}`);
                console.log(`count followers after : ${maxLikeBoostedEvent.maxcountFollowers}`);
                console.log(`event if ${snap.after.id}`);
                //update the database
                if (afterData.countFollowers !== undefined &&
                    maxLikeBoostedEvent.maxcountFollowers > afterData.countFollowers) {
                    yield snap.after.ref.update({
                        countFollowers: maxLikeBoostedEvent.maxcountFollowers,
                        listFollowers: maxLikeBoostedEvent.maxListFollowers,
                        editedAt: new Date()
                    });
                }
                if (afterData.countFollowers === undefined) {
                    yield snap.after.ref.update({
                        countFollowers: maxLikeBoostedEvent.maxcountFollowers,
                        listFollowers: maxLikeBoostedEvent.maxListFollowers,
                        editedAt: new Date()
                    });
                }
            }
        }
        if (isEventOrBrand(collectionId)) {
            if (afterData["publishStatus"] !== beforeData["publishStatus"] &&
                beforeData !== null) {
                // ToDo: 'published' : Notify Owner || 'under review' : Notify Admins
                let suffix;
                let userRole = Constants.UserRoles.admins;
                const publishStatus = afterData.publishStatus;
                const isEditor = yield Constants.isEditorOrAdmin(afterData.ownerId);
                if (publishStatus === 1 && !isEditor) {
                    suffix = Constants.eventBrand_edit_actions.eventBrand_published;
                    userRole = Constants.UserRoles.owner;
                }
                else if (publishStatus === 0) {
                    suffix = Constants.eventBrand_edit_actions.eventBrand_under_review;
                    userRole = Constants.UserRoles.admins;
                }
                // Reason to comment : This should send notifications to non-editor owners only
                // else if (publishStatus === -1 && !isEditor) {
                // 	suffix = Constants.eventBrand_edit_actions.eventBrand_updated
                // 	userRole = Constants.UserRoles.owner
                // }
                // else if (publishStatus === -2) {
                //   suffix = Constants.eventBrand_edit_actions.eventBrand_cancelled;
                // userRole = Constants.UserRoles.admin
                // }
                // Changed recently but undone: Send notification only for under_review & published status
                // && publishStatus > -1
                if (suffix !== undefined && publishStatus > -1)
                    return Notify.notifyDefault(snap.after, userRole, context.params.collectionId, suffix);
            }
        }
        //Adding expiry date so subscription can be ended for <3.5.0
        //ToDo: This function is only useful for older app versions,
        //Remove it once all users have updated to 3.5.0 and beyond
        // Need it for fixing payment by changing ug from app and firestore
        // else if (collectionId === "users" &&
        // 	beforeData.isUnderground !== afterData.isUnderground &&
        // 	afterData.isUnderground === true &&
        // 	//ToDo: Change this to == null
        // 	//ToDo: undergroundPayment.validDays !== 30 - Added so it doesn't execute for new app version with monthly packages
        // 	// && afterData.undergroundPayment.validDays !== 30
        // 	afterData.undergroundPayment === undefined
        // ) {
        // console.log("Adding Underground Expiry Date for the user - " + docId)
        // const now = firestore.Timestamp.now()
        // const validDays = 3
        // await db.collection(collectionId).doc(docId).update(
        // 	{
        // 		"undergroundPayment": {
        // 			// "pricePaid": 999,
        // 			// "datePaid": Timestamp.now(),
        // 			"validDays": validDays,
        // 			"dateStart": now,
        // 			"dateExpiry": DateTimeUtils.addSubtractTime(now, validDays, 0, 0), // moment(now).add(365, "days").toDate(),
        //       "updatedBy": 'updateTrigger',
        // 		}
        // 	}
        // )
        // return Notify.notifyDefault(
        // 	snap.after,
        // 	Constants.UserRoles.editors,
        // 	context.params.collectionId,
        // 	'New Underground Member'
        // )
        // }
        return null;
    });
});
function getMaxLikeBoostedEvents(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const mapMaxCountFollowers = {
            maxcountFollowers: 0,
            maxListFollowers: []
        };
        // reset event Likes
        const idPlace = data.beforeData.idPlace;
        if (data.afterData.promotionPackage > 0 &&
            data.afterData.countFollowers < 60 &&
            data.afterData.promotionPackage > data.beforeData.promotionPackage) {
            const allEvents = yield __1.db
                .collection("events")
                .where("idPlace", "==", idPlace)
                .where("publishStatus", "==", 1)
                .orderBy("countFollowers", "desc")
                .limit(1) // limit 5 just to be safe
                .get();
            const eventDocs = allEvents.docs;
            for (const eventDoc of eventDocs) {
                const event = eventDoc.data();
                if (event.listFollowers !== undefined) {
                    console.log(`id : ${eventDoc.id} -  maxCountFollowers : ${event.countFollowers}`);
                    // apply union logic
                    let currentListFollowers;
                    if (data.afterData.listFollowers !== undefined) {
                        currentListFollowers = data.afterData.listFollowers;
                    }
                    else {
                        currentListFollowers = [];
                    }
                    // union logic
                    const listReference = (0, Functions_1.unionDocumentReferences)(event.listFollowers, currentListFollowers);
                    // max count of likes from listReference length
                    mapMaxCountFollowers.maxcountFollowers = listReference.length;
                    mapMaxCountFollowers.maxListFollowers = listReference;
                    break;
                }
            }
            // update the doc with new likes count
        }
        return mapMaxCountFollowers;
    });
}
//'Event or Brand Created' : Notify Editors, only if UnderReview
exports.eventBrand_created_notification = Constants.runTimeoutShort.firestore
    .document("/{collectionId}/{docId}")
    .onCreate(function (snap, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const collection = context.params.collectionId;
        const docId = snap.data().docId;
        const publishStatus = snap.data().publishStatus;
        const objectId = snap.id;
        let suffix;
        let userRole;
        if (isEventOrBrand(collection)) {
            yield snap.ref.update({
                docIdOld: docId,
                docId: objectId,
                editedAt: new Date()
            });
            //To Admins, if underReview
            if (publishStatus === 0) {
                userRole = Constants.UserRoles.admins;
                suffix = Constants.eventBrand_edit_actions.eventBrand_created;
                return Notify.notifyDefault(snap, userRole, collection, suffix);
            }
        }
        //To Owner (if not editor), if needs to be updated (for weekly duplication of events)
        // else if (
        //   publishStatus === -1 &&
        //   !Constants.isEditorOrAdmin(snap.data().ownerId)
        // ) {
        //   userRole = Constants.UserRoles.owner;
        //   suffix = Constants.eventBrand_edit_actions.eventBrand_updated;
        // }
        // if (userRole !== undefined && suffix !== undefined)
        return null;
    });
});
// 'Event or Brand Deleted' : Notify Owner
exports.eventBrand_deleted_notification = Constants.runTimeoutShort.firestore
    .document("/{collectionId}/{docId}")
    .onDelete(function (snap, context) {
    const collection = context.params.collectionId;
    if (isEventOrBrand(collection))
        return Notify.notifyDefault(snap, Constants.UserRoles.admins, collection, Constants.eventBrand_edit_actions.eventBrand_deleted);
    return null;
});
function isEventOrBrand(collection) {
    if (collection === Constants.Collections[Constants.Collections.events] ||
        collection === Constants.Collections[Constants.Collections.brands])
        return true;
    return false;
}
function isEvent(collection) {
    if (collection === Constants.Collections[Constants.Collections.events])
        return true;
    return false;
}
//# sourceMappingURL=CollectionTriggers.js.map