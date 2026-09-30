document.addEventListener('DOMContentLoaded', () => {
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
    }
  }

  // --- Step 6: Approval Chat ---
    function startApprovalChat() {
     const messagesContainer = document.querySelector('.approval-chat-messages');
     if(!messagesContainer) return;

     const existingMsgs = messagesContainer.querySelectorAll('.approval-chat-msg');
     existingMsgs.forEach(m => m.remove());
     const existingCta = messagesContainer.querySelector('.approval-chat-cta');
     if(existingCta) existingCta.remove();
     
     // Remove old interaction buttons if any
     const existingActions = messagesContainer.querySelectorAll('.approval-chat-bubble--action');
     existingActions.forEach(a => a.remove());

     function getCurrentTime() {
         const now = new Date();
         const h = String(now.getHours()).padStart(2, '0');
         const m = String(now.getMinutes()).padStart(2, '0');
         return `${h}:${m}`;
     }

     function createMsg(htmlContent, extraClasses='') {
         const msg = document.createElement('div');
         msg.className = 'approval-chat-msg ' + extraClasses;
         msg.innerHTML = `
           <img class="approval-chat-avatar" src="img/profile.webp" alt="">
           ${htmlContent}
         `;
         messagesContainer.appendChild(msg);
         msg.scrollIntoView({ behavior: 'smooth' });
         return msg;
     }

     function createUserMsg(text) {
         const msg = document.createElement('div');
         msg.className = 'approval-chat-msg approval-chat-msg--user';
         msg.innerHTML = `
           <div class="approval-chat-bubble has-time">
              ${text}
              <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `;
         messagesContainer.appendChild(msg);
         msg.scrollIntoView({ behavior: 'smooth' });
         return msg;
     }

     function createTypingMsg() {
         return createMsg(`
           <div class="approval-chat-bubble has-time">
              <div class="approval-chat-typing">
                 <div class="approval-chat-typing-dot"></div>
                 <div class="approval-chat-typing-dot"></div>
                 <div class="approval-chat-typing-dot"></div>
              </div>
           </div>
         `);
     }

     function createTextMsg(text) {
         return createMsg(`
           <div class="approval-chat-bubble has-time">
              ${text}
              <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `);
     }

     function createMediaMsg() {
         let imgTags = '';
         if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
             const kitsArray = Array.from(selectedKits);
             kitsArray.slice(0, 3).forEach(idx => {
                imgTags += `<img src="img/kits/kit_dl_${idx+1}.webp" alt="Kit">`;
             });
         } else {
             imgTags = `<img src="img/kits/kit_dl_1.webp" alt="Kit"><img src="img/kits/kit_dl_2.webp" alt="Kit">`;
         }
         return createMsg(`
           <div class="approval-chat-bubble approval-chat-media">
              <div class="approval-chat-media-clip">
                  <div class="approval-chat-media-rail">
                      ${imgTags}
                  </div>
              </div>
              <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `);
     }

     function createTotalMsg() {
         let totalValue = 0;
         if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
             selectedKits.forEach(idx => { totalValue += 235.90; });
         } else {
             totalValue = 1179.50; // fallback if no kits selected
         }
         
         const formattedValue = 'R$' + totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
         
         return createMsg(`
           <div class="approval-chat-bubble approval-chat-total">
              <div class="approval-chat-total-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
              </div>
              <div class="approval-chat-total-body">
                 <p class="approval-chat-total-title">Valor Total dos Produtos Escolhidos: <span class="approval-chat-total-value">${formattedValue}</span></p>
                 <p class="approval-chat-total-text">São mais de ${formattedValue} em produtos, totalmente de GRAÇA em parceria, incrível né? 🤩💜</p>
              </div>
              <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `);
     }

     function createGiftMsg() {
         return createMsg(`
           <div class="approval-chat-bubble approval-chat-gift">
              <img src="img/kits/bp.webp" onerror="this.src='https://reclub.shop/rHkIclJHLifFDH/img/kits/bp.webp'" class="approval-chat-media-gift" alt="Brinde">
              <div class="approval-chat-gift-body">
                 <div class="approval-chat-gift-tarja">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg> BRINDE EXCLUSIVO
                 </div>
                 <p class="approval-chat-gift-title"><strong>Um Brinde Grátis <span class="approval-chat-gift-accent">EXCLUSIVO</span></strong> em parceria com a Pandora: Esse bracelete é maravilhoso, né? 💜✨</p>
                 <p class="approval-chat-gift-text">Tudo isso no seu Primeiro Envio! Parabéns, viu? Você garantiu uma das últimas vagas disponíveis!</p>
              </div>
              <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `);
     }

     function createAudioMsg() {
         const audioSrc = 'img/audio/act.mp3';
         
         const msg = createMsg(`
           <div class="approval-chat-bubble approval-chat-audio" id="rcAudioPlayer">
               <span class="approval-chat-audio-ic approval-chat-audio-ic--play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>
               <span class="approval-chat-audio-ic approval-chat-audio-ic--pause" style="display:none;"><svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></span>
               <div class="approval-chat-audio-bar">
                  <div class="approval-chat-audio-fill" id="rcAudioFill" style="width: 0%;"></div>
               </div>
               <span class="approval-chat-audio-time" id="rcAudioCurrent">0:00</span>
               <span class="approval-chat-audio-time" style="left: auto; right: 40px;" id="rcAudioTotal">...</span>
               <span class="approval-chat-time">${getCurrentTime()}</span>
           </div>
         `);
         
         setTimeout(() => {
             const player = document.getElementById('rcAudioPlayer');
             const fill = document.getElementById('rcAudioFill');
             const currentLabel = document.getElementById('rcAudioCurrent');
             const playIcon = player.querySelector('.approval-chat-audio-ic--play');
             const pauseIcon = player.querySelector('.approval-chat-audio-ic--pause');
             if (!player) return;
             
             const audio = new Audio(audioSrc);
             audio.preload = 'auto';
             
             function fmtTime(s) {
                 s = Math.floor(s);
                 return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
             }
             
             audio.addEventListener('loadedmetadata', () => {
                 const totalEl = document.getElementById('rcAudioTotal');
                 if (totalEl && audio.duration) totalEl.textContent = fmtTime(audio.duration);
             });
             
             function updateBar() {
                 const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                 fill.style.width = pct + '%';
                 currentLabel.textContent = fmtTime(audio.currentTime);
             }
             
             audio.addEventListener('timeupdate', updateBar);
             audio.addEventListener('ended', () => {
                 player.classList.remove('is-playing');
                 playIcon.style.display = 'block';
                 pauseIcon.style.display = 'none';
                 fill.style.width = '100%';
             });
             
             player.addEventListener('click', () => {
                 if (audio.paused) {
                     audio.play().then(() => {
                         player.classList.add('is-playing');
                         playIcon.style.display = 'none';
                         pauseIcon.style.display = 'block';
                     }).catch(() => {});
                 } else {
                     audio.pause();
                     player.classList.remove('is-playing');
                     playIcon.style.display = 'block';
                     pauseIcon.style.display = 'none';
                 }
             });
         }, 100);
         
         return msg;
     }

     function createInteractionButton() {
         const wrap = document.createElement('div');
         wrap.className = 'approval-chat-bubble--action';
         wrap.innerHTML = `<button class="approval-chat-cta">EU QUERO MEUS KITS!</button>`;
         
         wrap.querySelector('button').addEventListener('click', async () => {
             wrap.remove();
             createUserMsg("Eu quero meus kits!");
             
             await delay(1000);
             const typing = createTypingMsg();
             await delay(2000);
             typing.remove();
             
             createTextMsg("Perfeito! O seu perfil foi aprovado e agora você só precisa preencher o seu endereço de entrega e pagar a pequena taxa de frete para enviarmos. 💕");
             
             await delay(1000);
             const btn = document.createElement('button');
             btn.type = 'button';
             btn.className = 'cta-button approval-chat-cta';
             btn.textContent = 'PREENCHER MEU ENDEREÇO →';
             btn.addEventListener('click', () => {
                 goToSection('address');
             });
             messagesContainer.appendChild(btn);
             btn.scrollIntoView({ behavior: 'smooth' });
         });
         
         messagesContainer.appendChild(wrap);
         wrap.scrollIntoView({ behavior: 'smooth' });
     }

     const nameInput = document.querySelector('#profileName');
     const userName = nameInput && nameInput.value.trim() !== '' ? nameInput.value : 'Avaliadora';
     const firstName = userName.split(' ')[0].toUpperCase();

     const delay = (ms) => new Promise(r => setTimeout(r, ms));
     
     (async () => {
         await delay(1000);
         const typing0 = createTypingMsg();
         await delay(2000);
         typing0.remove();
         createTextMsg(`Oii ${firstName}! Tudo bem? Parabéns por ter chegado até aqui! 🎉`);

         await delay(1500);
         const typing0b = createTypingMsg();
         await delay(2000);
         typing0b.remove();
         createTextMsg(`Eu sou a Lívia e vou finalizar o seu cadastro para liberar os seus produtos!`);

         await delay(1500);
         const typing0c = createTypingMsg();
         await delay(1500);
         typing0c.remove();
         createTextMsg(`Estou vendo aqui que você selecionou esses kits maravilhosos:`);

         await delay(1500);
         const typing1 = createTypingMsg();
         await delay(2000);
         typing1.remove();
         createMediaMsg();
         createTotalMsg();
         
         await delay(1500);
         const typing2 = createTypingMsg();
         await delay(2500);
         typing2.remove();
         createTextMsg(`Ahh! 👀 Não é só isso! As novas avaliadoras aprovadas esse ano recebem um brinde EXCLUSIVO:`);
         createGiftMsg();
         
         await delay(1500);
         const typing3 = createTypingMsg();
         await delay(2000);
         typing3.remove();
         createTextMsg(`🎙️ Antes da gente finalizar seu Perfil, vou te mandar um áudio explicando como funciona nosso clube:`);
         createAudioMsg();
         
         await delay(1500);
         createInteractionButton();
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
        // Duplicate multiple times for continuous marquee effect
        for (let i = 0; i < 4; i++) {
            Array.from(selectedKits).forEach(idx => {
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
  const addressInputs = document.querySelectorAll('section[data-step-id="address"] input');
  const btnAddressConf = document.querySelector('.address-confirm-btn');
  const btnAddressAccept = document.querySelector('.address-accept');
  
  if (addressInputs.length > 0 && btnAddressConf) {
    const checkAddress = () => {
      const someFilled = Array.from(addressInputs).some(i => i.value.trim() !== '');
      if (someFilled) {
        btnAddressConf.classList.remove('btn-disabled');
        btnAddressConf.disabled = false;
      }
    };
    addressInputs.forEach(inp => inp.addEventListener('input', checkAddress));
    
    if (btnAddressAccept) {
        btnAddressAccept.addEventListener('click', () => {
             btnAddressAccept.classList.toggle('active');
        });
    }

    btnAddressConf.addEventListener('click', () => {
      goToSection('shipping');
    });
  }

  // --- Step 8: Shipping ---
  const btnShippingConf = document.querySelector('.rc-ms-cta');
  const msBody = document.querySelector('[data-step-panel="shipping-multistep-body"]');
  const msStep2 = document.querySelector('[data-step-panel="shipping-ms-step2"]');
  const msStep3 = document.querySelector('[data-step-panel="shipping-ms-step3"]');

  if (btnShippingConf && msBody) {
    btnShippingConf.addEventListener('click', () => {
      // Oculta os itens do topo (Kits e o botão de Confirmar Vaga)
      btnShippingConf.style.display = 'none';
      const card = document.querySelector('.rc-ms-card');
      if (card) card.style.display = 'none';
      
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
    });
  }

  // --- Step 9: Checkout ---
  const btnCheckout = document.querySelector('.rc-finalize-cta');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
       goToSection('checkout');
    });
  }
});
