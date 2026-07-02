"use strict";

/*=========================================================
                GAMEVERSE DASHBOARD
=========================================================*/

//document.addEventListener("DOMContentLoaded", initializeDashboard);

/*=========================================================
                INITIALIZE
=========================================================*/

function initializeDashboard() {

    loadStatistics();

    renderDashboard();
    initializeSearch();
    initializeNotifications();
    initializeMail();
    initializeLogout();
    initializeCharts();

}

/*=========================================================
                LOCAL STORAGE DATA
=========================================================*/

let users = Storage.load(COLLECTIONS.USERS);

let influencers = Storage.load(COLLECTIONS.INFLUENCERS);

let brands = Storage.load(COLLECTIONS.BRANDS);

let tournaments = Storage.load(COLLECTIONS.TOURNAMENTS);

let subscriptions = Storage.load(COLLECTIONS.SUBSCRIPTIONS);

let supportTickets = Storage.load(COLLECTIONS.SUPPORT_TICKETS);

let activityLogs = Storage.load(COLLECTIONS.ACTIVITY_LOGS);

let analytics = Storage.load(COLLECTIONS.ANALYTICS);

/*=========================================================
                DOM ELEMENTS
=========================================================*/

const totalUsers = document.getElementById("totalUsers");

const totalPlayers = document.getElementById("totalPlayers");

const totalInfluencers = document.getElementById("totalInfluencers");

const totalBrands = document.getElementById("totalBrands");

const totalTournaments = document.getElementById("totalTournaments");

const totalRevenue = document.getElementById("totalRevenue");

const pendingRequests = document.getElementById("pendingRequests");

const openTickets = document.getElementById("openTickets");

const pendingUsersCount = document.getElementById("pendingUsersCount");

const pendingInfluencersCount = document.getElementById("pendingInfluencersCount");

const pendingBrandsCount = document.getElementById("pendingBrandsCount");

const pendingTournamentCount = document.getElementById("pendingTournamentCount");

const dashboardRevenue = document.getElementById("dashboardRevenue");

const monthlyGrowth = document.getElementById("monthlyGrowth");

const activeUsers = document.getElementById("activeUsers");

/*=========================================================
                LOAD STATISTICS
=========================================================*/

function loadStatistics() {

    totalUsers.textContent = users.length;

    totalPlayers.textContent =

        users.filter(

            user => user.verified

        ).length;

    totalInfluencers.textContent =

        influencers.length;

    totalBrands.textContent =

        brands.length;

    totalTournaments.textContent =

        tournaments.length;

    totalRevenue.textContent =

        "₹" +

        calculateRevenue()

        .toLocaleString();

    dashboardRevenue.textContent =

        "₹" +

        calculateRevenue()

        .toLocaleString();

    openTickets.textContent =

        supportTickets.filter(

            ticket => ticket.status !== "Resolved"

        ).length;

    const pendingUsers = users.filter(

        user => user.status === "Pending"

    ).length;

    const pendingInfluencers = influencers.filter(

        influencer => influencer.status === "Pending"

    ).length;

    const pendingBrands = brands.filter(

        brand => brand.status === "Pending"

    ).length;

    const pendingTournament = tournaments.filter(

        tournament => tournament.status === "Pending"

    ).length;

    pendingUsersCount.textContent = pendingUsers;

    pendingInfluencersCount.textContent = pendingInfluencers;

    pendingBrandsCount.textContent = pendingBrands;

    pendingTournamentCount.textContent = pendingTournament;

    pendingRequests.textContent =

        pendingUsers +

        pendingInfluencers +

        pendingBrands +

        pendingTournament;

    if (analytics) {

        activeUsers.textContent =

            analytics.activeUsers || 0;

        monthlyGrowth.textContent =

            "+12%";

    }

}

/*=========================================================
                CALCULATE REVENUE
=========================================================*/

function calculateRevenue() {

    let revenue = 0;

    subscriptions.forEach(plan => {

        revenue +=

            plan.monthly *

            plan.users;

    });

    return revenue;

}

/*=========================================================
                DASHBOARD RENDER
=========================================================*/

function renderDashboard() {

    renderRecentUsers();

    renderTournamentTable();

    renderActivityLogs();

}


