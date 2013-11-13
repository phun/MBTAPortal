// Functions

function verticalCenter(element){
	var center = function(){
		$(element).css({
			'margin-top': ($(element).parent().height() - $(element).height()) / 2,
			'top': '0'
		});
	};
	$(window).resize(center);
	center();
};

function matchWidth(element){								
	var heightMatch = function(){
		$(element).css({
			'height': $(element).width(),
		});
	};
	$(window).resize(heightMatch);
	heightMatch();
};

function showLogin (element){
	var source = $('#empty-player-template').html();
	var template = Handlebars.compile(source);

	// var context = {playerNo: i.toString()}; 				// insert player number later using loop (or better method)
	// var html = template(context);

	$(element).html(template);
};

function showNewAccount (element){
	var source = $('#new-account').html();
	var template = Handlebars.compile(source);
	$(element).html(template);
	$('.account-screen').css({'-webkit-animation-play-state': 'running'});
	matchWidth('.avatar-space')
};

function actionButton(firstTap){
		$('#logo').fadeOut('fast');
		setTimeout(function(){
			$('#welcome').show().css({
				'-webkit-animation-play-state': 'running',
			});
		},.500);

		setTimeout(function(){
			$('#welcome').fadeOut('fast').addClass('removed');   // remove this class later in order to make the whole system work again
			setTimeout(function(){
				$('#login-container').show();
				showLogin('.login-space');
				verticalCenter('.press-button');

				$(firstTap).children().hide();
				showNewAccount(firstTap);
			},1000);
		},5500);
	// };
};

// Objects

function Player(controls, uid) {
	this.controls = controls;
	this.uid = uid;
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
			$('.selected', uid).removeClass('selected');
			$('.skip-button', uid).addClass('selected');
		} else if (this.currentRow == 1) {
			$('.selected', uid).removeClass('selected');
			$('.take-photo h3', uid).addClass('selected');
		} else if (this.currentRow == 2) {
			$('.selected', uid).removeClass('selected');
			$('.retake-photo h3', uid).addClass('selected');
		} else {
			var split = this.getSelection().split(' ');
			$('.selected', uid).removeClass('selected');
			$('.' + split[0] + ' .' + split[1], uid).addClass('selected');
			console.log('.' + split[0] + ' .' + split[1]);
		}
	}

	this.getControl = function(controlName) {
		return this.controls[controlName];
	}
};

function PlayerCollection(players) {
	this.keyMap = {}; // Maps the key to the index of where player is in this.players
	this.players = [];

	for (i in players) {
		this.addPlayer(players[i]);
	}
}

PlayerCollection.prototype.addPlayer = function(newPlayer) {
	if (this.validateNewPlayer(newPlayer)) {
		var playerIndex = this.players.length;
		this.players.push(newPlayer);

		for (i in newPlayer.controls) {
			var control = newPlayer.controls[i];
			this.keyMap[control] = playerIndex;
		}
	}
}

PlayerCollection.prototype.validateNewPlayer = function(newPlayer) {
	for (i in newPlayer.controls) {
		var control = newPlayer.controls[i];
		if (control in this.keyMap) {
			return false;
		}
	}
	return true;
}

PlayerCollection.prototype.getPlayerPressed = function(keyPressed) {
	var playerIndex = this.keyMap[keyPressed];
	if (!isNaN(playerIndex)) {
		return this.players[playerIndex];
	}
	return null;
}

//Ascii keymapping for players
var p1 = new Player({'up': 87, 'down': 83, 'left': 65, 'right': 68, 'a': 88, 'nfc': 49}, '#player-1'); // w,s,a,d,x,1
var p2 = new Player({'up': 84, 'down': 71, 'left': 70, 'right': 72, 'a': 66, 'nfc': 50}, '#player-2'); // t,g,f,h,b,2
var p3 = new Player({'up': 73, 'down': 75, 'left': 74, 'right': 76, 'a': 188, 'nfc': 51}, '#player-3'); // i,k,j,l,<,3
var p4 = new Player({'up': 38, 'down': 40, 'left': 37, 'right': 39, 'a': 191, 'nfc': 52}, '#player-4'); // up,down,left,right,?,4

// Array of players

var playerCollection = new PlayerCollection([p1, p2, p3, p4]);

// Execution

$(document).ready(function(){

	$('#welcome').hide();
	$('.tap').hide();
	$('#login-container').hide();

	setTimeout(function(){
		$('.loading-text').hide();
		$('.tap').show();
	},6000);

		$(window).keyup(function(e) {     							// event that is a placeholder for nfc swipe
				
				function loginSequence (nick) {
					if ($('#welcome').hasClass('removed') === false) {  	// checks to see if actionButton has been activated before
						actionButton(nick);
					} else {
					$(nick).children().hide();
					showNewAccount(nick);
				}
				};

				var playerPressed = playerCollection.getPlayerPressed(e.keyCode);

			if (playerPressed && e.keyCode == playerPressed.getControl('nfc')) {
				loginSequence(playerPressed.uid);
			} else if (playerPressed && e.keyCode == playerPressed.getControl('up')) {
				playerPressed.move('up');
			} else if (playerPressed && e.keyCode == playerPressed.getControl('down')) {
				playerPressed.move('down');
			} else if (playerPressed && e.keyCode == playerPressed.getControl('left')) {
				playerPressed.move('left');
			} else if (playerPressed && e.keyCode == playerPressed.getControl('right')) {
				playerPressed.move('right');
			} else if (playerPressed && e.keyCode == playerPressed.getControl('a')) {
				playerPressed.hitA();
			}
	});
});

// $(document).ready(function(){
// 	$('body').children().hide();
// 	$('body').css({
// 		'width': '25%'
// 	});
// 	showNewAccount('body');
// });
