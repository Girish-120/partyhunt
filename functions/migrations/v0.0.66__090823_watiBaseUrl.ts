import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "watiBaseUrl":""
  }).then(()=>{
    console.log(`wati Base url added`);
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}