const tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    links: {},
    functions: {
        linkDisplay() {
            const formattedLinks = [];
            const linkCategories = Object.keys(tpl.links).map(category =>
                `<li class="link-category"><a href="#${category.replace(/\s/g, "-")}">${category}<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`
            );
            if (tpl.links) {
                tpl.errorMessage.html("");
                tpl.errorMessage.removeClass("js-disabled");
                tpl.errorMessage.addClass("js-enabled");
            }
            let categoryTag = "category-1";
            for (const category in tpl.links) {
                const heading = `<h3 id="${category.replace(/\s/g, "-")}">${category}</h3>`;
                const categoryLinks = [heading];
                tpl.links[category].forEach(link => {
                    const title = `<span class="link-title"><p class="button-label">${link.title}</p><img src="../assets/icons/external-link.svg" alt="external link icon"></span>`;
                    const href = `href="${link.link}"`;
                    const description = link.description ? `<hr/><p class="button-description">${link.description}</p>` : '';
                    categoryLinks.push(`<a class="button tpl-link ${categoryTag}" ${href} target="_blank">${title}${description}</a>`);
                });
                formattedLinks.push(categoryLinks.join(''));
                categoryTag = categoryTag === "category-1" ? "category-2" : "category-1";
            }
            tpl.tplCategories.html(`<ul>${linkCategories.join('')}</ul>`);
            tpl.tplLinks.html(formattedLinks.join('<br/>'));
        },
    },
    init() {
        fetch('../data/links.json')
            .then(response => response.json())
            .then(data => {
                const links = {};
                for (const object in data) {
                    links[object] = [];
                    for (const item in data[object]) {
                        const link = {
                            title: item,
                            description: "",
                            link: ""
                        };
                        Object.assign(link, data[object][item]);
                        links[object].push(link);
                    }
                }
                tpl.links = links;
                tpl.functions.linkDisplay();
            })
            .catch(error => console.log(error));
    }
};

$(document).ready(() => {
    tpl.init();
    const tplNav = document.querySelector('html.tpl nav ul');
    if (tplNav) {
        const selected = tplNav.querySelector('.button.selected');
        if (selected && tplNav.scrollWidth > tplNav.clientWidth) {
            const selectedRect = selected.getBoundingClientRect();
            const navRect = tplNav.getBoundingClientRect();
            const selectedCenter = selectedRect.left + selectedRect.width / 2;
            const navCenter = navRect.left + navRect.width / 2;
            const scrollLeft = tplNav.scrollLeft + (selectedCenter - navCenter);
            tplNav.scrollTo({ left: scrollLeft, behavior: 'auto' });
        }
    }
});