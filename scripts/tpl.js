const tpl = {
    tplCategories: $(".tpl-categories"),
    errorMessage: $(".js-disabled-tpl"),
    tplLinks: $(".tpl-links"),
    badgesContainer: $("#tpl-badges"),
    links: {},
    badges: [],
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
                const rustyLink = rustyImage.closest("a");

                let animationFrame = null;
                let currentPixelSize = 1;
                let isNavigating = false;
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

                const triggerPixelateAndNavigate = (event) => {
                    if (isNavigating || !rustyImage.complete) {
                        return;
                    }

                    event.preventDefault();
                    isNavigating = true;
                    pixelCanvas.style.opacity = "1";

                    animatePixelation(maxPixelSize, 320);
                    window.setTimeout(() => {
                        window.location.href = (rustyLink && rustyLink.getAttribute("href")) || "/";
                    }, 320);
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
                wrapper.addEventListener("click", triggerPixelateAndNavigate);
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
        badgesDisplay() {
            if (!tpl.badgesContainer.length || !tpl.badges.length) {
                return;
            }

            const shuffledBadges = prioritizeAndShuffleBadges(tpl.badges);
            const badgesMarkup = shuffledBadges.map(buildBadgeMarkup).join("");
            tpl.badgesContainer.html(badgesMarkup);
            bindBookmarkButton();
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

        if (tpl.badgesContainer.length) {
            fetch("../data/badges.json")
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        tpl.badges = data;
                        tpl.functions.badgesDisplay();
                    }
                })
                .catch(error => console.log(error));
        }
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
    const isDtDotCom = link.title === "dana teagle dot com";
    const isIdGuide = link.title === "I.D. Guide";
    const isRustprop = link.title === "RUSTPROP";
    const dtDotComClass = isDtDotCom ? " dt-dot-com-link" : "";
    const idGuideClass = isIdGuide ? " id-guide-link" : "";
    const rustpropClass = isRustprop ? " rustprop-link" : "";
    const description = link.description ? `<hr/><p class="button-description">${link.description}</p>` : "";
    return `<a class="button tpl-link ${categoryTag}${dtDotComClass}${idGuideClass}${rustpropClass}" href="${link.link}" target="_blank"><span class="link-title"><p class="button-label">${link.title}</p><img src="../assets/icons/external-link.svg" alt="external link icon"></span>${description}</a>`;
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

function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}

function prioritizeAndShuffleBadges(badges) {
    const pinnedPatterns = ["tpl-88x31", "pro-web-design-88x31"];
    const pinnedBadges = [];
    const remainingBadges = [...badges];

    pinnedPatterns.forEach((pattern) => {
        const pinnedIndex = remainingBadges.findIndex((badge) => {
            const imgSrc = badge && badge.img && badge.img.src ? badge.img.src : "";
            return imgSrc.includes(pattern);
        });

        if (pinnedIndex !== -1) {
            pinnedBadges.push(remainingBadges[pinnedIndex]);
            remainingBadges.splice(pinnedIndex, 1);
        }
    });

    return [...pinnedBadges, ...shuffleArray(remainingBadges)];
}

function buildBadgeMarkup(badge) {
    const imgWidth = badge.img && badge.img.width ? ` width="${badge.img.width}"` : "";
    const imgHeight = badge.img && badge.img.height ? ` height="${badge.img.height}"` : "";
    const imgMarkup = `<img src="${badge.img.src}" alt="${badge.img.alt}"${imgWidth}${imgHeight}>`;

    if (badge.type === "button") {
        const buttonId = badge.id ? ` id="${badge.id}"` : "";
        const buttonTitle = badge.title ? ` title="${badge.title}"` : "";
        return `<button${buttonId}${buttonTitle}>${imgMarkup}</button>`;
    }

    const href = badge.href || "#";
    const target = badge.target ? ` target="${badge.target}"` : "";
    const title = badge.title ? ` title="${badge.title}"` : "";

    return `<a href="${href}"${target}${title}>${imgMarkup}</a>`;
}

function bindBookmarkButton() {
    const bookmarkButton = document.getElementById("bookmark");

    if (!bookmarkButton) {
        return;
    }

    bookmarkButton.addEventListener("click", function() {
        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(document.title, window.location.href, "");
        } else if (window.external && ("AddFavorite" in window.external)) {
            window.external.AddFavorite(location.href, document.title);
        } else if (window.opera && window.print) {
            this.title = document.title;
            return true;
        } else {
            alert("Press " + (navigator.userAgent.toLowerCase().indexOf("mac") !== -1 ? "Command/Cmd" : "CTRL") + " + D to bookmark this page.");
        }

        return false;
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