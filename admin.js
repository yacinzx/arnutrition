// copyright YACINE DJEMAI instagram.com/xyaxinzx ©️
const ADMIN_PASSWORD = 'ar26';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbypYjLwH-a5hZx4BHC5q-yKs_e2GfZJTd7rGsVUhuZMhws2flsh-nJKQ4Pu1cEBwKeAdA/exec';

let allOrders = [], filteredOrders = [], currentFilter = 'all', currentOrderIndex = null, currentTab = 'orders', allProducts = [], editingProductId = null;

function login() {
  const pwd = document.getElementById('passwordInput').value;
  if (pwd === ADMIN_PASSWORD) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
  } else {
    const el = document.getElementById('loginError');
    el.textContent = '⚠️ كلمة المرور خاطئة';
    document.getElementById('passwordInput').style.borderColor = 'var(--red)';
    setTimeout(() => { el.textContent = ''; document.getElementById('passwordInput').style.borderColor = ''; }, 3000);
  }
}

function logout() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('passwordInput').value = '';
}

document.getElementById('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

async function loadOrders() {
  const L = '<div class="loading"><div class="spinner"></div><p style="margin-top:12px">جاري التحميل…</p></div>';
  document.getElementById('ordersTableContainer').innerHTML = L;
  document.getElementById('mobileOrdersContainer').innerHTML = L;
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL + '?action=get');
    const data = await res.json();
    allOrders = data.orders || [];
    localStorage.setItem('bb_orders', JSON.stringify(allOrders));
  } catch (e) {
    allOrders = JSON.parse(localStorage.getItem('bb_orders') || '[]');
  }
  updateStats(); applyFilter(currentFilter);
}

function updateStats() {
  const total = allOrders.length;
  const newO = allOrders.filter(o => o.status.includes('New') || o.status.includes('جديد')).length;
  const conf = allOrders.filter(o => o.status.includes('Confirmed') || o.status.includes('مؤكد')).length;
  const deliv = allOrders.filter(o => o.status.includes('Delivered') || o.status.includes('توصيل')).length;
  const canc = allOrders.filter(o => o.status.includes('Cancelled') || o.status.includes('ملغي')).length;
  const rev = allOrders.filter(o => !o.status.includes('Cancelled') && !o.status.includes('ملغي')).reduce((s, o) => s + parseInt(o.total.replace(/[^0-9]/g, '') || 0), 0);
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statNew').textContent = newO;
  document.getElementById('statConfirmed').textContent = conf;
  document.getElementById('statDelivered').textContent = deliv;
  document.getElementById('statRevenue').textContent = rev.toLocaleString();
  renderCharts(newO, conf, deliv, canc);
}

