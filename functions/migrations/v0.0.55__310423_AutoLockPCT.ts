import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  const remote = firestore.collection("remote").doc("constants").get()
  const tribeData = (await remote).data()?.listTribes
  for await(const item of tribeData){
    item.UGlockPct=25
  }
  await firestore.collection("remote").doc("constants").update({
    "listTribes":tribeData,
  }).then(()=>{
    console.log(`autolockpct for all tribes done`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}