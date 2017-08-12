const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database().ref();

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
      var enemiesList = [];
      if(currentLocation.list){
        var enemiesList = currentLocation.list;
      }
      var maxEnemies = currentLocation.max;
      //Loop through all up to max and check if uniqe id exists, if not, add.
      if(Object.keys(enemiesList).length < maxEnemies){
        monstersRef.orderByChild('level').endAt(levelCap).once('value', function(snapshotMon){
          for(var i = 1; i <= maxEnemies; i++){
            if(enemiesList[i] == null){
              var monsters = snapshotMon.val();
              var newEnemy = getRandomProp(monsters);
              newEnemy.name = 'unnamed';
              locationMonstersRef.child(location).child('list').child(i).set(newEnemy);
            }
          }
        })
      }
    });
  });
  response.status(200).send(`Success!`);
});

// exports.removeDead = functions.database.ref('/location_rooms/location_monsters').onWrite(function(event){
//   var monsterRoomsRef = databaseRef.child('location_rooms').child('location_monsters');
//   monsterRoomsRef.once('value', function(monsterRoomsSnap){
//     Object.keys(monsterRoomsSnap.val()).forEach(function(mrKey){
//       var monsterList = monsterRoomsSnap.val()[mrKey].list;
//       for(var i = 1; i < monsterList.length; i++ ){
//         if(monsterList[i].health <= 0){
//           monsterRoomsRef.child(mrKey).child('list').child(i).set({});
//         }
//         console.log(monsterList[i]);
//       }
//     })
//   })
// });
