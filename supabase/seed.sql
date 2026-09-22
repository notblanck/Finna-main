-- ==============================================================================
-- FINNA Seed Data
-- Reference Data: Privileges, Marketplace Products, Side Hustle Opportunities
-- ==============================================================================

-- 1. Privileges (Government Schemes & Platform Welfare Programs)
insert into public.privileges (id, scope, platform, title, description, eligibility_criteria, apply_link)
values
  ('53628c8e-460a-439c-908a-860ba2f5e7aa', 'common', null, 'e-Shram Social Security Registration', 'National database of unorganised workers in India providing accident insurance cover of ₹2 Lakh (PMSBY) and direct social security eligibility.', 'Any gig or platform worker aged 16-59 with Aadhaar and active mobile number.', 'https://eshram.gov.in'),
  ('00faa2a4-2eef-431a-81eb-e992ad112194', 'common', null, 'PM-SYM (Pradhan Mantri Shram Yogi Maan-dhan)', 'Voluntary old age pension scheme guaranteeing ₹3,000 monthly pension after age 60 with 50% government co-contribution.', 'Gig workers aged 18-40 with monthly income below ₹15,000.', 'https://maandhan.in'),
  ('ba767712-28cf-4f60-a7f6-340c2a737ae0', 'common', null, 'Tamil Nadu Gig Workers Welfare Board', 'State-level welfare fund providing healthcare assistance, education grants for children, and maternal benefits for delivery and ride-share workers in Tamil Nadu.', 'Active gig delivery or transport worker operating in Tamil Nadu with valid ID proof.', 'https://labour.tn.gov.in'),
  ('28554ea2-7749-405d-958a-5b521b743a5f', 'platform_specific', 'uber', 'Uber Care Partner Support Programme', 'Micro-insurance covering medical hospitalization up to ₹1,00,000 and vehicle damage support for active driver partners.', 'Completed minimum 25 trips in the preceding 30 days on Uber.', 'https://www.uber.com/in/en/drive/insurance/'),
  ('a2613276-de52-43b9-b00e-fc38c0d39a30', 'platform_specific', 'zomato', 'Zomato Delivery Partner Medical & Term Cover', 'Comprehensive accident insurance up to ₹10 Lakhs, OPD consultation discounts, and support fund for female delivery partners.', 'Active onboarding status with at least 1 shift logged weekly.', 'https://www.zomato.com/delivery-partner'),
  ('85663e92-3fa3-45ab-843b-b789a93996a3', 'platform_specific', 'swiggy', 'Swiggy Delivery Partner Relief Shield', 'Cashless emergency hospitalization, children scholarship programs, and fuel discount tie-ups with Indian Oil Corporation.', 'Silver or Gold tier delivery partner based on monthly order completion.', 'https://ride.swiggy.com'),
  ('6e1018dc-c42d-4ea8-be4b-fb6c27efd62a', 'platform_specific', 'rapido', 'Rapido Captain Welfare Protection', 'Daily accidental disability allowance and helmet subsidy protection for bike-taxi captains.', 'Verified Rapido Captain profile with valid two-wheeler license.', 'https://www.rapido.bike/captain')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  eligibility_criteria = excluded.eligibility_criteria,
  apply_link = excluded.apply_link;

-- 2. Marketplace Products (Insurance & Credit Lines)
insert into public.marketplace_products (id, product_type, name, provider, relevant_platforms, min_health_score, description)
values
  ('af1fdf8d-87dc-4330-b322-0cbd23be84a1', 'insurance', 'Gig Rider Personal Accident Shield', 'ICICI Lombard', array['uber', 'ola', 'rapido', 'swiggy', 'zomato', 'zepto', 'blinkit'], 45, '₹5 Lakh accidental death and permanent total disability cover with daily hospital cash benefit of ₹1,000 for up to 30 days.'),
  ('2907c67c-8ac4-45c5-895d-c32b75bca403', 'insurance', 'Commercial Two-Wheeler Comprehensive', 'Digit Insurance', array['swiggy', 'zomato', 'zepto', 'blinkit', 'rapido'], 50, 'Zero-depreciation bumper-to-bumper commercial usage insurance covering vehicle repair, third-party liability, and roadside assistance.'),
  ('10e4d5d0-e73b-4c8a-a976-480961170ab3', 'insurance', 'Driver In-Hospitalization Cash Plan', 'Niva Bupa Health', array['all'], 55, '₹2,000 daily cash during hospital stays to replace lost gig earnings during medical recovery.'),
  ('e53d6e04-99e0-41c3-b7ec-27d4aae9a90f', 'loan', 'Gig Worker Micro-Emergency Credit Line', 'KreditBee / Finna Partner', array['all'], 60, 'Pre-approved revolving credit line from ₹5,000 to ₹35,000 with flexible daily repayment deducted seamlessly from gig payouts.'),
  ('3be6fca6-d112-42f3-b420-a4b2636d3857', 'loan', 'Electric 2-Wheeler Upgrade Loan', 'Revfin / Hero FinCorp', array['uber', 'ola', 'swiggy', 'zomato', 'zepto'], 65, 'Low-interest financing for high-efficiency electric scooters with battery warranty and zero foreclosure charges.'),
  ('3326ab87-ffa6-4c78-9196-e30c701b7a37', 'loan', 'Working Capital Booster for Fleet Partners', 'Lendingkart', array['uber', 'ola'], 75, 'Collateral-free loan up to ₹1,50,000 for multi-vehicle owners and senior fleet drivers based on 6-month AA bank statements.')
on conflict (id) do update set
  name = excluded.name,
  provider = excluded.provider,
  relevant_platforms = excluded.relevant_platforms,
  min_health_score = excluded.min_health_score,
  description = excluded.description;

-- 3. Side Hustle Recommendations
insert into public.side_hustle_recommendations (id, platform, job_type, estimated_earning_low, estimated_earning_high, reason, city)
values
  ('ddaa4c14-ba64-4797-9f13-fdda8762746b', 'Zepto', 'Early Morning Grocery Fulfillment', 600, 1100, 'Morning rush hour peak incentive (6:00 AM - 10:00 AM) in T. Nagar & Velachery dark stores.', 'Chennai'),
  ('908f29f2-f4ae-43c2-bc7a-c77404991e34', 'Swiggy', 'Weekend Dinner Delivery Surge', 900, 1800, 'Heavy weekend demand in OMR & Anna Nagar dining hubs with guaranteed per-order bonus.', 'Chennai'),
  ('7a58dc0f-45a7-413a-bcf9-6afde7757e28', 'Rapido', 'Peak Commute Metro Shuttle', 500, 950, 'High demand connecting Guindy and Alandur metro stations during evening rush (5:00 PM - 8:30 PM).', 'Chennai'),
  ('8926d01d-ebe9-4a28-8500-aa24bd9bb862', 'Uber', 'Chennai Airport & Central Station Queue', 1400, 2600, 'Flight arrivals wave between 9:00 PM and midnight yielding longer trip fares and terminal bonuses.', 'Chennai'),
  ('4d3e8a89-9c8c-4906-9f1f-2aaee468098d', 'Blinkit', 'Instant Grocery Delivery Night Shift', 700, 1300, 'Night allowance surge (+₹25/order) in Adyar and Thiruvanmiyur zones.', 'Chennai')
on conflict (id) do update set
  platform = excluded.platform,
  job_type = excluded.job_type,
  estimated_earning_low = excluded.estimated_earning_low,
  estimated_earning_high = excluded.estimated_earning_high,
  reason = excluded.reason;
