// script.js — lab 4 solution
// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('regForm');
  const live = document.getElementById('live');
  const cardsContainer = document.getElementById('cards');
  const tbody = document.querySelector('#summary tbody');
  const clearBtn = document.getElementById('clearBtn');

  // Utility: get form values as object
  function getFormData() {
    const formData = new FormData(form);
    const interests = formData.getAll('interests');
    const year = formData.get('year');
    return {
      first: (formData.get('first') || '').trim(),
      last: (formData.get('last') || '').trim(),
      email: (formData.get('email') || '').trim(),
      prog: formData.get('prog') || '',
      year,
      interests,
      photo: (formData.get('photo') || '').trim()
    };
  }

  // Validation helpers
  function showError(id, message){
    const el = document.getElementById(id);
    if(el) el.textContent = message;
  }
  function clearErrors(){
    ['err-first','err-last','err-email','err-prog','err-year','err-photo'].forEach(id => showError(id,''));
  }

  function validate(data){
    clearErrors();
    let ok = true;
    if(!data.first){ showError('err-first','First name is required'); ok = false; }
    if(!data.last){ showError('err-last','Last name is required'); ok = false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){ showError('err-email','Please enter a valid email'); ok = false; }
    if(!data.prog){ showError('err-prog','Please select a programme'); ok = false; }
    if(!data.year){ showError('err-year','Please select year of study'); ok = false; }
    // optional: validate URL if provided
    if(data.photo){
      try {
        const u = new URL(data.photo);
      } catch (e) {
        showError('err-photo','Photo must be a valid URL or left blank'); ok = false;
      }
    }
    return ok;
  }

  // Create and return an id for linking card <-> table row
  function makeId(){
    return 'id-' + Math.random().toString(36).slice(2,9);
  }

  // Create profile card and add table row
  function addEntry(data){
    const id = makeId();

    // CARD
    const card = document.createElement('article');
    card.className = 'card-person';
    card.setAttribute('data-id', id);
    const imgSrc = data.photo || 'https://placehold.co/128x128?text=No+Photo';
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = `${data.first} ${data.last}'s photo`;
    img.onerror = () => { img.src = 'https://placehold.co/128x128?text=No+Photo'; };

    const info = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = `${data.first} ${data.last}`;
    const meta = document.createElement('p');
    meta.innerHTML = `<span class="badge">${data.prog}</span><span class="badge">Year ${data.year}</span>`;

    const interestP = document.createElement('p');
    interestP.textContent = data.interests && data.interests.length ? data.interests.join(', ') : 'No interests';

    // Remove button for card
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove ${data.first} ${data.last}`);
    removeBtn.addEventListener('click', () => removeById(id));

    // assemble card
    info.appendChild(h3);
    info.appendChild(meta);
    info.appendChild(interestP);
    actions.appendChild(removeBtn);
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(actions);

    cardsContainer.prepend(card);

    // TABLE ROW
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', id);
    tr.innerHTML = `<td>${escapeHtml(data.first + ' ' + data.last)}</td>
                    <td>${escapeHtml(data.prog)}</td>
                    <td>${escapeHtml(data.year)}</td>
                    <td>${escapeHtml((data.interests||[]).join(', '))}</td>
                    <td><button class="remove-btn" type="button" aria-label="Remove row for ${escapeHtml(data.first+' '+data.last)}">Remove</button></td>`;
    tbody.prepend(tr);

    // remove action on table remove button
    tr.querySelector('.remove-btn').addEventListener('click', () => removeById(id));

    // announce
    live.textContent = `Added ${data.first} ${data.last}`;
    // focus remove button for quick keyboard access
    removeBtn.focus();
  }

  // Remove card + row by id
  function removeById(id){
    const card = cardsContainer.querySelector(`[data-id="${id}"]`);
    const row = tbody.querySelector(`tr[data-id="${id}"]`);
    if(card) card.remove();
    if(row) row.remove();
    live.textContent = 'Profile removed';
  }

  // Escape simple HTML to avoid injection when inserting into table innerHTML
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (s) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    if(!validate(data)){
      live.textContent = 'Fix errors before submitting.';
      return;
    }
    addEntry(data);
    form.reset();
    // return focus to first field for keyboard flow
    document.getElementById('first').focus();
  });

  // Clear form button
  clearBtn.addEventListener('click', () => {
    form.reset();
    clearErrors();
    live.textContent = 'Form cleared';
    document.getElementById('first').focus();
  });

  // Small UX: validate email on blur for faster inline feedback
  document.getElementById('email').addEventListener('blur', (ev) => {
    const v = ev.target.value.trim();
    if(v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) showError('err-email','Please enter a valid email');
    else showError('err-email','');
  });

});