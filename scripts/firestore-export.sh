### Reference links for this script file:
### 1. https://cloud.google.com/sdk/docs/cheatsheet (GCloud Cheat Sheet)
### 2. https://cloud.google.com/firestore#section-4 (GCloud with Firestore)

#Working again as of 26-Jul-2021

#!/bin/sh

source ./funcs/ask.sh
source ./funcs/shell_utils.sh

echo "$(basename \"$0) script started..."

# cdPath ../functions # Not necessary to keep exported folder there or to run gsutil commands

# Copy Firestore Data from Prod to Dev
if ask "Do you want to copy firestore data from prod to dev?" N; then
    gcloud config set project partyhunt-production
    gsutil rm -r gs://staging.partyhunt-production.appspot.com/exported
    gcloud firestore export gs://staging.partyhunt-production.appspot.com/exported --collection-ids='brands','places','tags' #'users','events'

    gcloud config set project party-hunt
    gcloud firestore import gs://staging.partyhunt-production.appspot.com/exported
fi

# Update Firestore-Emulator from Firestore-Dev (Includes Server Cost)
# npm run export
if ask "Do you want to update firestore-emulator data from firestore-dev? (Server cost applied)" N; then
    echo "Exporting: Dev Firestore Data to Local Firebase Emulator"
    gsutil rm -r gs://party-hunt.appspot.com/exported            #-m gives error
    gcloud firestore export gs://party-hunt.appspot.com/exported #--async
    gsutil cp -r gs://party-hunt.appspot.com/exported .          # -m gives error
fi

# Start Firestore-Emulator
# npm run dev
if ask "Do you want to start firestore-emulator with imported data?" N; then
    echo "Killing ports before starting firebase emulator..."
    npx kill-port 9099 5001 8081 9001 8086 9199
    echo "Starting firebase emulator with imported data..."
    tsc -w | firebase emulators:start --import ./exported
fi
