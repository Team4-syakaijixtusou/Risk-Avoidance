/*キャラクターのコード */
// gif画像を挿入するための要素を作成
let gifElement = document.createElement("img");

let charaNum;
// パスを修正
chrome.storage.local.get("chara", function (value){
  charaNum = value.chara;
});
let charaUrl;
if (charaNum === 0 || typeof charaNum === "undefined"){
  charaUrl = "./images/firefighter_bear.png";
} else if (charaNum === 1){
  charaUrl = "./images/firefighter_bear.gif";
}else if (charaNum === 2){
  charaUrl = "./images/firefighter_bear.gif";
}
gifElement.src = chrome.runtime.getURL(charaUrl); // GIFのURLを指定（パスに注意）

// 初期スタイルを適用
Object.assign(gifElement.style, {
  position: "fixed", // 固定位置
  left: "10px", // 初期位置（左）
  top: "30px", // 初期位置（上）
  zIndex: "1000", // 他の要素の上に表示
  width: "150px", // GIFのサイズを指定
  height: "150px",
  opacity: "1.0", // 少し透明に
  cursor: "grab", // ドラッグ可能なことを示すカーソル
  webkitUserDrag: "none", // ドラッグ時に画像が添付されない
});

// ドラッグ用の変数
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// ドラッグ開始イベント
gifElement.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - gifElement.getBoundingClientRect().left;
  offsetY = e.clientY - gifElement.getBoundingClientRect().top;
  gifElement.style.cursor = "grabbing"; // カーソルを変更

  e.stopPropagation(); // イベントの伝播を止める
});

// ドラッグ中のイベント
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    gifElement.style.left = `${e.clientX - offsetX}px`;
    gifElement.style.top = `${e.clientY - offsetY}px`;

    e.stopPropagation(); // イベントの伝播を止める
  }
});

// ドラッグ終了イベント
document.addEventListener("mouseup", (e) => {
  if (isDragging) {
    isDragging = false;
    gifElement.style.cursor = "grab"; // カーソルを戻す

    e.stopPropagation(); // イベントの伝播を止める
  }
});

// ウィンドウリサイズ時の処理
window.addEventListener("resize", () => {
  const rect = gifElement.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 画像がウィンドウ外に出ないよう位置を調整
  if (rect.right > windowWidth) {
    gifElement.style.left = `${windowWidth - rect.width}px`;
  }
  if (rect.bottom > windowHeight) {
    gifElement.style.top = `${windowHeight - rect.height}px`;
  }
  if (rect.left < 0) {
    gifElement.style.left = "0px";
  }
  if (rect.top < 0) {
    gifElement.style.top = "0px";
  }
});

// ページに追加
document.body.appendChild(gifElement);

/*キャラクターのコード */
