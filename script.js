/* Keep the header and footer controls working independently of the removed page content. */
const menuButton = document.querySelector("#menuButton");
const sideMenu = document.querySelector("#sideMenu");
const menuScrim = document.querySelector("#menuScrim");
const closeMenuButton = document.querySelector("#closeMenu");
const notificationsButton = document.querySelector("#notificationsButton");
const notificationPanel = document.querySelector("#notificationPanel");
const closeNotificationsButton = document.querySelector("#closeNotifications");
const messageDialog = document.querySelector("#messageDialog");

function setMenuOpen(isOpen) {
  if (isOpen) setNotificationsOpen(false);
  sideMenu.classList.toggle("open", isOpen);
  menuScrim.classList.toggle("visible", isOpen);
  sideMenu.setAttribute("aria-hidden", String(!isOpen));
  menuButton.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}
function setNotificationsOpen(isOpen) {
  notificationPanel.classList.toggle("open", isOpen);
  notificationPanel.setAttribute("aria-hidden", String(!isOpen));
  notificationsButton.setAttribute("aria-expanded", String(isOpen));
}
function showMessage(title, body) {
  document.querySelector("#messageTitle").textContent = title;
  document.querySelector("#messageBody").textContent = body;
  messageDialog.showModal();
}

menuButton.addEventListener("click", () => setMenuOpen(true));
closeMenuButton.addEventListener("click", () => setMenuOpen(false));
menuScrim.addEventListener("click", () => setMenuOpen(false));
notificationsButton.addEventListener("click", () => {
  const shouldOpen = !notificationPanel.classList.contains("open");
  setMenuOpen(false);
  setNotificationsOpen(shouldOpen);
});
closeNotificationsButton.addEventListener("click", () => setNotificationsOpen(false));
document.addEventListener("click", event => {
  if (!notificationPanel.contains(event.target) && !notificationsButton.contains(event.target)) setNotificationsOpen(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }
});
document.querySelector("#footerAbout").addEventListener("click", () => {
  showMessage("About Gather", "Gather helps people discover experiences and find reasons to come together. This preview is being prepared.");
});
document.querySelector("#messageOk").addEventListener("click", () => messageDialog.close());
sideMenu.addEventListener("click", event => {
  const button = event.target.closest("[data-menu-view]");
  if (!button) return;
  setMenuOpen(false);
  const view = button.dataset.menuView;
  const messages = {
    home: ["Home", "The event discovery page will be added here."],
    categories: ["Explore events", "Event categories and listings will be added here."],
    saved: ["Saved events", "Your saved events will be available here."],
    account: ["Your account", "Sign-in, account settings, and booking history will be added here."]
  };
  if (view === "about") showMessage("About Gather", "Gather helps people discover experiences and find reasons to come together. This preview is being prepared.");
  else if (messages[view]) showMessage(messages[view][0], messages[view][1]);
});
