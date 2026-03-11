(function () {
  const grid = document.getElementById("servicesPageGrid");
  if (!grid) return;

  async function loadServices() {
    const paths = ["data/services.json", "services.json"];
    for (const path of paths) {
      try {
        const response = await fetch(path);
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

  loadServices().then((services) => {
    if (!services.length) {
      grid.innerHTML = '<p class="muted">Services are temporarily unavailable.</p>';
      return;
    }

    grid.innerHTML = services
      .map(
        (service) => `
          <a class="service-card service-card-rich" href="service.html?service=${encodeURIComponent(service.id)}">
            <img loading="lazy" src="${service.image}" alt="${service.title}" />
            <div class="service-card-body">
              <i class="${service.icon}"></i>
              <h3>${service.title}</h3>
              <p>${service.description}</p>
            </div>
          </a>
        `
      )
      .join("");
  });
})();
