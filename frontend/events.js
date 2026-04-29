    const BASE_URL = `${window.location.origin}/api`;
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "index.html"; }

    function goBack() {
      const role = localStorage.getItem("role");
      if (role === "admin") window.location.href = "admin/dashboard.html";
      else if (role === "alumni") window.location.href = "alumni/dashboard.html";
      else window.location.href = "student/dashboard.html";
    }

    // ── All events loaded from the database ──────────────────
    let EVENTS = []; // will be filled from API
    let activeCategory = 'all';
    let activeStatus = 'all';
    let openEventId = null;

    async function loadEvents() {
      try {
        const res = await apiFetch(`${BASE_URL}/events`);
        if (!res.ok) { console.error("Failed to load events"); return; }
        const data = await res.json();
        // Map _id to id for compatibility with the rest of the code
        EVENTS = data.map(e => ({ ...e, id: e._id }));
        updateStats();
        renderEvents();
      } catch (err) {
        console.error("Events fetch failed:", err);
        document.getElementById('eventsGrid').innerHTML = `<p style="color:#8888aa;text-align:center">Could not load events. Please try again.</p>`;
      }
    }

    function getStatus(event) {
      const evDate = new Date(event.date);
      const todayDate = new Date(); todayDate.setHours(0,0,0,0);
      const diff = Math.floor((evDate - todayDate) / 86400000);
      if (diff < 0) return 'expired';
      if (diff === 0) return 'today';
      if (diff === 1) return 'tomorrow';
      return 'upcoming';
    }
    function badgeLabel(s) {
      return { expired:'Past Event', today:'Today!', tomorrow:'Tomorrow', upcoming:'Upcoming' }[s];
    }
    function badgeClass(s) {
      return { expired:'badge-expired', today:'badge-today', tomorrow:'badge-tomorrow', upcoming:'badge-upcoming' }[s];
    }
    function formatDate(d) {
      return new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' });
    }

    function renderEvents() {
      const grid = document.getElementById('eventsGrid');
      let filtered = EVENTS.filter(e => {
        const catMatch = activeCategory === 'all' || e.category === activeCategory;
        const statusVal = getStatus(e);
        const statusMatch = activeStatus === 'all' || (activeStatus === 'upcoming' && statusVal !== 'expired') || (activeStatus === 'expired' && statusVal === 'expired');
        return catMatch && statusMatch;
      });

      document.getElementById('visibleCount').innerText = filtered.length;

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state">
          <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="#8888aa"><circle cx="11" cy="11" r="8" stroke-width="1.5"/><path d="m21 21-4.35-4.35" stroke-width="1.5"/></svg>
          <h3>No events found</h3><p>Try a different category or status filter.</p></div>`;
        return;
      }

      grid.innerHTML = filtered.map(e => {
        const s = getStatus(e);
        const isExpired = s === 'expired';
        const imgUrl = e.img || `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=70`;
        return `
          <div class="event-card" onclick="openModal('${e.id}')">
            <div class="card-img" style="background-image:url('${imgUrl}')">
              <div class="card-img-overlay"></div>
              <div class="card-badge ${badgeClass(s)}">${badgeLabel(s)}</div>
              <div class="card-category">${e.category}</div>
            </div>
            <div class="card-body">
              <div class="card-title">${e.title}</div>
              <div class="card-meta">
                <div class="card-meta-row">📅 ${formatDate(e.date)} • ${e.time || 'TBD'}</div>
                <div class="card-meta-row">📍 ${e.location || 'LPU Campus'}</div>
              </div>
              <div class="card-desc">${e.desc || ''}</div>
              <div class="card-footer">
                <div class="card-seats">Seats: <span>${isExpired ? '0' : e.seats}</span></div>
                <button class="details-btn ${isExpired ? 'expired' : ''}">${isExpired ? 'View Details' : 'View & Register'}</button>
              </div>
            </div>
          </div>`;
      }).join('');
    }

    function openModal(id) {
      const e = EVENTS.find(x => x.id === id || x._id === id);
      if (!e) return;
      openEventId = id;
      const s = getStatus(e);
      const isExpired = s === 'expired';
      const imgUrl = e.img || `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=70`;

      document.getElementById('modalImg').style.backgroundImage = `url('${imgUrl}')`;
      document.getElementById('modalStatus').className = `card-badge ${badgeClass(s)}`;
      document.getElementById('modalStatus').innerText = badgeLabel(s);
      document.getElementById('modalCatBadge').innerText = e.category;
      document.getElementById('modalCat').innerText = e.category;
      document.getElementById('modalTitle').innerText = e.title;
      document.getElementById('modalDate').innerText = formatDate(e.date);
      document.getElementById('modalTime').innerText = e.time || 'TBD';
      document.getElementById('modalLoc').innerText = e.location || 'LPU Campus';
      document.getElementById('modalSeats').innerText = isExpired ? 'Closed' : `${e.seats} seats`;
      document.getElementById('modalReg').innerText = e.reg || 'Open';
      document.getElementById('modalFee').innerText = e.fee || 'Free';
      document.getElementById('modalDesc').innerText = e.desc || '';

      const btn = document.getElementById('modalRegBtn');
      if (isExpired) {
        btn.innerText = 'Registrations Closed';
        btn.className = 'register-btn expired-btn';
        btn.onclick = null;
      } else {
        btn.innerText = 'Register Now →';
        btn.className = 'register-btn';
        btn.onclick = registerEvent;
      }

      document.getElementById('eventModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      document.getElementById('eventModal').classList.remove('active');
      document.body.style.overflow = '';
      openEventId = null;
    }

    function closeModalOnOverlay(e) {
      if (e.target === document.getElementById('eventModal')) closeModal();
    }

    // ── REGISTER FOR EVENT via API ─────────────────────────────
    async function registerEvent() {
      const e = EVENTS.find(x => x.id === openEventId || x._id === openEventId);
      if (!e) return;

      const btn = document.getElementById('modalRegBtn');
      btn.innerText = 'Registering...';
      btn.disabled = true;

      try {
        const res = await apiFetch(`${BASE_URL}/registrations/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: e._id || e.id })
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || 'Registration failed', 'error');
          btn.innerText = 'Register Now →';
          btn.disabled = false;
          return;
        }

        // Close event modal and show ticket
        closeModal();
        showTicket(data.registration, e);

      } catch (err) {
        showToast('Network error. Please try again.', 'error');
        btn.innerText = 'Register Now →';
        btn.disabled = false;
      }
    }

    function showTicket(reg, event) {
      document.getElementById('tktId').innerText    = reg.ticketId;
      document.getElementById('tktEvent').innerText = event.title;
      document.getElementById('tktDate').innerText  = formatDate(event.date);
      document.getElementById('tktLoc').innerText   = event.location || 'LPU Campus';
      document.getElementById('tktFee').innerText   = event.fee || 'Free';
      document.getElementById('ticketOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeTicket() {
      document.getElementById('ticketOverlay').classList.remove('active');
      document.body.style.overflow = '';
    }

    function showToast(msg, type = '') {
      const t = document.getElementById('toastMsg');
      t.innerText = msg;
      t.className = `toast-msg show ${type}`;
      setTimeout(() => t.classList.remove('show'), 3500);
    }

    function shareEvent() {
      const e = EVENTS.find(x => x.id === openEventId || x._id === openEventId);
      if (!e) return;
      alert(`Share this event:\n"${e.title}" — ${formatDate(e.date)}\n${e.location || 'LPU Campus'}`);
    }

    function setCategory(btn, cat) {
      activeCategory = cat;
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEvents();
    }

    function setStatus(btn, status) {
      activeStatus = status;
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderEvents();
    }

    function updateStats() {
      const upcoming = EVENTS.filter(e => getStatus(e) !== 'expired').length;
      const cats = new Set(EVENTS.map(e => e.category)).size;
      document.getElementById('upcomingCount').innerText = upcoming;
      document.getElementById('totalCount').innerText = EVENTS.length;
      document.getElementById('catCount').innerText = cats;
    }

    window.addEventListener('scroll', () => {
      document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Hero Slideshow
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    let curSlide = 0;
    if (slides.length > 0) {
      setInterval(() => {
        slides[curSlide].classList.remove('active');
        curSlide = (curSlide + 1) % slides.length;
        slides[curSlide].classList.add('active');
      }, 4000);
    }

    // Load events from database on page load
    loadEvents();
