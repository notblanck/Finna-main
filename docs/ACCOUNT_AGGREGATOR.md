# FINNA — Account Aggregator (AA) Integration Architecture

## 1. Overview
FINNA integrates with India's Account Aggregator (AA) framework as a **Financial Information User (FIU)** under RBI regulations. This enables gig delivery and ride partners to consent to sharing bank statement history from their Financial Information Providers (FIPs) to automate income forecasting and safe-to-spend calculations.

---

## 2. Sandbox vs Production Operation

> [!WARNING]
> The current deployment operates in **Setu AA FIU Sandbox Mode**. All financial records and transactions returned during the consent test cycle are simulated for the Indian gig ecosystem (Uber, Ola, Swiggy, Zomato, Rapido, Zepto).

### Production Roadmap & Requirements
To transition from the Setu AA sandbox to live production banking data:
1. **FIU Registration**: Apply for and obtain FIU registration with an RBI-licensed Account Aggregator (e.g., Setu, Finvu, OneMoney, Anumati).
2. **Sahamati Participation**: Complete onboarding and certification through the Sahamati Alliance.
3. **Hardware Security Module (HSM) / Key Management**: Deploy PKI certificate infrastructure for digital signing of consent requests and end-to-end decryption of FI data packages.
4. **Data Security Compliance**: Ensure ISO 27001 / CERT-In compliance for encrypting raw financial data at rest and audit logging every data session access.

---

## 3. Supported Providers & Adapters

FINNA implements a dual-mode adapter pattern under `lib/aa/`:
- `AAProvider` (`lib/aa/interface.ts`): Standard interface specifying `createConsent`, `getConsentStatus`, `revokeConsent`, `requestFIData`, `fetchFIData`, and `handleWebhook`.
- `SetuAAProvider` (`lib/aa/setu-aa.ts`): Connects to the Setu FIU sandbox (`https://fiu-sandbox.setu.co`) using `SETU_CLIENT_ID`, `SETU_CLIENT_SECRET`, and `SETU_PRODUCT_INSTANCE_ID`.
- `MockAAProvider` (`lib/aa/mock-aa.ts`): Provides realistic Chennai gig worker payouts for self-contained, offline demonstrations.

---

## 4. Consent Lifecycle
1. **Consent Request**: The gig partner specifies statement date range (e.g., 90 days) and financial information types (`DEPOSIT`).
2. **Authorization**: The user is redirected to the Setu webview or authorizes via their AA VPA (`<mobile>@setu`).
3. **Data Session**: Upon approval, FINNA initiates an encrypted FI data request.
4. **Transaction Categorization & Review**: Incoming credits are mapped to platform earnings (Uber, Swiggy) and debits to expenses (Fuel, Vehicle Maintenance) with user confirmation.
5. **Revocation**: The user can revoke consent at any time from `/aa` or `/dashboard`.
