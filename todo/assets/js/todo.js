
// check off todos by clicking
$("ul").on("click", "li", function(){  //can only add listeners on elements that exist when created.
	$(this).toggleClass("completed") //Need to create on UL when page loads.
});

//click on X to delete todo
$("ul").on("click", "span", function(event){
	$(this).parent().fadeOut(500, function(){
		$(this).remove();
	});   //give parent element
	event.stopPropagation(); // prevents event from bubbling up the DOM tree, parents from being notified.
})

$("input[type='text']").keypress(function(event){
	if (event.which === 13){
		//grab new todo text
		var todoText = $(this).val();
		$(this).val(""); //acts as setter and not getter.
		//create new li
		$("ul").append("<li><span><i class='fa fa-trash'></i></span> " + todoText + "</li>");

	}
})

$(".fa-plus").click(function(){
	$("input[type='text']").fadeToggle();
});