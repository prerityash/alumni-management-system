export function renderPosts(posts) {
  const container = document.getElementById("postList");
  container.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p><b>${post.company}</b></p>
      <p>${post.description}</p>
      <a href="${post.link}" target="_blank">Apply</a>
    `;

    container.appendChild(div);
  });
}


