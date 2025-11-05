let tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    links: {},
    functions: {
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
            tpl.tplCategories.html(`<ul>` + linkCategories.reduce((accumulator, category) => {
                return accumulator + category;
            }) + `</ul>`);
            tpl.tplLinks.html(formattedLinks.reduce((accumulator, category) => {
                return accumulator + `<br/>` + category;
            }));
        },
    },
    init: () => {
        fetch('../data/links.json').then(response => response.json())
        .then((data) => {
            let links = {};
            for (let object in data) {
                links[object] = [];
                for (let item in data[object]) {
                    let link = {
                        "title": item,
                        "description": "",
                        "link": ""
                    }
                    for (let property in data[object][item]) {
                        link[property] = data[object][item][property];
                    };
                    links[object].push(link);
                };
            }
            tpl.links = links;
            tpl.functions.linkDisplay();
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tpl.init();
});