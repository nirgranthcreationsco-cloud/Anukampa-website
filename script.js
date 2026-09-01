const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const copyButtons = document.querySelectorAll(".copy-btn");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const heroCard = document.querySelector(".hero-card");
const progressBar = document.querySelector(".scroll-progress");

navToggle?.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

// Close button inside overlay
const navCloseBtn = document.querySelector(".nav-close-btn");
navCloseBtn?.addEventListener("click", () => {
  document.body.classList.remove("nav-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => document.body.classList.remove("nav-open"));
});

// Mobile App Bottom Navigation Active State
const appNavItems = document.querySelectorAll(".app-nav-item");
appNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    appNavItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  });
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

// Configuration: Paste your Google Apps Script Web App URL here to save submissions to Google Sheets.
// If left empty, it will default to sending the details directly via WhatsApp.
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyImUwhD_1ody2WyKYZ4U_nipFlK9Pe-N3zAUIjQ67m-7WaEDkn_HoUlMZDhLVDSRjA8g/exec";

// Reliable Google Sheets Webhook Submission via Hidden Target iFrame
// Fixes browser fetch no-cors 302 redirect POST payload loss bugs across Chrome, Safari & mobile browsers
function submitToGoogleSheets(url, data) {
  return new Promise((resolve) => {
    let iframe = document.querySelector("#hidden_gscript_iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "hidden_gscript_iframe";
      iframe.name = "hidden_gscript_iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = "hidden_gscript_iframe";
    form.style.display = "none";

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      form.remove();
      resolve();
    }, 1200);
  });
}

const volunteerForm = document.querySelector("#volunteerForm");

volunteerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(volunteerForm);
  const name = formData.get("name");
  const phone = formData.get("phone");
  const city = formData.get("city");
  const role = formData.get("role");

  const whatsappMessage = `जय जिनेन्द्र, मैं अनुकम्पा प्रतिनिधि बनकर अभियान में सहयोग देना चाहता/चाहती हूँ।%0Aनाम: ${name}%0Aमोबाइल: ${phone}%0Aशहर: ${city}%0Aयोगदान: ${role}`;

  // If webhook URL is set, attempt to save to Google Sheets first
  if (GOOGLE_SHEET_WEBHOOK_URL) {
    const submitBtn = volunteerForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "दर्ज किया जा रहा है...";
    submitBtn.disabled = true;

    try {
      await submitToGoogleSheets(GOOGLE_SHEET_WEBHOOK_URL, {
        formType: "Volunteer Registration",
        name: name || "",
        phone: phone || "",
        city: city || "",
        role: role || "",
        date: new Date().toLocaleString("en-IN"),
      });

      alert("सफलतापूर्वक दर्ज कर लिया गया है! हमारे प्रतिनिधि जल्द ही आपसे संपर्क करेंगे।");
      volunteerForm.reset();
    } catch (error) {
      console.error("Submission failed, falling back to WhatsApp", error);
      // Fallback to WhatsApp on error
      window.open(`https://wa.me/919617273704?text=${whatsappMessage}`, "_blank", "noopener,noreferrer");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } else {
    // If webhook is not configured yet, default to direct WhatsApp redirect
    window.open(`https://wa.me/919617273704?text=${whatsappMessage}`, "_blank", "noopener,noreferrer");
  }
});

// Deep-linking / Routing for QR codes
function handleHashRoute() {
  const hash = window.location.hash;
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        // Ensure reveal animations trigger immediately for scanned deep-links
        targetElement.classList.add("is-visible");
        targetElement.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
      }, 150);
    }
  }
}

window.addEventListener("load", handleHashRoute);
window.addEventListener("hashchange", handleHashRoute);

// Phone input validation (Volunteer form)
const volunteerPhoneInput = document.querySelector("#volunteerForm input[name='phone']");
if (volunteerPhoneInput) {
  volunteerPhoneInput.addEventListener("keypress", (e) => {
    // Block non-numeric characters
    if (e.key < "0" || e.key > "9") {
      e.preventDefault();
    }
  });

  volunteerPhoneInput.addEventListener("input", () => {
    // Keep only numbers and restrict to 10 digits
    volunteerPhoneInput.value = volunteerPhoneInput.value.replace(/\D/g, "").slice(0, 10);
  });

  volunteerPhoneInput.addEventListener("paste", (e) => {
    const data = e.clipboardData.getData("text");
    if (!/^\d+$/.test(data)) {
      e.preventDefault();
    }
  });
}

