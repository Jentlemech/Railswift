(function () {
  const RP = window.RailPortal;
  const page = document.body.getAttribute("data-page");

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateMobile(mobile) {
    return /^[6-9][0-9]{9}$/.test(mobile);
  }

  function validatePassword(password) {
    return password.length >= 8;
  }

  async function postJson(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Request failed");
    }

    return payload;
  }

  function handleLoginPage() {
    const tabEmail = RP.byId("tabEmail");
    const tabOtp = RP.byId("tabOtp");
    const emailSection = RP.byId("emailLoginSection");
    const otpSection = RP.byId("otpLoginSection");
    const emailForm = RP.byId("emailLoginForm");
    const otpSendForm = RP.byId("otpSendForm");
    const otpVerifyForm = RP.byId("otpVerifyForm");
    const otpInfo = RP.byId("otpInfo");
    const loginCaptchaWrap = RP.byId("loginCaptchaWrap");
    const loginCaptchaQuestion = RP.byId("loginCaptchaQuestion");
    const loginCaptchaInput = RP.byId("loginCaptchaInput");
    const loginCaptchaVerifyBtn = RP.byId("loginCaptchaVerifyBtn");
    const otpCaptchaWrap = RP.byId("otpCaptchaWrap");
    const otpCaptchaQuestion = RP.byId("otpCaptchaQuestion");
    const otpCaptchaInput = RP.byId("otpCaptchaInput");
    const otpCaptchaVerifyBtn = RP.byId("otpCaptchaVerifyBtn");

    let loginFailures = 0;
    let otpSendAttempts = 0;
    let loginCaptchaAnswer = null;
    let otpCaptchaAnswer = null;
    let loginCaptchaVerified = false;
    let otpCaptchaVerified = false;

    function newCaptchaPair() {
      const left = Math.floor(10 + Math.random() * 40);
      const right = Math.floor(1 + Math.random() * 9);
      return { question: `${left} + ${right} = ?`, answer: String(left + right) };
    }

    function setupCaptcha(wrap, questionEl, inputEl) {
      const pair = newCaptchaPair();
      wrap.classList.remove("hidden");
      questionEl.textContent = `Security challenge: ${pair.question}`;
      inputEl.value = "";
      return pair.answer;
    }

    function verifyCaptcha(inputEl, expected, onSuccessMessage) {
      if (String(inputEl.value || "").trim() !== String(expected || "")) {
        RP.showMessage("loginMessage", "Verification answer is incorrect. Please try again.", "error");
        return false;
      }

      RP.showMessage("loginMessage", onSuccessMessage, "success");
      return true;
    }

    function setTab(mode) {
      const emailActive = mode === "email";
      tabEmail.classList.toggle("active", emailActive);
      tabOtp.classList.toggle("active", !emailActive);
      emailSection.classList.toggle("hidden", !emailActive);
      otpSection.classList.toggle("hidden", emailActive);
      RP.hideMessage("loginMessage");
    }

    tabEmail.addEventListener("click", () => setTab("email"));
    tabOtp.addEventListener("click", () => setTab("otp"));

    emailForm.addEventListener("submit", function (event) {
      event.preventDefault();
      RP.hideMessage("loginMessage");

      const email = RP.byId("loginEmail").value.trim().toLowerCase();
      const password = RP.byId("loginPassword").value;

      if (loginFailures >= 1 && !loginCaptchaVerified) {
        if (loginCaptchaWrap && loginCaptchaQuestion && loginCaptchaInput) {
          loginCaptchaAnswer = setupCaptcha(loginCaptchaWrap, loginCaptchaQuestion, loginCaptchaInput);
        }
        RP.showMessage("loginMessage", "Please complete the quick verification before trying again.", "info");
        return;
      }

      const user = RP.getUsers().find((u) => u.email === email && u.password === password);
      if (!user) {
        loginFailures += 1;
        loginCaptchaVerified = false;
        RP.showMessage("loginMessage", "Invalid email or password.", "error");
        return;
      }

      loginFailures = 0;
      RP.setCurrentUser({ id: user.id, name: user.name, email: user.email, mobile: user.mobile });
      RP.showMessage("loginMessage", "Login successful. Redirecting to dashboard...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    });

    otpSendForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      RP.hideMessage("loginMessage");

      const mobile = RP.byId("otpMobile").value.trim();
      if (!validateMobile(mobile)) {
        RP.showMessage("loginMessage", "Enter a valid 10-digit Indian mobile number.", "error");
        return;
      }

      if (otpSendAttempts >= 1 && !otpCaptchaVerified) {
        if (otpCaptchaWrap && otpCaptchaQuestion && otpCaptchaInput) {
          otpCaptchaAnswer = setupCaptcha(otpCaptchaWrap, otpCaptchaQuestion, otpCaptchaInput);
        }
        RP.showMessage("loginMessage", "Please complete the verification before requesting another OTP.", "info");
        return;
      }

      try {
        RP.showLoader();
        await postJson("/send-otp", { mobile, flow: "login" });
        otpSendAttempts += 1;
        otpCaptchaVerified = false;
        otpInfo.textContent = `OTP sent to ${mobile}. It expires in 5 minutes.`;
        otpInfo.classList.remove("hidden");
        otpVerifyForm.classList.remove("hidden");
        RP.showMessage("loginMessage", "OTP sent successfully.", "success");
      } catch (error) {
        RP.showMessage("loginMessage", error.message, "error");
      } finally {
        RP.hideLoader();
      }
    });

    if (loginCaptchaVerifyBtn) {
      loginCaptchaVerifyBtn.addEventListener("click", function () {
        loginCaptchaVerified = verifyCaptcha(loginCaptchaInput, loginCaptchaAnswer, "Verification complete. You can try logging in again.");
        if (loginCaptchaVerified && loginCaptchaWrap) loginCaptchaWrap.classList.add("hidden");
      });
    }

    if (otpCaptchaVerifyBtn) {
      otpCaptchaVerifyBtn.addEventListener("click", function () {
        otpCaptchaVerified = verifyCaptcha(otpCaptchaInput, otpCaptchaAnswer, "Verification complete. You can request another OTP now.");
        if (otpCaptchaVerified && otpCaptchaWrap) otpCaptchaWrap.classList.add("hidden");
      });
    }

    otpVerifyForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      RP.hideMessage("loginMessage");

      const mobile = RP.byId("otpMobile").value.trim();
      const otp = RP.byId("otpCode").value.trim();

      if (!/^\d{6}$/.test(otp)) {
        RP.showMessage("loginMessage", "OTP must be a 6-digit number.", "error");
        return;
      }

      try {
        RP.showLoader();
        await postJson("/verify-otp", { mobile, otp, flow: "login" });

        let user = RP.getUsers().find((u) => u.mobile === mobile);
        if (!user) {
          user = {
            id: `U${Date.now()}`,
            name: "Rail User",
            email: `${mobile}@railswift.local`,
            mobile,
            password: ""
          };
          const users = RP.getUsers();
          users.push(user);
          RP.saveUsers(users);
        }

        RP.setCurrentUser({ id: user.id, name: user.name, email: user.email, mobile: user.mobile });
        RP.showMessage("loginMessage", "OTP verified. Redirecting to dashboard...", "success");
        setTimeout(() => (window.location.href = "dashboard.html"), 700);
      } catch (error) {
        RP.showMessage("loginMessage", error.message, "error");
      } finally {
        RP.hideLoader();
      }
    });
  }

  function handleSignupPage() {
    const form = RP.byId("signupForm");
    const sendBtn = RP.byId("signupSendOtpBtn");
    const verifyBtn = RP.byId("signupVerifyOtpBtn");
    const otpFieldWrap = RP.byId("signupOtpWrap");

    if (!form || !sendBtn || !verifyBtn || !otpFieldWrap) return;

    let mobileOtpVerified = false;
    let verifiedMobile = "";

    sendBtn.addEventListener("click", async function () {
      RP.hideMessage("signupMessage");
      const mobile = RP.byId("signupMobile").value.trim();

      if (!validateMobile(mobile)) {
        RP.showMessage("signupMessage", "Enter a valid mobile number before requesting OTP.", "error");
        return;
      }

      try {
        RP.showLoader();
        await postJson("/send-otp", { mobile, flow: "signup" });
        otpFieldWrap.classList.remove("hidden");
        mobileOtpVerified = false;
        verifiedMobile = "";
        RP.showMessage("signupMessage", "Signup OTP sent successfully. It expires in 5 minutes.", "success");
      } catch (error) {
        RP.showMessage("signupMessage", error.message, "error");
      } finally {
        RP.hideLoader();
      }
    });

    verifyBtn.addEventListener("click", async function () {
      RP.hideMessage("signupMessage");
      const mobile = RP.byId("signupMobile").value.trim();
      const otp = RP.byId("signupOtpCode").value.trim();

      if (!validateMobile(mobile)) {
        RP.showMessage("signupMessage", "Enter a valid mobile number.", "error");
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        RP.showMessage("signupMessage", "OTP must be 6 digits.", "error");
        return;
      }

      try {
        RP.showLoader();
        await postJson("/verify-otp", { mobile, otp, flow: "signup" });
        mobileOtpVerified = true;
        verifiedMobile = mobile;
        RP.showMessage("signupMessage", "Mobile number verified successfully.", "success");
      } catch (error) {
        mobileOtpVerified = false;
        verifiedMobile = "";
        RP.showMessage("signupMessage", error.message, "error");
      } finally {
        RP.hideLoader();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      RP.hideMessage("signupMessage");

      const name = RP.byId("fullName").value.trim();
      const email = RP.byId("signupEmail").value.trim().toLowerCase();
      const mobile = RP.byId("signupMobile").value.trim();
      const password = RP.byId("signupPassword").value;
      const confirmPassword = RP.byId("confirmPassword").value;
      const dob = RP.byId("dob").value;
      const gender = RP.byId("gender").value;

      if (!name || !validateEmail(email) || !validateMobile(mobile) || !dob || !gender) {
        RP.showMessage("signupMessage", "Please fill all required fields with valid details.", "error");
        return;
      }

      if (!mobileOtpVerified || verifiedMobile !== mobile) {
        RP.showMessage("signupMessage", "Please verify your mobile number using OTP before registration.", "error");
        return;
      }

      if (!validatePassword(password)) {
        RP.showMessage("signupMessage", "Password must be at least 8 characters.", "error");
        return;
      }

      if (password !== confirmPassword) {
        RP.showMessage("signupMessage", "Passwords do not match.", "error");
        return;
      }

      const users = RP.getUsers();
      if (users.some((u) => u.email === email || u.mobile === mobile)) {
        RP.showMessage("signupMessage", "Account already exists with email or mobile.", "error");
        return;
      }

      const user = {
        id: `U${Date.now()}`,
        name,
        email,
        mobile,
        password,
        dob,
        gender
      };

      users.push(user);
      RP.saveUsers(users);
      RP.showMessage("signupMessage", "Registration successful. Redirecting to login...", "success");
      form.reset();
      mobileOtpVerified = false;
      verifiedMobile = "";
      otpFieldWrap.classList.add("hidden");
      setTimeout(() => (window.location.href = "login.html"), 900);
    });
  }

  if (page === "login") handleLoginPage();
  if (page === "signup") handleSignupPage();
})();
