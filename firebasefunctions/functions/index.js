const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database().ref();
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomProp(obj){
  var obj_keys = Object.keys(obj);
  var randomKey = obj_keys[getRandomIntInclusive(0,obj_keys.length-1)];
  return obj[randomKey];
}
exports.respawnMonsters = functions.https.onRequest((request, response) => {
  var locationMonstersRef = databaseRef.child('location_rooms').child('location_monsters');
  var monstersRef = databaseRef.child('monsters');
  locationMonstersRef.once('value', function(snapshotLoc){
    Object.keys(snapshotLoc.val()).forEach(function(location){
      var currentLocation = snapshotLoc.val()[location];
      var levelCap = currentLocation.level_cap;
      var enemiesList = currentLocation.list;
      var maxEnemies = currentLocation.max;
      //Loop through all up to max and check if uniqe id exists, if not, add.
      if(Object.keys(enemiesList).length < maxEnemies){
        monstersRef.orderByChild('level').equalTo(levelCap).once('value', function(snapshotMon){
          console.log(location);
          for(var i = 1; i <= maxEnemies; i++){
            console.log(snapshotMon[i]);
            if(snapshotMon[i] == null ){
              console.log("is null");
              var monsters = snapshotMon.val();
              var newEnemy = getRandomProp(monsters);
              locationMonstersRef.child(location).child('list').child(i).set(newEnemy);
            }
          }
        })
      }
    });
  });
  response.status(200).send(`Success!`);
});
