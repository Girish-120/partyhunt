"use strict";

import { db } from "../..";
import * as Constants from "../Helpers/Constants";
import * as Helpers from "../Helpers/Functions";
import * as DateTimeUtils from "../Helpers/DateTimeUtils";
import { firestore } from "firebase-admin"; //admin,
import Razorpay from "razorpay";
//import fetch from "node-fetch";
// import axios from 'axios';
import ZohoInvoice from "../Services/Zoho";
import IPayment from "../Interfaces/DB/Payments/payments";
import FirebaseDBPayment from "../Services/FirebaseDB/Payment";
import ITransaction from "../Interfaces/DB/Transactions/transaction";
import IWhatsNotification from "../Interfaces/WhatsAppNotification";
import SecretVariables from "../Helpers/SecretVariables";
import Wati from "../Services/Wati";

//Read Me: https://github.com/razorpay/razorpay-node#readme
//Razorpay Webhooks: https://razorpay.com/docs/webhooks/payloads/payments

async function get_rzp_object() {
  try {
    const constDoc = await db.doc(`remote/constants`).get();
    return new Razorpay({
      key_id: SecretVariables.razorpayLiveKey ?? "",
      key_secret: SecretVariables.razorpayLiveSecret ?? ""
    });
  } catch (err) {
    console.log("Error in getting RZP object");
    console.error(err);
    throw new Error('Failed to create Razorpay instance');
  }
}

