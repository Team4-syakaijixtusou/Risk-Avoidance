window.addEventListener("load", () => {
    const observer = new MutationObserver(() => {
        // 少し待機してからボタンを処理
        setTimeout(() => {
            const allButtons = document.querySelectorAll("button");
            const buttonArray = Array.from(allButtons);

            // 条件に合うボタンをnewpostButtonArrayに追加
            const newpostButtonArray = buttonArray.filter(button => {
                const ariaLabel = button.getAttribute("aria-label");
                return ariaLabel === "新しい投稿" || ariaLabel === "New post" || ariaLabel === "Create New post" || ariaLabel === "新しい投稿を作成";
            });

            // ⑥ ボタンがクリックされた場合に画像を表示する処理
            newpostButtonArray.forEach(button => {
                button.addEventListener("click", image_appear);
            });

            // "Cancel"ボタンの処理
            const cancelButtonArray = buttonArray.filter(button => {
                const ariaLabel = button.getAttribute("aria-label");
                return ariaLabel === "Cancel";
            });

            cancelButtonArray.forEach(button => {
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
    if (!imgElement) { // 既に画像が存在していない場合のみ生成
        imgElement = document.createElement('img');

        // パスを修正
        imgElement.src = chrome.runtime.getURL('./images/image.png'); // URLを指定（パスに注意）

        // 初期スタイルを適用
        Object.assign(imgElement.style, {
            position: 'absolute',  // 絶対位置
            zIndex: '1000',        // 他の要素の上に表示
            width: '150px',        // 画像のサイズを指定
            height: '120px',
            opacity: '0.0',        // 不透明
        });

        // ページに追加
        document.body.appendChild(imgElement);

        // 位置を更新するintervalを設定
        positionUpdateInterval = setInterval(updateImagePosition, 100);

        // クリックイベントを登録
        imgElement.addEventListener('click', () => {
            // contenteditableなdiv要素を取得
            const editableDiv = document.querySelector('.tiptap');
            if (editableDiv) {
                const pElement = editableDiv.querySelector('p');
                if (pElement) {
                    const textContent = pElement.textContent;
                    console.log('取得したテキスト:', textContent);

                    // 取得したテキストを別の変数に格納 (例)
                    let extractedText = textContent;
                    chrome.runtime.sendMessage(
                        {
                            type: 'toBackground',
                            data: extractedText,
                        });
                    // TODO: 取得したテキストを使ってやりたいことをここに記述
                } else {
                    console.log('pタグが見つかりません。');
                }
            } else {
                console.log('contenteditableなdiv要素が見つかりません。');
            }
        });
    }
}

function remove_image() {
    if (imgElement) { // 画像が存在する場合のみ削除
        imgElement.remove();
        imgElement = null; // 参照をクリア

        // 位置更新のintervalを停止
        clearInterval(positionUpdateInterval);
    }
}

function updateImagePosition() {
    const publishButton = document.querySelector('button[aria-label="Publish post"]');
    if (publishButton) {
        const rect = publishButton.getBoundingClientRect(); // ボタンの位置を取得
        imgElement.style.top = `${rect.top + window.scrollY}px`; // ボタンのY座標
        imgElement.style.left = `${rect.left + window.scrollX}px`; // ボタンのX座標
    }
}


// gif画像を挿入するための要素を作成
let gifElement = document.createElement('img');

gifElement.id = 'character-image';

// パスを修正
gifElement.src = chrome.runtime.getURL('./images/image.png'); // GIFのURLを指定（パスに注意）

// 初期スタイルを適用
Object.assign(gifElement.style, {
    position: 'fixed',  // 固定位置
    left: '10px',       // 初期位置（左）
    top: '100px',        // 初期位置（上）
    zIndex: '1000',     // 他の要素の上に表示
    width: '150px',     // GIFのサイズを指定
    height: '150px',
    opacity: '1.0',     // 少し透明に
    cursor: 'grab'      // ドラッグ可能なことを示すカーソル
});

// ドラッグ用の変数
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// ドラッグ開始イベント
gifElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - gifElement.getBoundingClientRect().left;
    offsetY = e.clientY - gifElement.getBoundingClientRect().top;
    gifElement.style.cursor = 'grabbing'; // カーソルを変更
});

// ドラッグ中のイベント
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        gifElement.style.left = `${e.clientX - offsetX}px`;
        gifElement.style.top = `${e.clientY - offsetY}px`;
    }
});

// ドラッグ終了イベント
document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        gifElement.style.cursor = 'grab'; // カーソルを戻す
    }
});

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
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
        gifElement.style.left = '0px';
    }
    if (rect.top < 0) {
        gifElement.style.top = '0px';
    }
});

