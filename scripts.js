// app object
const app = {};

// app variables
app.body = document.querySelector(`body`);
app.hamburger = document.querySelector(`.hamburger-btn`);
app.hamburgerIcon = app.hamburger.querySelector(`i`);
app.navName = app.hamburger.querySelector('p');
app.navUl = document.querySelector(`nav ul`);
app.body = document.querySelector(`body`);
app.aboutSection = document.querySelector('.about');
app.navLinks = app.navUl.querySelectorAll(`li a`);
app.scrollDownBtn = document.querySelector(`.scroll-down`);
app.scrollTopBtn = document.querySelector(`.scroll-to-top`);
app.projectDesc = [];
app.projectsContainer = document.querySelector(`.projects-container`);
app.projectCategories = document.querySelector(`.project-categories`);
app.projectSort = "all";
app.sortedProjects = ``;
app.projects = [
    {
        title: "queer walk/pytheas",
        year: "2023",
        stack: ["react", "typescript", "css"],
        description: ""
    },
    {
        title: "trans i.d.",
        year: "2022 - present",
        stack: ["vue", "typescript", "sass"],
        description: ""
    },
    {
        title: "superhero showdown",
        year: "2022",
        stack: ["react", "css"],
        description: "Superhero Showdown is a statistics-based online card game that I built during the Juno Web Development bootcamp in October and November 2022. On game start, 20 superhero character objects with various statistics are pulled from the database, shuffled, and dealt into two decks of 10 cards—one for the player and one for the computer. Each round, the player chooses the stat from their card that they think is bigger than the computer's and the winner gets both cards. Gameplay continues until one deck is out of cards. The site was built as a single-page application using the React library, using data pulled from the Marvel Database Wiki and stored in Firebase."
    },
    {
        title: "the pigeon hole",
        year: "2022",
        stack: ["html", "jquery", "css"],
        description: "The Pigeon Hole is an API project that I built during the Juno JavaScript course in July 2022. This app demonstrates the globe-spanning urban habitats and biodiversity of my favourite bird, displaying photos of pigeons in different cities based on the user's selection or by random. Functionally, the site makes an Ajax request to the Flickr API for the 10 most relevant photos in the selected or randomized city, then randomly selects one image and adds that image to the page through DOM manipulation."
    },
    {
        title: "sydney gautreau website",
        year: "2022",
        stack: ["html", "javascript", "sass"],
        description: "For Sydney Gautreau, Editor & Writing Coach, I built a multi-page site using HTML, SASS, and Javascript. The website uses a clean and responsive interface that puts the focus on the content. It was designed in collaboration with the client to express her personality within a professional-looking layout. Features include a Javascript hamburger menu and a contact form."
    }
]

// mobile hamburger nav function
app.hamburgerFunction = () => {

    // if nav is not showing
    if(!app.navUl.style.display){

        // open nav
        app.hamburger.classList.add('hamburger-active');
        app.navUl.style.display = 'flex';
        app.body.classList.add('nav-open');
        app.navUl.style.animation = 'fade-in 0.4s';
        app.navUl.style.opacity = '1';

        // after nav is finished opening
        setTimeout(function(){

            // remove animation
            app.navUl.style.animation = '';

        }, 400)

    // if nav is showing
    } else {

        // hide nav
        app.hamburgerIcon.style.transform = `rotate(initial)`;
        app.hamburgerIcon.style.transition = `0.4s`;
        app.hamburger.classList.remove('hamburger-active');
        app.body.classList.remove('nav-open');
        app.navUl.style.animation = 'fade-out 0.4s';

        // after nav is finished hiding
        setTimeout(function(){

            // remove animation, opacity, and display values
            app.navUl.style.opacity = '0';
            app.navUl.style.display = '';
            app.navUl.style.animation = '';
            app.hamburgerIcon.style.transition = '';

        }, 400)
    }
}

// close mobile nav function
app.closeNav = () => {
    app.navUl.style.display = '';
    app.hamburgerIcon.style.transform = `rotate(initial)`;
    app.hamburgerIcon.style.transition = `0.4s`;
    app.hamburger.classList.remove('hamburger-active');
    app.body.classList.remove('nav-open');
    app.navName.style.display = '';
}

// scroll down function
app.scrollDown = () => {
    let aboutTop = app.aboutSection.offsetTop;

    // smoothly scroll down to top of about section
    window.scrollTo({
        top: aboutTop,
        behavior: `smooth`,
    });
}

