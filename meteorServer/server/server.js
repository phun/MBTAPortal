var width = 1440;
var height = 900;
var curcolor = null;
var ltime = 0;
var minBlobs = 20;

function Blob(x,y,r,vx,vy,w,p,v) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vx = vx;
  this.vy = vy;
  this.wobble = w;
  this.wperiod = p;
  this.val = v;
  this.poppedBy = null;
}

function init() {
  ltime = new Date().getTime();
  while (Blobs.find().count() < minBlobs) {
    Blobs.insert(createBlob(null));
  }
  Meteor.setInterval(function() { move() }, 50);
}

function move() {
  var time = new Date().getTime();
  var dt = time-ltime;

  var blobs = Blobs.find();
  blobs.forEach(function (blob) {

    // Moved to client for speed performance
    // if (blob.poppedBy) {
    //   Players.update({_id: blob.poppedBy}, {$inc: {points: 1}});
    //   Blobs.remove(blob._id);
    // }
    var tf = time/1000/blob.wperiod;
    var wf = (tf-Math.floor(tf))*2*Math.PI;
    var xw = blob.wobble*(Math.sin(wf)-0.5);

    // update blob pos
    blob.x += blob.vx;
    blob.y += blob.vy;

    Blobs.update({_id: blob._id}, {$set: {x: blob.x, y: blob.y}});

    if (blob.x > width+blob.r || blob.x < -blob.r
     || blob.y > height+blob.r || blob.y < -blob.r) {
      Blobs.remove(blob._id);
    }
  });

  while (Blobs.find().count() < minBlobs) {
    Blobs.insert(createBlob(null));
  }

  ltime = time;
}

function createBlob(event) {
  var r = (Math.random()*31)+10; // 10-40
  var x;
  var y;
  if (event == null) {
    x = Math.random()*width; // 0-width;
    y = height+r;
  } else {
    x = event.clientX;
    y = event.clientY;
  }
  var vx = (((Math.random()*21))-10)/10; // -1 to 1
  var vy = -((Math.random()*15)+1)/3.0; // -.3 to -5
  var wob = Math.random()*3+0.1; // wobble amount 0.1-3.1
  var wp = Math.random()*wob+0.1; // wobble period 0.1-3.1 sec
  return new Blob(x, y, r, vx, vy, wob, wp, _.random(-2, 5));
}

Meteor.startup(function () {
  if (Players.find().count() === 0) {
    var players = [
      {'nfcId': 0, 'name': 'Phu', 'points': 0}
    ];
    for (var i = 0; i < players.length; i++) {
      Players.insert(players[i]);
    }
  }
  init();
});

Meteor.publish('players', function () {
  return Players.find();
});

Meteor.publish('blobs', function () {
  return Blobs.find();
});