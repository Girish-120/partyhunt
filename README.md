# PartyHunt Backend

This repository contains backend service.

- Cloud Functions
- Utility Scripts

## Branching Strategy

1. Create a branch off of `develop` branch
2. Commit Changes
3. Open a Pull Request into `develop`
4. To release to QA open a Pull Request from `develop` -> `staging`
5. To release to Production open a Pull Request from `staging` -> `master`

# Installation

## Prerequisite

1. NPM - Package Manager for JavaScript
2. Node - Latest
3. Firebase
   1. Firebase-Tools
   2. Firebase-Emulator
4. GCloud
5. Visual Studio (IDE)

NOTE: This will be simplified using Makefile.

## Pre-Run Steps

### NPM

1. Install NPM

   - `npm install -g npm`

2. Install dependencies

   ```
   cd /functions
   npm install
   ```

   NOTE: package.json is in /functions dir.

3. NPM Update

   - `npx npm-check-updates -u` (check updates)

4. Clean Cache - (not always required)
   - `rm package-lock.json`
   - `rm -R node_modules`
   - `sudo npm cache clean -f`
5. Update Firebase Tools

   - `npm install -g firebase-tools`
   - `sudo npm i npm@latest -g` (update npm)
   - `sudo npm install (update dependencies)
   - `sudo npm update`

NOTE: This will be simplified using Makefile.

## GCLOUD

```
gcloud init

gcloud auth list

gcloud config list

gcloud components update

```

## FIREBASE

### 1. Firebase Basic

```
firebase use dev

or

firebase use prod
```

### 2. Firebase Deploy

```
npm run deploy
```

```
firebase deploy --only functions:makeUppercase
firebase deploy --only firestore:rules
```



### 3. Firebase Configure

```
firebase functions:config:get

firebase functions:config:set environment.uid_admin=<uuid>

firebase functions:config:unset <someservice>

```

### 4. Firebase Emulator

```
firebase emulators:start

firebase emulators:start --only functions
```

## HOW TO RUN?

### **Locally**:

1. Install Firebase CLI

```
npm install -g firebase-tools
```
2. Run bash script in the local folder

```

bash setLocalDev.sh

```

### **On Server**:

```
firebase deploy --only firestore/functions
```

NOTE: **Use the respective triggers on Server to invoke respections functions**

---

## **ARCHITECTURE**

## Serverless mobile backends

Use Cloud Functions directly from Firebase to extend your application functionality without spinning up a server. Run your code in response to user actions, analytics, and authentication events to keep your users engaged with event-based notifications and offload CPU- and networking-intensive tasks to Google Cloud.
Serverless mobile back ends workflow diagram: From left to right: icon labeled New follower flows to Database icon, to Cloud Functions icon, to Firebase Cloud Messaging icon, and to New message icon.
![alt text][logo]
[logo]: https://www.gstatic.com/bricks/image/05160504d56cfbe1aaf1a16ef9f374f6d8e1087ec34a4f21d0e5dc26689f6e99.svg "Cloud Functions Workflow"
