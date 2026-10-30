/* Temporary event catalogue. Replace this array with an API when the backend is ready. */
const events = [
  {id:1,title:"Golden Hour Festival",category:"Music",dateLabel:"SAT, NOV 14 · 4:00 PM",location:"Laboma Beach, Accra",price:120,priceLabel:"GH₵ 120",image:"https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85",description:"A sunset celebration of live music, art, street food, and the people who make Accra unforgettable. Bring your friends and stay for the golden hour."},
  {id:2,title:"Infotess Freshers’ Akwaaba",category:"Campus",dateLabel:"SAT, NOV 7 · 6:00 PM",location:"UEW North Campus, Winneba",price:35,priceLabel:"GH₵ 35",image:"https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85",description:"A welcome party for freshers and returning students. Expect music, games, new connections, and a memorable campus night."},
  {id:3,title:"Accra After Dark",category:"Nightlife",dateLabel:"SAT, NOV 21 · 9:00 PM",location:"Osu, Accra",price:80,priceLabel:"GH₵ 80",image:"https://images.unsplash.com/photo-1571266028243-d220c9c3b1c4?auto=format&fit=crop&w=900&q=85",description:"A late-night dance experience featuring local DJs, great sound, and a packed dance floor. Valid ID may be required at entry."},
  {id:4,title:"Creative Futures Meetup",category:"Business",dateLabel:"THU, NOV 12 · 10:00 AM",location:"Impact Hub, Osu",price:25,priceLabel:"GH₵ 25",image:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=85",description:"Meet builders, designers, founders, and curious minds. Share ideas, learn from local creators, and make useful connections."},
  {id:5,title:"Colours of Ghana Art Walk",category:"Arts",dateLabel:"SAT, NOV 28 · 11:00 AM",location:"Artists Alliance Gallery, Accra",price:40,priceLabel:"GH₵ 40",image:"https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",description:"Explore contemporary Ghanaian creativity through an easy-going art walk, artist conversations, and a celebration of colour and culture."},
  {id:6,title:"Campus Game Night",category:"Campus",dateLabel:"THU, NOV 19 · 5:30 PM",location:"UEW Main Campus, Winneba",price:15,priceLabel:"GH₵ 15",image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85",description:"Bring your competitive side to a friendly night of board games, console battles, quizzes, and campus community."}
];

let activeCategory = "All";
let searchTerm = "";
let savedEvents = new Set();
let selectedEvent = null;
let ticketQuantity = 1;
let toastTimer;

const eventGrid = document.querySelector("#eventGrid");
const emptyState = document.querySelector("#emptyState");
const ticketDialog = document.querySelector("#ticketDialog");
const messageDialog = document.querySelector("#messageDialog");
const toast = document.querySelector("#toast");
const searchInput = document.querySelector("#eventSearch");

function money(amount) {
  return new Intl.NumberFormat("en-GH", {style:"currency",currency:"GHS",maximumFractionDigits:2}).format(amount);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function showMessage(title, body) {
  document.querySelector("#messageTitle").textContent = title;
  document.querySelector("#messageBody").textContent = body;
  if (!messageDialog.open) messageDialog.showModal();
}

function createEventCard(event) {
  const saved = savedEvents.has(event.id);
  const card = document.createElement("article");
  card.className = "event-card";
  card.innerHTML = `
    <div class="event-image-wrap">
      <img class="event-image" src="${event.image}" alt="${event.title}" loading="lazy">
      <span class="event-category">${event.category}</span>
      <button class="save-event ${saved ? "saved" : ""}" type="button" data-save="${event.id}" aria-label="${saved ? "Remove saved event" : "Save event"}" aria-pressed="${saved}">
        <i class="${saved ? "fa-solid" : "fa-regular"} fa-heart" aria-hidden="true"></i>
      </button>
    </div>
    <div class="event-card-content">
      <span class="event-date">${event.dateLabel}</span>
      <h3>${event.title}</h3>
      <p class="event-location"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${event.location}</p>
      <div class="event-card-bottom">
        <span class="event-price"><small>Tickets from</small>${event.priceLabel}</span>
        <button class="card-book" type="button" data-book="${event.id}">Get tickets <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>`;
  return card;
}

function renderEvents(savedOnly = false) {
  const visible = events.filter(event => {
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const searchable = `${event.title} ${event.category} ${event.location} ${event.description}`.toLowerCase();
    return matchesCategory && searchable.includes(searchTerm.toLowerCase()) && (!savedOnly || savedEvents.has(event.id));
  });
  eventGrid.replaceChildren(...visible.map(createEventCard));
  emptyState.classList.toggle("hidden", visible.length > 0);
  document.querySelector("#eventsTitle").innerHTML = savedOnly ? 'Your <span>saved events.</span>' : 'Find your next <span>thing.</span>';
  document.querySelectorAll("[data-menu-view='saved']").forEach(button => button.setAttribute("aria-label", `Saved events (${savedEvents.size})`));
}

function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-chip").forEach(chip => {
    const active = chip.dataset.category === category;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
}

function resetFilters() {
  searchTerm = "";
  searchInput.value = "";
  setCategory("All");
  renderEvents();
}

function showSavedEvents() {
  resetFilters();
  renderEvents(true);
  document.querySelector("#events").scrollIntoView({behavior:"smooth",block:"start"});
}

function openTicketDialog(eventId) {
  selectedEvent = events.find(item => item.id === eventId);
  if (!selectedEvent) return;
  ticketQuantity = 1;
  document.querySelector("#dialogImage").style.backgroundImage = `url("${selectedEvent.image}")`;
  document.querySelector("#dialogCategory").textContent = `${selectedEvent.category.toUpperCase()} · SAMPLE EVENT`;
  document.querySelector("#ticketTitle").textContent = selectedEvent.title;
  document.querySelector("#dialogMeta").textContent = `${selectedEvent.dateLabel} · ${selectedEvent.location}`;
  document.querySelector("#dialogDescription").textContent = selectedEvent.description;
  document.querySelector("#ticketPrice").textContent = money(selectedEvent.price);
  updateTicketTotal();
  ticketDialog.showModal();
}

function updateTicketTotal() {
  document.querySelector("#ticketQuantity").textContent = ticketQuantity;
  document.querySelector("#quantityMinus").disabled = ticketQuantity <= 1;
  document.querySelector("#quantityPlus").disabled = ticketQuantity >= 8;
  document.querySelector("#checkoutTotal").textContent = money((selectedEvent?.price || 0) * ticketQuantity);
}

/* Category and search controls update the same event list. */
document.querySelector("#categoryFilters").addEventListener("click", event => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  setCategory(chip.dataset.category);
  renderEvents();
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderEvents();
});

document.querySelector("#searchForm").addEventListener("submit", event => {
  event.preventDefault();
  navigateToPage("explore");
  if (!searchTerm) showToast("Type an event, category, or location to search.");
  else showToast(`Showing results for “${searchTerm}”`);
});

document.addEventListener("keydown", event => {
  const tag = document.activeElement?.tagName;
  if (event.key === "/" && !["INPUT","TEXTAREA"].includes(tag) && !document.activeElement?.isContentEditable) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }
});

