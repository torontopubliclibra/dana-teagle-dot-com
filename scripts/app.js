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
        galleryContent: document.querySelector(".gallery-content"),
        galleryErrorMessage: $(".js-disabled-gallery"),
        pauseButton: document.querySelector(".pause-button"),
        galleryInfoItems: document.querySelectorAll(".gallery-item-info"),
        testimonial: $("#services blockquote"),
        testimonialsButton: document.querySelector(".testimonials-button"),
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
                app.elements.pauseButton.innerHTML = `<button onclick="app.functions.galleryPause('unpause')">Unpause the gallery <img src="./assets/icons/play.svg" alt="unpause gallery icon" style="pointer-events: auto;"></button>`
                app.elements.galleryContent.style.animationPlayState = 'paused';
                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.add('reveal');
                })
                app.gallery.paused = true;
            } else if (playState === 'unpause') {
                app.elements.galleryContent.classList.remove('paused');
                app.elements.pauseButton.innerHTML = `<button onclick="app.functions.galleryPause('pause')">Pause the gallery <img src="./assets/icons/pause.svg" alt="pause gallery icon" style="pointer-events: auto;"></button>`
                app.elements.galleryContent.style.animationPlayState = 'running';
                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.remove('reveal');
                })
                app.gallery.paused = false;
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
                        itemLinks.push(`<a href="${item.site}" target="_blank" title="${item.title} website">Site</a>`)
                    }
                    if (item.instagram) {
                        itemLinks.push(`<a href="${item.instagram}" target="_blank" title="${item.title} instagram">Instagram</a>`)
                    }
                    if (item.id) {
                        itemLinks.push(`<button onclick="app.functions.projectDisplay('All', app.projects.expand); app.functions.readMoreByID('${item.id}'); app.functions.scroll('${item.id}')">Project info</button>`)
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
                });
            }
            if (app.elements.galleryContent) {
                setTimeout(() => {
                    const galleryItems = document.querySelectorAll('.gallery-item');
                    let totalWidth = 0;
                    galleryItems.forEach(item => {
                        totalWidth += item.offsetWidth;
                    });
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
                }, 1000);
            }
        },
        testimonialDisplay() {
            app.elements.testimonial.html(`<p><span class="quote-marks">“</span>${app.testimonials.data[app.testimonials.index].quote}<span class="quote-marks">”</span></p><cite>${app.testimonials.data[app.testimonials.index].cite}</cite>`);
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
            if (direction === "top") {
                location = 0;
                window.scrollTo({top: location, behavior: "smooth"});
                history.pushState(null, null, ' ');
            } else {
                location = $(`#${direction}`).offset().top;
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
                formattedProject.heading = `<h3>${project.title} (${project.year})</h3>`
                let formattedTags = project.tags.map((tag) => {
                    if (tag === app.projects.filter) {
                        return `<button onclick="app.functions.projectDisplay('All', app.projects.expand);app.functions.scroll('projects')" class="selected tag">#` + tag + `</button>`
                    } else {
                        return `<button onclick="app.functions.projectDisplay('${tag}', app.projects.expand);app.functions.scrollUp('projects')" class="tag">#` + tag + `</button>`
                    }
                })
                formattedProject.tags = `<div class="tags">` + formattedTags.reduce((accumulator, tag) => {
                    return accumulator + tag}) + `</div>`;
                if (project.image) {
                    formattedProject.image = `<img src="`
                    + project.image
                    + `" class="project-image" alt="`
                    + project.title
                    + ` website screenshot">`
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
                        + ` project description" style="margin-left: 5px;">Read more<img src="./assets/icons/expand-down.svg"  alt="expand description icon"></button><p>`
                        + formattedProject.image
                        + formattedParagraph
                        + `</p>`
                }
                if (project.site) {
                    formattedProject.site =
                        `<a href="${project.site}" target="_blank" class="button" title="${project.title} website" style="margin-right: 5px;">Website<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };
                if (project.code) {
                    formattedProject.code =
                        `<a href="${project.code}" class="button" target="_blank" title="${project.title} repo on Github">Code<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };
                return `<div class="project" id="${project.id}">`
                + formattedProject.heading
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
            if (!button.classList.contains('read-less')){
                button.classList.add("read-less");
                button.innerHTML = `Read less<img src="./assets/icons/collapse-up.svg" alt="collapse description icon">`;
                project.classList.add("active");
                paragraph.style.maxHeight = (paragraph.scrollHeight + 30) + `px`;
            } else {
                button.classList.remove("read-less");
                button.innerHTML = `Read more<img src="./assets/icons/expand-down.svg" alt="expand description icon">`;
                project.classList.remove("active");
                paragraph.style.maxHeight = 0;
                document.activeElement.blur();
            }
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
            app.functions.scroll("testimonial");
        });
        app.elements.servicesToContact.click((e) => {
            e.preventDefault();
            app.functions.scroll("contact");
        });

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