import { MigrateOptions } from "fireway";
import IBatchUpdate from "../src/Library/Interfaces/DB/Transactions/batchUpdates";
import FirebaseTransaction from "../src/Library/Services/DB/FirebaseDB/Transaction/BatchUpdates";

export async function migrate({ firestore }: MigrateOptions) {
  console.log("Skipping Migration: v0.0.53__230525_EventAddTribeToPlaceData");

  // const eventsDataSnapshot = await firestore.collection("events").get();
  // const dbPayload = eventsDataSnapshot.docs
  //   .map((snapshot) => snapshot.data())
  //   .filter((eventData) => {
  //     return (
  //       eventData.tribe !== undefined &&
  //       eventData.docId !== undefined &&
  //       eventData.placeData !== undefined
  //     );
  //   })
  //   .map((eventData) => {
  //     return {
  //       docId: eventData.docId,
  //       placeData: {
  //         ...eventData.placeData,
  //         tribe: eventData.tribe,
  //       },
  //     };
  //   });

  // if (dbPayload.length > 0) {
  //   const iBatchUpdates: IBatchUpdate = new FirebaseTransaction(firestore);
  //   console.log("Starting batch updates");

  //   try {
  //      iBatchUpdates.BatchUpdate({
  //       payload: dbPayload,
  //       chunk: 500,
  //       collectionName: "events",
  //       objectId: "docId",
  //     }).then(()=>{
  //       console.log("batch updates complete")
  //     }).catch(err=>{
  //       console.log(`error in batch updates : ${err}`)
  //     });
  //     console.log("Batch updates complete");
  //   } catch (err) {
  //     console.log(`Error in batch updates: ${err}`);
  //   }
  // }
}
