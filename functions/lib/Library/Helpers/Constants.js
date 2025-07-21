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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fcm_topics = exports.analytics_events = exports.eventBrand_edit_actions = exports.PublishType = exports.UserRoles = exports.Collections = exports.runTimeoutShort = exports.runTimeoutLong = exports.runTimeOptionsShort = exports.runTimeOptionsLong = exports.spreadsheetId = exports.uidAdmin = exports.projectKey = exports.timezone = void 0;
exports.getUserIds = getUserIds;
exports.getUserRefs = getUserRefs;
exports.isEditorOrAdmin = isEditorOrAdmin;
exports.Constants = Constants;
const firebase_functions_1 = require("firebase-functions");
const __1 = require("../..");
const Helpers = __importStar(require("./Functions"));
// Special
exports.timezone = "Asia/Calcutta";
// Fetch the service account key JSON file contents
// const newLocal = 'event_reminder';
// export function projectKey() {
let projectKey = "dev";
exports.projectKey = projectKey;
if (process.env.GCLOUD_PROJECT === "partyhunt-production")
    //"party-hunt"
    exports.projectKey = projectKey = "prod";
console.log("Active Project Key: " + projectKey); //process.env
// }
// Get Firebase project id from `FIREBASE_CONFIG` environment variable
// const envProjectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
// Environment Variables
const env = (0, firebase_functions_1.config)().environment;
exports.uidAdmin = env.uid_admin;
//export const uidEditors: [string] = env.uid_editors
exports.spreadsheetId = env.spreadsheetid;
// Runtime Options
// export const runTimeOptionsExtraLong: RuntimeOptions = { timeoutSeconds: 540, memory: '8GB' }
exports.runTimeOptionsLong = {
    timeoutSeconds: 540,
    memory: "4GB"
}; // 2GB
exports.runTimeOptionsShort = {
    timeoutSeconds: 180,
    memory: "1GB"
}; // 90, 512MB
exports.runTimeoutLong = (0, firebase_functions_1.runWith)(exports.runTimeOptionsLong);
exports.runTimeoutShort = (0, firebase_functions_1.runWith)(exports.runTimeOptionsShort);
// Enums
// TODO: admin->admins (from environment variable to remote constant)
var Collections;
(function (Collections) {
    Collections[Collections["events"] = 0] = "events";
    Collections[Collections["brands"] = 1] = "brands";
    Collections[Collections["places"] = 2] = "places";
    Collections[Collections["users"] = 3] = "users";
    Collections[Collections["comments"] = 4] = "comments";
    Collections[Collections["tag"] = 5] = "tag";
    Collections[Collections["checkins"] = 6] = "checkins";
})(Collections || (exports.Collections = Collections = {}));
var UserRoles;
(function (UserRoles) {
    UserRoles[UserRoles["admins"] = 0] = "admins";
    UserRoles[UserRoles["editors"] = 1] = "editors";
    UserRoles[UserRoles["followers"] = 2] = "followers";
    UserRoles[UserRoles["owner"] = 3] = "owner";
    UserRoles[UserRoles["tribe"] = 4] = "tribe";
    UserRoles[UserRoles["all"] = 5] = "all";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
var PublishType;
(function (PublishType) {
    PublishType[PublishType["Cancelled"] = -2] = "Cancelled";
    PublishType[PublishType["Update"] = -1] = "Update";
    PublishType[PublishType["UnderReview"] = 0] = "UnderReview";
    PublishType[PublishType["Published"] = 1] = "Published";
})(PublishType || (exports.PublishType = PublishType = {}));
// enum EnumType { event_reminder='event_reminder',event_created='event_created'}
// Maps
exports.eventBrand_edit_actions = {
    event_reminder: " is starting soon",
    eventBrand_created: " is created",
    eventBrand_deleted: " is deleted",
    eventBrand_published: " is approved and live", //on Party Hunt
    eventBrand_cancelled: " is cancelled",
    eventBrand_updated: " needs to be updated",
    eventBrand_under_review: " is under review",
    eventBrand_commented: " has a new comment"
    //event_updated: ' is updated',
    //event_promoted: ' is trending',
    //event_spammed: ' is reported spam'
};
exports.analytics_events = {
    app_remove: "Lost a user",
    first_open: "Gained a user",
    user_created: "User Created"
};
exports.fcm_topics = {
    all_users: "all",
    editors: "publishers_editors",
    non_editors: "publishers_non_editors",
    // tribes function accept optional parameter
    // if paramter tribe is undefined fetch all else fetch relevant tribe
    tribes: function (tribe) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteConstants = yield Constants();
            if (remoteConstants !== undefined) {
                if (remoteConstants.listTribes !== undefined &&
                    remoteConstants.listTribes.length > 0) {
                    // if tribe is defined then fetch relevant tribe name
                    if (tribe !== undefined) {
                        return remoteConstants.listTribes
                            .filter((f) => {
                            // filter function to select relevant tribe
                            return f.name === tribe;
                        })
                            .map((m) => {
                            // return name key only which should topic name as well
                            return m.name;
                        });
                    }
                    else {
                        return remoteConstants.listTribes.map((m) => {
                            // return name key only which should topic name as well
                            return m.name;
                        });
                    }
                }
                else {
                    // returning empty if remote constants is never defined
                    return [];
                }
            }
            else {
                // returning empty if remote constants is never defined
                return [];
            }
        });
    }
};
function getUserIds(emailList) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        let userDataContext;
        const userIdList = [];
        if (emailList.length > 0) {
            // break editorEmails upto upto 30 object
            const userEmailIdsBatches = Helpers.splitIntoChunk(emailList, 30);
            try {
                for (var _d = true, userEmailIdsBatches_1 = __asyncValues(userEmailIdsBatches), userEmailIdsBatches_1_1; userEmailIdsBatches_1_1 = yield userEmailIdsBatches_1.next(), _a = userEmailIdsBatches_1_1.done, !_a; _d = true) {
                    _c = userEmailIdsBatches_1_1.value;
                    _d = false;
                    const batch = _c;
                    console.log(`batch size length : ${batch.length}`);
                    userDataContext = yield __1.db
                        .collection(Collections[Collections.users])
                        .where("email", "in", batch)
                        .get();
                    console.log(`db objects length: ${userDataContext.docs.length}`);
                    userIdList.push(...userDataContext.docs.map((m) => {
                        return m.data().uid;
                    }));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = userEmailIdsBatches_1.return)) yield _b.call(userEmailIdsBatches_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return userIdList;
    });
}
function getUserRefs(emailList) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_2, _b, _c;
        let userDataContext;
        const userRefList = [];
        if (emailList.length > 0) {
            // break editorEmails upto upto 30 object
            const userEmailIdsBatches = Helpers.splitIntoChunk(emailList, 30);
            try {
                for (var _d = true, userEmailIdsBatches_2 = __asyncValues(userEmailIdsBatches), userEmailIdsBatches_2_1; userEmailIdsBatches_2_1 = yield userEmailIdsBatches_2.next(), _a = userEmailIdsBatches_2_1.done, !_a; _d = true) {
                    _c = userEmailIdsBatches_2_1.value;
                    _d = false;
                    const batch = _c;
                    console.log(`batch size length : ${batch.length}`);
                    userDataContext = yield __1.db
                        .collection(Collections[Collections.users])
                        .where("email", "in", batch)
                        .get();
                    console.log(`db objects length: ${userDataContext.docs.length}`);
                    userRefList.push(...userDataContext.docs.map((m) => {
                        return m.ref;
                    }));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = userEmailIdsBatches_2.return)) yield _b.call(userEmailIdsBatches_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return userRefList;
    });
}
// TODO: s Add both editors and admin
function isEditorOrAdmin(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const constants = yield Constants();
        const adminEmails = constants === null || constants === void 0 ? void 0 : constants.adminEmailIds; // array of email  admins
        const editorEmails = constants === null || constants === void 0 ? void 0 : constants.editorEmailIds; // array of email  editors
        const adminidList = yield getUserIds(adminEmails);
        const editoridList = yield getUserIds(editorEmails);
        adminidList.push(...editoridList);
        return adminidList.includes(uid) || exports.uidAdmin === uid;
    });
}
function Constants() {
    return __awaiter(this, void 0, void 0, function* () {
        const constants = yield __1.db.collection("remote").doc("constants").get();
        return constants.data();
    });
}
// Can be used later
// export async function isAdmin(uid: string){
//   const constants =await Constants()
//   const adminEmails = constants?.adminEmailIds // array of admins
//   const adminList = await getUserIds(adminEmails)
//   return adminList.includes(uid) || uidAdmin === uid;
// }
// export async function isEditor(uid: string){
//   const constants =await Constants()
//   const editorEmails= constants?.editorEmailIds // array of editors
//   const editorList = await getUserIds(editorEmails)
//   return editorList.includes(uid);
// }
// export remote constants
//# sourceMappingURL=Constants.js.map