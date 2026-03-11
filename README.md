# RailSwift - Indian Railways Style Reservation Portal

This project provides an IRCTC-style reservation flow with OTP auth, large station/train datasets, station autocomplete, train search, seat availability simulation, seat selection, and ticket generation.

## Implemented Features

- Government-style portal UI (red/white/grey, structured sections)
- OTP login/signup verification backend (`/send-otp`, `/verify-otp`)
- Large station database in `stations.json` (7200 records)
- Train schedule database in `trains.json` (420 records)
- Station autocomplete by name/code (top 10 suggestions)
- Train search by From, To, Date, Class
- Running day checks based on selected date
- Class-wise seat availability simulation (`Available`, `RAC`, `Waiting List`)
- Booking flow:
  - Search Train
  - Select Train
  - Passenger Details
  - Seat Selection
  - Payment
  - Ticket Generation
- Passenger fields include ID type/number and travel category
- Tatkal booking toggle with extra charge and warning
- Ticket with PNR, coach, seat, class, category, status
- QR code + PDF download + print view

## Data Files

- `stations.json` and `data/stations.json`
- `trains.json` and `data/trains.json`

### Important Note on Dataset

The repository includes a **large-scale mixed dataset** for performance testing and full-flow functionality:
- Core real station/train entries are included (for example NDLS, AWY, CLT and major trains/routes)
- Additional records are generated to reach large volume (7000+ stations, 400+ trains)

If you need an official full production railway master dataset, replace these JSON files with your authoritative source while keeping the same schema.

## API Endpoints

### OTP
- `POST /send-otp`
- `POST /verify-otp`

### Station Search
- `GET /api/stations/search?q=<query>&limit=10`
- `GET /api/stations/:code`

### Train Search
- `GET /api/trains/search?from=<CODE>&to=<CODE>&date=YYYY-MM-DD&class=<CLASS>`
- `GET /api/trains/:number?date=YYYY-MM-DD`

### Meta/Health
- `GET /api/meta`
- `GET /health`

## Run Instructions

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and configure SMS provider credentials.

3. Start server:

```bash
npm start
```

4. Open:

- `http://localhost:3000/index.html`

## Optional Data Regeneration

To regenerate large datasets:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-data.ps1
```

