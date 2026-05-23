document.addEventListener("DOMContentLoaded", () => {
  function setupNavSectionHighlight() {
    const navLinks = Array.from(document.querySelectorAll("header nav a[href^='#']"));
    if (!navLinks.length) {
      return;
    }

    const sectionMap = navLinks
      .map((link) => {
        const selector = link.getAttribute("href");
        if (!selector) {
          return null;
        }

        const section = document.querySelector(selector);
        if (!section) {
          return null;
        }

        return { link, section };
      })
      .filter(Boolean);

    if (!sectionMap.length) {
      return;
    }

    let lockedActiveEntry = null;
    let lockReleaseTimeoutId = null;

    const setActiveEntry = (activeEntry) => {
      sectionMap.forEach((entry) => {
        entry.link.classList.toggle("is-active", entry === activeEntry);
      });
    };

    const releaseActiveLinkLock = () => {
      if (lockReleaseTimeoutId) {
        window.clearTimeout(lockReleaseTimeoutId);
        lockReleaseTimeoutId = null;
      }

      if (!lockedActiveEntry) {
        return;
      }

      lockedActiveEntry = null;
      updateActiveLink();
    };

    const scheduleActiveLinkLockRelease = () => {
      if (lockReleaseTimeoutId) {
        window.clearTimeout(lockReleaseTimeoutId);
      }

      lockReleaseTimeoutId = window.setTimeout(() => {
        releaseActiveLinkLock();
      }, 140);
    };

    const getScrollMarker = () => {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      return window.scrollY + headerHeight + 8;
    };

    const updateActiveLink = () => {
      if (lockedActiveEntry) {
        setActiveEntry(lockedActiveEntry);
        return;
      }

      if (window.scrollY <= 2) {
        sectionMap.forEach((entry) => {
          entry.link.classList.remove("is-active");
        });
        return;
      }

      const docHeight = document.documentElement.scrollHeight;
      const isMobile = window.innerWidth < 901;
      const bottomThreshold = isMobile ? 100 : 2;
      const nearBottom = window.innerHeight + window.scrollY >= docHeight - bottomThreshold;
      if (nearBottom) {
        const lastEntry = sectionMap[sectionMap.length - 1];
        setActiveEntry(lastEntry);
        return;
      }

      const marker = getScrollMarker();
      let activeEntry = sectionMap[0];

      sectionMap.forEach((entry) => {
        const top = entry.section.offsetTop;
        if (marker >= top) {
          activeEntry = entry;
        }
      });

      setActiveEntry(activeEntry);
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const clickedEntry = sectionMap.find((entry) => entry.link === link);
        if (!clickedEntry) {
          return;
        }

        lockedActiveEntry = clickedEntry;
        setActiveEntry(clickedEntry);
        scheduleActiveLinkLockRelease();
      });
    });

    window.addEventListener("scroll", () => {
      if (lockedActiveEntry) {
        setActiveEntry(lockedActiveEntry);
        scheduleActiveLinkLockRelease();
        return;
      }

      updateActiveLink();
    }, { passive: true });
    window.addEventListener("resize", updateActiveLink);
    updateActiveLink();
  }

  function setupScrollTopButton() {
    const scrollTopButton = document.querySelector(".mini-scroll-top");
    if (!scrollTopButton) {
      return;
    }

    const updateVisibility = () => {
      if (window.innerWidth < 901) {
        scrollTopButton.classList.remove("is-visible");
        return;
      }

      if (window.scrollY >= window.innerHeight) {
        scrollTopButton.classList.add("is-visible");
      } else {
        scrollTopButton.classList.remove("is-visible");
      }
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    updateVisibility();
  }

  function bindSectionJumpLinks() {
    const jumpLinks = document.querySelectorAll("a[href='#gallery'], a[href='#services'], a[href='#testimonial']");
    jumpLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetSelector = link.getAttribute("href");
        if (!targetSelector) {
          return;
        }

        const target = document.querySelector(targetSelector);
        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function bindGalleryProjectLinks() {
    const galleryProjectLinks = document.querySelectorAll(".mini-gallery-link[data-project-target]");
    galleryProjectLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("data-project-target");
        if (!targetId) {
          return;
        }

        const targetProject = document.getElementById(targetId);
        if (!targetProject) {
          return;
        }

        event.preventDefault();
        if (targetProject.tagName.toLowerCase() === "details") {
          targetProject.open = true;
        }
        targetProject.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupGalleryPreview(galleryItems) {
    const galleryContainer = document.getElementById("mini-gallery");
    if (!galleryContainer) {
      return;
    }

    const cardsContainer = galleryContainer.querySelector(".mini-gallery-cards");
    const hoverPopup = galleryContainer.querySelector(".mini-gallery-hover-popup");
    const hoverPopupImages = galleryContainer.querySelector(".mini-gallery-hover-popup-images");
    const dotsContainer = galleryContainer.querySelector(".mini-gallery-dots");
    const prevButton = galleryContainer.querySelector(".mini-gallery-prev");
    const nextButton = galleryContainer.querySelector(".mini-gallery-next");

    if (!cardsContainer || !dotsContainer || !prevButton || !nextButton || !galleryItems.length) {
      return;
    }

    const getVisibleCount = () => (window.innerWidth <= 900 ? 1 : 3);
    let activeIndex = 0;
    let activeHoverItemIndex = -1;

    const renderVisibleCards = () => {
      const total = galleryItems.length;
      if (!total) {
        cardsContainer.innerHTML = "";
        return;
      }

      const visibleCount = Math.min(getVisibleCount(), total);
      const visibleCards = Array.from({ length: visibleCount }, (_, offset) => {
        const itemIndex = (activeIndex + offset) % total;
        const item = galleryItems[itemIndex];
        const projectLinkMarkup = item.projectTargetId
          ? `<a class="mini-gallery-link mini-gallery-project-link" href="#${item.projectTargetId}" data-project-target="${item.projectTargetId}">project</a>`
          : "";
        const siteLinkMarkup = `<a class="mini-gallery-link mini-gallery-site-link" href="${item.siteUrl || "#"}" target="_blank" rel="noopener">${item.displayUrl}</a>`;
        const previewImagesMarkup = `<div class="mini-gallery-preview-images ${item.imageSources.length > 1 ? "multiple" : ""}">${(item.imageSources || [])
          .map((imageSrc, imageIndex) => `<img class="mini-gallery-preview-image" src="${imageSrc}" alt="${item.title} preview image ${imageIndex + 1}" loading="lazy">`)
          .join("")}</div>`;
        const imageLinkMarkup = item.imageSources.length > 1
          ? `<a class="mini-gallery-image-link" href="${item.siteUrl || "#"}" target="_blank" rel="noopener">${previewImagesMarkup}</a>`
          : `<div class="mini-gallery-preview-images">${(item.imageSources || [])
              .map((imageSrc, imageIndex) => `<a class="mini-gallery-image-link" href="${item.siteUrl || "#"}" target="_blank" rel="noopener"><img class="mini-gallery-preview-image" src="${imageSrc}" alt="${item.title} preview image ${imageIndex + 1}" loading="lazy"></a>`)
              .join("")}</div>`;

        return `<article class="mini-gallery-card" role="listitem" data-gallery-item-index="${itemIndex}"><strong class="mini-gallery-preview-title mini-gallery-card-title">${item.title}</strong>${imageLinkMarkup}<p class="mini-gallery-preview-caption">${siteLinkMarkup}<span class="mini-gallery-preview-meta">${item.service}</span></p><div class="mini-gallery-links">${projectLinkMarkup}</div></article>`;
      });

      cardsContainer.innerHTML = visibleCards.join("");
      bindGalleryProjectLinks();
    };

    const renderDots = () => {
      dotsContainer.innerHTML = galleryItems
        .map((item, index) => `<button type="button" class="mini-gallery-dot${index === 0 ? " is-active" : ""}" data-dot-index="${index}" aria-label="Show gallery item ${index + 1} of ${galleryItems.length}"></button>`)
        .join("");
    };

    const syncActiveDot = () => {
      const dots = Array.from(dotsContainer.querySelectorAll(".mini-gallery-dot"));
      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    const setActiveIndex = (newIndex) => {
      const total = galleryItems.length;
      activeIndex = (newIndex + total) % total;
      renderVisibleCards();
      syncActiveDot();
    };

    const showHoverPopup = (card) => {
      if (!hoverPopup || !hoverPopupImages || !card) {
        return;
      }

      const itemIndex = parseInt(card.getAttribute("data-gallery-item-index") || "-1", 10);
      if (itemIndex < 0 || itemIndex >= galleryItems.length) {
        return;
      }

      if (activeHoverItemIndex === itemIndex && hoverPopup.classList.contains("is-visible")) {
        return;
      }

      const item = galleryItems[itemIndex];
      if (!item || !Array.isArray(item.imageSources) || !item.imageSources.length) {
        return;
      }

      hoverPopupImages.innerHTML = item.imageSources
        .map((imageSrc, imageIndex) => `<img class="mini-gallery-hover-popup-image" src="${imageSrc}" alt="${item.title} popup preview image ${imageIndex + 1}" loading="lazy">`)
        .join("");
      activeHoverItemIndex = itemIndex;
      hoverPopup.classList.add("is-visible");
      hoverPopup.setAttribute("aria-hidden", "false");
    };

    const positionHoverPopup = (mouseEvent) => {
      if (!hoverPopup || !mouseEvent) {
        return;
      }

      const viewportPadding = 12;
      const cursorOffset = 18;
      const popupWidth = hoverPopup.offsetWidth;
      const popupHeight = hoverPopup.offsetHeight;

      const desiredLeft = mouseEvent.clientX - popupWidth - cursorOffset;
      const desiredTop = mouseEvent.clientY + cursorOffset;

      const maxLeft = Math.max(viewportPadding, window.innerWidth - popupWidth - viewportPadding);
      const maxTop = Math.max(viewportPadding, window.innerHeight - popupHeight - viewportPadding);

      const clampedLeft = Math.min(Math.max(viewportPadding, desiredLeft), maxLeft);
      const clampedTop = Math.min(Math.max(viewportPadding, desiredTop), maxTop);

      hoverPopup.style.left = `${clampedLeft}px`;
      hoverPopup.style.top = `${clampedTop}px`;
    };

    const hideHoverPopup = () => {
      if (!hoverPopup) {
        return;
      }

      activeHoverItemIndex = -1;
      hoverPopup.classList.remove("is-visible");
      hoverPopup.setAttribute("aria-hidden", "true");
    };

    const getHoveredGalleryCard = (target) => {
      if (!(target instanceof Element)) {
        return null;
      }

      const previewTrigger = target.closest(".mini-gallery-image-link, .mini-gallery-preview-images, .mini-gallery-preview-image");
      if (!previewTrigger || !cardsContainer.contains(previewTrigger)) {
        return null;
      }

      return previewTrigger.closest(".mini-gallery-card");
    };

    prevButton.addEventListener("click", () => {
      setActiveIndex(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      setActiveIndex(activeIndex + 1);
    });

    dotsContainer.addEventListener("click", (event) => {
      const dot = event.target.closest(".mini-gallery-dot");
      if (!dot || !dotsContainer.contains(dot)) {
        return;
      }

      const targetIndex = parseInt(dot.getAttribute("data-dot-index") || "0", 10);
      setActiveIndex(targetIndex);
    });

    galleryContainer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex(activeIndex + 1);
      }
    });

    cardsContainer.addEventListener("mouseover", (event) => {
      const card = getHoveredGalleryCard(event.target);
      if (!card) {
        return;
      }

      showHoverPopup(card);
      positionHoverPopup(event);
    });

    cardsContainer.addEventListener("mousemove", (event) => {
      const card = getHoveredGalleryCard(event.target);
      if (!card) {
        return;
      }

      showHoverPopup(card);
      positionHoverPopup(event);
    });

    cardsContainer.addEventListener("mouseout", (event) => {
      const card = getHoveredGalleryCard(event.target);
      if (!card) {
        return;
      }

      const nextCard = getHoveredGalleryCard(event.relatedTarget);
      if (nextCard === card) {
        return;
      }

      hideHoverPopup();
    });

    cardsContainer.addEventListener("mouseleave", hideHoverPopup);

    window.addEventListener("resize", renderVisibleCards);

    renderDots();
    setActiveIndex(0);
  }

  function shuffleArray(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function renderGallery(galleryData) {
    const galleryContainer = document.getElementById("mini-gallery");
    if (!galleryContainer) {
      return;
    }

    const galleryItems = Object.entries(galleryData || {})
      .filter(([name]) => {
        const key = name.trim();
        return !key.includes("-2") && !key.includes("-3") && !/\s[23]$/.test(key);
      })
      .map(([, item]) => item);
    const shuffledGalleryItems = shuffleArray(galleryItems).map((item) => {
      const imageList = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
      const imageSources = imageList.length ? imageList : [""];
      const title = item.title || "Untitled";
      const service = item.service || "";
      const projectTargetId = item.id ? `project-${item.id}` : "";
      const siteUrl = item.site || "";
      const displayUrl = siteUrl
        .replace(/^https?:\/\/(www\.)?/i, "")
        .replace(/\/$/, "") || "project site";

      return {
        imageSources,
        title,
        service,
        projectTargetId,
        siteUrl,
        displayUrl,
        previewAlt: `${title} full-size preview`
      };
    });

    galleryContainer.innerHTML = `
      <div class="mini-gallery-controls" aria-label="Gallery item controls">
        <div class="mini-gallery-dots" aria-label="Gallery sequence"></div>
        <div class="mini-testimonial-arrows">
          <button type="button" class="mini-testimonial-arrow mini-gallery-prev" aria-label="Show previous gallery item"><img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true"></button>
          <button type="button" class="mini-testimonial-arrow mini-gallery-next" aria-label="Show next gallery item"><img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true"></button>
        </div>
      </div>
      <div class="mini-gallery-cards" role="list" aria-live="polite"></div>
      <div class="mini-gallery-hover-popup" aria-hidden="true"><div class="mini-gallery-hover-popup-images"></div></div>`;

    setupGalleryPreview(shuffledGalleryItems);
  }

  function renderProjects(projectsData) {
    const projectsList = document.getElementById("projects-list");
    if (!projectsList) {
      return;
    }

    const projects = Object.entries(projectsData).map(([title, details]) => ({
      title,
      site: details.site || "#",
      year: details.year || "",
      id: details.id || "",
      description: Array.isArray(details.description) ? details.description : [],
      image: details.image || ""
    }));

    projects.sort((a, b) => {
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      return yearB - yearA;
    });

    projectsList.innerHTML = projects
      .map((project) => {
        const descriptionMarkup = `<div class="mini-project-description">${project.description
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join("")}</div>`;
        const imageMarkup = project.image
          ? `<a class="mini-project-image-link" href="${project.site}" target="_blank"><img src="${project.image}" alt="${project.title} preview image" loading="lazy"></a>`
          : "";
        const projectIdAttr = project.id ? ` id="project-${project.id}"` : "";
        const displayUrl = (project.site || "")
          .replace(/^https?:\/\/(www\.)?/i, "")
          .replace(/\/$/, "");

        return `<details class="mini-project-item"${projectIdAttr}><summary><span class="mini-project-title">${project.title}</span><a class="mini-project-link" href="${project.site}" target="_blank" onclick="event.stopPropagation();">${displayUrl || "project link"}</a></summary><div class="mini-project-content">${imageMarkup}${descriptionMarkup}</div></details>`;
      })
      .join("");
  }

  function renderTestimonials(testimonialsData) {
    const testimonialsContainer = document.getElementById("testimonials");
    if (!testimonialsContainer) {
      return;
    }

    const testimonials = shuffleArray(Object.values(testimonialsData || {})).filter((testimonial) => testimonial && testimonial.quote && testimonial.cite);
    if (!testimonials.length) {
      testimonialsContainer.innerHTML = "";
      return;
    }

    testimonialsContainer.innerHTML = `
      <div class="mini-testimonials-carousel" role="region" aria-label="Client testimonials">
        <div class="mini-testimonial-controls" aria-label="Testimonial sequence controls">
          <div class="mini-testimonial-dots" aria-label="Testimonial sequence"></div>
          <div class="mini-testimonial-arrows">
            <button type="button" class="mini-testimonial-arrow mini-testimonial-prev" aria-label="Show previous testimonial"><img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true"></button>
            <button type="button" class="mini-testimonial-arrow mini-testimonial-next" aria-label="Show next testimonial"><img src="/assets/icons/arrow-left.svg" alt="" aria-hidden="true"></button>
          </div>
        </div>
        <div class="mini-testimonial-slides" aria-live="polite"></div>
      </div>
    `;

    const slidesContainer = testimonialsContainer.querySelector(".mini-testimonial-slides");
    const dotsContainer = testimonialsContainer.querySelector(".mini-testimonial-dots");
    const prevButton = testimonialsContainer.querySelector(".mini-testimonial-prev");
    const nextButton = testimonialsContainer.querySelector(".mini-testimonial-next");
    if (!slidesContainer || !dotsContainer || !prevButton || !nextButton) {
      return;
    }

    slidesContainer.innerHTML = testimonials
      .map((testimonial, index) => `<article class="mini-testimonial-slide${index === 0 ? " is-active" : ""}" data-slide-index="${index}" ${index === 0 ? "" : "hidden"}><blockquote><em>"${testimonial.quote || ""}"</em></blockquote><cite>${(testimonial.cite || "").replace(/^\s*[\u2014-]\s*/, "")}</cite></article>`)
      .join("");

    dotsContainer.innerHTML = testimonials
      .map((testimonial, index) => `<button type="button" class="mini-testimonial-dot${index === 0 ? " is-active" : ""}" data-dot-index="${index}" aria-label="Show testimonial ${index + 1} of ${testimonials.length}"></button>`)
      .join("");

    const slides = Array.from(testimonialsContainer.querySelectorAll(".mini-testimonial-slide"));
    const dots = Array.from(testimonialsContainer.querySelectorAll(".mini-testimonial-dot"));
    let activeIndex = 0;

    const setActiveSlide = (newIndex) => {
      const total = slides.length;
      if (!total) {
        return;
      }

      activeIndex = (newIndex + total) % total;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.hidden = !isActive;
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    };

    prevButton.addEventListener("click", () => {
      setActiveSlide(activeIndex - 1);
    });

    nextButton.addEventListener("click", () => {
      setActiveSlide(activeIndex + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = parseInt(dot.getAttribute("data-dot-index") || "0", 10);
        setActiveSlide(targetIndex);
      });
    });

    testimonialsContainer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveSlide(activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveSlide(activeIndex + 1);
      }
    });

    setActiveSlide(0);
  }

  function copySectionContent(indexDoc, sourceSelector, targetSelector) {
    const source = indexDoc.querySelector(sourceSelector);
    const target = document.querySelector(targetSelector);
    if (!source || !target) {
      return;
    }

    target.innerHTML = source.innerHTML;
  }

  async function syncCopyFromIndex() {
    const response = await fetch("/index.html");
    if (!response.ok) {
      return;
    }

    const htmlText = await response.text();
    const parser = new DOMParser();
    const indexDoc = parser.parseFromString(htmlText, "text/html");

    copySectionContent(indexDoc, "#about .bio-1", "#about-copy");
    copySectionContent(indexDoc, "#services .services-description", "#services-copy");
    copySectionContent(indexDoc, "#contact .contact-content", "#contact-copy");

    const testimonialLinks = document.querySelectorAll("a[href='#testimonial'], a.about-to-testimonial");
    testimonialLinks.forEach((link) => {
      link.setAttribute("href", "#testimonial");
    });
  }

  async function renderDataSections() {
    const [galleryResponse, projectsResponse, testimonialsResponse] = await Promise.all([
      fetch("/data/gallery.json"),
      fetch("/data/projects.json"),
      fetch("/data/testimonials.json")
    ]);

    if (galleryResponse.ok) {
      const galleryData = await galleryResponse.json();
      renderGallery(galleryData);
    }

    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      renderProjects(projectsData);
    }

    if (testimonialsResponse.ok) {
      const testimonialsData = await testimonialsResponse.json();
      renderTestimonials(testimonialsData);
    }
  }

  async function initContent() {
    try {
      await Promise.all([syncCopyFromIndex(), renderDataSections()]);
      bindSectionJumpLinks();
    } catch (error) {
      console.log(error);
    }
  }

  function setupHeadshotPixelation() {
    const headshotImage = document.querySelector(".basic-info .headshot");
    if (!headshotImage) {
      return;
    }

    const headshotLink = headshotImage.closest("a");
    if (!headshotLink) {
      return;
    }

    headshotLink.classList.add("headshot-pixel-wrapper");

    const pixelCanvas = document.createElement("canvas");
    pixelCanvas.className = "headshot-pixel-canvas";
    pixelCanvas.setAttribute("aria-hidden", "true");
    headshotLink.appendChild(pixelCanvas);

    const pixelContext = pixelCanvas.getContext("2d");
    const workingCanvas = document.createElement("canvas");
    const workingContext = workingCanvas.getContext("2d");

    let animationFrame = null;
    let currentPixelSize = 1;
    let isNavigating = false;
    const maxPixelSize = 22;

    const drawPixelatedFrame = (pixelSize) => {
      if (!pixelContext || !workingContext || !headshotImage.complete) {
        return;
      }

      const sourceWidth = pixelCanvas.width;
      const sourceHeight = pixelCanvas.height;
      if (!sourceWidth || !sourceHeight) {
        return;
      }

      const sampleWidth = Math.max(1, Math.floor(sourceWidth / pixelSize));
      const sampleHeight = Math.max(1, Math.floor(sourceHeight / pixelSize));

      workingContext.clearRect(0, 0, sourceWidth, sourceHeight);
      workingContext.imageSmoothingEnabled = true;
      workingContext.drawImage(headshotImage, 0, 0, sampleWidth, sampleHeight);

      pixelContext.clearRect(0, 0, sourceWidth, sourceHeight);
      pixelContext.imageSmoothingEnabled = false;
      pixelContext.drawImage(workingCanvas, 0, 0, sampleWidth, sampleHeight, 0, 0, sourceWidth, sourceHeight);
    };

    const resizeCanvas = () => {
      const imageWidth = headshotImage.clientWidth;
      const imageHeight = headshotImage.clientHeight;
      if (!imageWidth || !imageHeight) {
        return;
      }

      pixelCanvas.width = imageWidth;
      pixelCanvas.height = imageHeight;
      workingCanvas.width = imageWidth;
      workingCanvas.height = imageHeight;
      drawPixelatedFrame(currentPixelSize);
    };

    const animatePixelation = (targetPixelSize, duration, onComplete) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      const startPixelSize = currentPixelSize;
      const startTime = performance.now();

      const tick = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        currentPixelSize = startPixelSize + ((targetPixelSize - startPixelSize) * easedProgress);
        drawPixelatedFrame(currentPixelSize);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
          return;
        }

        currentPixelSize = targetPixelSize;
        drawPixelatedFrame(currentPixelSize);

        if (typeof onComplete === "function") {
          onComplete();
        }
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const setupReadyState = () => {
      resizeCanvas();
      drawPixelatedFrame(1);
      pixelCanvas.style.opacity = "0";
    };

    const triggerPixelateAndNavigate = (event) => {
      if (isNavigating || !headshotImage.complete) {
        return;
      }

      event.preventDefault();
      isNavigating = true;
      pixelCanvas.style.opacity = "1";

      animatePixelation(maxPixelSize, 320, () => {
        window.location.href = headshotLink.getAttribute("href") || "/tpl";
      });
    };

    if (headshotImage.complete) {
      setupReadyState();
    } else {
      headshotImage.addEventListener("load", setupReadyState, { once: true });
    }

    window.addEventListener("resize", resizeCanvas);
    headshotLink.addEventListener("click", triggerPixelateAndNavigate);
  }

  initContent();
  setupHeadshotPixelation();
  setupScrollTopButton();
  setupNavSectionHighlight();
});