/*=========================================================
                RECENT USERS TABLE
=========================================================*/

function renderRecentUsers() {

    const tableBody = document.getElementById("recentUsersBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const recentUsers = [...users]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    recentUsers.forEach(user => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                <strong>${user.username}</strong><br>

                <small>${user.email}</small>

            </td>

            <td>${user.game}</td>

            <td>${user.country}</td>

            <td>

                <span class="status ${user.status.toLowerCase()}">

                    ${user.status}

                </span>

            </td>

            <td>${user.joined}</td>

        `;

        tableBody.appendChild(row);

    });

}

/*=========================================================
                TOURNAMENT TABLE
=========================================================*/

function renderTournamentTable() {

    const tableBody = document.getElementById("tournamentBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    tournaments.forEach(tournament => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                <strong>${tournament.name}</strong>

            </td>

            <td>${tournament.game}</td>

            <td>${tournament.organizer}</td>

            <td>

                ₹${Number(tournament.prizePool).toLocaleString()}

            </td>

            <td>

                <span class="status ${tournament.status.toLowerCase()}">

                    ${tournament.status}

                </span>

            </td>

        `;

        tableBody.appendChild(row);

    });

}

/*=========================================================
                ACTIVITY LOGS
=========================================================*/

function renderActivityLogs() {

    const activityContainer =

        document.getElementById("activityList");

    if (!activityContainer) return;

    activityContainer.innerHTML = "";

    const recentLogs = [...activityLogs]
        .sort((a, b) => b.id - a.id)
        .slice(0, 8);

    recentLogs.forEach(log => {

        const activity = document.createElement("div");

        activity.className = "activity-item";

        activity.innerHTML = `

            <div class="activity-icon">

                <i class="ri-history-line"></i>

            </div>

            <div class="activity-info">

                <h4>${log.action}</h4>

                <p>

                    ${log.admin}

                    •

                    ${log.module}

                </p>

                <span class="activity-time">

                    ${log.date}

                    ${log.time}

                </span>

            </div>

        `;

        activityContainer.appendChild(activity);

    });

}

/*=========================================================
                DASHBOARD SUMMARY
=========================================================*/

function refreshDashboard() {

    users = Storage.load(COLLECTIONS.USERS);

    influencers = Storage.load(COLLECTIONS.INFLUENCERS);

    brands = Storage.load(COLLECTIONS.BRANDS);

    tournaments = Storage.load(COLLECTIONS.TOURNAMENTS);

    subscriptions = Storage.load(COLLECTIONS.SUBSCRIPTIONS);

    supportTickets = Storage.load(COLLECTIONS.SUPPORT_TICKETS);

    activityLogs = Storage.load(COLLECTIONS.ACTIVITY_LOGS);

    analytics = Storage.load(COLLECTIONS.ANALYTICS);

    loadStatistics();

    renderRecentUsers();

    renderTournamentTable();

    renderActivityLogs();

}

/*=========================================================
                SEARCH FUNCTION
=========================================================*/

function initializeSearch() {

    const searchBox = document.getElementById("dashboardSearch");

    if (!searchBox) return;

    searchBox.addEventListener("keyup", function () {

        const value = this.value.toLowerCase();

        const rows = document.querySelectorAll("#recentUsersBody tr");

        rows.forEach(row => {

            const text = row.textContent.toLowerCase();

            row.style.display =

                text.includes(value)

                ? ""

                : "none";

        });

    });

}

/*=========================================================
                NOTIFICATION BUTTON
=========================================================*/

function initializeNotifications() {

    const notificationBtn =

        document.getElementById("notificationBtn");

    if (!notificationBtn) return;

    notificationBtn.addEventListener("click", () => {

        alert(

            "🔔 You have " +

            pendingRequests.textContent +

            " pending verification requests."

        );

    });

}

/*=========================================================
                MAIL BUTTON
=========================================================*/

function initializeMail() {

    const mailBtn =

        document.getElementById("mailBtn");

    if (!mailBtn) return;

    mailBtn.addEventListener("click", () => {

        alert(

            "📧 Inbox feature will be available soon."

        );

    });

}

/*=========================================================
                LOGOUT BUTTON
=========================================================*/

