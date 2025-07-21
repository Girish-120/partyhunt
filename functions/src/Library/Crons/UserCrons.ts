import * as Constants from "../Helpers/Constants";
import * as functions from "firebase-functions";
import { db } from "../..";
import * as Notify from "../Helpers/Notify";
import { firestore } from "firebase-admin";
import * as DateTimeUtils from "../Helpers/DateTimeUtils";
import ZohoInvoice from "../Services/Zoho";
import IPayment from "../Interfaces/DB/Payments/payments";
import FirebaseDBPayment from "../Services/FirebaseDB/Payment";
import ITransaction from "../Interfaces/DB/Transactions/transaction";

//Cron job every 3 days. Notify admin the total count of current underground subscribers.
export const cron_daily_underground_users_count = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("every 72 hours") // '30 22 * * *' @ 22:30 PM
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      const allUndergroundUsers = await db
        .collection("users")
        .where("isUnderground", "==", true)
        .get();

      const usersCount = allUndergroundUsers.docs.length;
      console.log("Total Underground Users: " + usersCount);

      const payload = {
        notification: {
          title: usersCount + "Underground Users",
          body: "Total count of underground users today"
        }
      };

      await Notify.notify_admin(payload);
      return "Success of cron_daily_underground_users_count Notification";
    } catch (error) {
      console.error(error);
      return error;
    }
  });

//Cron job every day at 1:00 AM. Reset expired underground users.
export const cron_underground_status_reset = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("00 1 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      const now = firestore.Timestamp.now();

      // Fetch users which are still underground members but their plan expired
      const expiringUsers = await db
        .collection("users")
        .where("undergroundPayment.dateExpiry", "<=", now)
        .where("isUnderground", "==", true)
        .get();

      const usersCount = expiringUsers.size;
      console.log("Total Expired Underground Users Today: " + usersCount);

      const refExpiringUsers = [];

      for (const expiredUser of expiringUsers.docs) {
        // Reset Underground Membership
        await expiredUser.ref.update({ isUnderground: false });
        refExpiringUsers.push(expiredUser.ref);
      }

      // Send notification to user about membership expiry
      const personalisePayload = {
        notification: {
          title: "Underground Subscription",
          body: "Your access to underground parties has been expired today"
        }
      };

      await Notify.notify_users(refExpiringUsers, personalisePayload);

      // Send expired users count to admin
      const payload = {
        notification: {
          title: usersCount + " Underground Members",
          body: "Expired today"
        }
      };

      await Notify.notify_admin(payload);

      return "Success of cron_underground_status_reset";
    } catch (error) {
      console.error(error);
      return error;
    }
  });


// Cron Run every 23:00 to create invoice which are left in the payment collection for the previous day
export const cron_retry_unfinished_invoices = functions
  .runWith(Constants.runTimeOptionsLong)
  .pubsub.schedule("00 23 * * *")
  .timeZone(Constants.timezone)
  .onRun(async (_context) => {
    try {
      //const startTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, -25, 0) //moment(now).subtract(25, "hours").toDate()
      //const endTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, 0, 0) //moment(firestore.Timestamp.now()).toDate()

      const allpayments = await db
        .collection("payments")
        // .where("createdAt", ">=", startTime)
        // .where("createdAt", "<=", endTime)
        .where("isInvoice", "==", false)
        // .orderBy("fromDate") // Dev Mode
        // .limit(1) // Dev Mode
        .get();
      const remoteConstants = await Constants.Constants();
      const iPayment: IPayment = new FirebaseDBPayment(db);
      allpayments.forEach(async function (paymentDoc) {
        const payment = paymentDoc.data();
        const amount = payment.isUG
          ? payment.ugPaymentInfo.pricePaid
          : payment.eventBoost.pricePaid;
        const userId = payment.userId;
        const notesArray = payment.notesArray;
        const userRef = db.collection("users").doc(userId);
        const iTransaction: ITransaction = new ZohoInvoice(remoteConstants, db, userRef);
        const response = await iTransaction.Transaction({
          amountINR: amount,
          notesArray: notesArray
        });
        if (response.success) {
          // Update the DB only after success
          const invoice = {
            date: response.data["zoho.invoice.date"],
            gstNo: response.data["zoho.invoice.gstNo"],
            gstTreatment: response.data["zoho.invoice.gstTreatment"],
            invoiceId: response.data["zoho.invoice.invoiceId"],
            invoiceNumber: response.data["zoho.invoice.invoiceNumber"],
            placeOfSupply: response.data["zoho.invoice.placeOfSupply"],
            subTotal: response.data["zoho.invoice.subTotal"],
            taxSpecification: response.data["zoho.invoice.taxSpecification"],
            taxTotal: response.data["zoho.invoice.taxTotal"],
            total: response.data["zoho.invoice.total"]
          };
          // Updating payemnts asynchronously
          iPayment
            .UpdatePayment(payment.pId, {
              isInvoice: true,
              invoice: invoice
            })
            .then(() => {
              console.log(`user updated with pId ${payment.pId}`);
            })
            .catch((err) => {
              console.log(`error while updating payments ${err}`);
            });
        }
        return;
      });
      return "function returned";
    } catch (error) {
      console.error(error);
      return error;
    }
  });



// Set 21st Dec 2021 if no expiry
// Just for initial subscribers to set dateExpiry
// const noExpiryUsers = await db.collection("users")
//   .where("isUnderground", '==', true)
//   .where("undergroundPayment.dateExpiry", "<=", moment(now).toDate())
//   // .orderBy("undergroundPayment.dateExpiry")
//   .get()

// console.log('Total Underground Users without dateExpiry: ' + noExpiryUsers.size)

// for (const noExpiryUser of noExpiryUsers.docs) {
//   const expiryDate = noExpiryUser.data().undergroundPayment.dateExpiry ?? null

//   if (expiryDate === null)
//     await noExpiryUser.ref.update({
//       "undergroundPayment.dateExpiry": moment(now).add(365, "days").toDate()
//     })
// }