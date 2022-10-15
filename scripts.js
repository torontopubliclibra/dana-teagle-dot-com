const hamburger = document.querySelector(`.hamburger-btn`);
const hamburgerIcon = hamburger.querySelector(`i`);
const navName = hamburger.querySelector('p');
const navUl = document.querySelector(`nav ul`);
const body = document.querySelector(`body`);
const navLinks = navUl.querySelectorAll(`li a`);

hamburger.addEventListener('click', () => {
    if(!navUl.style.display){
        hamburger.classList.add('hamburger-active');
        navUl.style.display = 'flex';
        body.classList.add('nav-open');
        navName.style.display = 'initial';
    } else {
        navUl.style.display = '';
        hamburgerIcon.style.transform = `rotate(initial)`;
        hamburgerIcon.style.transition = `0.4s`;
        hamburger.classList.remove('hamburger-active');
        body.classList.remove('nav-open');
        navName.style.display = '';
    }
})

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navUl.style.display = '';
        hamburgerIcon.style.transform = `rotate(initial)`;
        hamburgerIcon.style.transition = `0.4s`;
        hamburger.classList.remove('hamburger-active');
        body.classList.remove('nav-open');
        navName.style.display = '';
    })
})

const projectDesc = document.querySelectorAll(`.project-description`)
console.log(projectDesc);

projectDesc.forEach((project) => {
    const readMore = project.querySelector(`.read-more`);
    const paragraph = project.querySelector(`p`);
    readMore.addEventListener(`click`, () => {
        if (!paragraph.style.maxHeight){
            paragraph.style.maxHeight = paragraph.scrollHeight + 'px';
            paragraph.style.opacity = '100%'
            readMore.style.marginBottom = '20px';
            readMore.innerText = 'Read Less';
        } else {
            paragraph.style.maxHeight = '';
            paragraph.style.opacity = '0%';
            readMore.style.marginBottom = '';
            readMore.innerText = 'Read More';
            readMore.blur();
        }
    })
})