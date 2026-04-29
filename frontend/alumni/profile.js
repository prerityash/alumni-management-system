    const BASE_URL = `${window.location.origin}/api/users`;
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    if (!userId) {
      window.location.href = "../index.html";
    } else if (userRole !== "alumni") {
      if (userRole === "admin") window.location.href = "../admin/dashboard.html";
      else window.location.href = "../student/dashboard.html";
    }

    async function loadProfile() {
      try {
        const res = await apiFetch(`${BASE_URL}/${userId}`);
        const user = await res.json();
        if (user.error) { alert("Unable to fetch user details. " + user.error); return; }
        document.getElementById("profName").value = user.name || "";
        document.getElementById("profEmail").value = user.email || "";
        document.getElementById("profRole").value = (user.role || "").toUpperCase();
        document.getElementById("profCollegeId").value = user.collegeId || "N/A";
        document.getElementById("profGradYear").value = user.graduationYear || "";
        document.getElementById("profPhone").value = user.phone || "";
        document.getElementById("profLinkedin").value = user.linkedin || "";
        document.getElementById("profCourse").value = user.course || "";
        document.getElementById("profCompany").value = user.company || "";
        document.getElementById("profJobPost").value = user.jobPost || "";
        document.getElementById("profExperience").value = user.workExperience || "";
        document.getElementById("profBio").value = user.bio || "";
        currentProfilePic = user.profilePic || "";
        renderPic();
      } catch (err) { console.error("Failed to load profile", err); }
    }

    document.getElementById("saveProfileBtn").addEventListener("click", async () => {
      const payload = {
        name: document.getElementById("profName").value,
        graduationYear: Number(document.getElementById("profGradYear").value),
        phone: document.getElementById("profPhone").value,
        linkedin: document.getElementById("profLinkedin").value,
        course: document.getElementById("profCourse").value,
        company: document.getElementById("profCompany").value,
        jobPost: document.getElementById("profJobPost").value,
        workExperience: document.getElementById("profExperience").value,
        bio: document.getElementById("profBio").value,
        profilePic: currentProfilePic
      };
      try {
        const res = await apiFetch(`${BASE_URL}/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await res.json();
        if (result.error) alert("Update failed: " + result.error);
        else { alert("Profile updated successfully!"); localStorage.setItem("name", payload.name); }
      } catch (err) { console.error(err); alert("Action failed, please check console."); }
    });

    let currentProfilePic = "";

    function handlePicUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => { currentProfilePic = e.target.result; renderPic(); };
      reader.readAsDataURL(file);
    }

    function removePic() { currentProfilePic = ""; renderPic(); }

    function renderPic() {
      if (currentProfilePic) {
        document.getElementById("profPicPreview").src = currentProfilePic;
        document.getElementById("profPicPreview").style.display = "block";
        document.getElementById("profPicFallback").style.display = "none";
      } else {
        document.getElementById("profPicPreview").style.display = "none";
        document.getElementById("profPicFallback").style.display = "flex";
      }
    }

    loadProfile();
