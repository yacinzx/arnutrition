// copyright YACINE DJEMAI instagram.com/xyaxinzx ©️ — PowerX DZ v2.0

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypYjLwH-a5hZx4BHC5q-yKs_e2GfZJTd7rGsVUhuZMhws2flsh-nJKQ4Pu1cEBwKeAdA/exec';
let currentLang = 'ar';
let cart = [];

/* ════════════════════════════════════
PRELOADER
════════════════════════════════════ */
(function initPreloader() {
  const particles = document.getElementById('preloaderParticles');
  if (particles) {
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `left:${Math.random()*100}%; bottom:${Math.random()*20}%; --dur:${2+Math.random()*3}s; --delay:${Math.random()*4}s; background:${Math.random()>.5?'var(--red)':'var(--gold)'}; width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;`;
      particles.appendChild(p);
    }
  }

  let pct = 0;
  const fill = document.getElementById('preloaderFill');
  const pctEl = document.getElementById('preloaderPct');

  const interval = setInterval(() => {
    pct += Math.random() * 15;
    if (pct > 100) pct = 100;
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        animateStats();
        initReveal();
      }, 300);
    }
  }, 80);
})();

/* ════════════════════════════════════
THEME
════════════════════════════════════ */
(function initTheme() {
  const saved = localStorage.getItem('px_theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('themeBtnIcon');
    if (icon) icon.textContent = '🌙';
  }
})();

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  const icon = document.getElementById('themeBtnIcon');
  if (icon) icon.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('px_theme', isLight ? 'light' : 'dark');
}

