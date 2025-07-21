import * as helperFunctions from "../../../Helpers/Functions";
import admin from "firebase-admin";
import ITransaction from "../../../Interfaces/DB/Transactions/batchUpdates";

class FirebaseTransaction implements ITransaction {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  BatchUpdate = async (data: {
    payload: any;
    chunk: number;
    collectionName: string;
    objectId: string;
  }) => {
    try {
      const dataBatches = helperFunctions.splitIntoChunk(
        data.payload,
        data.chunk
      );
      const dataRef = this.db.collection(data.collectionName);
      console.log(
        `start batch update for total batches: ${dataBatches.length}`
      );
      let batchCount = 1;

      for (const batchObject of dataBatches) {
        const batch = this.db.batch();
        console.log(
          `initiate batch update for index: ${batchCount} and count ${batchObject.length}`
        );
        let operationCount = 0;

        for (const item of batchObject) {
          if (item && item[data.objectId]) {
            const documentId = item[data.objectId];
            if (typeof documentId === "string" && documentId !== "") {
              const docRef = dataRef.doc(documentId);
              batch.update(docRef, item);
              operationCount++;
              console.log(
                `batch object id: ${documentId} updated index: ${operationCount}`
              );
            }
          } else {
            console.log(
              `Invalid document ID provided in item: ${JSON.stringify(item)}`
            );
          }
        }

        try {
          await batch.commit();
          console.log(`commit batch update index: ${batchCount}`);
        } catch (err) {
          // Handle document not found error
          if (
            (err as { code: number; message: string }).code === 5 &&
            (err as { code: number; message: string }).message.includes(
              "NOT_FOUND"
            )
          ) {
            console.log(
              `Error updating batch ${batchCount}: No document found`
            );
            // Handle the error as per your requirement (e.g., logging, skipping, or throwing an exception)
          } else {
            // Handle other errors
            console.log(`Error updating batch ${batchCount}: ${err}`);
            // Handle the error as per your requirement
          }
        }

        batchCount++;
      }

      console.log(`batch commit finished`);
    } catch (err) {
      throw err;
    }
  };
}

export default FirebaseTransaction;
