const tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    links: {},
    functions: {
        linkDisplay() {
            const categories = Object.entries(tpl.links);
            const categoryMarkup = categories.map(([category]) => buildCategoryNavLink(category)).join("");
            const linkMarkup = categories.map(([category, links], index) => buildCategorySection(category, links, index)).join('<br/>');

            enableLinksMessage();
            tpl.tplCategories.html(`<ul>${categoryMarkup}</ul>`);
            tpl.tplLinks.html(linkMarkup);
            bindCategoryScrollLinks();
        },
    },
    init() {
        fetch("../data/links.json")
            .then(response => response.json())
            .then(data => {
                tpl.links = Object.entries(data).reduce((acc, [category, items]) => {
                    acc[category] = Object.entries(items).map(([title, props]) => ({
                        title,
                        description: props.description || "",
                        link: props.link || ""
                    }));
                    return acc;
                }, {});
                tpl.functions.linkDisplay();
            })
            .catch(error => console.log(error));
    }
};

function enableLinksMessage() {
    tpl.errorMessage.html("");
    tpl.errorMessage.removeClass("js-disabled").addClass("js-enabled");
}

function slugify(value) {
    return value.replace(/\s/g, "-");
}

function buildCategoryNavLink(category) {
    const categoryId = slugify(category);
    return `<li class="link-category"><a href="#${categoryId}">${category}<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`;
}

function buildLinkCard(link, categoryTag) {
    const description = link.description ? `<hr/><p class="button-description">${link.description}</p>` : "";
    return `<a class="button tpl-link ${categoryTag}" href="${link.link}" target="_blank"><span class="link-title"><p class="button-label">${link.title}</p><img src="../assets/icons/external-link.svg" alt="external link icon"></span>${description}</a>`;
}

function buildCategorySection(category, links, index) {
    const categoryTag = index % 2 === 0 ? "category-1" : "category-2";
    const heading = `<h3 id="${slugify(category)}">${category}</h3>`;
    const categoryLinks = links.map(link => buildLinkCard(link, categoryTag)).join("");

    return `${heading}${categoryLinks}`;
}

function bindCategoryScrollLinks() {
    tpl.tplCategories.off("click", ".link-category a");
    tpl.tplCategories.on("click", ".link-category a", function(e) {
        const targetId = $(this).attr("href").replace("#", "");
        const target = document.getElementById(targetId);

        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
}

function centerSelectedNavItem() {
    const tplNav = document.querySelector("html.tpl nav ul");

    if (!tplNav) {
        return;
    }

    const selected = tplNav.querySelector(".button.selected");

    if (selected && tplNav.scrollWidth > tplNav.clientWidth) {
        const selectedRect = selected.getBoundingClientRect();
        const navRect = tplNav.getBoundingClientRect();
        const selectedCenter = selectedRect.left + selectedRect.width / 2;
        const navCenter = navRect.left + navRect.width / 2;
        const scrollLeft = tplNav.scrollLeft + (selectedCenter - navCenter);

        tplNav.scrollTo({ left: scrollLeft, behavior: "auto" });
    }
}

$(document).ready(() => {
    tpl.init();
    centerSelectedNavItem();
});