function initializeLogout() {

    const logoutBtn =

        document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", function (e) {

        e.preventDefault();

        const confirmLogout =

            confirm(

                "Are you sure you want to logout?"

            );

        if (confirmLogout) {

            alert("Logged out successfully.");

            window.location.href =

                "../index.html";

        }

    });

}

/*=========================================================
                REFRESH BUTTON (OPTIONAL)
=========================================================*/

function refreshData() {

    refreshDashboard();

}

/*=========================================================
                FORMAT CURRENCY
=========================================================*/

function formatCurrency(value) {

    return "₹" +

        Number(value).toLocaleString(

            "en-IN"

        );

}

/*=========================================================
                FORMAT DATE
=========================================================*/

function formatDate(date) {

    const d = new Date(date);

    return d.toLocaleDateString(

        "en-IN"

    );

}

/*=========================================================
                TOTAL PENDING
=========================================================*/

function getTotalPending() {

    return (

        users.filter(

            u => u.status === "Pending"

        ).length +

        influencers.filter(

            i => i.status === "Pending"

        ).length +

        brands.filter(

            b => b.status === "Pending"

        ).length +

        tournaments.filter(

            t => t.status === "Pending"

        ).length

    );

}

/*=========================================================
                WINDOW EVENTS
=========================================================*/

window.addEventListener("focus", () => {

    refreshDashboard();

});

/*=========================================================
                INITIALIZE EVENTS
=========================================================*/
/*
initializeSearch();

initializeNotifications();

initializeMail();

initializeLogout();*/
/*=========================================================
                    CHARTS
=========================================================*/

let userPieChart;
let verificationPieChart;
let revenueChart;
let tournamentChart;
let growthChart;

/*=========================================================
                    INITIALIZE CHARTS
=========================================================*/

function initializeCharts() {

    createUserPieChart();

    createVerificationPieChart();

    createRevenueChart();

    createTournamentChart();

    createGrowthChart();

}

/*=========================================================
                USER DISTRIBUTION PIE
=========================================================*/

function createUserPieChart() {

    const ctx = document
        .getElementById("userPieChart")
        .getContext("2d");

    userPieChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [

                "Users",

                "Influencers",

                "Brands"

            ],

            datasets: [{

                data: [

                    users.length,

                    influencers.length,

                    brands.length

                ],

                backgroundColor: [

                    "#7C3AED",

                    "#06B6D4",

                    "#22C55E"

                ],

                borderColor: "#1F2937",

                borderWidth: 2

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "#F8FAFC"

                    }

                }

            }

        }

    });

}

/*=========================================================
            VERIFICATION STATUS PIE
=========================================================*/

function createVerificationPieChart() {

    const approved =

        users.filter(u => u.status === "Approved").length +

        influencers.filter(i => i.status === "Approved").length +

        brands.filter(b => b.status === "Approved").length;

    const pending =

        users.filter(u => u.status === "Pending").length +

        influencers.filter(i => i.status === "Pending").length +

        brands.filter(b => b.status === "Pending").length;

    const rejected =

        users.filter(u => u.status === "Rejected").length +

        influencers.filter(i => i.status === "Rejected").length +

        brands.filter(b => b.status === "Rejected").length;

    const ctx = document
        .getElementById("verificationPieChart")
        .getContext("2d");

    verificationPieChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [

                "Approved",

                "Pending",

                "Rejected"

            ],

            datasets: [{

                data: [

                    approved,

                    pending,

                    rejected

                ],

                backgroundColor: [

                    "#22C55E",

                    "#F59E0B",

                    "#EF4444"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "#F8FAFC"

                    }

                }

            }

        }

    });

}

/*=========================================================
                REVENUE LINE CHART
=========================================================*/

function createRevenueChart() {

    const ctx = document
        .getElementById("revenueChart")
        .getContext("2d");

    revenueChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: [

                "Jan",

                "Feb",

                "Mar",

                "Apr",

                "May",

                "Jun"

            ],

            datasets: [{

                label: "Revenue",

                data: [

                    80000,

                    110000,

                    150000,

                    180000,

                    230000,

                    calculateRevenue()

                ],

                borderColor: "#7C3AED",

                backgroundColor: "rgba(124,58,237,.2)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "#F8FAFC"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#94A3B8"

                    }

                },

                y: {

                    ticks: {

                        color: "#94A3B8"

                    }

                }

            }

        }

    });

}

