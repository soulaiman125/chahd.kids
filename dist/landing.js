'use strict';
document.addEventListener('click',event=>{
 const photo=event.target.closest('a[data-photo]');
 if(!photo)return;
 event.preventDefault();
 document.getElementById('landing-main-photo').src=photo.dataset.photo;
 document.getElementById('landing-full-image').href=photo.dataset.photo;
});
