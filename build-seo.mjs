import fs from 'node:fs/promises';
import vm from 'node:vm';
import { addMarketing, priceLabel, priceOf } from './ad-pages.mjs';

const introScript = (await fs.readFile('intro.js', 'utf8')).trim();
const introHead = `<!-- INTRO-HEAD -->
<script>
${introScript}
</script>
<link rel="stylesheet" href="intro.css">
<!-- /INTRO-HEAD -->`;
const introBody = `<!-- INTRO-BODY -->
<div class="site-intro notranslate" translate="no" aria-hidden="true" hidden>
  <div class="site-intro__center">
    <div class="site-intro__badge">
      <img src="assets/chahd-kids-logo-v1.png" width="1254" height="1254" alt="" loading="lazy">
    </div>
    <span class="site-intro__heart site-intro__heart--one">♡</span>
    <span class="site-intro__heart site-intro__heart--two">♡</span>
    <span class="site-intro__heart site-intro__heart--three">♡</span>
    <div class="site-intro__track"></div>
  </div>
</div>
<!-- /INTRO-BODY -->`;

function addIntro(html) {
  return html
    .replace(/<!-- INTRO-HEAD -->[\s\S]*?<!-- \/INTRO-HEAD -->/g, '')
    .replace('<link rel="icon"', tag => introHead + tag)
    .replace(/<!-- INTRO-BODY -->[\s\S]*?<!-- \/INTRO-BODY -->/g, '')
    .replace(/<body\b[^>]*>/, tag => tag + introBody);
}

