(function () {
  const RP = window.RailPortal;
  const user = RP.getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const bookingsBox = RP.byId("bookingsList");
  const profileBox = RP.byId("profileCard");

  function renderProfile() {
    profileBox.innerHTML = `
      <h2>Profile</h2>
      <p class="muted">Logged in as ${user.name}</p>
      <div class="ticket-field"><strong>Email</strong>${user.email}</div>
      <div class="ticket-field"><strong>Mobile</strong>${user.mobile}</div>
      <div style="margin-top:0.7rem;display:flex;gap:0.5rem;flex-wrap:wrap;" class="no-print">
        <a href="booking.html" class="btn">Book Ticket</a>
        <button type="button" id="logoutBtn" class="btn btn-secondary">Logout</button>
      </div>
    `;

    const logoutBtn = RP.byId("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        RP.logout();
        window.location.href = "index.html";
      });
    }
  }

  function cancelBooking(pnr) {
    const bookings = RP.getBookings();
    const idx = bookings.findIndex((b) => b.pnr === pnr && b.userId === user.id);
    if (idx === -1) return;
    bookings[idx].status = "CANCELLED";
    RP.saveBookings(bookings);
    RP.showMessage("dashboardMessage", `Ticket ${pnr} cancelled successfully.`, "success");
    renderBookings();
  }

  function renderBookings() {
    const bookings = RP.getUserBookings();

    if (!bookings.length) {
      bookingsBox.innerHTML = '<div class="booking-item"><p class="muted">No bookings found. Start by booking a ticket.</p><a href="booking.html" class="btn">Book Ticket</a></div>';
      return;
    }

    bookingsBox.innerHTML = bookings
      .map((b) => {
        const statusClass = b.status === "CONFIRMED" ? "badge-success" : "badge-danger";
        const passengers = Array.isArray(b.passengers) && b.passengers.length ? b.passengers : [{ name: b.passengerName, coach: b.coach, seat: b.seat }];
        const seatSummary = passengers.map((p, i) => `P${i + 1}:${p.coach}-${p.seat}`).join(" | ");

        return `
          <article class="booking-item">
            <div class="grid grid-3">
              <div>
                <strong>${b.trainName} (${b.trainNumber})</strong>
                <p class="muted">${b.fromStationName ? `${b.fromStationName} (${b.from})` : RP.formatStation(b.from)} to ${b.toStationName ? `${b.toStationName} (${b.to})` : RP.formatStation(b.to)}</p>
                <p class="muted">Date: ${b.date} | Class: ${RP.classLabels[b.travelClass] || b.travelClass} | Quota: ${b.quota || b.bookingCategory || "General"}</p>
              </div>
              <div>
                <p><span class="badge ${statusClass}">${b.status}</span></p>
                <p class="muted">PNR: ${b.pnr}</p>
                <p class="muted">Passengers: ${passengers.length}</p>
                <p class="muted">${seatSummary}</p>
              </div>
              <div class="no-print" style="display:flex;flex-wrap:wrap;gap:0.45rem;align-content:flex-start;justify-content:flex-end;">
                <a class="btn btn-secondary" href="ticket.html?pnr=${b.pnr}">Download Ticket</a>
                ${b.status === "CONFIRMED" ? `<button class="btn btn-danger" data-cancel="${b.pnr}">Cancel Ticket</button>` : ""}
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    bookingsBox.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", function () {
        cancelBooking(btn.getAttribute("data-cancel"));
      });
    });
  }

  renderProfile();
  renderBookings();
})();
