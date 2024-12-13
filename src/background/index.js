chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.type === "toBackground"){
        const API_URL = 'aaa';
        const url = API_URL + '/' + message.data.toString();
        const res = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        });
        const result = await res.json();
        console.log(result)

        let id;

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            console.log({ tabs })
            id = tabs[0].id

            chrome.tabs.sendMessage(id, {
                type: 'toContent',
                data: result
            })
        });
    }
});