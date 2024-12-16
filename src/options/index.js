var select = document.getElementById('select');

window.onload = function() {
    var select = document.getElementById('select');
    chrome.storage.local.get("chara", function (value){
        select.options[value.chara].selected = true;
        console.log(value.chara);
    });
}

select.onchange = function(){
    chrome.storage.local.set({ "chara": select.value });
}

