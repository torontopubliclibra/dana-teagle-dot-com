const rustpropFeed = {
    content: document.querySelector('.img-gallery'),
    navTop: document.querySelector('.rp-nav.top'),
    navBottom: document.querySelector('.rp-nav.bottom'),
    lightbox: null,
    lastActiveElement: null,
    lastScrollPosition: 0,
    scrollLock: {
        active: false,
        y: 0,
        bodyStyles: {}
    },
    range: { start: 0, end: 10 },
    items: [],
    visibleItems: [],
    functions: {
        escapeAttribute(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },
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
                const itemImages = Array.isArray(item.images) ? item.images : [item.images];
                const imagesHtml = itemImages.map((img, idx) => {
                    const imageAlt = Array.isArray(item.alt) ? item.alt[idx] || item.alt[0] : item.alt;
                    return `<img src="${rustpropFeed.functions.escapeAttribute(img)}" alt="${rustpropFeed.functions.escapeAttribute(imageAlt)}" class="rp-lightbox-trigger" style="pointer-events:auto;cursor:zoom-in;"/>`;
                }).join('');
                const headline = item.headline ? `<span class='headline'>${item.headline}</span><br style="margin-bottom:0.5rem;"/>` : '';
                const links = [];
                if (item.links.permalink) {
                    const dateLabel = Array.isArray(item.date) ? item.date[0] : item.date;
                    links.push(`<a href="#${item.id}" class="permalink-link">${dateLabel}</a>`);
                }
                // if (item.links.instagram) links.push(`<a href='${item.links.instagram}' target='_blank'>Instagram</a>`);
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
                const offset = window.innerWidth <= 600 ? 322 : 180;
                window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
            }
        },
        older() {
            if (rustpropFeed.range.end < rustpropFeed.items.length) {
                rustpropFeed.range.start += 10;
                rustpropFeed.range.end += 10;
                rustpropFeed.functions.display(rustpropFeed.range.start, rustpropFeed.range.end);
                const offset = window.innerWidth <= 600 ? 322 : 180;
                window.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
            }
        },
        lockPageScroll() {
            if (rustpropFeed.scrollLock.active) {
                return;
            }

            const body = document.body;
            rustpropFeed.scrollLock.y = window.pageYOffset || document.documentElement.scrollTop || 0;
            rustpropFeed.scrollLock.bodyStyles = {
                position: body.style.position,
                top: body.style.top,
                left: body.style.left,
                right: body.style.right,
                width: body.style.width,
                overflow: body.style.overflow
            };

            body.style.position = 'fixed';
            body.style.top = `-${rustpropFeed.scrollLock.y}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.width = '100%';
            body.style.overflow = 'hidden';
            rustpropFeed.scrollLock.active = true;
        },
        unlockPageScroll() {
            if (!rustpropFeed.scrollLock.active) {
                return;
            }

            const body = document.body;
            const { bodyStyles, y } = rustpropFeed.scrollLock;
            body.style.position = bodyStyles.position || '';
            body.style.top = bodyStyles.top || '';
            body.style.left = bodyStyles.left || '';
            body.style.right = bodyStyles.right || '';
            body.style.width = bodyStyles.width || '';
            body.style.overflow = bodyStyles.overflow || '';
            rustpropFeed.scrollLock.active = false;
            window.scrollTo(0, y);
        },
        ensureLightbox() {
            if (rustpropFeed.lightbox) {
                return rustpropFeed.lightbox;
            }

            document.body.insertAdjacentHTML('beforeend', `
                <div class="rp-lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Expanded rustprop image" style="position:fixed;inset:0;z-index:2000;display:none;justify-content:center;align-items:center;padding:20px;background:rgba(15,15,15,0.92);">
                    <div class="rp-lightbox-panel">
                        <button type="button" class="rp-lightbox-close" aria-label="Close image viewer">close</button>
                        <div class="rp-lightbox-frame"></div>
                        <p class="rp-lightbox-caption"></p>
                    </div>
                </div>
            `);

            rustpropFeed.lightbox = document.querySelector('.rp-lightbox');

            rustpropFeed.lightbox.addEventListener('click', event => {
                if (event.target.classList.contains('rp-lightbox') || event.target.classList.contains('rp-lightbox-close')) {
                    rustpropFeed.functions.closeLightbox();
                }
            });

            return rustpropFeed.lightbox;
        },
        openLightbox(imageElement) {
            const lightbox = rustpropFeed.functions.ensureLightbox();
            const source = imageElement.getAttribute('src') || '';
            const alt = imageElement.getAttribute('alt') || '';
            const item = imageElement.closest('.item');
            const itemCaption = item ? item.querySelector('.img-caption') : null;
            const captionHtml = itemCaption ? itemCaption.innerHTML : alt;
            const itemImages = item ? Array.from(item.querySelectorAll('.rp-lightbox-trigger')) : [imageElement];
            const lightboxCount = itemImages.length;
            let frameClass = 'single';

            if (lightboxCount === 2) {
                frameClass = 'multi-two';
            } else if (lightboxCount === 3) {
                frameClass = 'multi-three';
            } else if (lightboxCount >= 4) {
                frameClass = 'multi-four';
            }

            const mediaStyle = (frameClass === 'single' || frameClass === 'multi-two' || frameClass === 'multi-three')
                ? 'width:auto;max-width:100%;max-height:60vh;height:auto;object-fit:contain;border:solid 3px rgba(255,255,255,0.5);background:#111;'
                : 'width:100%;height:auto;max-width:100%;max-height:30vh;object-fit:contain;box-sizing:border-box;border:solid 3px rgba(255,255,255,0.5);background:#111;';

            const lightboxMediaHtml = itemImages.map(img => {
                const itemSource = img.getAttribute('src') || source;
                const itemAlt = img.getAttribute('alt') || alt;
                return `<img src="${itemSource}" alt="${itemAlt}" class="rp-lightbox-media" style="${mediaStyle}">`;
            }).join('');

            const frameElement = lightbox.querySelector('.rp-lightbox-frame');

            rustpropFeed.lastActiveElement = document.activeElement;
            rustpropFeed.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
            frameElement.className = `rp-lightbox-frame ${frameClass}`;
            frameElement.innerHTML = lightboxMediaHtml;
            lightbox.querySelector('.rp-lightbox-caption').innerHTML = captionHtml;
            document.body.classList.add('rp-lightbox-open');
            rustpropFeed.functions.lockPageScroll();
            lightbox.classList.add('is-open');
            lightbox.style.display = 'flex';
            lightbox.setAttribute('aria-hidden', 'false');
            lightbox.querySelector('.rp-lightbox-close').focus();
        },
        closeLightbox() {
            if (!rustpropFeed.lightbox || !rustpropFeed.lightbox.classList.contains('is-open')) {
                return;
            }

            const restoreY = rustpropFeed.scrollLock.active
                ? rustpropFeed.scrollLock.y
                : rustpropFeed.lastScrollPosition;

            rustpropFeed.lightbox.classList.remove('is-open');
            rustpropFeed.lightbox.setAttribute('aria-hidden', 'true');
            rustpropFeed.lightbox.style.display = 'none';
            rustpropFeed.lightbox.querySelector('.rp-lightbox-frame').innerHTML = '';
            rustpropFeed.lightbox.querySelector('.rp-lightbox-caption').textContent = '';
            document.body.classList.remove('rp-lightbox-open');
            rustpropFeed.functions.unlockPageScroll();

            if (rustpropFeed.lastActiveElement && typeof rustpropFeed.lastActiveElement.focus === 'function') {
                try {
                    rustpropFeed.lastActiveElement.focus({ preventScroll: true });
                } catch (_error) {
                    rustpropFeed.lastActiveElement.focus();
                }
            }

            window.scrollTo(0, restoreY);
            requestAnimationFrame(() => window.scrollTo(0, restoreY));
        },
        handleLightboxKeydown(event) {
            if (event.key === 'Escape') {
                rustpropFeed.functions.closeLightbox();
            }
        },
        imageClick(event) {
            const image = event.target.closest('.rp-lightbox-trigger');
            if (!image) {
                return;
            }

            event.preventDefault();
            rustpropFeed.functions.openLightbox(image);
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

            rustpropFeed.content.addEventListener('click', rustpropFeed.functions.imageClick);
            document.addEventListener('keydown', rustpropFeed.functions.handleLightboxKeydown);
    }
};

document.addEventListener('DOMContentLoaded', rustpropFeed.init);