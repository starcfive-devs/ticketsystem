/* Sample events are kept in one catalogue until a real event database is connected. */
const events = [
 {id:1,title:"Infotess Freshers’ Akwaaba",category:"Campus",date:"2026-11-07",dateLabel:"SATURDAY, NOVEMBER 7 · 6:00 PM",location:"UEW North Campus, Winneba",price:35,image:"https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85",description:"A welcome celebration for freshers and returning students. Come meet new people, enjoy music, and start the semester with a good memory.",host:"Infotess",tagline:"Come at your own risk.\nWear something nice."},
 {id:2,title:"Golden Hour Festival",category:"Music",date:"2026-11-14",dateLabel:"SATURDAY, NOVEMBER 14 · 4:00 PM",location:"Laboma Beach, Accra",price:120,image:"https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85",description:"An open-air celebration of Ghanaian music, art, street food, and good company as the sun goes down.",host:"Golden Hour",tagline:"Music, art and good energy."},
 {id:3,title:"Accra After Dark",category:"Nightlife",date:"2026-11-21",dateLabel:"SATURDAY, NOVEMBER 21 · 9:00 PM",location:"Osu, Accra",price:80,image:"https://images.unsplash.com/photo-1571266028243-d220c9c3b1c4?auto=format&fit=crop&w=1200&q=85",description:"A late-night dance experience with local DJs, carefully selected sounds, and a dance floor built for a good night out.",host:"After Dark",tagline:"Your night, your sound."},
 {id:4,title:"Creative Futures Meetup",category:"Business",date:"2026-11-12",dateLabel:"THURSDAY, NOVEMBER 12 · 10:00 AM",location:"Impact Hub, Osu",price:25,image:"https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=85",description:"A relaxed meetup for designers, developers, founders, and people building new ideas. Make connections and learn from one another.",host:"Creative Futures",tagline:"Meet the people building what’s next."},
 {id:5,title:"Colours of Ghana Art Walk",category:"Arts",date:"2026-11-28",dateLabel:"SATURDAY, NOVEMBER 28 · 11:00 AM",location:"Artists Alliance Gallery, Accra",price:40,image:"https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",description:"Spend the day exploring contemporary Ghanaian art, meeting creatives, and enjoying a walk through colour and culture.",host:"Ghana Art Walk",tagline:"See the stories behind the art."},
 {id:6,title:"Campus Game Night",category:"Campus",date:"2026-11-19",dateLabel:"THURSDAY, NOVEMBER 19 · 5:30 PM",location:"UEW Main Campus, Winneba",price:15,image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85",description:"Bring your friends for board games, console battles, quizzes, and a relaxed evening with the campus community.",host:"Campus Socials",tagline:"Play a little. Meet a lot."}
];
let activeCategory="All", searchTerm="", selectedEvent=null, quantity=1, saved=new Set(), followed=new Set(), purchased=[];
const $=s=>document.querySelector(s);
const feed=$("#eventFeed"), empty=$("#emptyState"), ticketDialog=$("#ticketDialog"), messageDialog=$("#messageDialog");
function money(value){return new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS",maximumFractionDigits:2}).format(value)}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("visible"),2400)}
function visibleEvents(){return events.filter(e=>(activeCategory==="All"||e.category===activeCategory)&&[e.title,e.category,e.location,e.description,e.host].join(" ").toLowerCase().includes(searchTerm.toLowerCase()))}
function eventCard(e){
 const article=document.createElement("article");article.className="event-card";
 const liked=saved.has(e.id), isFollowing=followed.has(e.id);
 article.innerHTML=`<div class="event-cover" style="background-image:url('${e.image}')">
  <div class="cover-top"><span class="category-tag">${e.category}</span><span class="profile-mini"><span class="profile-avatar"><i class="fa-solid fa-user"></i></span><span>${e.host}</span></span></div>
  <div class="cover-copy"><div class="cover-date">${e.dateLabel}</div><h2>${e.title}</h2><p>${e.tagline}</p></div>
 </div>
 <div class="event-actions">
  <button class="action-button ${liked?"liked":""}" data-save="${e.id}" aria-label="${liked?"Unsave":"Save"} event" aria-pressed="${liked}"><i class="${liked?"fa-solid":"fa-regular"} fa-heart"></i></button>
  <button class="action-button" data-info="${e.id}" aria-label="Event details"><i class="fa-solid fa-comment-dots"></i></button>
  <button class="action-button" data-share="${e.id}" aria-label="Share event"><i class="fa-solid fa-share"></i></button>
  <button class="follow-button ${isFollowing?"following":""}" data-follow="${e.id}">${isFollowing?"Following":"Follow"}</button>
 </div>
 <div class="event-detail-strip"><div class="event-detail-text"><strong><i class="fa-regular fa-calendar"></i> &nbsp;${e.dateLabel.split(" · ")[0]}</strong><span><i class="fa-solid fa-location-dot"></i> &nbsp;${e.location}</span></div><div class="ticket-price"><small>Tickets from</small>${money(e.price)}</div><button class="buy-button" data-book="${e.id}">Buy ticket</button></div>`;
 return article;
}
function render(){const list=visibleEvents();feed.replaceChildren(...list.map(eventCard));empty.hidden=list.length>0;feed.hidden=list.length===0}
function openTickets(id){selectedEvent=events.find(e=>e.id===id);if(!selectedEvent)return;quantity=1;$("#ticketCover").style.backgroundImage="url('"+selectedEvent.image+"')";$("#ticketCategory").textContent=selectedEvent.category.toUpperCase()+" · EVENT TICKET";$("#ticketTitle").textContent=selectedEvent.title;$("#ticketMeta").textContent=selectedEvent.dateLabel+" · "+selectedEvent.location;$("#ticketDescription").textContent=selectedEvent.description;$("#ticketPrice").textContent=money(selectedEvent.price);updateTotal();ticketDialog.showModal()}
function updateTotal(){$("#ticketQuantity").textContent=quantity;$("#checkoutTotal").textContent=money((selectedEvent?.price||0)*quantity)}
function message(title,body){$("#messageTitle").textContent=title;$("#messageText").textContent=body;messageDialog.showModal()}
function closeMenu(){$("#sideMenu").classList.remove("open");$("#sideMenu").setAttribute("aria-hidden","true");$("#scrim").classList.remove("visible")}
function showView(view){
 closeMenu();$("#home").hidden=view!=="home";$("#secondaryView").hidden=view==="home";
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 if(view==="home"){window.scrollTo({top:0,behavior:"smooth"});return}
 const titles={categories:"Categories",tickets:"My tickets",account:"Account",about:"About Gather"};
 const intros={categories:"Browse the kinds of events you enjoy.",tickets:"Your saved booking confirmations will appear here.",account:"Your profile and event activity.",about:"A simple place to discover events and get your ticket."};
 $("#viewTitle").textContent=titles[view]||"Gather";$("#viewOverline").textContent=view==="tickets"?"YOUR BOOKINGS":"YOUR GATHER";$("#viewIntro").textContent=intros[view]||"";
 const content=$("#viewContent");content.replaceChildren();
 if(view==="categories"){const grid=document.createElement("div");grid.className="category-grid";["Music","Campus","Nightlife","Arts","Business"].forEach(c=>{const b=document.createElement("button");b.innerHTML='<span class="category-icon"><i class="'+({Music:"fa-solid fa-music",Campus:"fa-solid fa-graduation-cap",Nightlife:"fa-solid fa-moon",Arts:"fa-solid fa-palette",Business:"fa-solid fa-lightbulb"}[c])+'"></i></span><span>'+c+'</span>';b.addEventListener("click",()=>{activeCategory=c;$("#eventSearch").value="";searchTerm="";render();showView("home");$("#home").scrollIntoView({behavior:"smooth"})});grid.append(b)});content.append(grid)}
 if(view==="tickets"){const list=document.createElement("div");list.className="ticket-list";if(!purchased.length){const p=document.createElement("p");p.className="about-copy";p.textContent="You haven't booked a ticket in this demo yet. Browse an event and choose Buy ticket to start.";list.append(p)}else purchased.forEach(t=>{const item=document.createElement("article");item.className="ticket-list-item";item.innerHTML='<h3>'+t.title+'</h3><p>'+t.dateLabel+' · '+t.location+'</p><p>'+t.quantity+' ticket(s) · '+money(t.total)+'</p><button>Booking reference: '+t.ref+'</button>';list.append(item)});content.append(list)}
 if(view==="account"){const p=document.createElement("p");p.className="about-copy";p.textContent="Your profile, saved events, and bookings belong here. Sign-in and account creation will be connected when authentication is added.";content.append(p)}
 if(view==="about"){const p=document.createElement("p");p.className="about-copy";p.textContent="Gather helps people discover events, connect with organizers, and buy tickets in one place. This is a design prototype; events and bookings are sample data until a backend and payment provider are connected.";content.append(p)}
 $("#secondaryView").scrollIntoView({behavior:"smooth",block:"start"});
}
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();searchTerm=$("#eventSearch").value.trim();render();$("#home").scrollIntoView({behavior:"smooth"})});
$("#eventSearch").addEventListener("input",e=>{searchTerm=e.target.value.trim();if(!$("#home").hidden)render()});
feed.addEventListener("click",async e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.book)openTickets(Number(b.dataset.book));
 if(b.dataset.save){const id=Number(b.dataset.save);saved.has(id)?saved.delete(id):saved.add(id);render();toast(saved.has(id)?"Event saved":"Removed from saved events")}
 if(b.dataset.follow){const id=Number(b.dataset.follow);followed.has(id)?followed.delete(id):followed.add(id);render();toast(followed.has(id)?"You're following this organizer":"Unfollowed organizer")}
 if(b.dataset.info){const ev=events.find(x=>x.id===Number(b.dataset.info));message(ev.title,ev.description+"\n\n"+ev.dateLabel+" · "+ev.location+"\nTickets from "+money(ev.price)+".");}
 if(b.dataset.share){const ev=events.find(x=>x.id===Number(b.dataset.share));const shareText=ev.title+" — "+ev.dateLabel+" at "+ev.location;if(navigator.share){try{await navigator.share({title:ev.title,text:shareText})}catch{}}else if(navigator.clipboard){try{await navigator.clipboard.writeText(shareText);toast("Event details copied")}catch{message("Share event",shareText)}}else message("Share event",shareText)}
});
document.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;searchTerm="";$("#eventSearch").value="";render();showView("home");$("#home").scrollIntoView({behavior:"smooth"})}));
$("#quantityMinus").addEventListener("click",()=>{quantity=Math.max(1,quantity-1);updateTotal()});
$("#quantityPlus").addEventListener("click",()=>{quantity=Math.min(8,quantity+1);updateTotal()});
$("#checkoutButton").addEventListener("click",()=>{if(!selectedEvent)return;const booking={title:selectedEvent.title,dateLabel:selectedEvent.dateLabel,location:selectedEvent.location,quantity,total:selectedEvent.price*quantity,ref:"DEMO-"+Math.random().toString(36).slice(2,8).toUpperCase()};purchased.unshift(booking);ticketDialog.close();message("Booking preview created","Your demo booking for "+booking.quantity+" ticket(s) to "+booking.title+" totals "+money(booking.total)+". Reference: "+booking.ref+". No payment was taken and this is not a valid entry ticket. A backend and payment integration are needed for real purchases.");});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$( "#"+b.dataset.close).close()));
$("#menuButton").addEventListener("click",()=>{$("#sideMenu").classList.add("open");$("#sideMenu").setAttribute("aria-hidden","false");$("#scrim").classList.add("visible")});
$("#closeMenu").addEventListener("click",closeMenu);$("#scrim").addEventListener("click",closeMenu);
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#backHome").addEventListener("click",()=>showView("home"));
$("#browseButton").addEventListener("click",()=>{activeCategory="All";searchTerm="";$("#eventSearch").value="";render();showView("home");$("#eventFeed").scrollIntoView({behavior:"smooth"})});
$("#locationButton").addEventListener("click",()=>message("Events in Ghana","Browse events in Winneba, Accra, and other locations. Location filtering can be connected to the event database later."));
$("#notificationsButton").addEventListener("click",()=>message("Notifications","Updates about followed organizers, new events, and your ticket bookings will appear here."));
$("#organizerButton").addEventListener("click",()=>message("Become an organizer","Organizer registration, event submissions, ticket inventory, and sales management will be connected in a later stage."));
$("#resetSearch").addEventListener("click",()=>{activeCategory="All";searchTerm="";$("#eventSearch").value="";render()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){e.preventDefault();$("#eventSearch").focus()}});
render();
