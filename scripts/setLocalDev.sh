cd functions
export GOOGLE_APPLICATION_CREDENTIALS='src/JSONs/serviceAccountKey_dev.json'
gsutil -m cp -r gs://party-hunt.appspot.com/fireStoreDataBackup .
firebase emulators:start --import ./fireStoreDataBackup