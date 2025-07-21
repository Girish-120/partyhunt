import { RuntimeOptions, runWith, config } from "firebase-functions";
import { db } from "../..";
import { firestore } from "firebase-admin"; //admin,
import * as Helpers from "./Functions";

// Special
export const timezone = "Asia/Calcutta";

// Fetch the service account key JSON file contents
// const newLocal = 'event_reminder';
// export function projectKey() {
let projectKey: string = "dev";
if (process.env.GCLOUD_PROJECT === "partyhunt-production")
  //"party-hunt"
  projectKey = "prod";

console.log("Active Project Key: " + projectKey); //process.env
export { projectKey };
// }
// Get Firebase project id from `FIREBASE_CONFIG` environment variable
// const envProjectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;

// Environment Variables
const env = config().environment;
export const uidAdmin: string = env.uid_admin;
//export const uidEditors: [string] = env.uid_editors
export const spreadsheetId: string = env.spreadsheetid;

// Runtime Options
// export const runTimeOptionsExtraLong: RuntimeOptions = { timeoutSeconds: 540, memory: '8GB' }
export const runTimeOptionsLong: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: "4GB"
}; // 2GB
export const runTimeOptionsShort: RuntimeOptions = {
  timeoutSeconds: 180,
  memory: "1GB"
}; // 90, 512MB
export const runTimeoutLong = runWith(runTimeOptionsLong);
export const runTimeoutShort = runWith(runTimeOptionsShort);

// Enums
// TODO: admin->admins (from environment variable to remote constant)
export enum Collections {
  events,
  brands,
  places,
  users,
  comments,
  tag,
  checkins,
}
export enum UserRoles {
  admins,
  editors,
  followers,
  owner,
  tribe,
  all,
}
export enum PublishType {
  Cancelled = -2,
  Update,
  UnderReview,
  Published,
}
// enum EnumType { event_reminder='event_reminder',event_created='event_created'}

// Maps
export const eventBrand_edit_actions = {
  event_reminder: " is starting soon",
  eventBrand_created: " is created",
  eventBrand_deleted: " is deleted",
  eventBrand_published: " is approved and live", //on Party Hunt
  eventBrand_cancelled: " is cancelled",
  eventBrand_updated: " needs to be updated",
  eventBrand_under_review: " is under review",
  eventBrand_commented: " has a new comment"
  //event_updated: ' is updated',
  //event_promoted: ' is trending',
  //event_spammed: ' is reported spam'
};

export const analytics_events = {
  app_remove: "Lost a user",
  first_open: "Gained a user",
  user_created: "User Created"
};

export const fcm_topics = {
  all_users: "all",
  editors: "publishers_editors",
  non_editors: "publishers_non_editors",
  // tribes function accept optional parameter
  // if paramter tribe is undefined fetch all else fetch relevant tribe
  tribes: async function (tribe?: string) {
    const remoteConstants = await Constants();
    if (remoteConstants !== undefined) {
      if (
        remoteConstants.listTribes !== undefined &&
        remoteConstants.listTribes.length > 0
      ) {
        // if tribe is defined then fetch relevant tribe name
        if (tribe !== undefined) {
          return remoteConstants.listTribes
            .filter((f: { name: string }) => {
              // filter function to select relevant tribe
              return f.name === tribe;
            })
            .map((m: { name: any }) => {
              // return name key only which should topic name as well
              return m.name;
            });
        } else {
          return remoteConstants.listTribes.map((m: { name: any }) => {
            // return name key only which should topic name as well
            return m.name;
          });
        }
      } else {
        // returning empty if remote constants is never defined
        return [];
      }
    } else {
      // returning empty if remote constants is never defined
      return [];
    }
  }
};

export async function getUserIds(emailList: any) {
  let userDataContext: firestore.QuerySnapshot<firestore.DocumentData>;
  const userIdList = [];
  if (emailList.length > 0) {
    // break editorEmails upto upto 30 object
    const userEmailIdsBatches = Helpers.splitIntoChunk(emailList, 30);
    for await (const batch of userEmailIdsBatches) {
      console.log(`batch size length : ${batch.length}`);
      userDataContext = await db
        .collection(Collections[Collections.users])
        .where("email", "in", batch)
        .get();
      console.log(`db objects length: ${userDataContext.docs.length}`);
      userIdList.push(
        ...userDataContext.docs.map((m) => {
          return m.data().uid;
        })
      );
    }
  }
  return userIdList;
}

export async function getUserRefs(emailList: any) {
  let userDataContext: firestore.QuerySnapshot<firestore.DocumentData>;
  const userRefList = [];
  if (emailList.length > 0) {
    // break editorEmails upto upto 30 object
    const userEmailIdsBatches = Helpers.splitIntoChunk(emailList, 30);
    for await (const batch of userEmailIdsBatches) {
      console.log(`batch size length : ${batch.length}`);
      userDataContext = await db
        .collection(Collections[Collections.users])
        .where("email", "in", batch)
        .get();
      console.log(`db objects length: ${userDataContext.docs.length}`);
      userRefList.push(
        ...userDataContext.docs.map((m) => {
          return m.ref;
        })
      );
    }
  }
  return userRefList;
}

// TODO: s Add both editors and admin
export async function isEditorOrAdmin(uid: string) {
  const constants = await Constants();
  const adminEmails = constants?.adminEmailIds; // array of email  admins
  const editorEmails = constants?.editorEmailIds; // array of email  editors
  const adminidList = await getUserIds(adminEmails);
  const editoridList = await getUserIds(editorEmails);
  adminidList.push(...editoridList);
  return adminidList.includes(uid) || uidAdmin === uid;
}

export async function Constants() {
  const constants = await db.collection("remote").doc("constants").get();
  return constants.data();
}

// Can be used later

// export async function isAdmin(uid: string){
//   const constants =await Constants()
//   const adminEmails = constants?.adminEmailIds // array of admins
//   const adminList = await getUserIds(adminEmails)
//   return adminList.includes(uid) || uidAdmin === uid;
// }

// export async function isEditor(uid: string){
//   const constants =await Constants()
//   const editorEmails= constants?.editorEmailIds // array of editors
//   const editorList = await getUserIds(editorEmails)
//   return editorList.includes(uid);
// }
// export remote constants
