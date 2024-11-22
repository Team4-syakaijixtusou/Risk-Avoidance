/*BlueSkyのUIが動的に変わる場合、
data-testid属性や一意な部分のあるセレクター
（例: buttonタグの位置をもとに指定）を使います。
システムに組み込むときにその部分変更したほうがいいかも*/

// 透明な画像を作成
const overlayImage = document.createElement('img');
overlayImage.src = 'post.png'; // 透明な画像のURLを指定、もしくは空のまま
overlayImage.style.position = 'absolute';
overlayImage.style.width = '100%';
overlayImage.style.height = '100%';
overlayImage.style.top = '0';
overlayImage.style.left = '0';
overlayImage.style.cursor = 'pointer';
overlayImage.style.zIndex = '10'; // 投稿ボタンより前面に表示

// BlueSkyの「投稿」ボタンを取得してその位置に配置
const postButton = document.querySelector('[data-testid="composerPublishBtn"]'); // 投稿ボタンの正確なセレクターを指定
postButton.style.position = 'relative'; // 位置を相対的に調整
postButton.appendChild(overlayImage);

// 画像クリック時にAIへ通知を実行
overlayImage.addEventListener('click', (e) => {
    e.preventDefault();
    alert("投稿ボタンがクリックされました！"); // 通知を表示

    // ここに必要なAIへの通知処理を追加

});


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

// メッセージのリスニング
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'showTooltip') {
    const text = message.text;

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
    image.style.left = `${characterRect.left + characterRect.width / 2 - canvasWidth / 2}px`; // キャラクターの中央上
    image.style.top = `${characterRect.top - canvasHeight - 10}px`; // キャラクターの上に少し余裕を持たせる

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
  }
});
