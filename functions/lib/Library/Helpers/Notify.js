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
exports.notify_topic = exports.notify_admin = exports.notify_email_list = exports.notify_owner_and_editors = exports.notify_users = void 0;
exports.notifyDefault = notifyDefault;
exports.getPayload = getPayload;
const firebase_admin_1 = require("firebase-admin");
const __1 = require("../..");
const Constants = __importStar(require("./Constants"));
function send_notification(fcmToken, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if ((fcmToken === null || fcmToken === void 0 ? void 0 : fcmToken.length) > 0) {
                yield (0, firebase_admin_1.messaging)().sendToDevice(fcmToken, payload);
                console.log("Successfully sent ", fcmToken === null || fcmToken === void 0 ? void 0 : fcmToken.length, " notifications:", payload);
            }
            // else
            //     console.log('No FCM token. User logged out.')
        }
        catch (error) {
            console.error(error);
        }
    });
}
function fetch_token(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userDoc = yield __1.db.doc(`users/${uid}`).get();
            let fcmToken;
            if (userDoc.exists)
                fcmToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
            return fcmToken;
        }
        catch (error) {
            console.error(error);
        }
    });
}
//Notify Followers.
const notify_users = function (likesRefsArray, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (likesRefsArray !== undefined) {
            //To fix an error
            try {
                const allTokens = [];
                for (const following of likesRefsArray) {
                    if (following !== undefined) {
                        //To fix an error
                        const fcmToken = yield fetch_token(following === null || following === void 0 ? void 0 : following.id);
                        if ((fcmToken === null || fcmToken === void 0 ? void 0 : fcmToken.length) > 0)
                            allTokens.push(fcmToken);
                    }
                }
                yield send_notification(allTokens, payload);
            }
            catch (error) {
                console.error(error);
            }
        }
    });
};
exports.notify_users = notify_users;
//Notify Owner & Admin
const notify_owner_and_editors = function (event, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const listTokens = [];
            //ToDo: New Change to check if fcmToken is not null & not added already
            //If owner is admin or editors, then don't add
            const isEditor = yield Constants.isEditorOrAdmin(event.ownerId);
            if (!isEditor) {
                const fcmTokenOwner = yield fetch_token(event.ownerId);
                if ((fcmTokenOwner === null || fcmTokenOwner === void 0 ? void 0 : fcmTokenOwner.length) > 0)
                    //&& !listTokens.includes(fcmTokenOwner)
                    listTokens.push(fcmTokenOwner);
            }
            // Adding admin fcmToken
            // const fcmTokenAdmin = await fetch_token(Constants.uidAdmin)
            // if (fcmTokenAdmin)
            //     listTokens.push(fcmTokenAdmin)
            // Admin is already notified with editors
            yield notify_editors(payload);
            yield send_notification(listTokens, payload);
        }
        catch (error) {
            console.error(error);
        }
    });
};
exports.notify_owner_and_editors = notify_owner_and_editors;
//Notify Editors
function notify_editors(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const constants = yield Constants.Constants();
            const editorsEmails = constants === null || constants === void 0 ? void 0 : constants.editorEmailIds;
            const listEditors = yield Constants.getUserRefs(editorsEmails);
            const notifyList = [];
            if (listEditors.length > 0) {
                listEditors.forEach((el) => {
                    notifyList.push(el);
                });
            }
            //listEditors.push()
            return (0, exports.notify_users)(notifyList, payload);
        }
        catch (error) {
            console.error(error);
        }
    });
}
// function getListEditors() {
//     return Constants.uidEditors?.map(uid => db.collection("users").doc(uid))
// }
//Notify to emailIdList
const notify_email_list = function (payload, emailList) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const emails = emailList;
            const listUsers = yield Constants.getUserRefs(emails);
            const notifyList = [];
            if (listUsers.length > 0) {
                listUsers.forEach((el) => {
                    notifyList.push(el);
                });
            }
            //listEditors.push()
            return (0, exports.notify_users)(notifyList, payload);
        }
        catch (error) {
            console.error(error);
        }
    });
};
exports.notify_email_list = notify_email_list;
//Notify Admin
const notify_admin = function (payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const constants = yield Constants.Constants();
            const adminEmails = constants === null || constants === void 0 ? void 0 : constants.adminEmailIds;
            const listAdmins = yield Constants.getUserRefs(adminEmails);
            const notifyList = [];
            if (listAdmins.length > 0) {
                listAdmins.forEach((el) => {
                    notifyList.push(el);
                });
            }
            //listEditors.push()
            return (0, exports.notify_users)(notifyList, payload);
        }
        catch (error) {
            console.error(error);
        }
    });
};
exports.notify_admin = notify_admin;
//Notify Topic
const notify_topic = function (payload, topic) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, firebase_admin_1.messaging)().sendToTopic(topic, payload);
            console.log("Successfully sent notification to topic:", topic, payload);
        }
        catch (error) {
            console.error(error);
        }
    });
};
exports.notify_topic = notify_topic;
function notifyDefault(snap, userRole, collectionId, suffix, tribe) {
    var _a;
    let payload = {};
    const docData = snap.data();
    if (collectionId === Constants.Collections[Constants.Collections.brands])
        payload = getPayload((docData === null || docData === void 0 ? void 0 : docData.category) + ": " + (docData === null || docData === void 0 ? void 0 : docData.name) + suffix, docData === null || docData === void 0 ? void 0 : docData.shortBio, docData === null || docData === void 0 ? void 0 : docData.picture, "brand_reminder", collectionId, docData === null || docData === void 0 ? void 0 : docData.docId);
    else if (collectionId === Constants.Collections[Constants.Collections.events])
        payload = getPayload((docData === null || docData === void 0 ? void 0 : docData.eventName) + suffix, "at " + ((_a = docData === null || docData === void 0 ? void 0 : docData.placeData) === null || _a === void 0 ? void 0 : _a.name), docData === null || docData === void 0 ? void 0 : docData.picture, "event_reminder", collectionId, docData === null || docData === void 0 ? void 0 : docData.docId);
    else if (collectionId === Constants.Collections[Constants.Collections.users])
        payload = getPayload(docData === null || docData === void 0 ? void 0 : docData.name, suffix, docData === null || docData === void 0 ? void 0 : docData.picture, "event_reminder", collectionId, docData === null || docData === void 0 ? void 0 : docData.docId);
    switch (userRole) {
        case Constants.UserRoles.admins:
            return (0, exports.notify_admin)(payload);
        case Constants.UserRoles.editors:
            return notify_editors(payload);
        case Constants.UserRoles.followers:
            return (0, exports.notify_users)(docData.likesRefsArray, payload);
        case Constants.UserRoles.owner:
            return (0, exports.notify_owner_and_editors)(docData, payload);
        case Constants.UserRoles.all:
            return (0, exports.notify_topic)(payload, Constants.fcm_topics.all_users);
        case Constants.UserRoles.tribe:
            Constants.fcm_topics
                .tribes(tribe)
                .then((tribes) => {
                if (tribes.length === 0 || tribes === undefined) {
                    // sending to all user if tribes is undefiined or empty
                    return (0, exports.notify_topic)(payload, Constants.fcm_topics.all_users);
                }
                else {
                    // send topic from first element of tribes
                    return (0, exports.notify_topic)(payload, tribes[0]);
                }
            })
                .catch((err) => {
                console.log(`An exception occured with error ${err}`);
                console.log(`sending all users in this case`);
                // sending to all user if exception occured
                return (0, exports.notify_topic)(payload, Constants.fcm_topics.all_users);
            });
        default:
            return;
    }
}
function getPayload(title, body, image, type, collection, docId) {
    return {
        notification: {
            title: title,
            body: body,
            image: image !== null && image !== void 0 ? image : ""
        },
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            type: type,
            collection: collection,
            docId: docId,
            onMessage: title
        }
        // fcmOptions: {} as messaging.MessagingOptions
    };
}
// export const payload_analytics_notification = function (event: AnalyticsEvent, title: string) {
//     const geoInfo = event.user.geoInfo;
//     const notificationMessaging = {
//         title: title,//'You lost a user \uD83D\uDE1E',
//         body: `${event.user.deviceInfo.mobileModelName} from ${geoInfo.city}, ${geoInfo.country}`,
//     }
//     const payload = { notification: notificationMessaging }
//     return payload;
// };
// export const payload_user_created = function (user: DocumentData) {
//     const title = 'New User ';
//     const body = user['displayName'] + ' joined with ' + user['email'];
//     const payload = {
//         notification: {
//             title: title,
//             body: body,
//         },
//         data: {
//             // click_action: 'FLUTTER_NOTIFICATION_CLICK',
//             type: 'user_created',
//             onMessage: title + body,
//         }
//         to: "<FCM TOKEN>"
//     }
//     return payload;
// }
//# sourceMappingURL=Notify.js.map