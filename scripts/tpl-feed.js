let tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    range: {
        start: 0,
        end: 10,
    },
    items: [],
    visibileItems: [],
    functions: {
        scrollToHash: () => {
            if (window.location.hash) {
                const hash = window.location.hash.substring(1);
                const idx = tplFeed.items.findIndex(item => item.id === hash);
                if (idx !== -1) {
                    const scrollToItem = () => {
                        const el = document.getElementById(hash);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    };
                    if (idx < tplFeed.range.start || idx >= tplFeed.range.end) {
                        tplFeed.range.start = Math.floor(idx / 10) * 10;
                        tplFeed.range.end = tplFeed.range.start + 10;
                        tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                        // Add a longer delay to ensure the DOM is ready and rendering is complete
                        const tryScroll = () => {
                            const el = document.getElementById(hash);
                            if (el) {
                                setTimeout(() => {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // After scrollIntoView, force scroll to top of item after a longer delay
                                    setTimeout(() => {
                                        const rect = el.getBoundingClientRect();
                                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                        const isMobile = window.matchMedia('(max-width: 600px)').matches;
                                        const offset = isMobile ? 290 : 260;
                                        window.scrollTo({
                                            top: rect.top + scrollTop - offset,
                                            behavior: 'auto'
                                        });
                                    }, 350); // Increased delay for reliability
                                }, 250); // Increased delay before scrollIntoView
                            } else {
                                requestAnimationFrame(tryScroll);
                            }
                        };
                        tryScroll();
                    } else {
                        setTimeout(scrollToItem, 250); // Add delay even if already in range
                    }
                }
            }
        },
        feedDisplay: (start, end) => {
            let formattedFeed = [];
            let visibleItems = tplFeed.items.slice(start, end);
            tplFeed.visibileItems = visibleItems;

            for (let index in visibleItems) {
                let array = [visibleItems[index]];
                array.forEach((item) => {
                    // mailto link for reply
                    let permalink = `torontopubliclibra.com/feed#${item.id}`;
                    let mailto = `mailto:torontopubliclibra@gmail.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
                    // Make the datestamp itself the permalink
                    let dateLink = `<a href="#${item.id}" class="permalink-link">${item.date}</a>`;
                    let image = `<div class="feed-item-container" id="${item.id}"><img src="${item.url}" alt="${item.alt}" class="feed-item"><p class="alt">${item.alt}</p><p>>> ${dateLink} // <a href="${mailto}" class="reply-link" target="_blank" rel="noopener noreferrer">reply</a> // <button onclick=\"tplFeed.functions.altToggle('${item.id}')\">alt</button></p></div>`;
                    formattedFeed.push(image);
                });
            }

            tplFeed.content.html(formattedFeed.reduce((accumulator, log) => {
                return accumulator + log;
            }));

            tplFeed.functions.updateToggle();
        },
        updateToggle: () => {
            let toggleText = '<p style="display: flex; align-items: center; justify-content: space-between;">';
            toggleText += '<span>';
            // Show newer button if not at the beginning
            if (tplFeed.range.start > 0) {
                toggleText += '<button class="range" onclick="tplFeed.functions.newer()"><< newer</button>';
            } else {
                toggleText += '<span class="year-selected"><< newer</span>';
            }
            toggleText += ' | ';
            // Show older button if there are more items
            if (tplFeed.range.end < tplFeed.items.length) {
                toggleText += '<button class="range" onclick="tplFeed.functions.older()">older >></button>';
            } else {
                toggleText += '<span class="year-selected">older >></span>';
            }
            toggleText += '</span>';
            toggleText += '<span style="border-bottom: solid white 1px;margin-bottom: 3px;"><a href="/tpl/rss.xml" target="_blank" style="margin-left:auto;margin-bottom: -3px; display: flex; align-items: center; text-decoration:none;gap: 8px; color: #f3e8e9; font-size: 1.1em;" title="RSS Feed">RSS';
            toggleText += '<img src="../../assets/icons/rss.svg" style="width:16px;filter: invert(1);" alt="RSS icon"></a></span>';
            toggleText += '</p>';
            tplFeed.toggle.html(toggleText);
        },
        newer: () => {
            if (tplFeed.range.start > 0) {
                tplFeed.range.start -= 10;
                tplFeed.range.end -= 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scroll(top);
            }
        },
        older: () => {
            if (tplFeed.range.end < tplFeed.items.length) {
                tplFeed.range.start += 10;
                tplFeed.range.end += 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scroll(top);
            }
        },
        resetAltToggles: () => {
            for (let i = 0; i < tplFeed.visibileItems.length; i++) {
                let id = i + 1;
                const altElement = $(`#${id} .alt`);
                const altButton = $(`#${id} button`);
                if (altElement.hasClass('alt-visible')) {
                    altElement.removeClass('alt-visible');
                }
                altButton.removeClass('selected');
            }
        },
        altToggle: (id) => {
            const altElement = $(`#${id} .alt`);
            const altButton = $(`#${id} button`);
            if (altElement.hasClass('alt-visible')) {
                altElement.removeClass('alt-visible');
                altButton.removeClass('selected');
            } else {
                tplFeed.functions.resetAltToggles();
                altElement.addClass('alt-visible');
                altButton.addClass('selected');
            }
        },
    },
    init: () => {
        fetch('../data/feed.json').then(response => response.json())
        .then((data) => {
            let list = [];
            for (let object in data) {
                list.push(data[object]);
            }
            tplFeed.items = list[0];
            tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
            tplFeed.functions.scrollToHash();
        })
        .catch(error => console.log(error));
        // Listen for hash changes
        window.addEventListener('hashchange', tplFeed.functions.scrollToHash);
    },
};
$(document).ready(() => {
    tplFeed.init();
});