function get_event_promotion_value(amount: number, remoteConstants: any) {
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
      const boostplanArray = boostPlans.filter((f: { price: number }) => {
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

function get_user_ug_payment_value(amount: number, remoteConstants: any) {
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
    const validDaysArray = underGroundPlans.filter((f: { price: number }) => {
      return f.price === amount;
    });
    if (validDaysArray !== undefined && validDaysArray.length > 0) {
      validDays = validDaysArray[0].days;
      subtitle = validDaysArray[0].subtitle;
    }
  }
  const dateStart = firestore.Timestamp.now();
  const dateExpiry = DateTimeUtils.addSubtractTime(dateStart, validDays, 0, 0);

  return { validDays, dateStart, dateExpiry, subtitle }; // add subtitle from remote constant
}

// Dev - https://console.cloud.google.com/functions/details/us-central1/webhook_razorpay_authorised
// Read Me - https://razorpay.com/docs/webhooks/payloads/payments
export const webhook_razorpay_authorised =
  Constants.runTimeoutLong.https.onRequest(async (_request, response) => {
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
      let watiWhatsappNumber: string;
      let watiName: string;
      let watiEmail: string;
      let watiProductDetails: string;
      let watiNote: string;

      let zohoUserObj: any;
      let zohoUserData: any;
      let zohoUserId: any;
      let zohoAmount: any;

      console.log(
        `request body ,payEntityObj.status : ${status} , ${payEntityObj.status} `
      );
      console.log(
        `status , user id , phone , email , paymentId : ${status} ${notesArray.userId},${number},${email}  ${paymentId}`
      );
      console.log("paymentId - " + paymentId);
      // console.log("amount - " + amount);
      // console.log("currency - " + currency);
      // console.log("status - " + status);
      // console.log("status entity - " + payEntityObj.status);
      const remoteConstants = await Constants.Constants();
      // calculate is underground true or not to mitigate the mismatched status

      // instantiating the payment interface and db class
      const iPayment: IPayment = new FirebaseDBPayment(db);
      // check the payment is event or user
      let isEvent = false;
      let isUG = false;
      // Data holder for payment record
      const xRazorPayEventId = _request.headers["x-razorpay-event-id"];
      const eventId = notesArray.eventId;
      const userId = notesArray.userId;
      let promotionPackage: any;
      let dateExpiryUG: any;
      let datePaidUG: any;
      let dateStartUG: any;
      let pricePaidUG: any;
      let validDaysUG: any;
      let tribe: any;

      if (remoteConstants !== undefined) {
        const iWhatsAppNotification: IWhatsNotification = new Wati(
          SecretVariables.watiAuthorizationKey,
          remoteConstants?.watiBaseUrl
        );
        if (status === "payment.authorized") {
          //authorized
          if (notesArray.eventId) {
            // Check for events duplicacy
            console.log("checking duplicate for events");
            const getPaymentEvent = await iPayment.GetPaymentEvent({
              userId: userId,
              eventId: notesArray.eventId,
              razorPayEventId: xRazorPayEventId
            });
            if (getPaymentEvent.isExist === true) {
              // record for x-razorpay-event-id already present :  duplicate events
              console.log(
                `found duplicate events for ${_request.headers["x-razorpay-event-id"]} already exists exiting gracefully`
              );
              response.status(200).send(getPaymentEvent.message);
              return;
            }
            //1. Updating EVENTS PROMOTION status
            const eventObj = await db.collection("events").doc(eventId).get();
            zohoUserObj = eventObj;
            const eventData = eventObj.data()!;
            zohoUserData = eventData;
            if (eventObj.exists) {
              console.log("there is no duplicate for event continuing update");
              validPayment = true;
              const promotionPackageValue = get_event_promotion_value(
                amount / 100,
                remoteConstants
              );
              await eventObj.ref.update({
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
              const userObj = await db.collection("users").doc(userId).get();
              const userData = userObj.data()!;
              if (userObj.exists) {
                await userObj.ref.update({
                  phone: number
                });
                // sending wati notification
                console.log(
                  `phone number is updated for the user after event boost : paymentId ${paymentId}`
                );
                watiWhatsappNumber = number;
                watiName = userData.name;
                watiEmail = isValidemail ? email : userData.email;
                watiNote = eventData.eventName;
                watiProductDetails = promotionPackageValue.boostType;
                tribe = userData.tribe;
                isEvent = true;
              }
              console.log(
                `Event promotion and publish : status updated : paymentId ${paymentId}`
              );
            } else {
              resp_msg = `Event promotion: already updated : paymentId ${paymentId}`;
              console.log(resp_msg);
              response.status(409).send(resp_msg);
              return;
            }
          } else {
            //1.a. Updating USER UG Membership status
            // userId = notesArray.userId;
            console.log("checking duplicate for UG payment");
            const getPaymentUser = await iPayment.GetPaymentUser({
              userId: userId,
              razorPayEventId: _request.headers["x-razorpay-event-id"]
            });
            if (getPaymentUser.isExist === true) {
              // record for x-razorpay-event-id already present :  duplicate events
              console.log(
                `found duplicate UG payment for ${paymentId} already exists exiting gracefully`
              );
              response.status(200).send(getPaymentUser.message);
              return;
            }
            zohoUserId = userId;
            const userObj = await db.collection("users").doc(userId).get();
            zohoUserObj = userObj;
            const userData = userObj.data()!;
            zohoUserData = userData;
            // checking user exists and isunderground to false
            if (userObj.exists) {
              console.log(
                "there is no duplicate for user ug payment continuing update"
              );
              validPayment = true;
              const amountINR = amount / 100;
              zohoAmount = amountINR;
              const ugPaymentValue = get_user_ug_payment_value(
                amountINR,
                remoteConstants
              );
              console.log(
                `User membership: status updating : paymentId ${paymentId}`
              );
              await userObj.ref.update({
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

              console.log(
                `User membership: status updated : paymentId ${paymentId}`
              );
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
            } else {
              resp_msg = `User do not exist ${paymentId} `;
              console.log(resp_msg);
              response.status(200).send(resp_msg);
              return;
            }
          }
          // 2. CAPTURE RZP PAYMENT
          const _rzp = await get_rzp_object();
          if (validPayment) {
            console.log(
              `Payment status: initialize capture : paymentId ${paymentId}`
            );
            _rzp.payments
              .capture(paymentId, amount, currency)
              .then((data: any) => {
                // success
                resp_msg = `Payment status: captured successfully : paymentId ${paymentId}`;
                console.log(resp_msg);
                // Creating new payment record
                const userRef = db.collection("users").doc(userId);
                //const zohoObject = new ZohoInvoice(remoteConstants,db,userRef)
                const iTransaction: ITransaction = new ZohoInvoice(remoteConstants, db, userRef);
                console.log(`transaction starts for zoho invoice`);
                iTransaction
                  .Transaction({
                    amountINR: zohoAmount,
                    notesArray: notesArray
                    // zohoAmount,
                    // notesArray
                  })
                  .then((zohoData: any) => {
                    console.log(`success invoice created`);
                    // save to payments database
                    console.log("creating new payment record");
                    if (isEvent) {
                      // creating event payment : -
                      console.log(
                        `creating event record for payment Id ${paymentId}`
                      );
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
                        .then((dataResp: any) => {
                          console.log(
                            dataResp.message + ` for payment Id ${paymentId}`
                          );
                        })
                        .catch((err: any) => {
                          console.log(
                            `error ocurred for event payment collection creation as ${err}`
                          );
                        });
                    }
                    if (isUG) {
                      // creating user payment : -
                      console.log(
                        `creating UG record for payment Id ${paymentId}`
                      );
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
                        .then((dataResponse: any) => {
                          console.log(
                            dataResponse.message +
                              ` for payment Id ${paymentId}`
                          );
                        })
                        .catch((err: any) => {
                          console.log(
                            `error ocurred for user payment collection creation as ${err}`
                          );
                        });
                    }
                  })
                  .catch((err: any) => {
                    console.log(`error occured for zoho transaction ${err}`);
                    if (isEvent) {
                      // creating event payment : -
                      console.log(
                        `creating event record for payment Id ${paymentId}`
                      );
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
                        .then((dataResponse: any) => {
                          console.log(
                            dataResponse.message +
                              ` for payment Id ${paymentId}`
                          );
                        })
                        .catch((zohoErr: any) => {
                          console.log(
                            `error ocurred for event payment collection creation as ${zohoErr}`
                          );
                        });
                    }
                    if (isUG) {
                      // creating user payment : -
                      console.log(
                        `creating UG record for payment Id ${paymentId}`
                      );
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
                        .then((dataResponse: any) => {
                          console.log(
                            dataResponse.message +
                              ` for payment Id ${paymentId}`
                          );
                        })
                        .catch((zohoErr: any) => {
                          console.log(
                            `error ocurred for user payment collection creation as ${zohoErr}`
                          );
                        });
                    }
                  });
                console.log("sending wati notification");
                iWhatsAppNotification
                  .SendNotificationPaymentSuccess(
                    watiWhatsappNumber,
                    watiName,
                    watiEmail,
                    watiProductDetails,
                    watiNote,
                    tribe
                  )
                  .then((wati_response) => {
                    if (wati_response) {
                      console.log(
                        `wati notification sent for ${watiNote}: paymentId ${paymentId}`
                      );
                    }
                  })
                  .catch((err: any) => {
                    console.log(`error ocurred as ${err}`);
                  });
                // Create Zoho invoice
                //console.log("Create Zoho invoice")

                response.send(resp_msg);
                return;
              })
              .catch((error: any) => {
                // error
                resp_msg = `Payment status: capture failed : paymentId ${paymentId}`;
                console.log(resp_msg);
                console.log(error);
                response.status(500).send(resp_msg);
                return;
              });
          } else {
            resp_msg = `Error: Invalid payment for given User, check userId info : paymentId ${paymentId}`;
            console.log(resp_msg);
            response.status(404).send(resp_msg);
            return;
          }
        } else if (status === "payment.captured") {
          //captured
          resp_msg = `Payment is already captured : paymentId ${paymentId}`;
          console.log(resp_msg);
          response.status(200).send(resp_msg);
          return;
        } else if (status === "payment.failed") {
          //failed
          resp_msg = `Payment is failed : paymentId ${paymentId}`;
          console.log(resp_msg);
          iWhatsAppNotification
            .SendNotificationPaymentFailure(number)
            .then((wati_response) => {
              if (wati_response) {
                console.log(
                  `wati notification sent for ${watiNote}: paymentId ${paymentId}`
                );
              }
            })
            .catch((err) => {
              console.log(`error ocurred as ${err}`);
            });
          response.status(200).send(resp_msg);
          return;
        } else {
          resp_msg = `Error: Not Authorised Payment : paymentId ${paymentId}`;
          console.log(resp_msg);
          response.status(404).send(resp_msg);
          return;
        }
      } else {
        resp_msg = `Error no remote constants defined : paymentId ${paymentId}`;
        console.log(resp_msg);
        response.status(500).send(resp_msg);
        return;
      }
      // TODO: status == failed >>  then do this. // send an email to customer.
    } catch (error) {
      console.error(error);
      console.log(`Error while capturing payment : paymentId ${paymentId}`);
      response.status(500).send(error);
      return;
    }
  });
