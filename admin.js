// copyright YACINE DJEMAI instagram.com/xyaxinzx ©️
const ADMIN_PASSWORD = ‘ar26’;
const GOOGLE_SCRIPT_URL = ‘https://script.google.com/macros/s/AKfycbypYjLwH-a5hZx4BHC5q-yKs_e2GfZJTd7rGsVUhuZMhws2flsh-nJKQ4Pu1cEBwKeAdA/exec’;

let allOrders = [], filteredOrders = [], currentFilter = ‘all’, currentOrderIndex = null, currentTab = ‘orders’, allProducts = [], editingProductId = null;

function login() {
const pwd = document.getElementById(‘passwordInput’).value;
if (pwd === ADMIN_PASSWORD) {
document.getElementById(‘loginScreen’).style.display = ‘none’;
document.getElementById(‘dashboard’).classList.add(‘active’);
loadOrders();
initTarifs();
} else {
const el = document.getElementById(‘loginError’);
el.textContent = ‘⚠️ Mot de passe incorrect / كلمة المرور خاطئة’;
document.getElementById(‘passwordInput’).style.borderColor = ‘var(–red)’;
setTimeout(() => { el.textContent = ‘’; document.getElementById(‘passwordInput’).style.borderColor = ‘’; }, 3000);
}
} else {
const el = document.getElementById(‘loginError’);
el.textContent = ‘⚠️ كلمة المرور خاطئة’;
document.getElementById(‘passwordInput’).style.borderColor = ‘var(–red)’;
setTimeout(() => { el.textContent = ‘’; document.getElementById(‘passwordInput’).style.borderColor = ‘’; }, 3000);
}
}

function logout() {
document.getElementById(‘loginScreen’).style.display = ‘flex’;
document.getElementById(‘dashboard’).classList.remove(‘active’);
document.getElementById(‘passwordInput’).value = ‘’;
}

document.getElementById(‘passwordInput’).addEventListener(‘keydown’, e => { if (e.key === ‘Enter’) login(); });

async function loadOrders() {
const L = ‘<div class="loading"><div class="spinner"></div><p style="margin-top:12px">جاري التحميل…</p></div>’;
document.getElementById(‘ordersTableContainer’).innerHTML = L;
document.getElementById(‘mobileOrdersContainer’).innerHTML = L;
try {
const res = await fetch(GOOGLE_SCRIPT_URL + ‘?action=get’);
const data = await res.json();
allOrders = data.orders || [];
localStorage.setItem(‘bb_orders’, JSON.stringify(allOrders));
} catch (e) {
allOrders = JSON.parse(localStorage.getItem(‘bb_orders’) || ‘[]’);
}
updateStats(); applyFilter(currentFilter);
}

function updateStats() {
const total = allOrders.length;
const newO = allOrders.filter(o => o.status.includes(‘New’) || o.status.includes(‘جديد’)).length;
const conf = allOrders.filter(o => o.status.includes(‘Confirmed’) || o.status.includes(‘مؤكد’)).length;
const deliv = allOrders.filter(o => o.status.includes(‘Delivered’) || o.status.includes(‘توصيل’)).length;
const canc = allOrders.filter(o => o.status.includes(‘Cancelled’) || o.status.includes(‘ملغي’)).length;
const rev = allOrders.filter(o => !o.status.includes(‘Cancelled’) && !o.status.includes(‘ملغي’)).reduce((s, o) => s + parseInt(o.total.replace(/[^0-9]/g, ‘’) || 0), 0);
document.getElementById(‘statTotal’).textContent = total;
document.getElementById(‘statNew’).textContent = newO;
document.getElementById(‘statConfirmed’).textContent = conf;
document.getElementById(‘statDelivered’).textContent = deliv;
document.getElementById(‘statRevenue’).textContent = rev.toLocaleString();
renderCharts(newO, conf, deliv, canc);
}

function renderCharts(newC, confirmed, delivered, cancelled) {
const total = newC + confirmed + delivered + cancelled || 1;
const statuses = [
{ label: ‘جديد’, value: newC, color: ‘var(–red)’ },
{ label: ‘مؤكد’, value: confirmed, color: ‘var(–orange)’ },
{ label: ‘توصيل’, value: delivered, color: ‘var(–green)’ },
{ label: ‘ملغي’, value: cancelled, color: ‘var(–muted)’ },
];
document.getElementById(‘statusChart’).innerHTML = statuses.map(s => `<div class="bar-row"><div class="bar-label">${s.label}</div><div class="bar-track"><div class="bar-fill" style="width:${(s.value/total*100).toFixed(0)}%;background:${s.color}"></div></div><div class="bar-value">${s.value}</div></div>`).join(’’);
const wilayas = {};
allOrders.forEach(o => { if (o.wilaya) wilayas[o.wilaya] = (wilayas[o.wilaya] || 0) + 1; });
const top5 = Object.entries(wilayas).sort((a, b) => b[1] - a[1]).slice(0, 5);
const maxW = top5[0]?.[1] || 1;
document.getElementById(‘wilayaChart’).innerHTML = top5.length ? top5.map(([w, v]) => `<div class="bar-row"><div class="bar-label">${w}</div><div class="bar-track"><div class="bar-fill" style="width:${(v/maxW*100).toFixed(0)}%;background:var(--gold)"></div></div><div class="bar-value">${v}</div></div>`).join(’’) : ‘<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">لا توجد بيانات بعد</div>’;
}

