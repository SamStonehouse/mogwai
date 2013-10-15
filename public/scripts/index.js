$(document).ready(function() {

	(function() {
		var words = [
			"clan",
			"group",
			"guild",
			"corporation",
			"community"
		];

		var index = 0;

		setInterval(function() {
			$('.type').fadeOut(
				function() {
					if (index == words.length) {
						index = 0;
					}

					$(this).html(words[index++]).fadeIn();

				});
		}, 3000);
	})();

});