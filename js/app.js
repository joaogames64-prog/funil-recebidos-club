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
      const options = step.querySelectorAll('.profile-option-card, .profile-grid-item, .profile-category-card');
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

  // --- Step 5: Profile Check ---
  function simulateProfileCheck() {
    setTimeout(() => {
      const btnVerify = document.querySelector('.profile-check-cta');
      if (btnVerify) {
        btnVerify.addEventListener('click', () => {
          goToSection('approval');
          setTimeout(() => {
            goToSection('address');
          }, 3000);
        });
      }
    }, 1000);
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
