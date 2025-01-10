window.addEventListener("load", () => {
  const observer = new MutationObserver(() => {
    // 少し待機してからボタンを処理
    setTimeout(() => {
      const allButtons = document.querySelectorAll("button");
      const buttonArray = Array.from(allButtons);

      // 条件に合うボタンをnewpostButtonArrayに追加
      const newpostButtonArray = buttonArray.filter((button) => {
        const ariaLabel = button.getAttribute("aria-label");
        return (
          ariaLabel === "新しい投稿" ||
          ariaLabel === "New post" ||
          ariaLabel === "Create New post" ||
          ariaLabel === "新しい投稿を作成"
        );
      });

      // ⑥ ボタンがクリックされた場合に画像を表示する処理
      newpostButtonArray.forEach((button) => {
        button.addEventListener("click", image_appear);
      });

      // "Cancel"ボタンの処理
      const cancelButtonArray = buttonArray.filter((button) => {
        const ariaLabel = button.getAttribute("aria-label");
        return ariaLabel === "Cancel";
      });

      cancelButtonArray.forEach((button) => {
        button.addEventListener("click", remove_image);
      });
    }, 100); // 少し遅延させてから実行
  });

  // DOMの変化を監視 (ボタン要素が追加されるときなど)
  observer.observe(document.body, { childList: true, subtree: true });
});

let imgElement; // グローバル変数で管理
let positionUpdateInterval; // 位置更新用のinterval

let isImageClicked = false; // 画像がクリックされたかどうかを判定するフラグ
let isPostButtonClicked = false;

function image_appear() {
  if (!imgElement) {
    // 既に画像が存在していない場合のみ生成
    imgElement = document.createElement("img");

    // パスを修正
    imgElement.src = chrome.runtime.getURL("./images/yukkuri.jpg"); // URLを指定（パスに注意）

    // 初期スタイルを適用
    Object.assign(imgElement.style, {
      position: "absolute", // 絶対位置
      zIndex: "1000", // 他の要素の上に表示
      width: "150px", // 画像のサイズを指定
      height: "120px",
      opacity: "0.0", // 不透明
      webkitUserDrag: "none", // ドラッグ時に画像が添付されない
    });

    // ページに追加
    document.body.appendChild(imgElement);

    // 位置を更新するintervalを設定
    positionUpdateInterval = setInterval(updateImagePosition, 100);

    // クリックイベントを登録
    imgElement.addEventListener("click", () => {
      if (isImageClicked) {
        console.log("画像はすでにクリックされています。リクエストをスキップします。");
        return; // クリック済みならリクエストをスキップ
      }

      isImageClicked = true; // クリック済みに設定
      // contenteditableなdiv要素を取得
      const editableDiv = document.querySelector(".tiptap");
      if (editableDiv) {
        const pElement = editableDiv.querySelector("p");
        if (pElement) {
          const textContent = pElement.textContent;
          console.log("取得したテキスト:", textContent);

          // キャラクターが、AIの返答を待っていることを示すメッセージを表示
          updateTooltip("AIの返答を待っています...");

          // 取得したテキストをAPIに送信
          let extractedText = textContent;
          chrome.runtime.sendMessage({
            type: "toBackground",
            data: extractedText
          });

          // APIから受け取ったJsonを処理
          // 修正箇所: AIからのスコアを評価して画像を削除
          chrome.runtime.onMessage.addListener(async function (
            request,
            sender,
            sendResponse
          ) {
            if (request.type === "toContent") {
              console.log(
                `Received contents: ${request.data.contents}`
              );
          
              const standardscore = 50; // 閾値を設定
          
              // 「危険度スコア: n」を正規表現で抽出
              const scoreMatch = request.data.contents.match(/危険度スコア\s*:\s*(\d+)/);
              if (scoreMatch) {
                const receivedScore = parseInt(scoreMatch[1], 10); // スコアを数値として取得
                console.log(`Extracted score: ${receivedScore}`);
          
                if (receivedScore <= standardscore) {
                  console.log("危険度が低いため、画像を削除します。");
                  remove_image(); // 閾値以下なら画像を削除
                }
              } else {
                console.log("危険度スコアが含まれていません。");
              }
            }
          });
          

        } else {
          console.log("pタグが見つかりません。");
        }
      } else {
        console.log("contenteditableなdiv要素が見つかりません。");
      }
    });
  }
}

function remove_image() {
  if (imgElement) {
    // 画像が存在する場合のみ削除
    imgElement.remove();
    imgElement = null; // 参照をクリア

    // 位置更新のintervalを停止
    clearInterval(positionUpdateInterval);
  }
}

function updateImagePosition() {
  const publishButton = document.querySelector(
    'button[aria-label="Publish post"]'
  );
  if (publishButton) {
    const rect = publishButton.getBoundingClientRect(); // ボタンの位置を取得
    imgElement.style.top = `${rect.top + window.scrollY}px`; // ボタンのY座標
    imgElement.style.left = `${rect.left + window.scrollX}px`; // ボタンのX座標
  }
}

