import { MigrateOptions } from "fireway";
import admin from "firebase-admin";
import fs from "fs";
import path from "path"

export async function migrate({ firestore }: MigrateOptions) {
    
    let credFile:string
    let projectId:string 
    let storageBucket:string
    credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS!==undefined?process.env.GOOGLE_APPLICATION_CREDENTIALS:""
    projectId = process.env.FIREBASE_APP_PROJECT_ID!==undefined?process.env.FIREBASE_APP_PROJECT_ID:""
    storageBucket = process.env.FIREBASE_APP_STORAGE_BUCKET!==undefined?process.env.FIREBASE_APP_STORAGE_BUCKET:""

    fs.readFile(credFile,'utf8',async  (err, data)=>{
      if (err) {
        console.error(err);
        return;
      }


      const jsonData = JSON.parse(data);
       // console.log(jsonData);
        admin.initializeApp({
            credential: admin.credential.cert(jsonData),
            projectId: projectId,
            storageBucket: storageBucket,
          });
        //  const bucket = getStorage().bucket();
        const fileName = "PH_Bangalore_tribe.svg"
        const bucketBangalore =admin.storage().bucket();    
        const fileBangalore = path.join(__dirname,"assets/tribeIcons/bangalore/"+fileName);
        const storageFilePathPune = "icons/tribeIcons/bangalore/"+fileName
        const bucketFileBangalore =bucketBangalore.file(storageFilePathPune);

       
        await bucketBangalore.upload(fileBangalore,{
            metadata: {
                contentType: 'image/svg+xml',
              },
              destination:storageFilePathPune
              
        })
       
        const bangaloreRemoteUrl=await bucketFileBangalore.getSignedUrl({
            action: 'read',
            expires: '03-17-2050'
        })


      const remote = firestore.collection("remote").doc("constants").get()
      const tribeData = (await remote).data()?.listTribes
          tribeData.push({
              UGlockPct:25,
              googlePlacesFilter:"Bangalore , India",
              id:4,
              lat:12.98342,
              lng:77.58562,
              name:"bangalore",
              publishStatus:0,
              radius:15,
              strict:true,
              tribeIcon:bangaloreRemoteUrl[0]
          })
          await firestore.collection("remote").doc("constants").update({
              "listTribes":tribeData              
            }).then(()=>{
              console.log(`tribe bangalore added`)
            }).catch(errdb=>{
                console.log(`error ocurred as ${errdb}`)
            });
      })     
}