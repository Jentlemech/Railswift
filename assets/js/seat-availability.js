(function () {
  const RP = window.RailPortal;
  const form = RP.byId("seatAvailabilityForm");
  const results = RP.byId("seatResults");
  const dateInput = RP.byId("seatDate");

  if (!form || !results || !dateInput) return;

  RP.attachStationAutocomplete("seatFrom");
  RP.attachStationAutocomplete("seatTo");

  const today = new Date().toISOString().slice(0, 10);
  dateInput.min = today;
  dateInput.value = today;

  function badgeClass(status) {
    if (status === "Available") return "availability-pill is-available";
    if (status === "RAC") return "availability-pill is-rac";
    return "availability-pill is-wl";
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    RP.hideMessage("seatMessage");

    try {
      RP.showLoader();
      const fromCode = RP.parseStationCode(RP.byId("seatFrom").value);
      const toCode = RP.parseStationCode(RP.byId("seatTo").value);
      const travelClass = RP.byId("seatClass").value;

      const [from, to] = await Promise.all([RP.getStationByCode(fromCode), RP.getStationByCode(toCode)]);
      if (!from || !to) {
        RP.showMessage("seatMessage", "Please choose valid station names or codes.", "error");
        return;
      }

      const payload = await RP.searchTrains({
        from: from.stationCode,
        to: to.stationCode,
        date: dateInput.value,
        class: travelClass,
        quota: "General"
      });

      if (!payload.results.length) {
        results.innerHTML = '<p class="muted">No trains found for selected date and route.</p>';
        RP.showMessage("seatMessage", "No matching trains found.", "error");
        return;
      }

      results.innerHTML = payload.results
        .map((train) => {
          const seat = (train.seatAvailability || {})[travelClass] || { status: "Waiting List", count: 0 };
          return `
            <article class="train-item train-card-modern">
              <div class="train-head">
                <strong>${train.trainName} (${train.trainNumber})</strong>
                <span class="${badgeClass(seat.status)}">${seat.status} ${seat.count}</span>
              </div>
              <p class="muted">${train.fromStationName} (${train.fromStation}) -> ${train.toStationName} (${train.toStation})</p>
              <p class="muted">Departure ${train.departureTime} | Arrival ${train.arrivalTime} | Duration ${train.travelDuration}</p>
              <div class="train-footer">
                <p class="muted">Class: ${travelClass}</p>
                <a class="btn" href="booking.html?from=${train.fromStation}&to=${train.toStation}&date=${dateInput.value}&travelClass=${travelClass}&quota=General">Book Ticket</a>
              </div>
            </article>
          `;
        })
        .join("");

      RP.showMessage("seatMessage", `Found ${payload.results.length} trains.`, "success");
    } catch (error) {
      RP.showMessage("seatMessage", error.message || "Unable to check availability.", "error");
    } finally {
      RP.hideLoader();
    }
  });
})();
