import * as Constants from "../../Helpers/Constants";
import * as DateTimeUtils from "../../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import moment from "moment-timezone";
import * as Notify from "../../Helpers/Notify";
import * as functions from "firebase-functions";
import { db } from "../../..";

moment.tz.setDefault(Constants.timezone);

//Cron job every hour. If diamond boost, notify all users otherwise just notify followers.
export const cron_event_reminder_notification = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("every 90 mins")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      const startTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        0,
        0,
        0
      ); //Until now
      const endTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        0,
        0,
        95
      ); //From  65 minutes ago

      const allEvents = await db
        .collection("events")
        .where("fromDate", ">=", startTime)
        .where("fromDate", "<=", endTime)
        .where("publishStatus", "==", 1)
        .get();

      console.log(
        "In next 60 minutes Events Reminder Notification: " + allEvents.size
      );

      allEvents.forEach(function (eventDoc) {
        const event = eventDoc.data();
        return Notify.notifyDefault(
          eventDoc,
          //Diamond Boost - For Festivals
          //ToDo: Send notification to 1000 recent people or people who checked that week (subscribe), and not to all
          event.promotionPackage >= 40
            ? Constants.UserRoles.all
            : Constants.UserRoles.followers,
          Constants.Collections[Constants.Collections.events],
          Constants.eventBrand_edit_actions.event_reminder
        );
      });

      return "Success of All Event Reminder Notification";
    } catch (error) {
      console.error(error);
      return error;
    }
  });
