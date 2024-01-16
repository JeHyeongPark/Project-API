"use strict";

let mapContainer = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
let searchText = "";
let mapOption = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
    level: 3 //지도의 레벨(확대, 축소 정도)
};
let map = new kakao.maps.Map(mapContainer, mapOption); //지도 생성 및 객체 리턴
let searchBtn = document.getElementById('searchBtn');               //검색 버튼
let searchTextView = document.getElementById('searchTextView');     //검색어

document.addEventListener('DOMContentLoaded', function() {
    /* 지도 */
    fnSearchLocation();
    /* 검색 버튼 이벤트 */
    addEventListenerBtn();
    /* 엔터 이벤트 */
    enterEvent();
});


function enterEvent(){
    searchTextView.addEventListener("keyup", function(event) {
        if (event.key === 'Enter') {
            fnSearchBtn();
        }
    });
}


function addEventListenerBtn(){
    searchBtn.addEventListener("click", fnSearchBtn);
}


function fnSearchBtn(){
    if(searchTextView.value.trim() != ""){
    let url = new URL(window.location.href);
    url.searchParams.set("location", searchTextView.value.trim());
    window.history.replaceState({}, "", url);
    } else {
        alert ("장소를 입력해주세요");
    }
    window.location.reload();
}



function fnSearchLocation(){
    let locationParam = new URLSearchParams(window.location.search);
    searchText = locationParam.get("location");

    searchTextView.value = searchText;

    let geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(searchText, function(result, status) {

        // 정상적으로 검색이 완료됐으면
        if (status === kakao.maps.services.Status.OK) {

            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            // 결과값으로 받은 위치를 마커로 표시합니다
            var marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 인포윈도우로 장소에 대한 설명을 표시합니다
            var infowindow = new kakao.maps.InfoWindow({
                content: '<div style="width:150px;text-align:center;padding:6px 0;">'+searchText+'</div>'
            });
            infowindow.open(map, marker);

            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
            map.setCenter(coords);
        } else {
            if(navigator.geolocation){

                searchTextView.value = "현재 위치";

                // GeoLocation을 이용해서 접속 위치를 얻어옵니다
                navigator.geolocation.getCurrentPosition(function (position){
                    let lat = position.coords.latitude; // 경도
                    let lon = position.coords.longitude;  // 위도

                    coords = new kakao.maps.LatLng(lat, lon);
                    marker = new kakao.maps.Marker({
                        map: map,
                        position: coords
                    });

                    infowindow = new kakao.maps.InfoWindow({
                        content: '<div style="width:150px;text-align:center;padding:6px 0;">현재 위치</div>'
                    })
                    infowindow.open(map, marker);
                    map.setCenter(coords);



                }, function (error){
                    alert("check your location allow");
                })
            }
        }
    });
}