// ═════════════════════════════════════════════════════════════════════
// Official Membership Application Form Handler
// ═════════════════════════════════════════════════════════════════════
const membershipForm = document.querySelector("#membershipForm");
const membershipPaymentStep = document.querySelector("#membershipPaymentStep");
const displaySelectedTier = document.querySelector("#displaySelectedTier");
const membershipWhatsappBtn = document.querySelector("#membershipWhatsappBtn");
const resetMembershipFormBtn = document.querySelector("#resetMembershipFormBtn");

if (membershipForm) {
  // Input validations for membership phone and pincode
  const memPhone = membershipForm.querySelector("input[name='phone']");
  const memPincode = membershipForm.querySelector("input[name='pincode']");
  const memAadhaar = membershipForm.querySelector("input[name='aadhaar']");

  [memPhone, memPincode, memAadhaar].forEach((input) => {
    input?.addEventListener("keypress", (e) => {
      if (e.key < "0" || e.key > "9") e.preventDefault();
    });
  });

  membershipForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = membershipForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;

    const formData = new FormData(membershipForm);
    const payload = {
      formType: "Official Membership Application",
      tier: formData.get("tier"),
      name: formData.get("name"),
      father_husband_name: formData.get("father_husband_name"),
      blood_group: formData.get("blood_group"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      pan: formData.get("pan"),
      aadhaar: formData.get("aadhaar"),
      occupation: formData.get("occupation"),
      dob: formData.get("dob"),
      date: new Date().toLocaleString("en-IN"),
    };

    submitBtn.textContent = "विवरण दर्ज किया जा रहा है...";
    submitBtn.disabled = true;

    // Send payload to Google Sheets Webhook if configured
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        await submitToGoogleSheets(GOOGLE_SHEET_WEBHOOK_URL, payload);
      } catch (err) {
        console.error("Sheet submission failed:", err);
      }
    }

    // Step 2 Transition — Show Payment & Bank Details Confirmation
    if (displaySelectedTier) {
      displaySelectedTier.textContent = payload.tier;
    }

    const whatsappMessage = `जय जिनेन्द्र, मैंने अनुकम्पा सदस्यता आवेदन पत्र भर दिया है।%0Aनाम: ${payload.name}%0Aश्रेणी: ${payload.tier}%0Aमोबाइल: ${payload.phone}%0Aशहर: ${payload.city}%0Aकृपया भुगतान सत्यापित करें।`;

    if (membershipWhatsappBtn) {
      membershipWhatsappBtn.href = `https://wa.me/917415648038?text=${whatsappMessage}`;
    }

    membershipForm.style.display = "none";
    if (membershipPaymentStep) {
      membershipPaymentStep.style.display = "block";
      membershipPaymentStep.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

resetMembershipFormBtn?.addEventListener("click", () => {
  membershipForm.reset();
  membershipPaymentStep.style.display = "none";
  membershipForm.style.display = "block";
  membershipForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Auto-fill Demo Data for Instant Testing
const autoFillDemoBtn = document.querySelector("#autoFillDemoBtn");
autoFillDemoBtn?.addEventListener("click", () => {
  if (!membershipForm) return;
  membershipForm.querySelector("#membershipTierSelect").value = "1. अनुकंपा गौरव — ₹ 1 करोड़ /-";
  membershipForm.querySelector("input[name='name']").value = "अनिल कुमार जैन (Demo Test)";
  membershipForm.querySelector("input[name='father_husband_name']").value = "सुरेश चंद्र जैन";
  membershipForm.querySelector("select[name='blood_group']").value = "O+";
  membershipForm.querySelector("input[name='address']").value = "123, एम.जी. रोड, साकेत नगर";
  membershipForm.querySelector("input[name='city']").value = "इन्दौर";
  membershipForm.querySelector("input[name='state']").value = "मध्य प्रदेश";
  membershipForm.querySelector("input[name='pincode']").value = "452001";
  membershipForm.querySelector("input[name='phone']").value = "9876543210";
  membershipForm.querySelector("input[name='email']").value = "anil.jain@example.com";
  membershipForm.querySelector("input[name='pan']").value = "ABCDE1234F";
  membershipForm.querySelector("input[name='aadhaar']").value = "123456789012";
  membershipForm.querySelector("input[name='occupation']").value = "व्यवसायी";
  membershipForm.querySelector("input[name='dob']").value = "1985-05-15";
  membershipForm.querySelector("#membershipTerms").checked = true;
});


