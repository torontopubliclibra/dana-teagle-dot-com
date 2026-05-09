const FEED_PAGE_SIZE = 10;
const NARROW_VIEWPORT_QUERY = '(max-width: 600px)';
const MOBILE_VIEWPORT_QUERY = '(max-width: 768px), (hover: none) and (pointer: coarse)';

const tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    lightbox: null,
    lastActiveElement: null,
    lastScrollPosition: 0,
    lastOpenedItemId: '',
    scrollLock: {
        active: false,
        y: 0,
        bodyStyles: {}
    },
    range: { start: 0, end: FEED_PAGE_SIZE },
    items: [],
    visibleItems: [],
    functions: {
        getItemIndex(id) {
            return tplFeed.items.findIndex(item => item.id === id);
        },
        getRangeEnd(start = tplFeed.range.start) {
            return Math.min(start + FEED_PAGE_SIZE, tplFeed.items.length);
        },
        setRange(start) {
            tplFeed.range.start = Math.max(0, start);
            tplFeed.range.end = tplFeed.functions.getRangeEnd(tplFeed.range.start);
        },
        setRangeForIndex(index) {
            const start = Math.floor(index / FEED_PAGE_SIZE) * FEED_PAGE_SIZE;
            tplFeed.functions.setRange(start);
        },
        renderCurrentRange() {
            const { start, end } = tplFeed.range;
            tplFeed.visibleItems = tplFeed.items.slice(start, end);
            tplFeed.content.html(tplFeed.visibleItems.map(tplFeed.functions.feedItemHTML).join(''));
            tplFeed.functions.updateToggle();
        },
        scrollItemIntoView(id, block = 'start', offset = 0) {
            const el = document.getElementById(id);
            if (!el) {
                return false;
            }

            el.scrollIntoView({ behavior: 'smooth', block });
            if (offset) {
                setTimeout(() => {
                    const rect = el.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    window.scrollTo({ top: rect.top + scrollTop - offset, behavior: 'auto' });
                }, 350);
            }

            return true;
        },
        scrollToPageTop() {
            setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            }, 100);
        },
        getAltElements(id) {
            return {
                altElement: $(`#${id} .alt`),
                altButton: $(`#${id} button`)
            };
        },
        buildFeedMedia(item) {
            const mediaMarkup = item.type === 'video'
                ? `<video class="feed-item" controls preload="metadata" poster="${item.poster || ''}">
                        <source src="${item.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`
                : `<img src="${item.url}" alt="${item.alt}" class="feed-item">`;

            if (!item.link) {
                return mediaMarkup;
            }

            return `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${mediaMarkup}</a>`;
        },
        buildLightboxMedia({ isVideo, source, poster, alt }) {
            if (isVideo) {
                return `<video class="feed-lightbox-media" controls autoplay playsinline preload="metadata" ${poster ? `poster="${poster}"` : ''}><source src="${source}" type="video/mp4">Your browser does not support the video tag.</video>`;
            }

            return `<img src="${source}" alt="${alt}" class="feed-lightbox-media">`;
        },
        scrollToHash() {
            const hash = window.location.hash.substring(1);
            if (!hash) return;

            const idx = tplFeed.functions.getItemIndex(hash);
            if (idx === -1) return;

            if (idx < tplFeed.range.start || idx >= tplFeed.range.end) {
                tplFeed.functions.setRangeForIndex(idx);
                tplFeed.functions.renderCurrentRange();

                const tryScroll = () => {
                    if (document.getElementById(hash)) {
                        setTimeout(() => {
                            tplFeed.functions.scrollItemIntoView(hash, 'center', tplFeed.functions.preferredScrollOffset());
                        }, 250);
                    } else {
                        requestAnimationFrame(tryScroll);
                    }
                };
                tryScroll();
            } else {
                setTimeout(() => tplFeed.functions.scrollItemIntoView(hash), 250);
            }
        },
        feedDisplay(start, end) {
            tplFeed.range.start = start;
            tplFeed.range.end = Math.min(end, tplFeed.items.length);
            tplFeed.functions.renderCurrentRange();
        },
        feedItemHTML(item) {
            const permalink = `torontopubliclibra.com/feed#${item.id}`;
            const mailto = `mailto:torontopubliclibra@gmail.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
            const dateLink = `<a href="#${item.id}" class="permalink-link">${item.date}</a>`;
            const mediaTag = tplFeed.functions.buildFeedMedia(item);
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
            tplFeed.functions.scrollToPageTop();

            if (dir === 'newer' && tplFeed.range.start > 0) {
                tplFeed.functions.setRange(tplFeed.range.start - FEED_PAGE_SIZE);
            } else if (dir === 'older' && tplFeed.range.end < tplFeed.items.length) {
                tplFeed.functions.setRange(tplFeed.range.start + FEED_PAGE_SIZE);
            }

            tplFeed.functions.renderCurrentRange();
        },
        newer() { tplFeed.functions.changeRange('newer'); },
        older() { tplFeed.functions.changeRange('older'); },
        resetAltToggles() {
            tplFeed.visibleItems.forEach(item => {
                const { altElement, altButton } = tplFeed.functions.getAltElements(item.id);
                altElement.removeClass('alt-visible');
                altButton.removeClass('selected');
            });
        },
        altToggle(id) {
            const { altElement, altButton } = tplFeed.functions.getAltElements(id);

            if (altElement.hasClass('alt-visible')) {
                altElement.removeClass('alt-visible');
                altButton.removeClass('selected');
            } else {
                tplFeed.functions.resetAltToggles();
                altElement.addClass('alt-visible');
                altButton.addClass('selected');
            }
        },
        isMobileViewport() {
            return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
        },
        preferredScrollOffset() {
            return window.matchMedia(NARROW_VIEWPORT_QUERY).matches ? 290 : 260;
        },
        lockPageScroll() {
            if (tplFeed.scrollLock.active) {
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
        unlockPageScroll() {
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
            const frameMarkup = tplFeed.functions.buildLightboxMedia({ isVideo, source, poster, alt });

            tplFeed.lastActiveElement = document.activeElement;
            tplFeed.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
            tplFeed.lastOpenedItemId = media.closest('.feed-item-container').attr('id') || '';
            lightbox.find('.feed-lightbox-frame').html(frameMarkup);
            lightbox.find('.feed-lightbox-actions').html(
                externalLink
                    ? `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="feed-lightbox-link">open link</a>`
                    : ''
            );
            $('body').addClass('feed-lightbox-open');
            tplFeed.functions.lockPageScroll();
            lightbox.attr('aria-hidden', 'false').addClass('is-open');
            lightbox.find('.feed-lightbox-close').trigger('focus');
        },
        closeLightbox() {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) return;
            const restoreY = tplFeed.scrollLock.active ? tplFeed.scrollLock.y : tplFeed.lastScrollPosition;

            tplFeed.lightbox.find('video').each((_, video) => {
                video.pause();
                video.currentTime = 0;
            });
            tplFeed.lightbox.removeClass('is-open').attr('aria-hidden', 'true');
            tplFeed.lightbox.find('.feed-lightbox-frame, .feed-lightbox-actions').empty();
            tplFeed.lightbox.find('.feed-lightbox-caption').text('');
            $('body').removeClass('feed-lightbox-open');
            tplFeed.functions.unlockPageScroll();

            if (tplFeed.lastActiveElement && typeof tplFeed.lastActiveElement.focus === 'function') {
                try {
                    tplFeed.lastActiveElement.focus({ preventScroll: true });
                } catch (_error) {
                    tplFeed.lastActiveElement.focus();
                }
            }

            window.scrollTo(0, restoreY);
            requestAnimationFrame(() => window.scrollTo(0, restoreY));

            if (tplFeed.functions.isMobileViewport() && tplFeed.lastOpenedItemId) {
                const opener = document.getElementById(tplFeed.lastOpenedItemId);
                if (opener) {
                    requestAnimationFrame(() => {
                        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
                        if (Math.abs(currentY - restoreY) > 6) {
                            const rect = opener.getBoundingClientRect();
                            const targetY = rect.top + currentY - tplFeed.functions.preferredScrollOffset();
                            window.scrollTo(0, targetY);
                        }
                    });
                }
            }

            tplFeed.lastOpenedItemId = '';
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