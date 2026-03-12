(function () {
  const RP = window.RailPortal;
  if (!RP.requireAuth("login.html")) return;

  const params = new URLSearchParams(window.location.search);
  const steps = {
    1: RP.byId("step1"),
    2: RP.byId("step2"),
    3: RP.byId("step3"),
    4: RP.byId("step4"),
    5: RP.byId("step5"),
    6: RP.byId("step6")
  };

  const formSearch = RP.byId("bookingSearchForm");
  const swapStationsBtn = RP.byId("swapStationsBooking");
  const trainList = RP.byId("trainList");
  const tatkalToggle = RP.byId("tatkalToggle");
  const tatkalInfo = RP.byId("tatkalInfo");
  const passengerRows = RP.byId("passengerRows");
  const addPassengerBtn = RP.byId("addPassengerBtn");
  const removePassengerBtn = RP.byId("removePassengerBtn");
  const continueSeatBtn = RP.byId("continueSeatBtn");
  const passengerSeatTabs = RP.byId("passengerSeatTabs");
  const seatLayout = RP.byId("seatLayout");
  const seatSelectionInfo = RP.byId("seatSelectionInfo");
  const preferredBerth = RP.byId("preferredBerth");
  const autoAssignBtn = RP.byId("autoAssignBtn");
  const continuePaymentBtn = RP.byId("continuePaymentBtn");
  const summary = RP.byId("bookingSummary");
  const paymentForm = RP.byId("paymentForm");
  const ticketPreview = RP.byId("ticketPreview");
  const filterButtons = Array.from(document.querySelectorAll("[data-train-filter]"));
  const bookingCaptchaWrap = RP.byId("bookingCaptchaWrap");
  const bookingCaptchaQuestion = RP.byId("bookingCaptchaQuestion");
  const bookingCaptchaInput = RP.byId("bookingCaptchaInput");
  const bookingCaptchaVerifyBtn = RP.byId("bookingCaptchaVerifyBtn");

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

  let lastSearch = null;
  let selectedTrain = null;
  let passengers = [];
  let currentPassengerIndex = 0;
  let allSeats = [];
  let selectedSeats = [];
  let activeTrainFilter = "recommended";
  let searchAttempts = 0;
  let bookingCaptchaAnswer = "";
  let bookingCaptchaVerified = false;

  const berthCycle = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];

  function hashText(text) {
    let hash = 0;
    const value = String(text || "");
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function seatLabel(berthCode) {
    const map = { LB: "Lower Berth", MB: "Middle Berth", UB: "Upper Berth", SL: "Side Lower", SU: "Side Upper" };
    return map[berthCode] || berthCode;
  }

  function createCaptchaChallenge() {
    const left = Math.floor(10 + Math.random() * 40);
    const right = Math.floor(1 + Math.random() * 9);
    bookingCaptchaAnswer = String(left + right);
    if (bookingCaptchaQuestion) {
      bookingCaptchaQuestion.textContent = `Security check: ${left} + ${right} = ?`;
    }
    if (bookingCaptchaInput) {
      bookingCaptchaInput.value = "";
    }
  }

  function bookingCaptchaRequired() {
    const isTatkal = RP.byId("journeyQuota").value === "Tatkal";
    return isTatkal || searchAttempts >= 2;
  }

  function setStep(stepNumber) {
    document.querySelectorAll(".step").forEach((el, idx) => {
      el.classList.toggle("active", idx + 1 === stepNumber);
    });

    Object.keys(steps).forEach((key) => {
      steps[key].classList.toggle("hidden", Number(key) !== stepNumber);
    });
  }

  function passengerRowTemplate(index, data) {
    const categories = travelCategories
      .map((cat) => `<option value="${cat}" ${data.category === cat ? "selected" : ""}>${cat}</option>`)
      .join("");

    return `
      <article class="card" data-passenger-row="${index}">
        <h3>Passenger ${index + 1}</h3>
        <div class="form-grid-3">
          <label>Name
            <input class="passenger-name" value="${data.name || ""}" required />
          </label>
          <label>Age
            <input type="number" class="passenger-age" min="1" max="120" value="${data.age || ""}" required />
          </label>
          <label>Gender
            <select class="passenger-gender" required>
              <option value="">Select</option>
              <option value="Male" ${data.gender === "Male" ? "selected" : ""}>Male</option>
              <option value="Female" ${data.gender === "Female" ? "selected" : ""}>Female</option>
              <option value="Other" ${data.gender === "Other" ? "selected" : ""}>Other</option>
            </select>
          </label>
          <label>ID Type
            <select class="passenger-id-type" required>
              <option value="">Select</option>
              <option value="Aadhaar" ${data.idType === "Aadhaar" ? "selected" : ""}>Aadhaar</option>
              <option value="PAN" ${data.idType === "PAN" ? "selected" : ""}>PAN</option>
              <option value="Passport" ${data.idType === "Passport" ? "selected" : ""}>Passport</option>
              <option value="Driving License" ${data.idType === "Driving License" ? "selected" : ""}>Driving License</option>
              <option value="Voter ID" ${data.idType === "Voter ID" ? "selected" : ""}>Voter ID</option>
            </select>
          </label>
          <label>ID Number
            <input class="passenger-id-number" value="${data.idNumber || ""}" required />
          </label>
          <label>Category
            <select class="passenger-category" required>
              <option value="">Select</option>
              ${categories}
            </select>
          </label>
        </div>
      </article>
    `;
  }

  function renderPassengerRows() {
    passengerRows.innerHTML = passengers
      .map((p, idx) => passengerRowTemplate(idx, p))
      .join("");
  }

  function addPassenger(data) {
    if (passengers.length >= 6) {
      RP.showMessage("bookingMessage", "Maximum 6 passengers allowed per booking.", "error");
      return;
    }

    passengers.push(
      data || {
        name: "",
        age: "",
        gender: "",
        idType: "",
        idNumber: "",
        category: "General Passenger"
      }
    );

    selectedSeats.push(null);
    renderPassengerRows();
  }

  function removePassenger() {
    if (passengers.length <= 1) {
      RP.showMessage("bookingMessage", "At least one passenger is required.", "error");
      return;
    }

    passengers.pop();
    selectedSeats.pop();
    if (currentPassengerIndex >= passengers.length) {
      currentPassengerIndex = passengers.length - 1;
    }
    renderPassengerRows();
  }

  function readPassengerRows() {
    const rows = passengerRows.querySelectorAll("[data-passenger-row]");
    const values = [];

    for (const row of rows) {
      const name = row.querySelector(".passenger-name").value.trim();
      const age = Number(row.querySelector(".passenger-age").value);
      const gender = row.querySelector(".passenger-gender").value;
      const idType = row.querySelector(".passenger-id-type").value;
      const idNumber = row.querySelector(".passenger-id-number").value.trim();
      const category = row.querySelector(".passenger-category").value;

      if (!name || !age || !gender || !idType || !idNumber || !category) {
        return { ok: false, error: "Please fill all passenger details for every passenger." };
      }

      values.push({ name, age, gender, idType, idNumber, category });
    }

    return { ok: true, values };
  }

  function buildSeatMap() {
    const seedBase = `${selectedTrain.trainNumber}|${lastSearch.date}|${RP.byId("travelClass").value}`;
    const classCode = RP.byId("travelClass").value;
    const coachPrefix = classCode === "2S" ? "D" : classCode === "CC" ? "C" : classCode === "EC" ? "E" : classCode === "1A" ? "H" : classCode === "2A" ? "A" : classCode === "3A" ? "B" : "S";

    allSeats = [];
    for (let i = 1; i <= 48; i += 1) {
      const berth = berthCycle[(i - 1) % berthCycle.length];
      const coach = `${coachPrefix}${1 + (hashText(seedBase) % 6)}`;
      const booked = (hashText(`${seedBase}|${i}`) % 100) < 20;
      allSeats.push({ key: `${coach}-${i}`, coach, seat: String(i), berth, booked });
    }
  }

  function renderPassengerSeatTabs() {
    passengerSeatTabs.innerHTML = passengers
      .map((p, idx) => {
        const selected = selectedSeats[idx];
        const activeClass = idx === currentPassengerIndex ? 'style="border-color:#b91c1c;background:#fee2e2;color:#b91c1c;"' : "";
        const seatText = selected ? `${selected.coach}-${selected.seat}` : "Seat: not selected";
        return `<button type="button" class="btn btn-secondary" data-seat-passenger="${idx}" ${activeClass}>P${idx + 1}: ${p.name || "Passenger"} (${seatText})</button>`;
      })
      .join("");

    passengerSeatTabs.querySelectorAll("[data-seat-passenger]").forEach((btn) => {
      btn.addEventListener("click", function () {
        currentPassengerIndex = Number(btn.getAttribute("data-seat-passenger"));
        renderSeatSelection();
      });
    });
  }

  function renderSeatSelection() {
    renderPassengerSeatTabs();

    const takenSeatKeys = new Set(selectedSeats.filter(Boolean).map((s) => s.key));

    seatLayout.innerHTML = allSeats
      .map((seat) => {
        const selectedByCurrent = selectedSeats[currentPassengerIndex] && selectedSeats[currentPassengerIndex].key === seat.key;
        const selectedByOther = !selectedByCurrent && takenSeatKeys.has(seat.key);
        const blocked = seat.booked || selectedByOther;
        return `<button type="button" class="seat-slot ${blocked ? "booked" : ""} ${selectedByCurrent ? "selected" : ""}" data-seat-key="${seat.key}" ${blocked ? "disabled" : ""}>${seat.coach}-${seat.seat}<br/>${seat.berth}</button>`;
      })
      .join("");

    seatLayout.querySelectorAll("[data-seat-key]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-seat-key");
        const seat = allSeats.find((s) => s.key === key);
        if (!seat || seat.booked) return;

        selectedSeats[currentPassengerIndex] = seat;
        seatSelectionInfo.textContent = `Passenger ${currentPassengerIndex + 1} selected ${seat.coach}-${seat.seat} (${seatLabel(seat.berth)})`;
        renderSeatSelection();
      });
    });
  }

  function autoAssignRemaining() {
    const preferred = preferredBerth.value;

    for (let i = 0; i < passengers.length; i += 1) {
      if (selectedSeats[i]) continue;

      const taken = new Set(selectedSeats.filter(Boolean).map((s) => s.key));
      let pool = allSeats.filter((s) => !s.booked && !taken.has(s.key));
      if (preferred) {
        const byPreferred = pool.filter((s) => s.berth === preferred);
        if (byPreferred.length) pool = byPreferred;
      }

      if (!pool.length) {
        RP.showMessage("bookingMessage", "Could not auto-assign all passengers. Please select manually.", "error");
        return;
      }

      selectedSeats[i] = pool[0];
    }

    seatSelectionInfo.textContent = "Seats auto-assigned for all passengers.";
    renderSeatSelection();
  }

  function formatAvailability(seatInfo) {
    if (!seatInfo) return "N/A";
    if (seatInfo.status === "Available") return `Available ${seatInfo.count}`;
    if (seatInfo.status === "RAC") return `RAC ${seatInfo.count}`;
    return `WL ${seatInfo.count}`;
  }

  function parseDurationToMinutes(durationText) {
    const value = String(durationText || "");
    const match = value.match(/(\d+)\s*h\s*(\d+)\s*m/i);
    if (match) {
      return Number(match[1]) * 60 + Number(match[2]);
    }
    return Number.MAX_SAFE_INTEGER;
  }

  function parseTimeToMinutes(timeText) {
    const value = String(timeText || "");
    const match = value.match(/^\s*(\d{1,2}):(\d{2})\s*$/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function fareForClass(train, preferredClass) {
    const classCode = (train.availableClasses || []).includes(preferredClass)
      ? preferredClass
      : (train.availableClasses || [])[0];
    return Number((train.baseFares || {})[classCode] || Number.MAX_SAFE_INTEGER);
  }

  function isDirectTrain(train) {
    if (train.direct === false) return false;
    if (train.requiresChange === true) return false;
    if (Array.isArray(train.routeSegments) && train.routeSegments.length > 1) return false;
    return true;
  }

  function applyTrainFilter(results, preferredClass) {
    const list = [...(results || [])];

    if (activeTrainFilter === "fastest") {
      return list.sort((a, b) => parseDurationToMinutes(a.travelDuration) - parseDurationToMinutes(b.travelDuration));
    }

    if (activeTrainFilter === "lowestFare") {
      return list.sort((a, b) => fareForClass(a, preferredClass) - fareForClass(b, preferredClass));
    }

    if (activeTrainFilter === "earlyDeparture") {
      return list.sort((a, b) => parseTimeToMinutes(a.departureTime) - parseTimeToMinutes(b.departureTime));
    }

    if (activeTrainFilter === "directTrain") {
      return list.filter(isDirectTrain);
    }

    return list;
  }

  function availabilityBadgeClass(seatInfo) {
    if (!seatInfo || !seatInfo.status) return "availability-pill";
    if (seatInfo.status === "Available") return "availability-pill is-available";
    if (seatInfo.status === "RAC") return "availability-pill is-rac";
    return "availability-pill is-wl";
  }

  function renderTrainList(results, preferredClass) {
    if (!results.length) {
      trainList.innerHTML = '<div class="train-item"><p class="muted">No trains found for this route on the selected date. Try another date, class, or nearby station.</p></div>';
      return;
    }

    trainList.innerHTML = results
      .map((train) => {
        const quotaNote =
          lastSearch && lastSearch.quota === "Tatkal"
            ? '<span class="badge badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> Tatkal quota - limited seats</span>'
            : "";

        const availabilityHtml = Object.entries(train.seatAvailability || {})
          .map(
            ([cls, info]) => `
              <div class="availability-item">
                <span class="availability-class">${cls}</span>
                <span class="${availabilityBadgeClass(info)}">${formatAvailability(info)}</span>
              </div>
            `
          )
          .join("");

        const classToBook = train.availableClasses.includes(preferredClass) ? preferredClass : train.availableClasses[0];

        return `
          <article class="train-item train-card-modern">
            <div class="train-head">
              <strong>${train.trainName} (${train.trainNumber})</strong>
              <span class="train-type-chip"><i class="fa-solid fa-train"></i> ${train.trainType}</span>
            </div>

            <p class="muted">
              <i class="fa-solid fa-location-dot"></i> ${train.fromStationName} (${train.fromStation})
              <i class="fa-solid fa-arrow-right-long"></i>
              ${train.toStationName} (${train.toStation})
            </p>

            <div class="train-times">
              <div class="time-block">
                <span class="time-label">Departure</span>
                <strong>${train.departureTime}</strong>
              </div>
              <div class="time-block">
                <span class="time-label">Duration</span>
                <strong>${train.travelDuration}</strong>
              </div>
              <div class="time-block">
                <span class="time-label">Arrival</span>
                <strong>${train.arrivalTime}</strong>
              </div>
            </div>

            <p class="muted running-days"><i class="fa-regular fa-calendar-days"></i> Running: ${(train.runningDays || []).join(", ")}</p>

            <div class="availability-grid">${availabilityHtml}</div>

            <div class="train-footer">
              <p class="muted"><i class="fa-solid fa-road"></i> ${train.distanceKm} km | Classes: ${(train.availableClasses || []).join(", ")}</p>
              <button class="btn" data-train="${train.trainNumber}" data-class="${classToBook}">
                <i class="fa-solid fa-ticket"></i> Book Now
              </button>
            </div>

            ${quotaNote}
          </article>
        `;
      })
      .join("");

    trainList.querySelectorAll("[data-train]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const trainNumber = btn.getAttribute("data-train");
        const cls = btn.getAttribute("data-class");
        selectedTrain = (lastSearch.results || []).find((t) => t.trainNumber === trainNumber) || null;
        if (!selectedTrain) return;

        RP.byId("travelClass").value = cls;
        if (lastSearch.quota === "Tatkal") {
          tatkalToggle.checked = true;
          tatkalToggle.dispatchEvent(new Event("change"));
        }
        setStep(3);
      });
    });
  }

  function renderFilteredTrainList(preferredClass) {
    const sourceResults = (lastSearch && lastSearch.results) || [];
    const filtered = applyTrainFilter(sourceResults, preferredClass);
    renderTrainList(filtered, preferredClass);
  }

  async function fillDefaultsFromQuery() {
    RP.attachStationAutocomplete("fromStation");
    RP.attachStationAutocomplete("toStation");

    if (params.get("from")) {
      const st = await RP.getStationByCode(params.get("from"));
      RP.byId("fromStation").value = st ? `${st.stationName} (${st.stationCode})` : params.get("from");
    }
    if (params.get("to")) {
      const st = await RP.getStationByCode(params.get("to"));
      RP.byId("toStation").value = st ? `${st.stationName} (${st.stationCode})` : params.get("to");
    }
    if (params.get("date")) RP.byId("journeyDate").value = params.get("date");
    if (params.get("travelClass")) RP.byId("journeyClass").value = params.get("travelClass");
    if (params.get("quota")) RP.byId("journeyQuota").value = params.get("quota");

    const dateInput = RP.byId("journeyDate");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.min = minDate;
    if (!dateInput.value) dateInput.value = minDate;
  }

  if (swapStationsBtn) {
    swapStationsBtn.addEventListener("click", function swapStations() {
      RP.swapStations("fromStation", "toStation");
    });
  }

  if (bookingCaptchaVerifyBtn) {
    bookingCaptchaVerifyBtn.addEventListener("click", function () {
      const answer = String((bookingCaptchaInput && bookingCaptchaInput.value) || "").trim();
      if (answer !== bookingCaptchaAnswer) {
        RP.showMessage("bookingMessage", "Verification answer is incorrect. Please try again.", "error");
        return;
      }

      bookingCaptchaVerified = true;
      if (bookingCaptchaWrap) bookingCaptchaWrap.classList.add("hidden");
      RP.showMessage("bookingMessage", "Verification complete. You can continue searching trains.", "success");
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      activeTrainFilter = button.getAttribute("data-train-filter") || "recommended";
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      if (lastSearch && Array.isArray(lastSearch.results)) {
        renderFilteredTrainList(lastSearch.preferredClass);
      }
    });
  });
  formSearch.addEventListener("submit", async function (event) {
    event.preventDefault();
    RP.hideMessage("bookingMessage");

    if (bookingCaptchaRequired() && !bookingCaptchaVerified) {
      if (bookingCaptchaWrap) {
        createCaptchaChallenge();
        bookingCaptchaWrap.classList.remove("hidden");
      }
      RP.showMessage("bookingMessage", "Please complete the quick verification before searching trains.", "info");
      return;
    }

    try {
      RP.showLoader();

      const fromCode = RP.parseStationCode(RP.byId("fromStation").value);
      const toCode = RP.parseStationCode(RP.byId("toStation").value);
      const date = RP.byId("journeyDate").value;
      const preferredClass = RP.byId("journeyClass").value;
      const quota = RP.byId("journeyQuota").value;

      const [fromStation, toStation] = await Promise.all([RP.getStationByCode(fromCode), RP.getStationByCode(toCode)]);
      if (!fromStation || !toStation) {
        RP.showMessage("bookingMessage", "Please select valid source and destination stations from the autocomplete list.", "error");
        return;
      }

      if (fromStation.stationCode === toStation.stationCode) {
        RP.showMessage("bookingMessage", "Source and destination stations must be different.", "error");
        return;
      }

      const payload = await RP.searchTrains({
        from: fromStation.stationCode,
        to: toStation.stationCode,
        date,
        class: preferredClass,
        quota
      });

      lastSearch = {
        from: fromStation.stationCode,
        to: toStation.stationCode,
        date,
        preferredClass,
        quota,
        results: payload.results || []
      };
      searchAttempts += 1;
      bookingCaptchaVerified = false;

      selectedTrain = null;
      passengers = [];
      selectedSeats = [];
      addPassenger();
      renderFilteredTrainList(preferredClass);
      setStep(2);
    } catch (error) {
      RP.showMessage("bookingMessage", error.message || "No trains found for this route on the selected date. Please try another class, date, or nearby station.", "error");
    } finally {
      RP.hideLoader();
    }
  });

  tatkalToggle.addEventListener("change", function () {
    const cls = RP.byId("travelClass").value;
    const chargeMap = { SL: 120, "2S": 80, "3A": 250, "2A": 350, "1A": 500, EC: 220, CC: 180 };
    const charge = chargeMap[cls] || 100;

    if (tatkalToggle.checked) {
      tatkalInfo.classList.remove("hidden");
      tatkalInfo.innerHTML = `<span class="badge badge-warning">Tatkal Quota</span> Additional charges Rs ${charge} per passenger. Limited seats.`;
    } else {
      tatkalInfo.classList.add("hidden");
      tatkalInfo.innerHTML = "";
    }
  });

  addPassengerBtn.addEventListener("click", function () {
    RP.hideMessage("bookingMessage");
    addPassenger();
  });

  removePassengerBtn.addEventListener("click", function () {
    RP.hideMessage("bookingMessage");
    removePassenger();
  });

  continueSeatBtn.addEventListener("click", function () {
    RP.hideMessage("bookingMessage");

    if (!selectedTrain || !lastSearch) {
      RP.showMessage("bookingMessage", "Please search and select a train first.", "error");
      setStep(1);
      return;
    }

    const classCode = RP.byId("travelClass").value;
    if (!selectedTrain.availableClasses.includes(classCode)) {
      RP.showMessage("bookingMessage", "Selected class is not available in this train.", "error");
      return;
    }

    const result = readPassengerRows();
    if (!result.ok) {
      RP.showMessage("bookingMessage", result.error, "error");
      return;
    }

    passengers = result.values;
    if (tatkalToggle.checked) {
      passengers = passengers.map((p) => ({ ...p, category: "Tatkal Passenger" }));
    }

    if (!selectedSeats || selectedSeats.length !== passengers.length) {
      selectedSeats = Array.from({ length: passengers.length }, () => null);
    }

    currentPassengerIndex = 0;
    buildSeatMap();
    renderSeatSelection();
    setStep(4);
  });

  autoAssignBtn.addEventListener("click", function () {
    RP.hideMessage("bookingMessage");
    autoAssignRemaining();
  });

  continuePaymentBtn.addEventListener("click", function () {
    RP.hideMessage("bookingMessage");

    if (selectedSeats.some((s) => !s)) {
      RP.showMessage("bookingMessage", "Please select/assign seats for all passengers.", "error");
      return;
    }

    const classCode = RP.byId("travelClass").value;
    const baseFare = Number((selectedTrain.baseFares || {})[classCode] || 0);
    const tatkalCharge = tatkalToggle.checked ? Math.round(baseFare * 0.2) : 0;
    const farePerPassenger = baseFare + tatkalCharge;
    const totalFare = farePerPassenger * passengers.length;

    const seatText = selectedSeats.map((s, i) => `P${i + 1}: ${s.coach}-${s.seat}`).join(" | ");

    summary.innerHTML = `
      <div class="ticket-field"><strong>Train</strong>${selectedTrain.trainNumber} ${selectedTrain.trainName}</div>
      <div class="ticket-field"><strong>Route</strong>${selectedTrain.fromStationName} (${selectedTrain.fromStation}) to ${selectedTrain.toStationName} (${selectedTrain.toStation})</div>
      <div class="ticket-field"><strong>Date</strong>${lastSearch.date}</div>
      <div class="ticket-field"><strong>Quota</strong>${lastSearch.quota}</div>
      <div class="ticket-field"><strong>Passengers</strong>${passengers.length}</div>
      <div class="ticket-field"><strong>Class</strong>${RP.classLabels[classCode]}</div>
      <div class="ticket-field"><strong>Seats</strong>${seatText}</div>
      <div class="ticket-field"><strong>Fare</strong>Rs ${farePerPassenger} x ${passengers.length} = Rs ${totalFare}</div>
    `;

    setStep(5);
  });

  paymentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("bookingMessage");

    const paymentMode = RP.byId("paymentMode").value;
    const paymentRef = RP.byId("paymentRef").value.trim();
    const classCode = RP.byId("travelClass").value;

    if (!paymentMode || !paymentRef) {
      RP.showMessage("bookingMessage", "Enter payment details.", "error");
      return;
    }

    if (!selectedTrain || !lastSearch || !passengers.length || selectedSeats.some((s) => !s)) {
      RP.showMessage("bookingMessage", "Booking data incomplete. Please restart flow.", "error");
      return;
    }

    const baseFare = Number((selectedTrain.baseFares || {})[classCode] || 0);
    const tatkalCharge = tatkalToggle.checked ? Math.round(baseFare * 0.2) : 0;
    const farePerPassenger = baseFare + tatkalCharge;
    const totalFare = farePerPassenger * passengers.length;

    const classAvailability = (selectedTrain.seatAvailability || {})[classCode] || { status: "Available", count: 1 };
    const bookingStatus = classAvailability.status === "Available" ? "CONFIRMED" : classAvailability.status.toUpperCase();

    const booking = {
      id: `BK${Date.now()}`,
      userId: RP.getCurrentUser().id,
      trainName: selectedTrain.trainName,
      trainNumber: selectedTrain.trainNumber,
      from: selectedTrain.fromStation,
      to: selectedTrain.toStation,
      fromStationName: selectedTrain.fromStationName,
      toStationName: selectedTrain.toStationName,
      date: lastSearch.date,
      pnr: RP.generatePNR(),
      bookingCategory: tatkalToggle.checked ? "Tatkal Passenger" : lastSearch.quota,
      travelClass: classCode,
      status: bookingStatus,
      fare: totalFare,
      paymentMode,
      paymentRef,
      quota: lastSearch.quota,
      passengers: passengers.map((p, idx) => ({
        ...p,
        coach: selectedSeats[idx].coach,
        seat: selectedSeats[idx].seat,
        berth: selectedSeats[idx].berth
      })),
      passengerName: passengers[0].name,
      age: passengers[0].age,
      gender: passengers[0].gender,
      idType: passengers[0].idType,
      idNumber: passengers[0].idNumber,
      coach: selectedSeats[0].coach,
      seat: selectedSeats[0].seat,
      berth: selectedSeats[0].berth,
      createdAt: new Date().toISOString()
    };

    RP.showLoader();
    setTimeout(function () {
      RP.hideLoader();
      RP.pushBooking(booking);
      localStorage.setItem("rp_latest_pnr", booking.pnr);
      RP.showMessage("bookingMessage", "Payment successful. Ticket generated.", "success");

      const passengerLines = booking.passengers
        .map((p, i) => `<p class="muted">P${i + 1}: ${p.name} - ${p.coach}-${p.seat} (${seatLabel(p.berth)})</p>`)
        .join("");

      ticketPreview.innerHTML = `
        <div class="ticket-card">
          <h2>Ticket Confirmed</h2>
          <div class="grid grid-2">
            <div>
              <p><strong>${booking.trainNumber} ${booking.trainName}</strong></p>
              <p class="muted">${booking.fromStationName} (${booking.from}) to ${booking.toStationName} (${booking.to})</p>
              <p class="muted">Date: ${booking.date} | Quota: ${booking.quota}</p>
              <p class="muted">PNR: ${booking.pnr} | Status: ${booking.status}</p>
              ${passengerLines}
            </div>
            <div class="qr-wrap">
              <img alt="Ticket QR" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(booking.pnr + '|' + booking.trainNumber + '|' + booking.date)}" />
            </div>
          </div>
          <div class="no-print" style="display:flex;gap:0.5rem;margin-top:0.8rem;flex-wrap:wrap;">
            <a class="btn" href="ticket.html?pnr=${booking.pnr}">Download Ticket</a>
            <a class="btn btn-secondary" href="dashboard.html">Go to Dashboard</a>
          </div>
        </div>
      `;

      setStep(6);
    }, 900);
  });

  fillDefaultsFromQuery();
  addPassenger();
  setStep(1);
})();

















