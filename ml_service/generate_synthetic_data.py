import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

PLATFORMS = ["Uber", "Ola", "Swiggy", "Zomato", "Zepto", "Blinkit", "Rapido"]
CATEGORIES_DEBIT = ["Fuel", "Food", "Rent", "EMI", "Mobile Recharge", "Maintenance", "Insurance", "Medical", "Personal"]

def generate_synthetic_transactions(days: int = 60, user_id: str = "demo-user") -> List[Dict[str, Any]]:
    """
    Generates realistic synthetic transaction history for a Chennai gig worker.
    Includes multi-platform payouts, weekend surge, weekly rest days, and living expenses.
    """
    transactions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        weekday = current_date.weekday() # 0=Monday, 6=Sunday
        is_weekend = weekday in [4, 5, 6] # Fri, Sat, Sun
        
        # 10% chance of rest day on Tuesday or Wednesday
        is_rest_day = (weekday in [1, 2]) and (random.random() < 0.25)
        
        if not is_rest_day:
            # 1 to 3 gig payouts per active working day
            num_payouts = random.randint(2, 4) if is_weekend else random.randint(1, 3)
            # Pick primary platform and secondary
            daily_platforms = random.sample(PLATFORMS, k=min(num_payouts, len(PLATFORMS)))
            
            for platform in daily_platforms:
                # Weekend multiplier 1.25x - 1.45x
                multiplier = random.uniform(1.2, 1.45) if is_weekend else 1.0
                base_amount = random.randint(350, 1100)
                amount = round(base_amount * multiplier, 2)
                
                transactions.append({
                    "date": date_str,
                    "description": f"{platform.upper()} PAYOUT - TRIP/DELIVERY",
                    "amount": amount,
                    "type": "CREDIT",
                    "category": "Gig Income",
                    "platform": platform.lower()
                })
        
        # Routine daily expenses
        if not is_rest_day:
            # Fuel expense (petrol for two-wheeler / cab)
            fuel_amt = round(random.uniform(200, 450), 2)
            transactions.append({
                "date": date_str,
                "description": "Indian Oil / Bharat Petroleum Fuel",
                "amount": fuel_amt,
                "type": "DEBIT",
                "category": "Fuel",
                "platform": None
            })
        
        # Food & tea/snacks
        if random.random() < 0.85:
            food_amt = round(random.uniform(80, 260), 2)
            transactions.append({
                "date": date_str,
                "description": "Tea & Meals - Saravana Bhavan / Local",
                "amount": food_amt,
                "type": "DEBIT",
                "category": "Food",
                "platform": None
            })
        
        # Monthly fixed commitments
        day_of_month = current_date.day
        if day_of_month == 5:
            # Rent
            transactions.append({
                "date": date_str,
                "description": "House Rent Transfer - Chennai",
                "amount": 7500.0,
                "type": "DEBIT",
                "category": "Rent",
                "platform": None
            })
        elif day_of_month == 7:
            # Bike / Vehicle EMI
            transactions.append({
                "date": date_str,
                "description": "Vehicle Finance EMI - Bajaj / TVS",
                "amount": 2350.0,
                "type": "DEBIT",
                "category": "EMI",
                "platform": None
            })
        elif day_of_month == 15:
            # Mobile recharge
            transactions.append({
                "date": date_str,
                "description": "Jio / Airtel Monthly Prepaid",
                "amount": 349.0,
                "type": "DEBIT",
                "category": "Mobile Recharge",
                "platform": None
            })
        elif day_of_month == 22 and random.random() < 0.6:
            # Vehicle maintenance / oil change
            transactions.append({
                "date": date_str,
                "description": "Two Wheeler Service & Oil Change",
                "amount": round(random.uniform(450, 950), 2),
                "type": "DEBIT",
                "category": "Maintenance",
                "platform": None
            })

        current_date += timedelta(days=1)

    return transactions

if __name__ == "__main__":
    txns = generate_synthetic_transactions(60)
    with open("synthetic_transactions.json", "w") as f:
        json.dump(txns, f, indent=2)
    print(f"Generated {len(txns)} realistic synthetic transactions.")
