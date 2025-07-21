import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "undergroundPlans":[{
       days:90,
       name:"3 Months",
       price:999,
       subtitle:"3-months"
     },
     {
       days:21,
       name:"3 Weeks",
       price:499,
       subtitle:"3-weeks"
     },
     {
       days:3,
       name:"3 Days",
       price:249,
       subtitle:"3-days"
     }]
  }).then(()=>{
    console.log(`underground plans changed`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}