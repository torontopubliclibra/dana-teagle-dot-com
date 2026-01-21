
const rustpropFeed = {
    content: document.querySelector('.img-gallery'),
    navTop: document.querySelector('.rp-nav.top'),
    navBottom: document.querySelector('.rp-nav.bottom'),
    range: { start: 0, end: 10 },
    items: [],
    visibleItems: [],
    functions: {
        scrollToHash() {
            const hash = window.location.hash;
            if (!hash) return;
            const id = hash.substring(1);
            const idx = rustpropFeed.items.findIndex(item => item.id === id);
            if (idx === -1) return;
            if (idx < rustpropFeed.range.start || idx >= rustpropFeed.range.end) {
                rustpropFeed.range.start = Math.floor(idx / 10) * 10;
                rustpropFeed.range.end = rustpropFeed.range.start + 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const tryScroll = () => {
                    const el = document.getElementById(id);
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
                setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 250);
            }
        },
        display(start, end) {
            const visibleItems = rustpropFeed.items.slice(start, end);
            rustpropFeed.visibleItems = visibleItems;
            const formatted = visibleItems.map(item => {
                const imagesHtml = Array.isArray(item.images)
                    ? item.images.map((img, idx) => `<img src='${img}' alt='${Array.isArray(item.alt) ? item.alt[idx] || item.alt[0] : item.alt}' />`).join('')
                    : `<img src='${item.images}' alt='${item.alt}' />`;
                const headline = item.headline ? `<span class='headline'>${item.headline}</span><br/>` : '';
                const links = [];
                if (item.links.permalink) {
                    const dateLabel = Array.isArray(item.date) ? item.date[0] : item.date;
                    links.push(`<a href="#${item.id}" class="permalink-link">${dateLabel}</a>`);
                }
                if (item.links.instagram) links.push(`<a href='${item.links.instagram}' target='_blank'>Instagram</a>`);
                if (item.links.print) links.push(`<a href='${item.links.print}' target='_blank'>Print</a>`);
                const linksHtml = links.length ? `[ ${links.join(' | ')} ]` : '';
                return `
                    <div class='item' id='${item.id}'>
                        ${imagesHtml}
                        <p class='img-caption'>${headline}${linksHtml}</p>
                    </div>
                `;
            });
            rustpropFeed.navTop.innerHTML = rustpropFeed.functions.getNavHtml();
            rustpropFeed.content.innerHTML = formatted.join('');
            rustpropFeed.navBottom.innerHTML = rustpropFeed.functions.getNavHtml();
        },
        getNavHtml() {
            const { start, end } = rustpropFeed.range;
            const totalPages = Math.ceil(rustpropFeed.items.length / 10);
            const currentPage = Math.floor(start / 10) + 1;
            let navHtml = '';
            navHtml += start === 0
                ? '<p class="rp-nav-btn disabled"><img src="../../assets/icons/arrow-left.svg" alt="arrow left icon">Newer</p>'
                : `<a href="#" class="rp-nav-btn" onclick="rustpropFeed.functions.newer();return false;"><img src="../../assets/icons/arrow-left.svg" alt="arrow left icon">Newer</a>`;
            navHtml += `<p>|  ${currentPage} / ${totalPages}  |</p>`;
            navHtml += end >= rustpropFeed.items.length
                ? '<p class="rp-nav-btn disabled">Older <img src="../../assets/icons/arrow-left.svg" class="right" alt="arrow right icon"></p>'
                : `<a href="#" class="rp-nav-btn" onclick="rustpropFeed.functions.older();return false;">Older <img src="../../assets/icons/arrow-left.svg" class="right" alt="arrow right icon"></a>`;
            return navHtml;
        },
        newer() {
            if (rustpropFeed.range.start > 0) {
                rustpropFeed.range.start -= 10;
                rustpropFeed.range.end -= 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const offset = window.innerWidth <= 600 ? 322 : 220;
                window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
            }
        },
        older() {
            if (rustpropFeed.range.end < rustpropFeed.items.length) {
                rustpropFeed.range.start += 10;
                rustpropFeed.range.end += 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const offset = window.innerWidth <= 600 ? 322 : 220;
                window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
            }
        },
    },
    init() {
        fetch('../data/rustprop.json')
            .then(response => response.json())
            .then(data => {
                rustpropFeed.items = data.items;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                rustpropFeed.functions.scrollToHash();
                window.addEventListener('hashchange', rustpropFeed.functions.scrollToHash);
            })
            .catch(error => console.log(error));
    }
};

document.addEventListener('DOMContentLoaded', rustpropFeed.init);