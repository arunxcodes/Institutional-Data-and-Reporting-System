const verifyForm = document.getElementById("verifyEmailForm");
const verifyButton = document.querySelector(".verify-btn");

const sendOtpButton = document.getElementById("sendOtpBtn");
const verifyOtpButton = document.getElementById("verifyOtpBtn");
const createAccountButton = document.getElementById("createAccountBtn");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const step4 = document.getElementById("step4");

const registrationSuccess = document.getElementById("registrationSuccess");

const progressSteps = [
  document.getElementById("progressStep1"),
  document.getElementById("progressStep2"),
  document.getElementById("progressStep3"),
  document.getElementById("progressStep4"),
];

// Update registration progress
function updateProgress(currentStep) {
  progressSteps.forEach((step, index) => {
    const circle = step.querySelector(".step-circle");

    if (index < currentStep) {
      step.classList.add("active");
      circle.textContent = "✓";
    } else if (index === currentStep) {
      step.classList.add("active");
      circle.textContent = index + 1;
    } else {
      step.classList.remove("active");
      circle.textContent = index + 1;
    }
  });
}

// Step 1: Verify official email
verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const emailInput = document.getElementById("officialEmail");
  const email = emailInput.value.trim();

  // Check email is entered
  if (!email) {
    alert("Please enter your official email");
    return;
  }

  try {
    // Disable button while verifying
    verifyButton.disabled = true;
    verifyButton.textContent = "Verifying...";

    // Send email to backend
    const response = await fetch(
      "http://127.0.0.1:5000/api/auth/verify-official",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
        }),
      },
    );

    const data = await response.json();

    // Check verification response
    if (!response.ok) {
      alert(data.message);

      verifyButton.disabled = false;
      verifyButton.textContent = "Verify";

      return;
    }

    // Get verified official data
    const official = data.official;

    // Fill official details
    document.getElementById("fullName").value = official.name;

    document.getElementById("collegeName").value = official.collegeId;

    document.getElementById("departmentName").value = official.departmentId;

    document.getElementById("designation").value = official.designation;

    document.getElementById("role").value = official.role;

    // Lock the verified email
    emailInput.readOnly = true;

    // Update progress to Step 2
    updateProgress(1);

    // Move from Step 1 to Step 2
    step1.style.display = "none";
    step2.style.display = "block";

    console.log("Verified official:", official);
  } catch (error) {
    console.error("Verification error:", error);

    alert("Unable to connect to the server");

    verifyButton.disabled = false;
    verifyButton.textContent = "Verify";
  }
});

// Step 2: Send OTP
sendOtpButton.addEventListener("click", async () => {
  const email = document.getElementById("officialEmail").value.trim();

  // Check verified email
  if (!email) {
    alert("Official email is missing");
    return;
  }

  try {
    // Disable button while sending OTP
    sendOtpButton.disabled = true;
    sendOtpButton.textContent = "Sending...";

    // Send OTP to backend
    const response = await fetch("http://127.0.0.1:5000/api/auth/send-otp", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
      }),
    });

    const data = await response.json();

    // Check OTP response
    if (!response.ok) {
      alert(data.message);

      sendOtpButton.disabled = false;
      sendOtpButton.textContent = "Send OTP";

      return;
    }

    // Update progress to Step 3
    updateProgress(2);

    // Move from Step 2 to Step 3
    step2.style.display = "none";
    step3.style.display = "block";

    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Send OTP error:", error);

    alert("Unable to connect to the server");

    sendOtpButton.disabled = false;
    sendOtpButton.textContent = "Send OTP";
  }
});

// Step 3: Verify OTP
verifyOtpButton.addEventListener("click", async () => {
  const email = document.getElementById("officialEmail").value.trim();
  const otp = document.getElementById("otp").value.trim();

  // Check OTP is entered
  if (!otp) {
    alert("Please enter the OTP");
    return;
  }

  // Check OTP length
  if (otp.length !== 6) {
    alert("Please enter a valid 6-digit OTP");
    return;
  }

  try {
    // Disable button while verifying OTP
    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = "Verifying...";

    // Send OTP to backend
    const response = await fetch("http://127.0.0.1:5000/api/auth/verify-otp", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    });

    const data = await response.json();

    // Check OTP verification response
    if (!response.ok) {
      alert(data.message);

      verifyOtpButton.disabled = false;
      verifyOtpButton.textContent = "Verify OTP";

      return;
    }

    // Update progress to Step 4
    updateProgress(3);

    // Move from Step 3 to Step 4
    step3.style.display = "none";
    step4.style.display = "block";

    console.log("OTP verified successfully");
  } catch (error) {
    console.error("OTP verification error:", error);

    alert("Unable to connect to the server");

    verifyOtpButton.disabled = false;
    verifyOtpButton.textContent = "Verify OTP";
  }
});

// Step 4: Create account
createAccountButton.addEventListener("click", async () => {
  const email = document.getElementById("officialEmail").value.trim();

  const password = document.getElementById("password").value;

  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check password fields
  if (!password || !confirmPassword) {
    alert("Please enter both password fields");
    return;
  }

  // Check password match
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  // Check password length
  if (password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }

  try {
    // Disable button while creating account
    createAccountButton.disabled = true;
    createAccountButton.textContent = "Creating Account...";

    // Send account creation request
    const response = await fetch(
      "http://127.0.0.1:5000/api/auth/create-account",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }),
      },
    );

    const data = await response.json();

    // Check account creation response
    if (!response.ok) {
      alert(data.message);

      createAccountButton.disabled = false;
      createAccountButton.textContent = "Create Account";

      return;
    }

    // Update all progress steps as completed
    updateProgress(4);

    // Hide Step 4
    step4.style.display = "none";

    // Show success message
    registrationSuccess.style.display = "block";

    console.log("Account created:", data.user);
  } catch (error) {
    console.error("Create account error:", error);

    alert("Unable to connect to the server");

    createAccountButton.disabled = false;
    createAccountButton.textContent = "Create Account";
  }
});
