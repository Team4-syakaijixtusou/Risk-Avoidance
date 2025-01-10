var select = document.getElementById('select');
const inputElem = document.getElementById('range');
var example = document.getElementById('example');

window.onload = function() {
    chrome.storage.local.get("chara", function (value){
        select.options[value.chara].selected = true;
        console.log(value.chara);
    });
    chrome.storage.local.get("fontSize", function (value){
        example.style.fontSize = value.fontSize + "px";
        inputElem.value = value.fontSize;
    })
    inputElem.addEventListener('input', rangeOnChange);
}

const rangeOnChange = (event) =>{
    chrome.storage.local.set({ "fontSize": event.target.value});
    chrome.storage.local.get("fontSize", function (value){
        example.style.fontSize = value.fontSize + "px";
        console.log(value.fontSize);
    })
}

select.onchange = function(){
    chrome.storage.local.set({ "chara": select.value });
}


