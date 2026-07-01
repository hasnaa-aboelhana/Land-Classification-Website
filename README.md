# Land Cover Classifier

EYOUTH Graduation Project · CAI4_AIS2_S13  
Supervised by Eng. Mahmoud Talaat

## Project structure

```
land-classifier/
├── backend/
│   └── app.py          ← FastAPI server
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── requirements.txt
└── README.md
```

## Run locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server (run from the root folder)
uvicorn backend.app:app --reload

# 3. Open in browser
# http://localhost:8000
```

## Deploy on Render

1. Push this whole folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set these fields:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn backend.app:app --host 0.0.0.0 --port 8000`
5. Click Deploy — Render gives you a live https URL in ~2 minutes

## API endpoint

`POST /predict`  
Accepts: `multipart/form-data` with a field named `file`  
Returns: `{"prediction": "Forest", "confidence": 0.98}`
