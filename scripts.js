// app object
const app = {};

// app variables
app.hamburger = document.querySelector(`.hamburger-btn`);
app.hamburgerIcon = app.hamburger.querySelector(`i`);
app.navName = app.hamburger.querySelector('p');
app.navUl = document.querySelector(`nav ul`);
app.body = document.querySelector(`body`);
app.navLinks = app.navUl.querySelectorAll(`li a`);
app.projectDesc = document.querySelectorAll(`.project-description`)

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
        app.hamburger.blur();
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
}

// initialize app function
app.init = () => {
    app.events();
}

// initialize app
app.init();