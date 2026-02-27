const tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    range: { start: 0, end: 10 },
    items: [],
    visibleItems: [],
    functions: {
        scrollToHash() {
            const hash = window.location.hash.substring(1);
            if (!hash) return;
            const idx = tplFeed.items.findIndex(item => item.id === hash);
            if (idx === -1) return;
            const scrollToItem = () => {
                const el = document.getElementById(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            if (idx < tplFeed.range.start || idx >= tplFeed.range.end) {
                tplFeed.range.start = Math.floor(idx / 10) * 10;
                tplFeed.range.end = tplFeed.range.start + 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                const tryScroll = () => {
                    const el = document.getElementById(hash);
                    if (el) {
                        setTimeout(() => {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => {
                                const rect = el.getBoundingClientRect();
                                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                                const isMobile = window.matchMedia('(max-width: 600px)').matches;
                                const offset = isMobile ? 290 : 260;
                                window.scrollTo({ top: rect.top + scrollTop - offset, behavior: 'auto' });
                            }, 350);
                        }, 250);
                    } else {
                        requestAnimationFrame(tryScroll);
                    }
                };
                tryScroll();
            } else {
                setTimeout(scrollToItem, 250);
            }
        },
        feedDisplay(start, end) {
            const visibleItems = tplFeed.items.slice(start, end);
            tplFeed.visibleItems = visibleItems;
            const formattedFeed = visibleItems.map(item => {
                const permalink = `torontopubliclibra.com/feed#${item.id}`;
                const mailto = `mailto:torontopubliclibra@gmail.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
                const dateLink = `<a href="#${item.id}" class="permalink-link">${item.date}</a>`;
                let mediaTag;
                if (item.type === 'video') {
                    mediaTag = `<video class="feed-item" controls preload="metadata" poster="${item.poster || ''}" style="max-width:100%;height:auto;">
                        <source src="${item.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
                } else {
                    mediaTag = `<img src="${item.url}" alt="${item.alt}" class="feed-item">`;
                }
                if (item.link) {
                    mediaTag = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${mediaTag}</a>`;
                }
                return `<div class="feed-item-container" id="${item.id}">${mediaTag}<p class="alt">${item.alt}</p><p>>> ${dateLink} // <a href="${mailto}" class="reply-link" target="_blank" rel="noopener noreferrer">reply</a> // <button onclick=\"tplFeed.functions.altToggle('${item.id}')\">alt</button></p></div>`;
            });
            tplFeed.content.html(formattedFeed.join(''));
            tplFeed.functions.updateToggle();
        },
        updateToggle() {
            const { start, end } = tplFeed.range;
            let toggleText = '<p style="display: flex; align-items: center; justify-content: space-between;">';
            toggleText += '<span>';
            toggleText += start > 0
                ? '<button class="range" onclick="tplFeed.functions.newer()"><< newer</button>'
                : '<span class="year-selected"><< newer</span>';
            toggleText += ' | ';
            toggleText += end < tplFeed.items.length
                ? '<button class="range" onclick="tplFeed.functions.older()">older >></button>'
                : '<span class="year-selected">older >></span>';
            toggleText += '</span>';
            toggleText += '<span style="border-bottom: solid white 0.75px;margin-bottom: 5px;"><a href="/tpl/rss.xml" target="_blank" style="margin-left:auto;margin-bottom: -3px; display: flex; align-items: center; text-decoration:none;gap: 8px; color: #f3e8e9; font-size: 1rem;" title="RSS Feed">RSS';
            toggleText += '<img src="../../assets/icons/rss.svg" style="width:15px;filter: invert(1);" alt="RSS icon"></a></span>';
            toggleText += '</p>';
            tplFeed.toggle.html(toggleText);
        },
        newer() {
            if (tplFeed.range.start > 0) {
                tplFeed.range.start -= 10;
                tplFeed.range.end -= 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
        },
        older() {
            if (tplFeed.range.end < tplFeed.items.length) {
                tplFeed.range.start += 10;
                tplFeed.range.end += 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }
        },
        resetAltToggles() {
            tplFeed.visibleItems.forEach(item => {
                const altElement = $(`#${item.id} .alt`);
                const altButton = $(`#${item.id} button`);
                altElement.removeClass('alt-visible');
                altButton.removeClass('selected');
            });
        },
        altToggle(id) {
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
    init() {
        fetch('../data/feed.json')
            .then(response => response.json())
            .then(data => {
                tplFeed.items = Array.isArray(data) ? data : Object.values(data)[0];
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                tplFeed.functions.scrollToHash();
            })
            .catch(error => console.log(error));
        window.addEventListener('hashchange', tplFeed.functions.scrollToHash);
    }
};

$(document).ready(tplFeed.init);