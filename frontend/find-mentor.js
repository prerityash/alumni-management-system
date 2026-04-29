    const BASE_URL = `${window.location.origin}/api`;
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "index.html"; }
    let selectedMentorId = null;

    function goBack() {
      const role = localStorage.getItem("role");
      if (role === "admin") window.location.href = "admin/dashboard.html";
      else if (role === "alumni") window.location.href = "alumni/dashboard.html";
      else window.location.href = "student/dashboard.html";
    }

    document.getElementById("backBtn").addEventListener("click", goBack);
    document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
    document.getElementById("submitModalBtn").addEventListener("click", submitBooking);

    document.getElementById("mentorsGrid").addEventListener("click", (e) => {
      if (e.target.classList.contains("book-btn")) {
        const id = e.target.getAttribute("data-id");
        const name = e.target.getAttribute("data-name");
        openModal(id, name);
      }
    });

    async function fetchMentors() {
      try {
        const res = await apiFetch(`${BASE_URL}/users/mentors/directory`);
        const mentors = await res.json();
        const grid = document.getElementById('mentorsGrid');
        grid.innerHTML = "";
        if (mentors.length === 0) { grid.innerHTML = `<p style="color:#8888aa">No active mentors available right now.</p>`; return; }
        mentors.forEach(m => {
          const pic = m.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=7c3aed&color=fff`;
          grid.innerHTML += `
            <div class="mentor-card">
              <div class="mc-header">
                <img src="${pic}" class="mc-avatar">
                <div class="mc-info">
                  <h3>${m.name}</h3>
                  <p>${m.course || 'Alumni'} | Class of ${m.graduationYear}</p>
                </div>
              </div>
              <div class="mc-details">
                <div class="mc-detail-row"><strong>Availability:</strong> ${m.mentorDay || 'Flexible'} (${m.mentorTime || 'Any'})</div>
                <div class="mc-detail-row"><strong>Email:</strong> ${m.mentorEmail || m.email}</div>
                ${m.mentorContact ? `<div class="mc-detail-row"><strong>Contact:</strong> ${m.mentorContact}</div>` : ''}
                ${m.mentorLink ? `<div class="mc-detail-row"><strong>Meet Link:</strong> <a href="${m.mentorLink}" target="_blank" style="color:#a78bfa;text-decoration:none;">View Link</a></div>` : ''}
              </div>
              <button class="book-btn" data-id="${m._id}" data-name="${m.name.replace(/"/g, '&quot;')}">Book Appointment</button>
            </div>`;
        });
      } catch (err) { console.error(err); }
    }

    function openModal(id, name) {
      selectedMentorId = id;
      document.getElementById('modalMentorName').innerText = name;
      document.getElementById('bookingModal').classList.add('active');
    }

    function closeModal() {
      selectedMentorId = null;
      document.getElementById('bookingDate').value = "";
      document.getElementById('bookingTopic').value = "";
      document.getElementById('bookingModal').classList.remove('active');
    }

    async function submitBooking() {
      if (!selectedMentorId) return;
      const dateVal = document.getElementById('bookingDate').value;
      const topicVal = document.getElementById('bookingTopic').value;
      if (!dateVal) return alert("Please select a date.");
      if (!topicVal) return alert("Please enter a topic.");
      try {
        await apiFetch(`${BASE_URL}/meetings/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: userId, alumniId: selectedMentorId, date: dateVal, topic: topicVal })
        });
        alert("Booking request submitted! The mentor will be notified.");
        closeModal();
      } catch (e) { console.error(e); alert("Failed to submit request."); }
    }

    fetchMentors();
