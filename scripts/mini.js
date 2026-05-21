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

    const getScrollMarker = () => {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      return window.scrollY + headerHeight + 8;
    };

    const updateActiveLink = () => {
      if (window.scrollY <= 2) {
        sectionMap.forEach((entry) => {
          entry.link.classList.remove("is-active");
        });
        return;
      }

      const docHeight = document.documentElement.scrollHeight;
      const nearBottom = window.innerHeight + window.scrollY >= docHeight - 2;
      if (nearBottom) {
        const lastEntry = sectionMap[sectionMap.length - 1];
        sectionMap.forEach((entry) => {
          entry.link.classList.toggle("is-active", entry === lastEntry);
        });
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

      sectionMap.forEach((entry) => {
        entry.link.classList.toggle("is-active", entry === activeEntry);
      });
    };

    window.addEventListener("scroll", updateActiveLink, { passive: true });
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
    const galleryProjectLinks = document.querySelectorAll(".mini-gallery-item[data-project-target]");
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
    galleryContainer.innerHTML = shuffleArray(galleryItems)
      .map((item) => {
        const imageList = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
        const title = item.title || "Untitled";
        const service = item.service || "";
        const projectTargetId = item.id ? `project-${item.id}` : "";
        const itemMeta = service;
        const imageMarkup = imageList.length
          ? `<div class="mini-gallery-images">${imageList
              .map((imageSrc, index) => `<img src="${imageSrc}" alt="${title} gallery image ${index + 1}" loading="lazy">`)
              .join("")}</div>`
          : "";
        const textMarkup = `<p class="mini-gallery-text"><strong>${title}</strong>${itemMeta ? `<br>${itemMeta}` : ""}</p>`;

        if (projectTargetId) {
          return `<a class="mini-gallery-item" href="#${projectTargetId}" data-project-target="${projectTargetId}">${imageMarkup}${textMarkup}</a>`;
        }

        if (item.site) {
          return `<a class="mini-gallery-item" href="${item.site}" target="_blank">${imageMarkup}${textMarkup}</a>`;
        }

        return `<div class="mini-gallery-item">${imageMarkup}${textMarkup}</div>`;
      })
      .join("");

    bindGalleryProjectLinks();
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
        const descriptionMarkup = project.description
          .map((paragraph) => `<p>${paragraph}</p>`)
          .join("");
        const imageMarkup = project.image
          ? `<a class="mini-project-image-link" href="${project.site}" target="_blank"><img src="${project.image}" alt="${project.title} preview image" loading="lazy"></a>`
          : "";
        const projectIdAttr = project.id ? ` id="project-${project.id}"` : "";
        const displayUrl = (project.site || "")
          .replace(/^https?:\/\/(www\.)?/i, "")
          .replace(/\/$/, "");

        return `<details class="mini-project-item"${projectIdAttr}><summary><span class="mini-project-title">${project.title}</span><a class="mini-project-link" href="${project.site}" target="_blank" onclick="event.stopPropagation();">${displayUrl || "project link"}</a></summary><div class="mini-project-content">${descriptionMarkup}${imageMarkup}</div></details>`;
      })
      .join("");
  }

  function renderTestimonials(testimonialsData) {
    const testimonialsContainer = document.getElementById("testimonials");
    if (!testimonialsContainer) {
      return;
    }

    const testimonials = shuffleArray(Object.values(testimonialsData));
    testimonialsContainer.innerHTML = testimonials
      .map((testimonial) => `<blockquote><em>"${testimonial.quote || ""}"</em></blockquote><cite>${(testimonial.cite || "").replace(/^\s*[\u2014-]\s*/, "")}</cite>`)
      .join("\n");
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
