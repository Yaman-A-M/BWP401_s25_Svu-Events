document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     1) Shared elements
     ========================= */

  const navbar = document.querySelector(".custom-navbar");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const themeToggle = document.getElementById("themeToggle");
  const body = document.body;
  const revealElements = document.querySelectorAll(".reveal");

  /* =========================
     2) Theme setup from localStorage
     ========================= */

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch (error) {
    savedTheme = null;
  }

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  } else if (savedTheme === "light") {
    body.classList.remove("dark-mode");
  }

  function updateThemeToggleIcon() {
    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");
    if (!icon) return;

    if (body.classList.contains("dark-mode")) {
      icon.className = "bi bi-sun-fill";
      themeToggle.setAttribute("aria-label", "تبديل إلى الوضع النهاري");
    } else {
      icon.className = "bi bi-moon-stars-fill";
      themeToggle.setAttribute("aria-label", "تبديل إلى الوضع الليلي");
    }
  }

  updateThemeToggleIcon();

  /* =========================
     3) Scroll behavior
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
     4) Dark mode toggle
     ========================= */

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      body.classList.toggle("dark-mode");

      const isDark = body.classList.contains("dark-mode");

      try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (error) {
        /* Ignore storage errors */
      }

      updateThemeToggleIcon();

      body.classList.add("theme-transition");
      setTimeout(() => body.classList.remove("theme-transition"), 300);
    });
  }

  /* =========================
     5) Reveal animation
     ========================= */

  let revealObserver = null;

  function buildRevealObserver() {
    if (!("IntersectionObserver" in window)) return null;

    return new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.15 }
    );
  }

  revealObserver = buildRevealObserver();

  if (revealObserver && revealElements.length) {
    revealElements.forEach((element) => revealObserver.observe(element));
  } else if (revealElements.length) {
    revealElements.forEach((element) => element.classList.add("active"));
  }

  function activateRevealInside(container) {
    if (!container) return;

    const newRevealElements = container.querySelectorAll(".reveal");
    if (!newRevealElements.length) return;

    if (revealObserver) {
      newRevealElements.forEach((element) => revealObserver.observe(element));
    } else {
      newRevealElements.forEach((element) => element.classList.add("active"));
    }
  }

  /* =========================
     6) Shared event helpers
     ========================= */

  function normalizeText(text) {
    return String(text || "").trim().toLowerCase();
  }

  function getEventsCollection() {
    if (Array.isArray(window.eventsData)) return window.eventsData;
    if (typeof eventsData !== "undefined" && Array.isArray(eventsData)) {
      return eventsData;
    }
    return [];
  }

  function getEventById(eventId) {
    const collection = getEventsCollection();
    return collection.find((event) => String(event.id) === String(eventId)) || null;
  }

  function createEventCardHTML(event, options = {}) {
    const {
      titleTag = "h2",
      colClass = "col-md-6 col-lg-4",
      extraClass = "",
    } = options;

    return `
      <div
        class="${`${colClass} event-item reveal ${extraClass}`.trim()}"
        data-event-id="${event.id}"
        data-title="${event.title}"
        data-category="${event.category}"
        data-location="${event.location}"
        data-date="${event.date}"
      >
        <div class="card event-card h-100 border-0 shadow-sm rounded-4">
          <img src="${event.heroImage}" class="card-img-top" alt="${event.title}">
          <div class="card-body">
            <span class="badge ${event.badgeClass} mb-2">${event.category}</span>
            <${titleTag} class="h5 fw-bold">
              <a href="event.html?id=${event.id}" class="text-decoration-none text-reset">
                ${event.title}
              </a>
            </${titleTag}>
            <p class="text-muted small mb-2"><i class="bi bi-calendar-event"></i> ${event.displayDate}</p>
            <p class="text-muted small mb-2"><i class="bi bi-geo-alt"></i> ${event.location}</p>
            <p class="card-text">${event.shortDescription}</p>
            <a href="event.html?id=${event.id}" class="btn btn-outline-primary">التفاصيل</a>
          </div>
        </div>
      </div>
    `;
  }

  function showAlertMessage(element, text, type = "success") {
    if (!element) return;
    element.textContent = text;
    element.className = `alert alert-${type} rounded-4 mt-3`;
    element.classList.remove("d-none");
  }

  function hideAlertMessage(element) {
    if (!element) return;
    element.classList.add("d-none");
    element.textContent = "";
  }

  /* =========================
     7) index.html
     ========================= */

  const featuredEventsCarousel = document.getElementById("featuredEventsCarousel");
  const featuredCarouselIndicators = document.getElementById("featuredCarouselIndicators");
  const featuredCarouselInner = document.getElementById("featuredCarouselInner");
  const latestEventsContainer = document.getElementById("latestEventsContainer");

  function renderFeaturedCarousel(events) {
    if (!featuredEventsCarousel || !featuredCarouselIndicators || !featuredCarouselInner) return;

    const featuredEvents = events.slice(0, 3);

    if (!featuredEvents.length) {
      featuredEventsCarousel.classList.add("d-none");
      return;
    }

    featuredCarouselIndicators.innerHTML = featuredEvents
      .map(
        (event, index) => `
          <button
            type="button"
            data-bs-target="#featuredEventsCarousel"
            data-bs-slide-to="${index}"
            class="${index === 0 ? "active" : ""}"
            ${index === 0 ? 'aria-current="true"' : ""}
            aria-label="الفعالية ${index + 1}"
          ></button>
        `
      )
      .join("");

    featuredCarouselInner.innerHTML = featuredEvents
      .map(
        (event, index) => `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <a href="event.html?id=${event.id}" class="d-block text-decoration-none text-reset h-100">
              <img src="${event.heroImage}" class="d-block w-100 carousel-image" alt="${event.title}">
              <div class="carousel-caption text-end custom-caption">
                <span class="badge ${event.badgeClass} mb-2">${event.category}</span>
                <h3 class="fw-bold">${event.title}</h3>
                <p>${event.shortDescription}</p>
              </div>
            </a>
          </div>
        `
      )
      .join("");

    activateRevealInside(featuredEventsCarousel);

    if (window.bootstrap) {
      new bootstrap.Carousel(featuredEventsCarousel, {
        interval: 4000,
        pause: "hover",
        ride: "carousel",
        touch: true,
      });
    }
  }

  function renderLatestEvents(events) {
    if (!latestEventsContainer) return;

    const latestEvents = events.slice(0, 3);

    if (!latestEvents.length) {
      latestEventsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning rounded-4 mb-0">
            لا توجد فعاليات مضافة حاليًا.
          </div>
        </div>
      `;
      return;
    }

    latestEventsContainer.innerHTML = latestEvents
      .map((event) =>
        createEventCardHTML(event, {
          titleTag: "h3",
          colClass: "col-md-6 col-lg-4",
        })
      )
      .join("");

    activateRevealInside(latestEventsContainer);
  }

  function renderHomePage() {
    const collection = getEventsCollection();
    if (!collection.length) return;

    renderFeaturedCarousel(collection);
    renderLatestEvents(collection);
  }

  renderHomePage();

  /* =========================
     8) events.html
     ========================= */

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const locationFilter = document.getElementById("locationFilter");
  const dateFilter = document.getElementById("dateFilter");
  const resetFilters = document.getElementById("resetFilters");
  const resultsCount = document.getElementById("resultsCount");
  const noResultsMessage = document.getElementById("noResultsMessage");
  const quickFilterButtons = document.querySelectorAll(".quick-filter-btn");
  const eventsContainer = document.getElementById("eventsContainer");

  function renderEventsList() {
    if (!eventsContainer) return;

    const collection = getEventsCollection();

    if (!collection.length) {
      eventsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning rounded-4 mb-0">
            لا توجد بيانات فعاليات متاحة حاليًا.
          </div>
        </div>
      `;
      if (resultsCount) resultsCount.textContent = "0";
      return;
    }

    eventsContainer.innerHTML = collection
      .map((event) =>
        createEventCardHTML(event, {
          titleTag: "h2",
          colClass: "col-md-6 col-lg-4",
        })
      )
      .join("");

    activateRevealInside(eventsContainer);
  }

  function updateQuickButtons(activeCategory) {
    quickFilterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === activeCategory);
    });
  }

  function filterEvents() {
    const eventItems = document.querySelectorAll("#eventsContainer .event-item");

    if (!eventItems.length) {
      if (resultsCount) resultsCount.textContent = "0";
      return;
    }

    const searchValue = searchInput ? normalizeText(searchInput.value) : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "";
    const locationValue = locationFilter ? locationFilter.value : "";
    const dateValue = dateFilter ? dateFilter.value : "";

    let visibleCount = 0;

    eventItems.forEach((item) => {
      const title = normalizeText(item.dataset.title);
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
    if (noResultsMessage) {
      noResultsMessage.classList.toggle("d-none", visibleCount !== 0);
    }

    updateQuickButtons(categoryValue);
  }

  if (eventsContainer) {
    renderEventsList();

    const eventsPageParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = eventsPageParams.get("category");

    if (categoryFromUrl && categoryFilter) {
      categoryFilter.value = categoryFromUrl;
    }

    filterEvents();

    if (searchInput) searchInput.addEventListener("input", filterEvents);
    if (categoryFilter) categoryFilter.addEventListener("change", filterEvents);
    if (locationFilter) locationFilter.addEventListener("change", filterEvents);
    if (dateFilter) dateFilter.addEventListener("change", filterEvents);

    quickFilterButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        if (categoryFilter) categoryFilter.value = btn.dataset.category;
        filterEvents();

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
  }

  /* =========================
     9) event.html elements
     ========================= */

  const params = new URLSearchParams(window.location.search);
  const addToCalendarBtn = document.getElementById("addToCalendarBtn");
  const shareEventBtn = document.getElementById("shareEventBtn");
  const bookingForm = document.getElementById("bookingForm");
  const bookingAlert = document.getElementById("bookingAlert");
  const eventActionMessage = document.getElementById("eventActionMessage");

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
  const relatedEventsContainer = document.getElementById("relatedEventsContainer");
  const bookingModalLabel = document.getElementById("bookingModalLabel");

  const galleryImage1 = document.getElementById("galleryImage1");
  const galleryImage2 = document.getElementById("galleryImage2");
  const galleryImage3 = document.getElementById("galleryImage3");
  const galleryImage4 = document.getElementById("galleryImage4");
  const galleryImage5 = document.getElementById("galleryImage5");

  function renderRelatedEvents(relatedIds, currentEventId) {
    const collection = getEventsCollection();
    if (!relatedEventsContainer || !collection.length) return;

    const relatedEvents = (relatedIds || [])
      .map((id) => collection.find((event) => String(event.id) === String(id)))
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

    activateRevealInside(relatedEventsContainer);
  }

  function renderGalleryImages(selectedEvent) {
    const gallery = Array.isArray(selectedEvent.gallery) ? selectedEvent.gallery : [];
    const fallback = selectedEvent.heroImage;

    const galleryElements = [
      galleryImage1,
      galleryImage2,
      galleryImage3,
      galleryImage4,
      galleryImage5,
    ].filter(Boolean);

    galleryElements.forEach((imgElement, index) => {
      imgElement.src = gallery[index] || fallback;
      imgElement.alt = `${selectedEvent.title} - صورة ${index + 1}`;

      const parentCol = imgElement.closest(
        ".col-md-4, .col-md-6, .col-lg-4, .col-lg-3, .col-lg-2, .gallery-item"
      );
      if (parentCol) parentCol.classList.remove("d-none");
    });
  }

  function renderEventDetails() {
    if (!eventDetailsWrapper) return;

    const eventId = params.get("id");
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
    if (eventShortDescription) eventShortDescription.textContent = selectedEvent.shortDescription;
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
      eventMapImage.src = selectedEvent.mapImage || "";
      eventMapImage.alt = `خريطة مكان فعالية ${selectedEvent.title}`;
    }

    if (eventMapText) eventMapText.textContent = selectedEvent.mapText || "";

    renderGalleryImages(selectedEvent);

    if (bookingModalLabel) {
      bookingModalLabel.textContent = `حجز مكان في فعالية: ${selectedEvent.title}`;
    }

    document.title = `${selectedEvent.title} | دليل فعاليات الجامعة الافتراضية`;

    renderRelatedEvents(selectedEvent.related, selectedEvent.id);
    setupImagePreviewForEvent(selectedEvent);
  }

  renderEventDetails();

  /* =========================
     10) Image preview modal
     ========================= */

  const imagePreviewModalElement = document.getElementById("imagePreviewModal");
  const previewModalImage = document.getElementById("previewModalImage");
  const previewImageCounter = document.getElementById("previewImageCounter");
  const previewPrevBtn = document.getElementById("previewPrevBtn");
  const previewNextBtn = document.getElementById("previewNextBtn");
  const imagePreviewModalLabel = document.getElementById("imagePreviewModalLabel");

  let previewItems = [];
  let currentPreviewIndex = 0;
  let imagePreviewModalInstance = null;

  if (imagePreviewModalElement && window.bootstrap) {
    imagePreviewModalInstance = new bootstrap.Modal(imagePreviewModalElement);
  }

  function updatePreviewModal() {
    if (!previewModalImage || !previewItems.length) return;

    const currentItem = previewItems[currentPreviewIndex];
    if (!currentItem) return;

    previewModalImage.src = currentItem.src;
    previewModalImage.alt = currentItem.alt || "معاينة الصورة";

    if (imagePreviewModalLabel) {
      imagePreviewModalLabel.textContent = currentItem.label || "معاينة الصورة";
    }

    if (previewImageCounter) {
      previewImageCounter.textContent = `${currentPreviewIndex + 1} / ${previewItems.length}`;
    }

    if (previewPrevBtn) {
      previewPrevBtn.disabled = previewItems.length <= 1;
    }

    if (previewNextBtn) {
      previewNextBtn.disabled = previewItems.length <= 1;
    }
  }

  function openPreviewModal(items, startIndex = 0) {
    if (!imagePreviewModalInstance || !Array.isArray(items) || !items.length) return;

    previewItems = items;
    currentPreviewIndex = startIndex >= 0 ? startIndex : 0;

    updatePreviewModal();
    imagePreviewModalInstance.show();
  }

  function showPrevPreviewImage() {
    if (!previewItems.length) return;
    currentPreviewIndex = (currentPreviewIndex - 1 + previewItems.length) % previewItems.length;
    updatePreviewModal();
  }

  function showNextPreviewImage() {
    if (!previewItems.length) return;
    currentPreviewIndex = (currentPreviewIndex + 1) % previewItems.length;
    updatePreviewModal();
  }

  function buildGalleryPreviewItems(selectedEvent) {
    const gallery = Array.isArray(selectedEvent.gallery) ? selectedEvent.gallery : [];
    const fallback = selectedEvent.heroImage;

    return [0, 1, 2, 3, 4].map((index) => ({
      src: gallery[index] || fallback,
      alt: `${selectedEvent.title} - صورة ${index + 1}`,
      label: `${selectedEvent.title} - معرض الصور`,
    }));
  }

  function setupImagePreviewForEvent(selectedEvent) {
    if (!selectedEvent) return;

    const galleryItems = buildGalleryPreviewItems(selectedEvent);
    const galleryElements = [
      galleryImage1,
      galleryImage2,
      galleryImage3,
      galleryImage4,
      galleryImage5,
    ].filter(Boolean);

    galleryElements.forEach((imgElement, index) => {
      imgElement.style.cursor = "zoom-in";
      imgElement.setAttribute("tabindex", "0");
      imgElement.setAttribute("role", "button");

      const openHandler = function () {
        openPreviewModal(galleryItems, index);
      };

      imgElement.onclick = openHandler;
      imgElement.onkeydown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openHandler();
        }
      };
    });

    if (eventMapImage) {
      eventMapImage.style.cursor = "zoom-in";
      eventMapImage.setAttribute("tabindex", "0");
      eventMapImage.setAttribute("role", "button");

      const mapItem = [
        {
          src: selectedEvent.mapImage || "",
          alt: `خريطة مكان فعالية ${selectedEvent.title}`,
          label: `خريطة فعالية: ${selectedEvent.title}`,
        },
      ];

      eventMapImage.onclick = function () {
        openPreviewModal(mapItem, 0);
      };

      eventMapImage.onkeydown = function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreviewModal(mapItem, 0);
        }
      };
    }
  }

  if (previewPrevBtn) {
    previewPrevBtn.addEventListener("click", showPrevPreviewImage);
  }

  if (previewNextBtn) {
    previewNextBtn.addEventListener("click", showNextPreviewImage);
  }

  document.addEventListener("keydown", function (e) {
    if (!imagePreviewModalElement || !imagePreviewModalElement.classList.contains("show")) return;

    if (e.key === "ArrowLeft") {
      showNextPreviewImage();
    } else if (e.key === "ArrowRight") {
      showPrevPreviewImage();
    }
  });

  /* =========================
     11) Event actions
     ========================= */

  function formatICSDate(dateValue, timeValue = "10:00") {
    if (!dateValue) return "";

    const safeTime = timeValue && timeValue.includes(":") ? timeValue : "10:00";
    const date = new Date(`${dateValue}T${safeTime}:00`);

    if (Number.isNaN(date.getTime())) return "";

    const pad = (num) => String(num).padStart(2, "0");

    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  function downloadCalendarFile(selectedEvent) {
    if (!selectedEvent) return;

    const startDate = formatICSDate(selectedEvent.date, selectedEvent.time || "10:00");
    const endDate = formatICSDate(selectedEvent.date, "12:00");

    if (!startDate || !endDate) return;

    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SVU Events Guide//AR",
      "BEGIN:VEVENT",
      `UID:event-${selectedEvent.id}@svu-events`,
      `DTSTAMP:${startDate}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${selectedEvent.title}`,
      `DESCRIPTION:${selectedEvent.shortDescription || ""}`,
      `LOCATION:${selectedEvent.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `event-${selectedEvent.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener("click", function () {
      const eventId = params.get("id");
      const selectedEvent = getEventById(eventId);
      downloadCalendarFile(selectedEvent);
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
        showAlertMessage(bookingAlert, "يرجى تعبئة الاسم والبريد الإلكتروني.", "danger");
        return;
      }

      showAlertMessage(bookingAlert, "تم إرسال طلب الحجز بنجاح.", "success");
      bookingForm.reset();
    });
  }

  /* =========================
     12) contact.html form validation
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
        showAlertMessage(formAlert, "يرجى تعبئة جميع الحقول المطلوبة.", "danger");
        return;
      }

      if (!isValidEmail(emailValue)) {
        showAlertMessage(formAlert, "يرجى إدخال بريد إلكتروني صحيح.", "danger");
        return;
      }

      showAlertMessage(formAlert, "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معنا.", "success");
      contactForm.reset();
    });
  }

  /* =========================
     13) Clean initial state
     ========================= */

  hideAlertMessage(formAlert);
  hideAlertMessage(bookingAlert);
  hideAlertMessage(eventActionMessage);
});