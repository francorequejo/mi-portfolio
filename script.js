const items = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.15 });
items.forEach(el => obs.observe(el));

// LÓGICA DE NAVEGACIÓN SPA Y CORTINA
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetAttr = link.getAttribute('href');
    if (targetAttr.startsWith('mailto')) return;
    e.preventDefault();

    const isSubLink = link.classList.contains('sub-link');
    const targetPageId = isSubLink ? link.getAttribute('data-parent') : targetAttr.substring(1);
    const specificSectionId = isSubLink ? targetAttr.substring(1) : null;

    const currentPage = document.querySelector('.view-page.active');
    const targetPage = document.getElementById(targetPageId);
    
    if (!targetPage) return;

    if (currentPage && currentPage.id !== targetPageId) {
       document.body.classList.add('transitioning'); // 1. Baja la cortina
       
       // 2. Esperamos a que la cortina tape absolutamente todo (650ms)
       setTimeout(() => {
         // Cambiamos el contenido en las sombras
         currentPage.classList.remove('active');
         targetPage.classList.add('active');
         window.scrollTo(0,0);

         if (specificSectionId) openAccordionAndScroll(specificSectionId);

         // 1. Limpiamos las animaciones escondidas bajo la cortina
         document.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('show');
            obs.unobserve(el);
         });

         // 2. Subimos la cortina Y AL MISMO TIEMPO disparamos las animaciones
         setTimeout(() => {
            document.body.classList.remove('transitioning'); 
            
            // Recién ahora empezamos a observar para que animen mientras se revela la pantalla
            document.querySelectorAll('.active .reveal').forEach(el => {
               obs.observe(el);
            });
         }, 100); // Le damos un mini margen para que la cortina empiece a subir primero

       }, 650); 

    } else {
       if (specificSectionId) {
          openAccordionAndScroll(specificSectionId);
       } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
       }
    }
  });
});

function openAccordionAndScroll(sectionId) {
   const section = document.getElementById(sectionId);
   if (section) {
      const content = section.querySelector('.toggle-content');
      const btn = section.querySelector('.toggle-btn');
      
      if (content && !content.classList.contains('open')) {
         content.classList.add('open');
         if(btn) btn.classList.add('active');
      }
      
      setTimeout(() => {
         section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
   }
}

// ACORDEONES MANUALES
const toggleButtons = document.querySelectorAll('.toggle-btn');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const content = btn.closest('.section').querySelector('.toggle-content');
    if (content) content.classList.toggle('open');
  });
});

// MODAL PROJECTS (VIDEO - EFECTO MAC)
const modal = document.getElementById("projectModal");
const mAvatar = document.getElementById("mAvatar");
const mTitle = document.getElementById("mTitle");
const mDesc  = document.getElementById("mDesc");
const mVideos = document.getElementById("mVideos");

let autoScrollTimer; 
let isHoveringVideos = false; 

function openModal({ avatar, title, desc, videos, btnElem }) {
  if (avatar) {
    mAvatar.src = avatar; mAvatar.style.display = "block";
  } else {
    mAvatar.src = ""; mAvatar.style.display = "none";
  }
  
  mTitle.textContent = title || "";
  mDesc.innerHTML = desc || ""; 
  mVideos.innerHTML = "";

  (videos || []).forEach((src, index) => {
    const url = src.trim();
    const extension = url.split('.').pop().toLowerCase().split('?')[0];
    let el;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      el = document.createElement("iframe");
      let videoId = "";
      if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      el.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      el.setAttribute("frameborder", "0"); el.setAttribute("allow", "autoplay; fullscreen");
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
      el = document.createElement("img");
      el.src = url;
      if (extension === 'webp') el.classList.add("horizontal-media");
    } else {
      el = document.createElement("video");
      el.src = url; el.controls = true; el.playsInline = true; el.preload = "metadata"; el.autoplay = true; el.muted = true; el.loop = true;
    }

    el.style.transitionDelay = `${0.2 + (index * 0.1)}s`;
    mVideos.appendChild(el);
  });

  const modalCard = document.querySelector(".modal-card");
  const bgColor = btnElem.style.backgroundColor || 'rgba(20,20,20,.85)';
  const borderColor = btnElem.style.borderColor || 'rgba(255,255,255,.15)';
  modalCard.style.background = bgColor;
  modalCard.style.borderColor = borderColor;

  modal.style.visibility = 'hidden';
  modal.classList.add('show'); 
  const modalRect = modalCard.getBoundingClientRect();
  modal.classList.remove('show');
  modal.style.visibility = '';

  const clickX = window.event ? window.event.clientX : window.innerWidth / 2;
  const clickY = window.event ? window.event.clientY : window.innerHeight / 2;
  const modalCenterX = modalRect.left + modalRect.width / 2;
  const modalCenterY = modalRect.top + modalRect.height / 2;

  modalCard.style.setProperty('--dx', `${clickX - modalCenterX}px`);
  modalCard.style.setProperty('--dy', `${clickY - modalCenterY}px`);

  requestAnimationFrame(() => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });

  isHoveringVideos = false; clearInterval(autoScrollTimer); mVideos.scrollTop = 0; 
  setTimeout(() => { autoScrollTimer = setInterval(() => { if (!isHoveringVideos) mVideos.scrollTop += 1; }, 40); }, 800); 
}

