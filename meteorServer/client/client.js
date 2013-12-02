// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Meteor.subscribe('players');
Meteor.subscribe('blobs');
Controllers = new Meteor.Collection('controllers');

function verticalCenter(elm) {
  var center = function() {
    $(elm).css({
      'margin-top': ($(elm).parent().height() - $(elm).height()) / 2,
      'top': '0'
    });
  };
  $(window).resize(center);
  center();
};

function showWelcome() {
  if ($('.intro-container').is(':visible')) {
    $('.intro-container').fadeOut('fast');
    Meteor.setTimeout(function() {
      $('.welcome-container').show().css({
        '-webkit-animation-play-state': 'running',
      });
      verticalCenter('.welcome-container');

      Meteor.setTimeout(function() {
        $('.welcome-container').fadeOut('fast');
        $('.login-container').show();
        verticalCenter('.press-button');
      }, 3500);
    }, 500);
  }
}

function connectPlayer(avatarBox) {
  var nfcId = prompt('What is your NFC ID?', 0);

  if (nfcId == null) {
    nfcId = 0;
  }

  var player = Players.findOne({'nfcId': parseInt(nfcId)});
  
  if (!player) {
    var name = prompt('What\'s your name?');
    Players.insert({'nfcId': parseInt(nfcId), 'name': name});
    player = Players.findOne({'nfcId': parseInt(nfcId)});
  }
  Session.set('player', player._id);
  avatarBox.connect(player);
  return avatarBox;
}

function AvatarBox(controls, num) {
  this.controls = controls;
  this.num = num;
  this.className = 'avatarBox-' + num;
  this.player = null;
  this.currentRow = 3;
  this.currentCol = 0;
  this.selections = [
    ['skip', 'skip', 'skip', 'skip'],
    ['take', 'take', 'take', 'take'],
    ['retake', 'retake', 'retake', 'retake'],
    ['r1 c1','r1 c2','r1 c3','r1 c4'],
    ['r2 c1','r2 c2','r2 c3','r2 c4'],
    ['r3 c1','r3 c2','r3 c3','r3 c4'],
    ['r4 c1','r4 c2','r4 c3','r4 c4']];

  this.getSelection = function() {
    return this.selections[this.currentRow][this.currentCol];
  }

  this.connect = function(player) {
    this.player = player;
    Session.set('controller-connected-' + this.num, true);
  }

  this.connected = function() {
    return !(this.player == null);
  }

  this.move = function(direction) {
    if (direction == 'up' && this.currentRow != 0) {
      this.currentRow -= 1;
    } else if (direction == 'down' && this.currentRow != this.selections.length - 1) {
      this.currentRow += 1;
    } else if (direction == 'left' && this.currentCol != 0) {
      this.currentCol -= 1;
    } else if (direction == 'right' && this.currentCol != this.selections[0].length - 1) {
      this.currentCol += 1;
    }
    
    if (this.currentRow == 0) {
      $('.selected', '.' + this.className).removeClass('selected');
      $('.skip-button', '.' + this.className).addClass('selected');
    } else if (this.currentRow == 1) {
      $('.selected', '.' + this.className).removeClass('selected');
      $('.take-photo h3', '.' + this.className).addClass('selected');
    } else if (this.currentRow == 2) {
      $('.selected', '.' + this.className).removeClass('selected');
      $('.retake-photo h3', '.' + this.className).addClass('selected');
    } else {
      var split = this.getSelection().split(' ');
      $('.selected', '.' + this.className).removeClass('selected');
      $('.' + split[0] + ' .' + split[1], '.' + this.className).addClass('selected');
      console.log('.' + split[0] + ' .' + split[1]);
    }
  }

  this.hitA = function() {
    if ($('.skip-button', '.' + this.className).hasClass('selected')) {
      var fragment = Meteor.render( function() {
        return Template['bubbles']();
      });
      $('body').html(fragment);
      InitBubbles();
    }
  }

  this.getControl = function(controlName) {
    return this.controls[controlName];
  }
};

function ControllerCollection(controllers) {
  this.keyMap = {}; // Maps the key to the index of where controller is in this.controllers
  this.controllers = [];

  for (i in controllers) {
    this.addController(controllers[i]);
  }
}

ControllerCollection.prototype.addController = function(newController) {
  if (this.validateNewController(newController)) {
    var controllerIndex = this.controllers.length;
    this.controllers.push(newController);

    for (i in newController.controls) {
      var control = newController.controls[i];
      this.keyMap[control] = controllerIndex;
    }
  }
}

ControllerCollection.prototype.validateNewController = function(newController) {
  for (i in newController.controls) {
    var control = newController.controls[i];
    if (control in this.keyMap) {
      return false;
    }
  }
  return true;
}

ControllerCollection.prototype.getControllerPressed = function(keyPressed) {
  console.log(this.keyMap, keyPressed);
  var controllerIndex = this.keyMap[keyPressed];
  if (!isNaN(controllerIndex)) {
    return this.controllers[controllerIndex];
  }
  return null;
}

//Ascii keymapping for players
var p1 = new AvatarBox({'up': 87, 'down': 83, 'left': 65, 'right': 68, 'a': 88, 'nfc': 49}, 0); // w,s,a,d,x,1
var p2 = new AvatarBox({'up': 84, 'down': 71, 'left': 70, 'right': 72, 'a': 66, 'nfc': 50}, 1); // t,g,f,h,b,2
var p3 = new AvatarBox({'up': 73, 'down': 75, 'left': 74, 'right': 76, 'a': 188, 'nfc': 51}, 2); // i,k,j,l,<,3
var p4 = new AvatarBox({'up': 38, 'down': 40, 'left': 37, 'right': 39, 'a': 191, 'nfc': 52}, 3); // up,down,left,right,?,4

// Array of players
var controllerCollection = new ControllerCollection([p1, p2, p3, p4]);

function handleKeyup(e) {
  var controllerPressed = controllerCollection.getControllerPressed(e.keyCode);
  console.log(controllerPressed);
  if (controllerPressed && e.keyCode == controllerPressed.getControl('nfc')) {
    connectPlayer(controllerPressed);
    showWelcome();
  } else if (controllerPressed && e.keyCode == controllerPressed.getControl('up')) {
    controllerPressed.move('up');
  } else if (controllerPressed && e.keyCode == controllerPressed.getControl('down')) {
    controllerPressed.move('down');
  } else if (controllerPressed && e.keyCode == controllerPressed.getControl('left')) {
    controllerPressed.move('left');
  } else if (controllerPressed && e.keyCode == controllerPressed.getControl('right')) {
    controllerPressed.move('right');
  } else if (controllerPressed && e.keyCode == controllerPressed.getControl('a')) {
    controllerPressed.hitA();
  }
};

Template.intro.controllers = function () {
  return controllerCollection.controllers;
};

Template.avatarBox.connected = function () {
  return Session.equals('controller-connected-' + this.num, true) ? 'connected' : '';
}

Template.intro.events({
  'click p.tap': function () {
    console.log('tapped!');
  },
  'keyup': function () {
    console.log('key!');
  }
});

Meteor.startup(function () {
  Deps.autorun(function () {
    console.log(Players.find().count());
  });

  verticalCenter('.intro-container');
  Meteor.setTimeout(function(){
    $('.loading-text').hide();
    $('.tap').show();
  },6000);

  $(window).keyup(function(e) {
    handleKeyup(e);
  });
});

