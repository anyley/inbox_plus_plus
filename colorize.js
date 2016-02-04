console.log('Найдены комментарии леперов');

$(".c_wrote").css('color','darkblue');


$(".c_wrote").each( function(idx) {
	if ($(this).text()=="Написала") {
		$(this).css('color','red');
	}
});
