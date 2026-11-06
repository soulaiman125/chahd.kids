const pixel = process.env.META_PIXEL_ID?.trim();
if (pixel && !/^\d{5,30}$/.test(pixel)) throw new Error('META_PIXEL_ID must be the numeric public Pixel ID.');

export const priceOf = product => Number.isFinite(product.price) && product.price > 0 &&
  (!product.currency || product.currency === 'MAD') ? product.price : null;

const money = new Intl.NumberFormat('ar-MA', { style: 'currency', currency: 'MAD' });
export const priceLabel = product => {
  const price = priceOf(product);
  return price === null ? 'الثمن والتوفر عبر واتساب' : money.format(price);
};

const panel = '<!-- MARKETING-BODY -->' +
  '<aside class="marketing-panel" id="marketing-preferences" aria-labelledby="marketing-title" hidden>' +
  '<h2 id="marketing-title">اختيارات الخصوصية</h2>' +
  '<p>بموافقتك، نقدروا نقيسوا نتائج الإعلانات ونضيفوا رمز الحملة لمسودة طلب واتساب. ملي تكون Meta مفعّلة، كتتوصل بأحداث التصفح والسلة وبدء الطلب. تقدري تبدلي الاختيار من أسفل الصفحة.</p>' +
  '<div class="marketing-actions"><button type="button" data-marketing-choice="deny">رفض التتبع</button>' +
  '<button type="button" data-marketing-choice="allow">السماح بتتبع الإعلانات</button></div></aside>' +
  '<!-- /MARKETING-BODY -->';

export function addMarketing(html, product) {
  const price = product && priceOf(product);
  const productMeta = product
    ? '<meta name="chahd-product-id" content="' + product.id + '">' +
      (price === null ? '' : '<meta name="chahd-product-price" content="' + price + '">' +
        '<meta property="product:price:amount" content="' + price + '">' +
        '<meta property="product:price:currency" content="MAD">')
    : '';
  const head = '<!-- MARKETING-HEAD --><meta name="referrer" content="strict-origin">' + productMeta +
    (pixel ? '<meta name="chahd-meta-pixel" content="' + pixel + '">' : '') +
    '<link rel="stylesheet" href="marketing.css"><script src="marketing.js" defer></script>' +
    '<!-- /MARKETING-HEAD -->';

  return html
    .replace(/<!-- MARKETING-(HEAD|BODY|FOOTER) -->[\s\S]*?<!-- \/MARKETING-\1 -->/g, '')
    .replace('<meta property="og:type" content="website">', product
      ? '<meta property="og:type" content="product">'
      : '<meta property="og:type" content="website">')
    .replace('</head>', head + '</head>')
    .replace('</footer>', '<!-- MARKETING-FOOTER --><div class="wrap marketing-footer">' +
      '<button type="button" data-marketing-settings aria-controls="marketing-preferences">اختيارات الخصوصية</button>' +
      '</div><!-- /MARKETING-FOOTER --></footer>')
    .replace('</body>', panel + '</body>');
}

