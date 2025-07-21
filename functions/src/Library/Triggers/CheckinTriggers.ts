import ICheckins from "../Interfaces/DB/Checkins/Checkins";
import Checkins from "../Services/FirebaseDB/Checkins";
import * as Constants from "../Helpers/Constants";
import { db } from "../..";
import { getPayload, notify_email_list } from "../Helpers/Notify";

//Trigger when checkin is created
export const checkinsCreationTrigger = Constants.runTimeoutShort.firestore
  .document("checkins/{docId}")
  .onCreate(async function (snap, context) {
    const objectId = snap.id;
    const userId = snap.data().userId;
    const username = snap.data().userData.name;
    const eventId = snap.data().eventId;
    const eventName = snap.data().eventData.eventName;
    const placeId = snap.data().placeId;
    const checkInStatus = snap.data().status;
    let ownerEmails = [];
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (eventDoc.exists) {
      const eventData = eventDoc.data();
      ownerEmails.push(eventData?.ownerEmail);
      // send notification to event eventOwner
    }
    const placeDoc = await db.collection("places").doc(placeId).get();
    if (placeDoc.exists) {
      const placeData = placeDoc.data();
      const placeOwnerEmails = placeData?.listOwners;
      if (placeOwnerEmails !== undefined) {
        ownerEmails = [...ownerEmails, ...placeOwnerEmails];
      }
    }
    // Send notification to event owner and place owner
    const notificationPayload = getPayload(
      `New check-in`,
      `${username} just checked-in at ${eventName}`,
      "",
      "notification user check-in",
      "users",
      userId
    );
    notify_email_list(notificationPayload, ownerEmails)
      .then(() => {
        console.log(`notification sent to event owners`);
      })
      .catch((err) => {
        console.log(`error in sending notification with ${err}`);
      });
  });

//Trigger when checkin is updated
export const checkinsUpdateTrigger = Constants.runTimeoutLong.firestore
  .document("checkins/{docId}")
  .onUpdate(async (snap, context) => {
    const objectId = snap.after.id;
    const userId = snap.after.data().userId;
    const eventId = snap.after.data().eventId;
    const placeId = snap.after.data().placeId;

    const checkInStatusBefore = snap.before.data().status;
    const checkInStatusAfter = snap.after.data().status;

    console.log(`before status : ${checkInStatusBefore}`);
    console.log(`after status : ${checkInStatusAfter}`);
    if (
      (checkInStatusBefore < 0 || checkInStatusBefore === undefined) &&
      checkInStatusAfter >= 0
    ) {
      const iCheckins: ICheckins = new Checkins(db, snap.after);
      iCheckins
        .UpdateCheckins({
          objectId,
          userId,
          eventId,
          placeId
        })
        .then(() => {
          console.log("checking data updated successfully");
        })
        .catch((err) => {
          console.log(`error while updating checkin data : ${err}`);
        });
    }
    return null;
  });
