import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "undergroundPlans":[{
       days:365,
       name:"Annual",
       price:1499,
       subtitle:"annual",
       discount:"60% OFF"
     },
     {
       days:30,
       name:"1 Month",
       price:699,
       subtitle:"1 Month",
       discount:"30% OFF"
     },
     {
       days:7,
       name:"1 Week",
       price:349,
       subtitle:"1 Week",
       discount:""
     }]
  }).then(()=>{
    console.log(`underground plans discount added`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}