(function () {
  const requestForm = document.getElementById("otpRequestForm");
  const verifyForm = document.getElementById("otpVerifyForm");
  const otpMessage = document.getElementById("otpMessage");
  const otpInput = document.getElementById("otpInput");

  if (!requestForm || !verifyForm || !otpMessage || !otpInput) return;

  let generatedOtp = "";

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

    otpMessage.classList.remove("hidden");
    otpMessage.textContent = `OTP sent successfully. Demo OTP: ${generatedOtp}`;
    verifyForm.classList.remove("hidden");
  });

  verifyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (otpInput.value.trim() !== generatedOtp) {
      otpMessage.classList.remove("hidden");
      otpMessage.textContent = "Invalid OTP. Please try again.";
      return;
    }

    localStorage.setItem("rs_logged_in", "true");
    otpMessage.classList.remove("hidden");
    otpMessage.textContent = "Login successful. Redirecting...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
})();
