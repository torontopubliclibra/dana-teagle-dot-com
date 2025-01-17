// tpl object
let tpl = {

    // categories element
    tplCategories: $(".tpl-categories"),

    // error message element
    errorMessage: $(".js-disabled-tpl"),

    // tpl links element
    tplLinks: $(".tpl-links"),

    // links data
    links: {},

    // tpl functions
    functions: {
        
        // displaying the projects
        linkDisplay: () => {

            let formattedLinks = [];

            let linkCategories = [...Object.keys(tpl.links)].map((category) => {
                return `<li class="link-category"><a href="#` + category.replace(/\s/g, "-") + `">${category}<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`;
            });

            if (tpl.links) {
                tpl.errorMessage.html(``);
                tpl.errorMessage.removeClass("js-disabled");
                tpl.errorMessage.addClass("js-enabled");
            }

            let categoryTag = "category-1";

            for (let category in tpl.links) {

                let heading = `<h3 id=` + category.replace(/\s/g, "-") + `>${category}</h3>`

                let categoryLinks = [heading];

                tpl.links[category].forEach((link) => {

                    let title = `<span class="link-title"><p class="button-label">${link.title}</p><img src="../assets/icons/external-link.svg"  alt="external link icon"></span>`;
                    let href = `href="${link.link}"`;
                    let description = ``;

                    if (link.description) {
                        description = `<hr/><p class="button-description">${link.description}</p>`
                    }

                    // stitch together all the html for the project
                    categoryLinks.push(`<a class="button tpl-link ${categoryTag}"${href} target="_blank">${title}${description}</a>`)

                })

                formattedLinks.push(categoryLinks.reduce((accumulator, link) => {
                    return accumulator + link;
                }));

                if (categoryTag == "category-1") {
                    categoryTag = "category-2";
                } else {
                    categoryTag = "category-1";
                }
            }

            tpl.tplCategories.html(`<h2>Jump to</h2>` + `<ul>` + linkCategories.reduce((accumulator, category) => {
                return accumulator + category;
            }) + `</ul>`);

            tpl.tplLinks.html(formattedLinks.reduce((accumulator, category) => {
                return accumulator + `<br/>` + category;
            }));
        },
    },
    
    // tpl initializion
    init: () => {

        if (window.location.pathname === "/tpl/" || window.location.pathname === "/tpl/index.html") {

            // fetch the projects from the json file and send the response
            fetch('../data/tpl-links.json').then(response => response.json())
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
                tpl.links = links;

                // display the projects on the page using the default filter
                tpl.functions.linkDisplay();
            })
            // console log any promise errors
            .catch(error => console.log(error));

        };
    },
};

// initialize the tpl
$(document).ready(() => {
    tpl.init();
});