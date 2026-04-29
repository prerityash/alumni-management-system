    // Greeting
    function updateGreeting() {
      const name = localStorage.getItem("name") || "Alumni";
      const h = new Date().getHours();
      const g = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
      document.getElementById("greetingMsg").innerText = `${g}, ${name}!`;
    }
    updateGreeting();

    async function logout() {
      await apiFetch(`${BASE_URL}/users/logout`, { method: "POST" });
      localStorage.clear();
      window.location.href = "../index.html";
    }

    const BASE_URL = `${window.location.origin}/api`;
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    if (!userId) {
      window.location.href = "../index.html";
    } else if (userRole !== "alumni") {
      // Redirect to the correct dashboard based on actual role
      if (userRole === "admin") window.location.href = "../admin/dashboard.html";
      else window.location.href = "../student/dashboard.html";
    }

    async function fetchAlumniCount() {
      try {
        const res = await apiFetch(`${BASE_URL}/users/stats`);
        const data = await res.json();
        if (data.totalAlumni !== undefined) document.getElementById('alumniCount').innerText = data.totalAlumni.toLocaleString();
      } catch (e) { console.error(e); }
    }

    async function fetchDonations() {
      try {
        const res = await apiFetch(`${BASE_URL}/donations`);
        const donations = await res.json();
        const box = document.getElementById("fundingList");
        box.innerHTML = donations.length === 0 ? `<div class="list-item"><p>No donations yet.</p></div>` : "";
        donations.forEach(don => {
          const name = don.userId ? don.userId.name : "Anonymous";
          const date = new Date(don.createdAt).toLocaleDateString();
          box.innerHTML += `<div class="list-item"><p><strong>${name}</strong> donated ₹${don.amount}</p><span>Cause: ${don.cause} · ${date}</span></div>`;
        });
      } catch (e) { console.error(e); }
    }

    async function fetchPosts() {
      try {
        const res = await apiFetch(`${BASE_URL}/posts`);
        const posts = await res.json();
        const box = document.getElementById("notificationsList");
        box.innerHTML = "";
        posts.forEach(post => {
          const type = post.postType === "internship" ? "Internship" : "Job";
          box.innerHTML += `<div class="list-item"><p><strong>${post.title || "Untitled"} (${type})</strong></p><span>Location: ${post.location || "N/A"}</span></div>`;
        });
      } catch (e) { console.error(e); }
    }

    document.getElementById("postJobBtn").onclick = async () => {
      const payload = {
        title: document.getElementById("jobTitle").value,
        role: document.getElementById("jobRole").value,
        experience: document.getElementById("jobExperience").value,
        postType: "job",
        type: document.getElementById("jobType").value,
        location: document.getElementById("jobLocation").value,
        vacancy: Number(document.getElementById("jobVacancy").value),
        link: document.getElementById("jobLink").value,
        postedBy: userId
      };
      try {
        await apiFetch(`${BASE_URL}/posts/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        alert("Job posted successfully!");
        fetchPosts();
      } catch { alert("Error posting job"); }
    };

    document.getElementById("postInternBtn").onclick = async () => {
      const payload = {
        title: document.getElementById("internTitle").value,
        postType: "internship",
        type: document.getElementById("internType").value,
        location: document.getElementById("internLocation").value,
        stipend: document.getElementById("internStipend").value,
        link: document.getElementById("internLink").value,
        postedBy: userId
      };
      try {
        await apiFetch(`${BASE_URL}/posts/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        alert("Internship posted successfully!");
        fetchPosts();
      } catch { alert("Error posting internship"); }
    };

    document.getElementById("donateBtn").onclick = async () => {
      const amount = Number(document.getElementById("donAmount").value);
      const cause = document.getElementById("donCause").value;
      const paymentMethod = document.getElementById("donPayment").value;

      if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      const payload = { amount, cause, paymentMethod, userId };

      try {
        // Step 1: Create Order on Backend
        const orderRes = await apiFetch(`${BASE_URL}/donations/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount })
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

        // Step 2: Fetch the EXACT key from the backend
        const keyRes = await apiFetch(`${BASE_URL}/donations/get-key`);
        const { key } = await keyRes.json();

        if (!key) throw new Error("Razorpay key not found on server");

        // Step 3: Open Razorpay Checkout
        const options = {
          key: key, // Dynamically loaded from backend
          amount: orderData.amount,
          currency: orderData.currency,
          name: "AlumniPortal Pro",
          description: "Donation for " + cause,
          order_id: orderData.id,
          handler: async function (response) {
            // Step 3: On Success, Save Donation to Database
            try {
              const saveRes = await apiFetch(`${BASE_URL}/donations/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });
              if (!saveRes.ok) throw new Error("Backend validation failed");
              
              alert("Payment successful! Thank you for your donation!");
              document.getElementById("donAmount").value = "";
              dashboardTabBtn.click();
              fetchDonations();
            } catch (err) {
              alert("Error recording donation in database.");
            }
          },
          prefill: {
            name: localStorage.getItem("name") || "Alumni",
            email: "alumni@example.com", // You can pass dynamic email if available
            contact: "9999999999"
          },
          theme: { color: "#7c3aed" }
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (response) {
          alert("Payment failed: " + response.error.description);
        });
        rzp.open();

      } catch (err) {
        console.error(err);
        alert("Error initializing payment gateway");
      }
    };

    // View Toggle
    const dashboardTabBtn = document.getElementById("dashboardTabBtn");
    const donationTabBtn = document.getElementById("donationTabBtn");
    const dashboardView = document.getElementById("dashboardView");
    const donationView = document.getElementById("donationView");

    dashboardTabBtn.addEventListener("click", () => {
      dashboardTabBtn.classList.add("active"); donationTabBtn.classList.remove("active");
      dashboardView.classList.remove("hidden"); donationView.classList.add("hidden");
    });
    donationTabBtn.addEventListener("click", () => {
      donationTabBtn.classList.add("active"); dashboardTabBtn.classList.remove("active");
      donationView.classList.remove("hidden"); dashboardView.classList.add("hidden");
    });

    // Mentor Logic
    async function initMentorSetup() {
      try {
        const res = await apiFetch(`${BASE_URL}/users/${userId}`);
        const user = await res.json();
        if (user.isMentorEnabled) document.getElementById('mentorEnableBtn').checked = true;
        document.getElementById('mentorDay').value = user.mentorDay || '';
        document.getElementById('mentorTime').value = user.mentorTime || '';
        document.getElementById('mentorEmail').value = user.mentorEmail || user.email || '';
        document.getElementById('mentorContact').value = user.mentorContact || '';
        document.getElementById('mentorLink').value = user.mentorLink || '';
      } catch (e) { console.error(e); }
    }
    initMentorSetup();

    document.getElementById('saveMentorBtn').onclick = async () => {
      const payload = {
        isMentorEnabled: document.getElementById('mentorEnableBtn').checked,
        mentorDay: document.getElementById('mentorDay').value,
        mentorTime: document.getElementById('mentorTime').value,
        mentorEmail: document.getElementById('mentorEmail').value,
        mentorContact: document.getElementById('mentorContact').value,
        mentorLink: document.getElementById('mentorLink').value
      };
      try {
        await apiFetch(`${BASE_URL}/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        alert("Mentor configuration saved!");
      } catch { alert("Failed to save configuration!"); }
    };

    async function fetchMentorBookings() {
      try {
        const res = await apiFetch(`${BASE_URL}/meetings/${userId}`);
        const meetings = await res.json();
        const list = document.getElementById("mentorBookingsList");
        if (!list) return;
        list.innerHTML = meetings.length === 0 ? `<div class="list-item feedback"><p>No bookings yet.</p></div>` : "";
        meetings.forEach(m => {
          list.innerHTML += `<div class="list-item feedback"><p><strong>${m.studentId?.name || 'Student'}</strong>: ${m.topic || 'Mentorship Request'}</p><span>${new Date(m.date).toLocaleDateString()} at ${new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>`;
        });
      } catch (e) { console.error(e); }
    }
    fetchMentorBookings();

    // Init
    fetchAlumniCount(); fetchDonations(); fetchPosts();
    setInterval(fetchAlumniCount, 15000);
    setInterval(fetchPosts, 15000);
    setInterval(fetchDonations, 15000);