/* Save and ticket actions use one listener for all event cards. */
eventGrid.addEventListener("click", event => {
  const save = event.target.closest("[data-save]");
  const book = event.target.closest("[data-book]");
  if (save) {
    const id = Number(save.dataset.save);
    if (savedEvents.has(id)) {
      savedEvents.delete(id);
      showToast("Removed from saved events");
    } else {
      savedEvents.add(id);
      showToast("Event saved");
    }
    renderEvents();
  }
  if (book) openTicketDialog(Number(book.dataset.book));
});

document.querySelector("#clearFilters").addEventListener("click", resetFilters);
document.querySelector("#quantityMinus").addEventListener("click", () => {
  ticketQuantity = Math.max(1, ticketQuantity - 1);
  updateTicketTotal();
});
document.querySelector("#quantityPlus").addEventListener("click", () => {
  ticketQuantity = Math.min(8, ticketQuantity + 1);
  updateTicketTotal();
});
document.querySelector("#checkoutButton").addEventListener("click", () => {
  if (!selectedEvent) return;
  const total = money(selectedEvent.price * ticketQuantity);
  const title = selectedEvent.title;
  ticketDialog.close();
  showMessage("Checkout preview", `You selected ${ticketQuantity} ticket(s) for ${title}. Total: ${total}. This is a demo only; no order, ticket, or payment has been created.`);
});
document.querySelector("#messageOk").addEventListener("click", () => messageDialog.close());

