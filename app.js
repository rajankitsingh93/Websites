const config = window.PROJECT_SHELF_CONFIG ?? {};
const grid = document.querySelector("#project-grid");
const searchInput = document.querySelector("#project-search");
const categoryFilter = document.querySelector("#category-filter");
const connectionStatus = document.querySelector("#connection-status");
const emptyState = document.querySelector("#empty-state");
const dialog = document.querySelector("#admin-dialog");
const loginForm = document.querySelector("#login-form");
const dashboard = document.querySelector("#admin-dashboard");
const adminMessage = document.querySelector("#admin-message");
const projectForm = document.querySelector("#project-form");
const adminProjectList = document.querySelector("#admin-project-list");
const toast = document.querySelector("#toast");

const curatedProjects = [
  {
    id: "airdroppulse",
    name: "Airdroppulse",
    url: "https://airdroppulse.rajankitsingh93.workers.dev/",
    description: "Send files, photos, videos, and messages between your devices using a temporary code—no account needed.",
    category: "File sharing"
  }
];

let supabase;
let projects = [];
let isAdmin = false;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
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
  const noProjects = projects.length === 0;
  emptyState.hidden = !noMatches && !noProjects;
  grid.hidden = visibleProjects.length === 0;
  document.querySelector("#empty-title").textContent = noMatches
    ? "No projects found."
    : isAdmin
      ? "Your shelf is ready for its first project."
      : "The shelf is ready for its first project.";
  document.querySelector("#empty-description").textContent = noMatches
    ? "Try another search or choose a different category."
    : isAdmin
      ? "Add a link from the control room and it’ll appear here for everyone."
      : "This space is just getting started. Check back soon for something new.";
  document.querySelector("#empty-manage").hidden = !isAdmin || noMatches;

}

function renderAdminProjects() {
  adminProjectList.replaceChildren();
  const managedProjects = projects.filter((project) => project.managed);
  document.querySelector("#admin-project-count").textContent = String(managedProjects.length);
  for (const project of managedProjects) {
    const item = createElement("li", "admin-project-item");
    const detail = createElement("div", "admin-project-detail");
    detail.append(createElement("strong", "", project.name), createElement("span", "", project.url));
    const actions = createElement("div", "admin-project-actions");
    const edit = createElement("button", "text-button", "Edit");
    edit.type = "button";
    edit.addEventListener("click", () => startEditing(project));
    const remove = createElement("button", "text-button danger-button", "Remove");
    remove.type = "button";
    remove.addEventListener("click", () => void removeProject(project));
    actions.append(edit, remove);
    item.append(detail, actions);
    adminProjectList.append(item);
  }
}

function updateCategoryOptions() {
  const current = categoryFilter.value;
  const categories = [...new Set(projects.map((project) => project.category))].sort((a, b) => a.localeCompare(b));
  categoryFilter.replaceChildren(new Option("All projects", "all"));
  for (const name of categories) categoryFilter.add(new Option(name, name));
  categoryFilter.value = categories.includes(current) ? current : "all";
}

async function loadProjects() {
  connectionStatus.hidden = false;
  connectionStatus.textContent = "Loading projects…";
  connectionStatus.classList.remove("is-error");
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, url, description, category")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    connectionStatus.textContent = `Couldn’t load the project collection: ${error.message}`;
    connectionStatus.classList.add("is-error");
    throw error;
  }

  const managedProjects = data.map((project) => ({ ...project, managed: true }));
  const managedUrls = new Set(managedProjects.map((project) => project.url));
  projects = [
    ...curatedProjects.filter((project) => !managedUrls.has(project.url)),
    ...managedProjects
  ];
  connectionStatus.hidden = true;
  renderProjects();
  if (isAdmin) renderAdminProjects();
}

async function verifyAdmin() {
  const { data, error } = await supabase.rpc("is_project_shelf_admin");
  if (error) throw error;
  return data === true;
}

function setAdminView(admin) {
  isAdmin = admin;
  loginForm.hidden = admin;
  dashboard.hidden = !admin;
  if (!admin) {
    adminMessage.textContent = "";
    renderProjects();
    return;
  }
  renderAdminProjects();
  renderProjects();
}

function startEditing(project) {
  projectForm.elements.namedItem("project-id").value = project.id;
  projectForm.elements.namedItem("name").value = project.name;
  projectForm.elements.namedItem("url").value = project.url;
  projectForm.elements.namedItem("description").value = project.description;
  projectForm.elements.namedItem("category").value = project.category;
  document.querySelector("#save-project").innerHTML = 'Save changes <span aria-hidden="true">↗</span>';
  document.querySelector("#cancel-edit").hidden = false;
  projectForm.elements.namedItem("name").focus();
}

