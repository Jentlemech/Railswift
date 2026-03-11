(function () {
  const RP = window.RailPortal;
  const hero = RP.byId("serviceHero");
  const content = RP.byId("serviceContent");
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get("service") || "train-booking";

  if (!hero || !content) return;

  function showResult(message, type) {
    RP.showMessage("serviceMessage", message, type || "success");
  }

  const templates = {
    "train-booking": {
      tools: `
        <p class="muted">Jump directly into train search and booking.</p>
        <a class="btn" href="booking.html"><i class="fa-solid fa-ticket"></i> Open Train Booking</a>
      `
    },
    "e-catering": {
      tools: `
        <form id="serviceForm" class="form-grid-2">
          <label>PNR Number<input required id="fieldPnr" minlength="10" maxlength="10" pattern="[0-9]{10}" /></label>
          <label>Delivery Station<input required id="fieldStation" placeholder="e.g. Bhopal (BPL)" /></label>
          <label>Meal Type
            <select id="fieldMeal" required><option>Veg Thali</option><option>Non-Veg Meal</option><option>Snacks Combo</option><option>South Indian Combo</option></select>
          </label>
          <label>Mobile Number<input required id="fieldPhone" pattern="[0-9]{10}" /></label>
          <div><button class="btn" type="submit">Place Meal Order</button></div>
        </form>
      `
    },
    flights: {
      tools: `
        <form id="serviceForm" class="form-grid-3">
          <label>From City<input required id="fieldFrom" placeholder="Delhi" /></label>
          <label>To City<input required id="fieldTo" placeholder="Mumbai" /></label>
          <label>Travel Date<input type="date" required id="fieldDate" /></label>
          <div><button class="btn" type="submit">Search Flights</button></div>
        </form>
        <div id="serviceResults" class="grid" style="margin-top:0.7rem;"></div>
      `
    },
    "bus-booking": {
      tools: `
        <form id="serviceForm" class="form-grid-3">
          <label>From<input required id="fieldFrom" /></label>
          <label>To<input required id="fieldTo" /></label>
          <label>Date<input type="date" required id="fieldDate" /></label>
          <div><button class="btn" type="submit">Search Buses</button></div>
        </form>
        <div id="serviceResults" class="grid" style="margin-top:0.7rem;"></div>
      `
    },
    hotels: {
      tools: `
        <form id="serviceForm" class="form-grid-3">
          <label>City<input required id="fieldCity" /></label>
          <label>Check-in<input type="date" required id="fieldIn" /></label>
          <label>Check-out<input type="date" required id="fieldOut" /></label>
          <div><button class="btn" type="submit">Search Hotels</button></div>
        </form>
        <div id="serviceResults" class="grid" style="margin-top:0.7rem;"></div>
      `
    },
    "holiday-packages": {
      tools: `
        <form id="serviceForm" class="form-grid-2">
          <label>Preferred Destination<input required id="fieldDestination" placeholder="Kerala" /></label>
          <label>Duration (days)<input required id="fieldDays" type="number" min="2" max="14" value="5" /></label>
          <div><button class="btn" type="submit">Find Packages</button></div>
        </form>
        <div id="serviceResults" class="grid" style="margin-top:0.7rem;"></div>
      `
    },
    "tourist-trains": {
      tools: `
        <div class="grid">
          <article class="ticket-field"><strong>Maharajas Express</strong>Luxury heritage circuit | 7 nights</article>
          <article class="ticket-field"><strong>Palace on Wheels</strong>Royal Rajasthan circuit | 6 nights</article>
          <article class="ticket-field"><strong>Deccan Odyssey</strong>Culture and coast route | 7 nights</article>
        </div>
        <form id="serviceForm" class="form-grid-2" style="margin-top:0.7rem;">
          <label>Your Name<input required id="fieldName" /></label>
          <label>Mobile<input required id="fieldMobile" pattern="[0-9]{10}" /></label>
          <div><button class="btn" type="submit">Request Callback</button></div>
        </form>
      `
    },
    "hill-railways": {
      tools: `
        <div class="grid">
          <article class="ticket-field"><strong>Darjeeling Himalayan Railway</strong>UNESCO toy train experience.</article>
          <article class="ticket-field"><strong>Nilgiri Mountain Railway</strong>Ooty scenic route with heritage coaches.</article>
          <article class="ticket-field"><strong>Kalka-Shimla Railway</strong>Classic mountain rail corridor.</article>
        </div>
        <a class="btn" href="destinations.html" style="margin-top:0.7rem;display:inline-flex;">Explore Hill Destinations</a>
      `
    },
    "charter-train": {
      tools: `
        <form id="serviceForm" class="form-grid-2">
          <label>Organization / Group<input required id="fieldOrg" /></label>
          <label>Expected Passengers<input required id="fieldCount" type="number" min="100" /></label>
          <label>Preferred Route<input required id="fieldRoute" placeholder="Delhi to Jaipur" /></label>
          <label>Journey Month<input required id="fieldMonth" type="month" /></label>
          <div><button class="btn" type="submit">Submit Charter Request</button></div>
        </form>
      `
    },
    gallery: {
      tools: `
        <div class="gallery-grid" id="galleryGrid"></div>
      `
    }
  };

  function renderServiceMeta(service) {
    hero.innerHTML = `
      <div class="service-hero-media"><img loading="lazy" src="${service.image}" alt="${service.title}" /></div>
      <div class="service-hero-content">
        <h1>${service.title}</h1>
        <p>${service.description}</p>
      </div>
    `;
    RP.byId("serviceBreadcrumb").textContent = service.title;
  }

  function mockList(targetId, rows) {
    const target = RP.byId(targetId);
    if (!target) return;
    target.innerHTML = rows.map((row) => `<article class="ticket-field">${row}</article>`).join("");
  }

  function bindFormHandlers() {
    const form = RP.byId("serviceForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (serviceId === "e-catering") {
        showResult("Meal order placed successfully. Confirmation SMS sent.", "success");
        return;
      }

      if (serviceId === "flights") {
        mockList("serviceResults", [
          "RailSwift Air 602 | 07:10 - 09:20 | INR 5,980",
          "SwiftConnect 118 | 11:40 - 13:55 | INR 6,420",
          "National Air 901 | 18:15 - 20:30 | INR 5,740"
        ]);
        showResult("Showing best available flight options.", "success");
        return;
      }

      if (serviceId === "bus-booking") {
        mockList("serviceResults", [
          "Volvo AC Sleeper | 21:00 | INR 1,450",
          "Scania Semi-Sleeper | 22:15 | INR 1,620",
          "Express Non-AC | 20:30 | INR 920"
        ]);
        showResult("Bus results loaded for selected route.", "success");
        return;
      }

      if (serviceId === "hotels") {
        mockList("serviceResults", [
          "RailSwift Residency - 4.2/5 - INR 3,100/night",
          "Station View Inn - 4.0/5 - INR 2,450/night",
          "Heritage Grand Hotel - 4.6/5 - INR 4,980/night"
        ]);
        showResult("Hotel availability loaded successfully.", "success");
        return;
      }

      if (serviceId === "holiday-packages") {
        mockList("serviceResults", [
          "Family Explorer Package - 5N/6D - INR 28,500",
          "Premium Heritage Package - 6N/7D - INR 39,900",
          "Budget Getaway Package - 3N/4D - INR 16,750"
        ]);
        showResult("Holiday package options prepared.", "success");
        return;
      }

      if (serviceId === "tourist-trains") {
        showResult("Request submitted. A tourism specialist will call shortly.", "success");
        return;
      }

      if (serviceId === "charter-train") {
        showResult("Charter request submitted. Team will contact you within 24 hours.", "success");
      }
    });
  }

  function renderGallery() {
    const galleryGrid = RP.byId("galleryGrid");
    if (!galleryGrid) return;

    const images = [
      "assets/images/destinations/goa.svg",
      "assets/images/destinations/darjeeling.svg",
      "assets/images/destinations/shimla.svg",
      "assets/images/packages/maharajas-express.svg",
      "assets/images/services/tourist-trains.svg",
      "assets/images/services/hill-railways.svg"
    ];

    galleryGrid.innerHTML = images
      .map((img) => `<figure class="gallery-item"><img loading="lazy" src="${img}" alt="Rail gallery" /></figure>`)
      .join("");
  }

  async function init() {
    const list = await (async function () {
      const paths = ["data/services.json", "services.json"];
      for (const p of paths) {
        try {
          const response = await fetch(p);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) return data;
          }
        } catch (_e) {
          // continue
        }
      }
      return [];
    })();

    const service = list.find((item) => item.id === serviceId) || list[0];

    if (!service) {
      content.innerHTML = '<p class="muted">Service not available.</p>';
      return;
    }

    renderServiceMeta(service);
    const template = templates[service.id] || templates["train-booking"];
    content.innerHTML = template.tools;

    if (service.id === "gallery") {
      renderGallery();
    }

    bindFormHandlers();
  }

  init();
})();
