const SHEET_NAME = ‘Orders’;
const PRODUCTS_SHEET = ‘Products’;

function doPost(e) {
try {
const data = JSON.parse(e.postData.contents);
const ss = SpreadsheetApp.getActiveSpreadsheet();


if (data.action === 'saveProducts') {
  let sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PRODUCTS_SHEET);
    sheet.appendRow(['id','nameAr','nameEn','brand','price','cat','img','badge','available']);
    sheet.getRange(1,1,1,9).setFontWeight('bold').setBackground('#e62020').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  const products = data.products || [];
  if (products.length > 0) {
    const rows = products.map(p => [
      p.id, p.nameAr, p.nameEn, p.brand, p.price,
      p.cat, p.img || '', p.badge || '',
      p.available === true || p.available === 'true' ? 'true' : 'false'
    ]);
    sheet.getRange(2, 1, rows.length, 9).setValues(rows);
  }
  return makeResponse({ success: true });
}


let sheet = ss.getSheetByName(SHEET_NAME);
if (!sheet) {
  sheet = ss.insertSheet(SHEET_NAME);
  sheet.appendRow([
    'Order ID', 'Name / الاسم', 'Phone / الهاتف',
    'Wilaya / الولاية', 'Address / العنوان',
    'Products / المنتجات', 'Total / المجموع',
    'Date / التاريخ', 'Status / الحالة', 'Notes / ملاحظات'
  ]);
  sheet.getRange(1,1,1,10).setFontWeight('bold').setBackground('#e62020').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

if (data.action === 'updateStatus') {
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.orderId)) {
      sheet.getRange(i + 1, 9).setValue(data.status);
      break;
    }
  }
  return makeResponse({ success: true });
}


sheet.appendRow([
  data.orderId || '', data.name || '', data.phone || '',
  data.wilaya || '', data.address || '', data.products || '',
  data.total || '', data.date || new Date().toLocaleString(),
  data.status || 'جديد / New', data.notes || ''
]);
sheet.autoResizeColumns(1, 10);

try {
  MailApp.sendEmail({
    to: 'yacinzecom@gmail.com',
    subject: `🛒 [AR Nutrition] طلب جديد ${data.orderId} — ${data.name}`,
    htmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f5;padding:20px;">
        <div style="background:#e62020;color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="margin:0;font-size:28px;">AR Nutrition.DZ</h1>
          <p style="margin:4px 0 0">طلب جديد / New Order</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;">
          <h2 style="color:#e62020;margin-top:0">طلب رقم: ${data.orderId}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold;width:40%">الاسم:</td><td style="padding:8px">${data.name}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">الهاتف:</td><td style="padding:8px">${data.phone}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">الولاية:</td><td style="padding:8px">${data.wilaya}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">العنوان:</td><td style="padding:8px">${data.address}</td></tr>
            <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">المنتجات:</td><td style="padding:8px">${data.products}</td></tr>
            <tr><td style="padding:8px;background:#e62020;color:white;font-weight:bold">المجموع:</td><td style="padding:8px;background:#e62020;color:white;font-weight:bold;font-size:20px">${data.total}</td></tr>
            ${data.notes ? `<tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">ملاحظات:</td><td style="padding:8px">${data.notes}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;text-align:center;">
            <p style="color:#888;font-size:12px">تم استلام الطلب في: ${data.date}</p>
          </div>
        </div>
      </div>`
  });
} catch(mailError) { Logger.log('Email error: ' + mailError); }

return makeResponse({ success: true, orderId: data.orderId });
```

} catch(error) {
return makeResponse({ success: false, error: error.toString() });
}
}

function doGet(e) {
try {
const ss = SpreadsheetApp.getActiveSpreadsheet();

if (e.parameter.action === 'getProducts') {
  const sheet = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return makeResponse({ products: [] });
  const rows = sheet.getDataRange().getValues();
  const products = rows.slice(1).map(r => ({
    id: String(r[0]),
    nameAr: r[1],
    nameEn: r[2],
    brand: r[3],
    price: Number(r[4]),
    cat: r[5],
    img: r[6],
    badge: r[7],
    available: String(r[8]).toLowerCase() === 'true'
  }));
  return makeResponse({ products });
}


const sheet = ss.getSheetByName(SHEET_NAME);
if (!sheet) return makeResponse({ orders: [] });
const rows = sheet.getDataRange().getValues();
const orders = rows.slice(1).map(row => ({
  orderId: row[0], name: row[1], phone: row[2],
  wilaya: row[3], address: row[4], products: row[5],
  total: row[6], date: row[7], status: row[8], notes: row[9]
})).reverse();
return makeResponse({ orders });


} catch(error) {
return makeResponse({ orders: [], error: error.toString() });
}
}

function makeResponse(data) {
return ContentService
.createTextOutput(JSON.stringify(data))
.setMimeType(ContentService.MimeType.JSON);
}