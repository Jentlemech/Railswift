(function () {
  const RP = window.RailPortal;
  const form = RP.byId("homeSearchForm");
  const dateInput = RP.byId("travelDate");
  const swapBtn = RP.byId("swapStationsHome");

  if (!form || !dateInput) return;

  const destinationGrid = RP.byId("destinationGrid");
  const destinationInsights = RP.byId("destinationInsights");
  const serviceHubGrid = RP.byId("serviceHubGrid");
  const packageGrid = RP.byId("packageGrid");

  let trainsDataset = [];

  function todayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  async function loadJson(paths, fallback) {
    for (const p of paths) {
      try {
        const response = await fetch(p);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
        }
      } catch (_e) {
        // Try next path.
      }
    }
    return fallback;
  }

  function parseDurationToMinutes(durationText) {
    const match = String(durationText || "").match(/(\d+)\s*h\s*(\d+)\s*m/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function bestFare(train) {
    const fares = Object.values(train.baseFares || {}).map((value) => Number(value)).filter((value) => !Number.isNaN(value));
    if (!fares.length) return Number.MAX_SAFE_INTEGER;
    return Math.min(...fares);
  }

  function revealOnScroll() {
    const items = Array.from(document.querySelectorAll(".reveal"));
    if (!items.length || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((item) => observer.observe(item));
  }

  async function resolveCurrentFromStation() {
    const currentValue = RP.byId("fromStation").value.trim();
    const codeFromInput = RP.parseStationCode(currentValue);
    if (codeFromInput) {
      const station = await RP.getStationByCode(codeFromInput);
      if (station) return station;
    }

    const cachedCode = localStorage.getItem("rp_recent_from_code");
    if (cachedCode) {
      const cachedStation = await RP.getStationByCode(cachedCode);
      if (cachedStation) return cachedStation;
    }

    const fallback = await RP.getStationByCode("NDLS");
    return fallback;
  }

  function trainCard(train) {
    const fare = bestFare(train);
    return `
      <div class="insight-train-item">
        <strong>${train.trainName} (${train.trainNumber})</strong>
        <p class="muted">${train.fromStation} -> ${train.toStation} | ${train.departureTime} - ${train.arrivalTime} | ${train.travelDuration}</p>
        <p class="muted">Type: ${train.trainType} | Starting fare: ${fare === Number.MAX_SAFE_INTEGER ? "N/A" : `INR ${Math.round(fare)}`}</p>
      </div>
    `;
  }

  function fillSearchRoute(fromStation, destination) {
    const fromInput = RP.byId("fromStation");
    const toInput = RP.byId("toStation");

    if (fromStation) {
      fromInput.value = `${fromStation.stationName} (${fromStation.stationCode})`;
      localStorage.setItem("rp_recent_from_code", fromStation.stationCode);
    }

    toInput.value = destination.nearest_station;
    if (!dateInput.value) {
      dateInput.value = todayString();
    }
  }

  async function showDestinationInsights(destination) {
    if (!destinationInsights) return;

    const fromStation = await resolveCurrentFromStation();
    fillSearchRoute(fromStation, destination);

    const relevant = trainsDataset
      .filter((train) => String(train.toStation).toUpperCase() === String(destination.nearest_code).toUpperCase())
      .sort((a, b) => parseDurationToMinutes(a.travelDuration) - parseDurationToMinutes(b.travelDuration));

    const fastest = relevant.slice(0, 3);
    const bestFareTrain = [...relevant].sort((a, b) => bestFare(a) - bestFare(b))[0];

    const params = new URLSearchParams({
      from: fromStation ? fromStation.stationCode : "NDLS",
      to: destination.nearest_code,
      date: dateInput.value || todayString(),
      travelClass: RP.byId("travelClass").value,
      quota: RP.byId("travelQuota").value
    });

    destinationInsights.classList.remove("hidden");
    destinationInsights.innerHTML = `
      <h3>${destination.name} - Smart Travel Insights</h3>
      <p class="muted">Nearest station: ${destination.nearest_station}. Showing sample top options from current schedule data.</p>
      ${bestFareTrain ? `<p><span class="badge badge-success">Best Fare</span> ${bestFareTrain.trainName} (${bestFareTrain.trainNumber})</p>` : ""}
      <div class="insight-train-grid">
        ${fastest.length ? fastest.map(trainCard).join("") : '<p class="muted">No direct sample trains found in the current dataset. You can still search live routes.</p>'}
      </div>
      <div class="insight-actions">
        <a class="btn" href="booking.html?${params.toString()}"><i class="fa-solid fa-ticket"></i> Explore Trains</a>
        <button type="button" class="btn btn-secondary" id="scrollToSearchBtn"><i class="fa-solid fa-magnifying-glass"></i> Fill Search Form</button>
      </div>
    `;

    const scrollBtn = RP.byId("scrollToSearchBtn");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function renderServices(services) {
    if (!serviceHubGrid) return;

    serviceHubGrid.innerHTML = services
      .map(
        (service) => `
          <a class="service-card service-card-rich" href="service.html?service=${encodeURIComponent(service.id)}">
            <img loading="lazy" src="${service.image}" alt="${service.title}" />
            <div class="service-card-body">
              <i class="${service.icon}"></i>
              <h3>${service.title}</h3>
              <p>${service.description}</p>
            </div>
          </a>
        `
      )
      .join("");
  }

  function renderDestinations(destinations) {
    if (!destinationGrid) return;

    destinationGrid.innerHTML = destinations
      .map(
        (destination) => `
          <article class="destination-card" data-destination="${destination.slug}">
            <img loading="lazy" src="${destination.image}" alt="${destination.name}" />
            <div class="destination-card-content">
              <h3>${destination.name}</h3>
              <p>${destination.description}</p>
              <p class="muted">Nearest: ${destination.nearest_station}</p>
              <button type="button" class="btn destination-explore-btn" data-destination="${destination.slug}">Explore Trains</button>
            </div>
          </article>
        `
      )
      .join("");

    function openDestination(slug) {
      const item = destinations.find((d) => d.slug === slug);
      if (!item) return;

      showDestinationInsights(item).catch(() => {
        RP.showMessage("homeMessage", "Unable to load destination train insights right now.", "error");
      });
    }

    destinationGrid.querySelectorAll(".destination-card").forEach((card) => {
      card.addEventListener("click", function () {
        openDestination(card.getAttribute("data-destination"));
      });
    });

    destinationGrid.querySelectorAll(".destination-explore-btn").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        openDestination(button.getAttribute("data-destination"));
      });
    });
  }

  function renderPackages(packages) {
    if (!packageGrid) return;

    packageGrid.innerHTML = packages
      .map(
        (item) => `
          <article class="package-card">
            <img loading="lazy" src="${item.image}" alt="${item.name}" />
            <div class="package-card-content">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <p class="muted">Duration: ${item.duration} | Starting from ${item.starting_price}</p>
              <a class="btn btn-secondary" href="tour-packages.html#${item.id}">View Details</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  RP.attachStationAutocomplete("fromStation");
  RP.attachStationAutocomplete("toStation");

  if (swapBtn) {
    swapBtn.addEventListener("click", function () {
      const fromInput = RP.byId("fromStation");
      const toInput = RP.byId("toStation");
      const tmp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = tmp;
    });
  }

  const minDate = todayString();
  dateInput.min = minDate;
  dateInput.value = minDate;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    RP.hideMessage("homeMessage");

    try {
      RP.showLoader();

      const fromCode = RP.parseStationCode(RP.byId("fromStation").value);
      const toCode = RP.parseStationCode(RP.byId("toStation").value);

      const [from, to] = await Promise.all([RP.getStationByCode(fromCode), RP.getStationByCode(toCode)]);

      if (!from || !to) {
        RP.showMessage("homeMessage", "Please select valid stations using station name or code.", "error");
        return;
      }

      if (from.stationCode === to.stationCode) {
        RP.showMessage("homeMessage", "From and To stations cannot be the same.", "error");
        return;
      }

      localStorage.setItem("rp_recent_from_code", from.stationCode);

      const params = new URLSearchParams({
        from: from.stationCode,
        to: to.stationCode,
        date: RP.byId("travelDate").value,
        travelClass: RP.byId("travelClass").value,
        quota: RP.byId("travelQuota").value
      });

      window.location.href = `booking.html?${params.toString()}`;
    } catch (error) {
      RP.showMessage("homeMessage", error.message || "Unable to search trains now.", "error");
    } finally {
      RP.hideLoader();
    }
  });

  Promise.all([
    loadJson(["data/services.json", "services.json"], []),
    loadJson(["data/destinations.json", "destinations.json"], []),
    loadJson(["data/packages.json", "packages.json"], []),
    loadJson(["data/trains.json", "trains.json"], [])
  ])
    .then(([services, destinations, packages, trains]) => {
      trainsDataset = trains;
      renderServices(services);
      renderDestinations(destinations);
      renderPackages(packages);
      revealOnScroll();
    })
    .catch(() => {
      RP.showMessage("homeMessage", "Some travel sections could not be loaded. Please refresh.", "error");
    });
})();



