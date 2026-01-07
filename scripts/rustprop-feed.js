let rustpropFeed = {
    content: document.querySelector('.img-gallery'),
    navTop: document.querySelector('.rp-nav.top'),
    navBottom: document.querySelector('.rp-nav.bottom'),
    range: {
        start: 0,
        end: 10,
    },
    items: [],
    visibleItems: [],
    functions: {
        scrollToHash: function() {
            if (window.location.hash) {
                const id = window.location.hash.substring(1);
                // Find index of item with this id
                const idx = rustpropFeed.items.findIndex(item => item.id === id);
                if (idx !== -1) {
                    // If not on current page, paginate to correct page
                    if (idx < rustpropFeed.range.start || idx >= rustpropFeed.range.end) {
                        rustpropFeed.range.start = Math.floor(idx / 10) * 10;
                        rustpropFeed.range.end = rustpropFeed.range.start + 10;
                        rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                        // Add a longer delay to ensure the DOM is ready and rendering is complete
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
                        setTimeout(() => {
                            const el = document.getElementById(id);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 250); // Add delay even if already in range
                    }
                }
            }
                },
        display: function(start, end) {
                        let formatted = [];
                        let visibleItems = rustpropFeed.items.slice(start, end);
                        rustpropFeed.visibleItems = visibleItems;
                        for (let i = 0; i < visibleItems.length; i++) {
                                let item = visibleItems[i];
                                let imagesHtml = Array.isArray(item.images) ? item.images.map((img, idx) => `<img src='${img}' alt='${Array.isArray(item.alt) ? item.alt[idx] || item.alt[0] : item.alt}' />`).join('') : `<img src='${item.images}' alt='${item.alt}' />`;
                                let headline = item.headline ? `<span class='headline'>${item.headline}</span><br/>` : '';
                                // Remove separate datestamp, only use date in permalink link
                                let links = [];
                                // Permalink link with date label, always first
                                if (item.links.permalink) {
                                    let dateLabel = Array.isArray(item.date) ? item.date[0] : item.date;
                                    links.push(`<a href="#${item.id}" class="permalink-link">${dateLabel}</a>`);
                                }
                                if (item.links.instagram) links.push(`<a href='${item.links.instagram}' target='_blank'>Instagram</a>`);
                                if (item.links.print) links.push(`<a href='${item.links.print}' target='_blank'>Print</a>`);
                                let linksHtml = links.length ? `[ ${links.join(' | ')} ]` : '';
                                formatted.push(`
                                    <div class='item' id='${item.id}'>
                                        ${imagesHtml}
                                        <p class='img-caption'>${headline}${linksHtml}</p>
                                    </div>
                                `);
                        }
                        // Render nav at top and bottom
                        rustpropFeed.navTop.innerHTML = rustpropFeed.functions.getNavHtml();
                        rustpropFeed.content.innerHTML = formatted.join('');
                        rustpropFeed.navBottom.innerHTML = rustpropFeed.functions.getNavHtml();
        },
        getNavHtml: function() {
            let navHtml = '';
            // Newer button
            if (rustpropFeed.range.start === 0) {
                navHtml += '<p class="rp-nav-btn disabled"><img src="../../assets/icons/arrow-left.svg" alt="arrow left icon">Newer</p>';
            } else {
                navHtml += `<a href="#" class="rp-nav-btn" onclick="rustpropFeed.functions.newer();return false;"><img src="../../assets/icons/arrow-left.svg" alt="arrow left icon">Newer</a>`;
            }
            // Page indicator
            navHtml += '<p>|  ' + (Math.floor(rustpropFeed.range.start/10)+1) + ' / ' + Math.ceil(rustpropFeed.items.length/10) + '  |</p>';
            // Older button
            if (rustpropFeed.range.end >= rustpropFeed.items.length) {
                navHtml += '<p class="rp-nav-btn disabled">Older <img src="../../assets/icons/arrow-left.svg" class="right" alt="arrow right icon"></p>';
            } else {
                navHtml += `<a href="#" class="rp-nav-btn" onclick="rustpropFeed.functions.older();return false;">Older <img src="../../assets/icons/arrow-left.svg" class="right" alt="arrow right icon"></a>`;
            }
            return navHtml;
        },
        newer: function() {
            if (rustpropFeed.range.start > 0) {
                rustpropFeed.range.start -= 10;
                rustpropFeed.range.end -= 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const offset = window.innerWidth <= 600 ? 322 : 220;
                window.scrollTo({top: offset, left: 0, behavior: 'smooth'});
            }
        },
        older: function() {
            if (rustpropFeed.range.end < rustpropFeed.items.length) {
                rustpropFeed.range.start += 10;
                rustpropFeed.range.end += 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const offset = window.innerWidth <= 600 ? 322 : 220;
                window.scrollTo({top: offset, left: 0, behavior: 'smooth'});
            }
        },
    },
    init: function() {
        fetch('../data/rustprop.json').then(response => response.json())
        .then((data) => {
            rustpropFeed.items = data.items;
            rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
            // Handle hash navigation only on load and hashchange
            rustpropFeed.functions.scrollToHash();
            window.addEventListener('hashchange', rustpropFeed.functions.scrollToHash);
        })
        .catch(error => console.log(error));
    }
};
document.addEventListener('DOMContentLoaded', function() {
    rustpropFeed.init();
});
