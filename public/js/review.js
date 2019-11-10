$('document').ready(function () {


	// 이름 얻어오기
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	// 타이틀 바꿔주기
	var store_name = getParameterByName('store_name');
	$('.section-title').empty();
	$('.section-title').html(store_name + " 한줄평");

	$('.section-description').empty();
	$('.section-description').html(store_name + "에 대한 간단한 한줄평을 남겨주세요.");



	//ajax로 mysql 연동 시작 ( 글 불러오기 )
	$.ajax({
		url: '/review_list',
		dataType: 'json',
		async: true,
		type: 'POST',
		contentType: 'application/json; charset=UTF-8',
		success: function (data) {
			review(data);
		},
		error: function (err) {

		}
	});

	// 리뷰글 불러오기
	function review(data) {
		$("#test").empty();
		for ($i = 0; $i < data.length; $i++) {
			var nickname = data[$i].nickname;
			var review = data[$i].review;
			$('#test').append(nickname + "님이 작성한 한줄평입니다.");
			$('#test').append('  ' + review);
			$('#test').append('<br>')
		}
	}


});
