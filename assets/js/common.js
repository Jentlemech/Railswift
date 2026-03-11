(function () {
  const classLabels = {
    SL: "Sleeper (SL)",
    "2S": "Second Sitting (2S)",
    "3A": "AC 3 Tier (3A)",
    "2A": "AC 2 Tier (2A)",
    "1A": "AC First Class (1A)",
    EC: "Executive Chair Car (EC)",
    CC: "Chair Car (CC)"
  };

  const travelCategories = [
    "General Passenger",
    "Senior Citizen",
    "Armed Forces",
    "Government Employee",
    "Member of Parliament",
    "Minister",
    "Ladies Quota",
    "Student",
    "Divyang (Disabled)",
    "Tatkal Passenger"
  ];

  const stationCache = new Map();
  let stationDatasetPromise = null;
  let stationIndex = [];

  function byId(id) {
    return document.getElementById(id);
  }

  function storageGet(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (_e) {
      return fallback;
    }
  }

  function storageSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return storageGet("rp_users", []);
  }

  function saveUsers(users) {
    storageSet("rp_users", users);
  }

  function getCurrentUser() {
    return storageGet("rp_current_user", null);
  }

  function setCurrentUser(user) {
    storageSet("rp_current_user", user);
  }

  function logout() {
    localStorage.removeItem("rp_current_user");
  }

  function getBookings() {
    return storageGet("rp_bookings", []);
  }

  function saveBookings(bookings) {
    storageSet("rp_bookings", bookings);
  }

  function getUserBookings() {
    const user = getCurrentUser();
    if (!user) return [];
    return getBookings().filter((b) => b.userId === user.id);
  }

  function pushBooking(booking) {
    const bookings = getBookings();
    bookings.unshift(booking);
    saveBookings(bookings);
  }

  function showMessage(targetId, text, type) {
    const el = byId(targetId);
    if (!el) return;
    el.className = `message ${type}`;
    el.textContent = text;
    el.classList.remove("hidden");
  }

  function hideMessage(targetId) {
    const el = byId(targetId);
    if (!el) return;
    el.classList.add("hidden");
  }

  function initLoader() {
    if (byId("loadingOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.className = "loading-overlay";
    overlay.innerHTML = '<div class="loader" aria-label="Loading"></div>';
    document.body.appendChild(overlay);
  }

  function showLoader() {
    initLoader();
    byId("loadingOverlay").classList.add("visible");
  }

  function hideLoader() {
    const overlay = byId("loadingOverlay");
    if (overlay) overlay.classList.remove("visible");
  }

  async function apiGet(url) {
    const response = await fetch(url);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || "Request failed");
    }
    return payload;
  }

  function normalizeStation(raw) {
    const stationName = raw.stationName || raw.name || "";
    const stationCode = String(raw.stationCode || raw.code || "").toUpperCase();
    return {
      stationName,
      stationCode,
      city: raw.city || "",
      state: raw.state || "",
      railwayZone: raw.railwayZone || raw.zone || "",
      enquiryNumber: raw.enquiryNumber || raw.enquiry || "139",
      contactNumber: raw.contactNumber || raw.contact || raw.enquiryNumber || "139",
      address: raw.address || ""
    };
  }

  function rememberStations(stations) {
    if (!Array.isArray(stations)) return;
    for (const station of stations) {
      const normalized = normalizeStation(station);
      if (normalized.stationCode) {
        stationCache.set(normalized.stationCode, normalized);
      }
    }
  }

  async function loadStationDataset() {
    if (stationDatasetPromise) return stationDatasetPromise;

    stationDatasetPromise = (async function () {
      const candidatePaths = ["stations.json", "data/stations.json"];
      let data = null;

      for (const p of candidatePaths) {
        try {
          const response = await fetch(p);
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (_e) {
          // try next path
        }
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      const normalized = data.map(normalizeStation).filter((s) => s.stationName && s.stationCode);
      rememberStations(normalized);

      stationIndex = normalized.map((s) => {
        const nameUpper = s.stationName.toUpperCase();
        const codeUpper = s.stationCode.toUpperCase();
        const cityUpper = s.city.toUpperCase();
        const stateUpper = s.state.toUpperCase();
        const zoneUpper = s.railwayZone.toUpperCase();
        const searchText = `${nameUpper} ${codeUpper} ${cityUpper} ${stateUpper} ${zoneUpper}`;
        return { station: s, nameUpper, codeUpper, cityUpper, stateUpper, searchText };
      });

      return normalized;
    })();

    return stationDatasetPromise;
  }

  async function searchStations(query, limit = 10) {
    await loadStationDataset();

    const q = String(query || "").trim().toUpperCase();
    if (!q) {
      return stationIndex.slice(0, limit).map((x) => x.station);
    }

    const scored = [];
    for (const row of stationIndex) {
      let score = 0;

      if (row.codeUpper === q) score = 500;
      else if (row.codeUpper.startsWith(q)) score = 420;
      else if (row.nameUpper.startsWith(q)) score = 350;
      else if (row.cityUpper.startsWith(q)) score = 300;
      else if (row.stateUpper.startsWith(q)) score = 260;
      else if (row.searchText.includes(q)) score = 180;

      if (score > 0) scored.push({ score, station: row.station });
    }

    scored.sort((a, b) => b.score - a.score || a.station.stationName.localeCompare(b.station.stationName));
    return scored.slice(0, limit).map((x) => x.station);
  }

  async function getStationByCode(code) {
    await loadStationDataset();

    const normalized = String(code || "").toUpperCase();
    if (!normalized) return null;

    if (stationCache.has(normalized)) return stationCache.get(normalized);

    try {
      const payload = await apiGet(`/api/stations/${encodeURIComponent(normalized)}`);
      if (payload.station) {
        const normalizedStation = normalizeStation(payload.station);
        stationCache.set(normalized, normalizedStation);
        return normalizedStation;
      }
      return null;
    } catch (_e) {
      return null;
    }
  }

  function parseStationCode(input) {
    const value = String(input || "").trim();
    if (!value) return "";

    const match = value.match(/\(([A-Za-z0-9]+)\)$/);
    if (match) return match[1].toUpperCase();
    return value.toUpperCase();
  }

  function formatStation(code) {
    const normalized = String(code || "").toUpperCase();
    const station = stationCache.get(normalized);
    if (station) return `${station.stationName} (${station.stationCode})`;
    return normalized;
  }

  function createDropdownItem(station) {
    return `
      <button type="button" class="station-dropdown-item" data-code="${station.stationCode}">
        <span class="station-title">${station.stationName} (${station.stationCode})</span>
        <span class="station-subtitle">${station.city}, ${station.state}</span>
      </button>
    `;
  }

  function attachStationAutocomplete(inputId, listId) {
    const input = byId(inputId);
    if (!input) return;

    if (listId) {
      const list = byId(listId);
      if (list) list.remove();
      input.removeAttribute("list");
    }

    const container = input.parentElement;
    if (!container) return;

    container.classList.add("station-picker");

    const dropdown = document.createElement("div");
    dropdown.className = "station-dropdown hidden";
    container.appendChild(dropdown);

    let debounceTimer = null;

    function closeDropdown() {
      dropdown.classList.add("hidden");
      container.classList.remove("open");
    }

    function openDropdown() {
      dropdown.classList.remove("hidden");
      container.classList.add("open");
    }

    async function renderSuggestions(forceOpen) {
      const q = input.value.trim();
      const results = await searchStations(q, 10);

      if (!results.length) {
        dropdown.innerHTML = '<div class="station-empty">No matching station found</div>';
      } else {
        dropdown.innerHTML = results.map(createDropdownItem).join("");
      }

      dropdown.querySelectorAll("[data-code]").forEach((btn) => {
        btn.addEventListener("mousedown", function (event) {
          event.preventDefault();
          const code = btn.getAttribute("data-code");
          const station = stationCache.get(code);
          if (!station) return;

          input.value = `${station.stationName} (${station.stationCode})`;
          input.dispatchEvent(new Event("change", { bubbles: true }));
          closeDropdown();
        });
      });

      if (forceOpen || document.activeElement === input) {
        openDropdown();
      }
    }

    input.addEventListener("focus", function () {
      renderSuggestions(true).catch(() => closeDropdown());
    });

    input.addEventListener("click", function () {
      renderSuggestions(true).catch(() => closeDropdown());
    });

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        renderSuggestions(true).catch(() => closeDropdown());
      }, 180);
    });

    document.addEventListener("click", function (event) {
      if (!container.contains(event.target)) {
        closeDropdown();
      }
    });
  }

  async function searchTrains(params) {
    const qs = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      class: params.class || "",
      quota: params.quota || ""
    });

    const payload = await apiGet(`/api/trains/search?${qs.toString()}`);
    return payload;
  }

  function swapStations(fromId, toId) {
    const from = byId(fromId);
    const to = byId(toId);
    if (!from || !to) return;

    const temp = from.value;
    from.value = to.value;
    to.value = temp;
  }
  function generatePNR() {
    return String(Math.floor(1000000000 + Math.random() * 9000000000));
  }

  function updateAuthNav() {
    const loginNav = byId("navLoginLink");
    const dashboardNav = byId("navDashboardLink");
    const user = getCurrentUser();

    if (loginNav) {
      loginNav.textContent = user ? "Logout" : "Login";
      loginNav.href = user ? "#" : "login.html";
      loginNav.onclick = user
        ? function (e) {
            e.preventDefault();
            logout();
            window.location.href = "index.html";
          }
        : null;
    }

    if (dashboardNav) {
      dashboardNav.classList.toggle("hidden", !user);
    }
  }

  function setupNavToggle() {
    const navToggle = byId("navToggle");
    const navLinks = byId("navLinks");
    if (!navToggle || !navLinks) return;
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }

  function requireAuth(redirectTo) {
    if (!getCurrentUser()) {
      window.location.href = redirectTo || "login.html";
      return false;
    }
    return true;
  }

  window.RailPortal = {
    classLabels,
    travelCategories,
    byId,
    getUsers,
    saveUsers,
    getCurrentUser,
    setCurrentUser,
    logout,
    getBookings,
    saveBookings,
    getUserBookings,
    pushBooking,
    showMessage,
    hideMessage,
    showLoader,
    hideLoader,
    apiGet,
    searchStations,
    getStationByCode,
    parseStationCode,
    formatStation,
    attachStationAutocomplete,
    searchTrains,
    generatePNR,
    swapStations,
    updateAuthNav,
    setupNavToggle,
    requireAuth,
    rememberStations,
    loadStationDataset
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupNavToggle();
    updateAuthNav();
    initLoader();
    loadStationDataset().catch(() => {
      // Dataset load fallback handled in API lookups.
    });
  });
})();


