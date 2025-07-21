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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cron_retry_unfinished_invoices = exports.webhook_razorpay_authorised = exports.comment_deleted = exports.comment_created = exports.checkinsUpdateTrigger = exports.checkinsCreationTrigger = exports.eventBrand_deleted_notification = exports.eventBrand_created_notification = exports.eventBrandUser_edited_notification = exports.cron_daily_underground_users_count = exports.send_notification_under_review_events_counts = exports.send_notification_under_review_events = exports.cron_send_event_flyer = exports.cron_firestore_to_spreadsheet = exports.cron_event_data_spreadsheet = exports.cron_place_refetch = exports.cron_weekly_event_duplication = exports.cron_underground_status_reset = exports.cron_event_reminder_notification = exports.send_notification_event_owner_boosted_events = exports.cron_daily_events_count_notification = exports.db = exports.serviceAccount = exports.apiToken = exports.uidAdmin = exports.webApi = void 0;
const Constants = __importStar(require("./Library/Helpers/Constants"));
const CollectionTriggers = __importStar(require("./Library/Triggers/CollectionTriggers"));
const CheckinTriggers = __importStar(require("./Library/Triggers/CheckinTriggers"));
const CommentTriggers = __importStar(require("./Library/Triggers/CommentTriggers"));
const UserCrons = __importStar(require("./Library/Crons/UserCrons"));
const events_reminder = __importStar(require("./Library/Crons/EventCronServices/EventReminder"));
const event_notification = __importStar(require("./Library/Crons/EventCronServices/EventSendNotification"));
const event_send_flyr = __importStar(require("./Library/Crons/EventCronServices/EventSendFlyer"));
const event_duplicate_script = __importStar(require("./Library/Crons/EventCronServices/EventDuplicateCron"));
const DataCrons = __importStar(require("./Library/Crons/SheetCrons"));
const PaymentTriggers = __importStar(require("./Library/Triggers/PaymentTriggers"));
const PlaceRefetch = __importStar(require("./Library/Crons/PlaceCrons"));
var HomeEventList_1 = require("./Library/Http/HomeEventList");
Object.defineProperty(exports, "webApi", { enumerable: true, get: function () { return HomeEventList_1.webApi; } });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.uidAdmin = process.env.uid_admin || "default_admin_uid";
exports.apiToken = process.env.apiBearerToken || "test-token";
//// Initialisation ////
// Initialize the app with a service account by project and grant admin privileges
exports.serviceAccount = require("../src/JSONs/serviceAccountKey_" +
    Constants.projectKey +
    ".json");
