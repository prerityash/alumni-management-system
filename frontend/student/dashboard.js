    const BASE_URL = `${window.location.origin}/api`;
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    if (!userId) {
      window.location.href = "../index.html";
    } else if (userRole !== "student") {
      // Redirect to the correct dashboard based on actual role
      if (userRole === "admin") window.location.href = "../admin/dashboard.html";
      else window.location.href = "../alumni/dashboard.html";
    }

    async function logout() {
      await apiFetch(`${BASE_URL}/users/logout`, { method: "POST" });
      localStorage.clear();
      window.location.href = "../index.html";
    }

    function updateGreeting() {
      const name = localStorage.getItem("name") || "Student";
      const h = new Date().getHours();
      const g = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
      document.getElementById("greetingMsg").innerText = `${g}, ${name}!`;
    }
    updateGreeting();

    async function fetchMeetings() {
      if (!userId) return;
      try {
        const res = await apiFetch(`${BASE_URL}/meetings/${userId}`);
        const meets = await res.json();
        const box = document.getElementById("meetingsList");
        box.innerHTML = meets.length ? "" : `<div class="list-item"><p>No booked sessions.</p></div>`;
        meets.forEach(m => {
          const date = new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
          box.innerHTML += `<div class="list-item"><p><strong>Meet with: ${m.alumniId ? m.alumniId.name : "Mentor"}</strong></p><span>${date} · Status: ${m.status}</span></div>`;
        });
      } catch (err) { console.error(err); }
    }

    async function fetchActivity() {
      if (!userId) return;
      try {
        const res = await apiFetch(`${BASE_URL}/applications/${userId}`);
        const apps = await res.json();
        const box = document.getElementById("activityList");
        box.innerHTML = apps.length ? "" : `<div class="list-item"><p>No job applications yet.</p></div>`;
        apps.forEach(a => {
          const date = new Date(a.createdAt).toLocaleDateString();
          box.innerHTML += `<div class="list-item"><p><strong>${a.postId ? a.postId.title : "Unknown Job"}</strong></p><span>Applied: ${date} · Status: ${a.status}</span></div>`;
        });
      } catch (err) { console.error(err); }
    }

    async function fetchJobs() {
      try {
        const res = await apiFetch(`${BASE_URL}/posts`);
        const posts = await res.json();
        const box = document.getElementById("notificationsList");
        box.innerHTML = posts.length ? "" : `<div class="list-item"><p>No jobs found.</p></div>`;
        posts.forEach(p => {
          const t = p.postType === "internship" ? "Internship" : "Job";
          box.innerHTML += `<div class="list-item"><p><strong>${p.title} (${t})</strong></p><span>Location: ${p.location || "N/A"}</span></div>`;
        });
      } catch (err) { console.error(err); }
    }

    async function fetchDonations() {
      try {
        const res = await apiFetch(`${BASE_URL}/donations`);
        const dons = await res.json();
        const box = document.getElementById("fundingList");
        box.innerHTML = dons.length ? "" : `<div class="list-item"><p>No donations yet.</p></div>`;
        dons.forEach(d => {
          const name = d.userId ? d.userId.name : "Anonymous";
          const date = new Date(d.createdAt).toLocaleDateString();
          box.innerHTML += `<div class="list-item"><p><strong>${name}</strong> donated $${d.amount}</p><span>Cause: ${d.cause} · ${date}</span></div>`;
        });
      } catch (err) { console.error(err); }
    }

    fetchMeetings(); fetchActivity(); fetchJobs(); fetchDonations();

    // Vertical Slideshow
    const slides = document.querySelectorAll('.v-slide');
    let cur = 0;
    if (slides.length > 0) {
      setInterval(() => {
        slides[cur].classList.remove('active');
        cur = (cur + 1) % slides.length;
        slides[cur].classList.add('active');
      }, 3000);
    }
