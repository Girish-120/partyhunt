import { MigrateOptions } from "fireway";
import IBatchUpdate from "../src/Library/Interfaces/DB/Transactions/batchUpdates";
import FirebaseTransaction from "../src/Library/Services/DB/FirebaseDB/Transaction/BatchUpdates";

export async function migrate({ firestore }: MigrateOptions) {
  console.log("Begin Migration: v0.0.60__070623_PlaceDataTribe");

  const placeDataSnapshot = await firestore.collection("places").get();
  const dbPayload = placeDataSnapshot.docs
    .map((snapshot) => snapshot.data())
    .filter((placeData) => {
      return placeData.state !== undefined && placeData.idPlace !== undefined;
    })
    .map((placeData) => {
      return {
        idPlace: placeData.idPlace,
        tribe: getTribeFromState(placeData.state),
      };
    });

  if (dbPayload.length > 0) {
    const iBatchUpdates: IBatchUpdate = new FirebaseTransaction(firestore);
    console.log("Starting batch updates");

    try {
      iBatchUpdates
        .BatchUpdate({
          payload: dbPayload,
          chunk: 500,
          collectionName: "places",
          objectId: "idPlace",
        })
        .then(() => {
          console.log("batch updates complete");
        })
        .catch((err) => {
          console.log(`error in batch updates : ${err}`);
        });
      console.log("Batch updates complete");
    } catch (err) {
      console.log(`Error in batch updates: ${err}`);
    }
  }
}

function getTribeFromState(state: string): string {
  // Logic to determine the tribe based on the state
  // Replace this with your actual logic
  if (state === "Goa") {
    return "goa";
  } else if (state === "Himachal Pradesh") {
    return "himachal";
  } else {
    return "Other";
  }
}
