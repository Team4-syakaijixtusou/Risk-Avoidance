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

function image_appear() {
  if (!imgElement) {
    // 既に画像が存在していない場合のみ生成
    imgElement = document.createElement("img");

    // パスを修正
    imgElement.src = chrome.runtime.getURL("./images/image.png"); // URLを指定（パスに注意）

    // 初期スタイルを適用
    Object.assign(imgElement.style, {
      position: "absolute", // 絶対位置
      zIndex: "1000", // 他の要素の上に表示
      width: "150px", // 画像のサイズを指定
      height: "120px",
      opacity: "0.0", // 不透明
    });

    // ページに追加
    document.body.appendChild(imgElement);

    // 位置を更新するintervalを設定
    positionUpdateInterval = setInterval(updateImagePosition, 100);

    // クリックイベントを登録
    imgElement.addEventListener("click", () => {
      // contenteditableなdiv要素を取得
      const editableDiv = document.querySelector(".tiptap");
      if (editableDiv) {
        const pElement = editableDiv.querySelector("p");
        if (pElement) {
          const textContent = pElement.textContent;
          console.log("取得したテキスト:", textContent);

          // 取得したテキストを別の変数に格納 (例)
          let extractedText = textContent;
          chrome.runtime.sendMessage({
            type: "toBackground",
            data: extractedText
          });
          // TODO: 取得したテキストを使ってやりたいことをここに記述
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