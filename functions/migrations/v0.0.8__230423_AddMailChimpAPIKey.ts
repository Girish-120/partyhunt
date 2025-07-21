import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "mailChimpApiKey":""
  }).then(()=>{
    console.log(`mail chimp api key added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}