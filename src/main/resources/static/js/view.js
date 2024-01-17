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
let latPoint = "";  // 위도
let lonPoint = "";  // 경도
let xPoint = "";    // 격자 x 포인트
let yPoint = "";    // 격자 y 포인트
let temp = document.getElementById('temp');
let sky = document.getElementById('sky');
let preciInfo = document.getElementById('preciInfo');
let windPowerInfo = document.getElementById('windPowerInfo');
let windPathInfo = document.getElementById('windPathInfo');
let humidityInfo = document.getElementById('humidityInfo');
let typeInfo = document.getElementById('typeInfo');
let sunimg = document.getElementById('sunimg');
let cloudimg = document.getElementById('cloudimg');
let cloudyimg = document.getElementById('cloudyimg');
let rainimg = document.getElementById('rainimg');
let snowimg = document.getElementById('snowimg');




document.addEventListener('DOMContentLoaded', function() {
    /* 지도 */
    fnSearchLocation();
    /* 검색 버튼 이벤트 */
    addEventListenerBtn();
    /* 엔터 이벤트 */
    enterEvent();
    /* 날씨 */
    //fnWeather();
});




/* 날씨 */

function fnWeather(){

    // 현재 날짜 구하기
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    let day = ('0' + currentDate.getDate()).slice(-2);
    let formattedDate = year + month + day;

    // 시간 구하기
    let hours = ('0' + currentDate.getHours()).slice(-2);
    let minutes = ('0' + (currentDate.getMinutes() - 30)).slice(-2);

    // 만약 minutes가 30보다 작으면 hours에서 1을 빼주기
    if (currentDate.getMinutes() < 30) {
        hours = ('0' + (currentDate.getHours() - 1)).slice(-2);
        minutes = ('0' + (currentDate.getMinutes() + 30)).slice(-2);
    }

    let formattedTime = hours + minutes;

    // 좌표를 격자 x,y point로 바꾸기
    let result = dfs_xy_conv("toXY", latPoint, lonPoint);
    console.log("X:", result.x, "Y:", result.y);

    xPoint = result.x;
    yPoint = result.y;




    var xhr = new XMLHttpRequest();
    var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst'; /*URL*/
    var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'0dWVH5wznCv7Za8PAFCoajykls1jhnhdz2wcTd459cNTxspNCwrjNEkMYvMpRVmowUOfcyYzEbgf02ClQeRl6g%3D%3D'; /*Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* 한 페이지 결과 수 */
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 응답자료형식 */
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(formattedDate); /* 발표일자 */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(formattedTime); /* 발표시각 */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(xPoint); /* 예보지점 X 좌표 */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(yPoint); /* 예보지점 Y 좌표 */
    xhr.open('GET', url + queryParams);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log("Success!");

                // JSON 파싱
                var jsonResponse = JSON.parse(this.responseText);

                // 필요한 정보 추출
                var items = jsonResponse.response.body.items.item;

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];

                    let intBaseTime =  Number(item.baseTime);

                    // 시간과 분으로 나누어 계산
                    let hours = Math.floor(intBaseTime / 100);
                    let minutes = intBaseTime % 100;

                    // 시간을 분 단위로 변환하고 30분을 더함
                    let adjustedTime = (hours * 60 + minutes + 30) % 2400;

                    // 시간과 분으로 다시 변환
                    let adjustedHours = Math.floor(adjustedTime / 60);
                    let adjustedMinutes = adjustedTime % 60;

                    // 문자열로 변환하여 예보시각으로 설정
                    let plusBaseTime = ('00' + adjustedHours).slice(-2) + ('00' + adjustedMinutes).slice(-2);

                    if(item.fcstTime == plusBaseTime) {

                        console.log("————————————————");
                        console.log("item: " + JSON.stringify(item));
                        console.log("자료구분코드: " + item.category);
                        console.log("예보일자: " + item.fcstDate);
                        console.log("예보시각: " + item.fcstTime);
                        console.log("예보값: " + item.fcstValue);



                        // 기온
                        if(item.category === 'T1H') {
                            temp.innerText = item.fcstValue;
                        }

                        // 강수
                        if(item.category === 'RN1'){
                            preciInfo.innerText = item.fcstValue;
                        }

                        // 습도
                        if(item.category === 'REH'){
                            humidityInfo.innerText = item.fcstValue;
                        }

                        // 풍향
                        if(item.category === 'VEC'){

                            let intVec = parseInt(item.fcstValue);
                            let windDircetion = Math.floor(((intVec + 22.5 * 0.5) / 22.5));

                            if(windDircetion === 0){
                                windPathInfo.innerText = "북풍";
                            }else if(windDircetion === 1){
                                windPathInfo.innerText = "북북동풍";
                            }else if(windDircetion === 2){
                                windPathInfo.innerText = "북동풍";
                            }else if(windDircetion === 3){
                                windPathInfo.innerText = "동북동풍";
                            }else if(windDircetion === 4){
                                windPathInfo.innerText = "동풍";
                            }else if(windDircetion === 5){
                                windPathInfo.innerText = "동남동풍";
                            }else if(windDircetion === 6){
                                windPathInfo.innerText = "남동풍";
                            }else if(windDircetion === 7){
                                windPathInfo.innerText = "남남동풍";
                            }else if(windDircetion === 8){
                                windPathInfo.innerText = "남풍";
                            }else if(windDircetion === 9){
                                windPathInfo.innerText = "남남서풍";
                            }else if(windDircetion === 10){
                                windPathInfo.innerText = "남서풍";
                            }else if(windDircetion === 11){
                                windPathInfo.innerText = "서남서풍";
                            }else if(windDircetion === 12){
                                windPathInfo.innerText = "서풍";
                            }else if(windDircetion === 13){
                                windPathInfo.innerText = "서북서풍";
                            }else if(windDircetion === 14){
                                windPathInfo.innerText = "북서풍";
                            }else if(windDircetion === 15){
                                windPathInfo.innerText = "북북서풍";
                            }else if(windDircetion === 16){
                                windPathInfo.innerText = "북풍";
                            }

                        }

                        // 풍속
                        if(item.category === 'WSD'){
                            windPowerInfo.innerText = item.fcstValue;
                        }


            /*            if(item.category === 'SKY'){
                            if(item.fcstValue === '1'){
                                sky.innerText = "맑음"
                                sunimg.style.display="";
                            }else if(item.fcstValue === '3'){
                                sky.innerText = "구름 많음"
                                cloudyimg.style.display="";
                            }else if(item.fcstValue === '4'){
                                sky.innerText = "흐림"
                                cloudimg.style.display="";
                            }
                        }*/

                        // 강수형태
                        if(item.category === 'PTY'){
                            if(item.fcstValue === '1'){
                                typeInfo.innerText = "비"
                                rainimg.style.display="";
                            }else if(item.fcstValue === '2'){
                                typeInfo.innerText = "비 / 눈"
                                rainimg.style.display="";
                            }else if(item.fcstValue === '3'){
                                typeInfo.innerText = "눈"
                                snowimg.style.display="";
                            }else if(item.fcstValue === '5'){
                                typeInfo.innerText = "빗방울"
                                rainimg.style.display="";
                            }else if(item.fcstValue === '6'){
                                typeInfo.innerText = "빗발울 / 눈날림"
                                snowimg.style.display="";
                            }else if(item.fcstValue === '7'){
                                typeInfo.innerText = "눈날림"
                                snowimg.style.display="";
                            }else if(item.fcstValue === '0'){
                                typeInfo.innerText = "맑음"
                                sunimg.style.display="";
                            }
                        }



                    }
                }

            } else {
                console.log("Error: " + this.status);
            }
        }
    };

    xhr.send('');
}

