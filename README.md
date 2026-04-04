# Rent Car Admin Dashboard Frontend

## Stack
- React + Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- React Hot Toast

## Run
```bash
npm install
npm run dev
```

## Environment
Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Features
- Sidebar + top navbar layout
- Protected routes with login flow
- Reusable tab system for every module
- Inline forms only, no modals
- Debounced search
- Axios interceptors
- Toast notifications
- Skeleton loading
- Reusable generic forms and data tables
- Report charts and timeline sections
- Config-driven module architecture

## Modules
- Customers
- Vehicles
- Setup
- Bookings
- Handover
- Return
- Payments
- Cash Receipts
- Expenses
- Maintenance
- Owners
- Owner Earnings
- Reports
- Daybook
