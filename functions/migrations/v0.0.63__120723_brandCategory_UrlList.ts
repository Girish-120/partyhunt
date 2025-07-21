import { MigrateOptions } from "fireway";
export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("remote").doc("constants").update({
    "typesBrandCategories":['Musician', 'Band', 'Fire Artist', 'Photographer', 'Videographer', 'Video Editor', 'Organiser','Sound Engineer', 'Digital Marketing', 'Catering', 'Visual Artist', 'Restaurant', 'Hotel', 'Resort', 'Hostel', 'Cafe', 'Bakery', 'Clothing', 'Party Wear', 'Jewellery & Accessories', 'Others', 'Artist', 'Service', 'Promoter', 'Venue', 'Vendor'],
    "typesEventUrls":['Buy Tickets', 'Website', 'Insta Profile']
  }).then(()=>{
    console.log(`brand category and list url`)
  }).catch(err=>{
      console.log(`error ocurred as ${err}`)
  });
}