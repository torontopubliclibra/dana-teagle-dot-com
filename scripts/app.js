// app object
let app = {

    // page elements
    elements: {
        body: $("body"),
        nav: $("nav"),
        mobileMenu: $(".mobile-menu"),
        about: $("#about"),
        gallery: $("#gallery"),
        projects: $("#projects"),
        services: $("#services"),
        contact: $("#contact"),
        aboutToGallery: $(".about-to-gallery"),
        aboutToServices: $(".about-to-services"),
        servicesToContact: $(".services-to-contact"),
        aboutLink: $("nav .about"),
        galleryLink: $("nav .gallery"),
        projectsLink: $("nav .projects"),
        servicesLink: $("nav .services"),
        contactLink: $("nav .contact"),
        scrollDownButton: $(".scroll-down"),
        scrollTopButton: $(".scroll-to-top"),
        projectsContainer: $(".projects-container"),
        projectsNav: $(".projects-nav"),
        projectDescription: $(".project-description"),
        projectsErrorMessage: $(".js-disabled-projects"),
        galleryContent: document.querySelector(".gallery-content"),
        galleryErrorMessage: $(".js-disabled-gallery"),
        pauseButton: document.querySelector(".pause-button"),
        galleryInfoItems: document.querySelectorAll(".gallery-item-info"),
    },

    // projects data and selected filter
    projects: {
        data: [],
        filter: "All",
        sort: "newest"
    },

    // gallery data
    gallery: {
        data: []
    },

    // app functions
    functions: {

        // toggle classes to hide or show the nav
        toggleNav: () => {
            app.elements.body.toggleClass("nav-open");
            app.elements.nav.toggleClass("active");
        },

        shuffleArray: (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        // pause gallery on button click
        galleryPause: (playState) => {
            if (playState === 'pause') {
                app.elements.galleryContent.classList.add('paused');
                app.elements.pauseButton.innerHTML = `<button onclick="app.functions.galleryPause('unpause')">unpause the gallery</button>`
                app.elements.galleryContent.style.animationPlayState = 'paused';

                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.add('reveal');
                })

            } else if (playState === 'unpause') {
                app.elements.galleryContent.classList.remove('paused');
                app.elements.pauseButton.innerHTML = `<button onclick="app.functions.galleryPause('pause')">pause the gallery</button>`
                app.elements.galleryContent.style.animationPlayState = 'running';

                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.remove('reveal');
                })
            }
        },

        galleryDisplay: () => {

            // initialize the gallery array
            let galleryArray = [];

            if (app.gallery.data.length > 0) {

                app.elements.galleryErrorMessage.html(``);
                app.elements.galleryErrorMessage.removeClass("js-disabled-gallery");
                app.elements.galleryErrorMessage.addClass("js-enabled-gallery");

                // map out the gallery to the page
                galleryArray = app.gallery.data.map((item) => {

                    // intialize an empty object for the formatted project
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
                        itemLinks.push(`<a href="#${item.id}" onclick="app.functions.projectDisplay('All', app.projects.sort); app.functions.readMoreByID('${item.id}')">Project info</a>`)
                    }

                    if (itemLinks.length > 0) {
                        formattedLinks = `<p>` + itemLinks.reduce((accumulator, item) => {return accumulator + ` | ` + item}) + `</p>`
                    }

                    // stitch together all the html for the item
                    if (formattedItem.multi) {
                        return `<div class="gallery-item multi">` + formattedItem.images + `<div class="gallery-item-info">` + formattedTitle + formattedService + formattedLinks + `<hr></div></div>`
                    } else {
                        return `<div class="gallery-item">` + formattedItem.images + `<div class="gallery-item-info">` + formattedTitle + formattedService + formattedLinks + `<hr></div></div>`
                    }
                });

                // stitch the html for each of the gallery items together and add that the gallery container
                app.elements.galleryContent.innerHTML= galleryArray.reduce((accumulator, item) => {
                    return accumulator + item;
                });
            }

            // Add CSS properties to the galleryContent element
            if (app.elements.galleryContent) {
                setTimeout(() => {
                    const galleryItems = document.querySelectorAll('.gallery-item');

                    let totalWidth = 0;
                    galleryItems.forEach(item => {
                        totalWidth += item.offsetWidth;
                    });

                    let galleryTransform = ((totalWidth / app.elements.galleryContent.offsetWidth) * 0.475) * 120;

                    // Create a new style element
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

                    // Remove any existing ticker animation styles
                    const existingStyle = document.getElementById('ticker-animation');
                    if (existingStyle) {
                        existingStyle.remove();
                    }

                    // Set an id for the new style element and append it to the head
                    style.id = 'ticker-animation';
                    document.head.appendChild(style);

                    app.elements.galleryContent.style.animation = 'ticker infinite 200s, fade-in 2s';
                    app.elements.galleryContent.style.animationTimingFunction = 'linear';
                    app.elements.galleryContent.style.animationPlayState = 'running';
                }, 1000);
            }
        },

        // smoothly scroll to location
        scroll: (direction) => {

            // establish an empty variable
            let location = "";

            // if the direction is "top", set the location to the top of the page
            if (direction === "top") {
                location = 0;
            // if the direction is anything else, set the location to the top of that section
            } else {
                location = app.elements[direction].offset().top;
            };

            // smoothly scroll to the location
            window.scrollTo({top: location, behavior: "smooth"});

            // blur the button after scroll
            document.activeElement.blur();
        },

        // keyboard support for scroll
        scrollOnEnter: (keyCode, direction) => {

            // store the codes for both the key pressed and the enter key
            let key = keyCode;
            let enter = 13;
        
            // if a key is pressed but it is not the enter key, behave normally
            if (key && (key !== enter)) {
                return;
            // if a key is pressed and it is the enter key, scroll to the direction specified
            } else {
                app.functions.scroll(direction);
            };
        },
        
        // displaying the projects
        projectDisplay: (filter, sort) => {

            // initialize the project array
            let projectArray = [];

            // save the filter parameter as the filter
            app.projects.filter = filter;

            // save the sort parameter as the sort
            app.projects.sort = sort;

            // intialize the filters array with just 'all'
            let projectFilters = [];

            if (app.projects.data.length > 0) {
                app.elements.projectsErrorMessage.html(``);
                app.elements.projectsErrorMessage.removeClass("js-disabled-projects");
                app.elements.projectsErrorMessage.addClass("js-enabled-projects");
            }

            // for each project
            app.projects.data.forEach((project) => {

                // loop through the tags, and then for each one, if that tag isn't already in the filter array, add it to the list
                project.tags.forEach((tag) => {
                    projectFilters = projectFilters.filter(filter => filter !== tag).concat([tag]);
                });
            });
            
            projectFilters = ["All", ...projectFilters.sort()]

            // if there are more than 3 project filters
            if (projectFilters.length > 3) {
                
                // map out those filters
                projectFilters = projectFilters.map((filter) => {

                    // set the filter name to an empty string
                    let filterName = '';

                    // if the parameter is 'all', save that as the filter
                    if (filter !== "All") {
                        filterName = `#` + filter;

                        // if the filter is already selected, create a span for it with the selected class
                        if (filter === app.projects.filter) {
                            return `<li class="selected">`
                            + filterName
                            + `</li>`;

                        // otherwise create a link that displays the projects of that filter
                        } else if (filter === "All") {
                            return `<li><button onclick="app.functions.projectDisplay('All'm app.projects.sort);app.functions.scroll('projects')" title="All projects">`
                            + filterName
                            + `</button></li>`;
                        } else {
                            return `<li><button onclick="app.functions.projectDisplay('${filter}', app.projects.sort)" title="${filter} projects">`
                            + filterName
                            + `</button></li>`;
                        };
                    } else {
                        return ``;
                    }
                });

                let filterText = `[ Select tag to filter ]`;

                let sortText = `[ <button onclick="app.functions.projectDisplay(app.projects.filter, 'oldest')" title="Sort oldest to newest" class="remove-filter-button">sort oldest to newest</button> ]`;

                if (app.projects.filter !== 'All') {
                    filterText = `[ <button onclick="app.functions.projectDisplay('All', app.projects.sort)" title="Remove project filter" class="remove-filter-button">remove filter</button> ]`;
                }

                if (app.projects.sort === 'oldest') {
                    sortText = `[ <button onclick="app.functions.projectDisplay(app.projects.filter, 'newest')" title="Sort newest to oldest" class="remove-filter-button">sort newest to oldest</button> ]`;
                }

                // stitch the html for each of the filters together and add it to the projects nav
                app.elements.projectsNav.html(
                    `<p>`
                    + sortText
                    + `<br/>`
                    + filterText
                    + `</p>`
                    + `<ul class="project-filters">`
                    + projectFilters.reduce((accumulator, tag) => {
                        return accumulator + tag
                    })
                    + `</ul>`
                );
            };

            // sort the projects by year
            let sortedByYear = app.projects.data.sort((a, b) => {
                if (b.year > a.year) {
                    return 1;
                } if (a.year < b.year) {
                    return -1;
                } else {
                    return 0;
                };
            });

            if (app.projects.sort === "oldest") {
                sortedByYear = sortedByYear.reverse();
            }

            // if the selected filter is 'all', fill the array with the sorted projects
            if (app.projects.filter == "All") {
                projectArray = sortedByYear;

            // if the selected filter is anything else, fill the array with the sorted projects, filtered by the selected filter
            } else {
                projectArray = sortedByYear.filter((project) => project.tags.includes(app.projects.filter));
            };

            // map out the sorted projects to the page
            let formattedProjects = projectArray.map((project) => {

                // intialize an empty object for the formatted project
                let formattedProject = {
                    id: "",
                    heading: "",
                    description: "",
                    image: "",
                    tags: "",
                    site: "",
                    code: "",
                };

                // format the project heading
                formattedProject.heading = `<h3>${project.title} (${project.year})</h3>`

                let formattedTags = project.tags.map((tag) => {
                    if (tag === app.projects.filter) {
                        return `<button onclick="app.functions.projectDisplay('All', app.projects.sort);app.functions.scroll('projects')" class="selected tag">#` + tag + `</button>`
                    } else {
                        return `<button onclick="app.functions.projectDisplay('${tag}', app.projects.sort)" class="tag">#` + tag + `</button>`
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

                // if the project description exists
                if (project.description.length > 0) {
                    
                    // format the paragraph
                    let formattedParagraph = project.description.reduce((accumulator, paragraph) => {
                        return accumulator
                        + `</br></br>`
                        + paragraph
                    });

                    // and combine that paragraph with a read more button
                    formattedProject.description =
                        `<button class="button read-more" title="`
                        + project.title
                        + ` project description">Read more<img src="./assets/icons/expand-down.svg"  alt="expand description icon"></button><p>`
                        + formattedProject.image
                        + formattedParagraph
                        + `</p>`
                }

                // if the project has a site link, format a site button
                if (project.site) {
                    formattedProject.site =
                        `<a href="${project.site}" target="_blank" class="button" title="${project.title} website">Site<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };

                // if the project has a code link, format a code button
                if (project.code) {
                    formattedProject.code =
                        `<a href="${project.code}" class="button" target="_blank" title="${project.title} repo on Github">Code<img src="./assets/icons/external-link.svg" alt="external link icon"></a>`
                    };

                // stitch together all the html for the project
                return `<div class="project" id="${project.id}">`
                + formattedProject.heading
                + `<div class="project-description">`
                + formattedProject.site
                + formattedProject.code
                + formattedProject.description
                + formattedProject.tags
                + `</div></div><hr class="classic-hr"/>`
            });

            // stitch the html for each of the projects together and add that the projects container
            app.elements.projectsContainer.html(formattedProjects.reduce((accumulator, project) => {
                return accumulator + project;
            }));

            // for each project details section
            document.querySelectorAll(".project-description").forEach((project) => {

                // if the project has a read more button
                if (project.querySelector(".read-more")) {

                    // store the button and paragraph in variables
                    let button = project.querySelector(".read-more");
                    let paragraph = project.querySelector("p");
    
                    // run the read more function on the click of the button
                    button.addEventListener("click", () => app.functions.readMore(project, paragraph, button));
                };
            });

            if (app.projects.filter !== "All") {
                app.functions.scroll("projects");
            }
        },

        allProjectsClick: () => {
            app.functions.projectDisplay("All", app.projects.sort);
            app.functions.scroll("projects");
        },

        // read more function
        readMore: (project, paragraph, button) => {

            // if the paragraph isn't showing
            if (!button.classList.contains('read-less')){

                // reveal the paragraph and change the button text
                button.classList.add("read-less");
                button.innerHTML = `Read less<img src="./assets/icons/collapse-up.svg" alt="collapse description icon">`;
                project.classList.add("active");
                paragraph.style.maxHeight = (paragraph.scrollHeight + 30) + `px`;

            // if the paragraph is showing
            } else {

                // hide the paragraph and change the button text
                button.classList.remove("read-less");
                button.innerHTML = `Read more<img src="./assets/icons/expand-down.svg" alt="expand description icon">`;
                project.classList.remove("active");
                paragraph.style.maxHeight = 0;
                document.activeElement.blur();
            }
        },

        // read more by ID function 
        readMoreByID: (id) => {

            let project = document.getElementById(`${id}`);
            let button = project.querySelector(".read-more");

            button.click();
        }
    },

    // app event listeners
    events: () => {

        // on the hamburger button click, run the hamburger function
        app.elements.mobileMenu.click(app.functions.toggleNav);

        // for each of the nav list item links, toggle the nav on click
        document.querySelectorAll("nav ul li a").forEach((link) => link.addEventListener("click", app.functions.toggleNav));

        // smooth scroll up to top of browser window on button click
        app.elements.scrollTopButton.click((e) => {
            e.preventDefault();
            app.functions.scroll("top");
        });

        // smooth scroll down to top of about section on button click
        app.elements.scrollDownButton.click((e) => {
            e.preventDefault();
            app.functions.scroll("about");
        });

        // smooth scroll to top of sections on nav link click
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
        app.elements.servicesToContact.click((e) => {
            e.preventDefault();
            app.functions.scroll("contact");
        });

    },
    
    // app initializion
    init: () => {

        // watch the screen width and console log when it changes
        window.addEventListener('resize', () => {
            app.functions.galleryDisplay();
        });

        if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
            // fetch the projects from the json file and send the response
            fetch('./data/projects.json').then(response => response.json())
            // then with the data
            .then((data) => {

                // set the projects to an empty array
                let projects = [];

                // and for each project in the data
                for (let object in data) {

                    // initialize a project object, setting the title to the object key
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

                    // then map each property in the initial object to the new object
                    for (let property in data[object]) {
                        project[property] = data[object][property];
                    };

                    // and push each project object into the projects array
                    projects.push(project);
                };

                // save the projects array to the project data
                app.projects.data = projects;

                // display the projects on the page using the default filter
                app.functions.projectDisplay(app.projects.filter, app.projects.sort);
            })
            // console log any promise errors
            .catch(error => console.log(error));

            // fetch the gallery data from the json file and send the response
            fetch('./data/gallery.json').then(response => response.json())
            // then with the data
            .then((data) => {

                // set the gallery to an empty array
                let gallery = [];

                // and for each item in the data
                for (let object in data) {

                    // initialize an item object, setting the title to the object key
                    let item = {
                        "title": "",
                        "year": "",
                        "service": "",
                        "id": "",
                        "site": "",
                        "images": []
                    }

                    // then map each property in the initial object to the new object
                    for (let property in data[object]) {
                        item[property] = data[object][property];
                    };

                    // and push each item into the gallery array
                    gallery.push(item);
                };

                // save the gallery array to the item data
                app.gallery.data = app.functions.shuffleArray(gallery);

                app.functions.galleryDisplay();
            })
            // console log any promise errors
            .catch(error => console.log(error));
        }

        // add the event listeners
        app.events();
    },
};

// initialize the app
$(document).ready(() => {
    app.init();
});