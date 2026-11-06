'use strict';
const icons = {
  search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  heart:'<path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.5a5.5 5.5 0 0 0-.1-7.8Z"/>',
  bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  truck:'<path d="M2 5h12v12H2zM14 9h4l4 4v4h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  chat:'<path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.5-4.6A9 9 0 1 1 21 11.5Z"/><path d="M8 7c.7 4.5 2.5 6.3 7 7l1-2-2-1-1 1-3-3 1-1-1-2-2 1Z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.bag}</svg>`;
const categories = [
  {id:'clothes',name:'ملابس الأطفال',short:'الملابس',caption:'لأول حضن وأول خطوة',image:'romper'},
  {id:'feeding',name:'الرضاعة والتغذية',short:'الرضاعة',caption:'لحظات قرب وحنان',image:'bottle'},
  {id:'care',name:'العناية بالأم والطفل',short:'العناية',caption:'تفاصيل روتين العناية',image:'care'},
  {id:'toys',name:'الألعاب والإكسسوارات',short:'الألعاب',caption:'للضحكات الصغيرة',image:'teddy'},
  {id:'sleep',name:'النوم والراحة',short:'النوم',caption:'لأحلام بحجم السماء',image:'blanket'},
  {id:'outdoors',name:'الخروج والتنقل',short:'الخروج',caption:'معاه فكل مغامرة',image:'stroller'}
];
const products = [...(window.storeProducts || [])];
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productNameHTML = name => name.split(/([A-Za-z][A-Za-z0-9 .&+₂-]*)/g).filter(Boolean).map(part => /^[A-Za-z]/.test(part) ? '<bdi class="notranslate" translate="no">'+escapeHTML(part)+'</bdi>' : '<span>'+escapeHTML(part)+'</span>').join('');
const productById = id => products.find(p => p.id === id);
const adItem = (product, quantity) => ({ id:product.id, quantity, price:!product.currency || product.currency === 'MAD' ? product.price : undefined });
const imagesFor = product => product.images || [`assets/${product.image}.svg`];
function readStorage(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}}
let cart = readStorage('chahd-cart-v1', []);
if(!Array.isArray(cart)) cart=[];
cart=cart.filter(item => item && productById(item.id) && productById(item.id).options.includes(item.option) && Number.isInteger(item.quantity) && item.quantity>0 && item.quantity<=20).slice(0,80);
let favorites=readStorage('chahd-favorites-v1',[]);
if(!Array.isArray(favorites)) favorites=[];
favorites=[...new Set(favorites.filter(id=>productById(id)))];
let category='all',query='',favoritesOnly=false,selectedProduct=null,selectedOption='',toastTimer;
function persist(){try{localStorage.setItem('chahd-cart-v1',JSON.stringify(cart));localStorage.setItem('chahd-favorites-v1',JSON.stringify(favorites));}catch{/* Shopping continues when browser storage is unavailable. */}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function normalize(value){return value.normalize('NFKD').replace(/[\u0300-\u036f\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase().trim();}
function matchesSearch(product){const terms=normalize(query).split(/\s+/).filter(Boolean);const text=normalize(product.name+' '+product.description+' '+(product.brand||'')+' '+product.id.replace(/-/g,' ')+' '+categories.find(c=>c.id===product.category).name+' '+(window.chahdTranslation?.searchIndex.get(product.id)||''));return terms.every(term=>text.includes(term));}
function renderFilters(){
 $('#filter-tabs').innerHTML=[{id:'all',short:'الكل'},...categories].map(c=>`<button type="button" class="filter-chip" data-category="${c.id}" aria-pressed="${category===c.id}">${c.short}</button>`).join('');
}
function renderProducts(){
 let list=products.filter(p=>(category==='all'||p.category===category)&&(!favoritesOnly||favorites.includes(p.id))&&matchesSearch(p));
 if($('#sort').value==='name') list.sort((a,b)=>a.name.localeCompare(b.name,'ar'));
 $('#product-grid').innerHTML=list.map(p=>`<article class="product-card" data-product-id="${p.id}"><div class="product-image${p.supplied?' photo-product':''}"><button type="button" data-detail="${p.id}" aria-label="عرض تفاصيل ${p.name}"><img src="${imagesFor(p)[0]}" alt="${p.supplied?'صورة المنتج':'رسم توضيحي'}: ${p.name}" loading="lazy" width="400" height="400"></button><span class="product-label">${p.label}</span><button class="icon-button favorite-button" data-favorite="${p.id}" aria-label="${favorites.includes(p.id)?'إزالة من':'إضافة إلى'} المفضلة: ${p.name}" aria-pressed="${favorites.includes(p.id)}">${icon('heart')}</button></div><div class="product-info"><div class="product-meta"><span>${categories.find(c=>c.id===p.category).name}</span>${p.brand?`<span class="product-brand notranslate" translate="no">${p.brand}</span>`:`<span class="swatches" aria-label="ألوان توضيحية">${p.colors.map(c=>`<i style="--swatch:${c}"></i>`).join('')}</span>`}</div><h3 class="product-title"><a href="products/${p.id}.html">${productNameHTML(p.name)}</a></h3><div class="product-bottom"><span class="price-note">الثمن والتوفر عبر واتساب</span><button class="add-button" data-detail="${p.id}" aria-label="اختيار ${p.name}">${icon('plus')}</button></div></div></article>`).join('');
 $('#result-count').innerHTML=`<span>${list.length} اختيارات${favoritesOnly?' · المفضلة':''}${query?' · نتائج البحث: ':''}</span>${query?'<span class="notranslate" translate="no">'+escapeHTML(query)+'</span>':''}`;
 $('#empty-results').hidden=list.length>0;
 if(!list.length){$('#empty-results h3').textContent=favoritesOnly&&!favorites.length?'المفضلة ديالك باقية خاوية':'ما لقيناش هاد المنتج';$('#empty-results p').textContent=favoritesOnly&&!favorites.length?'ضغطي على القلب باش تحتافظي بالاختيارات اللي عجبوك.':'جرّبي كلمة أخرى أو رجعي لجميع المنتجات.';}
 $('#reset-filters').hidden=category==='all'&&!query&&!favoritesOnly;
 $('#favorites-toggle').setAttribute('aria-pressed',String(favoritesOnly));
 $('#clear-search').hidden=!$('#search').value;
 renderFilters();
}
function setCategory(id){category=id;query='';favoritesOnly=false;$('#search').value='';renderProducts();requestAnimationFrame(()=>revealSearchResults('smooth'));}
function resetFilters(){category='all';query='';favoritesOnly=false;$('#search').value='';$('#sort').value='default';renderProducts();}
function openDialog(id){const dialog=$('#'+id);dialog.showModal();document.body.classList.add('modal-open');}
function closeDialog(id){$('#'+id).close();}
function openDetail(id){
 const p=productById(id);if(!p)return;selectedProduct=p;selectedOption=p.options[0];
 const images=imagesFor(p);
 $('#product-detail').innerHTML=`<div class="detail-grid"><div class="detail-gallery${p.supplied?' photo-gallery':''}"><div class="detail-image"><img id="detail-main-image" src="${images[0]}" alt="${p.name}" width="400" height="400"></div>${images.length>1?`<div class="gallery-thumbnails" role="group" aria-label="صور المنتج">${images.map((src,index)=>`<button type="button" data-gallery-index="${index}" aria-label="عرض الصورة ${index+1}" aria-pressed="${index===0}"><img src="${src}" alt="" width="76" height="60"></button>`).join('')}</div>`:''}<a class="gallery-full-image" id="detail-image-link" href="${images[0]}" target="_blank" rel="noopener noreferrer">عرض الصورة بالحجم الكامل ↗</a></div><div class="detail-copy"><p class="eyebrow">${categories.find(c=>c.id===p.category).name}</p>${p.brand?`<p class="detail-brand notranslate" translate="no">${p.brand}</p>`:''}<h2 id="detail-name">${productNameHTML(p.name)}</h2><p>${p.description}</p><span class="option-label">اختيارك المبدئي</span><div class="variant-options" role="group" aria-label="خيارات المنتج">${p.options.map((o,i)=>`<button type="button" data-option="${escapeHTML(o)}" aria-pressed="${i===0}">${o}</button>`).join('')}</div><button class="button primary" id="add-selected">زيدي لسلة الطلب ${icon('plus')}</button><a class="text-link product-permalink" href="products/${p.id}.html">صفحة المنتج والرابط المباشر ↗</a><p class="detail-note">${p.supplied?'صورة مقدمة من المتجر':'صورة توضيحية'} · الموديل والتوفر والثمن بالتأكيد مع المحل.</p></div></div>`;
 openDialog('product-dialog');
}
function addToCart(product,option){
 const existing=cart.find(i=>i.id===product.id&&i.option===option);
 if(existing){if(existing.quantity>=20){toast('الحد الأقصى هو 20 من نفس الاختيار');return;}existing.quantity++;}else cart.push({id:product.id,option,quantity:1});
 persist();renderCart();window.chahdAds?.added(adItem(product,1));closeDialog('product-dialog');toast('تزاد الاختيار لسلة الطلب ♡');
}
function renderCart(){
 const count=cart.reduce((total,item)=>total+item.quantity,0);$('#cart-count').textContent=count;$('#cart-total-count').textContent=`(${count})`;$('#cart-toggle').setAttribute('aria-label',`فتح سلة الطلب، ${count} قطع`);
 $('#checkout-form').hidden=!cart.length;
 $('#wa-fallback').hidden=true;
 $('#cart-items').innerHTML=cart.length?cart.map((item,index)=>{const p=productById(item.id);return `<article class="cart-item"><img src="${imagesFor(p)[0]}" alt="${p.name}" width="74" height="74"><div><h3>${p.name}</h3><p>${escapeHTML(item.option)}</p><div class="quantity-control"><button data-quantity="${index}" data-delta="-1" aria-label="تنقيص كمية ${p.name}">−</button><span aria-label="الكمية">${item.quantity}</span><button data-quantity="${index}" data-delta="1" aria-label="زيادة كمية ${p.name}" ${item.quantity>=20?'disabled':''}>+</button></div></div><button class="remove-item" data-remove="${index}" aria-label="حذف ${p.name}">×</button></article>`;}).join(''):`<div class="cart-empty">${icon('bag')}<h3>نبدأو بأول اختيار؟</h3><p>السلة باقية خاوية. اكتشفي الأقسام<br>واختاري التفاصيل اللي عجبوك لصغيرك.</p><button class="button primary" data-close="cart-dialog">اكتشفي التشكيلة ←</button></div>`;
}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
$('#search-toggle').innerHTML=icon('search');$('#favorites-toggle').innerHTML=icon('heart');$('#cart-toggle').insertAdjacentHTML('beforeend',icon('bag'));$('#menu-toggle').innerHTML=icon('menu');
const categoryNotes={clothes:'أطقم، لباس وإكسسوارات صغيرة',feeding:'رضاعة، تغذية وكراسي الإطعام',care:'روتين العناية بالأم والطفل',toys:'ألعاب ورفاق اللحظات المرحة',sleep:'أغطية وكراسي للراحة',outdoors:'عربات وإكسسوارات الخروج'};
$('#category-grid').innerHTML=categories.map((c,index)=>`<a href="categories/${c.id}.html" class="category-card" data-category="${c.id}"><span class="category-number notranslate" translate="no" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="category-copy"><strong>${c.name}</strong><small>${categoryNotes[c.id]}</small></span><span class="category-row-arrow" aria-hidden="true">↗</span></a>`).join('');
document.addEventListener('click',event=>{
 const target=event.target.closest('button,a[data-category]');if(!target)return;
 if(target.dataset.category){event.preventDefault();setCategory(target.dataset.category);return;}
 if(target.dataset.detail){openDetail(target.dataset.detail);return;}
 if(target.dataset.galleryIndex!==undefined){const index=Number(target.dataset.galleryIndex),images=imagesFor(selectedProduct);if(!images[index])return;$('#detail-main-image').src=images[index];$('#detail-image-link').href=images[index];document.querySelectorAll('[data-gallery-index]').forEach(button=>button.setAttribute('aria-pressed',String(button===target)));return;}
 if(target.dataset.favorite){const id=target.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(i=>i!==id):[...favorites,id];persist();renderProducts();const replacement=document.querySelector(`[data-favorite="${id}"]`);replacement?.focus({preventScroll:true});return;}
 if(target.dataset.close){closeDialog(target.dataset.close);return;}
 if(target.dataset.option){selectedOption=target.dataset.option;document.querySelectorAll('[data-option]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));return;}
 if(target.id==='add-selected'){addToCart(selectedProduct,selectedOption);return;}
 if(target.dataset.quantity!==undefined){const index=Number(target.dataset.quantity),item=cart[index],delta=Number(target.dataset.delta);if(!item)return;const newQuantity=Math.max(0,Math.min(20,item.quantity+delta));if(newQuantity>item.quantity)window.chahdAds?.added(adItem(productById(item.id),newQuantity-item.quantity));item.quantity=newQuantity;cart=cart.filter(i=>i.quantity>0);persist();renderCart();const next=document.querySelector(`[data-quantity="${Math.min(index,cart.length-1)}"][data-delta="${delta}"]`);(next||$('#cart-dialog .cart-header button')).focus({preventScroll:true});return;}
 if(target.dataset.remove!==undefined){cart.splice(Number(target.dataset.remove),1);persist();renderCart();$('#cart-dialog .cart-header button').focus({preventScroll:true});}
});
$('#cart-toggle').addEventListener('click',()=>{renderCart();openDialog('cart-dialog');});
function revealSearchResults(behavior='instant'){const top=window.scrollY+$('#catalog').getBoundingClientRect().top-$('.header').offsetHeight-16;window.scrollTo({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});}
function applySearch(){query=$('#search').value.trim();category='all';favoritesOnly=false;renderProducts();requestAnimationFrame(()=>revealSearchResults());}
$('#search-toggle').addEventListener('click',()=>{$('#header-search').hidden=false;$('#search-toggle').setAttribute('aria-expanded','true');category='all';favoritesOnly=false;renderProducts();requestAnimationFrame(()=>{$('#search').focus({preventScroll:true});revealSearchResults();});});
$('#close-search').addEventListener('click',()=>{$('#header-search').hidden=true;$('#search-toggle').setAttribute('aria-expanded','false');$('#search-toggle').focus({preventScroll:true});requestAnimationFrame(()=>revealSearchResults());});
$('#header-search').addEventListener('submit',event=>{event.preventDefault();applySearch();$('#search').blur();});
$('#search').addEventListener('input',event=>{if(!event.isComposing)applySearch();});
$('#search').addEventListener('compositionend',applySearch);
$('#search').addEventListener('keydown',event=>{if(event.key==='Escape'){$('#close-search').click();event.preventDefault();}});
$('#clear-search').addEventListener('click',()=>{$('#search').value='';applySearch();$('#search').focus({preventScroll:true});});
$('#favorites-toggle').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;category='all';query='';$('#search').value='';renderProducts();$('#catalog').scrollIntoView({behavior:'smooth'});});
$('#sort').addEventListener('change',renderProducts);$('#reset-filters').addEventListener('click',resetFilters);$('#show-all').addEventListener('click',resetFilters);
$('#menu-toggle').addEventListener('click',()=>{const menu=$('#mobile-nav');menu.hidden=!menu.hidden;$('#menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));});
$('#mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('#mobile-nav').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}});
$('#delivery-info').addEventListener('click',()=>openDialog('info-dialog'));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
});
$('#checkout-form').addEventListener('submit',e=>{
 e.preventDefault();if(!cart.length)return;
 const lines=['السلام عليكم، بغيت نستفسر على هاد الاختيارات من chahd.kids:',...cart.map(i=>`• ${productById(i.id).name} — ${i.option} — الكمية: ${i.quantity}`),'','عافاكم تأكدو ليا الموديلات، المقاسات، الأثمنة، التوفر ومصاريف التوصيل.'];
 const name=$('#customer-name').value.trim(),city=$('#customer-city').value.trim(),note=$('#customer-note').value.trim();if(name)lines.push(`الاسم: ${name}`);if(city)lines.push(`المدينة: ${city}`);if(note)lines.push(`ملاحظات: ${note}`);
 const campaign=window.chahdAds?.checkout(cart.map(i=>adItem(productById(i.id),i.quantity)),JSON.stringify(cart));
 if(campaign)lines.push('',campaign);
 const url=`https://wa.me/212640341765?text=${encodeURIComponent([...lines, 'Language / اللغة: '+(window.chahdTranslation?.language || 'ar')].join('\n'))}`;$('#wa-fallback').href=url;$('#wa-fallback').hidden=false;window.open(url,'_blank','noopener,noreferrer');
});
$('#year').textContent=new Date().getFullYear();renderFilters();renderProducts();renderCart();

const initialParams=new URLSearchParams(location.search);
if(initialParams.has('q')){$('#search').value=initialParams.get('q').slice(0,150);applySearch();}
if(categories.some(c=>c.id===initialParams.get('category')))setCategory(initialParams.get('category'));
if(productById(initialParams.get('product')))openDetail(initialParams.get('product'));
