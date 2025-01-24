var select = document.getElementById('select');
const inputElem = document.getElementById('range');
var example = document.getElementById('example');
let apiKey =document.getElementById('apiKey')

window.onload = function() {
    chrome.storage.local.get("chara", function (value){
        //select.options[value.chara].selected = true;
        console.log(value.chara);
    });
    chrome.storage.local.get("fontSize", function (value){
        example.style.fontSize = value.fontSize + "px";
        inputElem.value = value.fontSize;
    });
    inputElem.addEventListener('input', rangeOnChange);
    chrome.storage.local.get("apiKey", function (value){
        console.log(value.apiKey)
        if (!(typeof value.apiKey === "undefined")){
            apiKey.value = value.apiKey;
        }
    })
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

function inputChange(event){
    chrome.storage.local.set({ "apiKey": event.target.value});
}


apiKey.addEventListener("change", inputChange);


