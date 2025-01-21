
(function($) {

	window.addEventListener('scroll', () => {
		
	  el = document.getElementById('myVideo');
	  const y = window.scrollY;
	  const top = el.offsetTop;
	  
	  el.style.transform = `translateY(-${ (y > top) ? y / 5 : 0 }px)`;
	});

})(jQuery);