"use strict";

const tournaments = [
  { id: 1, name: "BGMI Championship", game: "BGMI", organizer: "GameVerse", startDate: "2026-07-15", endDate: "2026-07-20", deadline: "2026-07-12", status: "Active", registeredTeams: 64, totalTeams: 64, prizePool: 200000, matchesPlayed: 18, description: "National level BGMI tournament for pro and semi-pro teams." },
  { id: 2, name: "Valorant Cup", game: "Valorant", organizer: "Red Bull", startDate: "2026-07-22", endDate: "2026-07-25", deadline: "2026-07-18", status: "Upcoming", registeredTeams: 12, totalTeams: 32, prizePool: 150000, matchesPlayed: 0, description: "Tactical shooter cup with regional qualifiers and a grand final." },
  { id: 3, name: "Free Fire League", game: "Free Fire", organizer: "ASUS", startDate: "2026-07-01", endDate: "2026-07-05", deadline: "2026-06-27", status: "Completed", registeredTeams: 48, totalTeams: 48, prizePool: 100000, matchesPlayed: 24, description: "Mobile battle royale league for verified creator and community squads." },
  { id: 4, name: "COD Masters", game: "CODM", organizer: "AMD", startDate: "2026-06-28", endDate: "2026-06-30", deadline: "2026-06-24", status: "Cancelled", registeredTeams: 10, totalTeams: 16, prizePool: 75000, matchesPlayed: 0, description: "CODM invitational tournament paused by admin review." },
  { id: 5, name: "PUBG Pro Series", game: "PUBG", organizer: "NVIDIA", startDate: "2026-08-10", endDate: "2026-08-15", deadline: "2026-08-05", status: "Upcoming", registeredTeams: 0, totalTeams: 64, prizePool: 250000, matchesPlayed: 0, description: "Professional PUBG series with group stages and finals." },
  { id: 6, name: "Minecraft Build Battle", game: "Minecraft", organizer: "Mojang", startDate: "2026-08-05", endDate: "2026-08-07", deadline: "2026-08-01", status: "Upcoming", registeredTeams: 5, totalTeams: 20, prizePool: 50000, matchesPlayed: 0, description: "Creative build tournament judged on theme, technique, and teamwork." },
  { id: 7, name: "BGMI Rookie Arena", game: "BGMI", organizer: "GameVerse", startDate: "2026-09-02", endDate: "2026-09-08", deadline: "2026-08-28", status: "Upcoming", registeredTeams: 22, totalTeams: 48, prizePool: 125000, matchesPlayed: 0, description: "Entry level BGMI championship for new verified teams." },
  { id: 8, name: "Valorant Elite Clash", game: "Valorant", organizer: "Riot Forge", startDate: "2026-06-12", endDate: "2026-06-16", deadline: "2026-06-08", status: "Completed", registeredTeams: 16, totalTeams: 16, prizePool: 175000, matchesPlayed: 31, description: "High-skill Valorant playoff bracket with seeded teams." },
  { id: 9, name: "Free Fire Night Raid", game: "Free Fire", organizer: "HyperX", startDate: "2026-07-28", endDate: "2026-07-30", deadline: "2026-07-24", status: "Active", registeredTeams: 30, totalTeams: 32, prizePool: 90000, matchesPlayed: 6, description: "Fast-format Free Fire event with nightly matches." },
  { id: 10, name: "CODM Campus Cup", game: "CODM", organizer: "GameVerse", startDate: "2026-08-16", endDate: "2026-08-18", deadline: "2026-08-12", status: "Upcoming", registeredTeams: 18, totalTeams: 32, prizePool: 60000, matchesPlayed: 0, description: "College-focused CODM tournament for student teams." },
  { id: 11, name: "PUBG Weekend War", game: "PUBG", organizer: "AMD", startDate: "2026-07-11", endDate: "2026-07-13", deadline: "2026-07-08", status: "Active", registeredTeams: 40, totalTeams: 48, prizePool: 110000, matchesPlayed: 10, description: "Weekend PUBG tournament with league points and playoff slots." },
  { id: 12, name: "Minecraft Redstone Rally", game: "Minecraft", organizer: "NVIDIA", startDate: "2026-05-18", endDate: "2026-05-20", deadline: "2026-05-12", status: "Completed", registeredTeams: 20, totalTeams: 20, prizePool: 45000, matchesPlayed: 12, description: "Technical Minecraft event focused on redstone builds and automation." }
];

