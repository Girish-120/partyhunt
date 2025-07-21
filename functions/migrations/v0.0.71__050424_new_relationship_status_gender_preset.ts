import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "launchAlert":{
        'text':`Party Hunt website 
        launched. Click on Check now and explore more.`,
        'url':'https://partyhunt.com'
    },
  }).then(()=>{
    console.log(`relationshipStatus and gender defined`);
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}