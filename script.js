/* Header controls and bottom navigation work independently of the page content. */
const menuButton=document.querySelector("#menuButton");
const sideMenu=document.querySelector("#sideMenu");
const menuScrim=document.querySelector("#menuScrim");
const closeMenuButton=document.querySelector("#closeMenu");
const notificationsButton=document.querySelector("#notificationsButton");
const notificationPanel=document.querySelector("#notificationPanel");
const closeNotificationsButton=document.querySelector("#closeNotifications");
const messageDialog=document.querySelector("#messageDialog");
function setMenuOpen(open){
  if(open)setNotificationsOpen(false);
  sideMenu.classList.toggle("open",open);
  menuScrim.classList.toggle("visible",open);
  sideMenu.setAttribute("aria-hidden",String(!open));
  menuButton.setAttribute("aria-expanded",String(open));
}
function setNotificationsOpen(open){
  notificationPanel.classList.toggle("open",open);
  notificationPanel.setAttribute("aria-hidden",String(!open));
  notificationsButton.setAttribute("aria-expanded",String(open));
}
function showMessage(title,body){
  document.querySelector("#messageTitle").textContent=title;
  document.querySelector("#messageBody").textContent=body;
  messageDialog.showModal();
}
menuButton.addEventListener("click",()=>setMenuOpen(true));
closeMenuButton.addEventListener("click",()=>setMenuOpen(false));
menuScrim.addEventListener("click",()=>setMenuOpen(false));
notificationsButton.addEventListener("click",()=>{
  const open=!notificationPanel.classList.contains("open");
  setMenuOpen(false);setNotificationsOpen(open);
});
closeNotificationsButton.addEventListener("click",()=>setNotificationsOpen(false));
document.addEventListener("click",event=>{
  if(!notificationPanel.contains(event.target)&&!notificationsButton.contains(event.target))setNotificationsOpen(false);
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){setMenuOpen(false);setNotificationsOpen(false);}
});
document.querySelector("#messageOk").addEventListener("click",()=>messageDialog.close());
document.querySelector("#searchForm").addEventListener("submit",event=>{
  event.preventDefault();
  const query=document.querySelector("#eventSearch").value.trim();
  showMessage("Search",query?("Your search for “"+query+"” will work when event listings are added."):"Enter an event or place to search.");
});
const menuMessages={
  home:["Home","You are on the home page."],
  categories:["Explore events","Event discovery and categories will be available here."],
  saved:["Saved events","Your saved events will appear here."],
  account:["Profile","Your profile and account settings will be available here."],
  about:["About","Information about this event platform will appear here."]
};
sideMenu.addEventListener("click",event=>{
  const button=event.target.closest("[data-menu-view]");
  if(!button)return;
  setMenuOpen(false);
  const item=menuMessages[button.dataset.menuView];
  if(item)showMessage(item[0],item[1]);
});
document.querySelectorAll("[data-nav-action]").forEach(button=>{
  button.addEventListener("click",()=>{
    const action=button.dataset.navAction;
    document.querySelectorAll(".mobile-nav-link").forEach(link=>{
      const active=link===button;
      link.classList.toggle("active",active);
      if(active)link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
    const messages={
      explore:["Explore","Event discovery and categories will be available here."],
      create:["Create","Event creation will be available here."],
      tickets:["My tickets","Your purchased tickets will appear here."],
      profile:["Profile","Your profile and account settings will be available here."]
    };
    if(action==="home"){
      if(messageDialog.open)messageDialog.close();
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    const item=messages[action];
    if(item)showMessage(item[0],item[1]);
  });
});
