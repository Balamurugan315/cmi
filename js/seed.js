"use strict";

const GameVerseSeed = (() => {
  const now = Date.now();
  const daysAgo = days => new Date(now - days * 86400000).toISOString();

  const names = ["NovaByte", "RiftQueen", "ClutchLord", "PixelViper", "AceForge", "StormRush", "NeonKai", "FrostNinja", "BlazeRex", "ShadowMint", "OrbitLynx", "HexaPrime"];
  const countries = ["India", "United States", "Singapore", "Germany", "Brazil", "Japan", "UAE", "Canada"];
  const games = ["Valorant", "BGMI", "CS2", "Fortnite", "Dota 2", "Apex Legends", "Free Fire"];
  const statuses = ["Pending", "Approved", "Rejected", "Changes Requested"];

  const users = Array.from({ length: 42 }, (_, index) => {
    const status = statuses[index % statuses.length];
    const name = names[index % names.length] + (index + 7);
    return {
      id: `usr-${1000 + index}`,
      name,
      email: `${name.toLowerCase()}@gameverse.gg`,
      phone: `9${String(100000000 + index * 9137).slice(0, 9)}`,
      role: index % 3 === 0 ? "Player" : index % 3 === 1 ? "Caster" : "Coach",
      country: countries[index % countries.length],
      game: games[index % games.length],
      status,
      notes: status === "Rejected" ? "Document mismatch detected." : "",
      createdAt: daysAgo(index + 1)
    };
  });

  const influencers = Array.from({ length: 28 }, (_, index) => ({
    id: `inf-${2000 + index}`,
    name: `${names[(index + 2) % names.length]} Live`,
    email: `creator${index + 1}@gameverse.gg`,
    platform: ["YouTube", "Twitch", "Instagram", "Kick"][index % 4],
    subscribers: 25000 + index * 13750,
    views: 180000 + index * 64100,
    engagement: `${(4.2 + (index % 8) / 10).toFixed(1)}%`,
    country: countries[index % countries.length],
    status: statuses[index % statuses.length],
    notes: "",
    createdAt: daysAgo(index + 3)
  }));

  const brands = ["HyperX", "Riot Forge", "ROG Arena", "Pulse Energy", "SteelSeries", "Logitech G", "AMD Arena", "NVIDIA Shield", "Red Bull", "Secretlab"].map((brand, index) => ({
    id: `brd-${3000 + index}`,
    company: brand,
    contact: `${brand.split(" ")[0].toLowerCase()}-ops@brand.gg`,
    website: `https://www.${brand.toLowerCase().replaceAll(" ", "")}.com`,
    industry: ["Hardware", "Publisher", "Energy", "Accessories", "Chairs"][index % 5],
    revenue: 900000 + index * 275000,
    campaigns: 3 + index,
    country: countries[index % countries.length],
    status: statuses[index % statuses.length],
    notes: "",
    createdAt: daysAgo(index + 5)
  }));

  const tournaments = Array.from({ length: 18 }, (_, index) => ({
    id: `trn-${4000 + index}`,
    title: `${games[index % games.length]} Championship ${2026 - (index % 2)}`,
    game: games[index % games.length],
    prizePool: 50000 + index * 15000,
    teams: 8 + (index % 5) * 4,
    winner: index % 3 === 0 ? "TBD" : `${names[index % names.length]} Squad`,
    country: countries[index % countries.length],
    status: ["Upcoming", "Live", "Completed", "Cancelled"][index % 4],
    startDate: daysAgo(9 - index),
    createdAt: daysAgo(index + 2)
  }));

  const subscriptions = [
    { id: "sub-1", plan: "Starter", price: 499, subscribers: 320, status: "Active" },
    { id: "sub-2", plan: "Pro Team", price: 1499, subscribers: 168, status: "Active" },
    { id: "sub-3", plan: "Creator Plus", price: 2499, subscribers: 92, status: "Active" },
    { id: "sub-4", plan: "Enterprise Arena", price: 9999, subscribers: 31, status: "Active" }
  ].map((item, index) => ({ ...item, revenue: item.price * item.subscribers, createdAt: daysAgo(index + 4) }));

  const supportTickets = Array.from({ length: 26 }, (_, index) => ({
    id: `tkt-${5000 + index}`,
    subject: ["Payment failed", "Verification delay", "Tournament slot issue", "Brand campaign query", "Login problem"][index % 5],
    requester: users[index % users.length].name,
    priority: ["Low", "Medium", "High", "Critical"][index % 4],
    assignee: ["Admin Xeno", "Ops Mira", "Support Kai"][index % 3],
    status: ["Open", "Pending", "Resolved"][index % 3],
    country: countries[index % countries.length],
    createdAt: daysAgo(index + 1)
  }));

  const activityLogs = [
    "Seeded platform database",
    "Approved user NovaByte7",
    "Created Valorant Championship",
    "Resolved ticket tkt-5001",
    "Updated subscription Pro Team"
  ].map((action, index) => ({
    id: `log-${6000 + index}`,
    action,
    admin: index ? "Admin Xeno" : "System",
    createdAt: daysAgo(index)
  }));

  const reports = [];

  const settings = {
    platformName: "GameVerse",
    theme: "Dark",
    notifications: true,
    autoBackup: true,
    adminName: "Admin Xeno"
  };

  const init = () => StorageManager.seedIfEmpty({
    [COLLECTIONS.USERS]: users,
    [COLLECTIONS.INFLUENCERS]: influencers,
    [COLLECTIONS.BRANDS]: brands,
    [COLLECTIONS.TOURNAMENTS]: tournaments,
    [COLLECTIONS.SUBSCRIPTIONS]: subscriptions,
    [COLLECTIONS.SUPPORT]: supportTickets,
    [COLLECTIONS.ACTIVITY]: activityLogs,
    [COLLECTIONS.REPORTS]: reports,
    [COLLECTIONS.SETTINGS]: settings
  });

  return { init };
})();

GameVerseSeed.init();