app.scrollDownOnFocus = (event) => {
    const keyCode = event.keyCode;
    const enterKeyCode = 13; 

    // if a key is pressed but it is not enter then behave normally
    if (keyCode && keyCode !== enterKeyCode) {
        return;

    // if a key is pressed and it is enter scroll down
    } else {
        app.scrollDown();
    }
}

// scroll to top function
app.scrollTop = () => {

    // smoothly scroll up to top of window
    window.scrollTo({
        top: 0,
        behavior: `smooth`,
    });
}

app.scrollTopOnFocus = (event) => {
    const keyCode = event.keyCode;
    const enterKeyCode = 13; 

    // if a key is pressed but it is not enter then behave normally
    if (keyCode && keyCode !== enterKeyCode) {
        return;

    // if a key is pressed and it is enter scroll down
    } else {
        app.scrollTop();
    }
}

// projects
app.projectLoop = (category) => {

    app.projectSort = category;

    let projectCategories = ['all'];

    app.projects.forEach((project) => {
        project.stack.forEach((language) => {
            projectCategories = projectCategories.filter(item => item !== language).concat([language])
        })
    });

    projectCategories = projectCategories.sort();

    projectCategories = projectCategories.map((language) => {
        if (language === app.projectSort) {
            return `<span class="selected">${language}</span>`
        } else {
            return `<a onclick="app.projectLoop('${language}')">${language}</a>`
        }
    })

    app.projectCategories.innerHTML = projectCategories.reduce((accumulator, language) => {
        return accumulator +  ' | ' + language
    })

    let projectArray = [];

    sortProjects = (projectArray) => {
        app.sortedProjects = projectArray.map((project, index) => {
            let languages = project.stack.reduce((accumulator, language) => {
                return accumulator +  ' | ' + language
            });
            return `<div class='project ${index}'>
                <h4>${project.title} (${project.year})</h4>
                <h5>${languages}</h5>
                <div class="project-links">
                    <a href="" target="_blank" class="button live" title="Pigeon Pad site">View Live</a>
                    <a href="" class="button code" target="_blank" title="Pigeon Pad on GitHub">View Code</a>
                </div>
                <div class="project-description">
                    <button class="button read-more">Read More</button>
                    <p>${project.description}</p>
                </div>
            </div>
        `})
    }

    if (app.projectSort == "all"){
        projectArray = app.projects;
    } else {
        projectArray = app.projects.filter((project) => project.stack.includes(app.projectSort));
    }

    sortProjects(projectArray);

    app.projectsContainer.innerHTML = app.sortedProjects.reduce((accumulator, project) => {
        return accumulator + project;
    });

    app.projectDesc = document.querySelectorAll(`.project-description`);
}

// project read more button function
app.readMore = function(paragraph, button) {

    // if the paragraph has no height
    if (!paragraph.style.maxHeight){

        // reveal text and change button
        paragraph.style.maxHeight = paragraph.scrollHeight + 'px';
        paragraph.style.opacity = '100%'
        button.style.marginBottom = '20px';
        button.innerText = 'Read Less';

    // if the paragraph is showing
    } else {

        // hide text and change button
        paragraph.style.maxHeight = '';
        paragraph.style.opacity = '0%';
        button.style.marginBottom = '';
        button.innerText = 'Read More';
        button.blur();
    }
}

// app event listeners
app.events = () => {

    // on hamburger button click, run hamburger function
    app.hamburger.addEventListener('click', app.hamburgerFunction);

    // for each nav list item link, close nav on click
    app.navLinks.forEach((link) => {
        link.addEventListener('click', app.closeNav)
    })

    // for each project description
    app.projectDesc.forEach((project) => {

        // project description variables
        const paragraph = project.querySelector(`p`);
        const button = project.querySelector(`.read-more`);

        // on button click, run read more function using the paragraph and button variables
        button.addEventListener(`click`, () => app.readMore(paragraph, button));
    })

    // scroll up to top on button click
    app.scrollTopBtn.addEventListener('click', app.scrollTop);

    // scroll down to about section on button click
    app.scrollDownBtn.addEventListener('click', app.scrollDown);

    // show nav when screen embiggens
    window.addEventListener("resize", () => {

        // if window is larger than mobile breakpoint
        if (window.innerWidth >= 768) {

            // display nav
            app.navUl.style.display = 'flex';
            app.navUl.style.opacity = '1';

        // if window is smaller than mobile breakpoint
        } else {

            // hide nav by default
            app.navUl.style.display = '';
            app.navUl.style.opacity = '0';
        }
    })
}

// initialize app function
app.init = () => {
    app.projectLoop(app.projectSort);

    // add event listeners
    app.events();
}

// initialize app
app.init();