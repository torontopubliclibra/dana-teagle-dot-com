// app object
const app = {
    elements: {
        h1: $("h1"),
        body: $("body"),
        header: $("header"),
        nav: $("nav"),
        mobileMenu: $(".mobile-menu"),
        about: $("#about"),
        gallery: $("#gallery"),
        projects: $("#projects"),
        services: $("#services"),
        contact: $("#contact"),
        aboutToGallery: $(".about-to-gallery"),
        aboutToServices: $(".about-to-services"),
        aboutToTestimonial: $(".about-to-testimonial"),
        servicesToContact: $(".services-to-contact"),
        aboutLink: $("nav .about"),
        galleryLink: $("nav .gallery"),
        projectsLink: $("nav .projects"),
        servicesLink: $("nav .services"),
        contactLink: $("nav .contact"),
        scrollDownButton: $(".scroll-down"),
        scrollTitle: $(".scroll-title"),
        scrollTopButton: $(".scroll-to-top"),
        darkModeToggle: $("#darkmode-toggle"),
        animationsToggle: $("#animations-toggle"),
        projectsContainer: $(".projects-container"),
        projectsNav: $(".projects-controls-accordion .projects-nav"),
        projectDescription: $(".project-description"),
        projectsErrorMessage: $(".js-disabled-projects"),
        headshotWrapper: $(".headshot-wrapper"),
        galleryContainer: document.querySelector(".gallery-container"),
        galleryContent: document.querySelector(".gallery-content"),
        galleryErrorMessage: $(".js-disabled-gallery"),
        pauseButton: document.querySelector("#gallery-pause-button"),
        fullscreenButton: document.querySelector("#gallery-fullscreen-button"),
        galleryInfoItems: document.querySelectorAll(".gallery-item-info"),
        testimonial: $("#services blockquote"),
        testimonialsButton: document.querySelector(".testimonial-button") || document.querySelector(".testimonials-button"),
        projectsAccordionToggle: document.querySelector(".projects-controls-accordion .accordion-toggle"),
        projectsAccordionPanel: document.querySelector(".projects-controls-accordion .accordion-panel")
    },
    toggles: {
        animations: true,
        darkMode: true,
    },
    projects: {
        data: [],
        filter: "All",
        sort: "newest",
        expand: false
    },
    testimonials: {
        data: [],
        index: 0,
    },
    gallery: {
        data: [],
        paused: false,
        fullscreen: false,
    },
    projectLightbox: {
        element: null,
        lastActiveElement: null,
        lastScrollPosition: 0,
        items: [],
        index: -1,
        scrollLock: {
            active: false,
            y: 0,
            bodyStyles: {}
        }
    },
    functions: {
        toggleAnimations() {
            app.elements.animationsToggle.toggleClass('selected');
            app.toggles.animations = !app.toggles.animations;
            if (app.toggles.animations === false) {
                app.elements.header.css('animation', 'none');
                app.elements.scrollDownButton.css('animation', 'none');
                app.elements.scrollDownButton.css('transform', 'translate(-50%, 0px)');
                app.functions.galleryPause('pause');
                app.elements.animationsToggle.html('<img src="./assets/icons/checkbox-blank.svg" alt="Unchecked checkbox">Animations');
            } else {
                app.elements.header.css('animation', '30s infinite ease-in-out gradient');
                app.elements.scrollDownButton.css('transform', 'none');
                app.elements.scrollDownButton.css('animation', '4s infinite ease-in-out pulse');
                app.functions.galleryPause('unpause');
                app.elements.animationsToggle.html('<img src="./assets/icons/checkbox.svg" alt="Checked checkbox">Animations');
            }
            localStorage['animations'] = `${app.toggles.animations}`;
        },
        toggleDarkMode() {
            app.elements.body.toggleClass("dark-mode");
            app.elements.darkModeToggle.toggleClass('selected');
            app.toggles.darkMode = !app.toggles.darkMode;
            if (app.toggles.darkMode === true) {
                app.elements.darkModeToggle.html('<img src="./assets/icons/checkbox.svg" alt="Checked checkbox">Dark Mode');
            } else {
                app.elements.darkModeToggle.html('<img src="./assets/icons/checkbox-blank.svg" alt="Unchecked checkbox">Dark mode');
            }
            localStorage['dark-mode'] = `${app.toggles.darkMode}`;
        },
        changeTitleText(text) {
            app.elements.h1.html(text);
        },
        toggleNav() {
            app.elements.body.toggleClass("nav-open");
            app.elements.nav.toggleClass("active");
        },
        setupHeadshotPixelation() {
            const headshotImage = document.querySelector("#about .basic-info .headshot");
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
            const maxPixelSize = 22;

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

            const animatePixelation = (targetPixelSize, duration) => {
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
                    } else {
                        currentPixelSize = targetPixelSize;
                        drawPixelatedFrame(currentPixelSize);
                        if (targetPixelSize <= 1) {
                            pixelCanvas.style.opacity = "0";
                        }
                    }
                };

                animationFrame = requestAnimationFrame(tick);
            };

            const startPixelation = () => {
                if (!headshotImage.complete) {
                    return;
                }
                pixelCanvas.style.opacity = "1";
                animatePixelation(maxPixelSize, 360);
            };

            const stopPixelation = () => {
                if (!headshotImage.complete) {
                    return;
                }
                animatePixelation(1, 420);
            };

            const setupReadyState = () => {
                resizeCanvas();
                drawPixelatedFrame(1);
                pixelCanvas.style.opacity = "0";
            };

            if (headshotImage.complete) {
                setupReadyState();
            } else {
                headshotImage.addEventListener("load", setupReadyState, { once: true });
            }

            window.addEventListener("resize", resizeCanvas);
            headshotLink.addEventListener("mouseenter", startPixelation);
            headshotLink.addEventListener("mouseleave", stopPixelation);
        },
        shuffleArray(array) {
            const groups = array.reduce((acc, item) => {
                acc[item.title] = acc[item.title] || [];
                acc[item.title].push(item);
                return acc;
            }, {});
            Object.values(groups).forEach(group => {
                for (let i = group.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [group[i], group[j]] = [group[j], group[i]];
                }
            });
            const shuffledGroups = Object.values(groups);
            for (let i = shuffledGroups.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledGroups[i], shuffledGroups[j]] = [shuffledGroups[j], shuffledGroups[i]];
            }
            const result = [];
            const maxGroupSize = Math.max(...Object.values(shuffledGroups).map(group => group.length));
            for (let i = 0; i < maxGroupSize; i++) {
                for (const group of Object.values(shuffledGroups)) {
                    if (group[i]) {
                        result.push(group[i]);
                    }
                }
            }
            return result;
        },
        galleryPause(playState) {
            if (playState === 'pause') {
                app.elements.galleryContent.classList.add('paused');
                app.elements.galleryContent.style.animationPlayState = 'paused';
                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.add('reveal');
                })
                app.gallery.paused = true;
                app.functions.renderGalleryControls();
            } else if (playState === 'unpause') {
                app.elements.galleryContent.classList.remove('paused');
                app.elements.galleryContent.style.animationPlayState = 'running';
                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.remove('reveal');
                })
                app.gallery.paused = false;
                app.functions.renderGalleryControls();
            }
        },
        ensureGalleryFullscreenControls() {
            const container = app.elements.galleryContainer;
            if (!container) {
                return null;
            }

            let controls = container.querySelector('.gallery-fullscreen-controls');
            if (controls) {
                return controls;
            }

            controls = document.createElement('div');
            controls.className = 'gallery-fullscreen-controls';
            controls.innerHTML = `
                <button type="button" class="gallery-fullscreen-action gallery-fullscreen-pause"></button>
                <button type="button" class="gallery-fullscreen-action gallery-fullscreen-exit"></button>
            `;
            container.appendChild(controls);
            return controls;
        },
        renderGalleryControls() {
            if (!app.elements.pauseButton || !app.elements.fullscreenButton) {
                return;
            }

            const fullscreenControls = app.functions.ensureGalleryFullscreenControls();

            const pauseLabel = app.gallery.paused ? 'Unpause gallery' : 'Pause gallery';
            const pauseState = app.gallery.paused ? 'unpause' : 'pause';
            const pauseIcon = app.gallery.paused ? 'play' : 'pause';
            const pauseIconAlt = app.gallery.paused ? 'unpause gallery icon' : 'pause gallery icon';

            const fullscreenLabel = app.gallery.fullscreen ? 'Exit' : 'Full screen';
            const fullscreenIcon = app.gallery.fullscreen ? 'fullscreen-exit' : 'fullscreen';
            const fullscreenIconAlt = app.gallery.fullscreen ? 'exit fullscreen icon' : 'enter fullscreen icon';

            app.elements.pauseButton.innerHTML = `<button onclick="app.functions.galleryPause('${pauseState}')">${pauseLabel} <img src="./assets/icons/${pauseIcon}.svg" alt="${pauseIconAlt}" style="pointer-events: auto;"></button>`;
            app.elements.fullscreenButton.innerHTML = `<button onclick="app.functions.toggleGalleryFullscreen()">${fullscreenLabel} <img src="./assets/icons/${fullscreenIcon}.svg" alt="${fullscreenIconAlt}" style="pointer-events: auto;"></button>`;

            if (fullscreenControls) {
                const fullscreenPauseButton = fullscreenControls.querySelector('.gallery-fullscreen-pause');
                const fullscreenExitButton = fullscreenControls.querySelector('.gallery-fullscreen-exit');

                if (fullscreenPauseButton) {
                    fullscreenPauseButton.innerHTML = `${app.gallery.paused ? 'Unpause' : 'Pause'} <img src="./assets/icons/${pauseIcon}.svg" alt="${pauseIconAlt}" style="pointer-events: auto;">`;
                    fullscreenPauseButton.setAttribute('onclick', `app.functions.galleryPause('${pauseState}')`);
                }

                if (fullscreenExitButton) {
                    fullscreenExitButton.innerHTML = `Exit <img src="./assets/icons/fullscreen-exit.svg" alt="exit fullscreen icon" style="pointer-events: auto;">`;
                    fullscreenExitButton.setAttribute('onclick', 'app.functions.toggleGalleryFullscreen()');
                }
            }
        },
        updateGalleryFullscreenState() {
            const isFullscreen = document.fullscreenElement === app.elements.galleryContainer
                || document.webkitFullscreenElement === app.elements.galleryContainer;
            app.gallery.fullscreen = Boolean(isFullscreen);

            if (app.elements.galleryContainer) {
                app.elements.galleryContainer.classList.toggle('is-fullscreen', app.gallery.fullscreen);
            }

            app.functions.renderGalleryControls();
        },
        async toggleGalleryFullscreen() {
            const container = app.elements.galleryContainer;
            if (!container) {
                return;
            }

            try {
                const isFullscreen = document.fullscreenElement === container
                    || document.webkitFullscreenElement === container;

                if (!isFullscreen) {
                    if (container.requestFullscreen) {
                        await container.requestFullscreen();
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    }
                } else if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } catch (_error) {
                // Ignore fullscreen API errors; state is refreshed by the change event.
            }
        },
        galleryDisplay() {
            let galleryArray = [];
            if (app.gallery.data.length > 0) {

                app.elements.galleryErrorMessage.html(``);
                app.elements.galleryErrorMessage.removeClass("js-disabled-gallery");
                app.elements.galleryErrorMessage.addClass("js-enabled-gallery");
                galleryArray = app.gallery.data.map((item) => {
                    let formattedItem = {
                        images: "",
                        info: "",
                        multi: false,
                    };
                    if (item.images && item.images.length > 1) {
                        formattedItem.multi = true;
                        let formattedImages = [];
                        let imageCounter = 1;
                        formattedImages = item.images.map(image => {
                            let img = `<img src="${image}" alt="${item.title}">`
                            let spacing = ``;
                            if (imageCounter !== (item.images.length)) {
                                spacing = `<div class="gallery-spacing"></div>`;
                                imageCounter++
                            }
                            return img + spacing;
                        });
                        formattedItem.images = `<div class="images-container">` + formattedImages.reduce((accumulator, item) => {
                        return accumulator + item}) + `</div>`;
                    } else {
                        formattedItem.images = `<img src="${item.images[0]}" alt="${item.title}">`
                    }
                    let formattedTitle = `<p>${item.title} (${item.year})</p>`
                    let formattedService = `<p>${item.service}</p>`
                    let itemLinks = [];
                    let formattedLinks = ``;
                    if (item.site) {
                        const siteLabel = item.site.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
                        itemLinks.push(`<a href="${item.site}" target="_blank" title="${item.title} website">${siteLabel}</a>`)
                    }
                    if (item.instagram) {
                        itemLinks.push(`<a href="${item.instagram}" target="_blank" title="${item.title} instagram">Instagram</a>`)
                    }
                    if (item.id) {
                        itemLinks.push(`<button onclick="app.functions.openGalleryProject('${item.id}')">Read more</button>`)
                    }
                    if (itemLinks.length > 0) {
                        formattedLinks = `<p>` + itemLinks.reduce((accumulator, item) => {return accumulator + ` | ` + item}) + `</p>`
                    }
                    if (formattedItem.multi) {
                        return `<div class="gallery-item multi">` + formattedItem.images + `<div class="gallery-item-info">` + formattedTitle + formattedService + formattedLinks + `<hr></div></div>`
                    } else {
                        return `<div class="gallery-item">` + formattedItem.images + `<div class="gallery-item-info">` + formattedTitle + formattedService + formattedLinks + `<hr></div></div>`
                    }
                });
                app.elements.galleryContent.innerHTML= galleryArray.reduce((accumulator, item) => {
                    return accumulator + item;
                }) + `<div class="gallery-end-space" aria-hidden="true"></div>`;
            }
            if (app.elements.galleryContent) {
                setTimeout(() => {
                    const galleryItems = document.querySelectorAll('.gallery-item');
                    let totalWidth = 0;
                    galleryItems.forEach(item => {
                        totalWidth += item.offsetWidth;
                    });
                    // Add leading space equal to the max leftward pixel shift so the user can
                    // scroll back to the beginning after the animation has run to the left.
                    // Max leftward shift = totalWidth * 0.475 * 1.2 (derived from the formula below).
                    const spacerWidth = Math.ceil(totalWidth * 0.475 * 1.2);
                    let startSpacer = app.elements.galleryContent.querySelector('.gallery-start-space');
                    if (!startSpacer) {
                        startSpacer = document.createElement('div');
                        startSpacer.className = 'gallery-start-space';
                        startSpacer.setAttribute('aria-hidden', 'true');
                        app.elements.galleryContent.insertBefore(startSpacer, app.elements.galleryContent.firstChild);
                    }
                    startSpacer.style.width = `${spacerWidth}px`;
                    startSpacer.style.minWidth = `${spacerWidth}px`;
                    startSpacer.style.height = '1px';
                    startSpacer.style.flexShrink = '0';
                    startSpacer.style.pointerEvents = 'none';
                    // Recalculate using the new (wider) content width so the initial view is unchanged.
                    let galleryTransform = ((totalWidth / app.elements.galleryContent.offsetWidth) * 0.475) * 120;
                    let style = document.createElement('style');
                    let keyframes = `
                        @keyframes ticker {
                            0% {
                                transform: translate3d(${galleryTransform}%, 0, 0);
                                visibility: visible;
                            }
                            50% {
                                transform: translate3d(-${galleryTransform}%, 0, 0);
                            }
                            100% {
                                transform: translate3d(${galleryTransform}%, 0, 0);
                            }
                        }
                    `;
                    style.innerHTML = keyframes;
                    const existingStyle = document.getElementById('ticker-animation');
                    if (existingStyle) {
                        existingStyle.remove();
                    }
                    style.id = 'ticker-animation';
                    document.head.appendChild(style);
                    app.elements.galleryContent.style.animation = `ticker infinite ${galleryItems.length * 15}s, fade-in 2s`;
                    app.elements.galleryContent.style.animationTimingFunction = 'linear';
                    app.elements.galleryContent.style.animationPlayState = 'running';
                    if (app.gallery.paused === true) {
                        app.elements.galleryContent.style.animationPlayState = 'paused';
                    }
                    // Start scroll at beginning of content (after the leading space) so the
                    // initial view is unchanged, while leaving room to scroll back to the left.
                    app.elements.galleryContainer.scrollLeft = spacerWidth;
                }, 1000);
            }
        },
        renderTestimonialButton() {
            if (!app.elements.testimonialsButton) {
                return;
            }

            const totalTestimonials = app.testimonials.data.length;
            if (totalTestimonials === 0) {
                app.elements.testimonialsButton.innerHTML = `Another testimonial <img src="./assets/icons/refresh.svg" alt="" srcset="">`;
                app.elements.testimonialsButton.removeAttribute('aria-label');
                return;
            }

            const currentTestimonial = app.testimonials.index + 1;
            const testimonialDots = Array.from({ length: totalTestimonials }, (_item, index) => {
                const isActive = index === app.testimonials.index;
                return `<span class="testimonial-dot${isActive ? ' active' : ''}" aria-hidden="true"></span>`;
            }).join('');

            app.elements.testimonialsButton.innerHTML = `<span class="testimonial-button-label">Another testimonial <img src="./assets/icons/refresh.svg" alt="" srcset=""></span><span class="testimonial-button-dots" aria-hidden="true">${testimonialDots}</span>`;
            app.elements.testimonialsButton.setAttribute('aria-label', `Show testimonial ${currentTestimonial} of ${totalTestimonials}`);
        },
        testimonialDisplay() {
            if (!app.testimonials.data.length) {
                app.elements.testimonial.html('');
                app.functions.renderTestimonialButton();
                return;
            }

            app.elements.testimonial.html(`<p><span class="quote-marks">“</span>${app.testimonials.data[app.testimonials.index].quote}<span class="quote-marks">”</span></p><cite>${app.testimonials.data[app.testimonials.index].cite}</cite>`);
            app.functions.renderTestimonialButton();
        },
        nextTestimonial() {
            if (app.testimonials.index < (app.testimonials.data.length - 1)) {
                app.testimonials.index++;
            } else {
                app.testimonials.index = 0;
            }
            app.functions.testimonialDisplay();
            app.functions.scrollUp('testimonial');
        },
        scroll(direction) {
            let location = "";
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const offset = arguments.length > 1 ? ((arguments[1] || 0) * rootFontSize) : 0;
            if (direction === "top") {
                location = Math.max(0, 0 - offset);
                window.scrollTo({top: location, behavior: "smooth"});
                history.pushState(null, null, ' ');
            } else {
                location = Math.max(0, $(`#${direction}`).offset().top - offset);
                window.scrollTo({top: location, behavior: "smooth"});
                setTimeout(() => {
                    history.pushState(null, null, `#${direction}`);
                }, 300);
            };
            document.activeElement.blur();
        },
        scrollUp(direction) {
            let location = "";
            location = $(`#${direction}`).offset().top;
            if (window.scrollY > location) {
                window.scrollTo({top: location, behavior: "smooth"});
            }
            setTimeout(() => {
                history.pushState(null, null, `#${direction}`);
            }, 300);
            document.activeElement.blur();
        },
        scrollOnEnter(keyCode, direction) {
            let key = keyCode;
            let enter = 13;
            if (key && (key !== enter)) {
                return;
            } else {
                app.functions.scroll(direction);
            };
        },
        lockProjectPageScroll() {
            if (app.projectLightbox.scrollLock.active) {
                return;
            }

            const body = document.body;
            app.projectLightbox.scrollLock.y = window.pageYOffset || document.documentElement.scrollTop || 0;
            app.projectLightbox.scrollLock.bodyStyles = {
                position: body.style.position,
                top: body.style.top,
                left: body.style.left,
                right: body.style.right,
                width: body.style.width,
                overflow: body.style.overflow
            };

            body.style.position = 'fixed';
            body.style.top = `-${app.projectLightbox.scrollLock.y}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.width = '100%';
            body.style.overflow = 'hidden';
            app.projectLightbox.scrollLock.active = true;
        },
        unlockProjectPageScroll() {
            if (!app.projectLightbox.scrollLock.active) {
                return;
            }

            const body = document.body;
            const { bodyStyles, y } = app.projectLightbox.scrollLock;
            body.style.position = bodyStyles.position || '';
            body.style.top = bodyStyles.top || '';
            body.style.left = bodyStyles.left || '';
            body.style.right = bodyStyles.right || '';
            body.style.width = bodyStyles.width || '';
            body.style.overflow = bodyStyles.overflow || '';
            app.projectLightbox.scrollLock.active = false;
            window.scrollTo(0, y);
        },
        ensureProjectLightbox() {
            if (app.projectLightbox.element) return app.projectLightbox.element;

            $('body').append(`
                <div class="project-lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Expanded project image">
                    <div class="project-lightbox-panel">
                        <div class="project-lightbox-header">
                            <div class="project-lightbox-link-wrap"></div>
                            <button type="button" class="project-lightbox-close" aria-label="Close project image">close</button>
                        </div>
                        <div class="project-lightbox-title-row">
                            <button type="button" class="project-lightbox-nav project-lightbox-prev" aria-label="Previous project image">&larr;</button>
                            <p class="project-lightbox-title"></p>
                            <button type="button" class="project-lightbox-nav project-lightbox-next" aria-label="Next project image">&rarr;</button>
                        </div>
                        <div class="project-lightbox-frame">
                            <div class="project-lightbox-media-wrap"></div>
                        </div>
                        <p class="project-lightbox-description"></p>
                    </div>
                </div>
            `);

            app.projectLightbox.element = $('.project-lightbox');
            app.projectLightbox.element.on('click', event => {
                if ($(event.target).is('.project-lightbox, .project-lightbox-close')) {
                    app.functions.closeProjectLightbox();
                }
            });

            app.projectLightbox.element.on('click', '.project-lightbox-prev', () => {
                app.functions.navigateProjectLightbox('prev');
            });
            app.projectLightbox.element.on('click', '.project-lightbox-next', () => {
                app.functions.navigateProjectLightbox('next');
            });

            $(document).on('keydown', app.functions.handleProjectLightboxKeydown);
            return app.projectLightbox.element;
        },
        renderProjectLightboxItem() {
            const lightbox = app.functions.ensureProjectLightbox();
            const { items, index } = app.projectLightbox;

            if (!items.length || index < 0 || index >= items.length) {
                return;
            }

            const image = $(items[index]);
            const source = image.attr('src');
            const alt = image.attr('alt') || '';
            const title = image.data('projectTitle') || '';
            const description = image.data('projectDescription') || '';
            const externalLink = image.data('projectLink') || '';
            const canGoPrev = index > 0;
            const canGoNext = index < items.length - 1;

            const imageMarkup = `<img src="${source}" alt="${alt}" class="project-lightbox-media">`;
            const wrappedImage = externalLink
                ? `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="project-lightbox-image-link">${imageMarkup}</a>`
                : imageMarkup;
            lightbox.find('.project-lightbox-media-wrap').html(wrappedImage);
            lightbox.find('.project-lightbox-title').text(title);
            lightbox.find('.project-lightbox-description').text(description);
            lightbox.find('.project-lightbox-link-wrap').html(
                externalLink
                    ? `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="project-lightbox-link">${externalLink.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}</a>`
                    : ''
            );
            lightbox.find('.project-lightbox-prev').prop('disabled', !canGoPrev).attr('aria-disabled', (!canGoPrev).toString());
            lightbox.find('.project-lightbox-next').prop('disabled', !canGoNext).attr('aria-disabled', (!canGoNext).toString());
        },
        navigateProjectLightbox(direction) {
            if (!app.projectLightbox.element || !app.projectLightbox.element.hasClass('is-open')) {
                return;
            }

            const delta = direction === 'next' ? 1 : -1;
            const newIndex = app.projectLightbox.index + delta;
            if (newIndex < 0 || newIndex >= app.projectLightbox.items.length) {
                return;
            }

            app.projectLightbox.index = newIndex;
            app.functions.renderProjectLightboxItem();
        },
        openProjectLightbox(mediaElement) {
            const images = Array.from(document.querySelectorAll('.projects-container .project-image'));
            const index = images.indexOf(mediaElement);
            const lightbox = app.functions.ensureProjectLightbox();

            if (index === -1) {
                return;
            }

            app.projectLightbox.items = images;
            app.projectLightbox.index = index;
            app.projectLightbox.lastActiveElement = document.activeElement;
            app.projectLightbox.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
            app.functions.renderProjectLightboxItem();
            $('body').addClass('project-lightbox-open');
            app.functions.lockProjectPageScroll();
            lightbox.attr('aria-hidden', 'false').addClass('is-open');
            lightbox.find('.project-lightbox-close').trigger('focus');
        },
        closeProjectLightbox() {
            const lightbox = app.projectLightbox.element;
            if (!lightbox || !lightbox.hasClass('is-open')) return;

            const restoreY = app.projectLightbox.scrollLock.active
                ? app.projectLightbox.scrollLock.y
                : app.projectLightbox.lastScrollPosition;

            lightbox.removeClass('is-open').attr('aria-hidden', 'true');
            lightbox.find('.project-lightbox-media-wrap, .project-lightbox-link-wrap').empty();
            lightbox.find('.project-lightbox-title, .project-lightbox-description').text('');
            app.projectLightbox.items = [];
            app.projectLightbox.index = -1;
            $('body').removeClass('project-lightbox-open');
            app.functions.unlockProjectPageScroll();

            if (app.projectLightbox.lastActiveElement && typeof app.projectLightbox.lastActiveElement.focus === 'function') {
                try {
                    app.projectLightbox.lastActiveElement.focus({ preventScroll: true });
                } catch (_error) {
                    app.projectLightbox.lastActiveElement.focus();
                }
            }

            window.scrollTo(0, restoreY);
            requestAnimationFrame(() => window.scrollTo(0, restoreY));
        },
        handleProjectLightboxKeydown(event) {
            if (!app.projectLightbox.element || !app.projectLightbox.element.hasClass('is-open')) {
                return;
            }

            if (event.key === 'Escape') {
                app.functions.closeProjectLightbox();
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                app.functions.navigateProjectLightbox('prev');
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                app.functions.navigateProjectLightbox('next');
            }
        },
        projectImageClick(event) {
            const trigger = event.target.closest('.project-image-trigger, .project-image');
            if (!trigger) return;

            event.preventDefault();
            const image = trigger.classList.contains('project-image')
                ? trigger
                : trigger.querySelector('.project-image');

            if (!image) return;
            app.functions.openProjectLightbox(image);
        },
        projectDisplay(filter, expand) {
            if (filter && filter !== 'All' && app.elements.projectsAccordionToggle && app.elements.projectsAccordionPanel) {
                app.elements.projectsAccordionToggle.setAttribute('aria-expanded', 'true');
                app.elements.projectsAccordionPanel.removeAttribute('hidden');
                const icon = app.elements.projectsAccordionToggle.querySelector('img');
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
            app.projects.expand = expand;
            let projectArray = [];
            app.projects.filter = filter;
            let projectFilters = [];
            if (app.projects.data.length > 0) {
                app.elements.projectsErrorMessage.html(``);
                app.elements.projectsErrorMessage.removeClass("js-disabled-projects");
                app.elements.projectsErrorMessage.addClass("js-enabled-projects");
            }
            app.projects.data.forEach((project) => {
                project.tags.forEach((tag) => {
                    projectFilters = projectFilters.filter(filter => filter !== tag).concat([tag]);
                });
            });
            projectFilters = ["All", ...projectFilters.sort()]
            if (projectFilters.length > 3) {
                projectFilters = projectFilters.map((filter) => {
                    let filterName = '';
                    if (filter !== "All") {
                        filterName = `#` + filter;
                        if (filter === app.projects.filter) {
                            return `<li class="selected">`
                            + filterName
                            + `</li>`;
                        } else if (filter === "All") {
                            return `<li><button onclick="app.functions.projectDisplay('All', app.projects.expand);app.functions.scrollUp('projects')" title="All projects">`
                            + filterName
                            + `</button></li>`;
                        } else {
                            return `<li><button onclick="app.functions.projectDisplay('${filter}', app.projects.expand);app.functions.scrollUp('projects')" title="${filter} projects">`
                            + filterName
                            + `</button></li>`;
                        };
                    } else {
                        return ``;
                    }
                });
                let filterText = `Select tag to filter <img src="./assets/icons/filter.svg" alt="remove project filter icon" style="pointer-events: auto;"><hr/>`;
                if (app.projects.filter !== 'All') {
                    filterText = `<button onclick="app.functions.projectDisplay('All', app.projects.expand);app.functions.scrollUp('projects')" title="Remove project filter" class="project-button filter">Remove selected filter <img src="./assets/icons/filter-off.svg" alt="remove project filter icon" style="pointer-events: auto;"></button><hr/>`;
                }
                let sortText = `<button onclick="app.projects.data.reverse();app.projects.sort='oldest';app.functions.projectDisplay(app.projects.filter, app.projects.expand);app.functions.scrollUp('projects')" title="Sort oldest to newest" class="project-button sort">Sort oldest to newest <img src="./assets/icons/sort-desc.svg" alt="sort descending icon" style="pointer-events: auto;"></button>`;
                if (app.projects.sort === 'oldest') {
                    sortText = `<button onclick="app.projects.data.reverse();app.projects.sort='newest';app.functions.projectDisplay(app.projects.filter, app.projects.expand);app.functions.scrollUp('projects')" title="Sort newest to oldest" class="project-button sort">Sort newest to oldest <img src="./assets/icons/sort-asc.svg" alt="sort ascending icon" style="pointer-events: auto;"></button>`;
                }
                app.elements.projectsNav.html(
                    `<p>`
                    + sortText
                    + ` <br class="mobile-only"/>`
                    + filterText
                    + `</p>`
                    + `<ul class="project-filters">`
                    + projectFilters.reduce((accumulator, tag) => {
                        return accumulator + tag
                    })
                    + `</ul>`
                );
            };
            if (app.projects.filter == "All") {
                projectArray = app.projects.data;
            } else {
                projectArray = app.projects.data.filter((project) => project.tags.includes(app.projects.filter));
            };
            let formattedProjects = projectArray.map((project) => {
                let formattedProject = {
                    id: "",
                    heading: "",
                    description: "",
                    image: "",
                    tags: "",
                    site: "",
                    code: "",
                };
                formattedProject.heading = `<h3>${project.title}</h3>`;
                // Only show tags if filtering (not 'All').
                let showTags = app.projects.filter !== "All";
                let formattedTags = "";
                if (showTags) {
                    formattedTags = project.tags.map((tag) => {
                        if (tag === app.projects.filter) {
                            return `<button onclick="app.functions.projectDisplay('All', app.projects.expand);app.functions.scroll('projects')" class="selected tag">#` + tag + `</button>`;
                        } else {
                            return `<button onclick="app.functions.projectDisplay('${tag}', app.projects.expand);app.functions.scrollUp('projects')" class="tag">#` + tag + `</button>`;
                        }
                    }).join("");
                    formattedProject.tags = `<div class="tags">${formattedTags}</div>`;
                } else {
                    // Tags will be toggled by readMore if expanded
                    formattedProject.tags = `<div class="tags" style="display:none;">${project.tags.map((tag) => `<button onclick="app.functions.projectDisplay('${tag}', app.projects.expand);app.functions.scrollUp('projects')" class="tag">#${tag}</button>`).join("")}</div>`;
                }
                if (project.image) {
                    const projectDescription = Array.isArray(project.description) && project.description.length > 0
                        ? project.description.join(' ')
                        : '';
                    const imageJustify = typeof project['image-justify'] === 'string'
                        ? project['image-justify'].trim()
                        : '';
                    const imageJustifyStyle = imageJustify
                        ? ` style="object-position: ${imageJustify.replace(/\"/g, '&quot;')};"`
                        : '';
                    formattedProject.image = `<button type="button" class="project-image-trigger" aria-label="Expand image for `
                    + project.title
                    + `"><img src="`
                    + project.image
                    + `" class="project-image"`
                    + imageJustifyStyle
                    + ` data-project-title="`
                    + project.title
                    + `" data-project-description="`
                    + projectDescription
                    + `" data-project-link="`
                    + (project.site || '')
                    + `" alt="`
                    + project.title
                    + ` website screenshot"></button>`
                }
                if (project.description.length > 0) {
                    let formattedParagraph = project.description.reduce((accumulator, paragraph) => {
                        return accumulator
                        + `</br></br>`
                        + paragraph
                    });
                    formattedProject.description =
                        `<button class="button read-more" title="`
                        + project.title
                        + ` project description">About this project<img src="./assets/icons/expand-down.svg"  alt="expand description icon"></button><p>`
                        + formattedParagraph
                        + `</p>`
                }
                if (project.site) {
                    const siteLabel = project.site.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
                    formattedProject.site =
                        `<a href="${project.site}" target="_blank" class="button" title="${project.title} website">${siteLabel}<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };
                if (project.code) {
                    formattedProject.code =
                        `<a href="${project.code}" class="button" target="_blank" title="${project.title} repo on Github">Code<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };
                return `<div class="project" id="${project.id}">`
                + formattedProject.heading
                + formattedProject.image
                + `<div class="project-description">`
                + formattedProject.site
                + formattedProject.code
                + formattedProject.description
                + formattedProject.tags
                + `</div></div><hr class="classic-hr"/>`
            });
            app.elements.projectsContainer.html(formattedProjects.reduce((accumulator, project) => {
                return accumulator + project;
            }));
            document.querySelectorAll(".project-description").forEach((project) => {
                if (project.querySelector(".read-more")) {
                    let button = project.querySelector(".read-more");
                    let paragraph = project.querySelector("p");
                    button.addEventListener("click", () => app.functions.readMore(project, paragraph, button));
                };
            });
            if (app.projects.expand === true) {
                app.functions.readMoreAll();
            }
        },
        readMore(project, paragraph, button) {
            const tagsDiv = project.querySelector('.tags');
            if (!button.classList.contains('read-less')) {
                button.classList.add("read-less");
                button.innerHTML = `About this project<img src="./assets/icons/collapse-up.svg" alt="collapse description icon">`;
                project.classList.add("active");
                paragraph.style.maxHeight = (paragraph.scrollHeight + 30) + `px`;
                if (tagsDiv && app.projects.filter === "All") tagsDiv.style.display = "flex";
            } else {
                button.classList.remove("read-less");
                button.innerHTML = `About this project<img src="./assets/icons/expand-down.svg" alt="expand description icon">`;
                project.classList.remove("active");
                paragraph.style.maxHeight = 0;
                if (tagsDiv && app.projects.filter === "All") tagsDiv.style.display = "none";
                document.activeElement.blur();
            }
        },
        async openGalleryProject(id) {
            const exitFullscreen = document.exitFullscreen
                ? () => document.exitFullscreen()
                : document.webkitExitFullscreen
                    ? () => document.webkitExitFullscreen()
                    : null;

            const isGalleryFullscreen = document.fullscreenElement === app.elements.galleryContainer
                || document.webkitFullscreenElement === app.elements.galleryContainer;

            if (isGalleryFullscreen && exitFullscreen) {
                try {
                    await exitFullscreen();
                } catch (_error) {
                    // Continue with project navigation even if fullscreen exit fails.
                }
            }

            app.functions.projectDisplay('All', app.projects.expand);
            app.functions.readMoreByID(id);
            app.functions.scroll(id);
        },
        readMoreByID(id) {
            let project = document.getElementById(`${id}`);
            let button = project.querySelector(".read-more");
            setTimeout(() => {
                let project = document.getElementById(`${id}`);
                let button = project.querySelector(".read-more");
                button.click();
                console.log('log')
            }, 200);
            app.functions.projectDisplay(app.projects.filter, false);
        },
        readMoreAll() {
            let projects = document.querySelectorAll(`.project`);
            projects.forEach((project) => {
                let button = project.querySelector(".read-more");
                button.click();
            })
        }
    },
    events() {
        app.functions.renderGalleryControls();
        app.functions.setupHeadshotPixelation();

        if (app.elements.projectsAccordionToggle && app.elements.projectsAccordionPanel) {
            app.elements.projectsAccordionToggle.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                if (expanded) {
                    app.elements.projectsAccordionPanel.setAttribute('hidden', '');
                    this.querySelector('img').src = './assets/icons/arrow-up.svg';
                    this.querySelector('img').style.transform = 'rotate(180deg)';
                } else {
                    app.elements.projectsAccordionPanel.removeAttribute('hidden');
                    this.querySelector('img').src = './assets/icons/arrow-up.svg';
                    this.querySelector('img').style.transform = 'rotate(0deg)';
                }
            });
        }

        if (app.elements.galleryContainer) {
            app.elements.galleryContainer.addEventListener('wheel', (event) => {
                const scrollDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);

                if (scrollDelta === 0) {
                    return;
                }

                event.preventDefault();
                app.elements.galleryContainer.scrollLeft += scrollDelta;
            }, { passive: false });

            document.addEventListener('fullscreenchange', app.functions.updateGalleryFullscreenState);
            document.addEventListener('webkitfullscreenchange', app.functions.updateGalleryFullscreenState);
        }
        
        window.addEventListener('resize', () => {
            app.functions.galleryDisplay();
        });

        let h1HoverActive = false;
        function updateH1Hover() {
            if (window.matchMedia('(min-width: 970px)').matches) {
                if (!h1HoverActive) {
                    app.elements.h1.on('mouseenter.h1hover', function() {
                        app.functions.changeTitleText("dana rosamund teagle");
                    });
                    app.elements.h1.on('mouseleave.h1hover', function() {
                        app.functions.changeTitleText("dana teagle dot com");
                    });
                    h1HoverActive = true;
                }
            } else {
                if (h1HoverActive) {
                    app.elements.h1.off('.h1hover');
                    h1HoverActive = false;
                }
            }
        }
        updateH1Hover();
        window.addEventListener('resize', updateH1Hover);
        app.elements.mobileMenu.click(app.functions.toggleNav);
        document.querySelectorAll("nav ul li a").forEach((link) => link.addEventListener("click", app.functions.toggleNav));
        app.elements.scrollTopButton.click((e) => {
            e.preventDefault();
            app.functions.scroll("top");
        });
        app.elements.scrollDownButton.click((e) => {
            e.preventDefault();
            app.functions.scroll("about");
        });
        app.elements.scrollTitle.click((e) => {
            e.preventDefault();
            app.functions.scroll("about");
        });
        app.elements.headshotWrapper.click((e) => {
            app.elements.headshotWrapper.toggleClass("clicked");
            $("#ascii-toggle").toggleClass("highlight");
            if (app.elements.headshotWrapper.hasClass("clicked")) {
                $("#ascii-toggle").html(`<img src="./assets/icons/checkbox.svg" alt="Checked checkbox">IMG to ASCII`);
            } else {
                $("#ascii-toggle").html(`<img src="./assets/icons/checkbox-blank.svg" alt="Unchecked checkbox">IMG to ASCII`);
            }
        });
        app.elements.aboutLink.click((e) => {
            e.preventDefault();
            app.functions.scroll("about");
        });
        app.elements.galleryLink.click((e) => {
            e.preventDefault();
            app.functions.scroll("gallery");
        });
        app.elements.projectsLink.click((e) => {
            e.preventDefault();
            app.functions.scroll("projects");
        });
        app.elements.servicesLink.click((e) => {
            e.preventDefault();
            app.functions.scroll("services");
        });
        app.elements.contactLink.click((e) => {
            e.preventDefault();
            app.functions.scroll("contact");
        });
        app.elements.aboutToGallery.click((e) => {
            e.preventDefault();
            app.functions.scroll("gallery");
        });
        app.elements.aboutToServices.click((e) => {
            e.preventDefault();
            app.functions.scroll("services");
        });
        app.elements.aboutToTestimonial.click((e) => {
            e.preventDefault();
            app.functions.scroll("testimonial", 1);
        });
        app.elements.servicesToContact.click((e) => {
            e.preventDefault();
            app.functions.scroll("contact");
        });
        app.elements.projectsContainer.on('click', '.project-image-trigger, .project-image', app.functions.projectImageClick);

    },
    init() {
        if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
            fetch('./data/projects.json').then(response => response.json())
            .then((data) => {
                let projects = [];
                for (let object in data) {
                    let project = {
                        "title": object,
                        "id": "",
                        "year": "",
                        "image": "",
                        "tags": [],
                        "description": [],
                        "site": "",
                        "code": ""
                    }
                    for (let property in data[object]) {
                        project[property] = data[object][property];
                    };
                    projects.push(project);
                };
                app.projects.data = projects;
                app.functions.projectDisplay(app.projects.filter, app.projects.expand);
            })
            .catch(error => console.log(error));
            fetch('./data/gallery.json').then(response => response.json())
            .then((data) => {
                let gallery = [];
                for (let object in data) {
                    let item = {
                        "title": "",
                        "year": "",
                        "service": "",
                        "id": "",
                        "site": "",
                        "images": []
                    }
                    for (let property in data[object]) {
                        item[property] = data[object][property];
                    };
                    gallery.push(item);
                };
                app.gallery.data = app.functions.shuffleArray(gallery);
                app.functions.galleryDisplay();
            })
            .catch(error => console.log(error));
            fetch('./data/testimonials.json').then(response => response.json())
            .then((data) => {
                let testimonials = [];
                for (let object in data) {
                    let testimonial = {
                        "quote": "",
                        "cite": ""
                    }
                    for (let property in data[object]) {
                        testimonial[property] = data[object][property];
                    };
                    testimonials.push(testimonial);
                };
                app.testimonials.data = app.functions.shuffleArray(testimonials);
                app.testimonials.index = 0;
                app.functions.testimonialDisplay();
            })
            .catch(error => console.log(error));
        }
        app.events();
        if (localStorage['animations'] === 'false') {
            app.functions.toggleAnimations();
        }
        if (localStorage['dark-mode'] === 'false') {
            if (app.toggles.darkMode === true) {
                app.functions.toggleDarkMode();
            }
        } else {
            if (!app.elements.body.hasClass('dark-mode')) {
                app.elements.body.addClass('dark-mode');
                app.elements.darkModeToggle.addClass('selected');
                app.toggles.darkMode = true;
                app.elements.darkModeToggle.html('<img src="./assets/icons/checkbox.svg" alt="Checked checkbox">Dark Mode');
            }
        }
        setTimeout(() => {
            app.elements.body.toggleClass("loaded");
        }, 1000);
    },
};

$(document).ready(app.init);