const state = { page: 1, pageSize: 6, selectedId: 1, editingId: null, filtered: [...tournaments] };

const $ = selector => document.querySelector(selector);
const tbody = $("#tournamentTable tbody");

const gameIcons = {
  BGMI: "ri-crosshair-2-line",
  Valorant: "ri-sword-line",
  "Free Fire": "ri-fire-line",
  CODM: "ri-gamepad-line",
  PUBG: "ri-trophy-line",
  Minecraft: "ri-hammer-line"
};

const formatDate = value => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
const formatMoney = value => `INR ${Number(value || 0).toLocaleString("en-IN")}`;
const toast = (message, type = "success") => typeof showToast === "function" ? showToast(message, type) : alert(message);

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getSelected() {
  return tournaments.find(item => item.id === state.selectedId) || state.filtered[0] || tournaments[0];
}

function rowText(item) {
  return [item.name, item.game, item.organizer, item.status, item.startDate, item.endDate].join(" ");
}

function applyFilters(resetPage = true) {
  const global = normalize($("#globalSearch").value);
  const name = normalize($("#nameFilter").value);
  const game = $("#gameFilter").value;
  const status = $("#statusFilter").value;
  const start = $("#startFilter").value;
  const end = $("#endFilter").value;

  state.filtered = tournaments.filter(item => {
    const tournamentStart = item.startDate;
    const tournamentEnd = item.endDate;
    const matchesGlobal = !global || rowText(item).toLowerCase().includes(global);
    const matchesName = !name || item.name.toLowerCase().includes(name) || item.organizer.toLowerCase().includes(name);
    const matchesGame = !game || item.game === game;
    const matchesStatus = !status || item.status === status;
    const matchesStart = !start || tournamentEnd >= start;
    const matchesEnd = !end || tournamentStart <= end;
    return matchesGlobal && matchesName && matchesGame && matchesStatus && matchesStart && matchesEnd;
  });

  if (resetPage) state.page = 1;
  if (!state.filtered.some(item => item.id === state.selectedId) && state.filtered[0]) state.selectedId = state.filtered[0].id;
  render();
}

function renderStats() {
  $("#totalCount").textContent = tournaments.length;
  $("#activeCount").textContent = tournaments.filter(item => item.status === "Active").length;
  $("#upcomingCount").textContent = tournaments.filter(item => item.status === "Upcoming").length;
  $("#completedCount").textContent = tournaments.filter(item => item.status === "Completed").length;
}

function renderTable() {
  const start = (state.page - 1) * state.pageSize;
  const rows = state.filtered.slice(start, start + state.pageSize);

  if (!rows.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No tournaments match the selected filters.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((item, index) => `
    <tr data-id="${item.id}" class="${item.id === state.selectedId ? "active-row" : ""}">
      <td>${start + index + 1}</td>
      <td>${item.name}</td>
      <td><span class="game-cell"><span class="game-icon"><i class="${gameIcons[item.game] || "ri-gamepad-line"}"></i></span>${item.game}</span></td>
      <td>${item.organizer}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${formatDate(item.endDate)}</td>
      <td><span class="badge ${item.status.toLowerCase()}">${item.status}</span></td>
      <td>${item.registeredTeams} / ${item.totalTeams}</td>
      <td><div class="row-actions"><button class="icon-btn" data-view="${item.id}" title="View details"><i class="ri-eye-line"></i></button><button class="icon-btn" data-more="${item.id}" title="Edit tournament"><i class="ri-more-2-fill"></i></button></div></td>
    </tr>`).join("");
}

function renderPagination() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.page > pages) state.page = pages;
  const start = total ? (state.page - 1) * state.pageSize + 1 : 0;
  const end = Math.min(state.page * state.pageSize, total);

  $("#resultSummary").textContent = `${total} result${total === 1 ? "" : "s"}`;
  $("#pageSummary").textContent = `Showing ${start} to ${end} of ${total} results`;
  $("#pagination").innerHTML = [
    `<button type="button" data-page="prev" ${state.page === 1 ? "disabled" : ""}><i class="ri-arrow-left-s-line"></i></button>`,
    ...Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" class="${state.page === i + 1 ? "active" : ""}">${i + 1}</button>`),
    `<button type="button" data-page="next" ${state.page === pages ? "disabled" : ""}><i class="ri-arrow-right-s-line"></i></button>`
  ].join("");
}

