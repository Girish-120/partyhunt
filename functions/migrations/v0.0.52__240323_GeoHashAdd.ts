import { MigrateOptions } from "fireway";
//import * as Constants from "../src/Helpers/Constants"
import * as GeoFire from "geofire-common"
import IBatchUpdate from "../src/Library/Interfaces/DB/Transactions/batchUpdates";
import FirebaseTransaction from "../src/Library/Services/DB/FirebaseDB/Transaction/BatchUpdates";
export async function migrate({ firestore }: MigrateOptions) {
  console.log('migration started')
  const dbPlaceData = (await firestore.collection("places").get()).docs
  console.log('preparing place data')
  const dbPayload : any[] = []
  for(const map of dbPlaceData){
    const data = map.data()
    if(data.latLng!==undefined && data.idPlace!==undefined){
      const latitutude = data.latLng["_latitude"]
      const longitude = data.latLng["_longitude"]
      if(latitutude!==undefined && longitude!==undefined){
        const geoHash  = GeoFire.geohashForLocation([latitutude,longitude])
        dbPayload.push({
          idPlace:data.idPlace,
          geoHash:geoHash
        })
      }
    }
  }
  if(dbPayload.length>0){
    console.log(`updating place data for length ${dbPayload.length}`)
    console.log("watch place id changed",dbPayload[0].idPlace)
    let iBatchUpdates:IBatchUpdate
    iBatchUpdates= new FirebaseTransaction(firestore)
    console.log('starting batch updates')
    iBatchUpdates.BatchUpdate({
      payload:dbPayload,
      chunk:50,
      collectionName:"places",
      objectId:"idPlace"
    }).then(()=>{
      console.log("batch updates complete")
    }).catch(err=>{
      console.log(`error in batch updates : ${err}`)
    })
  }
}