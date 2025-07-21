import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "algoliaAPIkey":"",
    "algoliaID":""
  }).then(()=>{
    console.log(`algolia api key`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}