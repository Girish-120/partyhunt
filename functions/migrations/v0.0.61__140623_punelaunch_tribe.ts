import { MigrateOptions } from "fireway";
import admin from "firebase-admin";
import fs from "fs";
const path = require('path');
export async function migrate({ firestore}: MigrateOptions) {
    let credFile:string
    let projectId:string 
    let storageBucket:string
    credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS!==undefined?process.env.GOOGLE_APPLICATION_CREDENTIALS:""
    projectId = process.env.FIREBASE_APP_PROJECT_ID!==undefined?process.env.FIREBASE_APP_PROJECT_ID:""
    storageBucket = process.env.FIREBASE_APP_STORAGE_BUCKET!==undefined?process.env.FIREBASE_APP_STORAGE_BUCKET:""

    console.log("process ",credFile)
    //const serviceAccount = JSON.parse(credFile) 

     fs.readFile(credFile,'utf8',async  (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        
        // work around authenticating again
        const jsonData = JSON.parse(data);
       // console.log(jsonData);
        admin.initializeApp({
            credential: admin.credential.cert(jsonData),
            projectId: projectId,
            storageBucket: storageBucket,
          });
        //  const bucket = getStorage().bucket();
        const fileName = "PH_Pune_tribe_new.svg"
        const bucketPune =admin.storage().bucket();    
        const filePune = path.join(__dirname,"assets/tribeIcons/pune/"+fileName);
        const storageFilePathPune = "icons/tribeIcons/pune/"+fileName
        const bucketFilePune =bucketPune.file(storageFilePathPune);

       
        await bucketPune.upload(filePune,{
            metadata: {
                contentType: 'image/svg+xml',
              },
              destination:storageFilePathPune
              
        })
       
        const puneRemoteUrl=await bucketFilePune.getSignedUrl({
            action: 'read',
            expires: '03-17-2050'
        })
       
        const remote = firestore.collection("remote").doc("constants").get()
        const tribeData = (await remote).data()?.listTribes
        tribeData.push({
            UGlockPct:25,
            googlePlacesFilter:"Pune , India",
            id:3,
            lat:18.57866,
            lng:73.8415,
            name:"pune",
            publishStatus:1,
            radius:20,
            strict:true,
            tribeIcon:puneRemoteUrl[0]
        })
        await firestore.collection("remote").doc("constants").update({
          //"exp":1
          "listTribes":tribeData
          
        }).then(()=>{
          console.log(`tribe pune added`)
        }).catch(errdb=>{
            console.log(`error ocurred as ${errdb}`)
        });
    })
    
  }