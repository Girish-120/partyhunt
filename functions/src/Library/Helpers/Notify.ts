import { messaging } from "firebase-admin";
import {
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot
} from "@google-cloud/firestore";
import { db } from "../..";
import * as Constants from "./Constants";

async function send_notification(
  fcmToken: string | string[],
  payload: messaging.MessagingPayload
) {
  try {
    if (fcmToken?.length > 0) {
      await messaging().sendToDevice(fcmToken, payload);
      console.log(
        "Successfully sent ",
        fcmToken?.length,
        " notifications:",
        payload
      );
    }
    // else
    //     console.log('No FCM token. User logged out.')
  } catch (error) {
    console.error(error);
  }
}

async function fetch_token(uid: String): Promise<any> {
  try {
    const userDoc = await db.doc(`users/${uid}`).get();
    let fcmToken;

    if (userDoc.exists) fcmToken = userDoc.data()?.fcmToken;

    return fcmToken;
  } catch (error) {
    console.error(error);
  }
}

//Notify Followers.
export const notify_users = async function (
  likesRefsArray: DocumentReference[],
  payload: messaging.MessagingPayload
) {
  if (likesRefsArray !== undefined) {
    //To fix an error
    try {
      const allTokens: string[] = [];
      for (const following of likesRefsArray) {
        if (following !== undefined) {
          //To fix an error
          const fcmToken = await fetch_token(following?.id);

          if (fcmToken?.length > 0) allTokens.push(fcmToken);
        }
      }
      await send_notification(allTokens, payload);
    } catch (error) {
      console.error(error);
    }
  }
};

//Notify Owner & Admin
export const notify_owner_and_editors = async function (
  event: DocumentData,
  payload: messaging.MessagingPayload
) {
  try {
    const listTokens: string[] = [];

    //ToDo: New Change to check if fcmToken is not null & not added already
    //If owner is admin or editors, then don't add
    const isEditor = await Constants.isEditorOrAdmin(event.ownerId);
    if (!isEditor) {
      const fcmTokenOwner = await fetch_token(event.ownerId);
      if (fcmTokenOwner?.length > 0)
        //&& !listTokens.includes(fcmTokenOwner)
        listTokens.push(fcmTokenOwner);
    }

    // Adding admin fcmToken
    // const fcmTokenAdmin = await fetch_token(Constants.uidAdmin)
    // if (fcmTokenAdmin)
    //     listTokens.push(fcmTokenAdmin)
    // Admin is already notified with editors
    await notify_editors(payload);
    await send_notification(listTokens, payload);
  } catch (error) {
    console.error(error);
  }
};

//Notify Editors
async function notify_editors(payload: messaging.MessagingPayload) {
  try {
    const constants = await Constants.Constants();
    const editorsEmails = constants?.editorEmailIds;
    const listEditors = await Constants.getUserRefs(editorsEmails);
    const notifyList: DocumentReference<DocumentData>[] = [];
    if (listEditors.length > 0) {
      listEditors.forEach((el) => {
        notifyList.push(el);
      });
    }
    //listEditors.push()
    return notify_users(notifyList, payload);
  } catch (error) {
    console.error(error);
  }
}

// function getListEditors() {
//     return Constants.uidEditors?.map(uid => db.collection("users").doc(uid))
// }

//Notify to emailIdList

export const notify_email_list = async function (
  payload: messaging.MessagingPayload,
  emailList: string[]
) {
  try {
    const emails = emailList;
    const listUsers = await Constants.getUserRefs(emails);
    const notifyList: DocumentReference<DocumentData>[] = [];
    if (listUsers.length > 0) {
      listUsers.forEach((el) => {
        notifyList.push(el);
      });
    }
    //listEditors.push()
    return notify_users(notifyList, payload);
  } catch (error) {
    console.error(error);
  }
};

//Notify Admin
export const notify_admin = async function (
  payload: messaging.MessagingPayload
) {
  try {
    const constants = await Constants.Constants();
    const adminEmails = constants?.adminEmailIds;
    const listAdmins = await Constants.getUserRefs(adminEmails);
    const notifyList: DocumentReference<DocumentData>[] = [];
    if (listAdmins.length > 0) {
      listAdmins.forEach((el) => {
        notifyList.push(el);
      });
    }
    //listEditors.push()
    return notify_users(notifyList, payload);
  } catch (error) {
    console.error(error);
  }
};

