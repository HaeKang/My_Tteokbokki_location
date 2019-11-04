$(document).ready(function () {

	var location_now; // 현재위치
	var x_lat;
	var y_lng;

	$('#result_list').hide();

	var circle = new naver.maps.Circle({
		map: map,
		center: location_now,
		radius: 0,
		fillColor: 'crimson',
		fillOpacity: 0
	}); // 원그리기


	// 지도 객체
	var map = new naver.maps.Map('map', {}),
		inputHTML = '<input type="text" id="address" placeholder="주소를 입력하세요"><input type="button" id="submit_adr" value="검색">',
		customControl = new naver.maps.CustomControl(inputHTML, {
			position: naver.maps.Position.TOP_LEFT
		});
	customControl.setMap(map);


	// marker
	var marker = new naver.maps.Marker({
		position: new naver.maps.LatLng(37.4517123, 127.1303362),
		map: map
	});


	// 클릭한 지점으로 marker 이동
	naver.maps.Event.addListener(map, 'click', function (e) {
		marker.setPosition(e.latlng);
		location_now = e.latlng; // 현재 위치 변경
		circle.setMap(null); // 기존에 있는 원 삭제
	});

	// 중복클릭 방지
	var click = true;

	// find 버튼 누르면 원그리기
	$("#btnfind").click(function () {
		x_lat = location_now.lat();
		y_lng = location_now.lng();

		circle.setMap(null); // 기존에 있는 원 삭제
		circle = new naver.maps.Circle({ // 원그리기
			map: map,
			center: location_now,
			radius: 500,
			fillColor: 'crimson',
			fillOpacity: 0.5
		});

		//ajax로 mysql 연동 시작
		$.ajax({
			url: '/map_post',
			dataType: 'json',
			async: true,
			type: 'POST',
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify({
				"x_lat": x_lat,
				"y_lng": y_lng
			}),
			success: function (data) {
				var real_data = JSON.stringify(data);
				console.log(real_data);

				// 데이터 넣기
				$('#result_list').empty();
				$('#result_list').show();

				$('#result_list').append("<p> 내 위치 근처에 있는 떡볶이집 </p>");
				
				for ($i = 0; $i < data.length; $i++) {
					$('#result_list').append("<p>떡볶이집 이름 : " + data[$i].name + "</p>");
				}
				
			},
			error: function (err) {
				alert('실패');
			}
		});
	});


	// info창 & 주소 + 좌표값 얻기
	var infoWindow = new naver.maps.InfoWindow({
		anchorSkew: true
	});


	map.setCursor('pointer');

	function searchCoordinateToAddress(latlng) {

		infoWindow.close();

		naver.maps.Service.reverseGeocode({
			coords: latlng,
			orders: [
            naver.maps.Service.OrderType.ADDR,
            naver.maps.Service.OrderType.ROAD_ADDR
        ].join(',')
		}, function (status, response) {
			if (status === naver.maps.Service.Status.ERROR) {
				return alert('Something Wrong!');
			}

			var items = response.v2.results,
				address = '',
				htmlAddresses = [];

			for (var i = 0, ii = items.length, item, addrType; i < ii; i++) {
				item = items[i];
				address = makeAddress(item) || '';
				addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';

				htmlAddresses.push((i + 1) + '. ' + addrType + ' ' + address);
			}


		});
	}

	function searchAddressToCoordinate(address) {
		naver.maps.Service.geocode({
			query: address
		}, function (status, response) {
			if (status === naver.maps.Service.Status.ERROR) {
				return alert('Something Wrong!');
			}

			if (response.v2.meta.totalCount === 0) {
				return alert('올바른 주소가 아닙니다!');
			}

			var htmlAddresses = [],
				item = response.v2.addresses[0],
				point = new naver.maps.Point(item.x, item.y);

			if (item.roadAddress) {
				htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
			}

			if (item.jibunAddress) {
				htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
			}

			if (item.englishAddress) {
				htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
			}

			marker.setPosition(point);
			location_now = point; // 현재 위치 변경
			circle.setMap(null); // 기존에 있는 원 삭제
			map.setCenter(point);
		});
	}

	function initGeocoder() {
		map.addListener('click', function (e) {
			searchCoordinateToAddress(e.coord);
		});

		$('#address').on('keydown', function (e) {
			var keyCode = e.which;

			if (keyCode === 13) { // Enter Key
				searchAddressToCoordinate($('#address').val());
			}
		});

		$('#submit_adr').on('click', function (e) {
			e.preventDefault();

			searchAddressToCoordinate($('#address').val());
		});

	}

	function makeAddress(item) {
		if (!item) {
			return;
		}

		var name = item.name,
			region = item.region,
			land = item.land,
			isRoadAddress = name === 'roadaddr';

		var sido = '',
			sigugun = '',
			dongmyun = '',
			ri = '',
			rest = '';

		if (hasArea(region.area1)) {
			sido = region.area1.name;
		}

		if (hasArea(region.area2)) {
			sigugun = region.area2.name;
		}

		if (hasArea(region.area3)) {
			dongmyun = region.area3.name;
		}

		if (hasArea(region.area4)) {
			ri = region.area4.name;
		}

		if (land) {
			if (hasData(land.number1)) {
				if (hasData(land.type) && land.type === '2') {
					rest += '산';
				}

				rest += land.number1;

				if (hasData(land.number2)) {
					rest += ('-' + land.number2);
				}
			}

			if (isRoadAddress === true) {
				if (checkLastString(dongmyun, '면')) {
					ri = land.name;
				} else {
					dongmyun = land.name;
					ri = '';
				}

				if (hasAddition(land.addition0)) {
					rest += ' ' + land.addition0.value;
				}
			}
		}

		return [sido, sigugun, dongmyun, ri, rest].join(' ');
	}

	function hasArea(area) {
		return !!(area && area.name && area.name !== '');
	}

	function hasData(data) {
		return !!(data && data !== '');
	}

	function checkLastString(word, lastString) {
		return new RegExp(lastString + '$').test(word);
	}

	function hasAddition(addition) {
		return !!(addition && addition.value);
	}

	naver.maps.onJSContentLoaded = initGeocoder;



	// HTML5 Geolocation API
	function onSuccessGeolocation(position) {
		var location = new naver.maps.LatLng(position.coords.latitude,
			position.coords.longitude);

		map.setCenter(location); // 얻은 좌표를 지도의 중심으로 설정합니다.
		map.setZoom(10); // 지도의 줌 레벨을 변경합니다.

		marker.setPosition(location); // marker 이동
		location_now = location; // 현재 위치 변경
	}

	function onErrorGeolocation() {
		var center = map.getCenter();

		infowindow.setContent('<div style="padding:20px;">' +
			'<h5 style="margin-bottom:5px;color:#f00;">Geolocation failed!</h5>' + "latitude: " + center.lat() + "<br />longitude: " + center.lng() + '</div>');

		infowindow.open(map, center);
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onSuccessGeolocation, onErrorGeolocation);
	} else {
		var center = map.getCenter();
		infowindow.setContent('<div style="padding:20px;"><h5 style="margin-bottom:5px;color:#f00;">Geolocation not supported</h5></div>');
		infowindow.open(map, center);
	}


});
