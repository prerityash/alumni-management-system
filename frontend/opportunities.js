    const BASE_URL = `${window.location.origin}/api`;
    const userId = localStorage.getItem("userId");
    if (!userId) { window.location.href = "index.html"; }
    let currentTab = 'all';

    function goBack() {
      const role = localStorage.getItem("role");
      if (role === "admin") window.location.href = "admin/dashboard.html";
      else if (role === "alumni") window.location.href = "alumni/dashboard.html";
      else window.location.href = "student/dashboard.html";
    }

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
      document.getElementById('filterPanel').style.display = tab === 'applied' ? 'none' : 'flex';
      fetchJobs();
    }

    async function applyJob(postId, link) {
      if (!window.confirm("Apply to this opportunity?")) return;
      try {
        await apiFetch(`${BASE_URL}/applications/create`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: userId, postId, status: 'Applied' })
        });
        if (link) window.open(link, '_blank');
        else alert("No external link. Application logged internally.");
        if (currentTab === 'applied') fetchJobs();
      } catch (e) { console.error(e); alert("Failed to log application."); }
    }

    async function expireJob(postId) {
      if (!confirm("Mark this as expired?")) return;
      await apiFetch(`${BASE_URL}/posts/${postId}/expire`, { method: 'PUT' });
      fetchJobs();
    }

    async function deleteJob(postId) {
      if (!confirm("Delete this post permanently?")) return;
      await apiFetch(`${BASE_URL}/posts/${postId}`, { method: 'DELETE' });
      fetchJobs();
    }

    function timeAgo(dateString) {
      const ms = Date.now() - new Date(dateString).getTime();
      const hours = Math.floor(ms / (1000 * 60 * 60));
      if (hours < 24) return hours <= 0 ? 'Just now' : `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }

    async function fetchJobs() {
      const container = document.getElementById('jobsContainer');
      container.innerHTML = "Fetching...";
      try {
        if (currentTab === 'applied') {
            const res = await apiFetch(`${BASE_URL}/applications/${userId}`);
          renderApplications(await res.json());
          return;
        }
        const params = new URLSearchParams();
        const role = document.getElementById("filterRole").value;
        const loc = document.getElementById("filterLocation").value;
        const exp = document.getElementById("filterExperience").value;
        const type = document.getElementById("filterType").value;
        if (role) params.append("role", role);
        if (loc) params.append("location", loc);
        if (exp) params.append("experience", exp);
        if (type) params.append("type", type);
        if (currentTab === 'posted') params.append("authorId", userId);
        const res = await apiFetch(`${BASE_URL}/posts/search/filters?${params}`);
        renderPosts(await res.json());
      } catch (err) { console.error(err); container.innerHTML = "Failed to load."; }
    }

    function buildCardTop(post) {
      const isIntern = post.postType === 'internship';
      return `
        <div class="jc-header">
          <h3 class="jc-title">${post.title || "Untitled"}</h3>
          <div class="jc-badge ${isIntern ? 'internship' : 'job'}">${isIntern ? 'Internship' : 'Job'}</div>
        </div>
        ${!isIntern && post.role ? `<div class="jc-detail-row"><strong>Role:</strong> ${post.role}</div>` : ''}
        ${isIntern && post.stipend ? `<div class="jc-detail-row"><strong>Stipend:</strong> ${post.stipend}</div>` : ''}
        <div class="jc-detail-row"><strong>Location:</strong> ${post.location || "Unspecified"} (${post.type || "N/A"})</div>
        ${post.experience ? `<div class="jc-detail-row"><strong>Experience:</strong> ${post.experience}</div>` : ''}
        <div class="jc-detail-row"><strong>Author:</strong> ${post.postedBy?.name || "Unknown"}</div>
      `;
    }

    function renderPosts(posts) {
      const container = document.getElementById('jobsContainer');
      container.innerHTML = "";
      if (posts.length === 0) { container.innerHTML = `<p style="color:#8888aa">No opportunities found.</p>`; return; }
      posts.forEach(post => {
        const isMine = post.postedBy?._id === userId || post.postedBy === userId;
        const expiredHtml = post.isExpired
          ? `<span class="jc-expired">EXPIRED</span>`
          : `<span class="jc-time">Posted ${timeAgo(post.createdAt)}</span>`;
        let actionBtns = post.isExpired
          ? `<button class="btn btn-disabled" disabled>Closed</button>`
          : `<button class="btn btn-apply" onclick="applyJob('${post._id}', '${post.link}')">Apply</button>`;
        if (isMine) {
          actionBtns += `
            <button class="btn btn-warn" ${post.isExpired ? 'disabled style="opacity:0.4"' : ''} onclick="expireJob('${post._id}')">Expire</button>
            <button class="btn btn-danger" onclick="deleteJob('${post._id}')">Delete</button>`;
        }
        container.innerHTML += `
          <div class="job-card">
            <div>${buildCardTop(post)}</div>
            <div class="jc-footer">${expiredHtml}<div class="btn-group">${actionBtns}</div></div>
          </div>`;
      });
    }

    function renderApplications(apps) {
      const container = document.getElementById('jobsContainer');
      container.innerHTML = "";
      if (apps.length === 0) { container.innerHTML = `<p style="color:#8888aa">You haven't applied to any opportunities yet.</p>`; return; }
      apps.forEach(app => {
        const post = app.postId;
        if (!post) return;
        container.innerHTML += `
          <div class="job-card">
            <div>
              ${buildCardTop(post)}
              <div class="jc-detail-row" style="color:#a78bfa;margin-top:10px;"><strong>Status:</strong> ${app.status}</div>
            </div>
            <div class="jc-footer">
              <span class="jc-time">Applied ${new Date(app.createdAt).toLocaleDateString()}</span>
              <button class="btn btn-apply" onclick="window.open('${post.link}', '_blank')">View</button>
            </div>
          </div>`;
      });
    }

    fetchJobs();
