(function () {
  const RP = window.RailPortal;
  const form = RP.byId("stationSearchForm");
  if (!form) return;

  RP.attachStationAutocomplete("stationQuery", "stationLookupList");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    RP.hideMessage("stationMessage");

    try {
      RP.showLoader();
      const code = RP.parseStationCode(RP.byId("stationQuery").value);
      const station = await RP.getStationByCode(code);

      if (!station) {
        RP.showMessage("stationMessage", "Station not found. Please use valid station name or code.", "error");
        RP.byId("stationResult").innerHTML = "";
        return;
      }

      RP.byId("stationResult").innerHTML = `
        <article class="station-item">
          <h2>${station.stationName} (${station.stationCode})</h2>
          <div class="ticket-grid">
            <div class="ticket-field"><strong>City</strong>${station.city}</div>
            <div class="ticket-field"><strong>State</strong>${station.state}</div>
            <div class="ticket-field"><strong>Railway Zone</strong>${station.railwayZone}</div>
            <div class="ticket-field"><strong>Enquiry Number</strong>${station.enquiryNumber}</div>
            <div class="ticket-field"><strong>Address</strong>${station.address}</div>
            <div class="ticket-field"><strong>Station Code</strong>${station.stationCode}</div>
          </div>
        </article>
      `;

      RP.showMessage("stationMessage", "Station details fetched.", "success");
    } catch (error) {
      RP.showMessage("stationMessage", error.message || "Unable to fetch station details.", "error");
    } finally {
      RP.hideLoader();
    }
  });
})();