/* Header menu and notification panels. */
const menuButton = document.querySelector("#menuButton");
const sideMenu = document.querySelector("#sideMenu");
const menuScrim = document.querySelector("#menuScrim");
const notificationsButton = document.querySelector("#notificationsButton");
const notificationPanel = document.querySelector("#notificationPanel");

function setMenuOpen(open) {
  if (open) setNotificationsOpen(false);
  sideMenu.classList.toggle("open", open);
  menuScrim.classList.toggle("visible", open);
  sideMenu.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

function setNotificationsOpen(open) {
  notificationPanel.classList.toggle("open", open);
  notificationPanel.setAttribute("aria-hidden", String(!open));
  notificationsButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => setMenuOpen(!sideMenu.classList.contains("open")));
document.querySelector("#closeMenu").addEventListener("click", () => setMenuOpen(false));
menuScrim.addEventListener("click", () => setMenuOpen(false));
notificationsButton.addEventListener("click", () => setNotificationsOpen(!notificationPanel.classList.contains("open")));
document.querySelector("#closeNotifications").addEventListener("click", () => setNotificationsOpen(false));

document.addEventListener("click", event => {
  if (!notificationPanel.contains(event.target) && !notificationsButton.contains(event.target)) setNotificationsOpen(false);
});

function navigateToPage(page) {
  const validPages = ["home","explore","create","tickets","profile"];
  if (!validPages.includes(page)) return;
  document.querySelectorAll(".app-page").forEach(view => {
    const active = view.dataset.page === page;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  document.querySelectorAll("[data-nav-action]").forEach(button => {
    const active = button.dataset.navAction === page;
    button.classList.toggle("active", active);
    if (active) {
      button.setAttribute("aria-current","page");
      button.setAttribute("aria-label", page === "create" ? "Create page, current page" : button.querySelector("span")?.textContent + ", current page");
    } else {
      button.removeAttribute("aria-current");
      if (button.dataset.navAction === "create") button.setAttribute("aria-label","Create page");
    }
  });
  document.querySelector("#categoryStrip").classList.toggle("is-hidden", page !== "explore");
  if (page !== "explore") searchInput.value = "";
  window.scrollTo({top:0,behavior:"smooth"});
  document.body.dataset.currentPage = page;
}

sideMenu.addEventListener("click", event => {
  const button = event.target.closest("[data-menu-view]");
  if (!button) return;
  const action = button.dataset.menuView;
  setMenuOpen(false);
  if (["home","categories","saved"].includes(action)) {
    navigateToPage(action === "categories" || action === "saved" ? "explore" : "home");
    if (action === "saved") showSavedEvents();
  }
  if (action === "account") navigateToPage("profile");
  if (action === "about") showMessage("About this site", "A considered space to discover events, manage bookings, and bring people together.");
});

document.querySelectorAll("[data-nav-action]").forEach(button => {
  button.addEventListener("click", () => navigateToPage(button.dataset.navAction));
});
document.querySelectorAll("[data-go-page]").forEach(button => {
  button.addEventListener("click", () => navigateToPage(button.dataset.goPage));
});

document.querySelector("#createEventForm").addEventListener("submit", event => {
  event.preventDefault();
  showMessage("Event details saved", "The event form is ready for the next stage. Publishing and ticket sales will be connected when the backend is added.");
});

document.querySelector("#profileAppearance").addEventListener("click", () => {
  setMenuOpen(true);
  document.querySelector("#themeToggle").focus();
});

function applyTheme(theme) {
  const light = theme === "light";
  document.documentElement.dataset.theme = light ? "light" : "dark";
  document.body.dataset.theme = light ? "light" : "dark";
  const toggle = document.querySelector("#themeToggle");
  toggle.checked = light;
  toggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  document.querySelector("#themeSwitchLabel").textContent = light ? "Light" : "Dark";
  document.querySelector('meta[name="theme-color"]').content = light ? "#f4f5f7" : "#050505";
}
const savedTheme = (() => { try { return localStorage.getItem("ticketsystem-theme"); } catch { return null; } })();
applyTheme(savedTheme === "light" ? "light" : "dark");
document.querySelector("#themeToggle").addEventListener("change", event => {
  const theme = event.target.checked ? "light" : "dark";
  applyTheme(theme);
  try { localStorage.setItem("ticketsystem-theme", theme); } catch {}
});

renderEvents();
navigateToPage("home");
