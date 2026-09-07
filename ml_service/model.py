import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

def compute_income_prediction(
    transactions: List[Dict[str, Any]],
    horizon: str = "7d",
    demand_index: float = 1.05
) -> Dict[str, Any]:
    """
    Computes income prediction range (low, expected, high) and confidence for
    the requested horizon ('1d', '7d', '30d').
    Derived from user transaction history and demand conditions.
    """
    # Filter credit/gig income transactions
    income_txns = [
        t for t in transactions
        if t.get("type") == "CREDIT" or t.get("category") == "Gig Income" or t.get("type") == "credit"
    ]

    days_horizon = 1 if horizon == "1d" else (7 if horizon == "7d" else 30)

    if not income_txns:
        # Cold start fallback based on Chennai gig worker baseline
        base_daily = 950.0
        expected = base_daily * days_horizon * demand_index
        return {
            "horizon": horizon,
            "low_estimate": round(expected * 0.70, 2),
            "expected_estimate": round(expected, 2),
            "high_estimate": round(expected * 1.30, 2),
            "confidence": "low",
            "sample_days": 0
        }

    # Aggregate income by date
    daily_totals: Dict[str, float] = {}
    for t in income_txns:
        d = str(t.get("txn_date") or t.get("date"))[:10]
        amt = float(t.get("amount", 0))
        daily_totals[d] = daily_totals.get(d, 0.0) + amt

    values = list(daily_totals.values())
    sample_days = len(values)

    # Calculate statistics
    avg_daily = float(np.mean(values)) if values else 950.0
    std_daily = float(np.std(values)) if len(values) > 1 else (avg_daily * 0.25)

    # Horizon projections
    expected_daily = avg_daily * demand_index
    total_expected = expected_daily * days_horizon

    # Range calculation (point prediction +/- residual uncertainty)
    # std scales with sqrt(N) for independent daily sums
    scale_factor = np.sqrt(days_horizon)
    low_bound = max(total_expected * 0.5, total_expected - (1.4 * std_daily * scale_factor))
    high_bound = total_expected + (1.6 * std_daily * scale_factor)

    # Confidence rating based on history depth
    if sample_days >= 30:
        confidence = "high"
    elif sample_days >= 14:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "horizon": horizon,
        "low_estimate": float(round(low_bound, 2)),
        "expected_estimate": float(round(total_expected, 2)),
        "high_estimate": float(round(high_bound, 2)),
        "confidence": confidence,
        "sample_days": sample_days
    }


def compute_health_score(
    transactions: List[Dict[str, Any]],
    savings_balance: float = 0.0,
    has_aa_verified: bool = True
) -> Dict[str, Any]:
    """
    Computes explainable Financial Health Score (0-100) per TRD §5.2.
    Weights:
      - Income stability: 30%
      - Savings rate: 25%
      - Expense-to-income ratio: 20%
      - Data verification tier: 15%
      - Gig activity regularity: 10%
    """
    income_txns = [
        t for t in transactions
        if t.get("type") == "CREDIT" or t.get("category") == "Gig Income" or t.get("type") == "credit"
    ]
    debit_txns = [
        t for t in transactions
        if t.get("type") == "DEBIT" or t.get("type") == "debit"
    ]

    total_income = sum(float(t.get("amount", 0)) for t in income_txns)
    total_expense = sum(float(t.get("amount", 0)) for t in debit_txns)

    # 1. Income stability (inverse coefficient of variation) - 30%
    if income_txns:
        daily_incomes: Dict[str, float] = {}
        for t in income_txns:
            d = str(t.get("txn_date") or t.get("date"))[:10]
            daily_incomes[d] = daily_incomes.get(d, 0.0) + float(t.get("amount", 0))
        vals = list(daily_incomes.values())
        mean_inc = float(np.mean(vals))
        std_inc = float(np.std(vals)) if len(vals) > 1 else mean_inc * 0.3
        cv = (std_inc / mean_inc) if mean_inc > 0 else 1.0
        # Lower variance -> higher stability score
        stability_score = max(0.0, min(100.0, (1.0 - min(cv, 1.0)) * 100.0))
    else:
        stability_score = 45.0

    # 2. Savings rate (savings balance relative to monthly income) - 25%
    monthly_est = max(total_income, 25000.0)
    savings_ratio = (savings_balance / (monthly_est * 0.2)) if monthly_est > 0 else 0.0
    savings_score = max(0.0, min(100.0, savings_ratio * 100.0))
    if savings_score < 20.0 and savings_balance > 0:
        savings_score = 45.0

    # 3. Expense-to-income ratio - 20%
    if total_income > 0:
        ratio = total_expense / total_income
        # Ideal ratio < 0.70. If > 1.0, score diminishes
        if ratio <= 0.70:
            expense_score = 100.0
        elif ratio <= 0.90:
            expense_score = 80.0
        elif ratio <= 1.0:
            expense_score = 60.0
        else:
            expense_score = max(20.0, 60.0 - (ratio - 1.0) * 80.0)
    else:
        expense_score = 50.0

    # 4. Data verification tier - 15%
    if has_aa_verified:
        tier_score = 90.0
        verification_tier = "verified"
    else:
        tier_score = 50.0
        verification_tier = "basic"

    # 5. Gig activity regularity (active days frequency) - 10%
    unique_active_days = len(set(str(t.get("txn_date") or t.get("date"))[:10] for t in income_txns))
    regularity_score = min(100.0, (unique_active_days / 20.0) * 100.0) if unique_active_days else 40.0

    # Composite weighted score
    final_score = (
        (stability_score * 0.30) +
        (savings_score * 0.25) +
        (expense_score * 0.20) +
        (tier_score * 0.15) +
        (regularity_score * 0.10)
    )
    final_score = round(max(10.0, min(100.0, final_score)), 1)

    factors = {
        "income_stability": round(stability_score, 1),
        "savings_rate": round(savings_score, 1),
        "expense_ratio": round(expense_score, 1),
        "verification": round(tier_score, 1),
        "gig_activity_regularity": round(regularity_score, 1),
        "total_income_analyzed": round(total_income, 2),
        "total_expense_analyzed": round(total_expense, 2)
    }

    return {
        "score": final_score,
        "verification_tier": verification_tier,
        "factors": factors
    }
