const nav = document.querySelector('.nav-links');
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', isOpen); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

document.querySelectorAll('.filter').forEach(filter => filter.addEventListener('click', () => {
  document.querySelector('.filter.active').classList.remove('active'); filter.classList.add('active');
  document.querySelectorAll('.book-card').forEach(book => { book.hidden = filter.dataset.filter !== 'all' && book.dataset.category !== filter.dataset.filter; });
}));

const openModal = (modal) => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
const closeModal = (modal) => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
document.querySelectorAll('.modal').forEach(modal => { modal.addEventListener('click', event => { if (event.target === modal || event.target.closest('.modal-close')) closeModal(modal); }); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.modal.open').forEach(closeModal); });

const designModal = document.querySelector('#customization-modal');
document.addEventListener('click',event=>{const button=event.target.closest('.customize');if(!button)return;const select=designModal.querySelector('select[name="service"]'),service=button.dataset.service;if(![...select.options].some(option=>option.value===service)){const option=document.createElement('option');option.value=service;option.textContent=service;select.append(option);}select.value=service;designModal.querySelector('.form-status').textContent='';openModal(designModal);});
document.querySelector('#design-request-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form=event.currentTarget,status=form.querySelector('.form-status'),button=form.querySelector('[type="submit"]'),file=form.elements.reference.files[0];
  if(form.dataset.submitting==='true')return;
  if(file){
    const accepted=['image/jpeg','image/png','image/webp','image/gif'];
    if(!accepted.includes(file.type)){status.textContent='Please choose a JPEG, PNG, WebP or GIF reference image.';return;}
    if(file.size>5*1024*1024){status.textContent='Reference images must be 5 MB or smaller.';return;}
  }
  form.dataset.submitting='true';button.disabled=true;status.textContent='Sending your request…';
  try{
    const response=await fetch('/api/requests',{method:'POST',body:new FormData(form),credentials:'same-origin'}),result=await response.json();
    if(!response.ok)throw Error(result.error||'Could not send your request.');
    form.reset();status.textContent=result.message||'Thank you — your request has been received.';
  }catch(error){status.textContent=`Request not sent: ${error.message}. Please try again or contact us directly.`;}
  finally{delete form.dataset.submitting;button.disabled=false;}
});

const purchaseModal = document.querySelector('#purchase-modal');
const bookOrderForm=document.querySelector('#book-order-form');
document.querySelector('#all-books').addEventListener('click',event=>{const button=event.target.closest('.buy-book');if(!button)return;document.querySelector('#purchase-title').textContent=button.dataset.title;document.querySelector('#purchase-description').textContent=button.dataset.description||'';bookOrderForm.elements.book_id.value=button.dataset.id;bookOrderForm.querySelector('.form-status').textContent='';openModal(purchaseModal);});
bookOrderForm.addEventListener('submit',async event=>{event.preventDefault();const button=bookOrderForm.querySelector('[type="submit"]'),status=bookOrderForm.querySelector('.form-status'),values=Object.fromEntries(new FormData(bookOrderForm));button.disabled=true;status.textContent='Submitting your order…';try{const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(values)}),result=await response.json();if(!response.ok)throw Error(result.error||'Could not submit this order.');status.textContent=result.message;bookOrderForm.reset();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money = value => `₹${Number(value).toLocaleString('en-IN')}`;
async function loadManagedSiteContent(){
  try {
    const settings=await fetch('/api/site').then(r=>r.ok?r.json():null);
    if(settings&&Object.keys(settings).length){
      const title=document.querySelector('.hero h1'); if(settings.heading)title.textContent=settings.heading;
      const desc=document.querySelector('.hero-text');if(settings.description)desc.textContent=settings.description;
      const contacts=document.querySelector('.contact-links');
      const emailLink=document.querySelector('.contact-email'),email=String(settings.email||'').trim(),emailIsValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);emailLink.replaceChildren(document.createTextNode(emailIsValid?`${email} `:'Add your email in the owner dashboard '),Object.assign(document.createElement('span'),{textContent:'↗'}));emailLink.href=emailIsValid?`mailto:${encodeURIComponent(email)}`:'#';emailLink.setAttribute('aria-disabled',emailIsValid?'false':'true');
      const whatsapp=String(settings.whatsapp||'').replace(/\D/g,''),whatsappLink=contacts.querySelector('[data-contact="whatsapp"]');if(whatsapp.length>=7){whatsappLink.href=`https://wa.me/${whatsapp}`;whatsappLink.target='_blank';whatsappLink.rel='noreferrer';whatsappLink.removeAttribute('aria-disabled');whatsappLink.querySelector('small').textContent='Chat with us on WhatsApp';}else{whatsappLink.href='#';whatsappLink.setAttribute('aria-disabled','true');whatsappLink.querySelector('small').textContent='Add your number in the owner dashboard';}
      const instagram=String(settings.instagram||'').trim(),instagramLink=contacts.querySelector('[data-contact="instagram"]');let instagramUrl='';try{const parsed=new URL(instagram);if(['https:','http:'].includes(parsed.protocol))instagramUrl=parsed.href;}catch{}if(instagramUrl){instagramLink.href=instagramUrl;instagramLink.target='_blank';instagramLink.rel='noreferrer';instagramLink.removeAttribute('aria-disabled');instagramLink.querySelector('small').textContent='Visit our Instagram profile';}else{instagramLink.href='#';instagramLink.setAttribute('aria-disabled','true');instagramLink.querySelector('small').textContent='Add your profile link in the owner dashboard';}
      if(settings.facebook){let a=contacts.querySelector('a[data-contact="facebook"]');if(!a){a=document.createElement('a');a.dataset.contact='facebook';a.textContent='Facebook';contacts.append(a);}a.href=settings.facebook;a.target='_blank';a.rel='noreferrer';}
      if(settings.mobile){let a=contacts.querySelector('a[data-contact="mobile"]');if(!a){a=document.createElement('a');a.dataset.contact='mobile';contacts.prepend(a);}a.textContent=settings.mobile;a.href=`tel:${settings.mobile.replace(/[^+\d]/g,'')}`;}
    }
    const books=await fetch('/api/books').then(r=>r.ok?r.json():[]);
    const grid=document.querySelector('.books-grid');grid.innerHTML=books.length?books.map((b,i)=>`<article class="book-card" data-category="${escapeHtml(b.category)}"><div class="book-cover managed-book-cover" style="${b.cover_url?`background-image:url('${escapeHtml(b.cover_url)}');background-size:cover;background-position:center`:''}"><small>DD / ${String(i+1).padStart(2,'0')}</small>${b.cover_url?'':`<h3>${escapeHtml(b.title)}</h3>`}</div><div class="book-info"><p>${escapeHtml(b.category)}</p><h3>${escapeHtml(b.title)}</h3><span>${escapeHtml(b.description)}</span><div class="book-price"><s>${money(b.original_price)}</s><b>${money(b.offer_price)}</b></div><div class="book-actions"><a class="button button-ghost details-link" href="/book.html?id=${encodeURIComponent(b.id)}">View details</a><button class="button button-primary buy-book" data-id="${escapeHtml(b.id)}" data-title="${escapeHtml(b.title)}" data-description="${escapeHtml(b.description)}">Buy now <span>→</span></button></div></div></article>`).join(''):'<div class="empty-state public-books-empty">No books are published yet. Please check back soon.</div>';const selected=document.querySelector('.filter.active')?.dataset.filter||'all';grid.querySelectorAll('.book-card').forEach(book=>{book.hidden=selected!=='all'&&book.dataset.category!==selected;});
    const services=await fetch('/api/services').then(r=>r.ok?r.json():[]);
    if(services.length){document.querySelector('#public-services').innerHTML=services.map((s,i)=>`<article class="service-card"><span>${String(i+1).padStart(2,'0')}</span>${s.image_url?`<img class="service-art managed-service-image" src="${escapeHtml(s.image_url)}" alt="${escapeHtml(s.name)}">`:'<div class="service-art logo-art">DD</div>'}<div><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}${s.price?` · ${escapeHtml(s.price)}`:''}</p><button class="customize" data-service="${escapeHtml(s.name)}">Order Now <b>→</b></button></div></article>`).join('');}
  } catch(e) { /* Keep the existing static sample content available when the backend is offline. */ }
}
loadManagedSiteContent();

const contactEnquiryForm=document.querySelector('#contact-enquiry-form');
contactEnquiryForm.addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,status=form.querySelector('.form-status'),button=form.querySelector('[type="submit"]');if(form.dataset.submitting==='true')return;
  form.dataset.submitting='true';button.disabled=true;status.classList.remove('error');status.textContent='Sending your enquiry…';
  try{const response=await fetch('/api/contact-enquiries',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(Object.fromEntries(new FormData(form)))}),result=await response.json();if(!response.ok)throw Error(result.error||'Your enquiry could not be sent.');form.reset();status.textContent=result.message||'Thank you. Your enquiry has been sent.';}
  catch(error){status.classList.add('error');status.textContent=`Enquiry not sent: ${error.message}. Please try again or contact us directly.`;}
  finally{delete form.dataset.submitting;button.disabled=false;}
});
document.addEventListener('click',event=>{const link=event.target.closest('.contact-configurable[aria-disabled="true"]');if(link)event.preventDefault();});
