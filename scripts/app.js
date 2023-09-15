// app object
let app = {

    // page elements
    elements: {
        body: $("body"),
        about: $("#about"),
        nav: $("nav"),
        hamburgerButton: $(".hamburger-btn"),
        scrollDownButton: $(".scroll-down"),
        scrollTopButton: $(".scroll-to-top"),
        projectsContainer: $(".projects-container"),
        projectsNav: $(".projects-nav"),
        projectDescription: $(".project-details")
    },

    // projects data and selected category
    projects: {
        data: [],
        category: "All",
    },

    // app functions
    functions: {

        // toggle classes to hide or show the nav
        toggleNav: () => {
            app.elements.body.toggleClass("nav-open");
            app.elements.nav.toggleClass("active");
        },

        // smoothly scroll to location
        scroll: (direction) => {

            // establish an empty variable
            let location = "";

            // if the direction is "top", set the location to the top of the page
            if (direction === "top") {location = 0}

            // if the direction is anything else, set the location to the top of that section
            else {location = app.elements[direction].offset().top}

            // smoothly scroll to the location
            window.scrollTo({top: location, behavior: "smooth"})

            // blur the button after scroll
            document.activeElement.blur();
        },

        // keyboard support for scroll
        scrollOnEnter: (keyCode, direction) => {

            // store the codes for both the key pressed and the enter key
            let key = keyCode;
            let enter = 13;
        
            // if a key is pressed but it is not the enter key, behave normally
            if (key && (key !== enter)) {return}
        
            // if a key is pressed and it is the enter key, scroll to the direction specified
            else {app.functions.scroll(direction)}
        },
        
        // displaying the projects
        projectDisplay: (category) => {

            // initialize the project array
            let projectArray = []

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

            // sort the projects by year
            let sortedByYear = app.projects.data.sort((a, b) => {
                if (b.year > a.year) {return 1}
                if (a.year < b.year) {return -1}
                else {return 0}
            })

            // if the selected category is 'all', fill the array with the sorted projects
            if (app.projects.category == "All") {projectArray = sortedByYear}

            // if the selected category is anything else, fill the array with the sorted projects, filtered by the selected category
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
                formattedProject.heading = `<h3>` + project.title + ` (` + project.year + `)</h3>`

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
            app.elements.projectsContainer.html(formattedProjects.reduce((accumulator, project) => {return accumulator + project}))

            // for each project details section
            document.querySelectorAll(".project-details").forEach((project) => {

                // if the project has a read more button
                if (project.querySelector(".read-more")) {

                    // store the button and paragraph in variables
                    let button = project.querySelector(".read-more")
                    let paragraph = project.querySelector("p")
    
                    // run the read more function on the click of the button
                    button.addEventListener("click", () => app.functions.readMore(project, paragraph, button))
                }
            })
        },

        // read more function
        readMore: (project, paragraph, button) => {

            // if the paragraph isn't showing
            if (!paragraph.style.maxHeight){

                // reveal the paragraph and change the button text
                button.classList.add("read-less");
                button.innerText = "Read less";
                project.classList.add("active");
                paragraph.style.maxHeight = paragraph.scrollHeight + `px`;

            // if the paragraph is showing
            } else {

                // hide the paragraph and change the button text
                button.classList.remove("read-less");
                button.innerText = "Read more";
                project.classList.remove("active");
                paragraph.style.maxHeight = "";
                
                // blur the button after paragraph is hidden
                document.activeElement.blur();
            }
        }
    },

    // app event listeners
    events: () => {

        // on the hamburger button click, run the hamburger function
        app.elements.hamburgerButton.click(app.functions.toggleNav);

        // for each of the nav list item links, toggle the nav on click
        document.querySelectorAll("nav ul li a").forEach((link) => link.addEventListener("click", app.functions.toggleNav));

        // scroll up to top of browser window on button click
        app.elements.scrollTopButton.click(() => app.functions.scroll("top"))

        // scroll down to top of about section on button click
        app.elements.scrollDownButton.click(() => app.functions.scroll("about"))
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