function resetProjectForm() {
  projectForm.reset();
  projectForm.elements.namedItem("project-id").value = "";
  document.querySelector("#save-project").innerHTML = 'Add project <span aria-hidden="true">↗</span>';
  document.querySelector("#cancel-edit").hidden = true;
}

function normalizeProjectUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Please use a website link that starts with http:// or https://.");
  }
  return url.href;
}

async function removeProject(project) {
  const confirmed = window.confirm(`Remove "${project.name}" from the public shelf?`);
  if (!confirmed) return;

  try {
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) {
      showToast(`Couldn’t remove the project: ${error.message}`);
      return;
    }
    projects = projects.filter((item) => item.id !== project.id);
    renderAdminProjects();
    renderProjects();
    showToast("Project removed from the shelf.");
  } catch (error) {
    showToast(`Couldn’t remove the project: ${error.message}`);
  }
}

document.querySelector("#open-admin").addEventListener("click", () => {
  adminMessage.textContent = "";
  dialog.showModal();
  if (!supabase) {
    loginForm.hidden = true;
    adminMessage.textContent = "Connect this site to Supabase first. Follow the setup steps in README.md.";
    return;
  }

  loginForm.hidden = false;
  void (async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        adminMessage.textContent = `Couldn’t check your sign-in: ${error.message}`;
        return;
      }
      if (!data.session) {
        setAdminView(false);
        return;
      }
      const admin = await verifyAdmin();
      if (admin) {
        setAdminView(true);
      } else {
        const { error: signOutError } = await supabase.auth.signOut();
        setAdminView(false);
        adminMessage.textContent = signOutError
          ? `This account has no admin permission, and sign-out failed: ${signOutError.message}`
          : "This account doesn’t have permission to manage the shelf.";
      }
    } catch (error) {
      adminMessage.textContent = `Couldn’t verify admin access: ${error.message}`;
    }
  })();
});

document.querySelector("#close-admin").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector("#empty-manage").addEventListener("click", () => {
  adminMessage.textContent = "";
  dialog.showModal();
});

searchInput.addEventListener("input", renderProjects);
categoryFilter.addEventListener("change", renderProjects);
document.querySelector("#cancel-edit").addEventListener("click", resetProjectForm);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminMessage.textContent = "Signing in…";
  const formData = new FormData(loginForm);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get("email"),
      password: formData.get("password")
    });
    if (error) {
      adminMessage.textContent = `Couldn’t sign in: ${error.message}`;
      return;
    }
    if (!(await verifyAdmin())) {
      const { error: signOutError } = await supabase.auth.signOut();
      adminMessage.textContent = signOutError
        ? `This account has no admin permission, and sign-out failed: ${signOutError.message}`
        : "This account doesn’t have permission to manage the shelf.";
      return;
    }
    adminMessage.textContent = "";
    loginForm.reset();
    setAdminView(true);
  } catch (error) {
    adminMessage.textContent = `Couldn’t complete sign-in: ${error.message}`;
  }
});

document.querySelector("#sign-out").addEventListener("click", async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      adminMessage.textContent = `Couldn’t sign out: ${error.message}`;
      return;
    }
    setAdminView(false);
    loginForm.reset();
    showToast("You’ve signed out.");
  } catch (error) {
    adminMessage.textContent = `Couldn’t sign out: ${error.message}`;
  }
});

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(projectForm);
  let url;
  try {
    url = normalizeProjectUrl(formData.get("url").trim());
  } catch (error) {
    showToast(error.message);
    return;
  }

  const project = {
    name: formData.get("name").trim(),
    url,
    description: formData.get("description").trim(),
    category: formData.get("category").trim()
  };
  const projectId = formData.get("project-id");
  try {
    const query = projectId
      ? supabase.from("projects").update(project).eq("id", projectId)
      : supabase.from("projects").insert(project);
    const { error } = await query;
    if (error) {
      showToast(`Couldn’t save the project: ${error.message}`);
      return;
    }
  } catch (error) {
    showToast(`Couldn’t save the project: ${error.message}`);
    return;
  }

  resetProjectForm();
  try {
    await loadProjects();
    showToast(projectId ? "Project updated and shared." : "Project added and shared.");
  } catch (error) {
    showToast(`Saved, but the collection couldn’t refresh: ${error.message}`);
  }
});

async function start() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    projects = curatedProjects;
    connectionStatus.hidden = true;
    renderProjects();
    return;
  }

  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    await loadProjects();
  } catch (error) {
    connectionStatus.textContent = `Couldn’t connect to the project collection: ${error.message}`;
    connectionStatus.classList.add("is-error");
  }
}

void start();
