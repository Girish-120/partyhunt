import { MigrateOptions } from "fireway";

export async function migrate({ firestore }: MigrateOptions) {
  const collectionRef = firestore.collection("events");
  collectionRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.ref.update({ tribe: "goa" }).then(()=>{
        console.log("events tribe updated")
      }).catch(err=>{
        console.log(`error ocurred as ${err}`)
      });
    });
  }).catch(err=>{
    console.log(`error ocurred as ${err}`)
  });;
}
 