// admin.initializeApp(serviceAccount);
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(exports.serviceAccount),
    //admin.credential.applicationDefault(),
    //databaseURL: process.env.FIREBASE_APP_DATABASE_URL,
    //"https://partyhunt-production.firebaseio.com",
    projectId: process.env.FIREBASE_APP_PROJECT_ID,
    storageBucket: process.env.FIREBASE_APP_STORAGE_BUCKET
}); //.firestore().settings(settings)
exports.db = firebase_admin_1.default.firestore();
///// CRONS /////
/// CRONS - USER NOTIFICATIONS ///
// Notification - Daily Event Count
exports.cron_daily_events_count_notification = event_notification.cron_daily_events_count_notification;
// Notification - Send to event owners for boosted events
exports.send_notification_event_owner_boosted_events = event_notification.send_notification_event_owner_boosted_events;
// Notification - Event Reminder
exports.cron_event_reminder_notification = events_reminder.cron_event_reminder_notification;
/// CRONS - BACKEND FUNCTIONS ///
// Backend - Reset UG Status
exports.cron_underground_status_reset = UserCrons.cron_underground_status_reset;
// Backend - Duplicate Weekly Event
exports.cron_weekly_event_duplication = event_duplicate_script.cron_weekly_event_duplication;
// Backend - Place Refetch
exports.cron_place_refetch = PlaceRefetch.cron_monthly_placeData_refetch;
// Backend - Export Firestore Data to Google Sheet
exports.cron_event_data_spreadsheet = DataCrons.cron_event_data_spreadsheet;
exports.cron_firestore_to_spreadsheet = DataCrons.cron_firestore_to_spreadsheet;
/// CRONS - FOR ADMINS ///
// Admin - Send Flyer to social media manager
exports.cron_send_event_flyer = event_send_flyr.cron_send_event_flyer;
// Admin - Send under review events
exports.send_notification_under_review_events = event_notification.send_notification_under_review_events;
// Admin - Events count under review to admins
exports.send_notification_under_review_events_counts = event_notification.send_notification_under_review_events_counts;
// Admin - Daily UG Users Count
exports.cron_daily_underground_users_count = UserCrons.cron_daily_underground_users_count;
///// TRIGGERS /////
/// TRIGGERS - Firestore Collections ///
// Event or Brand - Created, Updated or Deleted
exports.eventBrandUser_edited_notification = CollectionTriggers.eventBrandUser_edited_notification;
exports.eventBrand_created_notification = CollectionTriggers.eventBrand_created_notification;
exports.eventBrand_deleted_notification = CollectionTriggers.eventBrand_deleted_notification;
// Checkin - Created or Updated
exports.checkinsCreationTrigger = CheckinTriggers.checkinsCreationTrigger;
exports.checkinsUpdateTrigger = CheckinTriggers.checkinsUpdateTrigger;
// Comment - Created or Deleted
exports.comment_created = CommentTriggers.comment_created;
exports.comment_deleted = CommentTriggers.comment_deleted;
/// TRIGGERS & CRONS - PAYMENTS ///
// Payment Webhook
exports.webhook_razorpay_authorised = PaymentTriggers.webhook_razorpay_authorised;
// Retry Service for Invoice
exports.cron_retry_unfinished_invoices = UserCrons.cron_retry_unfinished_invoices;
// export const webApi = WebAPi.webApi;
// Archive
// export const app_removed_analytics = AnalyticTriggers.app_removed_analytics;
// export const cron_weekly_event_duplication_trigger = EventTriggers.cron_weekly_event_duplication_trigger
// export const webhook_razorpay_authorised_wati = PaymentTriggers.webhook_razorpay_authorised_wati;
// export const auth_created = AnalyticNotifications.auth_createds
// exports.cron_weekly_event_duplication_delete = EventCrons.cron_weekly_event_duplication_delete
// exports.taskRunner = EventCrons.taskRunner
// exports.weeklyEventDuplicationNew = EventCrons.cron_weekly_event_duplication_new
// exports.tags_created_indexing = FirestoreTriggers.tags_created_indexing
// exports.generate_thumbnail = StorageTriggers.generate_thumbnail
// exports.set_publish_status = EventCrons.set_publish_status
// exports.user_follow_notify_following = UserNotifications.user_follow_notify_following
// exports.app_opened_analytics = AnalyticNotifications.app_opened_analytics
// exports.user_created_notify_admin = UserNotifications.user_created_notify_admin
// exports.update_event_promotion_plan = TriggerHandler.update_event_promotion_plan
// exports.update_event_likes = EventCrons.update_event_likes
// Cache diamond events cron_cache_diamond_events
// export const cron_cache_diamond_events =
//   EventCrons.cron_cache_diamond_events;
// exports.testCloudFunctionsServer = functions.firestore.document('{collection}/{docId}').onCreate(async (snapshot, context) => {
//   await snapshot.ref.update({ server: 'side' })
// })
// THIS IS THE DEFAULT HOST AND PORT USED BY 'firebase serve command'
// admin.functions().useFunctionsEmulator('http://localhost:5000');
// import { initializeFirestore } from "firebase/firestore";
// if (location.hostname === "localhost") {
//   db.settings({
//     host: "localhost:8080",
//     ssl: false
//   })
// }
//# sourceMappingURL=index.js.map