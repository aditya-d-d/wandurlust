var curIndex = 0, newIndex = 0;

$(window).on("scroll", function(e){
	e.preventDefault();
	var scrollVal = parseInt($(this).scrollTop()),
		screenHt = $(this).height(),
		indexVal = parseInt(scrollVal/screenHt),
		newScrollVal = parseInt(scrollVal - (screenHt*indexVal)),
		transVal = newScrollVal/2,
		scaleVal = (newScrollVal/screenHt).toFixed(1),
		scaleVal = (1 - scaleVal).toFixed(4),
		curIndex = indexVal;
	
		if(curIndex!=newIndex){
			newIndex = curIndex;
			$(".sections").removeClass("current");
			$(".sections").eq(newIndex).addClass("current");
		}
	
	$(".sections .content").css({"transform": "translate3d(0px, 0px, 0px) scale(1)", "opacity": "1"});
	$(".current .content").css({"transform": "translate3d(0px, "+newScrollVal+"px, -"+transVal+"px)", "opacity": scaleVal});
});

$(".indicators li").on("click", function(e){
	e.preventDefault();
	var clickedId = $(this).index(),
		sectionId = $("section").eq(clickedId),
		sectionOffset = sectionId.offset().top;
	
	$("body, html").animate({
		scrollTop: sectionOffset
	}, 1000);
});