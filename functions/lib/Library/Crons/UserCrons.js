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
exports.cron_retry_unfinished_invoices = exports.cron_underground_status_reset = exports.cron_daily_underground_users_count = void 0;
const Constants = __importStar(require("../Helpers/Constants"));
const functions = __importStar(require("firebase-functions"));
const __1 = require("../..");
const Notify = __importStar(require("../Helpers/Notify"));
const firebase_admin_1 = require("firebase-admin");
const Zoho_1 = __importDefault(require("../Services/Zoho"));
const Payment_1 = __importDefault(require("../Services/FirebaseDB/Payment"));
//Cron job every 3 days. Notify admin the total count of current underground subscribers.
exports.cron_daily_underground_users_count = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("every 72 hours") // '30 22 * * *' @ 22:30 PM
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUndergroundUsers = yield __1.db
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
        yield Notify.notify_admin(payload);
        return "Success of cron_daily_underground_users_count Notification";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
//Cron job every day at 1:00 AM. Reset expired underground users.
exports.cron_underground_status_reset = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 1 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = firebase_admin_1.firestore.Timestamp.now();
        // Fetch users which are still underground members but their plan expired
        const expiringUsers = yield __1.db
            .collection("users")
            .where("undergroundPayment.dateExpiry", "<=", now)
            .where("isUnderground", "==", true)
            .get();
        const usersCount = expiringUsers.size;
        console.log("Total Expired Underground Users Today: " + usersCount);
        const refExpiringUsers = [];
        for (const expiredUser of expiringUsers.docs) {
            // Reset Underground Membership
            yield expiredUser.ref.update({ isUnderground: false });
            refExpiringUsers.push(expiredUser.ref);
        }
        // Send notification to user about membership expiry
        const personalisePayload = {
            notification: {
                title: "Underground Subscription",
                body: "Your access to underground parties has been expired today"
            }
        };
        yield Notify.notify_users(refExpiringUsers, personalisePayload);
        // Send expired users count to admin
        const payload = {
            notification: {
                title: usersCount + " Underground Members",
                body: "Expired today"
            }
        };
        yield Notify.notify_admin(payload);
        return "Success of cron_underground_status_reset";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
// Cron Run every 23:00 to create invoice which are left in the payment collection for the previous day
exports.cron_retry_unfinished_invoices = functions
    .runWith(Constants.runTimeOptionsLong)
    .pubsub.schedule("00 23 * * *")
    .timeZone(Constants.timezone)
    .onRun((_context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //const startTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, -25, 0) //moment(now).subtract(25, "hours").toDate()
        //const endTime = DateTimeUtils.addSubtractTime(firestore.Timestamp.now(), 0, 0, 0) //moment(firestore.Timestamp.now()).toDate()
        const allpayments = yield __1.db
            .collection("payments")
            // .where("createdAt", ">=", startTime)
            // .where("createdAt", "<=", endTime)
            .where("isInvoice", "==", false)
            // .orderBy("fromDate") // Dev Mode
            // .limit(1) // Dev Mode
            .get();
        const remoteConstants = yield Constants.Constants();
        const iPayment = new Payment_1.default(__1.db);
        allpayments.forEach(function (paymentDoc) {
            return __awaiter(this, void 0, void 0, function* () {
                const payment = paymentDoc.data();
                const amount = payment.isUG
                    ? payment.ugPaymentInfo.pricePaid
                    : payment.eventBoost.pricePaid;
                const userId = payment.userId;
                const notesArray = payment.notesArray;
                const userRef = __1.db.collection("users").doc(userId);
                const iTransaction = new Zoho_1.default(remoteConstants, __1.db, userRef);
                const response = yield iTransaction.Transaction({
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
        });
        return "function returned";
    }
    catch (error) {
        console.error(error);
        return error;
    }
}));
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
//# sourceMappingURL=UserCrons.js.map