const projects = [
  {
    name: "Airdroppulse",
    url: "https://airdroppulse.rajankitsingh93.workers.dev/",
    description: "Send files, photos, videos, and messages between your devices using a temporary code—no account needed.",
    category: "File sharing"
  }
];

const grid = document.querySelector("#project-grid");
const searchInput = document.querySelector("#project-search");
const categoryFilter = document.querySelector("#category-filter");
const emptyState = document.querySelector("#empty-state");

function updateCategoryOptions() {
  const current = categoryFilter.value;
  const categories = [...new Set(projects.map((project) => project.category))].sort((a, b) => a.localeCompare(b));
  categoryFilter.replaceChildren(new Option("All projects", "all"));
  for (const name of categories) categoryFilter.add(new Option(name, name));
  categoryFilter.value = categories.includes(current) ? current : "all";
}

function getVisibleProjects() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const category = categoryFilter.value;

  return projects.filter((project) => {
    const matchesCategory = category === "all" || project.category === category;
    const searchable = `${project.name} ${project.description} ${project.category}`.toLocaleLowerCase();
    return matchesCategory && searchable.includes(query);
  });
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProjects() {
  updateCategoryOptions();
  const visibleProjects = getVisibleProjects();
  grid.replaceChildren();
  document.querySelector("#project-count").textContent =
    `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;

  for (const project of visibleProjects) {
    const card = createElement("article", "project-card");
    const cardTop = createElement("div", "card-topline");
    const icon = createElement("span", "project-icon", project.name.trim().charAt(0).toUpperCase() || "✳");
    icon.setAttribute("aria-hidden", "true");
    const category = createElement("span", "project-category", project.category);
    cardTop.append(icon, category);

    const title = createElement("h3", "project-title", project.name);
    const description = createElement("p", "project-description", project.description);
    const link = createElement("a", "project-link");
    link.href = project.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Visit ${project.name} (opens in a new tab)`);
    link.append(createElement("span", "", "Visit project"), createElement("span", "link-arrow", "↗"));
    card.append(cardTop, title, description, link);
    grid.append(card);
  }

  const noMatches = projects.length > 0 && visibleProjects.length === 0;
  emptyState.hidden = visibleProjects.length > 0;
  grid.hidden = visibleProjects.length === 0;
  document.querySelector("#empty-title").textContent = noMatches ? "No projects found." : "No projects yet.";
  document.querySelector("#empty-description").textContent = noMatches
    ? "Try another search or choose a different category."
    : "Check back soon for something new.";
}

searchInput.addEventListener("input", renderProjects);
categoryFilter.addEventListener("change", renderProjects);
renderProjects();