/** 위도, 경도를 x,y 격자 포인트로 변경 */
var RE = 6371.00877; // 지구 반경(km)
var GRID = 5.0; // 격자 간격(km)
var SLAT1 = 30.0; // 투영 위도1(degree)
var SLAT2 = 60.0; // 투영 위도2(degree)
var OLON = 126.0; // 기준점 경도(degree)
var OLAT = 38.0; // 기준점 위도(degree)
var XO = 43; // 기준점 X좌표(GRID)
var YO = 136; // 기1준점 Y좌표(GRID)

// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
function dfs_xy_conv(code, v1, v2) {
    // LCC DFS 좌표변환을 위한 기초 자료
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);
    var rs = {};
    if (code == "toXY") {
        rs['lat'] = v1;
        rs['lng'] = v2;
        var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        var theta = v2 * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;
        rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    }
    else {
        rs['x'] = v1;
        rs['y'] = v2;
        var xn = v1 - XO;
        var yn = ro - v2 + YO;
        ra = Math.sqrt(xn * xn + yn * yn);
        if (sn < 0.0) - ra;
        var alat = Math.pow((re * sf / ra), (1.0 / sn));
        alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

        if (Math.abs(xn) <= 0.0) {
            theta = 0.0;
        }
        else {
            if (Math.abs(yn) <= 0.0) {
                theta = Math.PI * 0.5;
                if (xn < 0.0) - theta;
            }
            else theta = Math.atan2(xn, yn);
        }
        var alon = theta / sn + olon;
        rs['lat'] = alat * RADDEG;
        rs['lng'] = alon * RADDEG;
    }
    return rs;

}


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

            // 위도, 경도
            let xValue = parseFloat(result[0].x);
            let yValue = parseFloat(result[0].y);

            latPoint = yValue;  // 위도
            lonPoint = xValue;  // 경도

            fnWeather();

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


                    latPoint = lat;  // 위도
                    lonPoint = lon;  // 경도

                    fnWeather();



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



