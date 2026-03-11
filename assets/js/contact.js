(function () {
  const RP = window.RailPortal;
  const form = RP.byId("complaintForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("contactMessage");

    const name = RP.byId("contactName").value.trim();
    const email = RP.byId("contactEmail").value.trim();
    const message = RP.byId("contactText").value.trim();

    if (!name || !email || !message) {
      RP.showMessage("contactMessage", "Please fill all complaint form fields.", "error");
      return;
    }

    const complaints = JSON.parse(localStorage.getItem("rp_complaints") || "[]");
    complaints.unshift({ id: `CP${Date.now()}`, name, email, message, createdAt: new Date().toISOString() });
    localStorage.setItem("rp_complaints", JSON.stringify(complaints.slice(0, 20)));

    form.reset();
    RP.showMessage("contactMessage", "Complaint submitted successfully. IRCTC support will contact you.", "success");
  });
})();
