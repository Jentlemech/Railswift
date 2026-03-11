(function () {
  const { trainData, getQueryParams, timeBucket } = window.RailSwift;
  const query = getQueryParams();

  const routeTitle = document.getElementById("resultRoute");
  const routeMeta = document.getElementById("resultMeta");
  const resultsEl = document.getElementById("trainResults");
  const departureFilter = document.getElementById("departureFilter");
  const classFilter = document.getElementById("classFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");

  if (!resultsEl) return;

  const selectedClass = query.travelClass || "3AC";
  classFilter.value = selectedClass;

  routeTitle.textContent = `${query.from || "Source"} -> ${query.to || "Destination"}`;
  routeMeta.textContent = `Date: ${query.date || "Not selected"} | Preferred class: ${selectedClass}`;

  function filteredTrains() {
    const dep = departureFilter.value;
    const cls = classFilter.value;
    const availability = availabilityFilter.value;

    return trainData.filter((train) => {
      const depPass = dep === "all" || timeBucket(train.departure) === dep;
      const classPass = cls === "all" || train.classes[cls] > 0;
      const availPass = availability === "all" || train.availability === availability;
      return depPass && classPass && availPass;
    });
  }

  function render() {
    const rows = filteredTrains();

    if (!rows.length) {
      resultsEl.innerHTML = '<div class="card"><p class="muted">No trains match these filters.</p></div>';
      return;
    }

    resultsEl.innerHTML = rows
      .map((train) => {
        const cls = classFilter.value === "all" ? selectedClass : classFilter.value;
        const price = train.classes[cls] > 0 ? `Rs ${train.classes[cls]}` : "N/A";
        const availabilityText =
          train.availability === "available"
            ? `${train.seatsLeft} seats left`
            : "WL 12";

        const params = new URLSearchParams({
          trainNumber: train.number,
          trainName: train.name,
          from: query.from || train.from,
          to: query.to || train.to,
          date: query.date || "",
          travelClass: cls,
          price: train.classes[cls] || 0,
          departure: train.departure,
          arrival: train.arrival,
          duration: train.duration,
          availability: train.availability
        });

        return `
          <article class="card train-card">
            <div>
              <div class="train-title">${train.name} (${train.number})</div>
              <div class="train-meta">${query.from || train.from} to ${query.to || train.to}</div>
              <div class="train-meta">Dep ${train.departure} | Arr ${train.arrival} | ${train.duration}</div>
            </div>
            <div>
              <div><span class="pill ${train.availability}">${train.availability.toUpperCase()}</span></div>
              <div class="train-meta">${availabilityText}</div>
              <div class="train-meta">Class: ${cls}</div>
              <div class="train-title">${price}</div>
            </div>
            <div>
              <a class="btn btn-primary" href="booking.html?${params.toString()}">Book Now</a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  [departureFilter, classFilter, availabilityFilter].forEach((el) => {
    el.addEventListener("change", render);
  });

  render();
})();

