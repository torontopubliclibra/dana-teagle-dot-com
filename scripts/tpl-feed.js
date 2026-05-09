
const tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    lightbox: null,
    lastActiveElement: null,
    scrollLock: {
        active: false,
        y: 0,
        bodyStyles: {}
    },
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
                ? `<video class="feed-item" controls preload="metadata" poster="${item.poster || ''}">
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
                <p class="feed-toggle-nav">
                    <span>
                        ${navBtn(start > 0, '<< newer', 'newer')} | ${navBtn(end < tplFeed.items.length, 'older >>', 'older')}
                    </span>
                    <span class="feed-rss-link-wrapper">
                        <a href="/tpl/rss.xml" target="_blank" class="feed-rss-link" title="RSS Feed">RSS
                        <img src="../../assets/icons/rss.svg" class="feed-rss-icon" alt="RSS icon"></a>
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
        shouldUseMobileScrollLock() {
            return window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches;
        },
        lockMobileScroll() {
            if (!tplFeed.functions.shouldUseMobileScrollLock() || tplFeed.scrollLock.active) {
                return;
            }

            const body = document.body;
            tplFeed.scrollLock.y = window.pageYOffset || document.documentElement.scrollTop || 0;
            tplFeed.scrollLock.bodyStyles = {
                position: body.style.position,
                top: body.style.top,
                left: body.style.left,
                right: body.style.right,
                width: body.style.width,
                overflow: body.style.overflow
            };

            body.style.position = 'fixed';
            body.style.top = `-${tplFeed.scrollLock.y}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.width = '100%';
            body.style.overflow = 'hidden';
            tplFeed.scrollLock.active = true;
        },
        unlockMobileScroll() {
            if (!tplFeed.scrollLock.active) {
                return;
            }

            const body = document.body;
            const { bodyStyles, y } = tplFeed.scrollLock;
            body.style.position = bodyStyles.position || '';
            body.style.top = bodyStyles.top || '';
            body.style.left = bodyStyles.left || '';
            body.style.right = bodyStyles.right || '';
            body.style.width = bodyStyles.width || '';
            body.style.overflow = bodyStyles.overflow || '';
            tplFeed.scrollLock.active = false;
            window.scrollTo(0, y);
        },
        ensureLightbox() {
            if (tplFeed.lightbox) return tplFeed.lightbox;

            $('body').append(`
                <div class="feed-lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Expanded feed media">
                    <div class="feed-lightbox-panel">
                        <button type="button" class="feed-lightbox-close" aria-label="Close media viewer">close</button>
                        <div class="feed-lightbox-frame"></div>
                        <p class="feed-lightbox-caption"></p>
                        <p class="feed-lightbox-actions"></p>
                    </div>
                </div>
            `);

            tplFeed.lightbox = $('.feed-lightbox');
            tplFeed.lightbox.on('click', event => {
                if ($(event.target).is('.feed-lightbox, .feed-lightbox-close')) {
                    tplFeed.functions.closeLightbox();
                }
            });

            tplFeed.lightbox.find('.feed-lightbox-panel').on('click', event => {
                if (!$(event.target).is('.feed-lightbox-close')) {
                    event.stopPropagation();
                }
            });

            $(document).on('keydown', tplFeed.functions.handleLightboxKeydown);

            return tplFeed.lightbox;
        },
        openLightbox(mediaElement, externalLink) {
            const lightbox = tplFeed.functions.ensureLightbox();
            const media = $(mediaElement);
            const isVideo = media.is('video');
            const source = isVideo ? media.find('source').attr('src') || media.attr('src') : media.attr('src');
            const poster = isVideo ? media.attr('poster') || '' : '';
            const alt = media.attr('alt') || media.closest('.feed-item-container').find('.alt').text().trim();
            const frameMarkup = isVideo
                ? `<video class="feed-lightbox-media" controls autoplay playsinline preload="metadata" ${poster ? `poster="${poster}"` : ''}><source src="${source}" type="video/mp4">Your browser does not support the video tag.</video>`
                : `<img src="${source}" alt="${alt}" class="feed-lightbox-media">`;

            tplFeed.lastActiveElement = document.activeElement;
            lightbox.find('.feed-lightbox-frame').html(frameMarkup);
            lightbox.find('.feed-lightbox-actions').html(
                externalLink
                    ? `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="feed-lightbox-link">open link</a>`
                    : ''
            );
            document.documentElement.classList.add('feed-lightbox-open');
            $('body').addClass('feed-lightbox-open');
            tplFeed.functions.lockMobileScroll();
            lightbox.attr('aria-hidden', 'false').addClass('is-open');
            lightbox.find('.feed-lightbox-close').trigger('focus');
        },
        closeLightbox() {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) return;

            tplFeed.lightbox.find('video').each((_, video) => {
                video.pause();
                video.currentTime = 0;
            });
            tplFeed.lightbox.removeClass('is-open').attr('aria-hidden', 'true');
            tplFeed.lightbox.find('.feed-lightbox-frame, .feed-lightbox-actions').empty();
            tplFeed.lightbox.find('.feed-lightbox-caption').text('');
            document.documentElement.classList.remove('feed-lightbox-open');
            $('body').removeClass('feed-lightbox-open');
            tplFeed.functions.unlockMobileScroll();

            if (tplFeed.lastActiveElement && typeof tplFeed.lastActiveElement.focus === 'function') {
                tplFeed.lastActiveElement.focus();
            }
        },
        handleLightboxKeydown(event) {
            if (event.key === 'Escape') {
                tplFeed.functions.closeLightbox();
            }
        },
        mediaClick(event) {
            const media = event.target.closest('.feed-item');
            if (!media) return;

            const anchor = media.closest('a[href]');
            if (anchor && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1)) {
                return;
            }

            if (anchor) {
                event.preventDefault();
            }

            tplFeed.functions.openLightbox(media, anchor ? anchor.href : '');
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
        tplFeed.content.on('click', '.feed-item, a:has(.feed-item)', tplFeed.functions.mediaClick);
        window.addEventListener('hashchange', tplFeed.functions.scrollToHash);
    }
};

$(document).ready(tplFeed.init);