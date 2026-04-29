  const BASE_URL = `${window.location.origin}/api/users`;

  /* ── UI STATE CHECK ── */
  if (localStorage.getItem("userId")) {
    const role = localStorage.getItem("role");
    const dashLink = role === "admin" ? "admin/dashboard.html" : role === "alumni" ? "alumni/dashboard.html" : "student/dashboard.html";
    
    const navLogin = document.getElementById("navLoginBtn");
    const navSignup = document.getElementById("navSignupBtn");
    const heroLogin = document.getElementById("heroLoginBtn");
    const heroSignup = document.getElementById("heroSignupBtn");

    if(navLogin) { navLogin.innerText = "Dashboard"; navLogin.onclick = () => window.location.href = dashLink; }
    if(navSignup) { navSignup.classList.add("hidden"); }
    if(heroLogin) { heroLogin.innerText = "Go to Dashboard"; heroLogin.onclick = () => window.location.href = dashLink; }
    if(heroSignup) { heroSignup.classList.add("hidden"); }
  }

  /* ── TOAST ── */
  const toast = document.getElementById("toastMsg");
  function showToast(msg, type = 'success') {
    toast.innerText = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ── MODAL OPEN/CLOSE ── */
  const overlay = document.getElementById("authOverlay");
  const loginTabBtn = document.getElementById("loginTabBtn");
  const signupTabBtn = document.getElementById("signupTabBtn");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  function openModal(tab = 'login') {
    overlay.classList.add("show");
    if (tab === 'signup') switchToSignup();
    else switchToLogin();
  }

  function switchToLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTabBtn.classList.add("active");
    signupTabBtn.classList.remove("active");
    document.getElementById("modalTitle").innerText = "Welcome Back";
    document.getElementById("modalSubtitle").innerText = "Sign in to your portal account";
  }

  function switchToSignup() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTabBtn.classList.add("active");
    loginTabBtn.classList.remove("active");
    document.getElementById("modalTitle").innerText = "Create Account";
    document.getElementById("modalSubtitle").innerText = "Join the AlumniPortal network";
  }

  document.getElementById("closeModalBtn").onclick = () => overlay.classList.remove("show");
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("show"); });

  loginTabBtn.onclick = switchToLogin;
  signupTabBtn.onclick = switchToSignup;

  document.getElementById("navLoginBtn").onclick = () => openModal('login');
  document.getElementById("navSignupBtn").onclick = () => openModal('signup');
  document.getElementById("heroLoginBtn").onclick = () => openModal('login');
  document.getElementById("heroSignupBtn").onclick = () => openModal('signup');

  /* ── SET ROLE ── */
  window.setRole = (role) => {
    document.getElementById("signupRole").value = role;
    document.getElementById("roleStudentTab").classList.toggle("active", role === "student");
    document.getElementById("roleAlumniTab").classList.toggle("active", role === "alumni");
    toggleSignupFields();
  };

  function toggleSignupFields() {
    const role = document.getElementById("signupRole").value;
    const isStudent = role === "student";
    
    document.getElementById("collegeId").classList.toggle("hidden", !isStudent);
    document.getElementById("year").classList.toggle("hidden", isStudent);
  }

  /* ── SIGNUP ── */
  window.signup = async () => {
    const role = document.getElementById("signupRole").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const collegeId = document.getElementById("collegeId").value.trim();
    const year = document.getElementById("year").value.trim();

    // JavaScript Validation
    if (!name) return showToast("username is empty", "error");
    
    if (!email) return showToast("email is empty", "error");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showToast("invalid email format", "error");
    
    if (role === "student" && !collegeId) return showToast("college id is empty", "error");
    
    if (role === "alumni" && !year) return showToast("graduation year is empty", "error");
    if (role === "alumni" && (isNaN(year) || year < 1950 || year > 2030)) {
      return showToast("invalid graduation year", "error");
    }

    if (!password) return showToast("password is empty", "error");
    if (password.length < 6) return showToast("minlength of password is 6", "error");

    const data = { name, email, password, role };
    if (role === "student") data.collegeId = collegeId;
    else data.graduationYear = Number(year);

    try {
      const res = await apiFetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        throw new Error("Server is waking up (or offline). Please wait a minute and try again.");
      }

      if (!res.ok || result.error) return showToast(result.error || "Signup failed", 'error');
      
      showToast(result.message || "Account created!", 'success');
      setTimeout(switchToLogin, 1100);
    } catch (err) { 
      showToast(err.message || "Network error. Is the backend running?", 'error'); 
    }
  };

  /* ── LOGIN ── */
  window.login = async () => {
    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPass").value;

    // JavaScript Validation
    if (!loginId) return showToast("username is empty", "error");
    if (!password) return showToast("password is empty", "error");

    const data = { loginId, password };
    try {
      const res = await apiFetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        throw new Error("Server is waking up (or offline). Please wait a minute and try again.");
      }

      if (!res.ok || result.error) return showToast(result.error || "Login failed", 'error');

      if (result.role) {
        showToast("Login successful! Redirecting...", 'success');
        localStorage.setItem("role", result.role);
        localStorage.setItem("name", result.name);
        localStorage.setItem("userId", result.userId);
        setTimeout(() => {
          if (result.role === "admin") window.location.href = "admin/dashboard.html";
          else if (result.role === "alumni") window.location.href = "alumni/dashboard.html";
          else window.location.href = "student/dashboard.html";
        }, 1000);
      }
    } catch (err) { 
      showToast(err.message || "Network error. Is the backend running?", 'error'); 
    }
  };
