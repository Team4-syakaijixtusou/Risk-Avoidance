from fastapi import FastAPI, HTTPException
import gemini
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/ai/{text}")
async def calling_AI(text: str):
    try:
        # タイムアウト付き非同期処理
        score, contents = await asyncio.wait_for(
            gemini.call_gemini_api(text),
            timeout=20  # タイムアウト時間を10秒に設定
        )
        return {
            "score": score,
            "contents": contents
        }
    except asyncio.TimeoutError:
        logger.error("Gemini APIの応答が遅すぎます")
        raise HTTPException(status_code=504, detail="Gemini APIの応答が遅すぎます")
    except Exception as e:
        logger.error(f"Gemini APIでエラーが発生: {e}")
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
