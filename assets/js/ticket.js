(function () {
  const RP = window.RailPortal;
  if (!RP.requireAuth("login.html")) return;

  const params = new URLSearchParams(window.location.search);
  const pnr = params.get("pnr") || localStorage.getItem("rp_latest_pnr");
  const ticketBox = RP.byId("ticketContainer");

  function routeLabel(booking) {
    const fromText = booking.fromStationName ? `${booking.fromStationName} (${booking.from})` : RP.formatStation(booking.from);
    const toText = booking.toStationName ? `${booking.toStationName} (${booking.to})` : RP.formatStation(booking.to);
    return `${fromText} to ${toText}`;
  }

  function renderTicket(booking) {
    const qrData = `${booking.pnr}|${booking.trainNumber}|${booking.date}`;
    const route = routeLabel(booking);
    const passengers = Array.isArray(booking.passengers) && booking.passengers.length
      ? booking.passengers
      : [{ name: booking.passengerName, coach: booking.coach, seat: booking.seat, berth: booking.berth, gender: booking.gender, age: booking.age }];

    const passengerRows = passengers
      .map(
        (p, i) => `
          <div class="ticket-field">
            <strong>Passenger ${i + 1}</strong>
            ${p.name} (${p.gender || "-"}, ${p.age || "-"}) - ${p.coach}-${p.seat}${p.berth ? ` (${p.berth})` : ""}
          </div>
        `
      )
      .join("");

    ticketBox.innerHTML = `
      <article id="ticketCard" class="ticket-card">
        <h1>Indian Railways e-Ticket</h1>
        <p class="muted">Government of India | Ministry of Railways</p>
        <div class="grid grid-2">
          <div>
            <p><strong>${booking.trainName} (${booking.trainNumber})</strong></p>
            <p class="muted">${route}</p>
            <p class="muted">Journey Date: ${booking.date}</p>
            <p class="muted">Quota: ${booking.quota || booking.bookingCategory || "General"}</p>
            <p class="muted">Passengers: ${passengers.length}</p>
          </div>
          <div class="qr-wrap">
            <img id="ticketQr" alt="Ticket QR" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" />
          </div>
        </div>
        <div class="ticket-grid">
          <div class="ticket-field"><strong>PNR Number</strong>${booking.pnr}</div>
          <div class="ticket-field"><strong>Class</strong>${RP.classLabels[booking.travelClass] || booking.travelClass}</div>
          <div class="ticket-field"><strong>Status</strong>${booking.status}</div>
          <div class="ticket-field"><strong>Payment Mode</strong>${booking.paymentMode || "-"}</div>
          <div class="ticket-field"><strong>Total Fare</strong>Rs ${booking.fare}</div>
          <div class="ticket-field"><strong>Booking Category</strong>${booking.bookingCategory || "General Passenger"}</div>
          ${passengerRows}
        </div>
      </article>
      <div class="no-print" style="margin-top:0.9rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button id="downloadPdfBtn" class="btn">Download PDF</button>
        <button id="printTicketBtn" class="btn btn-secondary">Print Ticket</button>
        <a class="btn btn-secondary" href="dashboard.html">Back to Dashboard</a>
      </div>
    `;

    RP.byId("printTicketBtn").addEventListener("click", function () {
      window.print();
    });

    RP.byId("downloadPdfBtn").addEventListener("click", function () {
      const jspdf = window.jspdf;
      if (!jspdf) {
        RP.showMessage("ticketMessage", "PDF library failed to load. Try print option.", "error");
        return;
      }

      const doc = new jspdf.jsPDF();
      doc.setFontSize(14);
      doc.text("Indian Railways e-Ticket", 14, 16);
      doc.setFontSize(10);
      doc.text(`PNR: ${booking.pnr}`, 14, 26);
      doc.text(`Train: ${booking.trainName} (${booking.trainNumber})`, 14, 33);
      doc.text(`Route: ${route}`, 14, 40);
      doc.text(`Date: ${booking.date}`, 14, 47);
      doc.text(`Passengers: ${passengers.length}`, 14, 54);

      let y = 61;
      passengers.forEach((p, i) => {
        doc.text(`P${i + 1}: ${p.name} - ${p.coach}-${p.seat}`, 14, y);
        y += 7;
      });

      doc.text(`Class: ${RP.classLabels[booking.travelClass] || booking.travelClass}`, 14, y + 2);
      doc.text(`Status: ${booking.status}`, 14, y + 9);
      doc.text(`Fare: Rs ${booking.fare}`, 14, y + 16);
      doc.save(`ticket-${booking.pnr}.pdf`);
      RP.showMessage("ticketMessage", "PDF downloaded successfully.", "success");
    });
  }

  if (!pnr) {
    RP.showMessage("ticketMessage", "No ticket selected. Please book or select a ticket first.", "error");
    return;
  }

  const booking = RP.getBookings().find((b) => b.pnr === pnr && b.userId === RP.getCurrentUser().id);
  if (!booking) {
    RP.showMessage("ticketMessage", "Ticket not found for this account.", "error");
    return;
  }

  renderTicket(booking);
})();
