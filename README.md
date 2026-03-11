# RailSwift - Modern Indian Railway Reservation System

A redesigned railway booking portal inspired by IRCTC with improved UI, faster station search, and a simplified booking flow.

## Features
- Train search (From, To, Date, Class, Quota)
- Station autocomplete dropdown (name/code/city search)
- Passenger details and multi-step reservation flow
- Seat selection interface with visual coach layout
- Tatkal option and availability indicators
- PNR status check
- Ticket generation with QR and download/print options
- Travel destinations and tour packages sections
- Services hub and quick train tools
- Modern, responsive UI/UX with Indian Railways theme

## Technologies Used
- HTML
- CSS
- JavaScript
- Node.js + Express (for API/OTP features)

## Project Structure
```text
railswift-reservation/
+-- index.html
+-- login.html
+-- signup.html
+-- booking.html
+-- pnr.html
+-- pnr-status.html
+-- schedule.html
+-- station-enquiry.html
+-- seat-availability.html
+-- track-train.html
+-- services.html
+-- service.html
+-- destinations.html
+-- tour-packages.html
+-- my-trips.html
+-- contact.html
+-- dashboard.html
+-- ticket.html
+-- server.js
+-- package.json
+-- README.md
+-- .gitignore
+-- assets/
¦   +-- css/
¦   ¦   +-- styles.css
¦   +-- js/
¦   ¦   +-- common.js
¦   ¦   +-- home.js
¦   ¦   +-- booking.js
¦   ¦   +-- pnr.js
¦   ¦   +-- station.js
¦   ¦   +-- schedule.js
¦   ¦   +-- seat-availability.js
¦   ¦   +-- track-train.js
¦   ¦   +-- services-page.js
¦   ¦   +-- service.js
¦   ¦   +-- destinations-page.js
¦   ¦   +-- packages-page.js
¦   ¦   +-- ...
¦   +-- images/
¦       +-- destinations/
¦       +-- packages/
¦       +-- services/
¦       +-- indian-railways-logo.svg
+-- data/
¦   +-- stations.json
¦   +-- trains.json
¦   +-- destinations.json
¦   +-- services.json
¦   +-- packages.json
+-- scripts/
    +-- generate-data.ps1
```

## How to Run
### Option 1 (quick static open)
1. Clone the repository.
2. Open `index.html` in your browser.

### Option 2 (recommended full functionality)
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start server:
   ```bash
   npm start
   ```
4. Open:
   - `http://localhost:3000/index.html`

## GitHub Setup Commands
```bash
git init
git add .
git commit -m "Initial commit - RailSwift railway reservation system"
git branch -M main
git remote add origin https://github.com/USERNAME/railswift-reservation.git
git push -u origin main
```

## Notes
- Large datasets are available in `data/stations.json` and `data/trains.json`.
- For OTP features, configure `.env` values before running backend endpoints in production.
