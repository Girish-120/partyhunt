
  const firebase = require('firebase');
  require('firebase/firestore');




function onDocumentReady(firebaseApp) {
    //[START fs_emulator_connect]
    // Firebase previously initialized using firebase.initializeApp().
    var db = firebase.firestore();
    if (location.hostname === "localhost") {
      db.settings({
        host: "localhost:8080",
        ssl: false
      });
    }
    // [END fs_emulator_connect]
  }
  

const test = require('firebase-functions-test')({
    // databaseURL: "https://party-hunt.firebaseio.com",
    storageBucket: 'gs://party-hunt.appspot.com',
    projectId: 'party-hunt',
  }, '/Users/rachitr/Documents/partyhunt_flutter/functions/src/JSONs/serviceAccountKey_dev2.json');


// import { equal } from 'assert';

var assert = require('assert');

//Test Function
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal([ 1, 2, 3 ].indexOf(4), -1);
        });
    });
});