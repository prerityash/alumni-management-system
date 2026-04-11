import { signupUser, loginUser } from "./auth.js";
import { createPost, getPosts } from "./post.js";
import { renderPosts } from "./ui.js";

// Modal controls
const modal = document.getElementById("authModal");
document.getElementById("openAuth").onclick = () => modal.classList.remove("hidden");
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

// Toggle forms
document.getElementById("showSignup").onclick = () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  formTitle.innerText = "Signup";
};

document.getElementById("showLogin").onclick = () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  formTitle.innerText = "Login";
};

// Populate dropdown year
const yearSelect = document.getElementById("year");
const currentYear = new Date().getFullYear();
for (let i = currentYear - 10; i <= currentYear + 5; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.text = i;
  yearSelect.appendChild(opt);
}

// Signup
document.getElementById("signupBtn").onclick = async () => {
  const data = {
    name: name.value,
    collegeId: collegeId.value,
    email: email.value,
    graduationYear: Number(year.value),
    password: password.value
  };

  const res = await signupUser(data);
  alert(res.message);

  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};

// Login
document.getElementById("loginBtn").onclick = async () => {
  const res = await loginUser({
    collegeId: loginId.value,
    password: loginPass.value
  });

  if (res.error) return alert(res.error);

  localStorage.setItem("role", res.role);
  modal.classList.add("hidden");

  applyRole();
  loadPosts();
};

// Role control
function applyRole() {
  const role = localStorage.getItem("role");

  if (role === "student") {
    document.querySelector(".create-post").classList.add("hidden");
  } else {
    document.querySelector(".create-post").classList.remove("hidden");
  }
}

// Post
document.getElementById("postBtn").onclick = async () => {
  const data = {
    title: title.value,
    company: company.value,
    link: link.value,
    description: description.value
  };

  await createPost(data);
  loadPosts();
};

// Load posts
async function loadPosts() {
  const posts = await getPosts();
  renderPosts(posts);
}

// Init
applyRole();
loadPosts();