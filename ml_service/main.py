import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from model import compute_income_prediction, compute_health_score
from inference import predict_profile, get_baselines, get_model_package

app = FastAPI(
    title="FINNA ML Microservice",
    version="1.2.0",
    description="City-level XGBoost Financial Profile Estimation, Income Prediction, and Health Scoring for Gig Workers"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictProfileRequest(BaseModel):
    state: str = Field(default="Tamil Nadu", description="Indian state or union territory")
    city: str = Field(default="Chennai", description="City name")
    platform: Optional[str] = Field(default="delivery", description="Primary gig platform/type: delivery, ride_hailing, freelance_other, mixed")
    hours: Optional[float] = Field(default=45.0, description="Typical weekly hours (e.g. 45)")

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
    pkg = get_model_package()
    return {
        "status": "ok",
        "service": "finna-ml-microservice",
        "version": "1.2.0",
        "model_loaded": pkg is not None,
        "model_version": pkg.get("version", "v1.2.0") if pkg else "v1.2.0-baseline"
    }

@app.post("/predict")
def predict_city_financial_profile(req: PredictProfileRequest):
    """
    Predicts financial profile for a gig partner given state, city, platform, and weekly hours.
    Blends trained XGBoost regressors with city-level dataset averages.
    Returns estimates, range intervals, baseline comparison, and confidence metadata.
    """
    try:
        result = predict_profile(
            state=req.state,
            city=req.city,
            platform=req.platform or "delivery",
            hours=req.hours or 45.0
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cities")
def get_supported_cities():
    """
    Returns the catalog of supported states and cities with their city tiers and cost of living index.
    """
    try:
        baselines = get_baselines()
        city_baselines = baselines.get("city_baselines", {})
        state_map: Dict[str, List[Dict[str, Any]]] = {}

        for city_name, c_info in city_baselines.items():
            st = c_info.get("state", "Other")
            if st not in state_map:
                state_map[st] = []
            state_map[st].append({
                "city": city_name,
                "tier": c_info.get("city_tier", "Tier 2"),
                "cost_of_living_index": c_info.get("cost_of_living_index", 100.0)
            })

        # Sort cities in each state
        for st in state_map:
            state_map[st].sort(key=lambda x: x["city"])

        return {
            "states": sorted(list(state_map.keys())),
            "cities_by_state": state_map,
            "total_cities": len(city_baselines)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Backward compatible endpoints
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