// Change SITE_URL when the shop moves to its final domain, then regenerate.
const origin=(process.env.SITE_URL || 'https://chahdkids.com').replace(/\/$/,'');
if(!/^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(origin))throw new Error('SITE_URL must be an HTTPS origin');
const context={window:{}};
vm.runInNewContext(await fs.readFile('dist/products.js','utf8'),context);
const products=context.window.storeProducts;
const productIds = new Set(products.map(product => product.id));
if (productIds.size !== products.length || products.some(product => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id))) {
  throw new Error('Product IDs must be unique URL-safe slugs.');
}
const campaigns=JSON.parse(await fs.readFile('campaigns.json','utf8'));
if (!Array.isArray(campaigns)) throw new Error('campaigns.json must contain a list of campaigns.');
const campaignIds=new Set();
for (const campaign of campaigns) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(campaign.id) || campaignIds.has(campaign.id) ||
      typeof campaign.title !== 'string' || !campaign.title.trim() ||
      typeof campaign.description !== 'string' || !campaign.description.trim() ||
      !Array.isArray(campaign.products) || !campaign.products.length ||
      new Set(campaign.products).size !== campaign.products.length ||
      campaign.products.some(id => !productIds.has(id)) ||
      (campaign.prices !== undefined && (!campaign.prices || typeof campaign.prices !== 'object' || Array.isArray(campaign.prices) ||
        Object.entries(campaign.prices).some(([id, price]) => !campaign.products.includes(id) || !Number.isFinite(price) || price <= 0)))) {
    throw new Error('Invalid campaign configuration for ' + campaign.id);
  }
  campaignIds.add(campaign.id);
}
const categories=[
 {id:'clothes',name:'ملابس الأطفال',description:'أطقم وبيجامات وملابس الرضع في متجر شهد Kids بطنجة. تصفحي الصور واختاري الموديل، ثم تأكدي من المقاس والخامة والألوان المتوفرة مع المتجر عبر واتساب.'},
 {id:'feeding',name:'الرضاعة والتغذية',description:'اكتشفي مستلزمات الرضاعة والتغذية: مضخات الحليب، أجهزة التعقيم، سخانات الرضاعات وكراسي الإطعام، مع صور من المتجر. تفاصيل كل موديل وثمنه والتوفر كتتأكد مباشرة مع شهد Kids.'},
 {id:'care',name:'العناية بالأم والطفل',description:'منتجات العناية بالأم والطفل، مستلزمات الحمام والمناشف ومستلزمات العناية اليومية في شهد Kids بطنجة. تصفحي صور العبوات والموديلات وتواصلي معنا لتأكيد التفاصيل قبل الطلب.'},
 {id:'toys',name:'الألعاب والإكسسوارات',description:'ألعاب موسيقية، حصائر لعب، عضاضات ومستلزمات اللعب للأطفال في شهد Kids. تعرفي على الموديلات المصورة وتأكدي من العمر المناسب وتعليمات الاستعمال مع المتجر.'},
 {id:'sleep',name:'النوم والراحة',description:'أسرّة ومهود، بطانيات ومفروشات ومستلزمات غرفة الطفل في شهد Kids بطنجة. شاهدي الصور، وسولي المتجر على الأبعاد والخامات والموديلات المتاحة قبل تأكيد اختيارك.'},
 {id:'outdoors',name:'الخروج والتنقل',description:'عربات أطفال، أنظمة تنقل ومقاعد سيارة في شهد Kids بطنجة. تصفحي الموديلات المصورة، وتواصلي مع المتجر لتأكيد المواصفات والعمر والوزن المناسبين والتوفر والثمن.'}
];
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productNameHTML = name => name.split(/([A-Za-z][A-Za-z0-9 .&+₂-]*)/g).filter(Boolean).map(part => /^[A-Za-z]/.test(part) ? '<bdi class="notranslate" translate="no">'+e(part)+'</bdi>' : '<span>'+e(part)+'</span>').join('');
const json=v=>JSON.stringify(v).replace(/</g,'\\u003c');
// Static hosting redirects .html files to extensionless URLs.
const url=path=>origin+'/'+path.replace(/\.html$/,'');
const productPath=p=>'products/'+p.id+'.html';
const categoryPath=c=>'categories/'+c.id+'.html';
const store={'@type':'Store','@id':url('#store'),name:'شهد Kids — chahd.kids',url:url(''),telephone:'+212640341765',image:url('assets/chahd-kids-logo-v1.png'),address:{'@type':'PostalAddress',addressLocality:'طنجة',addressCountry:'MA'},areaServed:{'@type':'Country',name:'المغرب'}};
let index=(await fs.readFile('dist/index.html','utf8')).replace(/\r\n/g,'\n');
const languageRow=index.match(/    <div class="wrap language-row[\s\S]*?\n    <\/div>/)[0];
function metadata(title,description,path,image){return `<title>${e(title)}</title>\n<meta name="description" content="${e(description)}">\n<link rel="canonical" href="${url(path)}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="chahd.kids">\n<meta property="og:locale" content="ar_MA">\n<meta property="og:title" content="${e(title)}">\n<meta property="og:description" content="${e(description)}">\n<meta property="og:url" content="${url(path)}">\n<meta property="og:image" content="${url(image)}">\n<meta property="og:image:alt" content="${e(title)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${e(title)}">\n<meta name="twitter:description" content="${e(description)}">\n<meta name="twitter:image" content="${url(image)}">`;}
function card(p,action=''){return `<article class="product-card" data-product-id="${p.id}"><div class="product-image photo-product"><a href="${productPath(p)}" aria-label="${e(p.name)}"><img src="${p.images[0]}" alt="${e(p.name)}" width="400" height="400" loading="lazy"></a><span class="product-label">${e(p.label)}</span></div><div class="product-info"><div class="product-meta">${e(categories.find(c=>c.id===p.category).name)}</div><h3 class="product-title"><a href="${productPath(p)}">${productNameHTML(p.name)}</a></h3><span class="price-note">${e(priceLabel(p))}</span>${action}</div></article>`;}
const directory=()=>`<nav class="category-directory" aria-label="أقسام المتجر">${categories.map(c=>`<a href="${categoryPath(c)}">${c.name}</a>`).join('')}</nav>`;
function breadcrumbs(items){return `<nav class="breadcrumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a>${items.map(item=>`<span aria-hidden="true">/</span>${item.path?`<a href="${item.path}">${e(item.name)}</a>`:`<span aria-current="page">${e(item.name)}</span>`}`).join('')}</nav>`;}
function breadcrumbData(items){return {'@type':'BreadcrumbList',itemListElement:[{name:'الرئيسية',path:''},...items].map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:url(item.path)}))};}
function page({title,description,path,image,body,graph,product}){return addMarketing(addIntro(`<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="../"><meta name="theme-color" content="#35564a">${metadata(title,description,path,image)}<link rel="icon" href="assets/chahd-kids-logo-v1.png"><link rel="stylesheet" href="style.css?v=seo-catalog-1"><link rel="stylesheet" href="seo-pages.css"><script type="application/ld+json">${json({'@context':'https://schema.org','@graph':graph})}</script><script src="landing.js" defer></script><script src="vendor/translate.js" defer></script><script src="languages.js" defer></script></head><body class="landing-page"><a class="skip" href="#main">انتقل إلى المحتوى</a><div class="announcement"><span>من طنجة، بكل حب ♡</span><span>التوصيل لجميع مدن المغرب</span></div><header class="header landing-header"><div class="wrap header-row"><a class="notranslate brand site-brand" href="index.html" aria-label="شهد Kids — الرئيسية"><span class="brand-logo"><img src="assets/chahd-kids-logo-v1.png" alt="شهد Kids" width="1254" height="1254"></span></a><nav class="landing-nav" aria-label="القائمة الرئيسية"><a href="index.html#catalog">تصفحي المتجر</a><a href="index.html#help">كيف أطلب؟</a></nav></div>${languageRow}</header><main class="wrap" id="main">${body}</main><footer class="landing-footer"><div class="wrap"><strong>شهد Kids · ملابس ومستلزمات الأطفال في طنجة</strong><p>الأثمنة والموديلات والتوفر كتتأكد مع المتجر. التوصيل لجميع مدن المغرب.</p><a href="https://wa.me/212640341765" target="_blank" rel="noopener noreferrer" dir="ltr">+212 640 341 765</a>${directory()}</div></footer></body></html>`),product);}
await fs.mkdir('dist/products',{recursive:true});await fs.mkdir('dist/categories',{recursive:true});
await fs.mkdir('dist/campaigns',{recursive:true});
function orderUrl(p, campaign) {
  const campaignDetails = campaign ? '\n' + campaign.title + (priceOf(p) === null ? '' : '\nالثمن المعروض: ' + priceLabel(p)) : '';
  return 'https://wa.me/212640341765?text=' + encodeURIComponent(
    'السلام عليكم، بغيت نطلب ' + p.name + ' من شهد Kids. عافاكم أكدو ليا الموديل والثمن والتوفر.\n' + url(productPath(p)) + campaignDetails
  );
}
function orderAttributes(p) {
  const price = priceOf(p);
  return 'data-ad-order="' + e(p.id) + '"' + (price === null ? '' : ' data-ad-price="' + price + '"');
}
for(const p of products){const c=categories.find(c=>c.id===p.category),path=productPath(p),items=[{name:c.name,path:categoryPath(c)},{name:p.name,path}],wa=orderUrl(p);
const body=`${breadcrumbs([{name:c.name,path:categoryPath(c)},{name:p.name}])}<section class="landing-grid" aria-labelledby="product-name"><div class="landing-gallery"><img class="landing-main-photo" id="landing-main-photo" src="${p.images[0]}" alt="${e(p.name)}" width="800" height="900" fetchpriority="high">${p.images.length>1?`<div class="landing-thumbs" aria-label="صور المنتج">${p.images.map((src,i)=>`<a href="${src}" data-photo="${src}" aria-label="عرض الصورة ${i+1}"><img src="${src}" alt="${e(p.name)} — الصورة ${i+1}" width="75" height="85" loading="lazy"></a>`).join('')}</div>`:''}<a id="landing-full-image" href="${p.images[0]}" target="_blank" rel="noopener noreferrer">عرض الصورة بالحجم الكامل ↗</a></div><div class="landing-copy"><p class="eyebrow">${c.name}</p>${p.brand?`<p class="landing-brand notranslate" translate="no">${e(p.brand)}</p>`:''}<h1 id="product-name">${productNameHTML(p.name)}</h1><p class="price-note">${e(priceLabel(p))}</p><div class="ad-order-actions"><a class="button primary" ${orderAttributes(p)} href="${wa}" target="_blank" rel="noopener noreferrer">طلبي هاد المنتج عبر واتساب ↗</a><a class="button secondary" href="index.html?product=${p.id}#catalog">اختاريه وجهزي سلة الطلب</a></div><p>${e(p.description)}</p><p class="landing-note">الثمن والتوفر بالتأكيد مع المتجر. صيفطي لينا اسم المنتج، ونعاونك فاختيار الموديل وترتيب التوصيل.</p><p class="product-reference notranslate" translate="no">Ref. ${p.id}</p></div></section><section aria-labelledby="related-title"><h2 id="related-title">اختيارات من نفس القسم</h2><div class="product-grid">${products.filter(other=>other.category===p.category&&other.id!==p.id).slice(0,4).map(p=>card(p)).join('')}</div><a class="text-link" href="${categoryPath(c)}">شوفي قسم ${c.name} كامل ←</a></section>`;
const product={'@type':'Product','@id':url(path)+'#product',name:p.name,description:p.description,image:p.images.map(url),url:url(path),category:c.name,...(p.brand?{brand:{'@type':'Brand',name:p.brand}}:{})};
await fs.writeFile('dist/'+path,page({title:p.name+' | شهد Kids طنجة',description:p.description,path,image:p.images[0],body,graph:[product,breadcrumbData(items)],product:p}));}
for(const c of categories){const path=categoryPath(c),list=products.filter(p=>p.category===c.id);await fs.writeFile('dist/'+path,page({title:c.name+' في طنجة | شهد Kids',description:c.description,path,image:list[0].images[0],body:`${breadcrumbs([{name:c.name}])}<section class="landing-intro"><p class="eyebrow">قسم من عالم شهد Kids</p><h1>${c.name}</h1><p>${c.description}</p><a class="text-link" href="index.html?category=${c.id}#catalog">تصفحي هاد القسم وجهزي سلة الطلب ←</a></section><section aria-label="منتجات ${c.name}"><div class="product-grid">${list.map(p=>card(p)).join('')}</div></section>`,graph:[{'@type':'CollectionPage',name:c.name,description:c.description,url:url(path),mainEntity:{'@type':'ItemList',numberOfItems:list.length,itemListElement:list.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:url(productPath(p))}))}},breadcrumbData([{name:c.name,path}])]}));}
for (const campaign of campaigns) {
  const path = 'campaigns/' + campaign.id + '.html';
  const selected = campaign.products.map(id => {
    const product = products.find(item => item.id === id);
    return campaign.prices?.[id] === undefined ? product : { ...product, price:campaign.prices[id], currency:'MAD' };
  });
  const title = campaign.title + ' | شهد Kids';
  const body = breadcrumbs([{name:campaign.title}]) +
    '<section class="landing-intro"><p class="eyebrow">اختيارات شهد Kids</p><h1>' +
    e(campaign.title) + '</h1><p>' + e(campaign.description) + '</p>' +
    '<a class="button primary" href="' + productPath(selected[0]) + '">شوفي أول منتج ↗</a></section>' +
    '<section id="campaign-products" aria-label="منتجات الحملة"><div class="product-grid">' +
    selected.map(product => card(product,
      '<a class="button primary campaign-order" ' + orderAttributes(product) + ' href="' + orderUrl(product, campaign) +
      '" target="_blank" rel="noopener noreferrer">طلبي عبر واتساب ↗</a>'
    )).join('') + '</div></section>';
  const graph = [{ '@type':'CollectionPage', name:campaign.title, description:campaign.description, url:url(path) },
    breadcrumbData([{ name:campaign.title, path }])];
  const html = page({ title, description:campaign.description, path, image:selected[0].images[0], body, graph });
  await fs.writeFile('dist/' + path, html.replace('<!doctype html>', '<!doctype html>\n<!-- GENERATED CAMPAIGN -->'));
}
for (const file of await fs.readdir('dist/campaigns')) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(file) || campaignIds.has(file.slice(0, -5))) continue;
  const path = 'dist/campaigns/' + file;
  if ((await fs.readFile(path,'utf8')).includes('<!-- GENERATED CAMPAIGN -->')) await fs.unlink(path);
}
index=index.replace(/\s*<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/,'').replace(/\s*<meta name="description"[^>]*>/,'').replace(/\s*<title>[\s\S]*?<\/title>/,'');
const rootTitle='شهد Kids | ملابس ومستلزمات الأطفال في طنجة',rootDescription='تصفحي ملابس ومستلزمات الأطفال في شهد Kids بطنجة: عربات، أسرّة، رضاعة، تغذية، عناية وألعاب. صور المنتجات والطلب عبر واتساب، مع التوصيل لجميع مدن المغرب.';
index=index.replace('</head>',`<!-- SEO:START -->\n${metadata(rootTitle,rootDescription,'','assets/chahd-kids-logo-v1.png')}\n<link rel="stylesheet" href="seo-pages.css">\n<script type="application/ld+json">${json({'@context':'https://schema.org','@graph':[store,{'@type':'WebSite','@id':url('#website'),name:'شهد Kids — chahd.kids',url:url(''),inLanguage:'ar-MA',publisher:{'@id':url('#store')}}]})}</script>\n<!-- SEO:END -->\n</head>`);
index=index.replace(/<div class="product-grid" id="product-grid">[\s\S]*?<\/div><div class="empty-state"/,`<div class="product-grid" id="product-grid">${products.map(p=>card(p)).join('')}</div><div class="empty-state"`);
index=index.replace(/<div class="category-index" id="category-grid">[\s\S]*?<\/div>/,`<div class="category-index" id="category-grid">${categories.map((c,i)=>`<a class="category-card" href="${categoryPath(c)}" data-category="${c.id}"><span class="category-number">0${i+1}</span><span class="category-copy"><strong>${c.name}</strong><small>اكتشفي اختيارات القسم</small></span><span class="category-row-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>`);
index=index.replace(/<div class="wrap catalog-links"><!-- DIRECTORY:START -->[\s\S]*?<!-- DIRECTORY:END --><\/div>/,'').replace('</main>',`<div class="wrap catalog-links"><!-- DIRECTORY:START -->${directory()}<!-- DIRECTORY:END --></div></main>`);
await fs.writeFile('dist/index.html',addMarketing(addIntro(index)));
const locations=[{path:''},...categories.map(c=>({path:categoryPath(c)})),...products.map(p=>({path:productPath(p),image:p.images[0]})),...campaigns.map(c=>({path:'campaigns/'+c.id+'.html'}))];
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${locations.map(item=>`<url><loc>${e(url(item.path))}</loc>${item.image?`<image:image><image:loc>${e(url(item.image))}</image:loc></image:image>`:''}</url>`).join('')}</urlset>\n`);
await fs.writeFile('dist/robots.txt','User-agent: *\nAllow: /\n\nSitemap: '+url('sitemap.xml')+'\n');
await fs.writeFile('dist/404.html','<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>الصفحة غير موجودة | شهد Kids</title></head><body><main><h1>هاد الصفحة ما لقيناهاش</h1><p>اكتشفي المنتجات من الصفحة الرئيسية.</p><a href="/">رجعي للمتجر</a></main></body></html>');
console.log(JSON.stringify({products:products.length,categories:categories.length,sitemapUrls:locations.length,origin}));
