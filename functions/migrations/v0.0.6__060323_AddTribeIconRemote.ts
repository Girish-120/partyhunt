import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "listTribes":[
        {
            googlePlacesFilter:"Goa, India",
            id:1,
            lat:15.386,
            lng:73.844,
            name:"goa",
            radius:90,
            strict:true,
            tribeIcon:""
        },
        {
            googlePlacesFilter:"Himachal Pradesh, India",
            id:2,
            lat:31.968213,
            lng:77.306771,
            name:"himachal",
            radius:360,
            strict:true,
            tribeIcon:""
        }
    ]
  }).then(()=>{
    console.log(`keys boostFeatures , boostPlans , listTribes added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}