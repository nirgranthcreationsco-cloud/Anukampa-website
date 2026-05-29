const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const modal = document.querySelector("#donateModal");
const openDonateButtons = document.querySelectorAll("[data-open-donate]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const copyButtons = document.querySelectorAll(".copy-btn");
const interestForm = document.querySelector("#interestForm");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroCard = document.querySelector(".hero-card");
const progressBar = document.querySelector(".scroll-progress");

navToggle?.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => document.body.classList.remove("nav-open"));
});

function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar?.style.setProperty("--scroll", progress.toString());
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

updateScrollProgress();
window.addEventListener("scroll", updateScrollProgress, { passive: true });

if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty("--mx", `${x}%`);
    hero.style.setProperty("--my", `${y}%`);
  });
}

if (heroCard && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  heroCard.addEventListener("pointermove", (event) => {
    const bounds = heroCard.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateY = ((x / bounds.width) - 0.5) * 8;
    const rotateX = ((0.5 - y / bounds.height)) * 8;
    heroCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  heroCard.addEventListener("pointerleave", () => {
    heroCard.style.transform = "";
  });
}

const revealTargets = [
  ".intro .two-col > *",
  ".section-head",
  ".feature-card",
  ".resolve-grid > *",
  ".journey-line article",
  ".tier",
  ".rules-card",
  ".donate-copy",
  ".checkout-card",
  ".join-grid > *",
  ".brochure-grid a",
].flatMap((selector) => [...document.querySelectorAll(selector)]);

revealTargets.forEach((element, index) => {
  element.classList.add("reveal");
  element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 90}ms`);

  if (element.matches(".intro .two-col > *:first-child, .donate-copy")) {
    element.dataset.animate = "left";
  }

  if (element.matches(".intro .two-col > *:last-child, .checkout-card")) {
    element.dataset.animate = "right";
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
);

revealTargets.forEach((element) => revealObserver.observe(element));

function openModal() {
  modal?.classList.add("is-open");
  modal?.setAttribute("aria-hidden", "false");
  
  // Reset payment gateway modal state on open
  document.getElementById("gatewayStepSelect").style.display = "block";
  document.getElementById("gatewayStepProcessing").style.display = "none";
  document.getElementById("gatewayStepSuccess").style.display = "none";
}

function closeModal() {
  modal?.classList.remove("is-open");
  modal?.setAttribute("aria-hidden", "true");
}

openDonateButtons.forEach((button) => button.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Interactive checkout card controls
const freqButtons = document.querySelectorAll(".payment-tabs .tab-btn");
const amountButtons = document.querySelectorAll(".quick-amounts .amount-btn");
const customAmountInput = document.getElementById("customAmount");
const startCheckoutBtn = document.getElementById("startCheckoutBtn");
const gatewayAmountDisplay = document.getElementById("gatewayAmountDisplay");

freqButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    freqButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

amountButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    amountButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (customAmountInput) {
      customAmountInput.value = btn.dataset.value;
    }
  });
});

if (customAmountInput) {
  customAmountInput.addEventListener("input", () => {
    // remove active state from pre-selected buttons if the amount is custom
    amountButtons.forEach(b => {
      if (b.dataset.value === customAmountInput.value) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  });
}

// Payment method switcher in gateway modal
const methodOptions = document.querySelectorAll(".method-option");
const methodDetails = document.querySelectorAll(".method-details");

methodOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    methodOptions.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    
    const targetMethod = opt.dataset.method;
    methodDetails.forEach(det => {
      det.classList.remove("active");
    });
    
    if (targetMethod === "upi") document.getElementById("detailsUpi").classList.add("active");
    if (targetMethod === "card") document.getElementById("detailsCard").classList.add("active");
    if (targetMethod === "netbanking") document.getElementById("detailsNetbanking").classList.add("active");
  });
});

// Trigger checkout simulation
startCheckoutBtn?.addEventListener("click", () => {
  const amount = customAmountInput ? customAmountInput.value : "1,000";
  if (gatewayAmountDisplay) {
    gatewayAmountDisplay.textContent = `₹${Number(amount).toLocaleString("en-IN")}`;
  }
  openModal();
});

// Simulated transaction flows
const payButtons = document.querySelectorAll(".gateway-pay-btn");
payButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const amount = customAmountInput ? customAmountInput.value : "1,000";
    
    document.getElementById("gatewayStepSelect").style.display = "none";
    document.getElementById("gatewayStepProcessing").style.display = "block";
    
    // Simulate API request processing
    setTimeout(() => {
      document.getElementById("gatewayStepProcessing").style.display = "none";
      document.getElementById("gatewayStepSuccess").style.display = "block";
      
      const receiptAmount = document.getElementById("receiptAmount");
      const receiptTxnId = document.getElementById("receiptTxnId");
      
      if (receiptAmount) {
        receiptAmount.textContent = `₹${Number(amount).toLocaleString("en-IN")}`;
      }
      if (receiptTxnId) {
        receiptTxnId.textContent = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
    }, 1800);
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1400);
    } catch {
      button.textContent = "Select";
    }
  });
});

interestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(interestForm);
  const name = formData.get("name");
  const phone = formData.get("phone");
  const tier = formData.get("tier");
  const message = `जय जिनेन्द्र, मैं अनुकम्पा से जुड़ना चाहता/चाहती हूँ.%0Aनाम: ${name}%0Aमोबाइल: ${phone}%0Aरुचि: ${tier}`;
  window.open(`https://wa.me/918817132580?text=${message}`, "_blank", "noopener,noreferrer");
});
