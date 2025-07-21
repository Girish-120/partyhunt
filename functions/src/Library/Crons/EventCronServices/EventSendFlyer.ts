import * as Constants from "../../Helpers/Constants";
import * as DateTimeUtils from "../../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import moment from "moment-timezone";
import * as functions from "firebase-functions";
import IMailSend from "../../Interfaces/SendMail";
import { db } from "../../..";
import SecretVariables from "../../Helpers/SecretVariables";
import BrevoMailSender from "../../Services/BrevoMail";

moment.tz.setDefault(Constants.timezone);

export const cron_send_event_flyer = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("30 10 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      const startTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        0,
        24,
        0
      ); //moment(now).subtract(25, "hours").toDate()
      const endTime = DateTimeUtils.addSubtractTime(
        firestore.Timestamp.now(),
        0,
        48,
        0
      ); //moment(firestore.Timestamp.now()).toDate()
      const allEvents = await db
        .collection("events")
        .where("fromDate", ">=", startTime)
        .where("fromDate", "<=", endTime)
        .where("publishStatus", "==", 1)
        .get();

      console.log(
        `starttime : ${startTime.toDate()} : endtime : ${endTime.toDate()}`
      );
      console.log(`total event : ${allEvents.docs.length} `);
      const listEventFlyrsAttachements: any[] = [];
      //const datarwt: any[] = [];
      const remoteConstant = await Constants.Constants();
      const remoteBoostPlans = remoteConstant?.boostPlans;
      allEvents.forEach(async function (eventDoc) {
        const event = eventDoc.data();
        // saving flyrs to the list
        if (remoteBoostPlans !== undefined && event.promotionPackage > 0) {
          let filePrefix = "";
          for (const b of remoteBoostPlans) {
            if (event.promotionPackage === b.code) {
              console.log(`boost type : ${event.promotionPackage}`);
              filePrefix = b.boostType;
            }
          }
          listEventFlyrsAttachements.push({
            filename: filePrefix + "_" + event.eventName + ".jpg",
            path: event.picture
          });
        }
      });
      console.log(`attachments length ${listEventFlyrsAttachements.length}`);
      console.log(`brevo api key ${SecretVariables.brevoMailApiKey}`);
      if (listEventFlyrsAttachements.length > 0) {
        // initializing email sender
        const IEmailer: IMailSend = new BrevoMailSender(SecretVariables.brevoMailApiKey);
        
        // Send Email to Social Media Manager with image attachement
        console.log(
          `env vars : from ${process.env.EMAIL_FROM} , to ${process.env.SOCIAL_MEDIA_MANAGER_EMAIL}`
        );
        IEmailer.SendEmail({
          attachments: listEventFlyrsAttachements,
          from: process.env.EMAIL_FROM,
          to: process.env.SOCIAL_MEDIA_MANAGER_EMAIL,
          text: `Hi ${process.env.SOCIAL_MEDIA_MANAGER_NAME}<br>
          <br>Please post story for instagram from the attached boosted events <br>
          from : ${startTime
            .toDate()
            .toLocaleDateString("en-GB", { timeZone: "UTC" })} <br>
          to : ${endTime
            .toDate()
            .toLocaleDateString("en-GB", { timeZone: "UTC" })}<br><br>
          Thanks`,
          subject: `Daily Reminder !! Boost Events Insta Story for ${startTime
            .toDate()
            .toLocaleDateString("en-GB", { timeZone: "UTC" })}`
        })
          .then((msg) => {
            console.log("sender message" + msg);
          })
          .catch((err) => {
            console.log(`mail chimp error : ${err}`);
          });
        return "Service complete";
      }
      return "Service complete";
    } catch (error) {
      console.error(error);
      return error;
    }
  });
