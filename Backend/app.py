from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import requests
import os

app = FastAPI(title="Land Cover Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_URL = "https://mahmoudiraqi21-land-cover-calssification.hf.space/predict"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate it's an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    image_bytes = await file.read()

    try:
        response = requests.post(
            HF_URL,
            files={"file": (file.filename, image_bytes, file.content_type)},
            timeout=30,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Model timed out. The HF Space may be waking up — try again in 30 seconds.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Could not reach model: {str(e)}")

    return JSONResponse(content=response.json())


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve frontend — must be last
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
