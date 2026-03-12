(function () {
  const RP = window.RailPortal;
  const form = RP.byId("pnrForm");
  if (!form) return;

  function routeText(booking) {
    const fromText = booking.fromStationName ? `${booking.fromStationName} (${booking.from})` : RP.formatStation(booking.from);
    const toText = booking.toStationName ? `${booking.toStationName} (${booking.to})` : RP.formatStation(booking.to);
    return `${fromText} to ${toText}`;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("pnrMessage");

    const pnr = RP.byId("pnrInput").value.trim();
    const booking = RP.getBookings().find((b) => b.pnr === pnr);

    if (!booking) {
      RP.showMessage("pnrMessage", "PNR not found. Please verify the number.", "error");
      RP.byId("pnrResult").innerHTML = "";
      return;
    }

    const passengers = Array.isArray(booking.passengers) && booking.passengers.length
      ? booking.passengers
      : [{ name: booking.passengerName, coach: booking.coach, seat: booking.seat }];
    const normalizedStatus = String(booking.status || "").toUpperCase();
    const badgeClass = normalizedStatus === "CONFIRMED" ? "badge-success" : normalizedStatus === "RAC" ? "badge-warning" : "badge-danger";

    const passengerLines = passengers
      .map((p, i) => {
        const seatText = normalizedStatus === "CONFIRMED"
          ? `${p.coach}-${p.seat}`
          : normalizedStatus === "RAC"
            ? "RAC seat will be assigned after charting"
            : "Seat not assigned yet";
        return `<div class="ticket-field"><strong>P${i + 1}</strong>${p.name} - ${seatText}</div>`;
      })
      .join("");

    RP.byId("pnrResult").innerHTML = `
      <div class="ticket-card">
        <h2>PNR Status</h2>
        <p><span class="badge ${badgeClass}">${normalizedStatus || "UNKNOWN"}</span></p>
        <div class="ticket-grid">
          <div class="ticket-field"><strong>Train</strong>${booking.trainName} (${booking.trainNumber})</div>
          <div class="ticket-field"><strong>Journey</strong>${routeText(booking)}</div>
          <div class="ticket-field"><strong>Date</strong>${booking.date}</div>
          <div class="ticket-field"><strong>Quota</strong>${booking.quota || booking.bookingCategory || "General"}</div>
          <div class="ticket-field"><strong>Class</strong>${RP.classLabels[booking.travelClass] || booking.travelClass}</div>
          <div class="ticket-field"><strong>Coach / Seat</strong>${normalizedStatus === "CONFIRMED" ? `${booking.coach}-${booking.seat}` : normalizedStatus === "RAC" ? "RAC" : "Waiting List"}</div>
          <div class="ticket-field"><strong>Passengers</strong>${passengers.length}</div>
          ${passengerLines}
        </div>
      </div>
    `;
    RP.showMessage("pnrMessage", "PNR details loaded successfully.", "success");
  });
})();
