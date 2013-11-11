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

function player(up, down, left, right, button, nfc, name){
	this.up = up;
	this.dow= down;
	this.lef= left;
	this.rig= right;
	this.button= button;
	this.nfc= nfc;
	this.nick= name;
	// this.accountName= ;
};

//Ascii keymapping for players
var p1 = new player(87,83,65,68,88,49,'#player-1'); // w,s,a,d,x,1
var p2 = new player(84,71,70,72,66,50,'#player-2'); // t,g,f,h,b,2
var p3 = new player(73,75,74,76,188,51,'#player-3'); // i,k,j,l,<,3
var p4 = new player(38,40,37,39,191,52,'#player-4'); // up,down,left,right,?,4

// Array of players

var players = [p1,p2,p3,p4];

// Array Grid

var rowOne = ['r1c1','r1c2','r1c3','r1c4'];
var rowTwo = ['r2c1','r2c2','r2c3','r2c4'];
var rowThree = ['r3c1','r3c2','r3c3','r3c4'];
var rowFour = ['r4c1','r4c2','r4c3','r4c4'];

var position = ['skip','take','retake', rowOne, rowTwo, rowThree, rowFour];

var currentPosition = [position[0],position[0],position[0],position[0]];

// Execution

// $(document).ready(function(){

// 	$('#welcome').hide();
// 	$('.tap').hide();
// 	$('#login-container').hide();

// 	setTimeout(function(){
// 		$('.loading-text').hide();
// 		$('.tap').show();
// 	},6000);

// 	$(window).keyup(function(e){     							// event that is a placeholder for nfc swipe
   		
//    		function loginSequence (nick){
//    			if($('#welcome').hasClass('removed') === false){  	// checks to see if actionButton has been activated before
//    				actionButton(nick);
//    			}else{
// 				$(nick).children().hide();
// 				showNewAccount(nick);
// 			}
//    		};

//    		for (var i = 0 ; i < players.length; i++) {				// Loop trough the players array. Players represented with players[i]
//    			if(e.keyCode === players[i].nfc){
//    				loginSequence(players[i].nick);
//    			};
//    		};


// 	});
// });

$(document).ready(function(){
	$('body').children().hide();
	$('body').css({
		'width': '25%'
	});
	showNewAccount('body');
});
