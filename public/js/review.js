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
			var review_idx = data[$i].review_idx;
			$('#test').append(nickname + "님이 작성한 한줄평입니다.");
			$('#test').append('  ' + review);
			$('#test').append('<button class = "delete_btn" id="delete' + review_idx + '"> 삭제 </button>')
			$('#test').append('<br>')
		}
	}


	/* 리뷰글 작성
	$.ajax({
		url: '/review_upload',
		dataType: 'json',
		async: true,
		type: 'POST',
		contentType: 'application/json; charset=UTF-8',
		success: function (data) {
			console.log(data);
		},
		error: function (err) {

		}
	});
*/

	// 삭제 버튼 누르면 팝업창뜨고 비번입력
	$(document).on('click', '.delete_btn', function () {
		var id = this.id;
		var review_idx = id.substring(6); // review 글 index 얻어오기
		console.log(review_idx);

		// 팝업창 띄어서 비밀번호 입력받기
		var pw = prompt("비밀번호를 입력하세요");

		// ajax를 통해 먼저 review_idx의 pw와 팝업창에서 받은 pw가 같은지 확인하고
		//ajax로 mysql 연동 시작 ( 글 불러오기 )
		$.ajax({
			url: '/delete_review',
			dataType: 'json',
			async: true,
			type: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify({
				"review_idx": review_idx,
				"pw": pw
			}),
			success: function (data) {
				delete_review(data, review_idx);
			},

			error: function (err) {

			}
		});
	});


	// 같으면 delete 수행, 다르면 X
	function delete_review(data, review_idx) {

		var state = data.result; // 비밀번호가 같으면 같음, 다르면 다름 이 옴

		if (state == "같음") {
			var con = confirm("정말로 리뷰를 삭제하겠습니까?");
			if (con == true) {
				$.ajax({
					url: '/delete_review2',
					dataType: 'json',
					async: true,
					type: 'POST',
					contentType: 'application/json; charset=UTF-8',
					data: JSON.stringify({
						"review_idx": review_idx
					}),
					success: function (data) {
						window.location.reload();
					},

					error: function (err) {

					}
				});
			}
		} else {
			alert("비밀번호가 다릅니다!");
		}
	}

});
