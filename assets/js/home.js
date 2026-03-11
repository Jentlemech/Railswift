(function () {
  const RP = window.RailPortal;
  const form = RP.byId("homeSearchForm");
  const fromInput = RP.byId("fromStation");
  const toInput = RP.byId("toStation");
  const dateInput = RP.byId("travelDate");
  const classInput = RP.byId("travelClass");
  const swapBtn = RP.byId("swapStationsHome");
  const searchButton = RP.byId("searchTrainsBtn");
  const searchButtonText = document.querySelector(".search-btn-text");
  const listContainer = RP.byId("trainListContainer");
  const loadingState = RP.byId("searchLoading");
  const pnrInput = RP.byId("pnrInput");
  const pnrButton = RP.byId("checkPnrBtn");
  const pnrResult = RP.byId("pnrResult");
  const tabButtons = Array.from(document.querySelectorAll("[data-tab-target]"));
  const panels = Array.from(document.querySelectorAll(".booking-panel"));

  if (!form || !fromInput || !toInput || !dateInput || !classInput || !listContainer) return;

  const sampleStations = [
    { code: "NDLS", name: "New Delhi" },
    { code: "MMCT", name: "Mumbai Central" },
    { code: "ERS", name: "Kochi" },
    { code: "TVC", name: "Trivandrum Central" },
    { code: "MAS", name: "Chennai Central" },
    { code: "SBC", name: "Bangalore City" },
    { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus" },
    { code: "HWH", name: "Howrah Junction" },
    { code: "LKO", name: "Lucknow Charbagh" },
    { code: "BBS", name: "Bhubaneswar" },
    { code: "PUNE", name: "Pune Junction" },
    { code: "ADI", name: "Ahmedabad Junction" }
  ];

  const popularRoutes = [
    { fromCode: "NDLS", toCode: "MMCT", fromName: "New Delhi", toName: "Mumbai" },
    { fromCode: "MAS", toCode: "SBC", fromName: "Chennai", toName: "Bangalore" },
    { fromCode: "ERS", toCode: "TVC", fromName: "Kochi", toName: "Trivandrum" }
  ];

  const dummyTrains = [
    {
      name: "Vande Bharat Express",
      number: "22436",
      fromCode: "NDLS",
      toCode: "MMCT",
      fromName: "New Delhi",
      toName: "Mumbai Central",
      departure: "06:10",
      arrival: "19:35",
      duration: "13h 25m",
      availability: "Available 42",
      availabilityType: "available",
      price: { CC: 1485, EC: 2650, "3A": 1980, "2A": 2590, SL: 920 }
    },
    {
      name: "Mumbai Rajdhani",
      number: "12952",
      fromCode: "NDLS",
      toCode: "MMCT",
      fromName: "New Delhi",
      toName: "Mumbai Central",
      departure: "16:35",
      arrival: "08:32",
      duration: "15h 57m",
      availability: "RAC 18",
      availabilityType: "rac",
      price: { CC: 1310, EC: 2340, "3A": 1860, "2A": 2450, SL: 890 }
    },
    {
      name: "Shatabdi Express",
      number: "12007",
      fromCode: "MAS",
      toCode: "SBC",
      fromName: "Chennai Central",
      toName: "Bangalore City",
      departure: "06:00",
      arrival: "11:05",
      duration: "5h 05m",
      availability: "Available 23",
      availabilityType: "available",
      price: { CC: 895, EC: 1740, "3A": 1320, "2A": 1680, SL: 620 }
    },
    {
      name: "Intercity Superfast",
      number: "12677",
      fromCode: "MAS",
      toCode: "SBC",
      fromName: "Chennai Central",
      toName: "Bangalore City",
      departure: "14:20",
      arrival: "20:10",
      duration: "5h 50m",
      availability: "WL 6",
      availabilityType: "wl",
      price: { CC: 760, EC: 1390, "3A": 1190, "2A": 1570, SL: 540 }
    },
    {
      name: "Kerala Express",
      number: "12625",
      fromCode: "ERS",
      toCode: "TVC",
      fromName: "Kochi",
      toName: "Trivandrum Central",
      departure: "09:40",
      arrival: "13:55",
      duration: "4h 15m",
      availability: "Available 30",
      availabilityType: "available",
      price: { CC: 540, EC: 1150, "3A": 980, "2A": 1360, SL: 290 }
    },
    {
      name: "Jan Shatabdi",
      number: "12082",
      fromCode: "ERS",
      toCode: "TVC",
      fromName: "Kochi",
      toName: "Trivandrum Central",
      departure: "17:15",
      arrival: "21:05",
      duration: "3h 50m",
      availability: "RAC 9",
      availabilityType: "rac",
      price: { CC: 490, EC: 1040, "3A": 920, "2A": 1280, SL: 270 }
    },
    {
      name: "Duronto Express",
      number: "12274",
      fromCode: "HWH",
      toCode: "NDLS",
      fromName: "Howrah Junction",
      toName: "New Delhi",
      departure: "20:00",
      arrival: "13:55",
      duration: "17h 55m",
      availability: "WL 12",
      availabilityType: "wl",
      price: { CC: 1150, EC: 2100, "3A": 1750, "2A": 2290, SL: 820 }
    }
  ];

  function todayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function stationLabel(station) {
    return `${station.name} (${station.code})`;
  }

  function stationMatch(query) {
    const value = String(query || "").trim().toUpperCase();
    if (!value) return sampleStations.slice(0, 6);

    return sampleStations.filter((station) => {
      const haystack = `${station.name} ${station.code}`.toUpperCase();
      return haystack.includes(value);
    }).slice(0, 6);
  }

  function attachSampleAutocomplete(input, dropdown) {
    if (!input || !dropdown) return;

    function close() {
      dropdown.classList.add("hidden");
    }

    function open() {
      dropdown.classList.remove("hidden");
    }

    function renderSuggestions() {
      const matches = stationMatch(input.value);
      if (!matches.length) {
        dropdown.innerHTML = '<div class="station-empty">No matching station found</div>';
        open();
        return;
      }

      dropdown.innerHTML = matches.map((station) => `
        <button type="button" class="station-dropdown-item" data-station-code="${station.code}">
          <span class="station-title">${station.name} (${station.code})</span>
          <span class="station-subtitle">Popular station suggestion</span>
        </button>
      `).join("");

      dropdown.querySelectorAll("[data-station-code]").forEach((button) => {
        button.addEventListener("mousedown", function (event) {
          event.preventDefault();
          const station = sampleStations.find((item) => item.code === button.getAttribute("data-station-code"));
          if (!station) return;
          input.value = stationLabel(station);
          close();
        });
      });

      open();
    }

    input.addEventListener("focus", renderSuggestions);
    input.addEventListener("input", renderSuggestions);
    input.addEventListener("click", renderSuggestions);

    document.addEventListener("click", function (event) {
      if (!dropdown.parentElement.contains(event.target)) {
        close();
      }
    });
  }

  function lookupStation(inputValue) {
    const code = RP.parseStationCode(inputValue);
    return sampleStations.find((station) => station.code === code) || null;
  }

  function setFormRoute(route) {
    const fromStation = sampleStations.find((station) => station.code === route.fromCode);
    const toStation = sampleStations.find((station) => station.code === route.toCode);
    if (fromStation) fromInput.value = stationLabel(fromStation);
    if (toStation) toInput.value = stationLabel(toStation);
  }

  function renderInitialState() {
    listContainer.innerHTML = `
      <div class="popular-routes-shell">
        <div class="popular-routes-head">
          <h4>Popular routes</h4>
          <p class="muted">Start with a route passengers search most often.</p>
        </div>
        <div class="popular-routes-grid">
          ${popularRoutes.map((route) => `
            <button type="button" class="popular-route-card" data-route="${route.fromCode}-${route.toCode}">
              <span class="popular-route-label">${route.fromName}</span>
              <i class="fa-solid fa-arrow-right-long"></i>
              <span class="popular-route-label">${route.toName}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;

    listContainer.querySelectorAll("[data-route]").forEach((button) => {
      button.addEventListener("click", function () {
        const route = popularRoutes.find((item) => `${item.fromCode}-${item.toCode}` === button.getAttribute("data-route"));
        if (!route) return;
        setFormRoute(route);
        setActiveTab("book");
        fromInput.focus();
      });
    });
  }

  function availabilityClass(type) {
    if (type === "available") return "availability-pill is-available";
    if (type === "rac") return "availability-pill is-rac";
    return "availability-pill is-wl";
  }

  function trainCard(train, selectedClass) {
    const fare = train.price[selectedClass] || train.price["3A"] || 0;
    return `
      <article class="bharat-train-card">
        <div class="bharat-train-card-top">
          <div>
            <p class="train-tag">Train ${train.number}</p>
            <h3>${train.name}</h3>
          </div>
          <span class="${availabilityClass(train.availabilityType)}">${train.availability}</span>
        </div>

        <div class="train-route-row">
          <div class="route-point">
            <strong>${train.departure}</strong>
            <span>${train.fromName}</span>
          </div>
          <div class="route-line">
            <span>${train.duration}</span>
            <i class="fa-solid fa-arrow-right-long"></i>
          </div>
          <div class="route-point route-point-end">
            <strong>${train.arrival}</strong>
            <span>${train.toName}</span>
          </div>
        </div>

        <div class="bharat-train-meta">
          <span><strong>${train.name}</strong> #${train.number}</span>
          <span><strong>${train.availability}</strong> seats</span>
          <span><strong>Rs ${fare}</strong> ${selectedClass} fare</span>
        </div>

        <div class="bharat-train-actions">
          <button class="btn btn-secondary" type="button">View Details</button>
          <button class="btn" type="button">Book Now</button>
        </div>
      </article>
    `;
  }

  function buildResults(fromStation, toStation, selectedClass) {
    const directMatches = dummyTrains.filter((train) => train.fromCode === fromStation.code && train.toCode === toStation.code);
    if (directMatches.length) {
      return directMatches;
    }

    return dummyTrains
      .filter((train) => train.fromCode === fromStation.code || train.toCode === toStation.code || train.fromCode === toStation.code || train.toCode === fromStation.code)
      .slice(0, 3)
      .map((train) => ({
        ...train,
        fromCode: fromStation.code,
        toCode: toStation.code,
        fromName: fromStation.name,
        toName: toStation.name,
        availability: train.availabilityType === "wl" ? "RAC 12" : train.availability,
        availabilityType: train.availabilityType === "wl" ? "rac" : train.availabilityType,
        price: {
          ...train.price,
          [selectedClass]: train.price[selectedClass] || train.price["3A"] || 999
        }
      }));
  }

  function setActiveTab(target) {
    tabButtons.forEach((button) => {
      const isActive = button.getAttribute("data-tab-target") === target;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${target}`);
    });
  }

  function showPnrStatus() {
    const value = String(pnrInput.value || "").trim();
    if (!/^\d{10}$/.test(value)) {
      pnrResult.className = "pnr-result-card error";
      pnrResult.innerHTML = "<strong>Invalid PNR</strong><p>Please enter a valid 10-digit PNR number.</p>";
      pnrResult.classList.remove("hidden");
      return;
    }

    const statuses = ["Confirmed", "RAC", "Waiting List"];
    const status = statuses[Number(value[value.length - 1]) % statuses.length];

    pnrResult.className = "pnr-result-card";
    pnrResult.innerHTML = `
      <strong>PNR ${value}</strong>
      <p>Passenger Status: <span class="pnr-highlight">${status}</span></p>
    `;
    pnrResult.classList.remove("hidden");
  }

  function setSearchButtonState(isLoading) {
    if (!searchButton || !searchButtonText) return;

    searchButton.disabled = isLoading;
    searchButton.classList.toggle("is-loading", isLoading);
    searchButtonText.textContent = isLoading ? "Searching..." : "Search Trains";
  }

  dateInput.min = todayString();
  dateInput.value = todayString();

  attachSampleAutocomplete(fromInput, RP.byId("fromSuggestions"));
  attachSampleAutocomplete(toInput, RP.byId("toSuggestions"));

  if (swapBtn) {
    swapBtn.addEventListener("click", function () {
      RP.swapStations("fromStation", "toStation");
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      setActiveTab(button.getAttribute("data-tab-target"));
    });
  });

  if (pnrButton) {
    pnrButton.addEventListener("click", showPnrStatus);
  }

  if (pnrInput) {
    pnrInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        showPnrStatus();
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("homeMessage");

    const fromStation = lookupStation(fromInput.value);
    const toStation = lookupStation(toInput.value);

    if (!fromStation || !toStation) {
      RP.showMessage("homeMessage", "Please choose valid stations from the suggestions.", "error");
      return;
    }

    if (fromStation.code === toStation.code) {
      RP.showMessage("homeMessage", "From Station and To Station cannot be the same.", "error");
      return;
    }

    setSearchButtonState(true);
    loadingState.classList.remove("hidden");
    listContainer.innerHTML = "";

    window.setTimeout(function () {
      const results = buildResults(fromStation, toStation, classInput.value);

      setSearchButtonState(false);
      loadingState.classList.add("hidden");

      if (!results.length) {
        listContainer.innerHTML = `
          <article class="empty-state-card">
            <i class="fa-solid fa-circle-info"></i>
            <h3>No sample trains found</h3>
            <p>Try another route from the sample station list to view dynamic train cards.</p>
          </article>
        `;
        return;
      }

      listContainer.innerHTML = results.map((train) => trainCard(train, classInput.value)).join("");
    }, 1000);
  });

  renderInitialState();
})();
