import { MigrateOptions } from "fireway";
import {v4 as uuidv4} from 'uuid';
export async function migrate({ firestore }: MigrateOptions) {
  // statusOfCheckIn : 
  //  wantToGo ( user is not in location but wants to go ) -2
  //  failed (user was is different location) -1
  //  or success (user checked in but not rewarded) 0
  //  or  rewarded ( user is underground user and has got the reward ) 1
  const docId = uuidv4()
  const sampleUserRef = await firestore.collection("users").
  where("email","==","cosmic.ankit@gmail.com").
  get()
  const user = sampleUserRef.docs[0].data()
  const eventUseRef = await firestore.collection("events").
  where("eventName","==","Open Jam").
  get()
  const event =eventUseRef.docs[0].data()
  await firestore.collection("checkins").doc(docId).create({
   userId:user.uid,
   userData:user,
   eventId:event.docId,
   eventData:event,
   placeId:event.placeData.idPlace,
   distance:0,
   createdAt:new Date(),
   updatedAt: new Date(),
   rewards:"Free Beer",
   userCheckinCount:0,
   eventCheckinCount:0,
   placeCheckinCount:0,
   latLng:event.placeData.latLng,
   status:-2
  }).then(()=>{
    console.log(`Checkin document added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}