function filterOrders(filter, btn) {
currentFilter = filter;
document.querySelectorAll(’.filter-btn’).forEach(b => b.classList.remove(‘active’));
if (btn) btn.classList.add(‘active’);
applyFilter(filter);
}

function applyFilter(filter) {
filteredOrders = filter === ‘all’ ? […allOrders] : allOrders.filter(o => o.status === filter || o.status.includes(filter.split(’ ’)[0]));
const search = document.getElementById(‘searchInput’)?.value || ‘’;
if (search) applySearch(search); else renderTable(filteredOrders);
}

function searchOrders(val) { applyFilter(currentFilter); if (val) applySearch(val); }

function applySearch(val) {
const v = val.toLowerCase();
renderTable(filteredOrders.filter(o => o.name?.toLowerCase().includes(v) || o.orderId?.toLowerCase().includes(v) || o.phone?.includes(v) || o.wilaya?.toLowerCase().includes(v)));
}

function getStatusClass(s) {
if (s.includes(‘New’) || s.includes(‘جديد’)) return ‘status-new’;
if (s.includes(‘Confirmed’) || s.includes(‘مؤكد’)) return ‘status-confirmed’;
if (s.includes(‘Delivered’) || s.includes(‘توصيل’)) return ‘status-delivered’;
return ‘status-cancelled’;
}

function getStatusLabel(s) {
if (s.includes(‘New’) || s.includes(‘جديد’)) return ‘🔴 جديد’;
if (s.includes(‘Confirmed’) || s.includes(‘مؤكد’)) return ‘🟡 مؤكد’;
if (s.includes(‘Delivered’) || s.includes(‘توصيل’)) return ‘🟢 تم التوصيل’;
return ‘⚫ ملغي’;
}

function actionBtns(o, realIdx, big) {
const p = big ? ‘9px 8px’ : ‘5px 10px’;
return `<button class="action-btn btn-view" style="padding:${p}" onclick="viewOrder(${realIdx})">👁 Voir</button> ${!o.status.includes('Delivered') && !o.status.includes('توصيل') ?`<button class="action-btn btn-deliver" style="padding:${p}" onclick="updateStatus(${realIdx},'تم التوصيل / Delivered')">🚚${big?’ توصيل’:’’}</button>`: ''} ${o.status.includes('New') || o.status.includes('جديد') ?`<button class="action-btn btn-confirm" style="padding:${p}" onclick="updateStatus(${realIdx},'مؤكد / Confirmed')">✅${big?’ تأكيد’:’’}</button>`: ''} ${!o.status.includes('Cancelled') && !o.status.includes('ملغي') ?`<button class="action-btn btn-cancel" style="padding:${p}" onclick="updateStatus(${realIdx},'ملغي / Cancelled')">✕${big?’ إلغاء’:’’}</button>` : ''}`;
}

function renderTable(orders) {
document.getElementById(‘ordersCount’).textContent = orders.length + ’ طلب’;
if (orders.length === 0) {
const empty = ‘<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد طلبات</p></div>’;
document.getElementById(‘ordersTableContainer’).innerHTML = empty;
document.getElementById(‘mobileOrdersContainer’).innerHTML = empty;
return;
}
document.getElementById(‘ordersTableContainer’).innerHTML = `<table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الولاية</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${ orders.map(o => { const ri = allOrders.indexOf(o); return `<tr><td><span class="order-id">${o.orderId||’-’}</span></td><td><strong>${o.name||’-’}</strong><br><span style="color:var(--muted);font-size:11px">${o.phone||’’}</span></td><td>${o.wilaya||’-’}</td><td style="color:var(--muted);font-size:12px">${o.date||’-’}</td><td><strong style="color:var(--green)">${o.total||’-’}</strong></td><td><span class="status-badge ${getStatusClass(o.status)}">${getStatusLabel(o.status)}</span></td><td><div class="action-btns">${actionBtns(o,ri,false)}</div></td></tr>`; }).join('') }</tbody></table>`;
document.getElementById(‘mobileOrdersContainer’).innerHTML = orders.map(o => {
const ri = allOrders.indexOf(o);
return `<div class="order-card-m"><div class="order-card-m-top"><div><div class="order-id" style="font-size:20px">${o.orderId||'-'}</div><div style="font-size:14px;font-weight:700;margin-top:3px">${o.name||'-'}</div><div style="font-size:12px;color:var(--muted)">${o.phone||''} · ${o.wilaya||''}</div></div><div style="text-align:left"><span class="status-badge ${getStatusClass(o.status)}">${getStatusLabel(o.status)}</span><div style="color:var(--green);font-weight:900;font-size:16px;margin-top:6px">${o.total||'-'}</div></div></div><div style="font-size:11px;color:var(--muted2)">${o.date||''}</div><div class="order-card-m-actions">${actionBtns(o,ri,true)}</div></div>`;
}).join(’’);
}

