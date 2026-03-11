(function () {
  const RP = window.RailPortal;
  const list = RP.byId("tripList");

  if (!list) return;

  const user = RP.getCurrentUser();
  if (!user) {
    RP.showMessage("tripsMessage", "Please login to view your bookings.", "error");
    list.innerHTML = '<a class="btn" href="login.html">Login</a>';
    return;
  }

  const bookings = RP.getBookings().filter((booking) => booking.userId === user.id);

  if (!bookings.length) {
    list.innerHTML = '<div class="ticket-field">No bookings yet. Search and book your first train.</div>';
    return;
  }

  list.innerHTML = bookings
    .map(
      (booking) => `
        <article class="train-item train-card-modern">
          <div class="train-head">
            <strong>${booking.trainName} (${booking.trainNumber})</strong>
            <span class="badge ${booking.status === "CONFIRMED" ? "badge-success" : "badge-warning"}">${booking.status}</span>
          </div>
          <p class="muted">${booking.fromStationName || booking.from} -> ${booking.toStationName || booking.to} | ${booking.date}</p>
          <p class="muted">PNR: ${booking.pnr} | Class: ${booking.travelClass} | Fare: INR ${booking.fare}</p>
          <div class="train-footer">
            <a class="btn btn-secondary" href="pnr.html">Check PNR</a>
            <a class="btn" href="ticket.html?pnr=${booking.pnr}">Download Ticket</a>
          </div>
        </article>
      `
    )
    .join("");
})();