/* ════════════════════════════════════
LANGUAGE
════════════════════════════════════ */
function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.remove('en', 'fr');
  if (lang === 'en') document.body.classList.add('en');
  if (lang === 'fr') document.body.classList.add('fr');
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`);
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.t').forEach(el => {
    const v = el.getAttribute('data-' + lang) || el.getAttribute('data-ar');
    if (v) el.innerHTML = v;
  });
  document.querySelectorAll('select option').forEach(opt => {
    const v = opt.getAttribute('data-' + lang);
    if (v) opt.textContent = v;
  });
  renderCart();
  renderProducts(currentCat);
}

/* ════════════════════════════════════
NAV SCROLL EFFECT
════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ════════════════════════════════════
STATS COUNTER ANIMATION
════════════════════════════════════ */
function animateStats() {
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.textContent.includes('+') ? '+' : '';
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

/* ════════════════════════════════════
SCROLL REVEAL
════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.product-card, .stat, .social-card, .contact-inner > *');
  els.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ════════════════════════════════════
CART
════════════════════════════════════ */
function addToCart(btn) {
  const card = btn.closest('.product-card');
  const id = card.dataset.id, nameAr = card.dataset.nameAr, nameEn = card.dataset.nameEn;
  const price = parseInt(card.dataset.price), img = card.dataset.img;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, nameAr, nameEn, price, img, qty: 1 });
  }
  // Animate button
  btn.textContent = '✅';
  setTimeout(() => {
    btn.textContent = currentLang === 'ar' ? '🛒 أضف للسلة' : currentLang === 'fr' ? '🛒 Ajouter' : '🛒 Add to Cart';
  }, 600);
  updateCartCount();
  renderCart();
  showToast(currentLang === 'ar' ? '✅ تمت الإضافة للسلة' : currentLang === 'fr' ? '✅ Ajouté au panier' : '✅ Added to cart');
}

function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  el.textContent = total;
  el.style.display = total > 0 ? 'flex' : 'none';
}

// Per-wilaya delivery fees (Andesron tarifs)
const ANDESRON_FEES = {
  "01":{"home":1400,"stop":700},"02":{"home":800,"stop":450},"03":{"home":950,"stop":550},
  "04":{"home":800,"stop":450},"05":{"home":800,"stop":450},"06":{"home":800,"stop":450},
  "07":{"home":900,"stop":500},"08":{"home":1100,"stop":650},"09":{"home":800,"stop":450},
  "10":{"home":750,"stop":450},"11":{"home":1600,"stop":650},"12":{"home":800,"stop":450},
  "13":{"home":800,"stop":450},"14":{"home":800,"stop":650},"15":{"home":800,"stop":450},
  "16":{"home":600,"stop":400},"17":{"home":950,"stop":550},"18":{"home":700,"stop":300},
  "19":{"home":700,"stop":450},"20":{"home":750,"stop":450},"21":{"home":750,"stop":450},
  "22":{"home":750,"stop":450},"23":{"home":750,"stop":450},"24":{"home":750,"stop":450},
  "25":{"home":750,"stop":450},"26":{"home":800,"stop":450},"27":{"home":800,"stop":450},
  "28":{"home":850,"stop":450},"29":{"home":800,"stop":450},"30":{"home":950,"stop":500},
  "31":{"home":750,"stop":450},"32":{"home":1100,"stop":550},"33":{"home":1600,"stop":null},
  "34":{"home":600,"stop":450},"35":{"home":750,"stop":450},"36":{"home":800,"stop":450},
  "37":{"home":800,"stop":null},"38":{"home":800,"stop":null},"39":{"home":950,"stop":550},
  "40":{"home":800,"stop":450},"41":{"home":750,"stop":450},"42":{"home":750,"stop":450},
  "43":{"home":750,"stop":450},"44":{"home":850,"stop":450},"45":{"home":1100,"stop":550},
  "46":{"home":950,"stop":500},"47":{"home":950,"stop":600},"48":{"home":850,"stop":450},
  "49":{"home":1400,"stop":null},"50":{"home":2000,"stop":null},"51":{"home":900,"stop":null},
  "52":{"home":1000,"stop":null},"53":{"home":1600,"stop":800},"54":{"home":1600,"stop":null},
  "55":{"home":950,"stop":550},"56":{"home":1200,"stop":null},"57":{"home":950,"stop":450},
  "58":{"home":1000,"stop":null}
};

const DELIVERY_FEES = { domicile: 800, bureau: 500 }; // fallback

function getDeliveryFee(wilayaVal, deliveryType) {
  if (!wilayaVal) return deliveryType === 'bureau' ? 500 : 800;
  const num = (wilayaVal.match(/^(\d+)/) || [])[1];
  if (num && ANDESRON_FEES[num]) {
    const fees = ANDESRON_FEES[num];
    if (deliveryType === 'bureau') return fees.stop || 500;
    return fees.home || 800;
  }
  return deliveryType === 'bureau' ? 500 : 800;
}

function getSelectedDeliveryType() {
  const checked = document.querySelector('input[name="delivery-type"]:checked');
  return checked ? checked.value : 'domicile';
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">${currentLang === 'ar' ? 'السلة فارغة 🛒' : currentLang === 'fr' ? 'Panier vide 🛒' : 'Cart is empty 🛒'}</div>`;
    document.getElementById('cartTotal').textContent = '0 DA';
    return;
  }
  let html = '', subtotal = 0;
  cart.forEach(item => {
    const name = currentLang === 'ar' ? item.nameAr : item.nameEn;
    subtotal += item.price * item.qty;
    html += `<div class="cart-item"> <img class="cart-item-img" src="${item.img}" onerror="this.style.display='none'"> <div class="cart-item-info"> <div class="cart-item-namea">${name}</div> <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} DA</div> <div class="cart-item-qty"> <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button> <span class="qty-num">${item.qty}</span> <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button> </div> </div> <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑</button> </div>`;
  });
  const deliveryType = getSelectedDeliveryType();
  const deliveryFee = getDeliveryFee(document.getElementById('o-wilaya')?.value, deliveryType);
  const total = subtotal + deliveryFee;
  const deliveryLabel = deliveryType === 'bureau'
    ? (currentLang === 'ar' ? '🏢 توصيل للمكتب' : currentLang === 'fr' ? '🏢 Point Relais' : '🏢 Office Pickup')
    : (currentLang === 'ar' ? '🏠 توصيل للمنزل' : currentLang === 'fr' ? '🏠 Livraison à Domicile' : '🏠 Home Delivery');
  html += `<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;font-size:13px;color:var(--muted)"> ${deliveryLabel}: <strong style="color:var(--text)">${deliveryFee.toLocaleString()} DA</strong> </div>`;
  container.innerHTML = html;
  document.getElementById('cartTotal').textContent = total.toLocaleString() + ' DA';
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartCount();
  renderCart();
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartDrawer').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartDrawer').classList.remove('open');
}
