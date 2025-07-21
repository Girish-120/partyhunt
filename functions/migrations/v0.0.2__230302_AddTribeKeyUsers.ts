import { MigrateOptions } from "fireway";

export async function migrate({ firestore }: MigrateOptions) {
  const collectionRef = firestore.collection("users");
  collectionRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.ref.update({ tribe: "goa" }).then(()=>{
        console.log("user tribe updated")
      }).catch(err=>{
        console.log(`error ocurred as ${err}`)
      });;
    });
  }).catch(err=>{
    console.log(`error ocurred as ${err}`)
  });
}
