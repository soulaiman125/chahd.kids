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
  {id:'care',name:'العناية والنظافة',short:'العناية',caption:'تفاصيل الروتين اليومي',image:'care'},
  {id:'toys',name:'الألعاب والإكسسوارات',short:'الألعاب',caption:'للضحكات الصغيرة',image:'teddy'},
  {id:'sleep',name:'النوم والراحة',short:'النوم',caption:'لأحلام بحجم السماء',image:'blanket'},
  {id:'outdoors',name:'الخروج والتنقل',short:'الخروج',caption:'معاه فكل مغامرة',image:'stroller'}
];
const products = [
  {id:'romper',name:'طقم لباس للصغار',category:'clothes',image:'romper',label:'للأيام الأولى',colors:['#d6c2a7','#c2c6ae','#e7d5c5'],options:['المقاس مع المحل','حديث الولادة','0–3 أشهر','3–6 أشهر','6–12 شهر'],description:'لباس للّحظات الأولى والروتين اليومي. سولي المحل على الموديلات المتوفرة، نوع الثوب والمقاس المناسب لصغيرك.'},
  {id:'bottle',name:'مستلزمات الرضاعة',category:'feeding',image:'bottle',label:'كل يوم',colors:['#bac8ad','#e8d1c1'],options:['الموديل مع المحل','لون هادئ','لون وردي'],description:'اكتشفي اختيارات الرضاعة والتغذية. نوع الرضاعة، السعة والعمر الموصى به كتتأكد مباشرة مع المحل قبل الطلب.'},
  {id:'teddy',name:'دبدوب ورفاق اللعب',category:'toys',image:'teddy',label:'رفيق اللحظات',colors:['#bf9b6b','#d7c8ac'],options:['الموديل مع المحل','لون عسلي','لون كريمي'],description:'لعبة صغيرة لفرحة كبيرة. تواصلي مع المحل باش تشوفي الصور الحقيقية وتتأكدي من الحجم والعمر المناسب وتعليمات الاستعمال.'},
  {id:'care',name:'مجموعة العناية اليومية',category:'care',image:'care',label:'روتين صغير',colors:['#c6cfb7','#f1e4d3'],options:['المجموعة مع المحل','قطعة واحدة','مجموعة'],description:'مستلزمات لروتين العناية بصغيرك. تأكدي من المكونات، الاستعمال والعمر المناسب على عبوة المنتج ومع المحل قبل الاختيار.'},
  {id:'blanket',name:'أغطية للحظات الدفء',category:'sleep',image:'blanket',label:'لحظات هادئة',colors:['#b9c6aa','#d7bd9e','#e7d9ca'],options:['المقاس مع المحل','لون أخضر هادئ','لون بيج'],description:'اختيارات الأغطية ومستلزمات الراحة. الأبعاد والخامة والألوان والتوفر كتتأكد مع المحل. اتبعي إرشادات نوم الرضع المناسبة للعمر.'},
  {id:'rattle',name:'خشخيشة للأيادي الصغيرة',category:'toys',image:'rattle',label:'وقت الاكتشاف',colors:['#c39868','#c1c9af'],options:['الموديل مع المحل','لون طبيعي','لون أخضر'],description:'ألعاب للاكتشاف واللحظات المرحة. سولي المحل على الموديل، المواد والعمر المناسب، واتبعي تعليمات العبوة والإشراف على الاستعمال.'},
  {id:'stroller',name:'عربات للخروج والتنقل',category:'outdoors',image:'stroller',label:'معاه فين ما مشى',colors:['#a4b49c','#c3ac93'],options:['الموديل مع المحل','لون أخضر','لون بيج'],description:'لخرجاتك مع صغيرك، تعرفي على العربات المتاحة. المواصفات والعمر والوزن المناسب وآلية الطي كتتأكد مع المحل قبل الشراء.'},
  {id:'socks',name:'إكسسوارات اللباس',category:'clothes',image:'socks',label:'تفاصيل تكمل الفرحة',colors:['#d8c3a4','#b8c1a4','#e6d3c6'],options:['المقاس مع المحل','حديث الولادة','0–6 أشهر','6–12 شهر'],description:'تفاصيل صغيرة تكمل إطلالة صغيرك. سولي على الموديلات، المقاسات والألوان المتاحة قبل تأكيد اختيارك.'}
];
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productById = id => products.find(p => p.id === id);
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
function normalize(value){return value.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').toLowerCase().trim();}
function renderFilters(){
 $('#filter-tabs').innerHTML=[{id:'all',short:'الكل'},...categories].map(c=>`<button type="button" class="filter-chip" data-category="${c.id}" aria-pressed="${category===c.id}">${c.short}</button>`).join('');
}
function renderProducts(){
 let list=products.filter(p=>(category==='all'||p.category===category)&&(!favoritesOnly||favorites.includes(p.id))&&(!query||normalize(p.name+' '+p.description+' '+categories.find(c=>c.id===p.category).name+' '+(window.chahdTranslation?.searchIndex.get(p.id)||'')).includes(normalize(query))));
 if($('#sort').value==='name') list.sort((a,b)=>a.name.localeCompare(b.name,'ar'));
 $('#product-grid').innerHTML=list.map(p=>`<article class="product-card" data-product-id="${p.id}"><div class="product-image"><button type="button" data-detail="${p.id}" aria-label="عرض تفاصيل ${p.name}"><img src="assets/${p.image}.svg" alt="رسم توضيحي: ${p.name}" loading="lazy" width="400" height="400"></button><span class="product-label">${p.label}</span><button class="icon-button favorite-button" data-favorite="${p.id}" aria-label="${favorites.includes(p.id)?'إزالة من':'إضافة إلى'} المفضلة: ${p.name}" aria-pressed="${favorites.includes(p.id)}">${icon('heart')}</button></div><div class="product-info"><div class="product-meta"><span>${categories.find(c=>c.id===p.category).name}</span><span class="swatches" aria-label="ألوان توضيحية">${p.colors.map(c=>`<i style="--swatch:${c}"></i>`).join('')}</span></div><h3 class="product-title"><button data-detail="${p.id}">${p.name}</button></h3><div class="product-bottom"><span class="price-note">الثمن والتوفر عبر واتساب</span><button class="add-button" data-detail="${p.id}" aria-label="اختيار ${p.name}">${icon('plus')}</button></div></div></article>`).join('');
 $('#result-count').innerHTML=`<span>${list.length} اختيارات${favoritesOnly?' · المفضلة':''}${query?' · نتائج البحث: ':''}</span>${query?'<span class="notranslate" translate="no">'+escapeHTML(query)+'</span>':''}`;
 $('#empty-results').hidden=list.length>0;
 if(!list.length){$('#empty-results h3').textContent=favoritesOnly&&!favorites.length?'المفضلة ديالك باقية خاوية':'ما لقيناش هاد المنتج';$('#empty-results p').textContent=favoritesOnly&&!favorites.length?'ضغطي على القلب باش تحتافظي بالاختيارات اللي عجبوك.':'جرّبي كلمة أخرى أو رجعي لجميع المنتجات.';}
 $('#reset-filters').hidden=category==='all'&&!query&&!favoritesOnly;
 $('#favorites-toggle').setAttribute('aria-pressed',String(favoritesOnly));
 renderFilters();
}
function setCategory(id){category=id;favoritesOnly=false;renderProducts();$('#catalog').scrollIntoView({behavior:'smooth'});}
function resetFilters(){category='all';query='';favoritesOnly=false;$('#search').value='';$('#sort').value='default';renderProducts();}
function openDialog(id){const dialog=$('#'+id);dialog.showModal();document.body.classList.add('modal-open');}
function closeDialog(id){$('#'+id).close();}
function openDetail(id){
 const p=productById(id);if(!p)return;selectedProduct=p;selectedOption=p.options[0];
 $('#product-detail').innerHTML=`<div class="detail-grid"><div class="detail-image"><img src="assets/${p.image}.svg" alt="رسم توضيحي: ${p.name}" width="400" height="400"></div><div class="detail-copy"><p class="eyebrow">${categories.find(c=>c.id===p.category).name}</p><h2 id="detail-name">${p.name}</h2><p>${p.description}</p><span class="option-label">اختيارك المبدئي</span><div class="variant-options" role="group" aria-label="خيارات المنتج">${p.options.map((o,i)=>`<button type="button" data-option="${escapeHTML(o)}" aria-pressed="${i===0}">${o}</button>`).join('')}</div><button class="button primary" id="add-selected">زيدي لسلة الطلب ${icon('plus')}</button><p class="detail-note">صورة توضيحية · الاختيار كيحتاج تأكيد التوفر والثمن مع المحل.</p></div></div>`;
 openDialog('product-dialog');
}
function addToCart(product,option){
 const existing=cart.find(i=>i.id===product.id&&i.option===option);
 if(existing){if(existing.quantity>=20){toast('الحد الأقصى هو 20 من نفس الاختيار');return;}existing.quantity++;}else cart.push({id:product.id,option,quantity:1});
 persist();renderCart();closeDialog('product-dialog');toast('تزاد الاختيار لسلة الطلب ♡');
}
function renderCart(){
 const count=cart.reduce((total,item)=>total+item.quantity,0);$('#cart-count').textContent=count;$('#cart-total-count').textContent=`(${count})`;$('#cart-toggle').setAttribute('aria-label',`فتح سلة الطلب، ${count} قطع`);
 $('#checkout-form').hidden=!cart.length;
 $('#wa-fallback').hidden=true;
 $('#cart-items').innerHTML=cart.length?cart.map((item,index)=>{const p=productById(item.id);return `<article class="cart-item"><img src="assets/${p.image}.svg" alt="${p.name}" width="74" height="74"><div><h3>${p.name}</h3><p>${escapeHTML(item.option)}</p><div class="quantity-control"><button data-quantity="${index}" data-delta="-1" aria-label="تنقيص كمية ${p.name}">−</button><span aria-label="الكمية">${item.quantity}</span><button data-quantity="${index}" data-delta="1" aria-label="زيادة كمية ${p.name}" ${item.quantity>=20?'disabled':''}>+</button></div></div><button class="remove-item" data-remove="${index}" aria-label="حذف ${p.name}">×</button></article>`;}).join(''):`<div class="cart-empty">${icon('bag')}<h3>نبدأو بأول اختيار؟</h3><p>السلة باقية خاوية. اكتشفي الأقسام<br>واختاري التفاصيل اللي عجبوك لصغيرك.</p><button class="button primary" data-close="cart-dialog">اكتشفي التشكيلة ←</button></div>`;
}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
$('#search-toggle').innerHTML=icon('search');$('#favorites-toggle').innerHTML=icon('heart');$('#cart-toggle').insertAdjacentHTML('beforeend',icon('bag'));$('#menu-toggle').innerHTML=icon('menu');
$('#category-grid').innerHTML=categories.map(c=>`<button type="button" class="category-card" data-category="${c.id}"><div class="category-image"><img src="assets/${c.image}.svg" alt="" loading="lazy" width="240" height="240"></div><strong>${c.name}</strong><small>${c.caption}</small></button>`).join('');
document.addEventListener('click',event=>{
 const target=event.target.closest('button');if(!target)return;
 if(target.dataset.category){setCategory(target.dataset.category);return;}
 if(target.dataset.detail){openDetail(target.dataset.detail);return;}
 if(target.dataset.favorite){const id=target.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(i=>i!==id):[...favorites,id];persist();renderProducts();const replacement=document.querySelector(`[data-favorite="${id}"]`);replacement?.focus({preventScroll:true});return;}
 if(target.dataset.close){closeDialog(target.dataset.close);return;}
 if(target.dataset.option){selectedOption=target.dataset.option;document.querySelectorAll('[data-option]').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));return;}
 if(target.id==='add-selected'){addToCart(selectedProduct,selectedOption);return;}
 if(target.dataset.quantity!==undefined){const index=Number(target.dataset.quantity),item=cart[index],delta=Number(target.dataset.delta);if(!item)return;const newQuantity=Math.max(0,Math.min(20,item.quantity+delta));item.quantity=newQuantity;cart=cart.filter(i=>i.quantity>0);persist();renderCart();const next=document.querySelector(`[data-quantity="${Math.min(index,cart.length-1)}"][data-delta="${delta}"]`);(next||$('#cart-dialog .cart-header button')).focus({preventScroll:true});return;}
 if(target.dataset.remove!==undefined){cart.splice(Number(target.dataset.remove),1);persist();renderCart();$('#cart-dialog .cart-header button').focus({preventScroll:true});}
});
$('#cart-toggle').addEventListener('click',()=>{renderCart();openDialog('cart-dialog');});
$('#search-toggle').addEventListener('click',()=>{$('#header-search').hidden=!$('#header-search').hidden;if(!$('#header-search').hidden)$('#search').focus();});
$('#close-search').addEventListener('click',()=>{$('#header-search').hidden=true;$('#search-toggle').focus();});
$('#search').addEventListener('input',e=>{query=e.target.value;renderProducts();});
$('#search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#catalog').scrollIntoView({behavior:'smooth'});}if(e.key==='Escape')$('#close-search').click();});
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
 const url=`https://wa.me/212640341765?text=${encodeURIComponent([...lines, 'Language / اللغة: '+(window.chahdTranslation?.language || 'ar')].join('\n'))}`;$('#wa-fallback').href=url;$('#wa-fallback').hidden=false;window.open(url,'_blank','noopener,noreferrer');
});
$('#year').textContent=new Date().getFullYear();renderFilters();renderProducts();renderCart();
