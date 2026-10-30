/* Keep the temporary event catalogue in one place so it can later be replaced by an API. */
const events = [
  {id:1,title:"Golden Hour Festival",category:"Music",date:"2026-11-14",dateLabel:"SAT, NOV 14 · 4:00 PM",location:"Laboma Beach, Accra",price:120,priceLabel:"GH₵ 120",image:"https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=85",description:"A sunset celebration of live music, art, street food, and the people who make Accra unforgettable. Bring your friends and stay for the golden hour.",featured:true},
  {id:2,title:"Infotess Freshers’ Akwaaba",category:"Campus",date:"2026-11-07",dateLabel:"SAT, NOV 7 · 6:00 PM",location:"UEW North Campus, Winneba",price:35,priceLabel:"GH₵ 35",image:"https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85",description:"A welcome party for freshers and returning students. Expect music, games, new connections, and a memorable campus night."},
  {id:3,title:"Accra After Dark",category:"Nightlife",date:"2026-11-21",dateLabel:"SAT, NOV 21 · 9:00 PM",location:"Osu, Accra",price:80,priceLabel:"GH₵ 80",image:"https://images.unsplash.com/photo-1571266028243-d220c9c3b1c4?auto=format&fit=crop&w=900&q=85",description:"A late-night dance experience featuring local DJs, great sound, and a packed dance floor. Valid ID may be required at entry."},
  {id:4,title:"Creative Futures Meetup",category:"Business",date:"2026-11-12",dateLabel:"THU, NOV 12 · 10:00 AM",location:"Impact Hub, Osu",price:25,priceLabel:"GH₵ 25",image:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=85",description:"Meet builders, designers, founders, and curious minds. Share ideas, learn from local creators, and make useful connections."},
  {id:5,title:"Colours of Ghana Art Walk",category:"Arts",date:"2026-11-28",dateLabel:"SAT, NOV 28 · 11:00 AM",location:"Artists Alliance Gallery, Accra",price:40,priceLabel:"GH₵ 40",image:"https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",description:"Explore contemporary Ghanaian creativity through an easy-going art walk, artist conversations, and a celebration of colour and culture."},
  {id:6,title:"Campus Game Night",category:"Campus",date:"2026-11-19",dateLabel:"THU, NOV 19 · 5:30 PM",location:"UEW Main Campus, Winneba",price:15,priceLabel:"GH₵ 15",image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=85",description:"Bring your competitive side to a friendly night of board games, console battles, quizzes, and campus community."}
];

/* Store the current category, search phrase, saved event IDs, and selected ticket count. */
let activeCategory = "All";
let searchTerm = "";
let savedEvents = new Set();
let selectedEvent = null;
let ticketQuantity = 1;
let toastTimer;

/* Cache frequently used page elements so event handlers can update them efficiently. */
const eventGrid = document.querySelector("#eventGrid");
const emptyState = document.querySelector("#emptyState");
const savedCount = document.querySelector("#savedCount");
const ticketDialog = document.querySelector("#ticketDialog");
const messageDialog = document.querySelector("#messageDialog");
const toast = document.querySelector("#toast");

/* Format a number as Ghanaian cedi for ticket prices and checkout totals. */
function money(amount) {
  return new Intl.NumberFormat("en-GH", {style:"currency", currency:"GHS", maximumFractionDigits:2}).format(amount);
}

/* Create a safe, consistent event card from one event object. */
function createEventCard(event) {
  const isSaved = savedEvents.has(event.id);
  const card = document.createElement("article");
  card.className = "event-card";
  card.innerHTML = `
    <div class="event-image-wrap">
      <img class="event-image" src="${event.image}" alt="" loading="lazy">
      <span class="event-category">${event.category}</span>
      <button class="save-event ${isSaved ? "saved" : ""}" data-save="${event.id}" aria-label="${isSaved ? "Remove saved event" : "Save event"}" aria-pressed="${isSaved}"><i class="${isSaved ? "fa-solid" : "fa-regular"} fa-heart"></i></button>
    </div>
    <div class="event-card-content">
      <span class="event-date">${event.dateLabel}</span>
      <h3>${event.title}</h3>
      <p class="event-location"><i class="fa-solid fa-location-dot"></i>${event.location}</p>
      <div class="event-card-bottom">
        <span class="event-price"><small>Tickets from</small>${event.priceLabel}</span>
        <button class="card-book" data-book="${event.id}">Get tickets <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>`;
  return card;
}

/* Filter the event list by selected category, search phrase, and optional saved-only mode. */
function getVisibleEvents(savedOnly = false) {
  return events.filter(event => {
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    const searchableText = `${event.title} ${event.category} ${event.location} ${event.description}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesSaved = !savedOnly || savedEvents.has(event.id);
    return matchesCategory && matchesSearch && matchesSaved;
  });
}

/* Draw the currently matching cards and show an empty message when there are no results. */
function renderEvents(savedOnly = false) {
  const visibleEvents = getVisibleEvents(savedOnly);
  eventGrid.replaceChildren(...visibleEvents.map(createEventCard));
  emptyState.classList.toggle("hidden", visibleEvents.length !== 0);
  document.querySelector("#eventsTitle").textContent = savedOnly ? "Saved events" : "Events";
  if (savedCount) savedCount.textContent = savedEvents.size;
}

/* Display a short message without interrupting the visitor's current task. */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

/* Update the selected category button and refresh the visible event cards. */
document.querySelector("#categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderEvents();
});

/* Filter events as the visitor types, and stop the browser from submitting the search form. */
document.querySelector("#searchForm").addEventListener("submit", event => event.preventDefault());
document.querySelector("#eventSearch").addEventListener("input", event => {
  searchTerm = event.target.value.trim();
  renderEvents();
});

/* Handle clicks on save and ticket buttons through one delegated event listener. */
eventGrid.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  const bookButton = event.target.closest("[data-book]");
  if (saveButton) {
    const id = Number(saveButton.dataset.save);
    if (savedEvents.has(id)) {
      savedEvents.delete(id);
      showToast("Removed from your saved events");
    } else {
      savedEvents.add(id);
      showToast("Event saved for later");
    }
    renderEvents();
  }
  if (bookButton) openTicketDialog(Number(bookButton.dataset.book));
});

/* Open a booking dialog and reset the quantity whenever a new event is selected. */
function openTicketDialog(eventId) {
  selectedEvent = events.find(event => event.id === eventId);
  if (!selectedEvent) return;
  ticketQuantity = 1;
  document.querySelector("#dialogImage").style.backgroundImage = `url("${selectedEvent.image}")`;
  document.querySelector("#dialogCategory").textContent = `${selectedEvent.category.toUpperCase()} · SAMPLE EVENT`;
  document.querySelector("#ticketTitle").textContent = selectedEvent.title;
  document.querySelector("#dialogMeta").textContent = `${selectedEvent.dateLabel}  ·  ${selectedEvent.location}`;
  document.querySelector("#dialogDescription").textContent = selectedEvent.description;
  document.querySelector("#ticketPrice").textContent = money(selectedEvent.price);
  updateTicketTotal();
  ticketDialog.showModal();
}

/* Recalculate the order total whenever the visitor changes the ticket quantity. */
function updateTicketTotal() {
  document.querySelector("#ticketQuantity").textContent = ticketQuantity;
  document.querySelector("#checkoutTotal").textContent = money((selectedEvent?.price || 0) * ticketQuantity);
}

/* Prevent the ticket quantity from going below one or above the allowed limit of eight. */
document.querySelector("#quantityMinus").addEventListener("click", () => {
  ticketQuantity = Math.max(1, ticketQuantity - 1);
  updateTicketTotal();
});
document.querySelector("#quantityPlus").addEventListener("click", () => {
  ticketQuantity = Math.min(8, ticketQuantity + 1);
  updateTicketTotal();
});

/* Explain that checkout is a prototype and no real payment or ticket is created yet. */
document.querySelector("#checkoutButton").addEventListener("click", () => {
  if (!selectedEvent) return;
  ticketDialog.close();
  showMessage("Checkout demo", `Your selection is ${ticketQuantity} ticket(s) for ${selectedEvent.title}, totalling ${money(selectedEvent.price * ticketQuantity)}. This is a front-end demo only: connect a backend and a payment provider before accepting real orders.`);
});

/* Open the featured event from either the hero button or the mobile plus button. */
document.querySelector("#featuredBook")?.addEventListener("click", () => openTicketDialog(1));
document.querySelector("#mobileAdd").addEventListener("click", () => openTicketDialog(1));

/* Show only saved events when the visitor selects a heart shortcut. */
function showSavedEvents() {
  activeCategory = "All";
  searchTerm = "";
  document.querySelector("#eventSearch").value = "";
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
  renderEvents(true);
  document.querySelector("#events").scrollIntoView({behavior:"smooth"});
}
document.querySelector("#savedShortcut")?.addEventListener("click", showSavedEvents);
document.querySelector("#mobileSaved").addEventListener("click", showSavedEvents);

/* Reset search and category filters so the full event catalogue is visible again. */
document.querySelector("#clearFilters").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  document.querySelector("#eventSearch").value = "";
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
  renderEvents();
});

/* Reuse the message dialog for account and event-organizer actions that are not built yet. */
function showMessage(title, body) {
  document.querySelector("#messageTitle").textContent = title;
  document.querySelector("#messageBody").textContent = body;
  messageDialog.showModal();
}
// Account access is available from the header menu on this layout.
document.querySelector("#mobileAccount").addEventListener("click", () => showMessage("Your account", "Account creation, sign-in, and booking history will be added when authentication and the backend are connected."));
document.querySelector("#organizerButton")?.addEventListener("click", () => showMessage("Host an event", "Organizer profiles, event creation, ticket inventory, and sales reports are planned for the next stage."));
document.querySelector("#messageOk").addEventListener("click", () => messageDialog.close());

/* Support the slash keyboard shortcut to focus event search without a mouse. */
document.addEventListener("keydown", event => {
  const targetTag = document.activeElement?.tagName;
  if (event.key === "/" && !["INPUT","TEXTAREA"].includes(targetTag) && !document.activeElement?.isContentEditable) {
    event.preventDefault();
    document.querySelector("#eventSearch").focus();
  }
});

/* Draw the sample event catalogue when the page first loads. */
renderEvents();

/* Open and close the navigation drawer from the three-bar menu button. */
const menuButton = document.querySelector("#menuButton");
const sideMenu = document.querySelector("#sideMenu");
const menuScrim = document.querySelector("#menuScrim");
const closeMenuButton = document.querySelector("#closeMenu");

function setMenuOpen(isOpen) {
  setNotificationsOpen(false);
  sideMenu.classList.toggle("open", isOpen);
  menuScrim.classList.toggle("visible", isOpen);
  sideMenu.setAttribute("aria-hidden", String(!isOpen));
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

menuButton.addEventListener("click", () => setMenuOpen(true));
closeMenuButton.addEventListener("click", () => setMenuOpen(false));
menuScrim.addEventListener("click", () => setMenuOpen(false));

/* Route drawer actions to existing page controls rather than duplicating event logic. */
sideMenu.addEventListener("click", event => {
  const button = event.target.closest("[data-menu-view]");
  if (!button) return;
  const view = button.dataset.menuView;
  setMenuOpen(false);

  if (view === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (view === "categories") {
    document.querySelector("#events").scrollIntoView({ behavior: "smooth" });
  } else if (view === "saved") {
    showSavedEvents();
  } else if (view === "account") {
    showMessage("Your account", "Account creation, sign-in, and booking history will be added when authentication and the backend are connected.");
  } else if (view === "about") {
    showMessage("About this website", "Discover events, review ticket options, and find something worth showing up for.");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") { setMenuOpen(false); setNotificationsOpen(false); }
});

/* Open notifications as a small floating panel, matching the menu interaction. */
const notificationsButton = document.querySelector("#notificationsButton");
const notificationPanel = document.querySelector("#notificationPanel");
const closeNotificationsButton = document.querySelector("#closeNotifications");

function setNotificationsOpen(isOpen) {
  notificationPanel.classList.toggle("open", isOpen);
  notificationPanel.setAttribute("aria-hidden", String(!isOpen));
  notificationsButton.setAttribute("aria-expanded", String(isOpen));
}

notificationsButton.setAttribute("aria-expanded", "false");
notificationsButton.addEventListener("click", () => {
  const shouldOpen = !notificationPanel.classList.contains("open");
  setMenuOpen(false);
  setNotificationsOpen(shouldOpen);
});
closeNotificationsButton.addEventListener("click", () => setNotificationsOpen(false));
document.addEventListener("click", event => {
  if (!notificationPanel.contains(event.target) && !notificationsButton.contains(event.target)) {
    setNotificationsOpen(false);
  }
});

// Keep the empty-state recovery action connected to the same reset behavior as the main filter button.
document.querySelector("#emptyReset")?.addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  document.querySelector("#eventSearch").value = "";
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
  renderEvents();
});

// Route account and footer actions to clear, consistent informational dialogs.
document.querySelector("#headerAccount")?.addEventListener("click", () => {
  showMessage("Your account", "Account creation, sign-in, and booking history will be added when authentication and the backend are connected.");
});
document.querySelector("#footerAbout")?.addEventListener("click", () => {
  showMessage("About Gather", "Gather helps people discover experiences, compare ticket options, and find reasons to come together. This preview uses sample event data and does not process payments.");
});
