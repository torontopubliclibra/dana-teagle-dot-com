// share object
let share = {

    // share categories element
    shareCategories: $(".share-categories"),

    // error message element
    errorMessage: $(".js-disabled-share"),

    // share links element
    shareLinks: $(".share-links"),

    // links data
    links: {},

    // share functions
    functions: {
        
        // displaying the projects
        linkDisplay: () => {

            let formattedLinks = [];

            let linkCategories = [...Object.keys(share.links)].map((category) => {
                return `<li class="link-category"><a href="#` + category.replace(/\s/g, "-") + `">${category}</a></li>`;
            });

            if (share.links) {
                share.errorMessage.html(``);
                share.errorMessage.removeClass("js-disabled");
                share.errorMessage.addClass("js-enabled");
            }

            for (let category in share.links) {

                let heading = `<h3 id=` + category.replace(/\s/g, "-") + `>${category}</h3>`

                let categoryLinks = [heading];

                share.links[category].forEach((link) => {

                    let title = `<span class="link-title"><p class="button-label">${link.title}</p><img src="./assets/icons/external-link.svg"></span>`;
                    let href = `href="${link.link}"`;
                    let description = ``;

                    if (link.description) {
                        description = `<hr/><p class="button-description">${link.description}</p>`
                    }

                    // stitch together all the html for the project
                    categoryLinks.push(`<a class="button share-link"${href} target="_blank">${title}${description}</a>`)

                })

                formattedLinks.push(categoryLinks.reduce((accumulator, link) => {
                    return accumulator + link;
                }));
            }

            share.shareCategories.html(`<ul>` + linkCategories.reduce((accumulator, category) => {
                return accumulator + category;
            }) + `</ul>`);

            share.shareLinks.html(formattedLinks.reduce((accumulator, category) => {
                return accumulator + `<br/>` + category;
            }));
        },
    },
    
    // share initializion
    init: () => {

        // fetch the projects from the json file and send the response
        fetch('./data/share-links.json').then(response => response.json())
            // then with the data
            .then((data) => {

                // set the projects to an empty array
                let links = {};

                for (let object in data) {

                    links[object] = [];

                    // and for each item in the object
                    for (let item in data[object]) {

                        // initialize a link object, setting the title to the object key
                        let link = {
                            "title": item,
                            "description": "",
                            "link": ""
                        }

                        // then map each property in the initial item to the new item
                        for (let property in data[object][item]) {
                            link[property] = data[object][item][property];
                        };

                        // and push each item object into the links array
                        links[object].push(link);
                    };

                }

                // save the projects array to the project data
                share.links = links;

                // display the projects on the page using the default filter
                share.functions.linkDisplay();
            })
            // console log any promise errors
            .catch(error => console.log(error));
    },
};

// initialize the share
$(document).ready(() => {
    share.init();
});