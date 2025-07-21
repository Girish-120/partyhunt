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
exports.webhook_razorpay_authorised = void 0;
const __1 = require("../..");
const Constants = __importStar(require("../Helpers/Constants"));
const Helpers = __importStar(require("../Helpers/Functions"));
const DateTimeUtils = __importStar(require("../Helpers/DateTimeUtils"));
const firebase_admin_1 = require("firebase-admin"); //admin,
const razorpay_1 = __importDefault(require("razorpay"));
//import fetch from "node-fetch";
// import axios from 'axios';
const Zoho_1 = __importDefault(require("../Services/Zoho"));
const Payment_1 = __importDefault(require("../Services/FirebaseDB/Payment"));
const SecretVariables_1 = __importDefault(require("../Helpers/SecretVariables"));
const Wati_1 = __importDefault(require("../Services/Wati"));
//Read Me: https://github.com/razorpay/razorpay-node#readme
//Razorpay Webhooks: https://razorpay.com/docs/webhooks/payloads/payments
function get_rzp_object() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const constDoc = yield __1.db.doc(`remote/constants`).get();
            return new razorpay_1.default({
                key_id: (_a = SecretVariables_1.default.razorpayLiveKey) !== null && _a !== void 0 ? _a : "",
                key_secret: (_b = SecretVariables_1.default.razorpayLiveSecret) !== null && _b !== void 0 ? _b : ""
            });
        }
        catch (err) {
            console.log("Error in getting RZP object");
            console.error(err);
            throw new Error('Failed to create Razorpay instance');
        }
    });
}
function get_event_promotion_value(amount, remoteConstants) {
    /*
    EVENT PROMOTION PAYMENT VALUES
    RULES FROM REMOTE
   */
    // Default
    let packageValue = 0;
    let boostType = "Basic";
    const boostPlans = remoteConstants.boostPlans;
    if (boostPlans !== undefined && boostPlans !== null) {
        if (boostPlans.length > 0) {
            const boostplanArray = boostPlans.filter((f) => {
                return f.price === amount;
            });
            if (boostplanArray !== undefined && boostplanArray.length > 0) {
                packageValue = boostplanArray[0].code;
                boostType = boostplanArray[0].boostType;
            }
        }
    }
    return { packageValue, boostType };
}
function get_user_ug_payment_value(amount, remoteConstants) {
    /*
    Fetch  from remote collection
    RULES FROM REMOTE
   */
    // const constDoc = await db.doc(`remote/constants`).get()
    // Monthly PACKAGE (DEFAULT)
    let validDays = 30;
    let subtitle = "monthly";
    // reading from remote constants
    const underGroundPlans = remoteConstants.undergroundPlans;
    if (underGroundPlans !== undefined && underGroundPlans.length > 0) {
        const validDaysArray = underGroundPlans.filter((f) => {
            return f.price === amount;
        });
        if (validDaysArray !== undefined && validDaysArray.length > 0) {
            validDays = validDaysArray[0].days;
            subtitle = validDaysArray[0].subtitle;
        }
    }
    const dateStart = firebase_admin_1.firestore.Timestamp.now();
    const dateExpiry = DateTimeUtils.addSubtractTime(dateStart, validDays, 0, 0);
    return { validDays, dateStart, dateExpiry, subtitle }; // add subtitle from remote constant
}
// Dev - https://console.cloud.google.com/functions/details/us-central1/webhook_razorpay_authorised
// Read Me - https://razorpay.com/docs/webhooks/payloads/payments
exports.webhook_razorpay_authorised = Constants.runTimeoutLong.https.onRequest((_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`payment update process starts`);
    console.log(`request header : ${JSON.stringify(_request.headers)}`);
    const payEntityObj = _request.body.payload.payment.entity;
    const paymentId = payEntityObj.id;
    try {
        const notesArray = payEntityObj.notes;
        const amount = payEntityObj.amount;
        const currency = payEntityObj.currency;
        const status = _request.body.event; //payEntityObj.status;
        const number = payEntityObj.contact;
        const name = "";
        let isValidemail = false;
        const email = payEntityObj.email;
        if (email !== "" || email !== null || email !== undefined) {
            // check email
            isValidemail = Helpers.CheckEmail(email);
        }
        let resp_msg;
        let validPayment;
        let watiWhatsappNumber;
        let watiName;
        let watiEmail;
        let watiProductDetails;
        let watiNote;
        let zohoUserObj;
        let zohoUserData;
        let zohoUserId;
        let zohoAmount;
        console.log(`request body ,payEntityObj.status : ${status} , ${payEntityObj.status} `);
        console.log(`status , user id , phone , email , paymentId : ${status} ${notesArray.userId},${number},${email}  ${paymentId}`);
        console.log("paymentId - " + paymentId);
        // console.log("amount - " + amount);
        // console.log("currency - " + currency);
        // console.log("status - " + status);
        // console.log("status entity - " + payEntityObj.status);
        const remoteConstants = yield Constants.Constants();
        // calculate is underground true or not to mitigate the mismatched status
        // instantiating the payment interface and db class
        const iPayment = new Payment_1.default(__1.db);
        // check the payment is event or user
        let isEvent = false;
        let isUG = false;
        // Data holder for payment record
        const xRazorPayEventId = _request.headers["x-razorpay-event-id"];
        const eventId = notesArray.eventId;
        const userId = notesArray.userId;
        let promotionPackage;
        let dateExpiryUG;
        let datePaidUG;
        let dateStartUG;
        let pricePaidUG;
        let validDaysUG;
        let tribe;
        if (remoteConstants !== undefined) {
            const iWhatsAppNotification = new Wati_1.default(SecretVariables_1.default.watiAuthorizationKey, remoteConstants === null || remoteConstants === void 0 ? void 0 : remoteConstants.watiBaseUrl);
            if (status === "payment.authorized") {
                //authorized
                if (notesArray.eventId) {
                    // Check for events duplicacy
                    console.log("checking duplicate for events");
                    const getPaymentEvent = yield iPayment.GetPaymentEvent({
                        userId: userId,
                        eventId: notesArray.eventId,
                        razorPayEventId: xRazorPayEventId
                    });
                    if (getPaymentEvent.isExist === true) {
                        // record for x-razorpay-event-id already present :  duplicate events
                        console.log(`found duplicate events for ${_request.headers["x-razorpay-event-id"]} already exists exiting gracefully`);
                        response.status(200).send(getPaymentEvent.message);
                        return;
                    }
                    //1. Updating EVENTS PROMOTION status
                    const eventObj = yield __1.db.collection("events").doc(eventId).get();
                    zohoUserObj = eventObj;
                    const eventData = eventObj.data();
                    zohoUserData = eventData;
                    if (eventObj.exists) {
                        console.log("there is no duplicate for event continuing update");
                        validPayment = true;
                        const promotionPackageValue = get_event_promotion_value(amount / 100, remoteConstants);
                        yield eventObj.ref.update({
                            promotion: true, //Comment this maybe - unnecessary
                            promotionPackage: promotionPackageValue.packageValue,
                            publishStatus: 1, // changing the publish status
                            "boostPayment.updatedBy:": "webhook"
                        });
                        promotionPackage = promotionPackageValue.packageValue;
                        // updating user number
                        //const userId = notesArray.userId;
                        zohoUserId = userId;
                        zohoAmount = amount / 100;
                        const userObj = yield __1.db.collection("users").doc(userId).get();
                        const userData = userObj.data();
                        if (userObj.exists) {
                            yield userObj.ref.update({
                                phone: number
                            });
                            // sending wati notification
                            console.log(`phone number is updated for the user after event boost : paymentId ${paymentId}`);
                            watiWhatsappNumber = number;
                            watiName = userData.name;
                            watiEmail = isValidemail ? email : userData.email;
                            watiNote = eventData.eventName;
                            watiProductDetails = promotionPackageValue.boostType;
                            tribe = userData.tribe;
                            isEvent = true;
                        }
                        console.log(`Event promotion and publish : status updated : paymentId ${paymentId}`);
                    }
                    else {
                        resp_msg = `Event promotion: already updated : paymentId ${paymentId}`;
                        console.log(resp_msg);
                        response.status(409).send(resp_msg);
                        return;
                    }
                }
                else {
                    //1.a. Updating USER UG Membership status
                    // userId = notesArray.userId;
                    console.log("checking duplicate for UG payment");
                    const getPaymentUser = yield iPayment.GetPaymentUser({
                        userId: userId,
                        razorPayEventId: _request.headers["x-razorpay-event-id"]
                    });
                    if (getPaymentUser.isExist === true) {
                        // record for x-razorpay-event-id already present :  duplicate events
                        console.log(`found duplicate UG payment for ${paymentId} already exists exiting gracefully`);
                        response.status(200).send(getPaymentUser.message);
                        return;
                    }
                    zohoUserId = userId;
                    const userObj = yield __1.db.collection("users").doc(userId).get();
                    zohoUserObj = userObj;
                    const userData = userObj.data();
                    zohoUserData = userData;
                    // checking user exists and isunderground to false
                    if (userObj.exists) {
                        console.log("there is no duplicate for user ug payment continuing update");
                        validPayment = true;
                        const amountINR = amount / 100;
                        zohoAmount = amountINR;
                        const ugPaymentValue = get_user_ug_payment_value(amountINR, remoteConstants);
                        console.log(`User membership: status updating : paymentId ${paymentId}`);
                        yield userObj.ref.update({
                            isUnderground: true,
                            "undergroundPayment.validDays": ugPaymentValue.validDays,
                            "undergroundPayment.dateStart": ugPaymentValue.dateStart,
                            "undergroundPayment.dateExpiry": ugPaymentValue.dateExpiry,
                            "undergroundPayment.datePaid": ugPaymentValue.dateStart,
                            "undergroundPayment.pricePaid": amountINR,
                            "undergroundPayment.paymentID": paymentId,
                            "undergroundPayment.updatedBy:": "webhook",
                            phone: number
                        });
                        validDaysUG = ugPaymentValue.validDays;
                        dateStartUG = ugPaymentValue.dateStart;
                        dateExpiryUG = ugPaymentValue.dateExpiry;
                        datePaidUG = ugPaymentValue.dateStart;
                        pricePaidUG = amountINR;
                        console.log(`User membership: status updated : paymentId ${paymentId}`);
                        // setting  wati variables
                        watiWhatsappNumber = number;
                        watiName = userData.name;
                        watiEmail = isValidemail ? email : userData.email;
                        watiProductDetails = ugPaymentValue.subtitle;
                        watiNote = "UNDERGROUND MEMBERSHIP";
                        watiName = userData.name;
                        tribe = userData.tribe;
                        // making isUg to true
                        isUG = true;
                    }
                    else {
                        resp_msg = `User do not exist ${paymentId} `;
                        console.log(resp_msg);
                        response.status(200).send(resp_msg);
                        return;
                    }
                }
                // 2. CAPTURE RZP PAYMENT
                const _rzp = yield get_rzp_object();
                if (validPayment) {
                    console.log(`Payment status: initialize capture : paymentId ${paymentId}`);
                    _rzp.payments
                        .capture(paymentId, amount, currency)
                        .then((data) => {
                        // success
                        resp_msg = `Payment status: captured successfully : paymentId ${paymentId}`;
                        console.log(resp_msg);
                        // Creating new payment record
                        const userRef = __1.db.collection("users").doc(userId);
                        //const zohoObject = new ZohoInvoice(remoteConstants,db,userRef)
                        const iTransaction = new Zoho_1.default(remoteConstants, __1.db, userRef);
                        console.log(`transaction starts for zoho invoice`);
                        iTransaction
                            .Transaction({
                            amountINR: zohoAmount,
                            notesArray: notesArray
                            // zohoAmount,
                            // notesArray
                        })
                            .then((zohoData) => {
                            console.log(`success invoice created`);
                            // save to payments database
                            console.log("creating new payment record");
                            if (isEvent) {
                                // creating event payment : -
                                console.log(`creating event record for payment Id ${paymentId}`);
                                iPayment
                                    .CreatePaymentEvent({
                                    userId: userId,
                                    eventId: eventId,
                                    razorPayEventId: xRazorPayEventId,
                                    razorPayStatus: "captured",
                                    promotionPackage: promotionPackage,
                                    pricePaid: zohoAmount,
                                    paymentId: paymentId,
                                    tribe: tribe,
                                    updatedBy: "webhook",
                                    isInvoice: zohoData.success,
                                    notesArray: notesArray,
                                    invoice: zohoData.success ? zohoData.data : undefined
                                })
                                    .then((dataResp) => {
                                    console.log(dataResp.message + ` for payment Id ${paymentId}`);
                                })
                                    .catch((err) => {
                                    console.log(`error ocurred for event payment collection creation as ${err}`);
                                });
                            }
                            if (isUG) {
                                // creating user payment : -
                                console.log(`creating UG record for payment Id ${paymentId}`);
                                iPayment
                                    .CreatePaymentUser({
                                    userId: userId,
                                    razorPayEventId: xRazorPayEventId,
                                    razorPayStatus: "captured",
                                    dateExpiry: dateExpiryUG,
                                    datePaid: datePaidUG,
                                    dateStart: dateStartUG,
                                    orderId: paymentId,
                                    paymentId: paymentId,
                                    pricePaid: pricePaidUG,
                                    updatedBy: "webhook",
                                    tribe: tribe,
                                    validDays: validDaysUG,
                                    isInvoice: zohoData.success,
                                    notesArray: notesArray,
                                    invoice: zohoData.success ? zohoData.data : undefined
                                })
                                    .then((dataResponse) => {
                                    console.log(dataResponse.message +
                                        ` for payment Id ${paymentId}`);
                                })
                                    .catch((err) => {
                                    console.log(`error ocurred for user payment collection creation as ${err}`);
                                });
                            }
                        })
                            .catch((err) => {
                            console.log(`error occured for zoho transaction ${err}`);
                            if (isEvent) {
                                // creating event payment : -
                                console.log(`creating event record for payment Id ${paymentId}`);
                                iPayment
                                    .CreatePaymentEvent({
                                    userId: userId,
                                    eventId: eventId,
                                    razorPayEventId: xRazorPayEventId,
                                    razorPayStatus: "captured",
                                    promotionPackage: promotionPackage,
                                    pricePaid: zohoAmount,
                                    paymentId: paymentId,
                                    tribe: tribe,
                                    updatedBy: "webhook",
                                    isInvoice: false,
                                    notesArray: notesArray,
                                    invoice: undefined
                                })
                                    .then((dataResponse) => {
                                    console.log(dataResponse.message +
                                        ` for payment Id ${paymentId}`);
                                })
                                    .catch((zohoErr) => {
                                    console.log(`error ocurred for event payment collection creation as ${zohoErr}`);
                                });
                            }
                            if (isUG) {
                                // creating user payment : -
                                console.log(`creating UG record for payment Id ${paymentId}`);
                                iPayment
                                    .CreatePaymentUser({
                                    userId: userId,
                                    razorPayEventId: xRazorPayEventId,
                                    razorPayStatus: "captured",
                                    dateExpiry: dateExpiryUG,
                                    datePaid: datePaidUG,
                                    dateStart: dateStartUG,
                                    orderId: paymentId,
                                    paymentId: paymentId,
                                    pricePaid: pricePaidUG,
                                    updatedBy: "webhook",
                                    tribe: tribe,
                                    validDays: validDaysUG,
                                    isInvoice: false,
                                    notesArray: notesArray,
                                    invoice: undefined
                                })
                                    .then((dataResponse) => {
                                    console.log(dataResponse.message +
                                        ` for payment Id ${paymentId}`);
                                })
                                    .catch((zohoErr) => {
                                    console.log(`error ocurred for user payment collection creation as ${zohoErr}`);
                                });
                            }
                        });
                        console.log("sending wati notification");
                        iWhatsAppNotification
                            .SendNotificationPaymentSuccess(watiWhatsappNumber, watiName, watiEmail, watiProductDetails, watiNote, tribe)
                            .then((wati_response) => {
                            if (wati_response) {
                                console.log(`wati notification sent for ${watiNote}: paymentId ${paymentId}`);
                            }
                        })
                            .catch((err) => {
                            console.log(`error ocurred as ${err}`);
                        });
                        // Create Zoho invoice
                        //console.log("Create Zoho invoice")
                        response.send(resp_msg);
                        return;
                    })
                        .catch((error) => {
                        // error
                        resp_msg = `Payment status: capture failed : paymentId ${paymentId}`;
                        console.log(resp_msg);
                        console.log(error);
                        response.status(500).send(resp_msg);
                        return;
                    });
                }
                else {
                    resp_msg = `Error: Invalid payment for given User, check userId info : paymentId ${paymentId}`;
                    console.log(resp_msg);
                    response.status(404).send(resp_msg);
                    return;
                }
            }
            else if (status === "payment.captured") {
                //captured
                resp_msg = `Payment is already captured : paymentId ${paymentId}`;
                console.log(resp_msg);
                response.status(200).send(resp_msg);
                return;
            }
            else if (status === "payment.failed") {
                //failed
                resp_msg = `Payment is failed : paymentId ${paymentId}`;
                console.log(resp_msg);
                iWhatsAppNotification
                    .SendNotificationPaymentFailure(number)
                    .then((wati_response) => {
                    if (wati_response) {
                        console.log(`wati notification sent for ${watiNote}: paymentId ${paymentId}`);
                    }
                })
                    .catch((err) => {
                    console.log(`error ocurred as ${err}`);
                });
                response.status(200).send(resp_msg);
                return;
            }
            else {
                resp_msg = `Error: Not Authorised Payment : paymentId ${paymentId}`;
                console.log(resp_msg);
                response.status(404).send(resp_msg);
                return;
            }
        }
        else {
            resp_msg = `Error no remote constants defined : paymentId ${paymentId}`;
            console.log(resp_msg);
            response.status(500).send(resp_msg);
            return;
        }
        // TODO: status == failed >>  then do this. // send an email to customer.
    }
    catch (error) {
        console.error(error);
        console.log(`Error while capturing payment : paymentId ${paymentId}`);
        response.status(500).send(error);
        return;
    }
}));
//# sourceMappingURL=PaymentTriggers.js.map