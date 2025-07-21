import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  const remote = firestore.collection("remote").doc("constants").get()
  const undergroundPlans = (await remote).data()?.undergroundPlans;
  if(undergroundPlans!==undefined && undergroundPlans.length>0){
    undergroundPlans.push(
        {
            days:365,
            name:"Annual",
            price:1499,
            subtitle:"annual"
        }
    )
    undergroundPlans.sort((a: { price: number; }, b: { price: number; }) => b.price - a.price);
    // sort the list 

  }
  await firestore.collection("remote").doc("constants").update({
    "undergroundPlans":undergroundPlans,
  }).then(()=>{
    console.log(`annual plan added to underground plans`);
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}