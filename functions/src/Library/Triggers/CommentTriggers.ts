// import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
import * as Constants from "../Helpers/Constants";
import * as Notify from "../Helpers/Notify";
import admin from "firebase-admin";
import { db } from "../..";

const fieldValue = admin.firestore.FieldValue;

// 'Comment Created' : Notify Editors & Owner
export const comment_created = Constants.runTimeoutShort.firestore
  .document("/{collectionId}/{docId}/comments_collection/{commentId}")
  .onCreate(async function (commentSnap, context) {
    const docId = context.params.docId;
    const collectionId = context.params.collectionId;

    try {
      const docSnap = await db.collection(collectionId).doc(docId).get();

      if (!docSnap.exists) {
        console.warn(`Document ${docId} in collection ${collectionId} does not exist.`);
        return;
      }

      const docData = docSnap.data()!;

      await db.collection(collectionId).doc(docId).update({
        commentsCount: fieldValue.increment(1)
      });

      const commentDoc = commentSnap.data();

      const payload = {
        notification: {
          title: `${commentDoc.userName} commented on your party`,
          body: commentDoc.comment,
          image: commentDoc.userPic
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          type: "event_reminder",
          collection: collectionId,
          docId,
          onMessage: `${commentDoc.userName} commented on your party - ${docData?.name}`
        }
      };

      console.log("Comment created: " + docId);
      return await Notify.notify_owner_and_editors(docData, payload);
    } catch (error) {
      console.error("Error processing comment_created trigger:", error);
      throw error; // You can handle this differently depending on your needs
    }
  });


// 'Comment Deleted'
export const comment_deleted = Constants.runTimeoutShort.firestore
  .document("/{collectionId}/{docId}/comments_collection/{commentId}")
  .onDelete(async function (_commentSnap, context) {
    try {
      const docId = context.params.docId;
      const collectionId = context.params.collectionId;

      await db
        .collection(collectionId)
        .doc(docId)
        .update({
          commentsCount: fieldValue.increment(-1)
        });

      console.log("Comment deleted: " + docId);
      return "Success of comment_deleted";
    } catch (error) {
      console.error(error);
      return error;
    }
    // return Notify.notify_owner_and_editors(docData, payload)
  });
