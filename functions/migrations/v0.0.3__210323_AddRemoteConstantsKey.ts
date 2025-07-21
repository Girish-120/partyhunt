import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "watiAuthorizationKey":"",
    "googleMapKeys":""
  }).then(()=>{
    console.log(`keys watiAuthorizationKey , googleMapKeys added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}