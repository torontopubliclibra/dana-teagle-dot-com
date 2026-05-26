const FEED_PAGE_SIZE = 10;
const NARROW_VIEWPORT_QUERY = '(max-width: 600px)';
const MOBILE_VIEWPORT_QUERY = '(max-width: 768px), (hover: none) and (pointer: coarse)';

const tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    lightbox: null,
    lightboxItems: [],
    lightboxIndex: -1,
    lightboxTransitionDirection: '',
    lastActiveElement: null,
    lastScrollPosition: 0,
    lightboxOpenedItemId: '',
    lastOpenedItemId: '',
    activeTag: '',
    lightboxTouch: {
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
        tracking: false
    },
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
        getActiveTag() {
            const searchParams = new URLSearchParams(window.location.search);
            const tag = (searchParams.get('tag') || '').trim();

            return tag ? tag.toLowerCase() : '';
        },
        updateActiveTagLabel() {
            const label = $('.feed-tag-label');

            if (!label.length) {
                return;
            }

            if (!tplFeed.activeTag) {
                label.text('').attr('hidden', true);
                return;
            }

            label.text(` / ${tplFeed.activeTag}`).removeAttr('hidden');
        },
        filterItemsByTag(items, tag) {
            if (!tag) {
                return items;
            }

            return items.filter(item => Array.isArray(item.tags) && item.tags.some(itemTag => String(itemTag).toLowerCase() === tag));
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
        buildLightboxHeaderMeta({ id, date }) {
            if (!id) {
                return '';
            }

            const permalink = `torontopubliclibra.com/feed/${id}`;
            const mailto = `mailto:dana@torontopubliclibra.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
            const dateMarkup = date
                ? `<span class="feed-lightbox-date-text">>> ${date}</span>`
                : `<span class="feed-lightbox-date-text">permalink</span>`;

            return `<span class="feed-lightbox-date-wrap">${dateMarkup}</span><span class="feed-lightbox-header-buttons"><button type="button" class="feed-lightbox-alt-toggle" aria-pressed="false">alt</button><a href="${mailto}" class="feed-lightbox-reply-link" target="_blank" rel="noopener noreferrer">reply</a></span>`;
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
        refreshLightboxItems() {
            tplFeed.lightboxItems = Array.from(document.querySelectorAll('.feed-items .feed-item'));
        },
        feedItemHTML(item) {
            const permalink = `torontopubliclibra.com/feed/${item.id}`;
            const mailto = `mailto:dana@torontopubliclibra.com?subject=${encodeURIComponent('Re: ' + permalink)}`;
            const dateLink = `<a href="#${item.id}" class="permalink-link">${item.date}</a>`;
            const mediaTag = tplFeed.functions.buildFeedMedia(item);
            return `<div class="feed-item-container" id="${item.id}">${mediaTag}<p class="alt">${item.alt}</p><p>>> ${dateLink} // <a href="${mailto}" class="reply-link" target="_blank" rel="noopener noreferrer">reply</a> // <button onclick=\"tplFeed.functions.altToggle('${item.id}')\">alt</button></p></div>`;
        },
        parseFeedDate(dateText) {
            const match = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.exec((dateText || '').trim());
            if (!match) {
                return null;
            }

            const day = Number(match[1]);
            const month = Number(match[2]);
            const year = Number(match[3]);

            if (!day || !month || !year) {
                return null;
            }

            return { day, month, year };
        },
        formatFeedDateRange(newestDate, oldestDate) {
            const start = tplFeed.functions.parseFeedDate(oldestDate);
            const end = tplFeed.functions.parseFeedDate(newestDate);

            if (!start || !end) {
                return `${newestDate} - ${oldestDate}`;
            }

            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            const startMonth = monthNames[start.month - 1];
            const endMonth = monthNames[end.month - 1];

            if (!startMonth || !endMonth) {
                return `${newestDate} - ${oldestDate}`;
            }

            if (start.year === end.year && start.month === end.month) {
                return `${startMonth} ${start.day}-${end.day}, ${start.year}`;
            }

            if (start.year === end.year) {
                return `${startMonth} ${start.day}-${endMonth} ${end.day}, ${start.year}`;
            }

            return `${startMonth} ${start.day}, ${start.year}-${endMonth} ${end.day}, ${end.year}`;
        },
        updateToggle() {
            const { start, end } = tplFeed.range;
            const navParts = [];
            const firstVisibleItem = tplFeed.visibleItems[0];
            const lastVisibleItem = tplFeed.visibleItems[tplFeed.visibleItems.length - 1];
            const newestDate = firstVisibleItem ? firstVisibleItem.date : '';
            const oldestDate = lastVisibleItem ? lastVisibleItem.date : '';
            const dateRangeMarkup = (newestDate && oldestDate)
                ? `<span class="feed-page-date-range">>> ${tplFeed.functions.formatFeedDateRange(newestDate, oldestDate)}</span>`
                : '';
            const navBtn = (cond, text, fn) => cond
                ? `<button class="range" onclick="tplFeed.functions.${fn}()">${text}</button>`
                : `<span class="year-selected">${text}</span>`;

            navParts.push(navBtn(start > 0, '<-', 'newest'));

            navParts.push(navBtn(start > 0, '<< newer', 'newer'));
            navParts.push(navBtn(end < tplFeed.items.length, 'older >>', 'older'));

            navParts.push(navBtn(end < tplFeed.items.length, '->', 'oldest'));

            tplFeed.toggle.html(`
                <p class="feed-toggle-nav">
                    ${dateRangeMarkup}
                    <span class="feed-nav-controls">
                        ${navParts.join(' | ')}
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
            } else if (dir === 'newest' && tplFeed.range.start > 0) {
                tplFeed.functions.setRange(0);
            } else if (dir === 'oldest' && tplFeed.range.end < tplFeed.items.length) {
                const lastPageStart = Math.max(0, Math.floor((tplFeed.items.length - 1) / FEED_PAGE_SIZE) * FEED_PAGE_SIZE);
                tplFeed.functions.setRange(lastPageStart);
            }

            tplFeed.functions.renderCurrentRange();
        },
        newer() { tplFeed.functions.changeRange('newer'); },
        older() { tplFeed.functions.changeRange('older'); },
        newest() { tplFeed.functions.changeRange('newest'); },
        oldest() { tplFeed.functions.changeRange('oldest'); },
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
        resetLightboxTouchState() {
            tplFeed.lightboxTouch.startX = 0;
            tplFeed.lightboxTouch.startY = 0;
            tplFeed.lightboxTouch.deltaX = 0;
            tplFeed.lightboxTouch.deltaY = 0;
            tplFeed.lightboxTouch.tracking = false;
        },
        getLightboxTouchPoint(event) {
            const originalEvent = event.originalEvent || event;
            if (!originalEvent) {
                return null;
            }

            if (originalEvent.touches && originalEvent.touches.length) {
                return originalEvent.touches[0];
            }

            if (originalEvent.changedTouches && originalEvent.changedTouches.length) {
                return originalEvent.changedTouches[0];
            }

            return null;
        },
        handleLightboxTouchStart(event) {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open') || !tplFeed.functions.isMobileViewport()) {
                return;
            }

            const point = tplFeed.functions.getLightboxTouchPoint(event);
            if (!point) {
                return;
            }

            tplFeed.lightboxTouch.startX = point.clientX;
            tplFeed.lightboxTouch.startY = point.clientY;
            tplFeed.lightboxTouch.deltaX = 0;
            tplFeed.lightboxTouch.deltaY = 0;
            tplFeed.lightboxTouch.tracking = true;
        },
        handleLightboxTouchMove(event) {
            if (!tplFeed.lightboxTouch.tracking || !tplFeed.functions.isMobileViewport()) {
                return;
            }

            const point = tplFeed.functions.getLightboxTouchPoint(event);
            if (!point) {
                return;
            }

            tplFeed.lightboxTouch.deltaX = point.clientX - tplFeed.lightboxTouch.startX;
            tplFeed.lightboxTouch.deltaY = point.clientY - tplFeed.lightboxTouch.startY;

            if (Math.abs(tplFeed.lightboxTouch.deltaX) > Math.abs(tplFeed.lightboxTouch.deltaY) && event.cancelable) {
                event.preventDefault();
            }
        },
        handleLightboxTouchEnd(event) {
            if (!tplFeed.lightboxTouch.tracking) {
                return;
            }

            const point = tplFeed.functions.getLightboxTouchPoint(event);
            if (point) {
                tplFeed.lightboxTouch.deltaX = point.clientX - tplFeed.lightboxTouch.startX;
                tplFeed.lightboxTouch.deltaY = point.clientY - tplFeed.lightboxTouch.startY;
            }

            const absX = Math.abs(tplFeed.lightboxTouch.deltaX);
            const absY = Math.abs(tplFeed.lightboxTouch.deltaY);
            const swipeThreshold = 50;
            const isHorizontalSwipe = absX > swipeThreshold && absX > absY;

            if (isHorizontalSwipe) {
                const direction = tplFeed.lightboxTouch.deltaX < 0 ? 'next' : 'prev';
                tplFeed.functions.navigateLightbox(direction);
            }

            tplFeed.functions.resetLightboxTouchState();
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
                        <div class="feed-lightbox-header">
                            <div class="feed-lightbox-header-meta"></div>
                            <button type="button" class="feed-lightbox-close" aria-label="Close media viewer">close</button>
                        </div>
                        <div class="feed-lightbox-nav-row">
                            <button type="button" class="feed-lightbox-nav feed-lightbox-prev" aria-label="Previous feed item">&larr;</button>
                            <div class="feed-lightbox-frame"></div>
                            <button type="button" class="feed-lightbox-nav feed-lightbox-next" aria-label="Next feed item">&rarr;</button>
                        </div>
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

            tplFeed.lightbox.find('.feed-lightbox-panel').on('click', '.feed-lightbox-alt-toggle', event => {
                event.preventDefault();
                tplFeed.functions.toggleLightboxAlt();
            });

            tplFeed.lightbox.find('.feed-lightbox-panel').on('click', '.feed-lightbox-prev', () => {
                tplFeed.functions.navigateLightbox('prev');
            });

            tplFeed.lightbox.find('.feed-lightbox-panel').on('click', '.feed-lightbox-next', () => {
                tplFeed.functions.navigateLightbox('next');
            });

            tplFeed.lightbox.find('.feed-lightbox-panel').on('touchstart', '.feed-lightbox-frame', tplFeed.functions.handleLightboxTouchStart);
            tplFeed.lightbox.find('.feed-lightbox-panel').on('touchmove', '.feed-lightbox-frame', tplFeed.functions.handleLightboxTouchMove);
            tplFeed.lightbox.find('.feed-lightbox-panel').on('touchend touchcancel', '.feed-lightbox-frame', tplFeed.functions.handleLightboxTouchEnd);

            $(document).on('keydown', tplFeed.functions.handleLightboxKeydown);

            return tplFeed.lightbox;
        },
        renderLightboxItem() {
            const lightbox = tplFeed.functions.ensureLightbox();
            const { lightboxItems, lightboxIndex } = tplFeed;

            if (!lightboxItems.length || lightboxIndex < 0 || lightboxIndex >= lightboxItems.length) {
                return;
            }

            const media = $(lightboxItems[lightboxIndex]);
            const isVideo = media.is('video');
            const source = isVideo ? media.find('source').attr('src') || media.attr('src') : media.attr('src');
            const poster = isVideo ? media.attr('poster') || '' : '';
            const alt = media.attr('alt') || media.closest('.feed-item-container').find('.alt').text().trim();
            const itemId = media.closest('.feed-item-container').attr('id') || '';
            const item = tplFeed.items.find(entry => entry.id === itemId);
            const anchor = media.closest('a[href]');
            const externalLink = anchor.length ? anchor.attr('href') : '';
            const canGoPrev = lightboxIndex > 0 || tplFeed.range.start > 0;
            const canGoNext = lightboxIndex < lightboxItems.length - 1 || tplFeed.range.end < tplFeed.items.length;
            const mediaMarkup = tplFeed.functions.buildLightboxMedia({ isVideo, source, poster, alt });
            const frameMarkup = `<div class="feed-lightbox-media-shell">${mediaMarkup}<p class="feed-lightbox-alt">${alt}</p></div>`;
            const headerMeta = tplFeed.functions.buildLightboxHeaderMeta({
                id: itemId,
                date: item ? item.date : ''
            });

            tplFeed.lastOpenedItemId = itemId;
            lightbox.find('.feed-lightbox-frame').html(frameMarkup);
            if (tplFeed.lightboxTransitionDirection) {
                lightbox.find('.feed-lightbox-media-shell').addClass(`is-flip-${tplFeed.lightboxTransitionDirection}`);
            }
            lightbox.find('.feed-lightbox-header-meta').html(headerMeta);
            lightbox.find('.feed-lightbox-panel').attr('data-alt-text', alt || '');
            lightbox.find('.feed-lightbox-alt-toggle').attr('aria-pressed', 'false').removeClass('selected');
            lightbox.find('.feed-lightbox-prev').prop('disabled', !canGoPrev).attr('aria-disabled', (!canGoPrev).toString());
            lightbox.find('.feed-lightbox-next').prop('disabled', !canGoNext).attr('aria-disabled', (!canGoNext).toString());
            lightbox.find('.feed-lightbox-caption').text('');
            lightbox.find('.feed-lightbox-alt').removeClass('alt-visible');
            lightbox.find('.feed-lightbox-actions').html(
                externalLink
                    ? `<a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="feed-lightbox-link">open link</a>`
                    : ''
            );
            tplFeed.lightboxTransitionDirection = '';
        },
        navigateLightbox(direction) {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) {
                return;
            }

            const delta = direction === 'next' ? 1 : -1;
            const nextIndex = tplFeed.lightboxIndex + delta;
            if (nextIndex >= 0 && nextIndex < tplFeed.lightboxItems.length) {
                tplFeed.lightboxIndex = nextIndex;
                tplFeed.lightboxTransitionDirection = direction;
                tplFeed.functions.renderLightboxItem();
                return;
            }

            if (direction === 'next' && tplFeed.range.end < tplFeed.items.length) {
                tplFeed.functions.setRange(tplFeed.range.start + FEED_PAGE_SIZE);
                tplFeed.functions.renderCurrentRange();
                tplFeed.functions.refreshLightboxItems();
                tplFeed.lightboxIndex = 0;
                tplFeed.lightboxTransitionDirection = direction;
                tplFeed.functions.renderLightboxItem();
                return;
            }

            if (direction === 'prev' && tplFeed.range.start > 0) {
                tplFeed.functions.setRange(tplFeed.range.start - FEED_PAGE_SIZE);
                tplFeed.functions.renderCurrentRange();
                tplFeed.functions.refreshLightboxItems();
                tplFeed.lightboxIndex = Math.max(0, tplFeed.lightboxItems.length - 1);
                tplFeed.lightboxTransitionDirection = direction;
                tplFeed.functions.renderLightboxItem();
                return;
            }
        },
        openLightbox(mediaElement) {
            tplFeed.functions.refreshLightboxItems();
            const items = tplFeed.lightboxItems;
            const index = items.indexOf(mediaElement);
            const lightbox = tplFeed.functions.ensureLightbox();
            const openedItemId = $(mediaElement).closest('.feed-item-container').attr('id') || '';

            if (index === -1) {
                return;
            }

            tplFeed.lightboxItems = items;
            tplFeed.lightboxIndex = index;
            tplFeed.lightboxTransitionDirection = '';
            tplFeed.lastActiveElement = document.activeElement;
            tplFeed.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
            tplFeed.lightboxOpenedItemId = openedItemId;
            tplFeed.functions.resetLightboxTouchState();
            tplFeed.functions.renderLightboxItem();
            $('body').addClass('feed-lightbox-open');
            tplFeed.functions.lockPageScroll();
            lightbox.attr('aria-hidden', 'false').addClass('is-open');
            lightbox.find('.feed-lightbox-close').trigger('focus');
        },
        closeLightbox() {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) return;
            const closedItemId = tplFeed.lastOpenedItemId;
            const navigatedWithinLightbox = Boolean(closedItemId) && closedItemId !== tplFeed.lightboxOpenedItemId;
            const restoreY = tplFeed.scrollLock.active ? tplFeed.scrollLock.y : tplFeed.lastScrollPosition;

            tplFeed.lightbox.find('video').each((_, video) => {
                video.pause();
                video.currentTime = 0;
            });
            tplFeed.lightbox.removeClass('is-open').attr('aria-hidden', 'true');
            tplFeed.lightbox.find('.feed-lightbox-frame, .feed-lightbox-actions, .feed-lightbox-header-meta').empty();
            tplFeed.lightbox.find('.feed-lightbox-panel').removeAttr('data-alt-text');
            tplFeed.lightbox.find('.feed-lightbox-caption').text('');
            tplFeed.lightboxItems = [];
            tplFeed.lightboxIndex = -1;
            tplFeed.lightboxTransitionDirection = '';
            tplFeed.functions.resetLightboxTouchState();
            $('body').removeClass('feed-lightbox-open');
            tplFeed.functions.unlockPageScroll();

            if (tplFeed.lastActiveElement && typeof tplFeed.lastActiveElement.focus === 'function') {
                try {
                    tplFeed.lastActiveElement.focus({ preventScroll: true });
                } catch (_error) {
                    tplFeed.lastActiveElement.focus();
                }
            }

            if (navigatedWithinLightbox) {
                const didScroll = tplFeed.functions.scrollItemIntoView(
                    closedItemId,
                    'start',
                    tplFeed.functions.preferredScrollOffset()
                );

                if (!didScroll) {
                    window.scrollTo(0, restoreY);
                    requestAnimationFrame(() => window.scrollTo(0, restoreY));
                }
            } else {
                window.scrollTo(0, restoreY);
                requestAnimationFrame(() => window.scrollTo(0, restoreY));
            }

            tplFeed.lightboxOpenedItemId = '';
            tplFeed.lastOpenedItemId = '';
        },
        handleLightboxKeydown(event) {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) {
                return;
            }

            if (event.key === 'Escape') {
                tplFeed.functions.closeLightbox();
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                tplFeed.functions.navigateLightbox('prev');
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                tplFeed.functions.navigateLightbox('next');
            }
        },
        toggleLightboxAlt() {
            if (!tplFeed.lightbox || !tplFeed.lightbox.hasClass('is-open')) {
                return;
            }

            const altButton = tplFeed.lightbox.find('.feed-lightbox-alt-toggle');
            const altOverlay = tplFeed.lightbox.find('.feed-lightbox-alt');
            const isVisible = altButton.attr('aria-pressed') === 'true';

            if (isVisible) {
                altOverlay.removeClass('alt-visible');
                altButton.attr('aria-pressed', 'false').removeClass('selected');
                return;
            }

            altOverlay.addClass('alt-visible');
            altButton.attr('aria-pressed', 'true').addClass('selected');
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

            tplFeed.functions.openLightbox(media);
        },
    },
    init() {
        tplFeed.activeTag = tplFeed.functions.getActiveTag();
        tplFeed.functions.updateActiveTagLabel();

        fetch('../data/feed.json')
            .then(response => response.json())
            .then(data => {
                const feedItems = Array.isArray(data) ? data : Object.values(data)[0];
                tplFeed.items = tplFeed.functions.filterItemsByTag(feedItems, tplFeed.activeTag);
                tplFeed.functions.setRange(0);
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                tplFeed.functions.scrollToHash();
            })
            .catch(error => console.log(error));
        tplFeed.content.on('click', '.feed-item, a:has(.feed-item)', tplFeed.functions.mediaClick);
        window.addEventListener('hashchange', tplFeed.functions.scrollToHash);
    }
};

$(document).ready(tplFeed.init);