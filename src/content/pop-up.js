// 吹き出し要素を作成
const tooltipCanvas = document.createElement('canvas');
const closeButton = document.createElement('button');

// 初期テキスト
let text = "こんにちは！僕はファイアファイターベア！あなたのSNSを安全にします！";

// テキストスタイルとキャンバスサイズを設定
const padding = 10;
let fontSize = 17;
chrome.storage.local.get("fontSize", function (value){
  if (!typeof value.fontSize === undefined){
    fontSize = value.fontSize;
  }
})
const maxTextWidth = fontSize * 15; // fontSizeに基づいて最大幅を設定
const maxCharsPerLine = 17; // 1行あたりの最大文字数
const lineHeight = fontSize + 10;

function updateTooltip(newText) {
  text = newText || text;

  const context = tooltipCanvas.getContext('2d');
  context.font = `${fontSize}px Arial`;

  // テキストを指定された文字数ごとに分割
  const lines = [];
  for (let i = 0; i < text.length; i += maxCharsPerLine) {
    lines.push(text.slice(i, i + maxCharsPerLine));
  }

  // 独立した変数でキャンバスサイズを管理
  let canvasWidth, canvasHeight;
  canvasWidth = maxTextWidth + padding * 2;
  canvasHeight = lineHeight * lines.length + padding * 2 + 10; // 吹き出し用三角形の高さ

  // 解像度スケール対応
  const resolutionScale = 2; // 解像度スケール（2倍の場合）
  tooltipCanvas.width = canvasWidth * resolutionScale;
  tooltipCanvas.height = canvasHeight * resolutionScale;

  // スケール設定
  context.scale(resolutionScale, resolutionScale);

  // 吹き出し背景を描画（スケール考慮）
  context.fillStyle = '#333';
  context.beginPath();
  context.moveTo(padding, padding);
  context.lineTo(canvasWidth - padding, padding);
  context.lineTo(canvasWidth - padding, canvasHeight - padding - 10);
  context.lineTo(canvasWidth / 2 + 10, canvasHeight - padding - 10);
  context.lineTo(canvasWidth / 2, canvasHeight - padding);
  context.lineTo(canvasWidth / 2 - 10, canvasHeight - padding - 10);
  context.lineTo(padding, canvasHeight - padding - 10);
  context.closePath();
  context.fill();

  // テキストを描画（スケール考慮）
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  let y = padding + lineHeight / 2;
lines.forEach((line) => {
  context.fillText(line, canvasWidth / 2, y);
  y += lineHeight;
});


  // 吹き出し画像として表示
  const image = document.querySelector('img[data-tooltip]') || new Image();
  image.src = tooltipCanvas.toDataURL();

  // 独立した変数で画像サイズを管理
  const imageWidth = 500;
  const imageHeight = canvasHeight;

  image.style.position = 'fixed';
  image.style.zIndex = '999';
  image.style.width = `${imageWidth}px`; // キャンバスサイズから取得
  image.style.webkitUserDrag = "none"; // ドラッグ時に画像が添付されない
  // image.style.height = `${imageHeight}px`; // キャンバスサイズから取得
  image.dataset.tooltip = true;

  // キャラクター画像を特定
  const characterImage = document.querySelector('img[src*="/images/apng.png"]');

  if (characterImage) {
    const updateTooltipPosition = () => {
      const characterRect = characterImage.getBoundingClientRect();
      image.style.left = `${characterRect.left + characterRect.width / 2 - imageWidth / 2}px`;
      image.style.top = `${characterRect.top - imageHeight - 10}px`;

      closeButton.style.left = `${parseInt(image.style.left) + imageWidth - 20}px`;
      closeButton.style.top = `${parseInt(image.style.top) - 20}px`;
    };

    updateTooltipPosition();

    const observer = new MutationObserver(updateTooltipPosition);
    observer.observe(characterImage, { attributes: true, childList: true, subtree: true });

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition);
  }

  document.body.appendChild(image);
}

// 初期描画
updateTooltip(text);

// 吹き出し画像と閉じるボタンをページに追加
document.body.appendChild(closeButton);

// 閉じるボタンのスタイル設定
closeButton.textContent = '×';
closeButton.style.position = 'fixed';
closeButton.style.fontSize = '14px';
closeButton.style.padding = '5px';
closeButton.style.cursor = 'pointer';
closeButton.style.backgroundColor = 'red';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '50%';

// 閉じるボタンのクリック動作
closeButton.addEventListener('click', () => {
  const image = document.querySelector('img[data-tooltip]');
  if (image) image.remove();
  closeButton.remove();
});

// 外部から文字列を受け取り吹き出しを更新
window.addEventListener('message', (event) => {
  if (typeof event.data === 'string') {
    updateTooltip(event.data);
  }
});

// APIから受け取ったjsonを処理
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type === "toContent") {
    console.log(
      `Score: ${request.data.score}\nContents: ${request.data.contents}`,
      updateTooltip(request.data.contents)
    );
  }}
);