// ページに追加
document.body.appendChild(gifElement);




/*受け取ったテキストの量に応じて吹き出しの形状を調整し
その形状に応じて画像を生成し、吹き出しを画面に表示されている
キャラクター画像の上部に表示し、そのキャラクターがしゃべっているように表示するコード
Canvas APIを使用して、吹き出しの画像を生成し、テキストをその上に描画する*/

// 吹き出し要素を作成
const tooltipCanvas = document.createElement('canvas');
const closeButton = document.createElement('button');

// 吹き出しと閉じるボタンをページに追加
document.body.appendChild(tooltipCanvas);
document.body.appendChild(closeButton);

// キャラクター画像を取得
const characterImage = document.querySelector('#character-image'); // キャラクター画像のID
/*キャラクター画像のID（またはclass）を正しく設定する必要があります。
#character-imageは例ですので、実際のHTMLに合わせて変更してください。*/

const text="";
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.type === 'toContent'){
        text = message.data.toString();
    }
});
// Canvas要素のコンテキストを取得
const context = tooltipCanvas.getContext('2d');
// テキストの長さに基づいてキャンバスサイズを決定
const padding = 20;
const fontSize = 16;
const maxTextWidth = 300;  // テキストの最大幅
context.font = `${fontSize}px Arial`;
const textMetrics = context.measureText(text);
let textWidth = textMetrics.width;
let lines = 1;
// テキストが最大幅を超える場合は折り返し
if (textWidth > maxTextWidth) {
  lines = Math.ceil(textWidth / maxTextWidth);
  textWidth = maxTextWidth;
}
const lineHeight = fontSize + 10;
const canvasWidth = textWidth + padding * 2;
const canvasHeight = lineHeight * lines + padding * 2;
tooltipCanvas.width = canvasWidth;
tooltipCanvas.height = canvasHeight;
// 吹き出しの背景を描画
context.fillStyle = '#333';
context.strokeStyle = '#333';
context.lineWidth = 2;

// 吹き出しの形状（四角形＋下向きの三角形）を描画
const triangleHeight = 10;
const triangleWidth = 20;

context.beginPath();
context.moveTo(padding, padding);
context.lineTo(canvasWidth - padding, padding);
context.lineTo(canvasWidth - padding, canvasHeight - padding - triangleHeight);
context.lineTo(canvasWidth / 2 + triangleWidth / 2, canvasHeight - padding - triangleHeight);
context.lineTo(canvasWidth / 2, canvasHeight - padding);
context.lineTo(canvasWidth / 2 - triangleWidth / 2, canvasHeight - padding - triangleHeight);
context.lineTo(padding, canvasHeight - padding - triangleHeight);
context.closePath();
context.fill();
// テキストを描画
context.fillStyle = '#fff';
context.font = `${fontSize}px Arial`;
context.textAlign = 'center';
context.textBaseline = 'middle';
const x = canvasWidth / 2;
let y = padding + lineHeight / 2;

const words = text.split(' ');
let currentLine = '';
for (let i = 0; i < words.length; i++) {
  const word = words[i];
  const testLine = currentLine + word + ' ';
  const testWidth = context.measureText(testLine).width;
  
  if (testWidth > textWidth && currentLine !== '') {
    context.fillText(currentLine, x, y);
    currentLine = word + ' ';
    y += lineHeight;
  } else {
    currentLine = testLine;
  }
}
context.fillText(currentLine, x, y);
// 生成された吹き出しを画像として表示
const image = new Image();
image.src = tooltipCanvas.toDataURL();
document.body.appendChild(image);
// キャラクター画像の位置を取得
const characterRect = characterImage.getBoundingClientRect();
// 吹き出し画像をキャラクターの上部に表示
image.style.position = 'absolute';
image.style.left = `50px`; // キャラクターの中央上
image.style.top = `30px`; // キャラクターの上に少し余裕を持たせる
// 閉じるボタンのスタイル設定
closeButton.textContent = '×';  // 閉じるボタンのラベル
closeButton.style.position = 'absolute';
closeButton.style.left = `${image.style.left}px`;
closeButton.style.top = `${parseInt(image.style.top) - 30}px`;  // 吹き出しの上に表示
closeButton.style.fontSize = '20px';
closeButton.style.padding = '5px';
closeButton.style.cursor = 'pointer';
closeButton.style.backgroundColor = 'red';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '50%';

// 閉じるボタンをクリックしたときの動作
closeButton.addEventListener('click', () => {
  image.remove();  // 吹き出し画像を削除
  closeButton.remove();  // 閉じるボタンを削除
});
