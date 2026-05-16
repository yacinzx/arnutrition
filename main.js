// copyright YACINE DJEMAI instagram.com/xyaxinzx ©️ — PowerX DZ v2.0

const GOOGLE_SCRIPT_URL = ‘https://script.google.com/macros/s/AKfycbypYjLwH-a5hZx4BHC5q-yKs_e2GfZJTd7rGsVUhuZMhws2flsh-nJKQ4Pu1cEBwKeAdA/exec’;
let currentLang = ‘ar’;
let cart = [];

/* ════════════════════════════════════
PRELOADER
════════════════════════════════════ */
(function initPreloader() {
const particles = document.getElementById(‘preloaderParticles’);
if (particles) {
for (let i = 0; i < 24; i++) {
const p = document.createElement(‘div’);
p.className = ‘particle’;
p.style.cssText = `left:${Math.random()*100}%; bottom:${Math.random()*20}%; --dur:${2+Math.random()*3}s; --delay:${Math.random()*4}s; background:${Math.random()>.5?'var(--red)':'var(--gold)'}; width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;`;
particles.appendChild(p);
}
}

let pct = 0;
const fill = document.getElementById(‘preloaderFill’);
const pctEl = document.getElementById(‘preloaderPct’);

const interval = setInterval(() => {
pct += Math.random() * 15;
if (pct > 100) pct = 100;
if (fill) fill.style.width = pct + ‘%’;
if (pctEl) pctEl.textContent = Math.round(pct) + ‘%’;
if (pct >= 100) {
clearInterval(interval);
setTimeout(() => {
document.getElementById(‘preloader’).classList.add(‘hidden’);
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
const saved = localStorage.getItem(‘px_theme’);
if (saved === ‘light’) {
document.body.classList.add(‘light-mode’);
const icon = document.getElementById(‘themeBtnIcon’);
if (icon) icon.textContent = ‘🌙’;
}
})();

function toggleTheme() {
document.body.classList.toggle(‘light-mode’);
const isLight = document.body.classList.contains(‘light-mode’);
const icon = document.getElementById(‘themeBtnIcon’);
if (icon) icon.textContent = isLight ? ‘🌙’ : ‘☀️’;
localStorage.setItem(‘px_theme’, isLight ? ‘light’ : ‘dark’);
}

/* ════════════════════════════════════
LANGUAGE
════════════════════════════════════ */
function setLang(lang) {
currentLang = lang;
document.documentElement.lang = lang;
document.documentElement.dir = lang === ‘ar’ ? ‘rtl’ : ‘ltr’;
document.body.classList.remove(‘en’, ‘fr’);
if (lang === ‘en’) document.body.classList.add(‘en’);
if (lang === ‘fr’) document.body.classList.add(‘fr’);
document.querySelectorAll(’.lang-btn’).forEach(b => b.classList.remove(‘active’));
const btn = document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`);
if (btn) btn.classList.add(‘active’);
document.querySelectorAll(’.t’).forEach(el => {
const v = el.getAttribute(‘data-’ + lang) || el.getAttribute(‘data-ar’);
if (v) el.innerHTML = v;
});
document.querySelectorAll(‘select option’).forEach(opt => {
const v = opt.getAttribute(‘data-’ + lang);
if (v) opt.textContent = v;
});
renderCart();
renderProducts(currentCat);
}

/* ════════════════════════════════════
NAV SCROLL EFFECT
════════════════════════════════════ */
window.addEventListener(‘scroll’, () => {
const nav = document.getElementById(‘mainNav’);
if (nav) nav.classList.toggle(‘scrolled’, window.scrollY > 60);
}, { passive: true });

/* ════════════════════════════════════
STATS COUNTER ANIMATION
════════════════════════════════════ */
function animateStats() {
document.querySelectorAll(’.stat-num[data-count]’).forEach(el => {
const target = parseInt(el.dataset.count);
const suffix = el.textContent.includes(’+’) ? ‘+’ : ‘’;
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
const els = document.querySelectorAll(’.product-card, .stat, .social-card, .contact-inner > *’);
els.forEach(el => el.classList.add(‘reveal’));
const obs = new IntersectionObserver((entries) => {
entries.forEach((e, i) => {
if (e.isIntersecting) {
setTimeout(() => e.target.classList.add(‘visible’), i * 60);
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
const card = btn.closest(’.product-card’);
const id = card.dataset.id, nameAr = card.dataset.nameAr, nameEn = card.dataset.nameEn;
const price = parseInt(card.dataset.price), img = card.dataset.img;
const existing = cart.find(i => i.id === id);
if (existing) {
existing.qty++;
} else {
cart.push({ id, nameAr, nameEn, price, img, qty: 1 });
}
// Animate button
btn.textContent = ‘✅’;
setTimeout(() => {
btn.textContent = currentLang === ‘ar’ ? ‘🛒 أضف للسلة’ : currentLang === ‘fr’ ? ‘🛒 Ajouter’ : ‘🛒 Add to Cart’;
}, 600);
updateCartCount();
renderCart();
showToast(currentLang === ‘ar’ ? ‘✅ تمت الإضافة للسلة’ : currentLang === ‘fr’ ? ‘✅ Ajouté au panier’ : ‘✅ Added to cart’);
}

function updateCartCount() {
const total = cart.reduce((s, i) => s + i.qty, 0);
const el = document.getElementById(‘cartCount’);
el.textContent = total;
el.style.display = total > 0 ? ‘flex’ : ‘none’;
}

// Per-wilaya delivery fees (Andesron tarifs)
const ANDESRON_FEES = {
“01”:{“home”:1400,“stop”:700},“02”:{“home”:800,“stop”:450},“03”:{“home”:950,“stop”:550},
“04”:{“home”:800,“stop”:450},“05”:{“home”:800,“stop”:450},“06”:{“home”:800,“stop”:450},
“07”:{“home”:900,“stop”:500},“08”:{“home”:1100,“stop”:650},“09”:{“home”:800,“stop”:450},
“10”:{“home”:750,“stop”:450},“11”:{“home”:1600,“stop”:650},“12”:{“home”:800,“stop”:450},
“13”:{“home”:800,“stop”:450},“14”:{“home”:800,“stop”:650},“15”:{“home”:800,“stop”:450},
“16”:{“home”:600,“stop”:400},“17”:{“home”:950,“stop”:550},“18”:{“home”:700,“stop”:300},
“19”:{“home”:700,“stop”:450},“20”:{“home”:750,“stop”:450},“21”:{“home”:750,“stop”:450},
“22”:{“home”:750,“stop”:450},“23”:{“home”:750,“stop”:450},“24”:{“home”:750,“stop”:450},
“25”:{“home”:750,“stop”:450},“26”:{“home”:800,“stop”:450},“27”:{“home”:800,“stop”:450},
“28”:{“home”:850,“stop”:450},“29”:{“home”:800,“stop”:450},“30”:{“home”:950,“stop”:500},
“31”:{“home”:750,“stop”:450},“32”:{“home”:1100,“stop”:550},“33”:{“home”:1600,“stop”:null},
“34”:{“home”:600,“stop”:450},“35”:{“home”:750,“stop”:450},“36”:{“home”:800,“stop”:450},
“37”:{“home”:800,“stop”:null},“38”:{“home”:800,“stop”:null},“39”:{“home”:950,“stop”:550},
“40”:{“home”:800,“stop”:450},“41”:{“home”:750,“stop”:450},“42”:{“home”:750,“stop”:450},
“43”:{“home”:750,“stop”:450},“44”:{“home”:850,“stop”:450},“45”:{“home”:1100,“stop”:550},
“46”:{“home”:950,“stop”:500},“47”:{“home”:950,“stop”:600},“48”:{“home”:850,“stop”:450},
“49”:{“home”:1400,“stop”:null},“50”:{“home”:2000,“stop”:null},“51”:{“home”:900,“stop”:null},
“52”:{“home”:1000,“stop”:null},“53”:{“home”:1600,“stop”:800},“54”:{“home”:1600,“stop”:null},
“55”:{“home”:950,“stop”:550},“56”:{“home”:1200,“stop”:null},“57”:{“home”:950,“stop”:450},
“58”:{“home”:1000,“stop”:null}
};

const DELIVERY_FEES = { domicile: 800, bureau: 500 }; // fallback

function getDeliveryFee(wilayaVal, deliveryType) {
if (!wilayaVal) return deliveryType === ‘bureau’ ? 500 : 800;
const num = (wilayaVal.match(/^(\d+)/) || [])[1];
if (num && ANDESRON_FEES[num]) {
const fees = ANDESRON_FEES[num];
if (deliveryType === ‘bureau’) return fees.stop || 500;
return fees.home || 800;
}
return deliveryType === ‘bureau’ ? 500 : 800;
}

function getSelectedDeliveryType() {
const checked = document.querySelector(‘input[name=“delivery-type”]:checked’);
return checked ? checked.value : ‘domicile’;
}

function renderCart() {
const container = document.getElementById(‘cartItems’);
if (cart.length === 0) {
container.innerHTML = `<div class="cart-empty">${currentLang === 'ar' ? 'السلة فارغة 🛒' : currentLang === 'fr' ? 'Panier vide 🛒' : 'Cart is empty 🛒'}</div>`;
document.getElementById(‘cartTotal’).textContent = ‘0 DA’;
return;
}
let html = ‘’, subtotal = 0;
cart.forEach(item => {
const name = currentLang === ‘ar’ ? item.nameAr : item.nameEn;
subtotal += item.price * item.qty;
html += `<div class="cart-item"> <img class="cart-item-img" src="${item.img}" onerror="this.style.display='none'"> <div class="cart-item-info"> <div class="cart-item-namea">${name}</div> <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} DA</div> <div class="cart-item-qty"> <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button> <span class="qty-num">${item.qty}</span> <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button> </div> </div> <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑</button> </div>`;
});
const deliveryType = getSelectedDeliveryType();
const deliveryFee = DELIVERY_FEES[deliveryType] || 800;
const total = subtotal + deliveryFee;
const deliveryLabel = deliveryType === ‘bureau’
? (currentLang === ‘ar’ ? ‘🏢 توصيل للمكتب’ : currentLang === ‘fr’ ? ‘🏢 Point Relais’ : ‘🏢 Office Pickup’)
: (currentLang === ‘ar’ ? ‘🏠 توصيل للمنزل’ : currentLang === ‘fr’ ? ‘🏠 Livraison à Domicile’ : ‘🏠 Home Delivery’);
html += `<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;font-size:13px;color:var(--muted)">
${deliveryLabel}: <strong style="color:var(--text)">${deliveryFee.toLocaleString()} DA</strong>

  </div>`;
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
document.getElementById(‘cartOverlay’).classList.add(‘open’);
document.getElementById(‘cartDrawer’).classList.add(‘open’);
}

function closeCart() {
document.getElementById(‘cartOverlay’).classList.remove(‘open’);
document.getElementById(‘cartDrawer’).classList.remove(‘open’);
}

/* ════════════════════════════════════
ALGERIA DATA — ALL 58 WILAYAS + COMMUNES
════════════════════════════════════ */
const ALGERIA_DATA = {
“01 - أدرار”: [“أدرار”,“أولف”,“رقان”,“تيمياوين”,“تامنطيط”,“فنوغيل”,“بودة”,“تيت”,“شروين”,“أقبلي”,“أنزقمير”,“بوداء”,“قصر قدور”,“متارفة”,“أوقروت”,“سالي”,“تيميمون”,“تالمين”,“وادي ميارة”,“اقستن”,“كوادر”,“درقين”,“تيموقتن”,“اكابلي”],
“02 - الشلف”: [“الشلف”,“تنس”,“أبو الحسن”,“بني حواء”,“واد قورزو”,“بريرة”,“الكريمية”,“سنجاس”,“الحجاج”,“العطاف”,“خميس مليانة”,“الشطية”,“الغريبة”,“موزاية”,“بني بوعتاب”,“وادي السلي”,“تاشتة”,“بني راشد”,“بني لول”,“الأربعاء”],
“03 - الأغواط”: [“الأغواط”,“قصر الشمعة”,“حاسي الرمل”,“آفلو”,“السبعة”,“سيدي بوزيد”,“برج البحري”,“تاجرونة”,“وادي مرة”,“الغيشة”,“تيزي لحمر”,“بريدة”,“تاجروفت”,“سيدي مخلوف”,“البيضاء”,“قلتة سيدي سعد”],
“04 - أم البواقي”: [“أم البواقي”,“عين البيضاء”,“عين مليلة”,“سيقوس”,“عين فكرون”,“الضلعة”,“الرحية”,“ببار”,“فكيرينة”,“قصر الصبحي”,“مسكيانة”,“التيوليت”,“عين قشرة”,“عين بابوش”,“عين كرشة”,“الريبة”,“وادي نيني”,“جلدو”,“المرج”],
“05 - باتنة”: [“باتنة”,“عين التوتة”,“ثنية العابد”,“آريس”,“لمسان”,“مروانة”,“نقاوس”,“سريانة”,“بريكة”,“رأس العيون”,“منعة”,“إشمول”,“بومقر”,“فسديس”,“أولاد سي سليمان”,“لاريبة”,“حيدوسة”,“غسيرة”,“الجزار”,“تازولت”,“تيغانيمين”,“إينوغيسن”,“شير”,“أولاد عمار”,“سفيان”,“البوحمامة”,“وادي الشعبة”,“عيون العصافير”,“إمدوكال”],
“06 - بجاية”: [“بجاية”,“أميزور”,“السوق”,“الأقبو”,“تيشي”,“خربة أولاد نايل”,“درقينة”,“برباشة”,“سيدي عيش”,“تيزي نبربر”,“أوقاس”,“القصر”,“تمقرة”,“فناية الماثن”,“بني ماوش”,“بني قزيز”,“تيفرة”,“خنتة”,“صدوق”,“عيلول”,“البرج”,“شميني”,“طيبان”,“أجارة”,“سوق الثنين”,“بني يعلى”,“أيت إسماعيل”,“إيغيل علي”],
“07 - بسكرة”: [“بسكرة”,“طولقة”,“أورلال”,“سيدي عقبة”,“شتمة”,“مشونش”,“أولاد جلال”,“البسباس”,“قنطرة”,“وادي شلي”,“الفيض”,“درموس”,“راس الميعاد”,“ليشانة”,“أوماش”,“سيدي خالد”,“ليوة”,“الحاجب”,“المزيرعة”],
“08 - بشار”: [“بشار”,“عين الصفراء”,“البيض”,“تيمدي”,“بني ونيف”,“كرزاز”,“لحمر”,“القنادسة”,“مرحوم”,“تاغيت”,“قصابي”],
“09 - البليدة”: [“البليدة”,“بوفاريك”,“لاربع”,“شفا”,“موزاية”,“بني مراد”,“واد الأليق”,“بوينان”,“بني خليل”,“السحاولة”,“واد جر”,“أولاد يعيش”,“واد القطار”,“شبلي”,“الأربعاء”,“خميس الخشنة”,“بوعرفة”,“مفتاح”,“واد الدوس”,“سوهان”,“بن خليل”],
“10 - البويرة”: [“البويرة”,“لخضرية”,“سور الغزلان”,“عين بسام”,“عين الحجر”,“أقبو”,“حيزر”,“آث لحسن”,“مجهضة”,“روابح”,“جباحية”,“دير الشيخ”,“الحاجب”,“واد البردي”,“آيت صالح”,“خلوات”,“وارجلان”,“الكور”,“ذراع السمار”,“عين لحجر”,“تالة”,“عمر”,“حيدوسة”],
“11 - تمنراست”: [“تمنراست”,“عين صالح”,“عين قزام”,“إيديلس”,“إن أمقل”,“إن قزام”,“إن جامن”],
“12 - تبسة”: [“تبسة”,“شريعة”,“الكويف”,“الحمامات”,“الونزة”,“عين زرقة”,“بئر مقدم”,“ثليجان”,“عين الزيتونة”,“مرسط”,“الماء الأبيض”,“وادي الزيتون”,“عقلة المالح”,“سطح الكونتي”,“البكارية”,“نقرين”,“بئر الذهب”],
“13 - تلمسان”: [“تلمسان”,“مغنية”,“غزاوات”,“النادر”,“رمشي”,“سيدي إبراهيم”,“سيدي عبد الله”,“وادي تافنة”,“بني صاف”,“الغزوات”,“أولاد ميمون”,“حنين”,“أزيلس”,“بني بوسعيد”,“صبرة”,“بني سنوس”,“فلاوسن”,“وادي سباو”,“سبدو”,“أولاد رياح”,“سوق الثلاثاء”,“بني خلاد”,“حمام بوغرارة”],
“14 - تيارت”: [“تيارت”,“فرندة”,“تخمارت”,“واد ليلي”,“قصر الشلالة”,“مهدية”,“دشمية”,“زمورة”,“مدروسة”,“ملاكو”,“سيدي عبد الرحمان”,“السبت”,“الحمادية”,“راس الما”,“الرحوية”,“عين دهب”,“بوقرة”,“الغيلة”],
“15 - تيزي وزو”: [“تيزي وزو”,“أزفون”,“آيت يحيى موسى”,“تيقزيرت”,“بوجيمة”,“وقنون”,“فريحة”,“آيت خليل”,“أقبيل”,“آيت يعقوب”,“أكفادو”,“آيت تودرت”,“مكيرة”,“عزازقة”,“دراع البن”,“الأربعاء نايت إيراثن”,“آيت محمود”,“بني دوالة”,“ذراع الميزان”,“تادمايت”,“بوزقن”],
“16 - الجزائر”: [“باب الوادي”,“حسين داي”,“البياضة”,“الحراش”,“بئر مراد رايس”,“الدار البيضاء”,“برج البحري”,“القبة”,“المرادية”,“سيدي أمحمد”,“الجزائر الوسطى”,“باب الزوار”,“الرويبة”,“رغاية”,“بن عكنون”,“بوزريعة”,“المحمدية”,“برج الكيفان”,“المدنية”,“الأبيار”,“الكاليتوس”,“واد قريش”,“ديار البيض”,“البرواقية”,“بئر توتة”,“الدويرة”,“سيدي موسى”,“الرايس حميدو”,“أولاد فايت”],
“17 - الجلفة”: [“الجلفة”,“عين وسارة”,“تعظميت”,“مسعد”,“الإدريسية”,“بيرين”,“فيض البطمة”,“حاسي بحبح”,“دار الشيوخ”,“سلمانة”,“واد العاتة”,“زكار”,“دلدول”,“سيدي بايزيد”,“عمورة”],
“18 - جيجل”: [“جيجل”,“الميلية”,“تاهير”,“الشقفة”,“زيامة منصورية”,“غبالة”,“القنار”,“سيدي معروف”,“بوراوي بلهادف”,“عمار”,“بردة”,“الشقفة”,“الطاهير”],
“19 - سطيف”: [“سطيف”,“عين أزال”,“بوعنداس”,“حمام السخنة”,“إيدير”,“آيت نويلة”,“بني عزيز”,“المعامرة”,“العلمة”,“قجال”,“أولاد سي أحمد”,“صالح باي”,“بني فودة”,“الولجة”,“بني وارثان”,“عين ولمان”,“تالا إفاسن”,“بئر العرش”,“عين رويبة”,“ياسمينة”,“عين أرنات”,“بلاعة”,“مجانة”,“واد الفضة”,“البيضاء”,“تيزي نبيل”],
“20 - سعيدة”: [“سعيدة”,“عين الحجر”,“العلايمية”,“سيدي أحمد”,“مولاي العربي”,“المعمورة”,“حساسنة”,“سيدي بوبكر”,“واد تشيمبي”],
“21 - سكيكدة”: [“سكيكدة”,“رمضان جمال”,“القل”,“عزابة”,“بن عزوز”,“الرشاش”,“زيغود يوسف”,“بوشطاطة”,“خربة سيدي ناجي”,“بني زيد”,“أولاد حبابة”],
“22 - سيدي بلعباس”: [“سيدي بلعباس”,“تلاغ”,“مرحوم”,“ضاية بن ضحوة”,“بئر البنا”,“محمد بن بوذياف”,“تاودموت”,“أنكاد”,“وادي الصفصاف”,“ذرع الثلاث”,“سيدي حمادوش”,“المرجة”],
“23 - عنابة”: [“عنابة”,“بوجيمة”,“برحال”,“عين البرج”,“سرايدي”,“شطايبي”,“العلمة”,“وادي الأنيب”,“الحجار”],
“24 - قالمة”: [“قالمة”,“عين مخلوف”,“الحواس”,“عين الصفراء”,“بوشقوف”,“عين رقادة”,“ولت”,“خزارة”,“الرقية”,“قلعة بوصبع”,“تامالوس”],
“25 - قسنطينة”: [“قسنطينة”,“عين عبيد”,“عين سمارة”,“الخروب”,“ديدوش مراد”,“بني حميدان”,“زيغود يوسف”,“إبن زياد”,“الحامة”],
“26 - المدية”: [“المدية”,“بئر بن عابد”,“واد الدواو”,“كافو”,“سيدي ناعمة”,“آيت لعزيز”,“ميهوب”,“أولاد بوعشرة”,“عين بوسيف”,“الأزهرية”,“سيدي زيان”,“أولاد معيزة”,“سيدي دامد”],
“27 - مستغانم”: [“مستغانم”,“عين تادلس”,“منصورة”,“خضرة”,“سيدي لخضر”,“مزغران”,“صيادة”,“سور”,“فروجة”,“أولاد ماعل”],
“28 - المسيلة”: [“المسيلة”,“بوسعادة”,“سيدي عيسى”,“عين الملح”,“الحوامد”,“شلال”,“أولاد سيدي إبراهيم”,“الوانوغة”,“برهوم”,“مقرة”,“أولاد أدي قويرة”,“بني يلمان”,“خبانة”,“شلالة العذاورة”],
“29 - معسكر”: [“معسكر”,“تيقنين”,“محمد بن عودة”,“واد الأبطال”,“سيدي قادة”,“نسمط”,“عين فارس”,“زهانة”,“مقطع الدواوة”,“حاسي ممر”,“سيدي بوحني”],
“30 - ورقلة”: [“ورقلة”,“تقرت”,“حاسي مسعود”,“المقارين”,“نزلة”,“سيدي خويلد”,“عين البيضاء”,“البرمة”,“تماسين”,“حاسي بن عبد الله”],
“31 - وهران”: [“وهران”,“عين الترك”,“مرسى الكبير”,“السانية”,“حاسي مفسوخ”,“طاف رواين”,“بوفاتيس”,“بطيوة”,“ودراس”,“عين البيضاء”,“الكرمة”,“المرسى”,“بن فريحة”,“حسيان تومي”],
“32 - البيض”: [“البيض”,“بوغار”,“بريزينة”,“الأبيض سيدي الشيخ”,“سيدي أمحمد بن ضاوي”,“القنطرة”,“ستيتن”,“خبانة”,“واد المشير”,“ستيتنه”],
“33 - إليزي”: [“إليزي”,“عين أمناس”,“إن أميناس”,“دبدب”,“برج عمر إدريس”],
“34 - برج بوعريريج”: [“برج بوعريريج”,“بئر قاصد علي”,“الرأس المائدة”,“عين تاغروت”,“تقليعت”,“تاسمارت”,“المنصورة”,“المجانة”,“راس الوادي”,“ستيتن”,“الشعبة”,“حمام الضلعة”],
“35 - بومرداس”: [“بومرداس”,“بودواو”,“بوغزول”,“الناصرية”,“تاورقة”,“واد حجارة”,“الثنية”,“تيجلابين”,“دلس”,“أومال”,“إسي علي”,“خميس الخشنة”,“قورصو”,“غروس”,“زموري”,“شعبة الأمير”,“عمروش”],
“36 - الطارف”: [“الطارف”,“العلمة”,“الشط”,“القالة”,“بريحان”,“عصفور”,“شيحة”,“زيتونة”,“بوحجار”,“أولاد رياح”,“بوحجار”,“سوارخ”,“عين الكرمة”],
“37 - تندوف”: [“تندوف”,“أم العسل”],
“38 - تسمسيلت”: [“تسمسيلت”,“خميستي”,“الأزهرية”,“لزرق”,“واد بسام”,“عين ذهب”,“العيون”,“الملعب”,“سيدي العنتري”,“بوغيدل”,“بئر الأرش”,“المعيصم”,“سيدي حسين”],
“39 - الوادي”: [“الوادي”,“الدبيلة”,“الرباح”,“تالب”,“حاسي الغلة”,“قمار”,“جامعة”,“الرقيبة”,“المقرون”,“ورماس”,“سيدي عون”,“الطالب العربي”,“مغيير”,“أولاد أحمد”,“واد العلندة”,“الشتيرة”,“دوار الماء”],
“40 - خنشلة”: [“خنشلة”,“كيمل”,“شلية”,“أم علي”,“إمطانس”,“منعة”,“تافرنت”,“بابار”,“بغاي”,“قايس”,“ماسطة”,“أولاد رشاش”],
“41 - سوق أهراس”: [“سوق أهراس”,“سدراتة”,“مدينة”,“تيفاش”,“خضيرة”,“زعرورة”,“مستطيل”,“أولاد درار”,“الحنانشة”,“مشروحة”,“أولاد الموهوب”,“أولاد زيان”,“وادي الخير”],
“42 - تيبازة”: [“تيبازة”,“قورايا”,“أقبو”,“بوهارون”,“دواودة”,“مرادية”,“شرشال”,“البرواقية”,“واد الصفصاف”,“بواسماعيل”,“حجوط”,“تيبازة”],
“43 - ميلة”: [“ميلة”,“شلغوم العيد”,“فرجيوة”,“سيدي مروان”,“تاجنانت”,“أولاد خلوف”,“القصر”,“أحمد راشدي”,“راشد”,“حمالة”,“أوندجيل”,“تلاغمة”,“سيدي خليفة”,“أين التين”,“يابوس”],
“44 - عين الدفلى”: [“عين الدفلى”,“خميس مليانة”,“ملعب”,“جندل”,“المخاطة”,“العطاف”,“روينة”,“جليدة”,“عريب”,“الحاجب”,“بطيطة”,“الاخضرية”,“تاشتة”,“مقرن”],
“45 - النعامة”: [“النعامة”,“عين صفراء”,“مشرية”,“تيوت”,“صفيصيفة”,“جنين بورزق”,“القصب”,“تيرين”],
“46 - عين تيموشنت”: [“عين تيموشنت”,“بن عزوز”,“حمام بوحجر”,“أولاد بن علي”,“سيدي بن عدة”,“بوزجار”,“سيدي صالح”,“تارقة”,“ولهاصة غرابة”,“سيدي عبد المومن”,“البطيوة”,“عقب الليل”],
“47 - غرداية”: [“غرداية”,“بريان”,“بنورة”,“القرارة”,“متليلي”,“زلفانة”,“منصورة”,“حاسي القارة”,“ضاية بن ضحوة”,“سبسب”,“واد نسة”],
“48 - غليزان”: [“غليزان”,“واد رهيو”,“حمادنة”,“المصلى”,“يلل”,“غروس”,“الجليدة”,“بلعسل”,“سيدي خطاب”,“واد جمعة”,“عمي موسى”,“مسرة”,“المالح”,“واد قيعة”,“برين”,“مزاريف”,“حاسي شيلا”],
“49 - تيميمون”: [“تيميمون”,“أولف”,“شروين”,“أقبلي”,“أنزقمير”,“اقستن”,“كوادر”,“درقين”,“تيموقتن”],
“50 - برج باجي مختار”: [“برج باجي مختار”,“تيمياوين”],
“51 - أولاد جلال”: [“أولاد جلال”,“شعيبة”],
“52 - بني عباس”: [“بني عباس”,“بني ونيف”,“كرزاز”,“تيمدي”],
“53 - عين صالح”: [“عين صالح”,“عين قزام”,“إيديلس”,“فقارة زمالة”],
“54 - عين قزام”: [“عين قزام”,“تزرزايت”,“تين زواتين”,“بورج”],
“55 - توقرت”: [“توقرت”,“المقارين”,“المرارة”,“بن ناصر بن شهرة”],
“56 - جانت”: [“جانت”,“إليزي”],
“57 - المغير”: [“المغير”,“المقرون”,“سيدي عون”,“الطالب العربي”],
“58 - الونشريس”: [“تيسمسيلت”,“لزرق”,“واد بسام”,“عين ذهب”]
};

/* ════════════════════════════════════
WILAYA CHANGE — populate communes
════════════════════════════════════ */
function onWilayaChange(wilaya) {
var communeSel = document.getElementById(‘o-commune’);
var communeGroup = communeSel ? communeSel.closest(’.form-group’) : null;
if (!communeSel) return;
if (!wilaya || !ALGERIA_DATA[wilaya]) {
if (communeGroup) communeGroup.style.display = ‘none’;
communeSel.innerHTML = ‘<option value="">— اختر الولاية أولاً —</option>’;
communeSel.disabled = true;
return;
}
var communes = ALGERIA_DATA[wilaya];
communeSel.innerHTML = ‘<option value="">— اختر البلدية —</option>’ +
communes.map(function(c) { return ‘<option value="' + c + '">’ + c + ‘</option>’; }).join(’’);
communeSel.disabled = false;
if (communeGroup) communeGroup.style.display = ‘block’;
}

/* ── Populate wilaya select ── */
(function populateWilayas() {
const sel = document.getElementById(‘o-wilaya’);
if (!sel) return;
Object.keys(ALGERIA_DATA).forEach(w => {
const opt = document.createElement(‘option’);
opt.value = w;
opt.textContent = w;
sel.appendChild(opt);
});
})();

// onDeliveryChange: see definition below

/**

- Toggles the visibility of the address field based on delivery selection
- @param {string} type - ‘domicile’ (Home) or ‘bureau’ (Office)
  */
  function onDeliveryChange(type) {
  const addressGroup = document.getElementById(‘address-group’);
  const addressInput = document.getElementById(‘o-address’);
  
  if (type === ‘bureau’) {
  // Hide the address section
  addressGroup.style.display = ‘none’;
  // Clear the value so it’s not sent with the order
  addressInput.value = ‘’;
  } else {
  // Show the address section
  addressGroup.style.display = ‘block’;
  }
  }

/* ════════════════════════════════════
ORDER MODAL
════════════════════════════════════ */
function openOrderModal() {
if (cart.length === 0) {
showToast(currentLang === ‘ar’ ? ‘⚠️ السلة فارغة’ : ‘⚠️ Cart is empty’);
return;
}
closeCart();

// Render summary
const deliveryType = getSelectedDeliveryType();
const deliveryFee = DELIVERY_FEES[deliveryType] || 800;
let summaryHtml = ‘<strong style="display:block;margin-bottom:8px;font-size:14px">📦 ملخص الطلب:</strong>’;
let subtotal = 0;
cart.forEach(item => {
const name = currentLang === ‘ar’ ? item.nameAr : item.nameEn;
const sub = item.price * item.qty;
subtotal += sub;
summaryHtml += `<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0"> <span>${name} × ${item.qty}</span> <span style="color:var(--red);font-weight:700">${sub.toLocaleString()} DA</span> </div>`;
});
const deliveryLabel = deliveryType === ‘bureau’
? (currentLang === ‘ar’ ? ‘🏢 توصيل للمكتب’ : currentLang === ‘fr’ ? ‘🏢 Point Relais’ : ‘🏢 Office Pickup’)
: (currentLang === ‘ar’ ? ‘🏠 توصيل للمنزل’ : currentLang === ‘fr’ ? ‘🏠 Livraison à Domicile’ : ‘🏠 Home Delivery’);
summaryHtml += `<div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;color:var(--muted)">
<span>${deliveryLabel}</span>
<span style="font-weight:700">${deliveryFee.toLocaleString()} DA</span>

  </div>`;
  const total = subtotal + deliveryFee;
  summaryHtml += `<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:900;font-size:16px">
    <span>${currentLang === 'ar' ? 'المجموع الكلي' : currentLang === 'fr' ? 'Total Général' : 'Grand Total'}</span>
    <span style="color:var(--red)">${total.toLocaleString()} DA</span>
  </div>`;
  document.getElementById('modalOrderSummary').innerHTML = summaryHtml;

// Ensure address group visible by default (home delivery is checked)
document.getElementById(‘address-group’).classList.remove(‘hidden’);
document.getElementById(‘order-msg’).textContent = ‘’;

document.getElementById(‘orderModal’).classList.add(‘open’);
}

function closeOrderModal() {
document.getElementById(‘orderModal’).classList.remove(‘open’);
}

document.getElementById(‘orderModal’).addEventListener(‘click’, e => {
if (e.target === e.currentTarget) closeOrderModal();
});

/* ════════════════════════════════════
SUBMIT ORDER
════════════════════════════════════ */
async function submitOrder() {
// Anti-spam cooldown
const now = Date.now();
if (now - lastOrderTime < ORDER_COOLDOWN) {
const wait = Math.ceil((ORDER_COOLDOWN - (now - lastOrderTime)) / 1000);
const msg = document.getElementById(‘order-msg’);
msg.style.color = ‘var(–red)’;
msg.textContent = `⏳ يرجى الانتظار ${wait} ثانية قبل إرسال طلب جديد`;
return;
}

// Collect values
const name    = document.getElementById(‘o-name’).value.trim();
const phone   = document.getElementById(‘o-phone’).value.trim();
const wilaya  = document.getElementById(‘o-wilaya’).value;
const commune = document.getElementById(‘o-commune’).value;
const deliveryType = document.querySelector(‘input[name=“delivery-type”]:checked’)?.value || ‘domicile’;
const address = document.getElementById(‘o-address’).value.trim();
const notes   = document.getElementById(‘o-notes’).value.trim();

let valid = true;

// Name
if (!name) { setFieldError(‘o-name’,‘err-name’,‘⚠️ الاسم مطلوب’); valid = false; }
else clearErr(‘err-name’);

// Phone
if (!phone) {
setFieldError(‘o-phone’,‘err-phone’,‘⚠️ رقم الهاتف مطلوب’); valid = false;
} else if (!validateAlgerianPhone(phone)) {
setFieldError(‘o-phone’,‘err-phone’,‘⚠️ رقم غير صحيح (مثال: 0555 12 34 56)’); valid = false;
} else {
clearErr(‘err-phone’);
}

// Wilaya
if (!wilaya) { setFieldError(‘o-wilaya’,‘err-wilaya’,‘⚠️ الولاية مطلوبة’); valid = false; }
else clearErr(‘err-wilaya’);

// Address (only when home delivery)
if (deliveryType === ‘domicile’ && !address) {
setFieldError(‘o-address’,‘err-address’,‘⚠️ العنوان مطلوب للتوصيل للمنزل’); valid = false;
} else {
clearErr(‘err-address’);
}

if (!valid) return;

// Build order data
const orderId = ‘PX-’ + Date.now().toString(36).toUpperCase();
const products = cart.map(i => `${i.nameAr} x${i.qty}`).join(’, ‘);
const deliveryFee = getDeliveryFee(wilaya, deliveryType);
const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
const grandTotal = subtotal + deliveryFee;
const total = grandTotal.toLocaleString() + ’ DA’;
const deliveryLabel = deliveryType === ‘domicile’ ? `توصيل للمنزل (+${deliveryFee.toLocaleString()} DA)` : `استلام من المكتب (+${deliveryFee.toLocaleString()} DA)`;
const addressText  = deliveryType === ‘domicile’ ? address : deliveryLabel;

const orderData = {
orderId, name, phone,
wilaya: wilaya.split(’ - ’)[1] || wilaya,
commune, deliveryType: deliveryLabel,
address: addressText,
products, total,
date: new Date().toLocaleString(‘ar-DZ’),
status: ‘جديد / New’,
notes,
_token: submitToken
};

// UI feedback
const btn = document.getElementById(‘submitOrderBtn’);
btn.disabled = true;
btn.innerHTML = ‘⏳ جاري الإرسال…’;
const msgEl = document.getElementById(‘order-msg’);
msgEl.textContent = ‘’;

try {
await fetch(GOOGLE_SCRIPT_URL, {
method: ‘POST’,
mode: ‘no-cors’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify(orderData)
});
// Success
lastOrderTime = Date.now();
generateToken();
msgEl.style.color = ‘var(–green)’;
msgEl.textContent = `✅ تم إرسال طلبك بنجاح! رقم الطلب: ${orderId}`;
cart = [];
updateCartCount();
renderCart();
btn.innerHTML = ‘✅ تم الإرسال!’;
setTimeout(() => {
closeOrderModal();
btn.innerHTML = ‘<span class="t" data-ar="✅ إرسال الطلب" data-en="✅ Send Order">✅ إرسال الطلب</span>’;
btn.disabled = false;
}, 2500);
} catch (err) {
// Save locally as backup
const saved = JSON.parse(localStorage.getItem(‘bb_orders’) || ‘[]’);
saved.unshift(orderData);
localStorage.setItem(‘bb_orders’, JSON.stringify(saved));
msgEl.style.color = ‘var(–green)’;
msgEl.textContent = `✅ تم حفظ طلبك! رقم الطلب: ${orderId}`;
lastOrderTime = Date.now();
cart = [];
updateCartCount();
renderCart();
btn.innerHTML = ‘✅ تم!’;
setTimeout(() => {
closeOrderModal();
btn.innerHTML = ‘<span class="t" data-ar="✅ إرسال الطلب" data-en="✅ Send Order">✅ إرسال الطلب</span>’;
btn.disabled = false;
}, 2500);
}
}

/* ════════════════════════════════════
CONTACT FORM
════════════════════════════════════ */
function submitContactForm() {
const name = document.getElementById(‘f-name’).value.trim();
const email = document.getElementById(‘f-email’).value.trim();
const phone = document.getElementById(‘f-phone’).value.trim();
const subject = document.getElementById(‘f-subject’).value;
const msg = document.getElementById(‘f-msg’).value.trim();
const msgEl = document.getElementById(‘form-msg’);
if (!name || !email || !msg) {
msgEl.style.color = ‘var(–red)’;
msgEl.textContent = currentLang === ‘ar’ ? ‘⚠️ يرجى ملء جميع الحقول’ : ‘⚠️ Please fill required fields’;
return;
}
const subjectLabels = { order:‘طلب منتج’, inquiry:‘استفسار’, delivery:‘توصيل’, other:‘أخرى’ };
const emailSubject = `[PowerX DZ] ${subjectLabels[subject]} - ${name}`;
const emailBody = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subjectLabels[subject]}\n\nMessage:\n${msg}`;
window.location.href = `mailto:yacinzbac2023@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
msgEl.style.color = ‘var(–green)’;
msgEl.textContent = currentLang === ‘ar’ ? ‘✅ تم فتح البريد الإلكتروني!’ : ‘✅ Email client opened!’;
[‘f-name’,‘f-email’,‘f-phone’,‘f-msg’].forEach(id => document.getElementById(id).value = ‘’);
}

/* ════════════════════════════════════
TOAST
════════════════════════════════════ */
function showToast(msg) {
const t = document.getElementById(‘toast’);
t.textContent = msg;
t.classList.add(‘show’);
clearTimeout(t._timer);
t._timer = setTimeout(() => t.classList.remove(‘show’), 2500);
}

/* ════════════════════════════════════
HERO LOGO UPLOAD
════════════════════════════════════ */
function loadHeroLogo(event) {
const file = event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = function(e) {
const src = e.target.result;
const img = document.getElementById(‘heroLogoImg’);
img.src = src;
img.style.display = ‘block’;
try { localStorage.setItem(‘bb_hero_logo’, src); } catch(err) {}
};
reader.readAsDataURL(file);
}

(function restoreLogo() {
try {
const saved = localStorage.getItem(‘bb_hero_logo’);
if (saved) {
const img = document.getElementById(‘heroLogoImg’);
if (img) img.src = saved;
}
} catch(e) {}
})();

/* ════════════════════════════════════
PRODUCTS
════════════════════════════════════ */
const DEFAULT_PRODUCTS = [
{ id:‘1’, nameAr:‘كرياتين مونوهيدرات 300g’, nameEn:‘Creatine Monohydrate 300g’, brand:‘OSTROVIT’, price:2800, cat:‘كرياتين’, img:‘https://www.performecenternutrition.com/1857-large_default/creatine-monohydrate-neutre.jpg’, badge:‘جديد’, available:true },
{ id:‘2’, nameAr:‘فيتامين D3 + كالسيوم’, nameEn:‘Vitamin D3 + Calcium’, brand:‘OSTROVIT’, price:1900, cat:‘فيتامينات’, img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/v/i/vitamin_d3_k2_1000_iu_200_mcg_90_tabs_en.png’, badge:’’, available:true },
{ id:‘3’, nameAr:‘100% كرياتين 500g’, nameEn:‘100% Creatine 500g’, brand:‘BIOTECHUSA’, price:6200, cat:‘كرياتين’, img:‘https://www.nocsy.fr/wp-content/uploads/2024/08/avis-creatine-biotech-usa.jpg’, badge:‘متوفر’, available:true },
{ id:‘4’, nameAr:‘أشواغاندا KSM-66’, nameEn:‘Ashwagandha KSM-66’, brand:‘MYVITAMINS’, price:2500, cat:‘فيتامينات’, img:’’, badge:’’, available:true },
{ id:‘5’, nameAr:‘PUMP Pre-Workout 300g’, nameEn:‘PUMP Pre-Workout 300g’, brand:‘OSTROVIT’, price:3800, cat:‘Pre-Workout’, img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/p/u/pump_300g_cherry_en.png’, badge:‘جديد’, available:true },
{ id:‘6’, nameAr:‘BCAA + Glutamine 1000g’, nameEn:‘BCAA + Glutamine 1000g’, brand:‘OSTROVIT’, price:4500, cat:‘بروتين’, img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/b/c/bcaa_glutamine_1000g_strawberry_blueberry_en.png’, badge:’’, available:true },
{ id:‘7’, nameAr:‘كولاجين بحري 110 كبسولة’, nameEn:‘Marine Collagen 110 caps’, brand:‘OSTROVIT’, price:3200, cat:‘كولاجين’, img:’’, badge:’’, available:true },
{ id:‘8’, nameAr:‘Beauty Blend بشرة وشعر’, nameEn:‘Beauty Blend Hair & Skin’, brand:‘OSTROVIT’, price:2800, cat:‘كولاجين’, img:’’, badge:’’, available:true }
];

let currentCat = ‘all’;
let storeProducts = [];

function fixAvailable(p) {
return { …p, available: p.available === true || p.available === ‘true’ || p.available === ‘TRUE’ || p.available === 1 };
}

async function loadStoreProducts() {
const cached = localStorage.getItem(‘bb_products’);
const raw = cached ? JSON.parse(cached) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
storeProducts = raw.map(fixAvailable);
renderProducts(currentCat);
try {
const res = await fetch(GOOGLE_SCRIPT_URL + ‘?action=getProducts&t=’ + Date.now());
const text = await res.text();
const data = JSON.parse(text);
if (data.products && data.products.length > 0) {
storeProducts = data.products.map(fixAvailable);
localStorage.setItem(‘bb_products’, JSON.stringify(storeProducts));
renderProducts(currentCat);
}
} catch(e) {
console.error(‘Could not load products from Sheets:’, e);
}
}

function renderProducts(cat) {
const grid = document.getElementById(‘productsGrid’);
const filtered = cat === ‘all’ ? storeProducts : storeProducts.filter(p => p.cat === cat);
const available = filtered.filter(p => p.available);
if (available.length === 0) {
grid.innerHTML = ‘<div style="text-align:center;padding:60px;color:var(--muted);grid-column:1/-1">لا توجد منتجات في هذا التصنيف</div>’;
return;
}
const emoji = { بروتين:‘💪’, كرياتين:‘⚡’, فيتامينات:‘💊’, ‘Pre-Workout’:‘🔥’, كولاجين:‘✨’ };
grid.innerHTML = available.map(p => {
const name = currentLang === ‘ar’ ? p.nameAr : p.nameEn;
const em = emoji[p.cat] || ‘📦’;
return `<div class="product-card reveal" data-id="${p.id}" data-name-ar="${p.nameAr}" data-name-en="${p.nameEn}" data-price="${p.price}" data-img="${p.img||''}" data-cat="${p.cat}"> <div class="product-img"> ${p.img ? `<img src="${p.img}" alt="${name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:48px">${em}</div>`:`<div style="font-size:48px;display:flex;align-items:center;justify-content:center;width:100%;height:100%">${em}</div>`} ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''} </div> <div class="product-info"> <div class="product-brand">${p.brand}</div> <div class="product-name">${name}</div> <div class="product-price">${p.price.toLocaleString()} <span>DA</span></div> <button class="add-to-cart" onclick="addToCart(this)">${currentLang === 'ar' ? '🛒 أضف للسلة' : currentLang === 'fr' ? '🛒 Ajouter' : '🛒 Add to Cart'}</button> </div> </div>`;
}).join(’’);

// Re-observe for reveal
document.querySelectorAll(’.product-card.reveal:not(.visible)’).forEach((el, i) => {
const obs = new IntersectionObserver(entries => {
entries.forEach(e => {
if (e.isIntersecting) {
setTimeout(() => e.target.classList.add(‘visible’), i * 60);
obs.unobserve(e.target);
}
});
}, { threshold: 0.05 });
obs.observe(el);
});
}

function filterCat(cat, btn) {
currentCat = cat;
document.querySelectorAll(’.cat-btn’).forEach(b => b.classList.remove(‘active’));
if (btn) btn.classList.add(‘active’);
renderProducts(cat);
}
// Disable right-click context menu
document.addEventListener(‘contextmenu’, event => event.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.onkeydown = function(e) {
if (
e.keyCode === 123 || // F12
(e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
(e.ctrlKey && e.keyCode === 85) // Ctrl+U (View Source)
) {
return false;
}
};
loadStoreProducts();