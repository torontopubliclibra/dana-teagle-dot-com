
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
            const scrollToItem = (block = 'start', offset = 0) => {
                const el = document.getElementById(hash);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block });
                    if (offset) {
                        setTimeout(() => {
                            const rect = el.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            window.scrollTo({ top: rect.top + scrollTop - offset, behavior: 'auto' });
                        }, 350);
                    }
                }
            };
            if (idx < tplFeed.range.start || idx >= tplFeed.range.end) {
                tplFeed.range.start = Math.floor(idx / 10) * 10;
                tplFeed.range.end = tplFeed.range.start + 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                const tryScroll = () => {
                    const el = document.getElementById(hash);
                    if (el) {
                        setTimeout(() => {
                            scrollToItem('center', window.matchMedia('(max-width: 600px)').matches ? 290 : 260);
                        }, 250);
                    } else {
                        requestAnimationFrame(tryScroll);
                    }
                };
                tryScroll();
            } else {
                setTimeout(() => scrollToItem(), 250);
            }
        },
        feedDisplay(start, end) {
            tplFeed.visibleItems = tplFeed.items.slice(start, end);
            tplFeed.content.html(tplFeed.visibleItems.map(tplFeed.functions.feedItemHTML).join(''));
            tplFeed.functions.updateToggle();
        },
        feedItemHTML(item) {
            const permalink = `torontopubliclibra.com/feed#${item.id}`;
            const mailto = `mailto:torontopubliclibra@gmail.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
            const dateLink = `<a href="#${item.id}" class="permalink-link">${item.date}</a>`;
            let mediaTag = item.type === 'video'
                ? `<video class="feed-item" controls preload="metadata" poster="${item.poster || ''}" style="max-width:100%;height:auto;border: solid 3px rgba(243, 232, 233, 0.5); border-bottom: none;">
                        <source src="${item.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`
                : `<img src="${item.url}" alt="${item.alt}" class="feed-item">`;
            if (item.link) {
                mediaTag = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${mediaTag}</a>`;
            }
            return `<div class="feed-item-container" id="${item.id}">${mediaTag}<p class="alt">${item.alt}</p><p>>> ${dateLink} // <a href="${mailto}" class="reply-link" target="_blank" rel="noopener noreferrer">reply</a> // <button onclick=\"tplFeed.functions.altToggle('${item.id}')\">alt</button></p></div>`;
        },
        updateToggle() {
            const { start, end } = tplFeed.range;
            const navBtn = (cond, text, fn) => cond
                ? `<button class="range" onclick="tplFeed.functions.${fn}()">${text}</button>`
                : `<span class="year-selected">${text}</span>`;
            tplFeed.toggle.html(`
                <p style="display: flex; align-items: center; justify-content: space-between;">
                    <span>
                        ${navBtn(start > 0, '<< newer', 'newer')} | ${navBtn(end < tplFeed.items.length, 'older >>', 'older')}
                    </span>
                    <span style="border-bottom: solid white 0.75px;margin-bottom: 5px;">
                        <a href="/tpl/rss.xml" target="_blank" style="margin-left:auto;margin-bottom: -3px; display: flex; align-items: center; text-decoration:none;gap: 8px; color: #f3e8e9; font-size: 1rem;" title="RSS Feed">RSS
                        <img src="../../assets/icons/rss.svg" style="width:15px;filter: invert(1);" alt="RSS icon"></a>
                    </span>
                </p>
            `);
        },
        changeRange(dir) {
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }, 100);
            const step = 10;
            if (dir === 'newer' && tplFeed.range.start > 0) {
                tplFeed.range.start -= step;
                tplFeed.range.end -= step;
            } else if (dir === 'older' && tplFeed.range.end < tplFeed.items.length) {
                tplFeed.range.start += step;
                tplFeed.range.end += step;
            }
            tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
        },
        newer() { tplFeed.functions.changeRange('newer'); },
        older() { tplFeed.functions.changeRange('older'); },
        resetAltToggles() {
            tplFeed.visibleItems.forEach(item => {
                $(`#${item.id} .alt`).removeClass('alt-visible');
                $(`#${item.id} button`).removeClass('selected');
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