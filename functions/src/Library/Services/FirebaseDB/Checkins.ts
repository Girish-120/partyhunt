import admin, { firestore } from "firebase-admin";
import ICheckins from "../../Interfaces/DB/Checkins/Checkins";
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
import * as Constants from "../../Helpers/Constants";
class Checkins implements ICheckins {
  private db: admin.firestore.Firestore;
  private snap: QueryDocumentSnapshot;
  constructor(db: admin.firestore.Firestore, snap: QueryDocumentSnapshot) {
    this.db = db;
    this.snap = snap;
  }
  UpdateCheckins = async (data: {
    objectId: string;
    userId: string;
    eventId: string;
    placeId: string;
  }) => {
    //const user= await this.db.collection("users").doc(userId).get()
    try {
      const userRef = await this.db
        .collection(Constants.Collections[Constants.Collections.users])
        .doc(data.userId)
        .get();
      const userData = userRef.data();
      const eventRef = await this.db
        .collection(Constants.Collections[Constants.Collections.events])
        .doc(data.eventId)
        .get();
      const eventData = eventRef.data();
      const placeRef = await this.db
        .collection(Constants.Collections[Constants.Collections.places])
        .doc(data.placeId)
        .get();
      const placeData = placeRef.data();
      let totalChekinUser = 0;
      let totalCheckinEvent = 0;
      let totalCheckinPlace = 0;
      if (userData?.totalCheckin === undefined) {
        totalChekinUser = 1;
      } else {
        totalChekinUser = userData?.totalCheckin + 1;
      }
      if (eventData?.totalCheckin === undefined) {
        totalCheckinEvent = 1;
      } else {
        totalCheckinEvent = eventData?.totalCheckin + 1;
      }
      if (placeData?.totalCheckin === undefined) {
        totalCheckinPlace = 1;
      } else {
        totalCheckinPlace = placeData?.totalCheckin + 1;
      }

      // updating the docId of the checkin document and count user checkin ,  event checkin an place checkin
      this.snap.ref
        .update({
          docId: data.objectId,
          userCheckinCount: totalChekinUser,
          eventCheckinCount: totalCheckinEvent,
          placeCheckinCount: totalCheckinPlace
        })
        .then(() => {
          console.log(`checkin data is updated`);
        })
        .catch((err) => {
          console.log(`there was an error : ${err}`);
        });

      // Updating user
      if (userData?.eventCheckinList === undefined) {
        userRef.ref
          .update({
            totalCheckin: totalChekinUser,
            eventCheckinList: [data.eventId]
          })
          .then(() => {
            console.log(`user checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      } else {
        userRef.ref
          .update({
            totalCheckin: totalChekinUser,
            eventCheckinList: firestore.FieldValue.arrayUnion(data.eventId)
          })
          .then(() => {
            console.log(`user checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      }
      // Updating event
      if (eventData?.userCheckinList === undefined) {
        eventRef.ref
          .update({
            totalCheckin: totalCheckinEvent,
            userCheckinList: [data.userId]
          })
          .then(() => {
            console.log(`user checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      } else {
        eventRef.ref
          .update({
            totalCheckin: totalCheckinEvent,
            userCheckinList: firestore.FieldValue.arrayUnion(data.userId)
          })
          .then(() => {
            console.log(`event checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      }
      if (placeData?.userCheckinList === undefined) {
        placeRef.ref
          .update({
            totalCheckin: totalCheckinPlace,
            userCheckinList: [data.userId]
          })
          .then(() => {
            console.log(`place checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      } else {
        placeRef.ref
          .update({
            totalCheckin: totalCheckinPlace,
            userCheckinList: firestore.FieldValue.arrayUnion(data.userId)
          })
          .then(() => {
            console.log(`place checkin data is updated`);
          })
          .catch((err) => {
            console.log(`there was an error : ${err}`);
          });
      }

      return true;
    } catch (err) {
      throw err;
    }
  };
}
export default Checkins;
