document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".custom-navbar");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const revealElements = document.querySelectorAll(".reveal");
  const carouselElement = document.querySelector("#featuredEventsCarousel");

  /* =========================
     1) تهيئة وضع الثيم من localStorage
     ========================= */

  const savedTheme = localStorage.getItem("theme"); // "dark" أو "light" أو null

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else if (savedTheme === "light") {
    body.classList.remove("dark-mode");
  }

  // تحديث أيقونة زر الثيم حسب الوضع الحالي
  function updateThemeToggleIcon() {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector("i");
    if (!icon) return;

    if (body.classList.contains("dark-mode")) {
      icon.className = "bi bi-sun-fill";
    } else {
      icon.className = "bi bi-moon-stars-fill";
    }
  }

  updateThemeToggleIcon();

  /* =========================
     2) التعامل مع التمرير (navbar + زر لأعلى)
     ========================= */

  function handleScroll() {
    if (window.scrollY > 40) {
      if (navbar) navbar.classList.add("scrolled");
      if (scrollTopBtn) scrollTopBtn.classList.add("show");
    } else {
      if (navbar) navbar.classList.remove("scrolled");
      if (scrollTopBtn) scrollTopBtn.classList.remove("show");
    }
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll);

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================
     3) تبديل الوضع الليلي + حفظه
     ========================= */

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      body.classList.toggle("dark-mode");

      const isDark = body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");

      // تحديث الأيقونة
      updateThemeToggleIcon();

      // Bonus: أنيميشن خفيفة عند تغيير الثيم
      body.classList.add("theme-transition");
      setTimeout(() => body.classList.remove("theme-transition"), 300);
    });
  }

  /* =========================
     4) reveal animation باستخدام IntersectionObserver
     ========================= */

  if (revealElements.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  /* =========================
     5) Bootstrap Carousel للقسم البارز
     ========================= */

  if (carouselElement && window.bootstrap) {
    new bootstrap.Carousel(carouselElement, {
      interval: 4000,
      pause: "hover",
      ride: "carousel",
      touch: true,
    });
  }

  /* =========================
     6) فلترة الفعاليات في events.html
     ========================= */

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const locationFilter = document.getElementById("locationFilter");
  const dateFilter = document.getElementById("dateFilter");
  const resetFilters = document.getElementById("resetFilters");
  const eventItems = document.querySelectorAll(".event-item");
  const resultsCount = document.getElementById("resultsCount");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const quickFilterButtons = document.querySelectorAll(".quick-filter-btn");

  function normalizeText(text) {
    return String(text).trim().toLowerCase();
  }

  function updateQuickButtons(activeCategory) {
    quickFilterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === activeCategory);
    });
  }

  function filterEvents() {
    if (!eventItems.length) return;

    const searchValue = searchInput ? normalizeText(searchInput.value) : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "";
    const locationValue = locationFilter ? locationFilter.value : "";
    const dateValue = dateFilter ? dateFilter.value : "";

    let visibleCount = 0;

    eventItems.forEach((item) => {
      const title = normalizeText(item.dataset.title || "");
      const category = item.dataset.category || "";
      const location = item.dataset.location || "";
      const date = item.dataset.date || "";

      const matchesSearch = !searchValue || title.includes(searchValue);
      const matchesCategory = !categoryValue || category === categoryValue;
      const matchesLocation = !locationValue || location === locationValue;
      const matchesDate = !dateValue || date === dateValue;

      if (matchesSearch && matchesCategory && matchesLocation && matchesDate) {
        item.classList.remove("hidden");
        visibleCount++;
      } else {
        item.classList.add("hidden");
      }
    });

    if (resultsCount) resultsCount.textContent = visibleCount;
    if (noResultsMessage)
      noResultsMessage.classList.toggle("d-none", visibleCount !== 0);
    updateQuickButtons(categoryValue);
  }

  if (searchInput) searchInput.addEventListener("input", filterEvents);
  if (categoryFilter) categoryFilter.addEventListener("change", filterEvents);
  if (locationFilter) locationFilter.addEventListener("change", filterEvents);
  if (dateFilter) dateFilter.addEventListener("change", filterEvents);

  quickFilterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (categoryFilter) categoryFilter.value = btn.dataset.category;
      filterEvents();

      // Bonus: scroll بسيط لأعلى قائمة الفعاليات عند اختيار فلتر سريع
      const eventsSection = document.getElementById("eventsListSection");
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (resetFilters) {
    resetFilters.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (locationFilter) locationFilter.value = "";
      if (dateFilter) dateFilter.value = "";
      filterEvents();
    });
  }

  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get("category");
  if (categoryFromUrl && categoryFilter) categoryFilter.value = categoryFromUrl;
  filterEvents();

  /* =========================
     7) event.html – تفاصيل الفعالية
     ========================= */

  const addToCalendarBtn = document.getElementById("addToCalendarBtn");
  const shareEventBtn = document.getElementById("shareEventBtn");
  const bookingForm = document.getElementById("bookingForm");
  const bookingAlert = document.getElementById("bookingAlert");
  const eventActionMessage = document.getElementById("eventActionMessage");

  function showAlertMessage(element, text, type = "success") {
    if (!element) return;
    element.textContent = text;
    element.className = `alert alert-${type} rounded-4 mt-3`;
  }

  function getEventsCollection() {
    if (Array.isArray(window.eventsData)) return window.eventsData;
    if (typeof eventsData !== "undefined" && Array.isArray(eventsData))
      return eventsData;
    return [];
  }

  const eventDetailsWrapper = document.getElementById("eventDetailsWrapper");
  const noEventSelectedMessage = document.getElementById("noEventSelectedMessage");
  const eventTitle = document.getElementById("eventTitle");
  const eventCategoryBadge = document.getElementById("eventCategoryBadge");
  const eventShortDescription = document.getElementById("eventShortDescription");
  const eventDate = document.getElementById("eventDate");
  const eventTime = document.getElementById("eventTime");
  const eventLocation = document.getElementById("eventLocation");
  const eventOrganizer = document.getElementById("eventOrganizer");
  const eventHeroImage = document.getElementById("eventHeroImage");
  const eventDescription1 = document.getElementById("eventDescription1");
  const eventDescription2 = document.getElementById("eventDescription2");
  const eventDescription3 = document.getElementById("eventDescription3");
  const eventMapImage = document.getElementById("eventMapImage");
  const eventMapText = document.getElementById("eventMapText");
  const galleryImage1 = document.getElementById("galleryImage1");
  const galleryImage2 = document.getElementById("galleryImage2");
  const galleryImage3 = document.getElementById("galleryImage3");
  const relatedEventsContainer = document.getElementById("relatedEventsContainer");
  const bookingModalLabel = document.getElementById("bookingModalLabel");

  function getEventById(eventId) {
    const collection = getEventsCollection();
    return collection.find((event) => event.id === eventId) || null;
  }

  function renderRelatedEvents(relatedIds, currentEventId) {
    const collection = getEventsCollection();
    if (!relatedEventsContainer || !collection.length) return;

    const relatedEvents = (relatedIds || [])
      .map((id) => collection.find((event) => event.id === id))
      .filter((event) => event && event.id !== currentEventId)
      .slice(0, 3);

    if (!relatedEvents.length) {
      relatedEventsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light border rounded-4 mb-0">
            لا توجد فعاليات ذات صلة متاحة حاليًا.
          </div>
        </div>
      `;
      return;
    }

    relatedEventsContainer.innerHTML = relatedEvents
      .map(
        (event) => `
        <div class="col-md-6 col-lg-4">
          <div class="card event-card h-100 border-0 shadow-sm rounded-4 reveal">
            <img src="${event.heroImage}" class="card-img-top" alt="${event.title}">
            <div class="card-body">
              <span class="badge ${event.badgeClass} mb-2">${event.category}</span>
              <h3 class="h5 fw-bold">${event.title}</h3>
              <p class="text-muted small mb-2"><i class="bi bi-calendar-event"></i> ${event.displayDate}</p>
              <p class="text-muted small mb-2"><i class="bi bi-geo-alt"></i> ${event.location}</p>
              <p class="card-text">${event.shortDescription}</p>
              <a href="event.html?id=${event.id}" class="btn btn-outline-primary btn-sm">التفاصيل</a>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  function renderEventDetails() {
    if (!eventDetailsWrapper) return;

    const eventId = params.get("id");
    const collection = getEventsCollection();
    const selectedEvent = getEventById(eventId);

    if (!eventId || !selectedEvent) {
      eventDetailsWrapper.classList.add("d-none");
      if (noEventSelectedMessage) noEventSelectedMessage.classList.remove("d-none");
      return;
    }

    if (noEventSelectedMessage) noEventSelectedMessage.classList.add("d-none");
    eventDetailsWrapper.classList.remove("d-none");

    if (eventCategoryBadge) {
      eventCategoryBadge.className = `badge ${selectedEvent.badgeClass} mb-3`;
      eventCategoryBadge.textContent = selectedEvent.category;
    }

    if (eventTitle) eventTitle.textContent = selectedEvent.title;
    if (eventShortDescription)
      eventShortDescription.textContent = selectedEvent.shortDescription;
    if (eventDate) eventDate.textContent = selectedEvent.displayDate;
    if (eventTime) eventTime.textContent = selectedEvent.time;
    if (eventLocation) eventLocation.textContent = selectedEvent.location;
    if (eventOrganizer) eventOrganizer.textContent = selectedEvent.organizer;

    if (eventHeroImage) {
      eventHeroImage.src = selectedEvent.heroImage;
      eventHeroImage.alt = selectedEvent.title;
    }

    const descriptions = Array.isArray(selectedEvent.description)
      ? selectedEvent.description
      : [];
    if (eventDescription1) eventDescription1.textContent = descriptions[0] || "";
    if (eventDescription2) eventDescription2.textContent = descriptions[1] || "";
    if (eventDescription3) eventDescription3.textContent = descriptions[2] || "";

    if (eventMapImage) {
      eventMapImage.src = selectedEvent.mapImage || "assets/img/map.jpg";
      eventMapImage.alt = `خريطة مكان فعالية ${selectedEvent.title}`;
    }

    if (eventMapText) eventMapText.textContent = selectedEvent.mapText || "";

    const gallery = Array.isArray(selectedEvent.gallery)
      ? selectedEvent.gallery
      : [];
    if (galleryImage1) {
      galleryImage1.src = gallery[0] || selectedEvent.heroImage;
      galleryImage1.alt = `${selectedEvent.title} - صورة 1`;
    }
    if (galleryImage2) {
      galleryImage2.src = gallery[1] || selectedEvent.heroImage;
      galleryImage2.alt = `${selectedEvent.title} - صورة 2`;
    }
    if (galleryImage3) {
      galleryImage3.src = gallery[2] || selectedEvent.heroImage;
      galleryImage3.alt = `${selectedEvent.title} - صورة 3`;
    }

    if (bookingModalLabel) {
      bookingModalLabel.textContent = `حجز مكان في فعالية: ${selectedEvent.title}`;
    }

    document.title = `${selectedEvent.title} | دليل فعاليات الجامعة الافتراضية`;

    renderRelatedEvents(selectedEvent.related, selectedEvent.id);
  }

  renderEventDetails();

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener("click", function () {
      const currentTitle = eventTitle ? eventTitle.textContent : "الفعالية";
      showAlertMessage(
        eventActionMessage,
        `تمت إضافة فعالية "${currentTitle}" إلى قائمتك بشكل تجريبي.`,
        "success"
      );
    });
  }

  if (shareEventBtn) {
    shareEventBtn.addEventListener("click", function () {
      const shareTitle = eventTitle ? eventTitle.textContent : document.title;

      if (navigator.share) {
        navigator
          .share({
            title: shareTitle,
            text: "شاهد تفاصيل هذه الفعالية في دليل فعاليات الجامعة الافتراضية",
            url: window.location.href,
          })
          .catch(() => {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            showAlertMessage(
              eventActionMessage,
              "تم نسخ رابط الفعالية إلى الحافظة.",
              "success"
            );
          })
          .catch(() => {
            showAlertMessage(
              eventActionMessage,
              "تعذر نسخ الرابط على هذا المتصفح.",
              "danger"
            );
          });
      } else {
        showAlertMessage(
          eventActionMessage,
          "المشاركة غير مدعومة على هذا المتصفح.",
          "warning"
        );
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const fullName = document.getElementById("fullName");
      const studentEmail = document.getElementById("studentEmail");

      const fullNameValue = fullName ? fullName.value.trim() : "";
      const studentEmailValue = studentEmail ? studentEmail.value.trim() : "";

      if (!fullNameValue || !studentEmailValue) {
        if (bookingAlert) {
          bookingAlert.className = "alert alert-danger rounded-4";
          bookingAlert.textContent = "يرجى تعبئة الاسم والبريد الإلكتروني.";
        }
        return;
      }

      if (bookingAlert) {
        bookingAlert.className = "alert alert-success rounded-4";
        bookingAlert.textContent = "تم إرسال طلب الحجز بنجاح.";
      }

      bookingForm.reset();
    });
  }

  /* =========================
     8) contact.html – نموذج التواصل
     ========================= */

  const contactForm = document.getElementById("contactForm");
  const formAlert = document.getElementById("formAlert");

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const message = document.getElementById("message");

      const nameValue = name ? name.value.trim() : "";
      const emailValue = email ? email.value.trim() : "";
      const messageValue = message ? message.value.trim() : "";

      if (!nameValue || !emailValue || !messageValue) {
        if (formAlert) {
          formAlert.textContent = "يرجى تعبئة جميع الحقول المطلوبة.";
          formAlert.className = "alert alert-danger rounded-4";
        }
        return;
      }

      if (!isValidEmail(emailValue)) {
        if (formAlert) {
          formAlert.textContent = "يرجى إدخال بريد إلكتروني صحيح.";
          formAlert.className = "alert alert-danger rounded-4";
        }
        return;
      }

      if (formAlert) {
        formAlert.textContent =
          "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا.";
        formAlert.className = "alert alert-success rounded-4";
      }

      contactForm.reset();
    });
  }

  /* =========================
     9) Bonus صغير: رسالة ترحيب في الـconsole
     ========================= */

  if (window.console) {
    console.log(
      "%cدليل فعاليات الجامعة الافتراضية – JavaScript جاهز ✅",
      "color:#0d6efd;font-weight:bold;"
    );
  }
});