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

     function createMsg(htmlContent, extraClasses='') {
         const msg = document.createElement('div');
         msg.className = 'approval-chat-msg ' + extraClasses;
         msg.innerHTML = `
           <img class="approval-chat-avatar" src="img/hero.webp" alt="">
           ${htmlContent}
         `;
         messagesContainer.appendChild(msg);
         msg.scrollIntoView({ behavior: 'smooth' });
         return msg;
     }

     function createTypingMsg() {
         return createMsg(`
           <div class="approval-chat-bubble">
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
           <div class="approval-chat-bubble">
              ${text}
           </div>
         `);
     }

     function createMediaMsg() {
         let imgTags = '';
         if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
             const kitsArray = Array.from(selectedKits);
             kitsArray.slice(0, 3).forEach(idx => {
                imgTags += `<img src="img/kits/somentekits/${idx+1}.webp" alt="Kit">`;
             });
         } else {
             imgTags = `<img src="img/kits/somentekits/1.webp" alt="Kit"><img src="img/kits/somentekits/2.webp" alt="Kit">`;
         }
         return createMsg(`
           <div class="approval-chat-bubble approval-chat-media">
              <div class="approval-chat-media-clip">
                  <div class="approval-chat-media-rail">
                      ${imgTags}
                  </div>
              </div>
           </div>
         `);
     }

     function createTotalMsg() {
         let totalValue = 0;
         if (typeof selectedKits !== 'undefined' && selectedKits.size > 0) {
             const values = {
               1: 229.9, 2: 329.9, 3: 189.9, 4: 259.9, 5: 149.9, 6: 199.9,
               7: 289.9, 8: 179.9, 9: 269.9, 10: 219.9, 11: 169.9, 12: 279.9
             };
             selectedKits.forEach(idx => {
                totalValue += values[idx + 1] || 200;
             });
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
           </div>
         `);
     }

     function createAudioMsg() {
         const durationSec = 19; // from RC_CONFIG.approvalChat.audioDurationSeconds
         const audioSrc = 'img/audio/act.mp3';
         
         const msg = createMsg(`
           <div class="approval-chat-bubble approval-chat-audio" id="rcAudioPlayer">
               <span class="approval-chat-audio-ic approval-chat-audio-ic--play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span>
               <span class="approval-chat-audio-ic approval-chat-audio-ic--pause"><svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg></span>
               <div class="approval-chat-audio-bar">
                  <div class="approval-chat-audio-fill" id="rcAudioFill" style="width: 0%;"></div>
               </div>
               <span class="approval-chat-audio-time" id="rcAudioCurrent">0:00</span>
               <span class="approval-chat-audio-time" style="left: auto; right: 40px;" id="rcAudioTotal">0:${String(durationSec).padStart(2,'0')}</span>
           </div>
         `);
         
         setTimeout(() => {
             const player = document.getElementById('rcAudioPlayer');
             const fill = document.getElementById('rcAudioFill');
             const currentLabel = document.getElementById('rcAudioCurrent');
             if (!player) return;
             
             const audio = new Audio(audioSrc);
             audio.preload = 'auto';
             
             function fmtTime(s) {
                 s = Math.floor(s);
                 return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
             }
             
             function updateBar() {
                 const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                 fill.style.width = pct + '%';
                 currentLabel.textContent = fmtTime(audio.currentTime);
                 const totalEl = document.getElementById('rcAudioTotal');
                 if (totalEl && audio.duration) totalEl.textContent = fmtTime(audio.duration);
             }
             
             audio.addEventListener('timeupdate', updateBar);
             audio.addEventListener('ended', () => {
                 player.classList.remove('is-playing');
                 fill.style.width = '100%';
             });
             
             player.addEventListener('click', () => {
                 if (audio.paused) {
                     audio.play().then(() => player.classList.add('is-playing')).catch(() => {});
                 } else {
                     audio.pause();
                     player.classList.remove('is-playing');
                 }
             });
         }, 100);
         
         return msg;
     }

     function createCta() {
         const btn = document.createElement('button');
         btn.type = 'button';
         btn.className = 'cta-button approval-chat-cta';
         btn.textContent = 'PREENCHER MEU ENDEREÇO →';
         btn.addEventListener('click', () => {
             goToSection('address');
         });
         messagesContainer.appendChild(btn);
         btn.scrollIntoView({ behavior: 'smooth' });
     }

     const nameInput = document.querySelector('#profileName');
     const userName = nameInput && nameInput.value.trim() !== '' ? nameInput.value : 'Avaliadora';
     const firstName = userName.split(' ')[0];

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
         
         await delay(1000);
         createCta();
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

  kitCards.forEach((card, idx) => {
    if (card.classList.contains('selected')) {
      selectedKits.add(idx);
    }
  });

  function updateKits() {
    kitCards.forEach((card, idx) => {
      if (selectedKits.has(idx)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
    if (kitCounter) kitCounter.textContent = `${selectedKits.size}/${maxKits}`;
    if (btnKitsConfirm) btnKitsConfirm.disabled = selectedKits.size < 2;
  }

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
  
  function updateProfileStep() {
    profileSteps.forEach((step, idx) => {
      step.style.display = idx === currentProfileStep ? 'block' : 'none';
      step.setAttribute('data-step-hidden', idx === currentProfileStep ? 'false' : 'true');
    });
    const stepLabel = document.querySelector('[data-step-panel="profile-nav-step"]');
    if (stepLabel) stepLabel.textContent = `Passo ${currentProfileStep + 1} de 4`;
  }
  
  if (profileSteps.length > 0) {
    updateProfileStep();
    
    // Add click event to all buttons inside profile steps
    profileSteps.forEach((step, idx) => {
      // Inputs event listener for enabling next button
      const inputs = step.querySelectorAll('input');
      const btnNext = step.querySelector('.cta-button');
      
      if (inputs.length > 0 && btnNext) {
        inputs.forEach(inp => inp.addEventListener('input', () => {
          const allFilled = Array.from(inputs).every(i => i.value.trim() !== '');
          if (allFilled) {
            btnNext.classList.remove('btn-disabled');
            btnNext.disabled = false;
          } else {
            btnNext.classList.add('btn-disabled');
            btnNext.disabled = true;
          }
        }));
      }

      // Options click selection
      const options = step.querySelectorAll('.profile-option-card, .profile-grid-item, .profile-category-card, button[data-choice], button[data-step-panel="profile-product-card"], .profile-option');
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          opt.classList.toggle('selected');
          
          if (btnNext) {
            const hasSelected = step.querySelectorAll('.selected').length > 0;
            if (hasSelected) {
              btnNext.classList.remove('btn-disabled');
              btnNext.disabled = false;
            } else {
              btnNext.classList.add('btn-disabled');
              btnNext.disabled = true;
            }
          }
        });
      });

      if (btnNext) {
        btnNext.addEventListener('click', (e) => {
          e.preventDefault();
          if (idx < profileSteps.length - 1) {
            currentProfileStep++;
            updateProfileStep();
          } else {
            // Last step -> profile-check
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
        
        video.play().then(() => {
            video.addEventListener('ended', finishCheck);
            // Backup fallback just in case video hangs
            setTimeout(finishCheck, 12000); 
        }).catch(e => {
            console.log('Video autoplay blocked:', e);
            if (fill) {
                fill.style.transition = 'width 5s linear';
                fill.style.width = '100%';
            }
            setTimeout(finishCheck, 5000);
        });
      } else {
        setTimeout(finishCheck, 3500);
      }
    } else {
        setTimeout(finishCheck, 3500);
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
  if (btnShippingConf) {
    btnShippingConf.addEventListener('click', () => {
      goToSection('checkout');
    });
  }
  
  // Also handle shipping options
  const shipOptions = document.querySelectorAll('.rc-ship-option');
  shipOptions.forEach(opt => {
      opt.addEventListener('click', () => {
          shipOptions.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
      });
  });

  // --- Step 9: Checkout ---
  const btnCheckout = document.querySelector('.rc-finalize-cta');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
       alert("Gateway de pagamento será integrado em breve.");
    });
  }
});