async function updateStatus(idx, newStatus) {
allOrders[idx].status = newStatus;
localStorage.setItem(‘bb_orders’, JSON.stringify(allOrders));
try { fetch(GOOGLE_SCRIPT_URL, { method: ‘POST’, mode: ‘no-cors’, headers: { ‘Content-Type’: ‘text/plain’ }, body: JSON.stringify({ action: ‘updateStatus’, orderId: allOrders[idx].orderId, status: newStatus }) }).catch(()=>{}); } catch (e) {}
updateStats(); applyFilter(currentFilter);
}

function viewOrder(idx) {
currentOrderIndex = idx;
const o = allOrders[idx];
const prods = o.products ? o.products.split(’|’).map(p => `<div class="product-line"><span>${p.trim()}</span></div>`).join(’’) : ‘’;
document.getElementById(‘orderDetailContent’).innerHTML = `<div class="detail-grid"> <div class="detail-item"><label>N° Commande</label><p style="color:var(--gold);font-family:'Bebas Neue',sans-serif;font-size:22px">${o.orderId}</p></div> <div class="detail-item"><label>Date / التاريخ</label><p>${o.date}</p></div> <div class="detail-item"><label>Nom / الاسم</label><p>${o.name}</p></div> <div class="detail-item"><label>Téléphone / الهاتف</label><p dir="ltr">${o.phone}</p></div> <div class="detail-item"><label>Wilaya / الولاية</label><p>${o.wilaya}</p></div> <div class="detail-item detail-full"><label>Adresse / العنوان</label><p>${o.address}</p></div> ${o.notes ?`<div class="detail-item detail-full"><label>Notes / ملاحظات</label><p>${o.notes}</p></div>` : ''} </div> <div style="margin-bottom:16px"><label class="field-label" style="margin-bottom:8px">Produits commandés / المنتجات</label> <div class="products-list">${prods}<div class="product-line"><span>Total / المجموع</span><span>${o.total}</span></div></div> </div> <label class="field-label">Changer le statut / تغيير الحالة</label> <select class="field-input" id="statusSelect" style="margin-top:4px"> <option value="جديد / New / Nouveau" ${o.status.includes('New')||o.status.includes('جديد')?'selected':''}>🔴 Nouveau / جديد</option> <option value="مؤكد / Confirmed / Confirmé" ${o.status.includes('Confirmed')||o.status.includes('مؤكد')?'selected':''}>🟡 Confirmé / مؤكد</option> <option value="تم التوصيل / Delivered / Livré" ${o.status.includes('Delivered')||o.status.includes('توصيل')?'selected':''}>🟢 Livré / تم التوصيل</option> <option value="ملغي / Cancelled / Annulé" ${o.status.includes('Cancelled')||o.status.includes('ملغي')?'selected':''}>⚫ Annulé / ملغي</option> </select> <button class="save-status-btn" onclick="saveStatusFromModal()">💾 Enregistrer / حفظ</button>`;
document.getElementById(‘orderDetailModal’).classList.add(‘open’);
}

async function saveStatusFromModal() { await updateStatus(currentOrderIndex, document.getElementById(‘statusSelect’).value); closeDetailModal(); }
function closeDetailModal() { document.getElementById(‘orderDetailModal’).classList.remove(‘open’); }
document.getElementById(‘orderDetailModal’).addEventListener(‘click’, e => { if (e.target === e.currentTarget) closeDetailModal(); });

function switchTab(tab) {
currentTab = tab;
document.getElementById(‘tabOrders’).classList.toggle(‘active’, tab === ‘orders’);
document.getElementById(‘tabProducts’).classList.toggle(‘active’, tab === ‘products’);
document.getElementById(‘tabTarifs’).classList.toggle(‘active’, tab === ‘tarifs’);
document.getElementById(‘ordersTab’).style.display = tab === ‘orders’ ? ‘block’ : ‘none’;
document.getElementById(‘productsTab’).style.display = tab === ‘products’ ? ‘block’ : ‘none’;
document.getElementById(‘tarifsTab’).style.display = tab === ‘tarifs’ ? ‘block’ : ‘none’;
if (tab === ‘products’) renderProductsTable();
}

function refreshCurrent() {
if (currentTab === ‘orders’) { loadOrders(); initTarifs(); }
else if (currentTab === ‘products’) { renderProductsTable(); }
else if (currentTab === ‘tarifs’) { initTarifs(); }
}

