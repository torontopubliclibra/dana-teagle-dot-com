const tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    links: {},
    functions: {
        linkDisplay() {
            if (tpl.links) {
                tpl.errorMessage.html("");
                tpl.errorMessage.removeClass("js-disabled").addClass("js-enabled");
            }
            const linkCategories = Object.keys(tpl.links).map(category =>
                `<li class="link-category"><a href="#${category.replace(/\s/g, "-")}">${category}<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`
            );
            let categoryTag = "category-1";
            const formattedLinks = Object.entries(tpl.links).map(([category, links]) => {
                const heading = `<h3 id="${category.replace(/\s/g, "-")}">${category}</h3>`;
                const categoryLinks = links.map(link => {
                    const title = `<span class="link-title"><p class="button-label">${link.title}</p><img src="../assets/icons/external-link.svg" alt="external link icon"></span>`;
                    const href = `href="${link.link}"`;
                    const description = link.description ? `<hr/><p class="button-description">${link.description}</p>` : '';
                    return `<a class="button tpl-link ${categoryTag}" ${href} target="_blank">${title}${description}</a>`;
                });
                const html = [heading, ...categoryLinks].join("");
                categoryTag = categoryTag === "category-1" ? "category-2" : "category-1";
                return html;
            });
            tpl.tplCategories.html(`<ul>${linkCategories.join('')}</ul>`);
            tpl.tplLinks.html(formattedLinks.join('<br/>'));
            $(".link-category a").on("click", function(e) {
                const targetId = $(this).attr("href").replace('#', '');
                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: "smooth" });
                }
            });
        },
    },
    init() {
        fetch('../data/links.json')
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