function renderDetails() {
  const item = getSelected();
  if (!item) return;

  $("#detailsPanel").innerHTML = `
    <div class="poster"><div><i class="${gameIcons[item.game] || "ri-gamepad-line"}"></i><strong>${item.game}<br>${item.status}</strong></div></div>
    <div>
      <div class="info-list">
        ${detailRow("Tournament Name", item.name)}
        ${detailRow("Game", item.game)}
        ${detailRow("Organizer", item.organizer)}
        ${detailRow("Start Date", formatDate(item.startDate))}
        ${detailRow("End Date", formatDate(item.endDate))}
        ${detailRow("Registration Deadline", formatDate(item.deadline || item.startDate))}
        ${detailRow("Teams Registered", `${item.registeredTeams} / ${item.totalTeams}`)}
        ${detailRow("Prize Pool", formatMoney(item.prizePool))}
        <div class="info-row"><span>Status</span><strong><span class="badge ${item.status.toLowerCase()}">${item.status}</span></strong></div>
      </div>
      <p class="description">${item.description}</p>
    </div>`;

  $("#quickStats").innerHTML = `
    ${quickStat("Total Teams", item.totalTeams)}
    ${quickStat("Registered Teams", item.registeredTeams)}
    ${quickStat("Matches Played", item.matchesPlayed)}
    ${quickStat("Prize Pool", formatMoney(item.prizePool))}`;
}