//Notify Topic
export const notify_topic = async function (
  payload: messaging.MessagingPayload,
  topic: string
) {
  try {
    await messaging().sendToTopic(topic, payload);
    console.log("Successfully sent notification to topic:", topic, payload);
  } catch (error) {
    console.error(error);
  }
};

export function notifyDefault(
  snap: QueryDocumentSnapshot,
  userRole: Constants.UserRoles,
  collectionId: string,
  suffix: string,
  tribe?: string
) {
  let payload: messaging.MessagingPayload = {};

  const docData = snap.data();
  if (collectionId === Constants.Collections[Constants.Collections.brands])
    payload = getPayload(
      docData?.category + ": " + docData?.name + suffix,
      docData?.shortBio,
      docData?.picture,
      "brand_reminder",
      collectionId,
      docData?.docId
    );
  else if (collectionId === Constants.Collections[Constants.Collections.events])
    payload = getPayload(
      docData?.eventName + suffix,
      "at " + docData?.placeData?.name,
      docData?.picture,
      "event_reminder",
      collectionId,
      docData?.docId
    );
  else if (collectionId === Constants.Collections[Constants.Collections.users])
    payload = getPayload(
      docData?.name,
      suffix,
      docData?.picture,
      "event_reminder",
      collectionId,
      docData?.docId
    );

  switch (userRole) {
    case Constants.UserRoles.admins:
      return notify_admin(payload);
    case Constants.UserRoles.editors:
      return notify_editors(payload);
    case Constants.UserRoles.followers:
      return notify_users(docData.likesRefsArray, payload);
    case Constants.UserRoles.owner:
      return notify_owner_and_editors(docData, payload);
    case Constants.UserRoles.all:
      return notify_topic(payload, Constants.fcm_topics.all_users);
    case Constants.UserRoles.tribe:
      Constants.fcm_topics
        .tribes(tribe)
        .then((tribes: any) => {
          if (tribes.length === 0 || tribes === undefined) {
            // sending to all user if tribes is undefiined or empty
            return notify_topic(payload, Constants.fcm_topics.all_users);
          } else {
            // send topic from first element of tribes
            return notify_topic(payload, tribes[0]);
          }
        })
        .catch((err) => {
          console.log(`An exception occured with error ${err}`);
          console.log(`sending all users in this case`);
          // sending to all user if exception occured
          return notify_topic(payload, Constants.fcm_topics.all_users);
        });
    default:
      return;
  }
}

export function getPayload(
  title: string,
  body: string,
  image: string,
  type: string,
  collection: string,
  docId: string
) {
  return {
    notification: {
      title: title,
      body: body,
      image: image ?? ""
    } as messaging.NotificationMessagePayload,
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      type: type,
      collection: collection,
      docId: docId,
      onMessage: title
    } as messaging.DataMessagePayload
    // fcmOptions: {} as messaging.MessagingOptions
  } as messaging.MessagingPayload;
}

// export const payload_analytics_notification = function (event: AnalyticsEvent, title: string) {
//     const geoInfo = event.user.geoInfo;
//     const notificationMessaging = {
//         title: title,//'You lost a user \uD83D\uDE1E',
//         body: `${event.user.deviceInfo.mobileModelName} from ${geoInfo.city}, ${geoInfo.country}`,
//     }

//     const payload = { notification: notificationMessaging }
//     return payload;
// };

// export const payload_user_created = function (user: DocumentData) {
//     const title = 'New User ';
//     const body = user['displayName'] + ' joined with ' + user['email'];
//     const payload = {
//         notification: {
//             title: title,
//             body: body,
//         },
//         data: {
//             // click_action: 'FLUTTER_NOTIFICATION_CLICK',
//             type: 'user_created',
//             onMessage: title + body,
//         }
//         to: "<FCM TOKEN>"
//     }

//     return payload;
// }
