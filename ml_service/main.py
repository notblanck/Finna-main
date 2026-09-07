import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model import compute_income_prediction, compute_health_score

app = FastAPI(
    title="FINNA ML Microservice",
    version="1.0.0",
    description="Income range prediction and Financial Health Scoring for Gig Workers"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictIncomeRequest(BaseModel):
    transactions: List[Dict[str, Any]] = Field(default_factory=list)
    horizon: str = Field(default="7d", description="'1d', '7d', or '30d'")
    demand_index: Optional[float] = Field(default=1.05)

class HealthScoreRequest(BaseModel):
    transactions: List[Dict[str, Any]] = Field(default_factory=list)
    savings_balance: Optional[float] = Field(default=0.0)
    has_aa_verified: Optional[bool] = Field(default=True)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "finna-ml-microservice"}

@app.post("/predict/income")
def predict_income(req: PredictIncomeRequest):
    try:
        horizon = req.horizon if req.horizon in ["1d", "7d", "30d"] else "7d"
        result = compute_income_prediction(
            transactions=req.transactions,
            horizon=horizon,
            demand_index=req.demand_index or 1.05
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score/health")
def calculate_health_score(req: HealthScoreRequest):
    try:
        result = compute_health_score(
            transactions=req.transactions,
            savings_balance=req.savings_balance or 0.0,
            has_aa_verified=req.has_aa_verified if req.has_aa_verified is not None else True
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
