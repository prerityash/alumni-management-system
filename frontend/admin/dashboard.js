  const BASE_URL = `${window.location.origin}/api`;

  // ── Auth guard — admin only ────────────────────────────────
  const userId = localStorage.getItem("userId");
  const role   = localStorage.getItem("role");
  if (!userId || role !== "admin") window.location.href = "../index.html";

  // ── Toast ──────────────────────────────────────────────────
  const toastEl = document.getElementById("toast");
  function showToast(msg, type = "") {
    toastEl.innerText = msg;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => toastEl.classList.remove("show"), 3000);
  }

  // ── Logout ─────────────────────────────────────────────────
  async function logout() {
    await apiFetch(`${BASE_URL}/users/logout`, { method: "POST" });
    localStorage.clear();
    window.location.href = "../index.html";
  }

  // ── Tab switching ──────────────────────────────────────────
  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.add('active');
    document.getElementById(`panel${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.add('active');
    if (tab === 'users' && !usersLoaded) loadUsers();
    if (tab === 'donations' && !donationsLoaded) loadDonations();
  }

  // ════════════════════════════════════════════════════════════
  //  EVENTS TAB
  // ════════════════════════════════════════════════════════════

  async function loadEvents() {
    const res = await apiFetch(`${BASE_URL}/events`);
    const events = await res.json();
    const list = document.getElementById("eventsList");
    document.getElementById("evCount").innerText = events.length;

    if (!events.length) { list.innerHTML = `<p class="empty">No events yet.</p>`; return; }

    list.innerHTML = "";
    events.forEach(ev => {
      const date = new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const div = document.createElement("div");
      div.className = "item-row";
      div.innerHTML = `
        <div class="item-info">
          <strong>${ev.title}</strong>
          <span>${ev.category} · ${date}</span>
        </div>
        <div class="item-actions">
          <button class="view-btn" onclick="openAttendees('${ev._id}', '${ev.title.replace(/'/g,"\\'")}')">Attendees</button>
          <button class="del-btn" onclick="deleteEvent('${ev._id}')">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  async function submitNewEvent() {
    const title = document.getElementById("evTitle").value.trim();
    const date  = document.getElementById("evDate").value;
    if (!title) return showToast("Title is required", "error");
    if (!date)  return showToast("Date is required", "error");

    const payload = {
      title, date,
      category: document.getElementById("evCategory").value,
      time:     document.getElementById("evTime").value.trim(),
      location: document.getElementById("evLocation").value.trim(),
      seats:    Number(document.getElementById("evSeats").value) || 100,
      fee:      document.getElementById("evFee").value.trim() || "Free",
      img:      document.getElementById("evImg").value.trim(),
      desc:     document.getElementById("evDesc").value.trim()
    };

    const res = await apiFetch(`${BASE_URL}/events/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) return showToast(result.error || "Failed", "error");

    showToast("✅ Event created!");
    ["evTitle","evTime","evLocation","evImg","evDesc"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("evDate").value = "";
    document.getElementById("evSeats").value = "100";
    document.getElementById("evFee").value = "Free";
    loadEvents();
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event? All registrations for it will also be lost.")) return;
    const res = await apiFetch(`${BASE_URL}/events/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) return showToast(result.error || "Failed", "error");
    showToast("Event deleted");
    loadEvents();
  }

  // ── Attendees modal ────────────────────────────────────────
  async function openAttendees(eventId, eventTitle) {
    document.getElementById("attTitle").innerText = `Attendees — ${eventTitle}`;
    document.getElementById("attBody").innerHTML = `<p class="empty">Loading...</p>`;
    document.getElementById("attOverlay").classList.add("active");

    const res = await apiFetch(`${BASE_URL}/registrations/event/${eventId}`);
    const data = await res.json();

    const body = document.getElementById("attBody");
    if (!res.ok || !data.length) {
      body.innerHTML = `<p class="empty">No registrations yet for this event.</p>`;
      return;
    }

    body.innerHTML = data.map(reg => `
      <div class="att-row">
        <div>
          <div class="att-name">${reg.userId?.name || reg.name}</div>
          <div class="att-sub">${reg.userId?.email || reg.email} · ${reg.userId?.role || ''}</div>
          <div class="att-ticket">${reg.ticketId}</div>
        </div>
        <button class="cancel-att-btn" onclick="cancelRegistration('${reg._id}', '${eventId}', '${eventTitle.replace(/'/g,"\\'")}')">Cancel</button>
      </div>
    `).join('');
  }

  async function cancelRegistration(regId, eventId, eventTitle) {
    if (!confirm("Cancel this registration?")) return;
    const res = await apiFetch(`${BASE_URL}/registrations/${regId}`, { method: "DELETE" });
    if (!res.ok) { showToast("Failed to cancel", "error"); return; }
    showToast("Registration cancelled");
    openAttendees(eventId, eventTitle); // refresh list
  }

  function closeAttendees() {
    document.getElementById("attOverlay").classList.remove("active");
  }

  // ════════════════════════════════════════════════════════════
  //  USERS TAB
  // ════════════════════════════════════════════════════════════

  let allUsers = [];
  let usersLoaded = false;

  async function loadUsers() {
    usersLoaded = true;
    const res = await apiFetch(`${BASE_URL}/users/admin/all-users`);
    if (!res.ok) { document.getElementById("usersList").innerHTML = `<p class="empty">Could not load users.</p>`; return; }
    allUsers = await res.json();

    // Stats
    const students = allUsers.filter(u => u.role === "student").length;
    const alumni   = allUsers.filter(u => u.role === "alumni").length;
    document.getElementById("statStudents").innerText = students;
    document.getElementById("statAlumni").innerText   = alumni;
    document.getElementById("statTotal").innerText    = allUsers.length;

    renderUsers(allUsers);
  }

  function filterUsers() {
    const q    = document.getElementById("userSearch").value.toLowerCase();
    const role = document.getElementById("userRoleFilter").value;
    const filtered = allUsers.filter(u => {
      const matchRole = role === "all" || u.role === role;
      const matchQ    = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchQ;
    });
    renderUsers(filtered);
  }

  function renderUsers(users) {
    const list = document.getElementById("usersList");
    if (!users.length) { list.innerHTML = `<p class="empty">No users found.</p>`; return; }

    list.innerHTML = "";
    users.forEach(u => {
      const joined = new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const div = document.createElement("div");
      div.className = "item-row";
      div.innerHTML = `
        <div class="item-info" style="flex:1">
          <strong>${u.name}</strong>
          <span>${u.email} · Joined ${joined}</span>
        </div>
        <span class="role-badge role-${u.role}">${u.role}</span>
        <div class="item-actions" style="margin-left:10px">
          <button class="del-btn" onclick="deleteUser('${u._id}', '${u.name.replace(/'/g,"\\'")}')">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await apiFetch(`${BASE_URL}/users/admin/delete/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (!res.ok) return showToast(result.error || "Failed", "error");
    showToast(`User "${name}" deleted`);
    loadUsers();
  }

  // ════════════════════════════════════════════════════════════
  //  DONATIONS TAB
  // ════════════════════════════════════════════════════════════

  let donationsLoaded = false;
  async function loadDonations() {
    donationsLoaded = true;
    const res = await apiFetch(`${BASE_URL}/donations`);
    const list = document.getElementById("donationsList");

    if (!res.ok) {
      list.innerHTML = `<p class="empty">Could not load donations.</p>`;
      return;
    }

    const donations = await res.json();

    // Calculate stats
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    document.getElementById("statTotalDonations").innerText = `₹${totalAmount.toLocaleString()}`;
    document.getElementById("statDonationCount").innerText = donations.length;

    if (!donations.length) {
      list.innerHTML = `<p class="empty">No donations yet.</p>`;
      return;
    }

    list.innerHTML = "";
    donations.forEach(d => {
      const date = new Date(d.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      const div = document.createElement("div");
      div.className = "item-row";
      div.innerHTML = `
        <div class="item-info" style="flex:1">
          <strong>${d.userId?.name || 'Anonymous'} — ₹${d.amount.toLocaleString()}</strong>
          <span>Cause: ${d.cause} · Method: ${d.paymentMethod} · ${date}</span>
        </div>
        <div class="item-actions">
           <span class="role-badge role-alumni">${d.paymentMethod}</span>
        </div>
      `;
      list.appendChild(div);
    });
  }

  // ── Init ───────────────────────────────────────────────────
  loadEvents();
