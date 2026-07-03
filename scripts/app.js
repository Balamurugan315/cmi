"use strict";

const App = (() => {
  const state = { section: "dashboard", query: "", pages: {}, selected: new Set(), charts: [] };
  const view = document.getElementById("view");
  const pageTitle = document.getElementById("pageTitle");
  const headActions = document.getElementById("headActions");
  const modalRoot = document.getElementById("modalRoot");
  const toastStack = document.getElementById("toastStack");

  const nav = [
    ["dashboard", "Dashboard"], ["users", "User Verification"], ["influencers", "Influencer Verification"],
    ["brands", "Brand Verification"], ["tournaments", "Tournament Management"], ["subscriptions", "Subscription Management"],
    ["reports", "Reports"], ["analytics", "Analytics"], ["activity", "Activity Logs"], ["support", "Support Tickets"],
    ["settings", "Settings"], ["logout", "Logout"]
  ];

  const cfg = {
    users: { collection: COLLECTIONS.USERS, title: "User Verification", name: "name", columns: ["name", "email", "role", "country", "game", "status"], filters: ["status", "country", "role"] },
    influencers: { collection: COLLECTIONS.INFLUENCERS, title: "Influencer Verification", name: "name", columns: ["name", "platform", "subscribers", "views", "engagement", "country", "status"], filters: ["status", "country", "platform"] },
    brands: { collection: COLLECTIONS.BRANDS, title: "Brand Verification", name: "company", columns: ["company", "website", "industry", "revenue", "campaigns", "country", "status"], filters: ["status", "country", "industry"] },
    tournaments: { collection: COLLECTIONS.TOURNAMENTS, title: "Tournament Management", name: "title", columns: ["title", "game", "prizePool", "teams", "winner", "country", "status"], filters: ["status", "country", "game"] },
    subscriptions: { collection: COLLECTIONS.SUBSCRIPTIONS, title: "Subscription Management", name: "plan", columns: ["plan", "price", "subscribers", "revenue", "status"], filters: ["status"] },
    support: { collection: COLLECTIONS.SUPPORT, title: "Support Tickets", name: "subject", columns: ["subject", "requester", "priority", "assignee", "country", "status"], filters: ["status", "country", "priority"] }
  };

  const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
  const date = value => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const rows = collection => StorageManager.all(collection);
  const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);

  const log = action => StorageManager.insert(COLLECTIONS.ACTIVITY, { action, admin: settings().adminName || "Admin Xeno", module: pageTitle.textContent, createdAt: new Date().toISOString() });
  const settings = () => StorageManager.load(COLLECTIONS.SETTINGS, {});

  function init() {
    renderNav();
    bindShell();
    route();
    window.addEventListener("hashchange", route);
    window.addEventListener("gv:storage", () => renderSection());
  }

  function renderNav() {
    document.getElementById("navList").innerHTML = nav.map(([id, label]) => `<a href="#${id}" class="nav-link" data-id="${id}"><span>${label.slice(0, 2)}</span>${label}</a>`).join("");
  }

  function bindShell() {
    document.getElementById("mobileMenu").addEventListener("click", () => document.body.classList.add("nav-open"));
    document.getElementById("mobileBackdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));
    document.getElementById("themeToggle").addEventListener("click", () => document.body.classList.toggle("light-mode"));
    document.getElementById("globalSearch").addEventListener("input", event => globalSearch(event.target.value));
    document.querySelector("[aria-label='Notifications']").addEventListener("click", () => toast(`${pendingCount()} pending verification items`, "warning"));
    document.querySelector("[aria-label='Messages']").addEventListener("click", () => toast("Team inbox is clear", "success"));
  }

  function route() {
    const id = location.hash.replace("#", "") || "dashboard";
    if (id === "logout") return toast("Logged out locally. No backend session was used.", "success");
    state.section = nav.some(item => item[0] === id) ? id : "dashboard";
    document.body.classList.remove("nav-open");
    renderSection();
  }

  function renderSection() {
    state.selected.clear();
    state.charts.forEach(chart => chart.destroy && chart.destroy());
    state.charts = [];
    document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.id === state.section));
    const title = nav.find(item => item[0] === state.section)?.[1] || "Dashboard";
    pageTitle.textContent = title;
    headActions.innerHTML = "";
    if (state.section === "dashboard") return renderDashboard();
    if (cfg[state.section]) return renderTableSection(state.section);
    if (state.section === "reports") return renderReports();
    if (state.section === "analytics") return renderAnalytics();
    if (state.section === "activity") return renderActivity();
    if (state.section === "settings") return renderSettings();
  }

  function pendingCount() {
    return [COLLECTIONS.USERS, COLLECTIONS.INFLUENCERS, COLLECTIONS.BRANDS].flatMap(collection => rows(collection)).filter(item => item.status === "Pending").length;
  }

  function renderDashboard() {
    const users = rows(COLLECTIONS.USERS), influencers = rows(COLLECTIONS.INFLUENCERS), brands = rows(COLLECTIONS.BRANDS), tournaments = rows(COLLECTIONS.TOURNAMENTS), subs = rows(COLLECTIONS.SUBSCRIPTIONS), tickets = rows(COLLECTIONS.SUPPORT);
    const revenue = sum(subs, "revenue");
    view.innerHTML = `
      <div class="stat-grid">
        ${stat("Total Users", users.length, "All platform accounts")}${stat("Verified Users", users.filter(x => x.status === "Approved").length, "Approved profiles")}${stat("Pending Users", pendingCount(), "Needs admin review")}${stat("Rejected Users", users.filter(x => x.status === "Rejected").length, "User denials")}
        ${stat("Influencers", influencers.length, "Creator partners")}${stat("Brands", brands.length, "Sponsor accounts")}${stat("Tournaments", tournaments.length, "Events tracked")}${stat("Revenue", money(revenue), "Monthly run rate")}
        ${stat("Support Tickets", tickets.filter(x => x.status !== "Resolved").length, "Open or pending")}${stat("Subscriptions", subs.reduce((t, x) => t + x.subscribers, 0), "Active seats")}
      </div>
      <div class="chart-grid">
        ${chartCard("User Distribution", "userDistribution")}${chartCard("Verification", "verificationChart")}${chartCard("Revenue", "revenueChart")}${chartCard("Tournaments", "tournamentChart")}${chartCard("Growth", "growthChart")}
      </div>
      <div class="dashboard-grid">
        ${miniTable("Recent Users", users.slice(0, 6), ["name", "email", "status"])}${miniTable("Recent Tournaments", tournaments.slice(0, 6), ["title", "game", "status"])}${miniTable("Support Tickets", tickets.slice(0, 6), ["subject", "priority", "status"])}
        <section class="panel"><h2>Recent Activity</h2><div class="timeline">${rows(COLLECTIONS.ACTIVITY).slice(0, 7).map(item => timeline(item)).join("")}</div></section>
      </div>`;
    drawCharts();
  }

  const stat = (label, value, hint) => `<article class="stat-card"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(hint)}</small></article>`;
  const chartCard = (title, id) => `<section class="panel chart-card"><h2>${title}</h2><canvas id="${id}" aria-label="${title} chart"></canvas></section>`;
  const timeline = item => `<div class="timeline-item"><span></span><div><strong>${esc(item.action)}</strong><small>${esc(item.admin)} · ${date(item.createdAt)}</small></div></div>`;

  function miniTable(title, data, columns) {
    return `<section class="panel"><h2>${title}</h2><table><thead><tr>${columns.map(c => `<th>${label(c)}</th>`).join("")}</tr></thead><tbody>${data.map(item => `<tr>${columns.map(c => `<td>${format(item[c], c)}</td>`).join("")}</tr>`).join("") || emptyRow(columns.length)}</tbody></table></section>`;
  }

  function renderTableSection(key) {
    const meta = cfg[key];
    const all = rows(meta.collection);
    const page = state.pages[key] || 1;
    const filtered = filterData(all, key);
    const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
    const pageData = filtered.slice((page - 1) * 10, page * 10);
    headActions.innerHTML = `<button class="btn secondary" data-action="export">Export CSV</button><button class="btn secondary" data-action="import">Import CSV</button>${key === "tournaments" ? `<button class="btn primary" data-action="create">Create Tournament</button>` : ""}`;
    view.innerHTML = `
      <section class="panel section-tools">
        <input id="sectionSearch" type="search" placeholder="Search ${esc(meta.title).toLowerCase()}" value="${esc(state[`${key}Search`] || "")}">
        ${meta.filters.map(filter => selectFilter(filter, all, state[`${key}${filter}`])).join("")}
        <div class="bulk-actions"><button class="btn success" data-action="bulk-approve">Bulk Approve</button><button class="btn danger" data-action="bulk-reject">Bulk Reject</button></div>
      </section>
      <section class="panel"><div class="table-scroll"><table><thead><tr><th><input type="checkbox" id="selectAll" aria-label="Select all rows"></th>${meta.columns.map(c => `<th>${label(c)}</th>`).join("")}<th>Actions</th></tr></thead><tbody>${pageData.map(item => dataRow(item, meta)).join("") || emptyRow(meta.columns.length + 2)}</tbody></table></div><div class="pagination"><button class="btn secondary" data-action="prev" ${page <= 1 ? "disabled" : ""}>Previous</button><span>Page ${page} of ${totalPages}</span><button class="btn secondary" data-action="next" ${page >= totalPages ? "disabled" : ""}>Next</button></div></section>`;
    bindTable(key, totalPages);
  }

  function dataRow(item, meta) {
    return `<tr><td><input type="checkbox" class="row-select" value="${esc(item.id)}" aria-label="Select ${esc(item[meta.name])}"></td>${meta.columns.map(c => `<td>${format(item[c], c)}</td>`).join("")}<td class="row-actions"><button data-action="view" data-id="${esc(item.id)}">View</button><button data-action="approve" data-id="${esc(item.id)}">Approve</button><button data-action="reject" data-id="${esc(item.id)}">Reject</button>${state.section === "tournaments" ? `<button data-action="delete" data-id="${esc(item.id)}">Delete</button>` : `<button data-action="changes" data-id="${esc(item.id)}">Changes</button>`}</td></tr>`;
  }

  function bindTable(key, totalPages) {
    const meta = cfg[key];
    document.getElementById("sectionSearch").addEventListener("input", event => { state[`${key}Search`] = event.target.value; state.pages[key] = 1; renderSection(); });
    meta.filters.forEach(filter => document.getElementById(`filter-${filter}`).addEventListener("change", event => { state[`${key}${filter}`] = event.target.value; state.pages[key] = 1; renderSection(); }));
    document.getElementById("selectAll").addEventListener("change", event => document.querySelectorAll(".row-select").forEach(box => { box.checked = event.target.checked; toggleSelected(box.value, box.checked); }));
    document.querySelectorAll(".row-select").forEach(box => box.addEventListener("change", () => toggleSelected(box.value, box.checked)));
    view.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(key, button.dataset.action, button.dataset.id, totalPages)));
    headActions.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => handleAction(key, button.dataset.action, button.dataset.id, totalPages)));
  }

  function handleAction(key, action, id, totalPages) {
    const meta = cfg[key];
    if (action === "prev" || action === "next") { state.pages[key] = Math.min(totalPages, Math.max(1, (state.pages[key] || 1) + (action === "next" ? 1 : -1))); return renderSection(); }
    if (action === "view") return openDetails(meta, StorageManager.find(meta.collection, id));
    if (["approve", "reject", "changes"].includes(action)) return updateStatus(meta, [id], action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Changes Requested");
    if (action === "bulk-approve" || action === "bulk-reject") return updateStatus(meta, [...state.selected], action === "bulk-approve" ? "Approved" : "Rejected");
    if (action === "export") return exportCsv(meta);
    if (action === "import") return importCsv(meta);
    if (action === "create") return openTournamentForm();
    if (action === "delete") return confirmDelete(meta, id);
  }

  function updateStatus(meta, ids, status) {
    if (!ids.length) return toast("Select at least one row first", "warning");
    StorageManager.bulkUpdate(meta.collection, ids, { status });
    log(`${status} ${ids.length} ${meta.title} record(s)`);
    toast(`${ids.length} record(s) updated`, "success");
    renderSection();
  }

  function confirmDelete(meta, id) {
    openModal("Delete tournament", `<p>This action removes the tournament from LocalStorage.</p><div class="modal-actions"><button class="btn secondary" data-close>Cancel</button><button class="btn danger" id="confirmDelete">Delete</button></div>`);
    document.getElementById("confirmDelete").addEventListener("click", () => { StorageManager.remove(meta.collection, id); log("Deleted tournament"); closeModal(); toast("Tournament deleted", "success"); renderSection(); });
  }

  function openTournamentForm() {
    openModal("Create Tournament", `<form id="tournamentForm" class="form-grid"><input name="title" placeholder="Tournament title" required><input name="game" placeholder="Game" required><input name="prizePool" type="number" min="1" placeholder="Prize pool" required><input name="teams" type="number" min="2" placeholder="Teams" required><input name="country" placeholder="Country" required><select name="status"><option>Upcoming</option><option>Live</option><option>Completed</option></select><div class="modal-actions"><button class="btn secondary" type="button" data-close>Cancel</button><button class="btn primary">Create</button></div></form>`);
    document.getElementById("tournamentForm").addEventListener("submit", event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target));
      if (Number(data.prizePool) <= 0 || Number(data.teams) < 2) return toast("Enter valid prize pool and teams", "error");
      StorageManager.insert(COLLECTIONS.TOURNAMENTS, { ...data, prizePool: Number(data.prizePool), teams: Number(data.teams), winner: "TBD", startDate: new Date().toISOString() });
      log(`Created tournament ${data.title}`); closeModal(); toast("Tournament created", "success"); renderSection();
    });
  }

  function openDetails(meta, item) {
    openModal(item[meta.name] || "Details", `<dl class="details">${Object.entries(item).map(([k, v]) => `<div><dt>${label(k)}</dt><dd>${format(v, k)}</dd></div>`).join("")}</dl><label>Admin Notes<textarea id="adminNotes">${esc(item.notes || "")}</textarea></label><div class="modal-actions"><button class="btn secondary" data-close>Close</button><button class="btn primary" id="saveNotes">Save Notes</button></div>`);
    document.getElementById("saveNotes").addEventListener("click", () => { StorageManager.update(meta.collection, item.id, { notes: document.getElementById("adminNotes").value }); log(`Updated notes for ${item[meta.name]}`); closeModal(); toast("Notes saved", "success"); renderSection(); });
  }

  function renderReports() {
    headActions.innerHTML = `<button class="btn primary" id="generateReport">Generate Report</button><button class="btn secondary" id="exportReport">Export CSV</button><button class="btn secondary" id="exportPdf">Export PDF</button>`;
    const backup = StorageManager.backup();
    view.innerHTML = `<div class="stat-grid">${Object.entries(backup).filter(([, v]) => Array.isArray(v)).map(([k, v]) => stat(label(k), v.length, "Records stored")).join("")}</div><section class="panel"><h2>Report Summary</h2><p class="muted">A complete frontend report using current LocalStorage records.</p></section>`;
    document.getElementById("generateReport").onclick = () => { StorageManager.insert(COLLECTIONS.REPORTS, { title: "Operations Report", createdAt: new Date().toISOString() }); log("Generated report"); toast("Report generated", "success"); };
    document.getElementById("exportReport").onclick = () => exportCsv({ collection: COLLECTIONS.REPORTS, columns: ["title", "createdAt"], title: "Reports" });
    document.getElementById("exportPdf").onclick = () => { window.print(); toast("Use the print dialog to save as PDF", "success"); };
  }

  function renderAnalytics() {
    view.innerHTML = `<div class="chart-grid wide">${chartCard("Growth", "growthChart")}${chartCard("Revenue", "revenueChart")}${chartCard("Verification", "verificationChart")}${chartCard("Country Distribution", "countryChart")}${chartCard("Top Games", "gamesChart")}</div>`;
    drawCharts(true);
  }

  function renderActivity() {
    view.innerHTML = `<section class="panel"><h2>Activity Timeline</h2><div class="timeline large">${rows(COLLECTIONS.ACTIVITY).map(timeline).join("")}</div></section>`;
  }

  function renderSettings() {
    const s = settings();
    view.innerHTML = `<section class="panel"><form id="settingsForm" class="settings-form"><label>Platform Name<input name="platformName" required value="${esc(s.platformName || "GameVerse")}"></label><label>Admin Name<input name="adminName" required value="${esc(s.adminName || "Admin Xeno")}"></label><label>Theme<select name="theme"><option ${s.theme === "Dark" ? "selected" : ""}>Dark</option><option ${s.theme === "Light" ? "selected" : ""}>Light</option></select></label><label class="check"><input type="checkbox" name="notifications" ${s.notifications ? "checked" : ""}> Notifications</label><label class="check"><input type="checkbox" name="autoBackup" ${s.autoBackup ? "checked" : ""}> Auto Backup</label><button class="btn primary">Save Settings</button></form></section>`;
    document.getElementById("settingsForm").addEventListener("submit", event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target)); data.notifications = event.target.notifications.checked; data.autoBackup = event.target.autoBackup.checked; StorageManager.save(COLLECTIONS.SETTINGS, data); log("Updated platform settings"); toast("Settings saved", "success"); });
  }

  function drawCharts(extra = false) {
    if (!window.Chart) return;
    const users = rows(COLLECTIONS.USERS), influencers = rows(COLLECTIONS.INFLUENCERS), brands = rows(COLLECTIONS.BRANDS), tournaments = rows(COLLECTIONS.TOURNAMENTS), subs = rows(COLLECTIONS.SUBSCRIPTIONS);
    makeChart("userDistribution", "doughnut", ["Users", "Influencers", "Brands"], [users.length, influencers.length, brands.length]);
    makeChart("verificationChart", "pie", ["Approved", "Pending", "Rejected"], [users, influencers, brands].flat().reduce((a, x) => (a[x.status] = (a[x.status] || 0) + 1, a), { Approved: 0, Pending: 0, Rejected: 0 }));
    makeChart("revenueChart", "line", subs.map(x => x.plan), subs.map(x => x.revenue));
    makeChart("tournamentChart", "bar", tournaments.slice(0, 8).map(x => x.game), tournaments.slice(0, 8).map(x => x.teams));
    makeChart("growthChart", "line", ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], [260, 410, 620, 820, 980, users.length + influencers.length + brands.length]);
    if (extra) {
      makeChart("countryChart", "bar", [...new Set(users.map(x => x.country))], [...new Set(users.map(x => x.country))].map(c => users.filter(x => x.country === c).length));
      makeChart("gamesChart", "bar", [...new Set(users.map(x => x.game))], [...new Set(users.map(x => x.game))].map(g => users.filter(x => x.game === g).length));
    }
  }

  function makeChart(id, type, labels, raw) {
    const canvas = document.getElementById(id); if (!canvas) return;
    const data = Array.isArray(raw) ? raw : labels.map(label => raw[label] || 0);
    state.charts.push(new Chart(canvas, { type, data: { labels, datasets: [{ label: "GameVerse", data, borderColor: "#06b6d4", backgroundColor: ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"], tension: 0.35, fill: type === "line" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#f8fafc" } } }, scales: type === "pie" || type === "doughnut" ? {} : { x: { ticks: { color: "#94a3b8" }, grid: { color: "#243244" } }, y: { ticks: { color: "#94a3b8" }, grid: { color: "#243244" } } } } }));
  }

  function filterData(data, key) {
    const search = (state[`${key}Search`] || "").toLowerCase();
    return data.filter(item => Object.values(item).join(" ").toLowerCase().includes(search)).filter(item => cfg[key].filters.every(filter => !state[`${key}${filter}`] || item[filter] === state[`${key}${filter}`]));
  }

  function selectFilter(filter, data, selected = "") {
    const values = [...new Set(data.map(item => item[filter]).filter(Boolean))];
    return `<select id="filter-${filter}" aria-label="Filter by ${filter}"><option value="">All ${label(filter)}</option>${values.map(value => `<option ${value === selected ? "selected" : ""}>${esc(value)}</option>`).join("")}</select>`;
  }

  function globalSearch(value) {
    const box = document.getElementById("globalResults");
    if (!value.trim()) { box.hidden = true; return; }
    const pool = Object.values(cfg).flatMap(meta => rows(meta.collection).map(item => ({ meta, item })));
    const hits = pool.filter(({ item }) => Object.values(item).join(" ").toLowerCase().includes(value.toLowerCase())).slice(0, 8);
    box.innerHTML = hits.map(({ meta, item }) => `<button data-section="${Object.keys(cfg).find(k => cfg[k] === meta)}">${esc(item[meta.name])}<small>${meta.title}</small></button>`).join("") || `<p>No results</p>`;
    box.hidden = false;
    box.querySelectorAll("button").forEach(button => button.onclick = () => { location.hash = button.dataset.section; box.hidden = true; });
  }

  function exportCsv(meta) {
    const data = rows(meta.collection);
    const csv = [meta.columns.join(","), ...data.map(item => meta.columns.map(c => `"${String(item[c] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${meta.title.toLowerCase().replaceAll(" ", "-")}.csv`; a.click(); URL.revokeObjectURL(a.href); toast("CSV exported", "success");
  }

  function importCsv(meta) {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".csv";
    input.onchange = () => { const file = input.files[0]; if (!file) return; file.text().then(text => { const [head, ...lines] = text.trim().split(/\r?\n/); const keys = head.split(","); lines.forEach(line => { const vals = line.split(",").map(v => v.replace(/^"|"$/g, "")); const item = Object.fromEntries(keys.map((k, i) => [k, vals[i] || ""])); StorageManager.insert(meta.collection, item); }); log(`Imported ${lines.length} ${meta.title} records`); toast("CSV imported", "success"); renderSection(); }); };
    input.click();
  }

  function openModal(title, html) { modalRoot.hidden = false; modalRoot.innerHTML = `<div class="modal-backdrop" data-close></div><section class="modal" role="dialog" aria-modal="true"><header><h2>${esc(title)}</h2><button data-close aria-label="Close modal">Close</button></header>${html}</section>`; modalRoot.querySelectorAll("[data-close]").forEach(el => el.onclick = closeModal); }
  function closeModal() { modalRoot.hidden = true; modalRoot.innerHTML = ""; }
  function toast(message, type = "success") { const node = document.createElement("div"); node.className = `toast ${type}`; node.textContent = message; toastStack.appendChild(node); setTimeout(() => node.remove(), 3600); }
  function toggleSelected(id, on) { on ? state.selected.add(id) : state.selected.delete(id); }
  function label(value) { return String(value).replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()); }
  function format(value, key) { if (["price", "revenue", "prizePool"].includes(key)) return money(value); if (key.toLowerCase().includes("date") || key === "createdAt") return date(value); if (key === "status" || key === "priority") return `<span class="badge ${String(value).toLowerCase().replaceAll(" ", "-")}">${esc(value)}</span>`; if (key === "website") return `<a href="${esc(value)}" target="_blank" rel="noreferrer">${esc(value)}</a>`; return esc(value); }
  function emptyRow(cols) { return `<tr><td colspan="${cols}" class="empty">No records found</td></tr>`; }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);

