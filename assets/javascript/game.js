var config = {
  apiKey: "AIzaSyA7oEdqFS9Dn6HB1xGCN_8bVgzbCe1UN_0",
  authDomain: "rps-mp-e2b42.firebaseapp.com",
  databaseURL: "https://rps-mp-e2b42.firebaseio.com",
  projectId: "rps-mp-e2b42",
  storageBucket: "rps-mp-e2b42.appspot.com",
  messagingSenderId: "506437512903"
};
firebase.initializeApp(config);
var dataBase = firebase.database();
var userID;
var fbuid;
var isAnonymous;
var pickPhase = true;
var userPick
var gameStart = false;
var guestList = [];
var guestInfo = [];
var connectedID = [];
var enoughPlayers = false;
var gameStarted = false;
function startScreen() {

  // $('#wrapper').attr('class', "hide");

  var start = $('<div>');
  start.addClass('titleBox');

  var gameTitle = $('<h1>');
  gameTitle.addClass('mainTitle');
  gameTitle.attr('id', "titleStart")
  gameTitle.text("Rock Paper Scissors!");
  start.append(gameTitle);

  var rule = $('<p>');
  rule.attr('id', 'rule');
  rule.text('Please input a name and select start to be matched with an opponent!');
  start.append(rule);

  var nameInput = $('<input type="text" name="username" value="UserName" id="userNameInput">');
  start.append(nameInput);

  var button = $("<button>");
  button.attr('id', "startButton");
  button.text('START');
  start.append(button);

  var err = $('<p>');
  err.attr('id', "startErr");
  err.attr('style', "color: red;");
  start.append(err);

  $('#startScreen').append(start);

};
// var testuser = firebase.auth().currentUser.val();
// console.log(testuser);
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    console.log(user);
    // User is signed in.
    isAnonymous = user.isAnonymous;
    fbuid = user.uid;
    console.log(fbuid);
    console.log(isAnonymous);
    // ...
  } else {
    // User is signed out.
    // ...
  }
  // ...
});
startScreen();

function startClear() {
  $('#startScreen').empty();
  $('#startScreen').attr('id', "");
  $('#wrapper').attr("class", "");
}
$('#startScreen').on('click', '#userNameInput', function () {

  $('#userNameInput').attr('value', "");

});
$('#startScreen').on('click', '#startButton', function () {
  userID = $('#userNameInput').val();

  if (userID.length > 0) {
    if (guestList.indexOf(userID) == -1) {

      firebase.auth().signInAnonymously().catch(function (error) {

        var errorCode = error.code;
        var errorMessage = error.message;

      });

      var userObject = {
        name: userID,
        ID: fbuid,
        pick: "",
        ready: true
      }

      // dataBase.ref('TempData').push(userObject);
      dataBase.ref("Users").child(userID).set(userObject);
      startClear();


    } else {
      $('#startErr').text("Name Taken, try again!");
    }
  } else {
    $('#startErr').text("Please enter a name!");
  }
});
// dataBase.ref('Users').on("value", function(snapshot) {
//   var data = snapshot.val();
//   var player = {name: data.name, id: data.ID}
//   // var children = data.numChildren();

var ref = firebase.database().ref("Users");
ref.once("value")
  .then(function (snapshot) {
    var a = snapshot.numChildren(); // 1 ("name")
    var b = snapshot.child("name").numChildren();
    var c = snapshot.child("name/first").numChildren();
    console.log(a);
    console.log(b);
    console.log(c);
  });



//showing online users/data
var connectionsRef = dataBase.ref("/connections");
var connectedRef = dataBase.ref(".info/connected");
connectedRef.on("value", function (snap) {

  // If they are connected..
  if (snap.val()) {
    console.log(snap.val());

    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});
connectionsRef.on("value", function (snapshot) {
  $('#connectedPlayers').empty();
  var players = snapshot.val();
  if (players.length > 0) {
    enoughPlayers = true;
    if (!gameStarted){
     setTimeout(game, 3500); 
     gameStarted = true;
    }
    
  }
  else if(players.length == -1) {
    enoughPlayers = false;
    $('#resultText').text("Waiting for another player...");
    
  }
  var playersID = Object.keys(players);
  var query = firebase.database().ref("Users").orderByKey();
  query.once("value")
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();

        guestList.push(key);
        var user = { id: childData.ID, name: childData.name };
        guestInfo.push(user);

      });
      console.log(guestInfo);
      for (var x = 0; x < guestInfo.length; x++) {
        var test = guestInfo[x];
        for (let k in test) {
          if (test[k] == fbuid) {
            $('#titleStart').text("Welcome back " + test.name + "!");
            $('#startButton').remove();
            $('#rule').text("");
            $('#userNameInput').remove();
            setTimeout(function () { startClear(); }, 3000);
          }
          else if (playersID.indexOf(test[k])) {
            var newGuest = $('<h3>');
            newGuest.text(test.name);
            console.log(test.name);
            $('#connectedPlayers').append(newGuest);
          }
        }
      }
    });

});
var picktime;
var pickTimer;
var scoretime;
function game() {
  console.log(enoughPlayers);
  if (enoughPlayers) {
    picktime = 5;

    $('#counter').text(picktime);
    pickTimer = setInterval(function(){pickTime();}, 1000);
  };
};
function pickTime() {
  $('#counter').text(picktime);

  if (picktime != 0) {
    pickPhase = true;
    picktime--;
  }
  else if (picktime == 0) {
    pickPhase = false;

    var userObject = {
      name: userID,
      ID: fbuid,
      pick: userPick,
      ready: true
    }

    dataBase.ref("Users").child(userID).set(userObject);
    window.clearInterval(pickTimer);
    $('#resultImages').attr('class', "");
    $('#resultText').text("Waiting for results...");
    setTimeout(syncDelay, 1500);
  }
};
function syncDelay() {
  scoretime = 8;
  setInterval(scoreTime, 8000);
  tabulate();
}
function scoreTime() {
  if (scoretime != 0) {
    pickPhase = false;
    scoretime--;
  }
  else if (scoretime == 0) {
    pickPhase = true;

  }
}
function tabulate() {
  var query = firebase.database().ref("Users").orderByKey();
query.once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      // key will be "ada" the first time and "alan" the second time
      var UserChoice = childSnapshot.pick;
      console.log(UserChoice);
      // childData will be the actual contents of the child
      var childData = childSnapshot.val();
  });
});

}
console.log(connectionsRef);


dataBase.ref().on("child_added", function (snapshot) {
  console.log(snapshot.val());
  var data = snapshot.val();
  var player = { name: data.name, id: data.ID }
  // console.log(player);
  console.log(Object.values(guestList).indexOf("dan"));


  if (guestList.indexOf(player) == -1) {
    guestList.push(player);


  }
  console.log(guestList);

});
$('#rock').on('click', function () {
  if (pickPhase) {
    console.log(pickPhase);
    $('#resultImages').attr('class', "rockSelected");
    userPick = "rock";
  }
});
$('#paper').on('click', function () {
  if (pickPhase) {
    console.log(pickPhase);
    $('#resultImages').attr('class', "paperSelected");
    userPick = "paper";

  }
});
$('#scisor').on('click', function () {
  if (pickPhase) {
    console.log(pickPhase);
    $('#resultImages').attr('class', "scisorSelected");
    userPick = "scissor";
  }
});