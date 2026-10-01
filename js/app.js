document.addEventListener('DOMContentLoaded', () => {
  // --- UTM Tracking: capture from URL and persist in sessionStorage ---
  (function captureUTMs() {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck'];
    utmKeys.forEach(key => {
      const val = params.get(key);
      if (val) {
        sessionStorage.setItem(key, val);
      }
    });
  })();

  function getStoredUTMs() {
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'src', 'sck'];
    const utms = {};
    utmKeys.forEach(key => {
      const val = sessionStorage.getItem(key);
      if (val) utms[key] = val;
    });
    return utms;
  }

  // Navigation State
  const sections = Array.from(document.querySelectorAll('section.page'));
  let currentSection = sections[0];

  function goToSection(id) {
    const target = document.querySelector(`section[data-step-id="${id}"]`);
    if (!target) return;
    
    currentSection.classList.remove('active', 'animate-in');
    target.classList.add('active');
    
    // Trigger reflow for animation
    void target.offsetWidth;
    target.classList.add('animate-in');
    
    currentSection = target;
    window.scrollTo(0, 0);
    
    if (id === 'approval') {
        startApprovalChat();
    } else if (id === 'address') {
        // Fill lead's first name in the address title
        const nameSpan = document.querySelector('[data-fill-name]');
        if (nameSpan) {
            const profileNameInput = document.getElementById('profileName');
            const fullName = profileNameInput ? profileNameInput.value.trim() : '';
            const firstName = fullName.split(' ')[0] || '';
            nameSpan.textContent = firstName || 'NOME';
        }
    } else if (id === 'shipping') {
        const orderKits = document.querySelector('[data-step-panel="shipping-order-kits"]');
        if (orderKits) {
            const kitBrands = [
                { id: 1,  name: 'Wepink',     color: '#e91e63', font: 'Dancing Script',    style: 'italic' }, // 0
                { id: 2,  name: 'SHEGLAM',    color: '#c2185b', font: 'Bebas Neue',         style: 'normal' }, // 1
                { id: 3,  name: 'Wepink',     color: '#e91e63', font: 'Dancing Script',     style: 'italic' }, // 2
                { id: 4,  name: 'SHEIN',      color: '#111111', font: 'Montserrat',          style: 'normal' }, // 3
                { id: 6,  name: 'Natura',     color: '#e65100', font: 'Nunito',              style: 'normal' }, // 4
                { id: 7,  name: 'Kérastase',  color: '#1565c0', font: 'Playfair Display',   style: 'italic' }, // 5
                { id: 8,  name: 'EUDORA',     color: '#7b3f00', font: 'Playfair Display',   style: 'normal' }, // 6
                { id: 10, name: 'WELLA',      color: '#d32f2f', font: 'Montserrat',          style: 'normal' }, // 7
                { id: 11, name: 'Melissa',    color: '#e91e63', font: 'Pacifico',            style: 'normal' }, // 8
                { id: 12, name: "L'ORÉAL",    color: '#111111', font: 'Raleway',             style: 'normal' }  // 9
            ];

            const makeItem = (brandIdx) => {
                const brand = kitBrands[brandIdx] || kitBrands[0];
                return `<div class="rc-order-kit-item">
                    <span class="rc-order-kit-brand" style="color:${brand.color};font-family:'${brand.font}',sans-serif;font-style:${brand.style};">${brand.name}</span>
                    <img src="img/kits/kit_dl_${brand.id}.webp" alt="${brand.name}" loading="lazy" onerror="this.style.display='none'">
                  </div>`;
            };

            // Use selected kits or all 10 as default
            const selected = (typeof selectedKits !== 'undefined' && selectedKits.size > 0)
                ? Array.from(selectedKits)
                : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            // Duplicate for seamless loop
            const allItems = [...selected, ...selected, ...selected];
            let html = '<div class="rc-order-kits-rail rc-order-kits-rail--auto">';
            allItems.forEach(idx => { html += makeItem(idx); });
            html += '</div>';
            orderKits.innerHTML = html;
        }
    }
  }


  // --- Step 6: Approval Chat ---
  function startApprovalChat() {
    const messagesContainer = document.querySelector('[data-step-panel="approval-chat-messages"]');
    if (!messagesContainer) return;

    // Clear previous chat messages (keep the name title element at top)
    const existingMsgs = messagesContainer.querySelectorAll('.approval-chat-msg, .approval-chat-bubble--action');
    existingMsgs.forEach(m => m.remove());

    function getCurrentTime() {
      const now = new Date();
      return String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    }

    // Lívia message — avatar injected inside each msg (CSS positions it absolute top-left)
    function createMsg(htmlContent) {
      const msg = document.createElement('div');
      msg.className = 'approval-chat-msg';
      msg.innerHTML = `<img class="approval-chat-avatar" src="img/profile.webp" alt="">${htmlContent}`;
      messagesContainer.appendChild(msg);
      msg.scrollIntoView({ behavior: 'smooth' });
      return msg;
    }

    function createUserMsg(text) {
      const msg = document.createElement('div');
      msg.className = 'approval-chat-msg approval-chat-msg--user';
      msg.innerHTML = `<div class="approval-chat-bubble has-time">${text}<span class="approval-chat-time">${getCurrentTime()}</span></div>`;
      messagesContainer.appendChild(msg);
      msg.scrollIntoView({ behavior: 'smooth' });
      return msg;
    }

    function createTypingMsg() {
      return createMsg(`<div class="approval-chat-bubble"><div class="approval-chat-typing"><div class="approval-chat-typing-dot"></div><div class="approval-chat-typing-dot"></div><div class="approval-chat-typing-dot"></div></div></div>`);
    }

    function createTextMsg(text) {
      return createMsg(`<div class="approval-chat-bubble has-time">${text}<span class="approval-chat-time">${getCurrentTime()}</span></div>`);
    }

    function createMediaMsg() {
      let imgTags = '';
      if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
        const kitBrandsMap = [
            { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 6 },
            { id: 7 }, { id: 8 }, { id: 10 }, { id: 11 }, { id: 12 }
        ];
        Array.from(selectedKits).slice(0, 4).forEach(idx => {
          const actualId = kitBrandsMap[idx] ? kitBrandsMap[idx].id : 1;
          imgTags += `<img src="img/kits/kit_dl_${actualId}.webp" alt="Kit ${actualId}">`;
        });
      } else {
        imgTags = `<img src="img/kits/kit_dl_1.webp" alt="Kit"><img src="img/kits/kit_dl_2.webp" alt="Kit"><img src="img/kits/kit_dl_3.webp" alt="Kit">`;
      }
      return createMsg(`<div class="approval-chat-bubble approval-chat-media"><div class="approval-chat-media-clip"><div class="approval-chat-media-rail">${imgTags}</div></div><span class="approval-chat-time">${getCurrentTime()}</span></div>`);
    }

    function createTotalMsg() {
      let totalValue = 0;
      if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
        selectedKits.forEach(() => { totalValue += 235.90; });
      } else {
        totalValue = 1179.50;
      }
      const fmt = 'R$' + totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return createMsg(`
        <div class="approval-chat-bubble approval-chat-total">
          <div class="approval-chat-total-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg></div>
          <div class="approval-chat-total-body">
            <p class="approval-chat-total-title">Valor Total dos Produtos Escolhidos: <span class="approval-chat-total-value">${fmt}</span></p>
            <p class="approval-chat-total-text">São mais de ${fmt} em produtos, totalmente de GRAÇA em parceria, incrível né? 🤩💜</p>
          </div>
          <span class="approval-chat-time">${getCurrentTime()}</span>
        </div>`);
    }

    function createGiftMsg() {
      return createMsg(`
        <div class="approval-chat-bubble approval-chat-gift">
          <img src="img/kits/bp.webp" class="approval-chat-media-gift" alt="Brinde Pandora">
          <div class="approval-chat-gift-body">
            <div class="approval-chat-gift-tarja">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg> BRINDE EXCLUSIVO
            </div>
            <p class="approval-chat-gift-title"><strong>Um Brinde Grátis <span class="approval-chat-gift-accent">EXCLUSIVO</span></strong> em parceria com a Pandora: Esse bracelete é maravilhoso, né? 💜✨</p>
            <p class="approval-chat-gift-text">Tudo isso no seu Primeiro Envio! Parabéns, viu? Você garantiu uma das últimas vagas disponíveis!</p>
          </div>
          <span class="approval-chat-time">${getCurrentTime()}</span>
        </div>`);
    }

    function createAudioMsg() {
      const uid = 'rcAudio_' + Date.now();
      const msg = createMsg(`
        <div class="approval-chat-bubble approval-chat-audio" id="${uid}">
          <span class="approval-chat-audio-ic approval-chat-audio-ic--play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>
          <span class="approval-chat-audio-ic approval-chat-audio-ic--pause" style="display:none;"><svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></span>
          <div class="approval-chat-audio-bar"><div class="approval-chat-audio-fill" id="${uid}_fill" style="width:0%"></div></div>
          <span class="approval-chat-audio-time" id="${uid}_time">0:19</span>
          <span class="approval-chat-time">${getCurrentTime()}</span>
        </div>`);
      setTimeout(() => {
        const player = document.getElementById(uid);
        if (!player) return;
        const fill = document.getElementById(uid + '_fill');
        const timeEl = document.getElementById(uid + '_time');
        const playIc = player.querySelector('.approval-chat-audio-ic--play');
        const pauseIc = player.querySelector('.approval-chat-audio-ic--pause');
        const audio = new Audio('img/audio/act.mp3');
        audio.preload = 'auto';
        function fmt(s) { s = Math.floor(s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
        audio.addEventListener('timeupdate', () => {
          if (fill) fill.style.width = (audio.duration ? audio.currentTime/audio.duration*100 : 0) + '%';
          if (timeEl) timeEl.textContent = fmt(audio.currentTime);
        });
        audio.addEventListener('ended', () => { player.classList.remove('is-playing'); playIc.style.display=''; pauseIc.style.display='none'; if(fill) fill.style.width='100%'; });
        player.addEventListener('click', () => {
          if (audio.paused) { audio.play().then(() => { player.classList.add('is-playing'); playIc.style.display='none'; pauseIc.style.display=''; }).catch(()=>{}); }
          else { audio.pause(); player.classList.remove('is-playing'); playIc.style.display=''; pauseIc.style.display='none'; }
        });
      }, 100);
      return msg;
    }

    function createTermsMsg() {
      const terms = [
        { icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>', label: 'Avaliação por Produto', text: 'O Consumidor terá de fazer uma Avaliação por Cada Produto Recebido em Parceria com as Marcas.' },
        { icon: '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>', label: 'Uso Pessoal', text: 'Após Avaliação, os Produtos recebidos serão de Uso Pessoal do Consumidor.' },
        { icon: '<rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>', label: 'Dados Protegidos', text: 'Todos os Dados Pessoais do Consumidor permanecem Seguros e Criptografados.' },
        { icon: '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>', label: 'Entrega Rastreada', text: 'A Entrega dos Produtos tem Rastreamento e Garantia de Recebimento de até 30 dias.' },
        { icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>', label: 'Empresa Legalizada', text: 'Atuamos sob CNPJ (67.052.156/0001-97) e seguimos a lei de parcerias empresariais (Art.123 do CDC).' }
      ];
      const itemsHtml = terms.map(t => `
        <div class="approval-chat-terms-item">
          <div class="approval-chat-terms-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg></div>
          <div class="approval-chat-terms-copy"><p class="approval-chat-terms-label">${t.label}</p><p class="approval-chat-terms-text">${t.text}</p></div>
        </div>`).join('');
      return createMsg(`
        <div class="approval-chat-bubble approval-chat-terms">
          <div class="approval-chat-terms-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span><strong>Termos de Segurança</strong> — <span class="approval-chat-terms-accent">Recebidos Club</span> &amp; CO</span>
          </div>
          ${itemsHtml}
          <span class="approval-chat-time">${getCurrentTime()}</span>
        </div>`);
    }

    // Get user name
    const nameInput = document.querySelector('#profileName');
    const rawName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Avaliadora';
    const firstName = rawName.split(' ')[0];

    // Update "CHAT EXCLUSIVO: JOAO / AVALIADORA APROVADA" title
    const chatNameFull = document.querySelector('[data-step-panel="approval-chat-name-full"]');
    if (chatNameFull) chatNameFull.textContent = `CHAT EXCLUSIVO: ${firstName.toUpperCase()}`;

    const delay = ms => new Promise(r => setTimeout(r, ms));

    (async () => {
      let t;

      await delay(1500);
      t = createTypingMsg(); await delay(2500); t.remove();
      createTextMsg(`Olê ${firstName}! Sou a Lívia, e estava acompanhando seu Cadastro 😊`);

      await delay(1500);
      t = createTypingMsg(); await delay(2800); t.remove();
      createTextMsg(`Verifiquei todos seus dados e... VOCÊ TÁ APROVADAAA! 🎊😁🎊`);

      await delay(2000);
      t = createTypingMsg(); await delay(5500); t.remove();
      createTextMsg(`Seja MUITO bem-vinda a Recebidos Club! Veja seus Benefícios sendo Avaliadora:\n\nVocê recebe kits em parceria todos os meses, em troca de gravar vídeos de avaliação quando os produtos chegarem 💜\n\nVocê recebe comissões no PIX por cada recebido avaliado, e já ganhou um saldo de R$360 só por ter sido aprovada! 💵\n\nE Muitas outras Oportunidades que você vai acompanhar dentro do APP!`);

      await delay(2500);
      t = createTypingMsg(); await delay(2500); t.remove();
      createTextMsg(`👇 Olha, isso é tudo que você vai receber no seu primeiro envio:`);

      await delay(1200);
      createMediaMsg();
      await delay(800);
      createTotalMsg();

      await delay(3000);
      t = createTypingMsg(); await delay(3500); t.remove();
      createTextMsg(`Ahh! 👀 Não é só isso! As novas avaliadoras aprovadas esse ano recebem um brinde EXCLUSIVO:`);

      await delay(1200);
      createGiftMsg();

      await delay(3500);
      t = createTypingMsg(); await delay(3000); t.remove();
      createTextMsg(`Antes da gente finalizar seu Perfil, vou te mandar um áudio explicando como funciona nosso clube:`);

      await delay(2000);
      t = createTypingMsg(); await delay(2000); t.remove();
      createAudioMsg();

      await delay(3500);
      t = createTypingMsg(); await delay(2500); t.remove();
      createTextMsg(`Tudo certinho? Podemos finalizar a criação do seu Perfil e continuar? 😊`);

      await delay(1200);
      // Button 1
      const btn1Wrap = document.createElement('div');
      btn1Wrap.className = 'approval-chat-bubble--action';
      const btn1 = document.createElement('button');
      btn1.type = 'button';
      btn1.className = 'cta-button approval-chat-cta';
      btn1.textContent = 'ENTENDI! QUERO CONTINUAR';
      btn1.addEventListener('click', async () => {
        btn1.classList.add('approval-chat-cta--used');
        btn1.disabled = true;

        await delay(1200);
        t = createTypingMsg(); await delay(2500); t.remove();
        createTextMsg(`Perfeito! Confirma os termos de Segurança para continuarmos:`);

        await delay(1000);
        createTermsMsg();

        await delay(2500);
        t = createTypingMsg(); await delay(2000); t.remove();
        createTextMsg(`Se estiver tudo certinho, Confirma pra mim 💜👇`);

        await delay(1200);
        // Button 2
        const btn2Wrap = document.createElement('div');
        btn2Wrap.className = 'approval-chat-bubble--action';
        const btn2 = document.createElement('button');
        btn2.type = 'button';
        btn2.className = 'cta-button approval-chat-cta';
        btn2.textContent = 'ACEITAR TERMOS E CONTINUAR';
        btn2.addEventListener('click', () => { goToSection('address'); });
        btn2Wrap.appendChild(btn2);
        messagesContainer.appendChild(btn2Wrap);
        btn2Wrap.scrollIntoView({ behavior: 'smooth' });
      });
      btn1Wrap.appendChild(btn1);
      messagesContainer.appendChild(btn1Wrap);
      btn1Wrap.scrollIntoView({ behavior: 'smooth' });
    })();
  }

  // --- Step 1: Start ---
  const btnStart = document.querySelector('.start-cta');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      goToSection('kit-selection');
    });
  }

  // --- Step 2: Kit Selection ---
  let selectedKits = new Set();
  const maxKits = 5;
  const kitCards = document.querySelectorAll('.kit-card:not(.out-of-stock)');
  const kitCounter = document.querySelector('[data-step-panel="kit-selection-counter"]');
  const btnKitsConfirm = document.querySelector('.kit-selection-confirm');

  // Ensure no kits start pre-selected
  kitCards.forEach((card) => {
    card.classList.remove('selected');
  });
  selectedKits.clear();


  function updateKits() {
    kitCards.forEach((card, idx) => {
      if (selectedKits.has(idx)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
    if (kitCounter) kitCounter.textContent = `${selectedKits.size}/${maxKits}`;
    if (btnKitsConfirm) {
      btnKitsConfirm.disabled = selectedKits.size < 2;
      btnKitsConfirm.classList.toggle('btn-disabled', selectedKits.size < 2);
    }
  }

  // Initialize: start with nothing selected
  updateKits();


  kitCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (selectedKits.has(idx)) {
        selectedKits.delete(idx);
      } else {
        if (selectedKits.size >= maxKits) {
          alert(`Você pode escolher no máximo ${maxKits} kits.`);
          return;
        }
        selectedKits.add(idx);
      }
      updateKits();
    });
  });

  if (btnKitsConfirm) {
    btnKitsConfirm.addEventListener('click', () => {
      // Build continuous carousel
      const rail = document.querySelector('[data-step-panel="kit-confirmation-carousel-rail-top"]');
      if (rail) {
        rail.innerHTML = '';
        // Optimized sequence generation to prevent performance lag (max ~20 items total)
        let baseSequence = Array.from(selectedKits);
        if (baseSequence.length === 0) {
          // Fallback if somehow no kits are selected
          baseSequence = [0, 1, 2];
        }
        let aSequence = [];
        while (aSequence.length < 8) {
          aSequence = aSequence.concat(baseSequence);
        }
        const fullRail = aSequence.concat(aSequence);

        fullRail.forEach(idx => {
          const kitCard = kitCards[idx];
          const imgPath = kitCard.querySelector('img').src;
          const item = document.createElement('div');
          item.className = 'kit-confirmation-carousel-item';
          const img = document.createElement('img');
          img.src = imgPath;
          item.appendChild(img);
          rail.appendChild(item);
        });
      }

      // Update total price (R$235.90 per kit as seen in original)
      const totalPrice = (selectedKits.size * 235.90).toFixed(2).replace('.', ',');
      const summaryValue = document.querySelector('[data-step-panel="kit-confirmation-summary-value"]');
      if (summaryValue) {
        summaryValue.innerHTML = `<strong>R$${totalPrice}</strong> em Produtos, <strong>totalmente de Graça</strong>`;
      }
      const galleryTotal = document.querySelector('[data-step-panel="kit-confirmation-gallery-total"]');
      if (galleryTotal) {
        galleryTotal.textContent = `Valor total dos Produtos Escolhidos: R$${totalPrice}`;
      }

      goToSection('kit-confirmation');
    });
  }

  // --- Step 3: Kit Confirmation ---
  const btnKitConfCta = document.querySelector('.kit-confirmation-cta');
  if (btnKitConfCta) {
    btnKitConfCta.addEventListener('click', () => {
      goToSection('profile');
    });
  }

  // --- Step 4: Profile ---
  const profileSteps = Array.from(document.querySelectorAll('[data-step-panel="profile-step"]'));
  let currentProfileStep = 0;

  function showProfileStep(idx) {
    profileSteps.forEach((step, i) => {
      if (i === idx) {
        step.removeAttribute('data-step-hidden');
        step.style.display = '';
      } else {
        step.setAttribute('data-step-hidden', 'true');
        step.style.display = 'none';
      }
    });
    const stepLabel = document.querySelector('[data-step-panel="profile-nav-step"]');
    if (stepLabel) stepLabel.textContent = `Passo ${idx + 1} de 4`;
    // Update dots
    const dots = document.querySelectorAll('[data-step-panel="profile-step-dot"]');
    dots.forEach((dot, i) => {
      dot.className = i <= idx ? 'is-active' : '';
    });
    // Back button visibility
    const backBtn = document.querySelector('[data-step-action="profile-step-back"]');
    if (backBtn) backBtn.style.visibility = idx > 0 ? 'visible' : 'hidden';
  }

  if (profileSteps.length > 0) {
    // Make sure all steps initially set
    profileSteps.forEach((step, i) => {
      if (i > 0) {
        step.setAttribute('data-step-hidden', 'true');
        step.style.display = 'none';
      } else {
        step.removeAttribute('data-step-hidden');
        step.style.display = '';
      }
    });
    showProfileStep(0);

    // Back button
    const profileBackBtn = document.querySelector('[data-step-action="profile-step-back"]');
    if (profileBackBtn) {
      profileBackBtn.addEventListener('click', () => {
        if (currentProfileStep > 0) {
          currentProfileStep--;
          showProfileStep(currentProfileStep);
        }
      });
    }

    profileSteps.forEach((step, idx) => {
      const inputs = step.querySelectorAll('input');
      const btnNext = step.querySelector('.cta-button');

      // Input-driven enable
      if (inputs.length > 0 && btnNext) {
        const checkInputs = () => {
          const allFilled = Array.from(inputs).every(i => i.value.trim() !== '');
          btnNext.classList.toggle('btn-disabled', !allFilled);
          btnNext.disabled = !allFilled;
        };
        inputs.forEach(inp => inp.addEventListener('input', checkInputs));
        // Also support enter key
        inputs.forEach(inp => inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !btnNext.disabled) {
            e.preventDefault();
            btnNext.click();
          }
        }));
      }

      // Choice buttons (single-select per group)
      const choiceGroups = step.querySelectorAll('[data-step-panel="profile-choice"], [data-step-panel="profile-product-grid"]');
      choiceGroups.forEach(group => {
        const choiceButtons = group.querySelectorAll('button');
        const isSingleSelect = group.dataset.choiceLayout === 'cards' ? false : true;

        choiceButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            if (isSingleSelect) {
              // Single-select: deselect siblings first
              choiceButtons.forEach(b => b.classList.remove('selected', 'is-selected'));
              btn.classList.add('selected', 'is-selected');
            } else {
              // Multi-select
              btn.classList.toggle('selected');
              btn.classList.toggle('is-selected');
            }
            // Enable next button
            if (btnNext) {
              const anySelected = step.querySelectorAll('.selected, .is-selected').length > 0;
              btnNext.classList.toggle('btn-disabled', !anySelected);
              btnNext.disabled = !anySelected;
            }
          });
        });
      });

      // Next button
      if (btnNext) {
        btnNext.addEventListener('click', (e) => {
          e.preventDefault();
          if (btnNext.disabled) return;
          if (idx < profileSteps.length - 1) {
            currentProfileStep = idx + 1;
            showProfileStep(currentProfileStep);
            window.scrollTo(0, 0);
          } else {
            goToSection('profile-check');
            simulateProfileCheck();
          }
        });
      }
    });
  }

  // Scoped Testimonials Animator
  const testiContainers = document.querySelectorAll('.rc-testi');
  testiContainers.forEach(container => {
    const slides = container.querySelectorAll('.rc-testi-slide');
    const dots = container.querySelectorAll('.rc-testi-dots i');
    if (slides.length > 0) {
      let current = 0;
      function show() {
        slides.forEach((s, i) => {
          if (i === current) s.classList.add('is-active');
          else s.classList.remove('is-active');
        });
        if (dots.length > 0) {
          dots.forEach((d, i) => {
            if (i === current) d.classList.add('is-active');
            else d.classList.remove('is-active');
          });
        }
        current = (current + 1) % slides.length;
      }
      show();
      setInterval(show, 4000);
    }
  });

  // --- Step 5: Profile Check ---
  function simulateProfileCheck() {
    const fill = document.querySelector('.profile-check-progress-fill');
    const desc = document.querySelector('.profile-check-progress-desc');
    const texts = ["Verificando dados pessoais...", "Analisando perfil...", "Verificando Instagram...", "Calculando limites de comissão..."];
    
    const videoSlot = document.querySelector('.profile-check-video-slot');
    const video = document.querySelector('.profile-check-video');
    const horizontalTestis = document.querySelector('.profile-check-testimonials');
    
    let textInterval;
    if (desc) {
      let textIdx = 0;
      textInterval = setInterval(() => {
        textIdx++;
        if (textIdx < texts.length) {
          desc.textContent = texts[textIdx];
        }
      }, 1000); // Slower text update to match longer video
    }

    let isFinished = false;
    function finishCheck() {
      if (isFinished) return;
      isFinished = true;
      if (textInterval) clearInterval(textInterval);
      if (fill) {
          fill.style.transition = 'width 0.3s ease';
          fill.style.width = '100%';
      }

      // Hide video
      if (videoSlot) videoSlot.style.display = 'none';
      if (video) video.pause();
      
      // Show carousel
      if (horizontalTestis) {
          horizontalTestis.removeAttribute('hidden');
      }
      
      // Update Title and Desc
      const title = document.querySelector('.profile-check-title');
      if (title) {
          title.innerHTML = '<span>LÍVIA</span> verificou seu Perfil! <span class="pc-accent">ACESSE O CHAT ABAIXO</span>';
      }
      if (desc) {
          desc.textContent = "Verificação Finalizada!";
      }

      // Show Button
      const btnVerify = document.querySelector('.profile-check-cta');
      if (btnVerify) {
        btnVerify.hidden = false;
        btnVerify.addEventListener('click', () => {
          goToSection('approval');
          
          // Animate approval step Name
          const profileName = document.querySelector('#profileName');
          const approvalName = document.querySelector('[data-step-panel="approval-chat-name-full"]');
          if(profileName && profileName.value && approvalName) {
              const firstName = profileName.value.split(' ')[0].toUpperCase();
              approvalName.textContent = 'CHAT EXCLUSIVO: ' + firstName;
          } else if(approvalName) {
              approvalName.textContent = 'CHAT EXCLUSIVO';
          }
        });
      }
    }

    if (video) {
      const source = video.querySelector('source');
      if (source && source.dataset.src) {
        source.src = source.dataset.src;
        video.load();
        
        video.addEventListener('timeupdate', () => {
            if (video.duration && fill) {
                fill.style.transition = 'none';
                fill.style.width = ((video.currentTime / video.duration) * 100) + '%';
            }
        });
        
        video.muted = false;
        video.volume = 1.0;
        video.play().then(() => {
            video.addEventListener('ended', finishCheck);
            // Backup fallback just in case video hangs
            setTimeout(finishCheck, 60000); 
        }).catch(e => {
            console.log('Video autoplay blocked:', e);
            if (fill) {
                fill.style.transition = 'width 5s linear';
                fill.style.width = '100%';
            }
            setTimeout(finishCheck, 5000);
        });
      } else {
        setTimeout(finishCheck, 5000);
      }
    } else {
        setTimeout(finishCheck, 5000);
    }
  }

  // Testimonials Marquee (Step 5 - profile-check)
  const profileTrack = document.querySelector('.profile-check-testimonials-track');
  if (profileTrack) {
    profileTrack.style.animation = 'marquee-x 20s linear infinite';
  }

  // --- Step 7: Address ---
  const cepInput          = document.querySelector('#addressCep');
  const emailInput        = document.querySelector('#addressEmail');
  const whatsappInput     = document.querySelector('#addressWhatsapp');
  const streetInput       = document.querySelector('#addressStreet');
  const neighborhoodInput = document.querySelector('#addressNeighborhood');
  const cityInput         = document.querySelector('#addressCity');
  const stateInput        = document.querySelector('#addressState');
  const numberInput       = document.querySelector('#addressNumber');
  const addressFields     = document.querySelector('[data-step-panel="address-fields"]');
  const addressCepField   = document.querySelector('[data-step-panel="address-cep-field"]');
  const btnAddressConf    = document.querySelector('.address-confirm-btn');
  const btnAddressAccept  = document.querySelector('.address-accept');

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }
  function validatePhone(v) {
    return v.replace(/\D/g,'').length >= 11;
  }
  function checkAddressForm() {
    if (!btnAddressConf) return;
    const emailOk  = emailInput  && validateEmail(emailInput.value);
    const phoneOk  = whatsappInput && validatePhone(whatsappInput.value);
    const cepOk    = cepInput    && cepInput.value.replace(/\D/g,'').length === 8;
    const streetOk = streetInput && streetInput.value.trim() !== '';
    const numberOk = numberInput && numberInput.value.trim() !== '';
    if (emailOk && phoneOk && cepOk && streetOk && numberOk) {
      btnAddressConf.classList.remove('btn-disabled');
      btnAddressConf.disabled = false;
    } else {
      btnAddressConf.classList.add('btn-disabled');
      btnAddressConf.disabled = true;
    }
  }

  // CEP auto-fill via ViaCEP (browser fetch — no sandbox issue)
  if (cepInput) {
    cepInput.addEventListener('input', () => {
      let v = cepInput.value.replace(/\D/g,'');
      if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
      cepInput.value = v;
      cepInput.classList.remove('invalid');
      const digits = v.replace(/\D/g,'');
      if (digits.length === 8) {
        if (addressCepField) addressCepField.classList.add('is-searching');
        fetch(`https://viacep.com.br/ws/${digits}/json/`)
          .then(r => r.json())
          .then(data => {
            if (addressCepField) addressCepField.classList.remove('is-searching');
            if (!data.erro) {
              if (streetInput)       streetInput.value       = data.logradouro || '';
              if (neighborhoodInput) neighborhoodInput.value = data.bairro     || '';
              if (cityInput)         cityInput.value         = data.localidade  || '';
              if (stateInput)        stateInput.value        = data.uf          || '';
              if (addressFields)     addressFields.classList.add('visible');
              if (numberInput) setTimeout(() => numberInput.focus(), 150);
            } else {
              cepInput.classList.add('invalid');
            }
            checkAddressForm();
          })
          .catch(() => {
            if (addressCepField) addressCepField.classList.remove('is-searching');
          });
      }
      checkAddressForm();
    });
  }

  // Email validation with live feedback
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value.length > 0 && !validateEmail(emailInput.value))
        emailInput.classList.add('invalid');
      else emailInput.classList.remove('invalid');
    });
    emailInput.addEventListener('input', () => {
      if (validateEmail(emailInput.value)) emailInput.classList.remove('invalid');
      checkAddressForm();
    });
  }

  // WhatsApp mask + validation
  if (whatsappInput) {
    whatsappInput.setAttribute('inputmode','numeric');
    whatsappInput.addEventListener('input', () => {
      let v = whatsappInput.value.replace(/\D/g,'');
      if (v.length > 11) v = v.slice(0,11);
      if      (v.length > 7) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      whatsappInput.value = v;
      if (validatePhone(whatsappInput.value)) whatsappInput.classList.remove('invalid');
      checkAddressForm();
    });
    whatsappInput.addEventListener('blur', () => {
      if (whatsappInput.value.length > 0 && !validatePhone(whatsappInput.value))
        whatsappInput.classList.add('invalid');
    });
  }

  // Other address inputs
  [streetInput, neighborhoodInput, cityInput, stateInput, numberInput,
   document.querySelector('#addressComplement')].filter(Boolean)
    .forEach(inp => inp.addEventListener('input', checkAddressForm));

  if (btnAddressAccept) {
    btnAddressAccept.addEventListener('click', () => btnAddressAccept.classList.toggle('active'));
  }
  if (btnAddressConf) {
    btnAddressConf.addEventListener('click', () => { goToSection('shipping'); });
  }

  // --- Step 8: Shipping ---
  const btnShippingConf = document.querySelector('.rc-ms-cta');
  const msBody = document.querySelector('[data-step-panel="shipping-multistep-body"]');
  const msStep2 = document.querySelector('[data-step-panel="shipping-ms-step2"]');
  const msStep3 = document.querySelector('[data-step-panel="shipping-ms-step3"]');

  if (btnShippingConf && msBody) {
    btnShippingConf.addEventListener('click', () => {
      // Oculta os itens do topo (Kits e o botão de Confirmar Vaga) mas NÃO oculta o card inteiro, senão o msBody some
      const elementsToHide = document.querySelectorAll('.rc-shipping-subtitle, .rc-ms-kits, .rc-ms-cta, .rc-social-proof, .rc-ms-safe');
      elementsToHide.forEach(el => el.style.display = 'none');
      
      // Mostra o body multi-step
      msBody.removeAttribute('aria-hidden');
      msBody.classList.add('is-open');
      msBody.style.display = 'block';
    });
  }

  // Handle plan options (Step 1 -> Step 2)
  const planOptions = document.querySelectorAll('.rc-plan-option');
  planOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      planOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      updateTotals();
      if (msStep2) {
         msStep2.removeAttribute('aria-hidden');
         msStep2.classList.add('is-open');
         msStep2.style.display = 'block';
         setTimeout(() => msStep2.scrollIntoView({behavior: 'smooth', block: 'start'}), 50);
      }
    });
  });

  // Handle shipping options (Step 2 -> Step 3)
  const shipOptions = document.querySelectorAll('.rc-ship-option');
  shipOptions.forEach(opt => {
      opt.addEventListener('click', () => {
          shipOptions.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          updateTotals();
          if (msStep3) {
             msStep3.removeAttribute('aria-hidden');
             msStep3.classList.add('is-open');
             msStep3.style.display = 'block';
             setTimeout(() => msStep3.scrollIntoView({behavior: 'smooth', block: 'start'}), 50);
          }
      });
  });

  // Handle bump (extra surpresa)
  const bumpCard = document.querySelector('.rc-bump-card');
  if (bumpCard) {
    bumpCard.addEventListener('click', () => {
       const isPressed = bumpCard.getAttribute('aria-pressed') === 'true';
       bumpCard.setAttribute('aria-pressed', !isPressed);
       updateTotals();
    });
  }

  // Calculate and update totals
  function updateTotals() {
    const orderLines = document.querySelector('[data-step-panel="shipping-order-lines"]');
    const orderTotal = document.querySelector('[data-step-panel="shipping-order-total"]');
    const btnFinalize = document.querySelector('[data-step-action="shipping-finalize"]');
    
    if (!orderLines || !orderTotal) return;

    const selectedPlan = document.querySelector('.rc-plan-option.selected');
    const selectedShip = document.querySelector('.rc-ship-option.selected');
    const isBumpSelected = bumpCard && bumpCard.getAttribute('aria-pressed') === 'true';

    let html = '';
    let total = 0;

    if (selectedPlan) {
       let planNameEl = selectedPlan.querySelector('.rc-plan-option-top strong');
       let planName = planNameEl ? planNameEl.textContent : 'Plano';
       let planPrice = parseFloat(selectedPlan.dataset.price || 0);
       html += `<div class="rc-order-line"><span class="rc-order-line-label">Taxa de Adesão (${planName})</span><i class="rc-order-line-fill" aria-hidden="true"></i><strong class="rc-order-line-value">R$${planPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></div>`;
       total += planPrice;
    }

    if (selectedShip) {
       let shipNameEl = selectedShip.querySelector('.rc-ship-option-head strong');
       let shipName = shipNameEl ? shipNameEl.textContent.trim() : 'Frete';
       let shipPrice = parseFloat(selectedShip.dataset.shipTotal || 0);
       html += `<div class="rc-order-line"><span class="rc-order-line-label">Primeiro Envio (${shipName})</span><i class="rc-order-line-fill" aria-hidden="true"></i><strong class="rc-order-line-value">R$${shipPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></div>`;
       total += shipPrice;
    }

    if (isBumpSelected) {
       html += `<div class="rc-order-line"><span class="rc-order-line-label">Kits Extra Surpresa</span><i class="rc-order-line-fill" aria-hidden="true"></i><strong class="rc-order-line-value">R$9,90</strong></div>`;
       total += 9.90;
    }

    orderLines.innerHTML = html;
    orderTotal.textContent = 'R$' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});
    window.checkoutTotalValue = total;

    if (btnFinalize) {
       if (selectedPlan && selectedShip) {
         btnFinalize.classList.remove('btn-disabled');
         btnFinalize.disabled = false;
       } else {
         btnFinalize.classList.add('btn-disabled');
         btnFinalize.disabled = true;
       }
    }
  }

  // Initialize total if already pre-selected
  updateTotals();

  // --- Step 9: Checkout (HuraPay Backend Integration) ---
  const btnCheckout = document.querySelector('.rc-finalize-cta');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', async () => {
       if (!btnCheckout.classList.contains('btn-disabled')) {
           const qrTotal = document.getElementById('checkoutQrTotal');
           if (qrTotal && window.checkoutTotalValue) {
               qrTotal.textContent = 'R$' + window.checkoutTotalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2});
           }
           
           // Extract selections
           const selectedPlan = document.querySelector('.rc-plan-option.selected');
           const selectedShip = document.querySelector('.rc-ship-option.selected');
           const bumpCard = document.querySelector('.rc-bump-card');
           
           const planKey = selectedPlan ? 'plan_' + selectedPlan.dataset.rcTrackValue : null; 
           const shippingKey = selectedShip ? 'shipping_' + selectedShip.dataset.ship : null; 
           const hasBump = bumpCard && bumpCard.getAttribute('aria-pressed') === 'true';

           const customer = {
              name: document.getElementById('profileName')?.value.trim() || 'Cliente',
              email: document.getElementById('addressEmail')?.value.trim() || 'cliente@recebidos.com',
              phone: document.getElementById('addressWhatsapp')?.value.trim() || '11999999999'
           };

           // Loading UI
           const oldText = btnCheckout.textContent;
           btnCheckout.textContent = 'GERANDO PIX...';
           btnCheckout.disabled = true;

           try {
               const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                 ? 'http://localhost:3001/api/checkout' 
                 : '/api/checkout'; 
                 
               const response = await fetch(API_URL, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ customer, planKey, shippingKey, hasBump, utms: getStoredUTMs() })
               });
               const data = await response.json();
               
               if (data.brCodeBase64 && data.brCode) {
                   document.getElementById('checkoutQrImg').src = data.brCodeBase64;
                   document.getElementById('checkoutKeyInput').value = data.brCode;
                   goToSection('checkout');
               } else {
                   alert('Erro ao gerar PIX: ' + (data.error || 'Verifique se os dados estão preenchidos.'));
               }
           } catch (err) {
               console.error(err);
               alert('Erro de conexão com o servidor. Tente novamente.');
           } finally {
               btnCheckout.textContent = oldText;
               btnCheckout.disabled = false;
           }
       }
    });
  }
  
  // --- Copy PIX Code Logic ---
  const copyBtn = document.getElementById('checkoutCopyBtn');
  if (copyBtn) {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.addEventListener('click', () => {
      const pixInput = document.getElementById('checkoutKeyInput');
      if (pixInput && pixInput.value) {
        // Fallback for older browsers
        const fallbackCopy = () => {
          pixInput.select();
          pixInput.setSelectionRange(0, 99999); // For mobile devices
          try {
            document.execCommand('copy');
            showSuccess();
          } catch (err) {
            console.error('Failed to copy text', err);
          }
        };

        const showSuccess = () => {
          copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;margin-right:6px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado!';
          copyBtn.style.backgroundColor = '#4CAF50';
          copyBtn.style.color = '#fff';
          copyBtn.style.borderColor = '#4CAF50';
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
          }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pixInput.value)
            .then(showSuccess)
            .catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
      }
    });
  }

});
