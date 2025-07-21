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
exports.comment_deleted = exports.comment_created = void 0;
const Constants = __importStar(require("../Helpers/Constants"));
const Notify = __importStar(require("../Helpers/Notify"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const __1 = require("../..");
const fieldValue = firebase_admin_1.default.firestore.FieldValue;
// 'Comment Created' : Notify Editors & Owner
exports.comment_created = Constants.runTimeoutShort.firestore
    .document("/{collectionId}/{docId}/comments_collection/{commentId}")
    .onCreate(function (commentSnap, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const docId = context.params.docId;
        const collectionId = context.params.collectionId;
        try {
            const docSnap = yield __1.db.collection(collectionId).doc(docId).get();
            if (!docSnap.exists) {
                console.warn(`Document ${docId} in collection ${collectionId} does not exist.`);
                return;
            }
            const docData = docSnap.data();
            yield __1.db.collection(collectionId).doc(docId).update({
                commentsCount: fieldValue.increment(1)
            });
            const commentDoc = commentSnap.data();
            const payload = {
                notification: {
                    title: `${commentDoc.userName} commented on your party`,
                    body: commentDoc.comment,
                    image: commentDoc.userPic
                },
                data: {
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
                    type: "event_reminder",
                    collection: collectionId,
                    docId,
                    onMessage: `${commentDoc.userName} commented on your party - ${docData === null || docData === void 0 ? void 0 : docData.name}`
                }
            };
            console.log("Comment created: " + docId);
            return yield Notify.notify_owner_and_editors(docData, payload);
        }
        catch (error) {
            console.error("Error processing comment_created trigger:", error);
            throw error; // You can handle this differently depending on your needs
        }
    });
});
// 'Comment Deleted'
exports.comment_deleted = Constants.runTimeoutShort.firestore
    .document("/{collectionId}/{docId}/comments_collection/{commentId}")
    .onDelete(function (_commentSnap, context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const docId = context.params.docId;
            const collectionId = context.params.collectionId;
            yield __1.db
                .collection(collectionId)
                .doc(docId)
                .update({
                commentsCount: fieldValue.increment(-1)
            });
            console.log("Comment deleted: " + docId);
            return "Success of comment_deleted";
        }
        catch (error) {
            console.error(error);
            return error;
        }
        // return Notify.notify_owner_and_editors(docData, payload)
    });
});
//# sourceMappingURL=CommentTriggers.js.map