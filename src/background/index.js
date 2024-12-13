chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  if (message.type === "toBackground") {
    // urlはローカルサーバーのURLとしている
    const API_URL = "http://localhost:8000/ai/";
    const url = API_URL + message.data.toString();
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
    });
    const result = await res.json();

    let id;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log({ tabs });
      id = tabs[0].id;

      chrome.tabs.sendMessage(id, {
        type: "toContent",
        data: result,
      });
    });
  }
});
