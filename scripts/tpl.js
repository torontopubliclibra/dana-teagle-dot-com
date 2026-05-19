const tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    links: {},
    functions: {
        setupRustyPixelation() {
            const rustyImages = document.querySelectorAll("html.tpl .tpl-landing img.rusty, html.tpl main.tpl-subpage img.rusty");
            if (!rustyImages.length) {
                return;
            }

            rustyImages.forEach((rustyImage) => {
                if (rustyImage.closest(".rusty-pixel-wrapper")) {
                    return;
                }

                const wrapper = document.createElement("span");
                wrapper.className = "rusty-pixel-wrapper";
                rustyImage.parentNode.insertBefore(wrapper, rustyImage);
                wrapper.appendChild(rustyImage);

                const pixelCanvas = document.createElement("canvas");
                pixelCanvas.className = "rusty-pixel-canvas";
                pixelCanvas.setAttribute("aria-hidden", "true");
                wrapper.appendChild(pixelCanvas);

                const pixelContext = pixelCanvas.getContext("2d");
                const workingCanvas = document.createElement("canvas");
                const workingContext = workingCanvas.getContext("2d");

                let animationFrame = null;
                let currentPixelSize = 1;
                const maxPixelSize = 22;

                const drawPixelatedFrame = (pixelSize) => {
                    if (!pixelContext || !workingContext || !rustyImage.complete) {
                        return;
                    }

                    const sourceWidth = pixelCanvas.width;
                    const sourceHeight = pixelCanvas.height;
                    if (!sourceWidth || !sourceHeight) {
                        return;
                    }

                    const sampleWidth = Math.max(1, Math.floor(sourceWidth / pixelSize));
                    const sampleHeight = Math.max(1, Math.floor(sourceHeight / pixelSize));

                    workingContext.clearRect(0, 0, sourceWidth, sourceHeight);
                    workingContext.imageSmoothingEnabled = true;
                    workingContext.drawImage(rustyImage, 0, 0, sampleWidth, sampleHeight);

                    pixelContext.clearRect(0, 0, sourceWidth, sourceHeight);
                    pixelContext.imageSmoothingEnabled = false;
                    pixelContext.drawImage(workingCanvas, 0, 0, sampleWidth, sampleHeight, 0, 0, sourceWidth, sourceHeight);
                };

                const resizeCanvas = () => {
                    const imageWidth = rustyImage.clientWidth;
                    const imageHeight = rustyImage.clientHeight;

                    if (!imageWidth || !imageHeight) {
                        return;
                    }

                    pixelCanvas.width = imageWidth;
                    pixelCanvas.height = imageHeight;
                    workingCanvas.width = imageWidth;
                    workingCanvas.height = imageHeight;
                    drawPixelatedFrame(currentPixelSize);
                };

                const animatePixelation = (targetPixelSize, duration) => {
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }

                    const startPixelSize = currentPixelSize;
                    const startTime = performance.now();

                    const tick = (timestamp) => {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        const easedProgress = 1 - Math.pow(1 - progress, 3);

                        currentPixelSize = startPixelSize + ((targetPixelSize - startPixelSize) * easedProgress);
                        drawPixelatedFrame(currentPixelSize);

                        if (progress < 1) {
                            animationFrame = requestAnimationFrame(tick);
                        } else {
                            currentPixelSize = targetPixelSize;
                            drawPixelatedFrame(currentPixelSize);
                            if (targetPixelSize <= 1) {
                                pixelCanvas.style.opacity = "0";
                            }
                        }
                    };

                    animationFrame = requestAnimationFrame(tick);
                };

                const startPixelation = () => {
                    if (!rustyImage.complete) {
                        return;
                    }
                    pixelCanvas.style.opacity = "1";
                    animatePixelation(maxPixelSize, 360);
                };

                const stopPixelation = () => {
                    if (!rustyImage.complete) {
                        return;
                    }
                    animatePixelation(1, 420);
                };

                const setupReadyState = () => {
                    resizeCanvas();
                    drawPixelatedFrame(1);
                    pixelCanvas.style.opacity = "0";
                };

                if (rustyImage.complete) {
                    setupReadyState();
                } else {
                    rustyImage.addEventListener("load", setupReadyState, { once: true });
                }

                window.addEventListener("resize", resizeCanvas);
                wrapper.addEventListener("mouseenter", startPixelation);
                wrapper.addEventListener("mouseleave", stopPixelation);
            });
        },
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
    tpl.functions.setupRustyPixelation();
    tpl.init();
    centerSelectedNavItem();
});