import * as Constants from "./Library/Helpers/Constants";
import * as CollectionTriggers from "./Library/Triggers/CollectionTriggers";
import * as CheckinTriggers from "./Library/Triggers/CheckinTriggers";
import * as CommentTriggers from "./Library/Triggers/CommentTriggers";
import * as UserCrons from "./Library/Crons/UserCrons";
import * as events_reminder from "./Library/Crons/EventCronServices/EventReminder";
import * as event_notification from "./Library/Crons/EventCronServices/EventSendNotification";
import * as event_send_flyr from "./Library/Crons/EventCronServices/EventSendFlyer";
import * as event_duplicate_script from "./Library/Crons/EventCronServices/EventDuplicateCron";
import * as DataCrons from "./Library/Crons/SheetCrons";
import * as PaymentTriggers from "./Library/Triggers/PaymentTriggers";
import * as PlaceRefetch from "./Library/Crons/PlaceCrons";
export { webApi } from "./Library/Http/HomeEventList";
import admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();
export const uidAdmin = process.env.uid_admin || "default_admin_uid";
export const apiToken = process.env.apiBearerToken || "test-token";

//// Initialisation ////

// Initialize the app with a service account by project and grant admin privileges
export const serviceAccount = require("../src/JSONs/serviceAccountKey_" +
  Constants.projectKey +
  ".json");
// admin.initializeApp(serviceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //admin.credential.applicationDefault(),
  //databaseURL: process.env.FIREBASE_APP_DATABASE_URL,
  //"https://partyhunt-production.firebaseio.com",
  projectId: process.env.FIREBASE_APP_PROJECT_ID,
  storageBucket: process.env.FIREBASE_APP_STORAGE_BUCKET
}); //.firestore().settings(settings)

export const db = admin.firestore();

///// CRONS /////

/// CRONS - USER NOTIFICATIONS ///
// Notification - Daily Event Count
export const cron_daily_events_count_notification =
  event_notification.cron_daily_events_count_notification;

// Notification - Send to event owners for boosted events
export const send_notification_event_owner_boosted_events =
  event_notification.send_notification_event_owner_boosted_events;

// Notification - Event Reminder
export const cron_event_reminder_notification =
  events_reminder.cron_event_reminder_notification;

/// CRONS - BACKEND FUNCTIONS ///
// Backend - Reset UG Status
export const cron_underground_status_reset =
  UserCrons.cron_underground_status_reset;

// Backend - Duplicate Weekly Event
export const cron_weekly_event_duplication =
  event_duplicate_script.cron_weekly_event_duplication;

// Backend - Place Refetch
export const cron_place_refetch = PlaceRefetch.cron_monthly_placeData_refetch;

// Backend - Export Firestore Data to Google Sheet
export const cron_event_data_spreadsheet =
  DataCrons.cron_event_data_spreadsheet;
export const cron_firestore_to_spreadsheet =
  DataCrons.cron_firestore_to_spreadsheet;

/// CRONS - FOR ADMINS ///
// Admin - Send Flyer to social media manager
export const cron_send_event_flyer = event_send_flyr.cron_send_event_flyer;

// Admin - Send under review events
export const send_notification_under_review_events =
  event_notification.send_notification_under_review_events;

// Admin - Events count under review to admins
export const send_notification_under_review_events_counts =
  event_notification.send_notification_under_review_events_counts;

// Admin - Daily UG Users Count
export const cron_daily_underground_users_count =
  UserCrons.cron_daily_underground_users_count;

///// TRIGGERS /////

/// TRIGGERS - Firestore Collections ///
// Event or Brand - Created, Updated or Deleted
export const eventBrandUser_edited_notification =
  CollectionTriggers.eventBrandUser_edited_notification;
export const eventBrand_created_notification =
  CollectionTriggers.eventBrand_created_notification;
export const eventBrand_deleted_notification =
  CollectionTriggers.eventBrand_deleted_notification;

// Checkin - Created or Updated
export const checkinsCreationTrigger = CheckinTriggers.checkinsCreationTrigger;
export const checkinsUpdateTrigger = CheckinTriggers.checkinsUpdateTrigger;

// Comment - Created or Deleted
export const comment_created = CommentTriggers.comment_created;
export const comment_deleted = CommentTriggers.comment_deleted;

/// TRIGGERS & CRONS - PAYMENTS ///
// Payment Webhook
export const webhook_razorpay_authorised =
  PaymentTriggers.webhook_razorpay_authorised;

// Retry Service for Invoice
export const cron_retry_unfinished_invoices =
  UserCrons.cron_retry_unfinished_invoices;

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