/*=========================================================
                TOURNAMENT BAR
=========================================================*/

function createTournamentChart() {

    const ctx = document
        .getElementById("tournamentChart")
        .getContext("2d");

    tournamentChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels:

                tournaments.map(

                    t => t.game

                ),

            datasets: [{

                label: "Registered Teams",

                data:

                    tournaments.map(

                        t => t.registered

                    ),

                backgroundColor: "#06B6D4"

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "#F8FAFC"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#94A3B8"

                    }

                },

                y: {

                    ticks: {

                        color: "#94A3B8"

                    }

                }

            }

        }

    });

}

/*=========================================================
                USER GROWTH LINE
=========================================================*/

function createGrowthChart() {

    const ctx = document
        .getElementById("growthChart")
        .getContext("2d");

    growthChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: [

                "Jan",

                "Feb",

                "Mar",

                "Apr",

                "May",

                "Jun"

            ],

            datasets: [{

                label: "Users",

                data: [

                    200,

                    420,

                    680,

                    900,

                    1200,

                    users.length

                ],

                borderColor: "#22C55E",

                backgroundColor: "rgba(34,197,94,.2)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: "#F8FAFC"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#94A3B8"

                    }

                },

                y: {

                    ticks: {

                        color: "#94A3B8"

                    }

                }

            }

        }

    });

}
/*=========================================================
            REFRESH ALL CHARTS
=========================================================*/

function refreshCharts() {

    if (userPieChart)
        userPieChart.destroy();

    if (verificationPieChart)
        verificationPieChart.destroy();

    if (revenueChart)
        revenueChart.destroy();

    if (tournamentChart)
        tournamentChart.destroy();

    if (growthChart)
        growthChart.destroy();

    initializeCharts();

}

/*=========================================================
            REFRESH COMPLETE DASHBOARD
=========================================================*/

function refreshDashboard() {

    users = Storage.load(COLLECTIONS.USERS);

    influencers = Storage.load(COLLECTIONS.INFLUENCERS);

    brands = Storage.load(COLLECTIONS.BRANDS);

    tournaments = Storage.load(COLLECTIONS.TOURNAMENTS);

    subscriptions = Storage.load(COLLECTIONS.SUBSCRIPTIONS);

    supportTickets = Storage.load(COLLECTIONS.SUPPORT_TICKETS);

    activityLogs = Storage.load(COLLECTIONS.ACTIVITY_LOGS);

    analytics = Storage.load(COLLECTIONS.ANALYTICS);

    loadStatistics();

    renderRecentUsers();

    renderTournamentTable();

    renderActivityLogs();

    refreshCharts();

}

/*=========================================================
            AUTO REFRESH
=========================================================*/

setInterval(() => {

    refreshDashboard();

}, 10000);

/*=========================================================
            STORAGE SYNC
=========================================================*/

window.addEventListener("storage", () => {

    refreshDashboard();

});

/*=========================================================
            WINDOW RESIZE
=========================================================*/

window.addEventListener("resize", () => {

    if (

        userPieChart ||

        verificationPieChart ||

        revenueChart ||

        tournamentChart ||

        growthChart

    ) {

        refreshCharts();

    }

});

/*=========================================================
            ERROR HANDLING
=========================================================*/

window.addEventListener("error", function (event) {

    console.error(

        "Dashboard Error:",

        event.message

    );

});

/*=========================================================
            ONLINE / OFFLINE
=========================================================*/

window.addEventListener("offline", () => {

    console.warn(

        "Application is Offline"

    );

});

window.addEventListener("online", () => {

    console.log(

        "Application is Online"

    );

});

/*=========================================================
            DASHBOARD INFO
=========================================================*/

console.log(

    "%cGameVerse Dashboard Loaded",

    "color:#7C3AED;font-size:18px;font-weight:bold;"

);

console.log(

    "Users :", users.length

);

console.log(

    "Influencers :", influencers.length

);

console.log(

    "Brands :", brands.length

);

console.log(

    "Tournaments :", tournaments.length

);

/*=========================================================
            FINAL INITIALIZATION
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    try {

        initializeDashboard();

    }

    catch (error) {

        console.error(

            error

        );

    }

});