// app object
let app = {

    // page elements
    elements: {
        body: $("body"),
        about: $("#about"),
        hamButton: $(".hamburger-btn"),
        hamIcon: $(".ham-icon"),
        navName: $(".nav-name"),
        navUl: $("nav ul"),
        navLinks: $("nav ul li a"),
        scrollDownArrow: $(".scroll-down"),
        scrollTopButton: $(".scroll-to-top"),
        projects: $(".projects-container"),
        projectsNav: $(".projects-nav"),
    },

    // projects data and selected category
    projects: {
        data: [],
        category: "All",
    },

    // app functions
    functions: {

        // hamburger menu
        hamburger: () => {

            // if the nav is not open
            if(app.elements.navUl.css("display") === "none"){

                // open the nav
                app.elements.body.addClass("nav-open");
                app.elements.hamButton.addClass("hamburger-active");
                app.elements.navName.css({"visibility": "visible"})
                app.elements.hamIcon.css({
                    "transform": "rotate(90deg)"
                })
                app.elements.navUl.css({
                        "display": "flex",
                        "animation": "fade-in 0.4s",
                        "opacity": "1"
                    })

                // after the nav is finished opening (0.4s), remove the animation
                setTimeout(() => {app.elements.navUl.css({"animation": "none"})}, 400);

            // if the nav is open
            } else {

                // hide the nav
                app.elements.body.removeClass("nav-open");
                app.elements.hamButton.removeClass("hamburger-active");
                app.elements.navName.css({"visibility": "hidden"})
                app.elements.hamIcon.css({
                        "transform": "rotate(0deg)"
                    })
                app.elements.navUl.css({"animation": "fade-out 0.4s"});

                // after the nav is finished hiding (0.4s), reset the values
                setTimeout(() => {
                    app.elements.navUl.css({
                            "display": "none",
                            "animation": "none",
                            "opacity": "0",
                        })
                }, 400)
            }
        },

        // nav closing
        closeNav: () => {

            // reset the nav styling
            app.elements.body.removeClass("nav-open")
            app.elements.hamButton.removeClass("hamburger-active")
            app.elements.navName.css({"visibility": "hidden"})
            app.elements.hamIcon.css({"transform": "rotate(0deg)"})

            // if the window is bigger than the tablet breakpoint
            if (window.innerWidth >= 970) {

                // show the nav
                app.elements.navUl.css({
                    "display": "flex",
                    "opacity": "1"
                })
            
            // if the window is smaller
            } else {

                // hide the nav
                app.elements.navUl.css({
                    "display": "none",
                    "opacity": "0"
                })
            }
        },

        // scroll down button
        scrollDown: (section) => {

            // smoothly scroll down to the top of the specified section
            window.scrollTo({
                top: section.offset().top,
                behavior: "smooth",
            })
        },

        // scroll to top button
        scrollTop: () => {

            // smoothly scroll up to the top of the browser window
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        },
        
        // displaying the projects
        projectDisplay: (category) => {

            // save the parameter as the project category value
            app.projects.category = category

            // intialize the project categories array with just 'all'
            let projectCategories = ["All"]

            // for each project
            app.projects.data.forEach((project) => {

                // loop through the tech stack, and then for each language, if that language isn't already in the categories array, add it to the list
                project.stack.forEach((language) => {projectCategories = projectCategories.filter(item => item !== language).concat([language])})
            })

            // sort the project categories
            projectCategories = projectCategories.sort((a, b) => {
                // put 'all' first
                if (a === "All") {return -1}
                else if (b === "All") {return 1}
                // and then sort the rest alphabetically
                else {return a > b}
            })

            // if there are more than 3 project categories
            if (projectCategories.length > 3) {
                
                // map out those categories
                projectCategories = projectCategories.map((category) => {

                    // set the category name to an empty string
                    let categoryName = '';

                    // if the category parameter is 'all', save that as the category name
                    if (category === "All") {categoryName = category}

                    // if the category is anything else, save that as the category name with a hashtag in front of it
                    else {categoryName = `#` + category}

                    // if the category is already selected, create a span for that category with the selected class
                    if (category === app.projects.category) {return `<li class="selected">` + categoryName + `</li>`}

                    // otherwise create a link that displays the projects of that category
                    else {return `<li><a onclick="app.functions.projectDisplay('${category}')">` + categoryName + `</a></li>`}
                })

                // stitch the html for each of the categories together and add to the projects nav
                app.elements.projectsNav.html(`<p>Filter by:</p><ul class="project-categories">` + projectCategories.reduce((accumulator, language) => {return accumulator + language}) + `</ul></h3>`);
            }
            
            // initialize the project array
            let projectArray = []

            // then sort the projects by year
            let sortedByYear = app.projects.data.sort((a, b) => {
                if (b.year > a.year) {return 1}
                if (a.year < b.year) {return -1}
                else {return 0}
            })

            // if the selected category is 'all', fill the array with the sorted projects
            if (app.projects.category == "All") {projectArray = sortedByYear}

            // else fill the array with the sorted projects filtered by the selected category
            else {projectArray = sortedByYear.filter((project) => project.stack.includes(app.projects.category))}

            // map out the sorted projects to the page
            let formattedProjects = projectArray.map((project) => {

                // intialize an empty object for the formatted project
                let formattedProject = {
                    heading: "",
                    languages: "",
                    description: "",
                    site: "",
                    repo: "",
                }

                // format the project heading
                formattedProject.heading = `<h4>` + project.title + ` (` + project.year + `)</h4>`

                // format the project languages (sorted by year)
                formattedProject.languages = `<h5>[ ` + project.stack.sort().reduce((accumulator, language) => {return accumulator +  ` | ` + language}) + ` ]</h5>`

                // if the project description exists
                if (project.description.length > 0) {
                    
                    // format the paragraph
                    let formattedParagraph = project.description.reduce((accumulator, paragraph) => {return accumulator +  `</br></br>` + paragraph})

                    // and combine that paragraph with a read more button
                    formattedProject.description = `<button class="button read-more" title="Toggle project description">Read more</button><hr><p>` + formattedParagraph + `</p>`
                }

                // if the project has a site link, format a site button
                if (project.site) {formattedProject.site = `<a href="${project.site}" target="_blank" class="button" title="${project.title} website">Site link</a>`}

                // if the project has a repo link, format a repo button
                if (project.repo) {formattedProject.repo = `<a href="${project.repo}" class="button" target="_blank" title="${project.title} repo on Github">Repo link</a>`}

                // stitch together all the html for the project
                return `<div class="project">` + formattedProject.heading + formattedProject.languages + `<div class="project-details">` + formattedProject.site + formattedProject.repo + formattedProject.description + `</div></div>`
            })

            // stitch the html for each of the projects together and add that the projects container
            app.elements.projects.html(formattedProjects.reduce((accumulator, project) => {return accumulator + project}))

            // for each project details section
            document.querySelectorAll(".project-details").forEach((project) => {

                // if there's a read more button
                if (project.querySelector(".read-more")) {

                    // save the project description variables
                    let line = project.querySelector("hr")
                    let paragraph = project.querySelector("p")
                    let button = project.querySelector(".read-more")

                    // and on read more button click, run read more function
                    button.addEventListener("click", () => app.functions.readMore(line, paragraph, button))
                }
            })
        },

        // read more button
        readMore: (line, paragraph, button) => {

            // if the paragraph has no height
            if (!paragraph.style.maxHeight){

                // show the text and change the button to 'less'
                paragraph.style.maxHeight = paragraph.scrollHeight + 'px';
                line.style.display = "unset";
                line.style.opacity = "1";
                paragraph.style.opacity = "1";
                button.innerText = "Read less";

            // if the paragraph is showing
            } else {

                // hide the text and change the button to 'more'
                paragraph.style.maxHeight = '';
                line.style.opacity = "0";
                line.style.display = "none";
                paragraph.style.opacity = "0";
                button.innerText = "Read more";
                button.blur();
            }
        }
    },

    // app event listeners
    events: () => {

        // on the hamburger button click, run the hamburger function
        app.elements.hamButton.click(app.functions.hamburger);

        // for each of the nav list item links, close the nav on click
        document.querySelectorAll("nav ul li a").forEach((link) => link.addEventListener("click", app.functions.closeNav));

        // scroll up to top of browser window on button click
        app.elements.scrollTopButton.click(app.functions.scrollTop)

        // scroll down to top of about section on button click
        app.elements.scrollDownArrow.click(() => app.functions.scrollDown(app.elements.about))

        // when the browser window size changes
        window.addEventListener("resize", () => {

            // close the nav
            app.functions.closeNav();
        })
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
                        "year": "",
                        "stack": [],
                        "description": [],
                        "site": "",
                        "repo": ""
                    }

                    // then map each property in the initial object to the new object
                    for (let property in data[object]) {project[property] = data[object][property]}

                    // and push each project object into the projects array
                    projects.push(project)
                }

                // save the projects array to the project data
                app.projects.data = projects

                // display the projects on the page using the default category
                app.functions.projectDisplay(app.projects.category)
            })

            // console log any promise errors
            .catch(error => console.log(error))

        // add the event listeners
        app.events()
    }
}

// initialize the app
$(document).ready(function () {app.init()})