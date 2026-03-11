(function () {
  const RP = window.RailPortal;
  const grid = RP.byId("tourPackageGrid");
  const detail = RP.byId("tourPackageDetail");
  if (!grid || !detail) return;

  async function loadPackages() {
    const paths = ["data/packages.json", "packages.json"];
    for (const p of paths) {
      try {
        const response = await fetch(p);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
        }
      } catch (_e) {
        // continue
      }
    }
    return [];
  }

  function showDetail(item) {
    detail.classList.remove("hidden");
    detail.id = item.id;
    detail.innerHTML = `
      <h2>${item.name}</h2>
      <p>${item.description}</p>
      <div class="ticket-grid">
        <div class="ticket-field"><strong>Duration</strong>${item.duration}</div>
        <div class="ticket-field"><strong>Starting Price</strong>${item.starting_price}</div>
        <div class="ticket-field"><strong>Mode</strong>Rail-inclusive curated package</div>
      </div>
      <div style="margin-top:0.7rem;"><a class="btn" href="contact.html">Request Itinerary</a></div>
    `;
  }

  loadPackages().then((packages) => {
    grid.innerHTML = packages
      .map(
        (item) => `
          <article class="package-card" id="${item.id}">
            <img loading="lazy" src="${item.image}" alt="${item.name}" />
            <div class="package-card-content">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <p class="muted">Duration: ${item.duration} | Starting at ${item.starting_price}</p>
              <button class="btn btn-secondary" data-package="${item.id}">View Details</button>
            </div>
          </article>
        `
      )
      .join("");

    grid.querySelectorAll("[data-package]").forEach((button) => {
      button.addEventListener("click", function () {
        const item = packages.find((entry) => entry.id === button.getAttribute("data-package"));
        if (!item) return;
        showDetail(item);
      });
    });

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const item = packages.find((entry) => entry.id === hash);
      if (item) {
        showDetail(item);
        setTimeout(() => {
          detail.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  });
})();
