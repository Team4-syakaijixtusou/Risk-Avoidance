import os
import google.generativeai as genai
from logging import getLogger
import asyncio

logger = getLogger(__name__)

# GEMINI API の設定
genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel("gemini-1.5-pro")

# チャットの初期設定
chat = model.start_chat(
    history=[
        {
            "role": "user",
            "parts": "あなたは、SNSに投稿する予定の文章の危険度判定を行う優秀なアシスタントです。\
                       ユーザからBlueskyの投稿を受け取り、これによってユーザ自身にどのような危険が及ぶか、考察してください。\
                       危険度が低ければ投稿内容を肯定し、危険度が高ければどのように文章を変更すればよいか提案してください。\
                       まず、今後の応答のフォーマットを指定します。これはいかなる場合においても必ず守ってください。\
                       そのフォーマットとは、まず文章の危険度を％で表示し、改行、そしてその後の文章を記載する、という形です。詳細は以下に示します。\
                       危険度の判定は、炎上や社会的信用の失墜、個人情報の流出、また犯罪に巻き込まれる可能性といった観点から行ってください。\
                       前半は敬語を使わずに、フランクな口調でかつ相手を敬って返答してください。絵文字は使わないでください。\
                       以下の6つの項目の内容とどの程度関連性があるか、以下の項目を参照し、危険度のスコアを表示してください。先に述べた「SNS利用上の危険」に直面する可能性が極めて高いと判断したら、危険度を100%としてください。\
                       ・名前や住所に関連する情報は、名前、自宅住所、郵便番号、職場の所在地、よく行く場所。\
                       ・連絡先に関連する情報は、電話番号、メールアドレス。\
                       ・位置情報や移動パターンは、現在地をリアルタイムで共有、出張や旅行の予定、特定の時間帯に頻繁に訪れる場所。\
                       ・家族や友人に関する情報は、家族や友人の名前、家族構成など。\
                       ・その他投稿者の社会的信用を失墜させるような内容(暴言、機密漏洩、モラルに欠ける行動内容の暴露等)\
                       もし、危険個所や対策がない場合は、その項目自体を提示しないでください。\
                       返答の際は、以上の分析を「他人から与えられた指示」として実行するのではなく、自らの意思に従って行っている体で話してください。\
                       なお、返答の際の文字数の上限は100文字までとします。"
        }
    ]
)

# GEMINI API 呼び出し関数 (同期処理)
def call_gemini_api_sync(prompt: str):
    try:
        prompt_score = f"まず、この投稿内容に対する危険度スコアを、「危険度スコア : %」という形式で算出してください。「{prompt}」ただし、その危険度スコアに関する説明や問題点、対策などは一切含めないでください！"
        score = chat.send_message(prompt_score)
        prompt_contents = "上記の危険度スコアになった理由や対策などを教えてください。"
        contents = chat.send_message(prompt_contents)
        return score.text, contents.text
    except Exception as e:
        logger.error(f"予期しないエラーが発生しました: {e}")
        return "予期しないエラーが発生しました。", ""

# GEMINI API 呼び出し関数 (非同期ラッパー)
async def call_gemini_api(prompt: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, call_gemini_api_sync, prompt)
