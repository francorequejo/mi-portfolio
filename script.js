// ----------------------------------------------------
// 1. OBSERVERS (REVEAL)
// ----------------------------------------------------
const items = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.15 });
items.forEach(el => obs.observe(el));

// ----------------------------------------------------
// 2. LÓGICA DE NAVEGACIÓN SPA Y CORTINA
// ----------------------------------------------------
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
       document.body.classList.add('transitioning');
       setTimeout(() => {
         currentPage.classList.remove('active');
         targetPage.classList.add('active');
         window.scrollTo(0,0);
         if (specificSectionId) openAccordionAndScroll(specificSectionId);
         document.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('show');
            obs.unobserve(el);
         });
         setTimeout(() => {
            document.body.classList.remove('transitioning'); 
            document.querySelectorAll('.active .reveal').forEach(el => {
               obs.observe(el);
            });
         }, 100); 
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
      setTimeout(() => { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
   }
}

// ----------------------------------------------------
// 3. ACORDEONES Y FILTROS
// ----------------------------------------------------
const toggleButtons = document.querySelectorAll('.toggle-btn');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const content = btn.closest('.section').querySelector('.toggle-content');
    if (content) content.classList.toggle('open');
  });
});

const toggleFiltersBtn = document.getElementById("toggleFilters");
const filterPanel = document.getElementById("filterPanel");
const filterCheckboxes = document.querySelectorAll(".filter-chk");
const cards = document.querySelectorAll(".floating-card");

if (toggleFiltersBtn) {
  toggleFiltersBtn.addEventListener("click", () => {
    filterPanel.classList.toggle("hidden");
  });
}
filterCheckboxes.forEach(chk => { chk.addEventListener("change", applyFilters); });

function applyFilters() {
  const checkedValues = Array.from(filterCheckboxes).filter(chk => chk.checked).map(chk => chk.value);
  cards.forEach(card => {
    if (checkedValues.length === 0) { card.style.display = "block"; return; }
    const cardTags = card.getAttribute("data-tags") ? card.getAttribute("data-tags").split(",") : [];
    const matches = checkedValues.some(val => cardTags.includes(val));
    card.style.display = matches ? "block" : "none";
  });
}

