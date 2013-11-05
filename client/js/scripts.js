function keepCentered(element) {
	 var center = function() {
	 	$(element).css({
		 	'margin-top': ($(window).height() - $(element).height()) / 2,
		 	'top':'0'
		 });
	 }

	 $(window).resize(function() { center() });
	 center();
}

function showLoading(element) {
	var source   = $("#loading-blank-template").html();
	var template = Handlebars.compile(source);
	$(element).html(template());
	keepCentered($(".screen-loading"));
	setTimeout(function(){showLoadingAd(element)}, 3000);
}

function showLoadingAd(element) {
	$(".row-portal-logo", element).slideUp("slow", function() {
		$(window).resize();
	});
	$(".section-sponsor", element).slideDown("slow", function() {
		$(window).resize();
	});
	setTimeout(function(){showWelcome(element)}, 3000);
}

function showWelcome(element) {
	var source   = $("#welcome-template").html();
	var template = Handlebars.compile(source);
	$(".screen-loading").fadeOut();
	$(element).html(template());
	$(".screen-welcome").hide().fadeIn();
	keepCentered($(".screen-loading"));
}

$(document).ready(function() {
	showLoading($(".main"));
});