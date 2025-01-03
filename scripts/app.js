// app object
let app = {

    // page elements
    elements: {
        body: $("body"),
        about: $("#about"),
        nav: $("nav"),
        projects: $("#projects"),
        mobileMenu: $(".mobile-menu"),
        scrollDownButton: $(".scroll-down"),
        scrollTopButton: $(".scroll-to-top"),
        projectsContainer: $(".projects-container"),
        projectsNav: $(".projects-nav"),
        projectDescription: $(".project-description"),
        errorMessage: $(".js-disabled"),
        galleryContent: document.querySelector(".gallery-content"),
        pauseButton: document.querySelector(".pause-button"),
        galleryInfoItems: document.querySelectorAll(".gallery-item-info"),
    },

    // projects data and selected filter
    projects: {
        data: [],
        filter: "All",
    },

    // app functions
    functions: {

        // toggle classes to hide or show the nav
        toggleNav: () => {
            app.elements.body.toggleClass("nav-open");
            app.elements.nav.toggleClass("active");
        },

        // pause gallery on button click
        galleryPause: (playState) => {
            if (playState === 'pause') {
                app.elements.galleryContent.classList.add('paused');
                app.elements.pauseButton.innerHTML = `<a onclick="app.functions.galleryPause('unpause')">Click here to unpause</a>`

                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.add('reveal');
                })

            } else if (playState === 'unpause') {
                app.elements.galleryContent.classList.remove('paused');
                app.elements.pauseButton.innerHTML = `<a onclick="app.functions.galleryPause('pause')">Click here to pause</a>`

                app.elements.galleryInfoItems.forEach((item) => {
                    item.classList.remove('reveal');
                })
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
        projectDisplay: (filter) => {

            // initialize the project array
            let projectArray = [];

            // save the parameter as the filter
            app.projects.filter = filter;

            // intialize the filters array with just 'all'
            let projectFilters = [];

            if (app.projects.data) {
                app.elements.errorMessage.html(``);
                app.elements.errorMessage.removeClass("js-disabled");
                app.elements.errorMessage.addClass("js-enabled");
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
                    if (filter === "All") {
                        filterName = filter;

                    // if the filter is anything else, save that as the filter name with a hashtag in front of it
                    } else {
                        filterName = `#` + filter;
                    };

                    // if the filter is already selected, create a span for it with the selected class
                    if (filter === app.projects.filter) {
                        return `<li class="selected">`
                        + filterName
                        + `</li>`;

                    // otherwise create a link that displays the projects of that filter
                    } else if (filter === "All") {
                        return `<li><a onclick="app.functions.projectDisplay('All');app.functions.scroll('projects')" title="All projects">`
                        + filterName
                        + `</a></li>`;
                    } else {
                        return `<li><a onclick="app.functions.projectDisplay('${filter}')" title="${filter} projects">`
                        + filterName
                        + `</a></li>`;
                    };
                });

                // stitch the html for each of the filters together and add it to the projects nav
                app.elements.projectsNav.html(`
                    <p>Filter by technology:</p><ul class="project-filters">[ `
                    + projectFilters.reduce((accumulator, tag) => {
                        return accumulator + tag
                    })
                    + ` ]</ul></h3>`
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
                        return `<a onclick="app.functions.projectDisplay('All');app.functions.scroll('projects')" class="selected tag">#` + tag + `</a>`
                    } else {
                        return `<a onclick="app.functions.projectDisplay('${tag}')" class="tag">#` + tag + `</a>`
                    }
                })

                formattedProject.tags = `<div class="tags">` + formattedTags.reduce((accumulator, tag) => {
                    return accumulator + tag}) + `</div>`;
                
                if (project.image) {
                    formattedProject.image = `<img src="`
                    + project.image
                    + `" class="project-image" alt="`
                    + project.title
                    + ` screenshot">`
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
            app.functions.projectDisplay("All");
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

        // scroll up to top of browser window on button click
        app.elements.scrollTopButton.click(() => app.functions.scroll("top"));

        // scroll down to top of about section on button click
        app.elements.scrollDownButton.click(() => app.functions.scroll("about"));

    },
    
    // app initializion
    init: () => {

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
                app.functions.projectDisplay(app.projects.filter);
            })
            // console log any promise errors
            .catch(error => console.log(error));

        // add the event listeners
        app.events();
    },
};

// initialize the app
$(document).ready(() => {
    app.init();
});