function renderCharts(newC, confirmed, delivered, cancelled) {
  const total = newC + confirmed + delivered + cancelled || 1;
  const statuses = [
    { label: 'جديد', value: newC, color: 'var(--red)' },
    { label: 'مؤكد', value: confirmed, color: 'var(--orange)' },
    { label: 'توصيل', value: delivered, color: 'var(--green)' },
    { label: 'ملغي', value: cancelled, color: 'var(--muted)' },
  ];
  document.getElementById('statusChart').innerHTML = statuses.map(s => `<div class="bar-row"><div class="bar-label">${s.label}</div><div class="bar-track"><div class="bar-fill" style="width:${(s.value/total*100).toFixed(0)}%;background:${s.color}"></div></div><div class="bar-value">${s.value}</div></div>`).join('');
  const wilayas = {};
  allOrders.forEach(o => { if (o.wilaya) wilayas[o.wilaya] = (wilayas[o.wilaya] || 0) + 1; });
  const top5 = Object.entries(wilayas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxW = top5[0]?.[1] || 1;
  document.getElementById('wilayaChart').innerHTML = top5.length ? top5.map(([w, v]) => `<div class="bar-row"><div class="bar-label">${w}</div><div class="bar-track"><div class="bar-fill" style="width:${(v/maxW*100).toFixed(0)}%;background:var(--gold)"></div></div><div class="bar-value">${v}</div></div>`).join('') : '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px">لا توجد بيانات بعد</div>';
}

function filterOrders(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyFilter(filter);
}

function applyFilter(filter) {
  filteredOrders = filter === 'all' ? [...allOrders] : allOrders.filter(o => o.status === filter || o.status.includes(filter.split(' ')[0]));
  const search = document.getElementById('searchInput')?.value || '';
  if (search) applySearch(search); else renderTable(filteredOrders);
}

function searchOrders(val) { applyFilter(currentFilter); if (val) applySearch(val); }

function applySearch(val) {
  const v = val.toLowerCase();
  renderTable(filteredOrders.filter(o => o.name?.toLowerCase().includes(v) || o.orderId?.toLowerCase().includes(v) || o.phone?.includes(v) || o.wilaya?.toLowerCase().includes(v)));
}

function getStatusClass(s) {
  if (s.includes('New') || s.includes('جديد')) return 'status-new';
  if (s.includes('Confirmed') || s.includes('مؤكد')) return 'status-confirmed';
  if (s.includes('Delivered') || s.includes('توصيل')) return 'status-delivered';
  return 'status-cancelled';
}

function getStatusLabel(s) {
  if (s.includes('New') || s.includes('جديد')) return '🔴 جديد';
  if (s.includes('Confirmed') || s.includes('مؤكد')) return '🟡 مؤكد';
  if (s.includes('Delivered') || s.includes('توصيل')) return '🟢 تم التوصيل';
  return '⚫ ملغي';
}

function actionBtns(o, realIdx, big) {
  const p = big ? '9px 8px' : '5px 10px';
  return `<button class="action-btn btn-view" style="padding:${p}" onclick="viewOrder(${realIdx})">👁 عرض</button> ${!o.status.includes('Delivered') && !o.status.includes('توصيل') ?`<button class="action-btn btn-deliver" style="padding:${p}" onclick="updateStatus(${realIdx},'تم التوصيل / Delivered')">🚚${big?' توصيل':''}</button>`: ''} ${o.status.includes('New') || o.status.includes('جديد') ?`<button class="action-btn btn-confirm" style="padding:${p}" onclick="updateStatus(${realIdx},'مؤكد / Confirmed')">✅${big?' تأكيد':''}</button>`: ''} ${!o.status.includes('Cancelled') && !o.status.includes('ملغي') ?`<button class="action-btn btn-cancel" style="padding:${p}" onclick="updateStatus(${realIdx},'ملغي / Cancelled')">✕${big?' إلغاء':''}</button>` : ''}`;
}

function renderTable(orders) {
  document.getElementById('ordersCount').textContent = orders.length + ' طلب';
  if (orders.length === 0) {
    const empty = '<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد طلبات</p></div>';
    document.getElementById('ordersTableContainer').innerHTML = empty;
    document.getElementById('mobileOrdersContainer').innerHTML = empty;
    return;
  }
  document.getElementById('ordersTableContainer').innerHTML = `<table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الولاية</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${ orders.map(o => { const ri = allOrders.indexOf(o); return `<tr><td><span class="order-id">${o.orderId||'-'}</span></td><td><strong>${o.name||'-'}</strong><br><span style="color:var(--muted);font-size:11px">${o.phone||''}</span></td><td>${o.wilaya||'-'}</td><td style="color:var(--muted);font-size:12px">${o.date||'-'}</td><td><strong style="color:var(--green)">${o.total||'-'}</strong></td><td><span class="status-badge ${getStatusClass(o.status)}">${getStatusLabel(o.status)}</span></td><td><div class="action-btns">${actionBtns(o,ri,false)}</div></td></tr>`; }).join('') }</tbody></table>`;
  document.getElementById('mobileOrdersContainer').innerHTML = orders.map(o => {
    const ri = allOrders.indexOf(o);
    return `<div class="order-card-m"><div class="order-card-m-top"><div><div class="order-id" style="font-size:20px">${o.orderId||'-'}</div><div style="font-size:14px;font-weight:700;margin-top:3px">${o.name||'-'}</div><div style="font-size:12px;color:var(--muted)">${o.phone||''} · ${o.wilaya||''}</div></div><div style="text-align:left"><span class="status-badge ${getStatusClass(o.status)}">${getStatusLabel(o.status)}</span><div style="color:var(--green);font-weight:900;font-size:16px;margin-top:6px">${o.total||'-'}</div></div></div><div style="font-size:11px;color:var(--muted2)">${o.date||''}</div><div class="order-card-m-actions">${actionBtns(o,ri,true)}</div></div>`;
  }).join('');
}

async function updateStatus(idx, newStatus) {
  allOrders[idx].status = newStatus;
  localStorage.setItem('bb_orders', JSON.stringify(allOrders));
  try { fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateStatus', orderId: allOrders[idx].orderId, status: newStatus }) }).catch(()=>{}); } catch (e) {}
  updateStats(); applyFilter(currentFilter);
}

function viewOrder(idx) {
  currentOrderIndex = idx;
  const o = allOrders[idx];
  const prods = o.products ? o.products.split('|').map(p => `<div class="product-line"><span>${p.trim()}</span></div>`).join('') : '';
  document.getElementById('orderDetailContent').innerHTML = `<div class="detail-grid"> <div class="detail-item"><label>رقم الطلب</label><p style="color:var(--gold);font-family:'Bebas Neue',sans-serif;font-size:22px">${o.orderId}</p></div> <div class="detail-item"><label>التاريخ</label><p>${o.date}</p></div> <div class="detail-item"><label>الاسم</label><p>${o.name}</p></div> <div class="detail-item"><label>الهاتف</label><p dir="ltr">${o.phone}</p></div> <div class="detail-item"><label>الولاية</label><p>${o.wilaya}</p></div> <div class="detail-item detail-full"><label>العنوان</label><p>${o.address}</p></div> ${o.notes ?`<div class="detail-item detail-full"><label>ملاحظات</label><p>${o.notes}</p></div>` : ''} </div> <div style="margin-bottom:16px"><label class="field-label" style="margin-bottom:8px">المنتجات المطلوبة</label> <div class="products-list">${prods}<div class="product-line"><span>المجموع</span><span>${o.total}</span></div></div> </div> <label class="field-label">تغيير الحالة</label> <select class="field-input" id="statusSelect" style="margin-top:4px"> <option value="جديد / New" ${o.status.includes('New')||o.status.includes('جديد')?'selected':''}>🔴 جديد</option> <option value="مؤكد / Confirmed" ${o.status.includes('Confirmed')||o.status.includes('مؤكد')?'selected':''}>🟡 مؤكد</option> <option value="تم التوصيل / Delivered" ${o.status.includes('Delivered')||o.status.includes('توصيل')?'selected':''}>🟢 تم التوصيل</option> <option value="ملغي / Cancelled" ${o.status.includes('Cancelled')||o.status.includes('ملغي')?'selected':''}>⚫ ملغي</option> </select> <button class="save-status-btn" onclick="saveStatusFromModal()">💾 حفظ الحالة</button>`;
  document.getElementById('orderDetailModal').classList.add('open');
}

async function saveStatusFromModal() { await updateStatus(currentOrderIndex, document.getElementById('statusSelect').value); closeDetailModal(); }
function closeDetailModal() { document.getElementById('orderDetailModal').classList.remove('open'); }
document.getElementById('orderDetailModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeDetailModal(); });

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabOrders').classList.toggle('active', tab === 'orders');
  document.getElementById('tabProducts').classList.toggle('active', tab === 'products');
  document.getElementById('tabTarifs').classList.toggle('active', tab === 'tarifs');
  document.getElementById('ordersTab').style.display = tab === 'orders' ? 'block' : 'none';
  document.getElementById('productsTab').style.display = tab === 'products' ? 'block' : 'none';
  document.getElementById('tarifsTab').style.display = tab === 'tarifs' ? 'block' : 'none';
  if (tab === 'products') renderProductsTable();
}
