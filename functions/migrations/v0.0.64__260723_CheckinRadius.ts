import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "checkInRadius":100
  }).then(()=>{
    console.log(`checkin radius added in meters , defualt is 100 meters`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}