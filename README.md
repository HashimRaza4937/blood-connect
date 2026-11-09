# 🩸 Blood Connect

**Smart Blood Availability, Free Donation & Blood Bank Management Platform**

> Initial Target: Ghotki, Sindh, Pakistan | Contest Prototype 2026

## Live Demo
- **Backend API (Live on Railway):** https://blood-connect-api-production.up.railway.app
- **API Health Check:** https://blood-connect-api-production.up.railway.app/api/health
- **Frontend:** [Deployed on Vercel]

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Master Admin | admin@demo.com | demo1234 |
| 🏥 Blood Bank Manager | bank@demo.com | demo1234 |
| 🩸 Voluntary Donor | donor@demo.com | demo1234 |
| 👤 Recipient | recipient@demo.com | demo1234 |

## 3 Blood Acquisition Options
1. **100% Free Donated Blood** — Verified voluntary donor units at PKR 0
2. **Exchange / Replacement Donor** — خون کے بدلے خون (family brings a donor)
3. **Non-Profit Lab Screening Fee** — PKR 1,800 safety testing per SBTA rules

## Tech Stack
- **Frontend:** React.js + Tailwind CSS + Vite (Vercel)
- **Backend:** Node.js + Express.js (Render)
- **Database:** File-based JSON store (seeded on startup)
- **Auth:** JWT
- **Maps:** Google Maps Embed + Leaflet.js

## Local Development

```bash
# Backend (port 5000)
cd server && npm install && npm start

# Frontend (port 3000)
cd client && npm install && npm run dev
```

## Legal Notice
Compliant with **Sindh Blood Transfusion Authority (SBTA)**. Blood is never sold.
