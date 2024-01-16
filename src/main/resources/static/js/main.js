"use strict";

let searchText = document.getElementById("searchText");   //검색어
let searchBtn = document.getElementById("searchBtn");     //검색 버튼

document.addEventListener("DOMContentLoaded", function(){
    /* 검색 버튼 이벤트 */
    addEventListenerBtn()
    /* 엔터 이벤트 */
    enterEvent();
})



function enterEvent(){
    searchText.addEventListener("keyup", function(event) {
        if (event.key === 'Enter') {
            fnSearchText();
        }
    });
}


function addEventListenerBtn(){
    searchBtn.addEventListener("click", fnSearchText);
}

function fnSearchText(){
    if(searchText.value.trim() != ""){
        window.location.href = "/view?location=" + encodeURIComponent(searchText.value);
    } else {
        alert ("장소를 입력해주세요");
    }
}


