# backend/main-simple.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "OK", "message": "Azura Engine Simple Version"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0"}

@app.post("/api/test-upload")
async def test_upload(file: UploadFile = File(...)):
    try:
        # Read file
        contents = await file.read()
        
        # Just return file info
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(contents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)