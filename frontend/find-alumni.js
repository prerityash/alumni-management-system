    const BASE_URL = `${window.location.origin}/api/users`;
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "index.html"; }
    
    const gradients = [
      "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
      "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
      "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
      "linear-gradient(135deg, #be185d 0%, #7c3aed 100%)",
      "linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)"
    ];

    function goBack() {
      const role = localStorage.getItem("role");
      if (role === "admin") window.location.href = "admin/dashboard.html";
      else if (role === "alumni") window.location.href = "alumni/dashboard.html";
      else window.location.href = "student/dashboard.html";
    }

    document.getElementById("backBtn").addEventListener("click", goBack);
    document.getElementById("applyFiltersBtn").addEventListener("click", fetchAlumni);

    document.getElementById("alumniContainer").addEventListener("click", (e) => {
      if (e.target.classList.contains("ac-btn")) {
        const email = e.target.getAttribute("data-email");
        if (email) {
          window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank', 'noopener,noreferrer');
        }
      }
    });

    async function fetchAlumni() {
      const year = document.getElementById("filterYear").value;
      const course = document.getElementById("filterCourse").value;
      const email = document.getElementById("filterEmail").value;
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (course) params.append("course", course);
      if (email) params.append("email", email);

      try {
        const res = await apiFetch(`${BASE_URL}/alumni/search?${params}`);
        const alumni = await res.json();
        const container = document.getElementById("alumniContainer");
        container.innerHTML = "";

        if (alumni.error) { container.innerHTML = `<p style="color:#ef4444">Error: ${alumni.error}</p>`; return; }
        if (alumni.length === 0) { container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#8888aa">No alumni matched your search. Try adjusting your filters.</p>`; return; }

        alumni.forEach((user, idx) => {
          const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
          const bg = gradients[idx % gradients.length];
          const hasPic = !!user.profilePic;
          const avatarHTML = hasPic
            ? `<img src="${user.profilePic}" class="ac-avatar" alt="${user.name}">`
            : `<div class="ac-avatar fallback-avatar" style="background:${bg}">${initial}</div>`;

          container.innerHTML += `
            <div class="alumni-card">
              <div class="ac-top" style="background:${bg}">${avatarHTML}</div>
              <div class="ac-bottom">
                <h3>${user.name || "Unknown"}</h3>
                <div class="ac-badge">Class of ${user.graduationYear || "N/A"}</div>
                <p><strong>Dept:</strong> ${user.course || "General"}</p>
                <p><strong>At:</strong> ${user.jobPost || "Looking"} @ ${user.company || "N/A"}</p>
                <button class="ac-btn" data-email="${user.email}">Contact Alumni</button>
              </div>
            </div>`;
        });
      } catch (err) {
        console.error(err);
        document.getElementById("alumniContainer").innerHTML = `<p style="color:#8888aa">Failed to connect to backend.</p>`;
      }
    }

    fetchAlumni();