function closeModal() {
  modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  mVideos.querySelectorAll("video").forEach(v => { v.pause(); v.currentTime = 0; });
  clearInterval(autoScrollTimer);
}

mVideos.addEventListener("mouseenter", () => isHoveringVideos = true);
mVideos.addEventListener("mouseleave", () => isHoveringVideos = false);
mVideos.addEventListener("touchstart", () => isHoveringVideos = true);
mVideos.addEventListener("touchend", () => { setTimeout(() => isHoveringVideos = false, 2000); });

document.querySelectorAll(".vcard").forEach((btn) => {
  btn.addEventListener("click", () => {
    openModal({ avatar: btn.dataset.avatar, title: btn.dataset.title, desc: btn.dataset.desc, videos: (btn.dataset.videos || "").split(",").filter(Boolean), btnElem: btn });
  });
});

modal.addEventListener("click", (e) => { if (e.target.dataset.close || e.target.classList.contains("modal-x")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("show")) closeModal(); });

// INTRO ANIMATION
const enterBtn = document.getElementById("enterBtn");
const intro = document.getElementById("intro");
const nav = document.querySelector(".nav"); 
const navSticky = document.querySelector(".nav-sticky");

function playMorphAnimation() {
  if (!enterBtn || !nav || !navSticky || document.body.classList.contains("morphing")) return;
  document.body.classList.add("morphing");
  const btnRect = enterBtn.getBoundingClientRect();
  navSticky.style.opacity = "0.01"; const destRect = nav.getBoundingClientRect(); navSticky.style.opacity = ""; 
  const pill = document.createElement("div"); pill.classList.add("morph-pill"); document.body.appendChild(pill);
  pill.style.setProperty("--x", `${btnRect.left}px`); pill.style.setProperty("--y", `${btnRect.top}px`);
  pill.style.setProperty("--w", `${btnRect.width}px`); pill.style.setProperty("--h", `${btnRect.height}px`);
  pill.getBoundingClientRect(); 
  const easeExpand = "cubic-bezier(0.25, 1, 0.5, 1)";
  pill.style.transition = `width 0.5s ${easeExpand}, height 0.5s ${easeExpand}, left 0.5s ${easeExpand}`;
  const expandedLeft = btnRect.left - (destRect.width - btnRect.width) / 2;
  pill.style.setProperty("--w", `${destRect.width}px`); pill.style.setProperty("--h", `${destRect.height}px`); pill.style.setProperty("--x", `${expandedLeft}px`);
  pill.addEventListener("transitionend", function phase1End(e) {
    if (e.propertyName !== "width") return; pill.removeEventListener("transitionend", phase1End);
    const easeUp = "cubic-bezier(0.34, 1.2, 0.64, 1)"; 
    pill.style.transition = `top 0.6s ${easeUp}, left 0.6s ${easeUp}`;
    pill.style.setProperty("--y", `${destRect.top}px`); pill.style.setProperty("--x", `${destRect.left}px`);
    document.body.classList.add("revealing");
    pill.addEventListener("transitionend", function phase2End(e) {
      if (e.propertyName !== "top") return; pill.removeEventListener("transitionend", phase2End);
      document.body.classList.remove("morphing"); document.body.classList.remove("revealing"); document.body.classList.add("entered");
      pill.remove(); if (intro) intro.remove();
    });
  });
}

if (enterBtn) enterBtn.addEventListener("click", playMorphAnimation);
document.addEventListener("keydown", (e) => { if (!document.body.classList.contains("entered") && !document.body.classList.contains("morphing")) { if (e.key === "Enter" || e.key === " ") playMorphAnimation(); } });