import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "checkinOTP":"6174"
  }).then(()=>{
    console.log(`checkin otp added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}