function detailRow(label, value) {
  return `<div class="info-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function quickStat(label, value) {
  return `<div class="stat-box"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderSearchResults() {
  const box = $("#searchResults");
  const term = normalize($("#globalSearch").value);
  if (!term) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  const matches = tournaments.filter(item => rowText(item).toLowerCase().includes(term)).slice(0, 5);
  box.hidden = false;
  box.innerHTML = matches.length
    ? matches.map(item => `<button type="button" data-result="${item.id}"><span>${item.name}</span><small>${item.game} - ${item.status}</small></button>`).join("")
    : '<button type="button" disabled>No matches found</button>';
}

function render() {
  renderStats();
  renderTable();
  renderPagination();
  renderDetails();
}

function resetAllFilters() {
  ["globalSearch", "nameFilter", "gameFilter", "statusFilter", "startFilter", "endFilter"].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
  $("#searchResults").hidden = true;
  applyFilters(true);
  toast("All filters have been reset", "info");
}

function resetField(target) {
  if (target === "dateRange") {
    $("#startFilter").value = "";
    $("#endFilter").value = "";
  } else {
    const field = document.getElementById(target);
    if (field) field.value = "";
  }
  applyFilters(true);
}

function getField(form, name) {
  return form.elements.namedItem(name);
}

function setField(form, name, value) {
  getField(form, name).value = value;
}

function openModal(item = null) {
  state.editingId = item ? item.id : null;
  $("#modalTitle").textContent = item ? "Edit Tournament" : "Add Tournament";
  $("#formError").textContent = "";
  document.querySelectorAll(".invalid").forEach(field => field.classList.remove("invalid"));
  const form = $("#tournamentForm");
  form.reset();

  if (item) {
    setField(form, "name", item.name);
    setField(form, "game", item.game);
    setField(form, "organizer", item.organizer);
    setField(form, "status", item.status);
    setField(form, "startDate", item.startDate);
    setField(form, "endDate", item.endDate);
    setField(form, "registeredTeams", item.registeredTeams);
    setField(form, "totalTeams", item.totalTeams);
    setField(form, "prizePool", item.prizePool);
    setField(form, "description", item.description);
  }

  $("#tournamentModal").showModal();
}

function closeModal() {
  $("#tournamentModal").close();
}

function validateForm(form) {
  const fields = Array.from(form.querySelectorAll("input, select, textarea"));
  fields.forEach(field => field.classList.remove("invalid"));
  const errors = [];

  fields.forEach(field => {
    if (!field.checkValidity()) {
      field.classList.add("invalid");
      errors.push("Please complete all required fields correctly.");
    }
  });

  const start = getField(form, "startDate").value;
  const end = getField(form, "endDate").value;
  const registered = Number(getField(form, "registeredTeams").value);
  const total = Number(getField(form, "totalTeams").value);

  if (start && end && end < start) {
    getField(form, "endDate").classList.add("invalid");
    errors.push("End date cannot be before start date.");
  }
  if (registered > total) {
    getField(form, "registeredTeams").classList.add("invalid");
    getField(form, "totalTeams").classList.add("invalid");
    errors.push("Registered teams cannot be greater than total teams.");
  }

  return [...new Set(errors)];
}

function saveTournament(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errors = validateForm(form);
  if (errors.length) {
    $("#formError").textContent = errors[0];
    return;
  }

  const payload = {
    name: getField(form, "name").value.trim(),
    game: getField(form, "game").value,
    organizer: getField(form, "organizer").value.trim(),
    status: getField(form, "status").value,
    startDate: getField(form, "startDate").value,
    endDate: getField(form, "endDate").value,
    deadline: getField(form, "startDate").value,
    registeredTeams: Number(getField(form, "registeredTeams").value),
    totalTeams: Number(getField(form, "totalTeams").value),
    prizePool: Number(getField(form, "prizePool").value),
    matchesPlayed: state.editingId ? getSelected().matchesPlayed : 0,
    description: getField(form, "description").value.trim()
  };

  if (state.editingId) {
    const index = tournaments.findIndex(item => item.id === state.editingId);
    tournaments[index] = { ...tournaments[index], ...payload };
    state.selectedId = state.editingId;
    toast("Tournament updated successfully");
  } else {
    const id = Math.max(...tournaments.map(item => item.id)) + 1;
    tournaments.unshift({ id, ...payload });
    state.selectedId = id;
    toast("Tournament added successfully");
  }

  closeModal();
  applyFilters(true);
}

function updateSelectedStatus(status) {
  const item = getSelected();
  if (!item) return;
  item.status = status;
  toast(`Tournament marked as ${status}`);
  applyFilters(false);
}

function deleteSelected() {
  const item = getSelected();
  if (!item) return;
  if (!window.confirm(`Delete ${item.name}?`)) return;
  const index = tournaments.findIndex(row => row.id === item.id);
  tournaments.splice(index, 1);
  state.selectedId = tournaments[0]?.id || null;
  toast("Tournament deleted", "info");
  applyFilters(true);
}

function bindEvents() {
  ["globalSearch", "nameFilter", "gameFilter", "statusFilter", "startFilter", "endFilter"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      if (id === "globalSearch") renderSearchResults();
      applyFilters(true);
    });
  });

  $("#filterBtn").addEventListener("click", () => applyFilters(true));
  $("#resetBtn").addEventListener("click", resetAllFilters);
  document.querySelectorAll(".field-reset").forEach(button => button.addEventListener("click", () => resetField(button.dataset.reset)));
  $("#addTournamentBtn").addEventListener("click", () => openModal());
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  $("#tournamentForm").addEventListener("submit", saveTournament);

  tbody.addEventListener("click", event => {
    const actionButton = event.target.closest("button");
    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    state.selectedId = Number(row.dataset.id);
    if (actionButton?.dataset.more) openModal(getSelected());
    render();
  });

  $("#pagination").addEventListener("click", event => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) return;
    const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
    if (button.dataset.page === "prev") state.page = Math.max(1, state.page - 1);
    else if (button.dataset.page === "next") state.page = Math.min(totalPages, state.page + 1);
    else state.page = Number(button.dataset.page);
    render();
  });

  $("#searchResults").addEventListener("click", event => {
    const button = event.target.closest("button[data-result]");
    if (!button) return;
    state.selectedId = Number(button.dataset.result);
    $("#globalSearch").value = tournaments.find(item => item.id === state.selectedId).name;
    $("#searchResults").hidden = true;
    applyFilters(true);
    document.querySelector(".table-card").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelector(".admin-actions").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "approve") updateSelectedStatus("Active");
    if (button.dataset.action === "reject") updateSelectedStatus("Cancelled");
    if (button.dataset.action === "edit") openModal(getSelected());
    if (button.dataset.action === "delete") deleteSelected();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".global-search")) $("#searchResults").hidden = true;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  applyFilters(true);
});


