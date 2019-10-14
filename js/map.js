$(document).ready(function () {
	
	var location_now; // 현재위치
	
	// naver map
	var mapOptions = {
		center: new naver.maps.LatLng(37.3595704, 127.105399),
		zoom: 10
	};
	
	var map = new naver.maps.Map('map', mapOptions);

	// marker
	var marker = new naver.maps.Marker({
		position: new naver.maps.LatLng(37.3595704, 127.105399),
		map: map
	});

	// 클릭한 지점으로 marker 이동
	naver.maps.Event.addListener(map, 'click', function (e) {
		marker.setPosition(e.latlng);
		location_now = e.latlng;	// 현재 위치 변경
	});



	// HTML5 Geolocation API
	var infowindow = new naver.maps.InfoWindow();


	function onSuccessGeolocation(position) {
		var location = new naver.maps.LatLng(position.coords.latitude,
			position.coords.longitude);

		map.setCenter(location); // 얻은 좌표를 지도의 중심으로 설정합니다.
		map.setZoom(10); // 지도의 줌 레벨을 변경합니다.

		marker.setPosition(location);	// marker 이동
		location_now = location;	// 현재 위치 변경
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