// ----------------------------------------------------
// 4. GALERÍA AMPLIADA (LIGHTBOX)
// ----------------------------------------------------
let lightbox = document.getElementById('lightbox');
if (!lightbox) {
  lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button">✕</button>
    <div class="lightbox-content">
      <img id="lightbox-img" src="" alt="Galería ampliada">
      <video id="lightbox-video" controls autoplay muted loop playsinline></video>
    </div>
    <button class="lightbox-prev" type="button">&#10094;</button>
    <button class="lightbox-next" type="button">&#10095;</button>
  `;
  document.body.appendChild(lightbox);
}

const lbImg = document.getElementById('lightbox-img');
const lbVideo = document.getElementById('lightbox-video');
const lbPrev = document.querySelector('.lightbox-prev');
const lbNext = document.querySelector('.lightbox-next');
const lbClose = document.querySelector('.lightbox-close');

let currentGalleryUrls = [];
let currentGalleryIndex = 0;

function getExt(url) {
  return url.split('.').pop().toLowerCase().split('?')[0];
}

function openLightbox(urls, index) {
  currentGalleryUrls = urls;
  currentGalleryIndex = index;
  updateLightboxContent();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; 
  if (urls.length <= 1) {
    lbPrev.style.display = 'none';
    lbNext.style.display = 'none';
  } else {
    lbPrev.style.display = 'flex';
    lbNext.style.display = 'flex';
  }
}

function updateLightboxContent() {
  const url = currentGalleryUrls[currentGalleryIndex];
  const ext = getExt(url);
  const isVideo = ['mp4', 'mov', 'webm'].includes(ext);
  
  lbVideo.pause();
  lbVideo.src = "";
  lbImg.src = "";
  lbVideo.style.display = 'none';
  lbImg.style.display = 'none';
  
  if (isVideo) {
    lbVideo.style.display = 'block';
    lbVideo.src = url;
    lbVideo.load();
    lbVideo.play().catch(e => console.log("Auto-play blocked"));
  } else {
    lbImg.style.display = 'block';
    lbImg.src = url;
  }
}

function navigateLightbox(direction) {
  currentGalleryIndex = (currentGalleryIndex + direction + currentGalleryUrls.length) % currentGalleryUrls.length;
  updateLightboxContent();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  lbVideo.pause();
  lbVideo.src = "";
  if (document.getElementById("projectModal").classList.contains('show')) {
     document.body.style.overflow = 'hidden'; 
  } else {
     document.body.style.overflow = ''; 
  }
}

lbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-content')) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (currentGalleryUrls.length > 1) {
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
  }
});

// ----------------------------------------------------
// 5. MODAL PROJECTS Y CARRUSELES 
// ----------------------------------------------------
const modal = document.getElementById("projectModal");
const mTitle = document.getElementById("mTitle");
const mDesc  = document.getElementById("mDesc");
const mTagsContainer = document.getElementById("mTags"); 
const mVideos = document.getElementById("mVideos");

let autoScrollTimer; 
let isHoveringVideos = false; 

function createSingleMedia(url, isGridItem = true) {
  const extension = getExt(url);
  let el;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    el = document.createElement("iframe");
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    el.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    el.setAttribute("frameborder", "0"); el.setAttribute("allow", "autoplay; fullscreen");
    if (isGridItem) el.classList.add("horizontal-media"); 
  } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
    el = document.createElement("img"); el.src = url;
    if (extension === 'webp' && isGridItem) el.classList.add("horizontal-media");
  } else {
    el = document.createElement("video");
    el.src = url; el.controls = true; el.playsInline = true; el.preload = "metadata"; el.autoplay = true; el.muted = true; el.loop = true;
  }
  return el;
}

function renderModalMedia(mediaString) {
  mVideos.innerHTML = "";
  if (!mediaString) return;
  
  const chunks = mediaString.split(",");
  chunks.forEach((chunk, index) => {
    chunk = chunk.trim();
    if (!chunk) return;
    
    if (chunk.startsWith("[CAROUSEL")) {
       const isReverse = chunk.startsWith("[CAROUSEL-REV]");
       const urlsStr = chunk.replace(/\[CAROUSEL(-REV)?\]/, "");
       const urls = urlsStr.split("|").map(u => u.trim()); 
       
       // Solo agregamos la clase para que el CSS de arriba sepa a quién separar
      const wrapper = document.createElement("div");
      wrapper.className = "modal-carousel-wrapper horizontal-media";
       wrapper.style.transitionDelay = `${0.2 + (index * 0.1)}s`;
       
       const track = document.createElement("div");
       track.className = isReverse ? "track marketing-track" : "track"; 
       track.style.animationPlayState = "paused";
       
       wrapper.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
       wrapper.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
       
       const allItems = [...urls, ...urls]; 
       const mediaPromises = [];

       allItems.forEach((u, itemIndex) => {
          let el = createSingleMedia(u, false);
          
          const box = document.createElement("div");
          // Volvemos al margen original de 20px que tenías
          box.style.cssText = "display: inline-block; height: 250px; margin-right: 20px; vertical-align: middle;";
          
          const tagName = el.tagName;
          if (tagName === 'IMG' || tagName === 'VIDEO') {
            // SI ES IMAGEN (Caso Santa Paula): Le ponemos el fix de tamaño
            if (tagName === 'IMG') {
               el.style.cssText = "display: block; height: 100%; width: 200px; object-fit: cover; border-radius: 12px; cursor: zoom-in;";
            } 
            // SI ES VIDEO (Tus otros trabajos): Lo dejamos tal cual lo tenías originalmente
            else {
               el.style.cssText = "display: block; height: 100%; width: auto; max-width: 80vw; border-radius: 12px; cursor: zoom-in;";
            }

            el.addEventListener('click', (e) => {
              if (tagName === 'VIDEO' && el.controls) return;
              e.preventDefault();
              openLightbox(urls, itemIndex % urls.length);
            });
          }
          
          if (tagName === 'VIDEO') { 
              el.controls = false; el.muted = true; el.autoplay = true; el.loop = true; el.style.pointerEvents = "auto"; 
          }
          
          box.appendChild(el);
          track.appendChild(box);

          if (tagName === 'IMG') {
            mediaPromises.push(new Promise(resolve => {
              if (el.complete) resolve();
              else { el.onload = resolve; el.onerror = resolve; }
            }));
          }
       });
       
       wrapper.appendChild(track);
       mVideos.appendChild(wrapper);

       Promise.all(mediaPromises).then(() => {
          track.style.animationPlayState = "running";
       });
       
    } else {
       let el = createSingleMedia(chunk, true);
       el.style.transitionDelay = `${0.2 + (index * 0.1)}s`;
       
       if(el.tagName === 'IMG' || el.tagName === 'VIDEO'){
         el.style.cursor = "zoom-in";
         el.addEventListener('click', (e) => {
           if (el.tagName === 'VIDEO' && el.controls) return;
           e.preventDefault();
           openLightbox([chunk], 0);
         });
       }
       mVideos.appendChild(el);
    }
  });
}

function openModal(btnElem) {
  let currentLang = 'es';
  if (document.body.classList.contains('lang-fr')) currentLang = 'fr';
  if (document.body.classList.contains('lang-en')) currentLang = 'en';

  const themeColor = btnElem.dataset.color || '#419c91';
  modal.style.setProperty('--theme-color', themeColor);
  const isLight = themeColor === '#ffffff' || themeColor === '#f79226';
  modal.style.setProperty('--tag-text-color', isLight ? '#000' : '#fff');

  mTitle.textContent = btnElem.getAttribute(`data-title-${currentLang}`) || "";
  if (mDesc) mDesc.innerHTML = btnElem.getAttribute(`data-desc-${currentLang}`) || ""; 
  
  if (mTagsContainer) {
    mTagsContainer.innerHTML = "";
    const tags = (btnElem.dataset.tags || "").split(",").filter(Boolean);
    const tagNames = {
      es: { "edicion": "Edición de Video", "marketing": "Marketing Digital", "diseno": "Diseño Digital", "copywriting": "Copywriting", "escritos": "Escritos" },
      fr: { "edicion": "Montage Vidéo", "marketing": "Marketing Digital", "diseno": "Design Numérique", "copywriting": "Conception-rédaction", "escritos": "Écrits" },
      en: { "edicion": "Video Editing", "marketing": "Digital Marketing", "diseno": "Digital Design", "copywriting": "Copywriting", "escritos": "Writings" }
    };
    tags.forEach((tag, index) => {
      const btn = document.createElement("button");
      btn.className = "modal-tag-btn";
      btn.innerText = tagNames[currentLang][tag] || tag;
      btn.addEventListener("click", () => {
        mTagsContainer.querySelectorAll(".modal-tag-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // LE AVISA AL CSS QUE ESTAMOS EN COPYWRITING PARA CAMBIAR EL DISEÑO
        mVideos.className = "modal-right tag-" + tag;
        
        renderModalMedia(btnElem.getAttribute("data-" + tag));
      });
      mTagsContainer.appendChild(btn);
      if (index === 0) btn.click();
    });
  }

  const modalCard = document.querySelector(".modal-card");
  modalCard.style.background = btnElem.style.backgroundColor || 'rgba(20,20,20,.85)';
  modalCard.style.borderColor = btnElem.style.borderColor || 'rgba(255,255,255,.15)';

  modal.style.visibility = 'hidden';
  modal.classList.add('show'); 
  const modalRect = modalCard.getBoundingClientRect();
  modal.classList.remove('show');
  modal.style.visibility = '';

  const clickX = window.event ? window.event.clientX : window.innerWidth / 2;
  const clickY = window.event ? window.event.clientY : window.innerHeight / 2;
  modalCard.style.setProperty('--dx', `${clickX - (modalRect.left + modalRect.width / 2)}px`);
  modalCard.style.setProperty('--dy', `${clickY - (modalRect.top + modalRect.height / 2)}px`);

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

document.querySelectorAll(".vcard").forEach((btn) => { btn.addEventListener("click", () => { openModal(btn); }); });
modal.addEventListener("click", (e) => { if (e.target.dataset.close || e.target.classList.contains("modal-x")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("show")) closeModal(); });


// ----------------------------------------------------
// 6. INTRO Y MULTILENGUAJE 
// ----------------------------------------------------
const langBtns = document.querySelectorAll(".lang-btn");
const intro = document.getElementById("intro");
const nav = document.querySelector(".nav"); 
const navSticky = document.querySelector(".nav-sticky");

function playMorphAnimation(btnElement) {
  if (!btnElement || !nav || !navSticky || document.body.classList.contains("morphing")) return;
  document.body.classList.add("morphing");
  
  const btnRect = btnElement.getBoundingClientRect();
  navSticky.style.opacity = "0.01"; const destRect = nav.getBoundingClientRect(); navSticky.style.opacity = ""; 
  
  const pill = document.createElement("div"); pill.classList.add("morph-pill"); document.body.appendChild(pill);
  pill.style.setProperty("--x", `${btnRect.left}px`); pill.style.setProperty("--y", `${btnRect.top}px`);
  pill.style.setProperty("--w", `${btnRect.width}px`); pill.style.setProperty("--h", `${btnRect.height}px`);
  pill.getBoundingClientRect(); 
  
  const easeExpand = "cubic-bezier(0.25, 1, 0.5, 1)";
  pill.style.transition = `width 0.5s ${easeExpand}, height 0.5s ${easeExpand}, left 0.5s ${easeExpand}`;
  pill.style.setProperty("--w", `${destRect.width}px`); 
  pill.style.setProperty("--h", `${destRect.height}px`); 
  pill.style.setProperty("--x", `${destRect.left}px`); 
  
  pill.addEventListener("transitionend", function phase1End(e) {
    if (e.propertyName !== "width") return; pill.removeEventListener("transitionend", phase1End);
    const easeUp = "cubic-bezier(0.34, 1.2, 0.64, 1)"; 
    pill.style.transition = `top 0.6s ${easeUp}, left 0.6s ${easeUp}`;
    pill.style.setProperty("--y", `${destRect.top}px`); 
    document.body.classList.add("revealing");
    pill.addEventListener("transitionend", function phase2End(e) {
      if (e.propertyName !== "top") return; pill.removeEventListener("transitionend", phase2End);
      document.body.classList.remove("morphing"); document.body.classList.remove("revealing"); document.body.classList.add("entered");
      pill.remove(); if (intro) intro.remove();
    });
  });
}

langBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    document.body.className = ""; document.body.classList.add("lang-" + lang);
    playMorphAnimation(btn);
  });
});

document.addEventListener("keydown", (e) => { 
  if (!document.body.classList.contains("entered") && !document.body.classList.contains("morphing")) { 
    if (e.key === "Enter" || e.key === " ") { const btnEs = document.querySelector('[data-lang="es"]'); if (btnEs) btnEs.click(); } 
  } 
});


// ----------------------------------------------------
// 7. SISTEMA DE PARTÍCULAS MAGNÉTICAS 
// ----------------------------------------------------
const canvas = document.createElement('canvas');
canvas.id = 'magicCanvas';
canvas.style.position = 'fixed';
canvas.style.top = '0'; canvas.style.left = '0';
canvas.style.width = '100vw'; canvas.style.height = '100vh';
canvas.style.pointerEvents = 'none'; canvas.style.zIndex = '9995'; 
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
let width, height;

function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

let mouse = { x: -1000, y: -1000 };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; for(let i = 0; i < 2; i++) { createParticle('mouse'); } });

const particles = [];
function getPerimeterPoint(rect, spread) {
  const perimeter = 2 * rect.width + 2 * rect.height; let v = Math.random() * perimeter; let px, py;
  if (v < rect.width) { px = rect.left + v; py = rect.top; } 
  else if (v < rect.width + rect.height) { px = rect.right; py = rect.top + (v - rect.width); } 
  else if (v < 2 * rect.width + rect.height) { px = rect.right - (v - rect.width - rect.height); py = rect.bottom; } 
  else { px = rect.left; py = rect.bottom - (v - 2 * rect.width - rect.height); }
  return { x: px + (Math.random() - 0.5) * spread, y: py + (Math.random() - 0.5) * spread };
}

function createParticle(type) {
  const isEntered = document.body.classList.contains('entered');
  const rgb = isEntered ? '255, 255, 255' : '0, 0, 0'; 
  let p = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, radius: Math.random() * 1.2 + 0.3, color: rgb, alpha: Math.random() * 0.5 + 0.5, life: 1, decay: Math.random() * 0.02 + 0.01, type: type };

  if (type === 'mouse') {
    p.x = mouse.x + (Math.random() - 0.5) * 15; p.y = mouse.y + (Math.random() - 0.5) * 15; p.vx = (Math.random() - 0.5) * 1; p.vy = (Math.random() - 0.5) * 1; p.decay = 0.03;
  } else if (type === 'bg') { 
    const edge = Math.floor(Math.random() * 3);
    if (edge === 0) { p.x = Math.random() * width; p.y = height + 5; p.vx = (Math.random() - 0.5) * 0.5; p.vy = -Math.random() * 1 - 0.5; } 
    else if (edge === 1) { p.x = -5; p.y = Math.random() * height; p.vx = Math.random() * 1 + 0.5; p.vy = (Math.random() - 0.5) * 0.5; } 
    else { p.x = width + 5; p.y = Math.random() * height; p.vx = -Math.random() * 1 - 0.5; p.vy = (Math.random() - 0.5) * 0.5; }
    p.decay = 0.0015; 
  } else if (type === 'button') { 
    const btnWrapper = document.getElementById('introBtnsWrapper');
    if (btnWrapper && !isEntered) {
      const rect = btnWrapper.getBoundingClientRect(); const targetPt = getPerimeterPoint(rect, 8); 
      p.targetX = targetPt.x; p.targetY = targetPt.y;
      const edge = Math.floor(Math.random() * 3);
      if (edge === 0) { p.x = Math.random() * width; p.y = height + 10; } else if (edge === 1) { p.x = -10; p.y = Math.random() * height; } else { p.x = width + 10; p.y = Math.random() * height; } 
      p.decay = Math.random() * 0.008 + 0.004; 
    } else return;
  } else if (type === 'navbar') {
    const nav = document.querySelector('.nav');
    if (nav && isEntered) {
      const rect = nav.getBoundingClientRect(); const pt = getPerimeterPoint(rect, 10);
      p.x = pt.x; p.y = pt.y; p.vx = (Math.random() - 0.5) * 0.3; p.vy = (Math.random() - 0.5) * 0.3; p.decay = Math.random() * 0.04 + 0.02; 
    } else return;
  }
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  const isEntered = document.body.classList.contains('entered');
  if (Math.random() < 0.4) createParticle('bg');
  if (!isEntered) { for(let i=0; i<3; i++) createParticle('button'); } else { for(let i=0; i<4; i++) createParticle('navbar'); }

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    if (p.type === 'button' && !isEntered) {
      const dx = p.targetX - p.x; const dy = p.targetY - p.y; const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 15) {
        p.vx += (dx / dist) * 0.6; p.vy += (dy / dist) * 0.6;
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (speed > 10) { p.vx = (p.vx / speed) * 10; p.vy = (p.vy / speed) * 10; }
      } else { p.vx *= 0.7; p.vy *= 0.7; p.vx += (Math.random() - 0.5) * 1; p.vy += (Math.random() - 0.5) * 1; }
    }
    p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(${p.color}, ${p.alpha * p.life})`; ctx.fill(); }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();