$("ul").text();
$("li").text();
$("h1").text("New Text");
$("li").text("New Text"); //Will replace text of all li's

$("ul").html();
$("ul").html("<li>I hacked your ul</li><li>Rusty is still adorable</li>")//Will update.

$("img").css("width", "200px");
$('img').attr('scr', 'SOMEURL');//Can set attributes for differnt elements.
$('input').attr('type', 'color');
$('img:first-of-type').attr('');//faster because built in css selector.
$('img').last().attr()//will select last element.

$('input').val()//will return value of input or drop down menu.
$('input').val('Rusty Steele')//Would use this to erase content inside of text input
$('select').val()

$('h1').addClass("correct");
$('h1').removeClass('correct');
$('li').addClass('wrong'); // all lis
$('li').toggleClass('wrong')// toggle on and off

$('#submit').click(function(){
	console.log('Anothern click');
})
$('h1').click(function(){
	console.log('h1 clicked');
})
$('button').click(function(){
	alert('button clicked')
});
$('button').click(function(){
	$(this).css("background", "pink");
});
$('button').click(function(){
	var text = $(this).text();
});
//keypress - fires on end result character input
//keydown, keyup - fires on pressed keys

$('input').keypress(function(){
	console.log("YOU PRESSED A KEY!")
});

$('input').keypress(function(event){
	if (event.which === 13){
		alert("YOU HIT ENTER!")
	}
});

//on - can hande any event
$("h1").on('click', function(){
	$(this).css("color", "purple") //refers only to the one h1 that was selected.
})

$('input').on("keypress", function(){
	console.log("keypressed!")
})

$('input').on("mouseenter", function(){
	$('this').css('font-weight', 'bold');
});

$('input').on("mouseleave", function(){
	$('this').css('font-weight', 'normal');
});

//click only adds listeners for existing elements
//on click will add listeners for all potential future elements.


//effects
$('button').on('click', function(){
	$('div').fadeOut(1000, function(){
		$(this).remove();
	});	
})

$('button').on('click', function(){
	$('div').fadeIn(1000)
}

fadeToggle()

$('button').on('click', function(){
	$('div').slideDown();
}

$('button').on('click', function(){
	$('div').slideUo();
}

$('button').on('click', function(){
	$('div').slideToggle();
}
