(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let shownItems = galleryItems;
  let currentPhoto = 0;
  const photoDialog = document.querySelector('#photo-dialog');
  const messageDialog = document.querySelector('#message-dialog');
  let previousFocus;
  function openDialog(dialog) {
    previousFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    });
  });

  document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(filter => {
      const active = button === filter;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    galleryItems.forEach(item => { item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
    shownItems = galleryItems.filter(item => !item.hidden);
    document.querySelector('#gallery-status').textContent = `Showing ${shownItems.length} portfolio ${shownItems.length === 1 ? 'photo' : 'photos'}.`;
  }));

  function displayPhoto(index) {
    currentPhoto = (index + shownItems.length) % shownItems.length;
    const item = shownItems[currentPhoto];
    const sourceImage = item.querySelector('img');
    const image = document.querySelector('#dialog-image');
    image.src = sourceImage.getAttribute('src');
    image.alt = sourceImage.alt;
    document.querySelector('#photo-title').textContent = item.dataset.title;
    document.querySelector('#photo-category').textContent = item.dataset.subtitle;
    document.querySelector('#photo-source').href = item.dataset.source;
    document.querySelector('#photo-counter').textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${String(shownItems.length).padStart(2, '0')}`;
    document.querySelectorAll('.lightbox-nav button').forEach(button => { button.disabled = shownItems.length < 2; });
  }
  galleryItems.forEach(item => item.addEventListener('click', () => {
    displayPhoto(shownItems.indexOf(item));
    openDialog(photoDialog);
  }));
  document.querySelector('#previous-photo').addEventListener('click', () => displayPhoto(currentPhoto - 1));
  document.querySelector('#next-photo').addEventListener('click', () => displayPhoto(currentPhoto + 1));
  photoDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      displayPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  const serviceSelect = document.querySelector('#service-select');
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.service;
  }));
  const dateInput = document.querySelector('input[name="date"]');
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  document.querySelector('#year').textContent = String(today.getFullYear());

  const messageField = document.querySelector('#prepared-message');
  const copyStatus = document.querySelector('#copy-status');
  document.querySelector('#inquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = name => String(data.get(name) || '').trim();
    const name = value('name');
    if (!name) {
      const input = event.currentTarget.elements.name;
      input.setCustomValidity('Please enter your name.');
      input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), {once: true});
      return;
    }
    let date = 'To be confirmed';
    if (value('date')) date = new Intl.DateTimeFormat('en-PH', {year: 'numeric', month: 'long', day: 'numeric'}).format(new Date(`${value('date')}T12:00:00`));
    const message = `Hi FLO.! I’m ${name} and I’d love to inquire about ${value('service')}.\n\nEvent date: ${date}\nGuests: ${value('guests') || 'To be confirmed'}\nVenue: ${value('venue') || 'To be confirmed'}${value('notes') ? '\n\n' + value('notes') : ''}\n\nPlease share your availability, packages, inclusions, and pricing. Thank you!`;
    messageField.value = message;
    const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
    document.querySelector('#sms-message').href = `sms:+639159730444${separator}body=${encodeURIComponent(message)}`;
    copyStatus.textContent = 'For Facebook, copy your message and paste it into the conversation.';
    openDialog(messageDialog);
  });
  document.querySelector('#copy-message').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(messageField.value);
      copyStatus.textContent = 'Message copied. Paste it into your conversation with FLO.';
    } catch {
      messageField.focus();
      messageField.select();
      copyStatus.textContent = 'Your message is selected. Use your device’s Copy command, then paste it into your conversation with FLO.';
    }
  });
})();