const DEFAULT_PRODUCTS = [
{id:‘1’,nameAr:‘كرياتين مونوهيدرات 300g’,nameEn:‘Creatine Monohydrate 300g’,brand:‘OSTROVIT’,price:2800,cat:‘كرياتين’,img:‘https://www.performecenternutrition.com/1857-large_default/creatine-monohydrate-neutre.jpg’,badge:‘جديد’,available:true},
{id:‘2’,nameAr:‘فيتامين D3 + كالسيوم’,nameEn:‘Vitamin D3 + Calcium’,brand:‘OSTROVIT’,price:1900,cat:‘فيتامينات’,img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/v/i/vitamin_d3_k2_1000_iu_200_mcg_90_tabs_en.png’,badge:’’,available:true},
{id:‘3’,nameAr:‘100% كرياتين 500g’,nameEn:‘100% Creatine 500g’,brand:‘BIOTECHUSA’,price:6200,cat:‘كرياتين’,img:‘https://www.nocsy.fr/wp-content/uploads/2024/08/avis-creatine-biotech-usa.jpg’,badge:‘متوفر’,available:true},
{id:‘4’,nameAr:‘أشواغاندا KSM-66’,nameEn:‘Ashwagandha KSM-66’,brand:‘MYVITAMINS’,price:2500,cat:‘فيتامينات’,img:’’,badge:’’,available:true},
{id:‘5’,nameAr:‘PUMP Pre-Workout 300g’,nameEn:‘PUMP Pre-Workout 300g’,brand:‘OSTROVIT’,price:3800,cat:‘Pre-Workout’,img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/p/u/pump_300g_cherry_en.png’,badge:‘جديد’,available:true},
{id:‘6’,nameAr:‘BCAA + Glutamine 1000g’,nameEn:‘BCAA + Glutamine 1000g’,brand:‘OSTROVIT’,price:4500,cat:‘بروتين’,img:‘https://static.ostrovit.com/catalog/product/cache/image/1800x1800/e9c3970ab036de70892d86c6d221abfe/b/c/bcaa_glutamine_1000g_strawberry_blueberry_en.png’,badge:’’,available:true},
{id:‘7’,nameAr:‘كولاجين بحري 110 كبسولة’,nameEn:‘Marine Collagen 110 caps’,brand:‘OSTROVIT’,price:3200,cat:‘كولاجين’,img:’’,badge:’’,available:true},
{id:‘8’,nameAr:‘Beauty Blend بشرة وشعر’,nameEn:‘Beauty Blend Hair & Skin’,brand:‘OSTROVIT’,price:2800,cat:‘كولاجين’,img:’’,badge:’’,available:true}
];

async function getProducts() {
try {
const res = await fetch(GOOGLE_SCRIPT_URL + ‘?action=getProducts&t=’ + Date.now());
const data = await res.json();
if (data.products && data.products.length > 0) {
const products = data.products.map(p => ({
…p,
id: String(p.id),
available: p.available === true || p.available === ‘true’ || p.available === ‘TRUE’
}));
localStorage.setItem(‘bb_products’, JSON.stringify(products));
allProducts = products;
return products;
}
} catch(e) {}
const s = localStorage.getItem(‘bb_products’);
const raw = s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
const products = raw.map(p => ({
…p,
id: String(p.id),
available: p.available === true || p.available === ‘true’ || p.available === ‘TRUE’
}));
allProducts = products;
return products;
}

async function saveProducts(products) {
const normalized = products.map(p => ({
…p,
id: String(p.id),
available: p.available === true || p.available === ‘true’ || p.available === ‘TRUE’
}));
localStorage.setItem(‘bb_products’, JSON.stringify(normalized));
allProducts = normalized;
try {
// Use no-cors mode; GAS handles POST body via e.postData.contents
fetch(GOOGLE_SCRIPT_URL, {
method: ‘POST’,
mode: ‘no-cors’,
headers: { ‘Content-Type’: ‘text/plain’ },
body: JSON.stringify({ action: ‘saveProducts’, products: normalized })
}).catch(e => console.warn(‘Sheets sync:’, e));
} catch(e) { console.error(‘Sheets sync failed:’, e); }
}

function catEmoji(c) { return c===‘بروتين’?‘💪’:c===‘كرياتين’?‘⚡’:c===‘فيتامينات’?‘💊’:c===‘Pre-Workout’?‘🔥’:c===‘كولاجين’?‘✨’:c===‘Mass Gainer’?‘💪’:c===‘Fat Burner’?‘🔥’:c===‘أحماض أمينية’?‘🧬’:c===‘مكملات صحية’?‘🌿’:‘📦’; }

async function renderProductsTable() {
allProducts = await getProducts();
if (allProducts.length === 0) {
const empty = ‘<div class="empty-state"><div class="empty-icon">📦</div><p>لا توجد منتجات</p></div>’;
document.getElementById(‘productsTableContainer’).innerHTML = empty;
document.getElementById(‘mobileProductsContainer’).innerHTML = empty;
return;
}

const imgEl = p => p.img
? `<img src="${p.img}" onerror="this.style.display='none';this.nextSibling.style.display='flex'" class="product-thumb"><span style="display:none;width:44px;height:44px;align-items:center;justify-content:center;font-size:22px;background:var(--surface2);border-radius:8px">${catEmoji(p.cat)}</span>`
: `<span style="display:flex;width:44px;height:44px;align-items:center;justify-content:center;font-size:22px;background:var(--surface2);border-radius:8px">${catEmoji(p.cat)}</span>`;

document.getElementById(‘productsTableContainer’).innerHTML = `<table><thead><tr><th>Photo</th><th>Produit / المنتج</th><th>Marque / البراند</th><th>Prix / السعر</th><th>Catégorie</th><th>Dispo / التوفر</th><th>Actions</th></tr></thead><tbody>${ allProducts.map(p => `<tr>
<td>${imgEl(p)}</td>
<td><strong style="font-size:14px">${p.nameAr}</strong><br><span style="color:var(--muted);font-size:11px">${p.nameEn}</span>${p.badge?`<span style="display:inline-block;margin-right:6px;background:rgba(230,32,32,0.15);color:var(--red);border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700">${p.badge}</span>`:’’}</td>
<td><span style="color:var(--gold);font-weight:700;font-size:12px">${p.brand}</span></td>
<td><strong style="color:var(--green)">${p.price.toLocaleString()} DA</strong></td>
<td><span style="font-size:12px;color:var(--muted);background:var(--surface2);padding:3px 8px;border-radius:6px">${p.cat}</span></td>
<td><button class="avail-toggle" onclick="toggleAvailability('${p.id}')">${p.available?‘🟢’:‘🔴’}</button> <span style="font-size:11px;color:var(--muted)">${p.available?‘Dispo / متوفر’:‘Épuisé / نفد’}</span></td>
<td><div class="action-btns"><button class="action-btn btn-view" onclick="openProductModal('${p.id}')">✏️ Modifier</button><button class="action-btn btn-cancel" onclick="deleteProduct('${p.id}')">🗑</button></div></td>

  </tr>`).join('')
}</tbody></table>`;

document.getElementById(‘mobileProductsContainer’).innerHTML = allProducts.map(p => `

  <div class="product-card-m">
    ${p.img ? `<img src="${p.img}" onerror="this.style.background='var(--surface3)'" class="product-card-m-img">` : `<div class="product-card-m-img" style="display:flex;align-items:center;justify-content:center;font-size:24px">${catEmoji(p.cat)}</div>`}
    <div class="product-card-m-info">
      <div style="font-size:14px;font-weight:700;margin-bottom:2px">${p.nameAr}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">${p.nameEn} · <span style="color:var(--gold)">${p.brand}</span></div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span style="color:var(--green);font-weight:900;font-size:15px">${p.price.toLocaleString()} DA</span>
        <span style="font-size:11px;color:var(--muted);background:var(--surface3);padding:2px 8px;border-radius:6px">${p.cat}</span>
        <button class="avail-toggle" style="font-size:16px" onclick="toggleAvailability('${p.id}')">${p.available?'🟢':'🔴'}</button>
      </div>
      <div class="product-card-m-actions">
        <button class="action-btn btn-view" onclick="openProductModal('${p.id}')">✏️ Modifier</button>
        <button class="action-btn btn-cancel" onclick="deleteProduct('${p.id}')">🗑 Supprimer</button>
      </div>
    </div>
  </div>`).join('');

}

async function toggleAvailability(id) {
if (!allProducts || allProducts.length === 0) allProducts = await getProducts();
const p = allProducts.find(x => String(x.id) === String(id));
if (p) { p.available = !p.available; await saveProducts(allProducts); renderProductsTable(); }
}

// ── CATEGORY SELECT (no pills) ──────────────────────────
function selectCatPill(btn) { /* unused, kept for compat */ }

function _syncCatPills(cat) {
const sel = document.getElementById(‘p-cat’);
if (sel) sel.value = cat || ‘بروتين’;
}

// ── IMAGE URL ONLY ─────────────────────────────────────────
function onImgUrlChange() {
const url = document.getElementById(‘p-img’).value.trim();
if (url) {
document.getElementById(‘img-preview’).src = url;
document.getElementById(‘img-preview-wrap’).style.display = ‘block’;
} else {
document.getElementById(‘img-preview-wrap’).style.display = ‘none’;
}
}

function clearImgPreview() {
document.getElementById(‘p-img’).value = ‘’;
document.getElementById(‘img-preview’).src = ‘’;
document.getElementById(‘img-preview-wrap’).style.display = ‘none’;
}

async function openProductModal(id) {
editingProductId = id ? String(id) : null;
document.getElementById(‘productModalTitle’).textContent = id ? ‘تعديل المنتج’ : ‘إضافة منتج جديد’;
document.getElementById(‘product-msg’).textContent = ‘’;
if (!allProducts || allProducts.length === 0) allProducts = await getProducts();
if (id) {
const p = allProducts.find(x => String(x.id) === String(id));
if (!p) { console.error(‘Product not found:’, id); return; }
document.getElementById(‘p-name-ar’).value = p.nameAr;
document.getElementById(‘p-name-en’).value = p.nameEn;
document.getElementById(‘p-brand’).value = p.brand;
document.getElementById(‘p-price’).value = p.price;
_syncCatPills(p.cat || ‘بروتين’);
document.getElementById(‘p-img’).value = p.img || ‘’;
if (p.img) {
document.getElementById(‘img-preview’).src = p.img;
document.getElementById(‘img-preview-wrap’).style.display = ‘block’;
} else {
document.getElementById(‘img-preview-wrap’).style.display = ‘none’;
}
document.getElementById(‘p-badge’).value = p.badge || ‘’;
// ✅ Simple checkbox — same as PowerX which works correctly
document.getElementById(‘p-available’).checked = p.available === true || p.available === ‘true’;
} else {
[‘p-name-ar’,‘p-name-en’,‘p-brand’,‘p-price’,‘p-img’,‘p-badge’].forEach(i => document.getElementById(i).value = ‘’);
_syncCatPills(‘بروتين’);
document.getElementById(‘img-preview-wrap’).style.display = ‘none’;
// ✅ Default to checked (available) for new products
document.getElementById(‘p-available’).checked = true;
}
document.getElementById(‘productModal’).classList.add(‘open’);
}

function closeProductModal() { document.getElementById(‘productModal’).classList.remove(‘open’); }
document.getElementById(‘productModal’).addEventListener(‘click’, e => { if (e.target === e.currentTarget) closeProductModal(); });

async function saveProduct() {
const nameAr = document.getElementById(‘p-name-ar’).value.trim();
const nameEn = document.getElementById(‘p-name-en’).value.trim();
const brand  = document.getElementById(‘p-brand’).value.trim();
const price  = parseInt(document.getElementById(‘p-price’).value);
const cat    = document.getElementById(‘p-cat’).value;
const img    = document.getElementById(‘p-img’).value.trim();
const badge  = document.getElementById(‘p-badge’).value.trim();
// ✅ Read checkbox directly — identical to PowerX
const available = document.getElementById(‘p-available’).checked;
const msgEl = document.getElementById(‘product-msg’);

if (!nameAr || !nameEn || !brand || !price) {
msgEl.style.color = ‘var(–red)’; msgEl.textContent = ‘⚠️ Veuillez remplir tous les champs requis’; return;
}
if (!allProducts || allProducts.length === 0) allProducts = await getProducts();
if (editingProductId) {
const idx = allProducts.findIndex(x => String(x.id) === String(editingProductId));
if (idx !== -1) {
allProducts[idx] = { …allProducts[idx], nameAr, nameEn, brand, price, cat, img, badge, available };
} else {
msgEl.style.color = ‘var(–red)’; msgEl.textContent = ‘⚠️ Erreur: produit introuvable’; return;
}
} else {
allProducts.push({ id: String(Date.now()), nameAr, nameEn, brand, price, cat, img, badge, available });
}
msgEl.style.color = ‘var(–gold)’; msgEl.textContent = ‘⏳ Enregistrement…’;
await saveProducts(allProducts);
msgEl.style.color = ‘var(–green)’; msgEl.textContent = ‘✅ Enregistré avec succès!’;
setTimeout(() => { closeProductModal(); renderProductsTable(); }, 700);

}

async function deleteProduct(id) {
if (!confirm(‘هل أنت متأكد من حذف هذا المنتج؟’)) return;
if (!allProducts || allProducts.length === 0) allProducts = await getProducts();
await saveProducts(allProducts.filter(x => String(x.id) !== String(id)));
renderProductsTable();
}

// Disable right-click context menu
document.addEventListener(‘contextmenu’, event => event.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.onkeydown = function(e) {
if (
e.keyCode === 123 ||
(e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
(e.ctrlKey && e.keyCode === 85)
) { return false; }
};

/* ════════════════════════════════════
DELIVERY TARIFS DATA
════════════════════════════════════ */
const ANDESRON_TARIFS = [
{n:1,  name:‘Adrar / أدرار’,        stop:700,  home:1400},
{n:2,  name:‘Chlef / الشلف’,        stop:450,  home:800},
{n:3,  name:‘Laghouat / الأغواط’,   stop:550,  home:950},
{n:4,  name:‘Oum el Bouaghi / أم البواقي’, stop:450, home:800},
{n:5,  name:‘Batna / باتنة’,        stop:450,  home:800},
{n:6,  name:‘Bejaia / بجاية’,       stop:450,  home:800},
{n:7,  name:‘Biskra / بسكرة’,       stop:500,  home:900},
{n:8,  name:‘Bechar / بشار’,        stop:650,  home:1100},
{n:9,  name:‘Blida / البليدة’,      stop:450,  home:800},
{n:10, name:‘Brouira / البويرة’,    stop:450,  home:750},
{n:11, name:‘Tamanrasset / تمنراست’,stop:650,  home:1600},
{n:12, name:‘Tébessa / تبسة’,       stop:450,  home:800},
{n:13, name:‘Tlemcen / تلمسان’,     stop:450,  home:800},
{n:14, name:‘Tiaret / تيارت’,       stop:650,  home:800},
{n:15, name:‘Tizi Ouazou / تيزي وزو’,stop:450, home:800},
{n:16, name:‘Alger / الجزائر’,      stop:400,  home:600},
{n:17, name:‘Djelfa / الجلفة’,      stop:550,  home:950},
{n:18, name:‘Jijel / جيجل’,         stop:300,  home:700},
{n:19, name:‘Sétif / سطيف’,         stop:450,  home:700},
{n:20, name:‘Saida / سعيدة’,        stop:450,  home:750},
{n:21, name:‘Skikda / سكيكدة’,      stop:450,  home:750},
{n:22, name:‘Sidi bel Abbes / سيدي بلعباس’, stop:450, home:750},
{n:23, name:‘Annaba / عنابة’,       stop:450,  home:750},
{n:24, name:‘Guelma / قالمة’,       stop:450,  home:750},
{n:25, name:‘Constantine / قسنطينة’,stop:450,  home:750},
{n:26, name:‘Médéa / المدية’,       stop:450,  home:800},
{n:27, name:‘Mostaganem / مستغانم’, stop:450,  home:800},
{n:28, name:‘Msila / المسيلة’,      stop:450,  home:850},
{n:29, name:‘Mascara / معسكر’,      stop:450,  home:800},
{n:30, name:‘Ouargia / ورقلة’,      stop:500,  home:950},
{n:31, name:‘Oran / وهران’,         stop:450,  home:750},
{n:32, name:‘El Bayadh / البيض’,    stop:550,  home:1100},
{n:33, name:‘Illizi / إليزي’,       stop:null, home:1600},
{n:34, name:‘Bordj B.arriredj / برج بوعريريج’, stop:450, home:600},
{n:35, name:‘Boumerdes / بومرداس’,  stop:450,  home:750},
{n:36, name:‘Taref / الطارف’,       stop:450,  home:800},
{n:37, name:‘Tindouf / تندوف’,      stop:null, home:800},
{n:38, name:‘Tissemsilt / تسمسيلت’, stop:null, home:800},
{n:39, name:‘El Oued / الوادي’,     stop:550,  home:950},
{n:40, name:‘Khenchela / خنشلة’,    stop:450,  home:800},
{n:41, name:‘Souk Ahras / سوق أهراس’,stop:450, home:750},
{n:42, name:‘Tipaza / تيبازة’,      stop:450,  home:750},
{n:43, name:‘Mila / ميلة’,          stop:450,  home:750},
{n:44, name:‘Ain Defla / عين الدفلى’,stop:450, home:850},
{n:45, name:‘Naama / النعامة’,      stop:550,  home:1100},
{n:46, name:‘Ain T’émouchent / عين تيموشنت’, stop:500, home:950},
{n:47, name:‘Ghardaia / غرداية’,    stop:600,  home:950},
{n:48, name:‘Relizane / غليزان’,    stop:450,  home:850},
{n:49, name:‘Timimoun / تيميمون’,   stop:null, home:1400},
{n:50, name:‘Bordj badji Mokhtar / برج باجي مختار’, stop:null, home:2000},
{n:51, name:‘Ouled Djellal / أولاد جلال’, stop:null, home:900},
{n:52, name:‘Beni Abbes / بني عباس’, stop:null, home:1000},
{n:53, name:‘In Salah / عين صالح’,  stop:800,  home:1600},
{n:54, name:‘In Guezzam / عين قزام’, stop:null, home:1600},
{n:55, name:‘Touggourt / توقرت’,    stop:550,  home:950},
{n:56, name:‘Djanet / جانت’,        stop:null, home:1200},
{n:57, name:‘El Mghair / المغير’,   stop:450,  home:950},
{n:58, name:‘El Meniaa / المنيعة’,  stop:null, home:1000},
];

const SWIFT_TARIFS = [
{n:1,  name:‘Adrar / أدرار’,        stop:900,  home:1400},
{n:2,  name:‘Chlef / الشلف’,        stop:400,  home:700},
{n:3,  name:‘Laghouat / الأغواط’,   stop:550,  home:900},
{n:4,  name:‘Oum El Bouaghi / أم البواقي’, stop:450, home:750},
{n:5,  name:‘Batna / باتنة’,        stop:450,  home:750},
{n:6,  name:‘Béjaïa / بجاية’,       stop:450,  home:750},
{n:7,  name:‘Biskra / بسكرة’,       stop:550,  home:850},
{n:8,  name:‘Béchar / بشار’,        stop:1000, home:1400},
{n:9,  name:‘Blida / البليدة’,      stop:400,  home:600},
{n:10, name:‘Bouira / البويرة’,     stop:400,  home:700},
{n:11, name:‘Tamanrasset / تمنراست’,stop:null, home:null},
{n:12, name:‘Tebessa / تبسة’,       stop:500,  home:800},
{n:13, name:‘Tlemcen / تلمسان’,     stop:450,  home:750},
{n:14, name:‘Tiaret / تيارت’,       stop:450,  home:750},
{n:15, name:‘Tizi Ouzou / تيزي وزو’,stop:400,  home:700},
{n:16, name:‘Alger / الجزائر’,      stop:350,  home:450},
{n:17, name:‘Djelfa / الجلفة’,      stop:500,  home:850},
{n:18, name:‘Jijel / جيجل’,         stop:450,  home:750},
{n:19, name:‘Sétif / سطيف’,         stop:400,  home:700},
{n:20, name:‘Saïda / سعيدة’,        stop:500,  home:800},
{n:21, name:‘Skikda / سكيكدة’,      stop:450,  home:750},
{n:22, name:‘Sidi Bel Abbès / سيدي بلعباس’, stop:450, home:750},
{n:23, name:‘Annaba / عنابة’,       stop:450,  home:750},
{n:24, name:‘Guelma / قالمة’,       stop:500,  home:800},
{n:25, name:‘Constantine / قسنطينة’,stop:400,  home:700},
{n:26, name:‘Médéa / المدية’,       stop:400,  home:700},
{n:27, name:‘Mostaganem / مستغانم’, stop:450,  home:750},
{n:28, name:‘Msila / المسيلة’,      stop:450,  home:750},
{n:29, name:‘Mascara / معسكر’,      stop:500,  home:800},
{n:30, name:‘Ouargla / ورقلة’,      stop:650,  home:950},
{n:31, name:‘Oran / وهران’,         stop:400,  home:700},
{n:32, name:‘El Bayadh / البيض’,    stop:650,  home:1000},
{n:33, name:‘Illizi / إليزي’,       stop:null, home:null},
{n:34, name:‘Bordj Bou Arreridj / برج بوعريريج’, stop:400, home:700},
{n:35, name:‘Boumerdès / بومرداس’,  stop:400,  home:650},
{n:36, name:‘El Tarf / الطارف’,     stop:500,  home:850},
{n:37, name:‘Tindouf / تندوف’,      stop:null, home:null},
{n:38, name:‘Tissemsilt / تسمسيلت’, stop:450,  home:750},
{n:39, name:‘El Oued / الوادي’,     stop:650,  home:900},
{n:40, name:‘Khenchela / خنشلة’,    stop:450,  home:800},
{n:41, name:‘Souk Ahras / سوق أهراس’,stop:450, home:800},
{n:42, name:‘Tipaza / تيبازة’,      stop:400,  home:650},
{n:43, name:‘Mila / ميلة’,          stop:450,  home:750},
{n:44, name:‘Aïn Defla / عين الدفلى’,stop:400, home:700},
{n:45, name:‘Naâma / النعامة’,      stop:650,  home:850},
{n:46, name:‘Aïn Témouchent / عين تيموشنت’, stop:500, home:750},
{n:47, name:‘Ghardaïa / غرداية’,    stop:650,  home:950},
{n:48, name:‘Relizane / غليزان’,    stop:450,  home:750},
{n:49, name:‘Timimoun / تيميمون’,   stop:null, home:null},
{n:50, name:‘Bordj Badji Mokhtar / برج باجي مختار’, stop:null, home:null},
{n:51, name:‘Ouled Djellal / أولاد جلال’, stop:null, home:null},
{n:52, name:‘Beni Abbès / بني عباس’, stop:null, home:null},
{n:53, name:‘In Salah / عين صالح’,  stop:null, home:null},
{n:54, name:‘In Guezzam / عين قزام’, stop:null, home:null},
{n:55, name:‘Touggourt / توقرت’,    stop:700,  home:950},
{n:56, name:‘Djanet / جانت’,        stop:null, home:null},
{n:57, name:‘El M’Ghair / المغير’, stop:600,  home:950},
{n:58, name:‘Meniaa / المنيعة’,     stop:700,  home:950},
];

function renderTarifTable(data, tbodyId) {
const tbody = document.getElementById(tbodyId);
if (!tbody) return;
tbody.innerHTML = data.map(r => {
const stop = r.stop != null ? `<strong>${r.stop.toLocaleString()} DA</strong>` : ‘<span style="color:var(--muted)">—</span>’;
const home = r.home != null ? `<strong>${r.home.toLocaleString()} DA</strong>` : ‘<span style="color:var(--muted)">—</span>’;
const unavail = r.stop == null && r.home == null;
return `<tr class="${unavail ? 'tarif-unavail' : ''}"> <td style="color:var(--muted);font-size:12px;width:36px">${r.n}</td> <td style="font-weight:700;font-size:13px">${r.name}</td> <td style="text-align:center">${stop}</td> <td style="text-align:center">${home}</td> </tr>`;
}).join(’’);
}

function showCarrier(carrier, btn) {
document.querySelectorAll(’.tarif-carrier-btn’).forEach(b => b.classList.remove(‘active’));
if (btn) btn.classList.add(‘active’);
document.getElementById(‘tarif-andesron’).style.display = carrier === ‘andesron’ ? ‘block’ : ‘none’;
document.getElementById(‘tarif-swift’).style.display = carrier === ‘swift’ ? ‘block’ : ‘none’;
}

function initTarifs() {
renderTarifTable(ANDESRON_TARIFS, ‘andesronTableBody’);
renderTarifTable(SWIFT_TARIFS, ‘swiftTableBody’);
}
