const tplMixes = {
    nav: $(".tpl-page-nav"),
    content: $(".tpl-page-text"),
    heading: $(".tpl-page-heading"),
    mixes: [],
    range: "8",
    query: "",
    stream: localStorage['stream'] || "tidal",
    searchBar: `<p>search: <input type="text" id="mix-search-input" placeholder="by number, title, or artist" oninput="tplMixes.functions.updateQuery(this.value)"></p>`,
    searchStatus: `<p class="mix-search-status" id="mix-search-status"><span class="mix-search-query-display" id="mix-search-query-display"></span><button onclick="document.getElementById('mix-search-input').value=''; tplMixes.functions.updateQuery('');" class="range" id="mix-search-clear">clear search</button></p>`,
    streamSelect: "",
    rangeSelect: "",
    helpers: {
        getMaxMixNumber() {
            return tplMixes.mixes.length > 0
                ? Math.max(...tplMixes.mixes.map(mix => Number(mix.number)))
                : 198;
        },
        getRangeDefinitions(maxNum = tplMixes.helpers.getMaxMixNumber()) {
            return [
                { id: "1", label: "#1-25", min: 1, max: 25 },
                { id: "2", label: "#26-50", min: 26, max: 50 },
                { id: "3", label: "#51-75", min: 51, max: 75 },
                { id: "4", label: "#76-100", min: 76, max: 100 },
                { id: "5", label: "#101-125", min: 101, max: 125 },
                { id: "6", label: "#126-150", min: 126, max: 150 },
                { id: "7", label: "#151-175", min: 151, max: 175 },
                { id: "8", label: `#176-${maxNum}`, min: 176, max: maxNum }
            ];
        },
        getRangeDefinition(rangeId) {
            return tplMixes.helpers.getRangeDefinitions().find(range => range.id === rangeId) || tplMixes.helpers.getRangeDefinitions()[0];
        },
        getRangeIdForMix(mixNumber) {
            const match = tplMixes.helpers.getRangeDefinitions().find(range => mixNumber >= range.min && mixNumber <= range.max);
            return match ? match.id : null;
        },
        getStreamLink(mix, stream = tplMixes.stream) {
            const streamLinks = {
                tidal: mix.tidal,
                spotify: mix.spotify,
                apple: mix.apple
            };
            return streamLinks[stream] || null;
        },
        getFeaturingList(features) {
            if (!Array.isArray(features) || features.length === 0) {
                return [];
            }

            if (features.length === 1 && typeof features[0] === "string" && features[0].includes(',')) {
                return features[0].split(',').map(feature => feature.trim()).filter(Boolean);
            }

            return features.map(feature => `${feature}`.trim()).filter(Boolean);
        },
        parseFeaturing(features) {
            const parsedFeatures = tplMixes.helpers.getFeaturingList(features);
            return parsedFeatures.length > 0
                ? `<div class="featuring-bar">${parsedFeatures.join(', ')}</div>`
                : "";
        },
        renderMixDetails(mix, featuringBar, numberHtml, titleHtml, disabled) {
            return `
                <div class="mix-details-flex">
                    <div class="mix-image"><img src="${mix.image}" alt="${mix.title} cover art"/></div>
                    <div class="mix-info">
                        <p><small>${numberHtml}</small><br/>${titleHtml}</p>
                        <img src="../assets/icons/external-link.svg" class="icon${disabled ? ' disabled' : ''}" alt="external link icon">
                    </div>
                </div>
                ${featuringBar}
            `;
        },
        renderRangeButtons(ranges, currentIndex, callbackName) {
            return ranges.map((range, idx) => idx === currentIndex
                ? `<button class="range-selected" disabled>${range.label}</button>`
                : `<button class="range" onclick="tplMixes.functions.${callbackName}(${idx})">${range.label}</button>`
            ).join(' ');
        },
        renderStreamSelect(stream = tplMixes.stream) {
            const streams = ["tidal", "spotify", "apple"];
            const buttons = streams.map(option => option === stream
                ? `<span class="range-selected">${option}</span>`
                : `<button class="range" onclick="tplMixes.functions.streamSet('${option}')">${option}</button>`
            );
            return `<p class="stream-select">platform: ${buttons.join(' | ')}</p>`;
        },
        getFilteredMixes() {
            const query = tplMixes.query.trim().toLowerCase();

            if (!query) {
                const { min, max } = tplMixes.helpers.getRangeDefinition(tplMixes.range);
                return tplMixes.mixes.filter(mix => {
                    const mixNumber = Number(mix.number);
                    return mixNumber >= min && mixNumber <= max;
                });
            }

            return tplMixes.mixes.filter(mix => {
                const featuring = tplMixes.helpers.getFeaturingList(mix.featuring);
                return mix.title.toLowerCase().includes(query)
                    || `${mix.number}`.includes(query)
                    || featuring.some(artist => artist.toLowerCase().includes(query));
            }).slice().reverse();
        },
        renderFeaturingBar(mix, query) {
            const featuring = tplMixes.helpers.getFeaturingList(mix.featuring);
            if (!query) {
                return tplMixes.helpers.parseFeaturing(featuring);
            }
            return featuring.length > 0
                ? `<div class="featuring-bar">${featuring.map(artist => tplMixes.functions.highlightMatch(artist, query)).join(', ')}</div>`
                : "";
        },
        renderMixCard(mix, query) {
            const link = tplMixes.helpers.getStreamLink(mix);
            const disabled = !link;
            const numberHtml = query
                ? tplMixes.functions.highlightMatch(`#${mix.number}`, query)
                : `#${mix.number} \\`;
            const titleHtml = query
                ? tplMixes.functions.highlightMatch(mix.title, query)
                : mix.title;
            const details = tplMixes.helpers.renderMixDetails(
                mix,
                tplMixes.helpers.renderFeaturingBar(mix, query),
                numberHtml,
                titleHtml,
                disabled
            );

            return link
                ? `<a id="${mix.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}</a>`
                : `<div id="${mix.number}" class="sub mix mix-flex disabled">${details}</div>`;
        },
        scrollAndFocusElement(el) {
            const rect = el.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const isMobile = window.matchMedia('(max-width: 600px)').matches;
            const offset = isMobile ? 290 : 260;

            window.scrollTo({
                top: rect.top + scrollTop - offset,
                behavior: 'smooth'
            });

            setTimeout(() => {
                el.setAttribute('tabindex', '-1');
                el.focus({ preventScroll: true });
            }, 350);
        },
        scrollToMix(hash, initialDelay = 0) {
            let pollCount = 0;
            const maxPolls = 40;
            const pollForElement = () => {
                const el = document.getElementById(hash);
                if (el && el.offsetParent !== null) {
                    setTimeout(() => tplMixes.helpers.scrollAndFocusElement(el), 250);
                    return;
                }

                if (pollCount < maxPolls) {
                    pollCount += 1;
                    setTimeout(pollForElement, 50);
                }
            };

            setTimeout(pollForElement, initialDelay);
        }
    },
    functions: {
        updateQuery(value) {
            tplMixes.query = value;
            const hasQuery = !!value.trim();
            $(".range-select").css('display', hasQuery ? 'none' : 'flex');
            $("#scroll-to-top").toggle(hasQuery);
            $("#mix-search-status").css('display', hasQuery ? 'flex' : 'none');
            $("#mix-search-query-display").text(`"${value.trim()}"`);
            tplMixes.functions.mixDisplay();
        },
        artistIndexSearch(artist) {
            tplMixes.functions.exitIndex();
            setTimeout(() => {
                const input = document.getElementById('mix-search-input');
                if (input) {
                    input.value = artist;
                    input.focus();
                }
                tplMixes.functions.updateQuery(artist);
            }, 0);
        },
        showIndex() {
            if (window.location.hash !== '#index') {
                window.location.hash = 'index';
            }

            const artistSet = new Set();
            tplMixes.mixes.forEach(mix => {
                tplMixes.helpers.getFeaturingList(mix.featuring).forEach(artist => artistSet.add(artist));
            });

            const artists = Array.from(artistSet).sort((a, b) => a.localeCompare(b));
            const ranges = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => ({ label: `/${char}`, char }));
            ranges.push({ label: '/#', char: '#' });

            if (typeof tplMixes.artistIndexPage !== 'number') {
                tplMixes.artistIndexPage = 0;
            }

            const currentRange = ranges[tplMixes.artistIndexPage];
            const filteredArtists = artists.filter(artist => {
                const firstChar = (artist[0] || '').toUpperCase();
                return currentRange.char === '#'
                    ? firstChar >= '0' && firstChar <= '9'
                    : firstChar === currentRange.char;
            });

            let html = `<p><button class="range" onclick="tplMixes.functions.exitIndex()">&lt; Back to Mixes</button></p>`;
            html += `<div class="artist-index-ranges">`;
            html += tplMixes.helpers.renderRangeButtons(ranges, tplMixes.artistIndexPage, 'showIndexPage');
            html += `</div><hr class="artist-index-separator"/>`;
            html += `<ul class="artist-index">`;

            filteredArtists.forEach(artist => {
                const safeArtist = artist.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                html += `<li>>> <a href="#" class="artist-index-link" onclick="tplMixes.functions.artistIndexSearch('${safeArtist}');return false;">${artist}</a></li>`;
            });

            html += `</ul><hr/>`;

            tplMixes.heading.text("rusty mixes artist index");
            tplMixes.nav.html("");
            tplMixes.content.html(html);
            $("#scroll-to-top").show();

            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        },
        showIndexPage(page) {
            tplMixes.artistIndexPage = page;
            tplMixes.query = "";
            tplMixes.functions.showIndex();
        },
        exitIndex() {
            tplMixes.functions.navDisplay();
            tplMixes.heading.text("rusty mixes");

            if (window.location.hash === '#index') {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }

            $("#scroll-to-top").hide();
            tplMixes.functions.mixDisplay();
        },
        updateRangeNav() {
            const ranges = tplMixes.helpers.getRangeDefinitions();
            const maxNum = tplMixes.helpers.getMaxMixNumber();
            const currentIndex = ranges.findIndex(range => range.id === tplMixes.range);
            const currentRange = ranges[currentIndex] || ranges[0];

            tplMixes.rangeSelect = `<p class="range-select">
                <span class="mix-range-label" id="range-label">>> ${currentRange.label}</span>
                <span class="mix-nav-controls">
                    <button class="range" id="oldest-btn" onclick="tplMixes.functions.oldest();" ${currentIndex <= 0 ? 'disabled' : ''}>&lt;-</button> |
                    <button class="range" id="older-btn" onclick="tplMixes.functions.older();" ${currentIndex <= 0 ? 'disabled' : ''}>&lt;&lt;<span class="mix-nav-desktop-label"> older</span></button> |
                    <button class="range" id="newer-btn" onclick="tplMixes.functions.newer();" ${currentIndex === ranges.length - 1 ? 'disabled' : ''}><span class="mix-nav-desktop-label">newer </span>&gt;&gt;</button> |
                    <button class="range" id="newest-btn" onclick="tplMixes.functions.newest();" ${currentIndex === ranges.length - 1 ? 'disabled' : ''}>-&gt;</button>
                </span>
            </p>`;
        },
        older() {
            const ranges = tplMixes.helpers.getRangeDefinitions();
            const currentIndex = ranges.findIndex(range => range.id === tplMixes.range);
            if (currentIndex > 0) {
                tplMixes.functions.rangeSet(ranges[currentIndex - 1].id);
            }
        },
        newer() {
            const ranges = tplMixes.helpers.getRangeDefinitions();
            const currentIndex = ranges.findIndex(range => range.id === tplMixes.range);
            if (currentIndex < ranges.length - 1) {
                tplMixes.functions.rangeSet(ranges[currentIndex + 1].id);
            }
        },
        oldest() {
            const ranges = tplMixes.helpers.getRangeDefinitions();
            if (ranges.length > 0) {
                tplMixes.functions.rangeSet(ranges[0].id);
            }
        },
        newest() {
            const ranges = tplMixes.helpers.getRangeDefinitions();
            if (ranges.length > 0) {
                tplMixes.functions.rangeSet(ranges[ranges.length - 1].id);
            }
        },
        rangeSet(range) {
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }

            tplMixes.range = range;
            tplMixes.functions.updateRangeNav();
            tplMixes.functions.navDisplay();
            tplMixes.functions.mixDisplay();
            tplMixes.functions.scrollToHash();
        },
        streamSet(stream) {
            tplMixes.stream = stream;
            tplMixes.streamSelect = tplMixes.helpers.renderStreamSelect(stream);
            localStorage['stream'] = stream;
            tplMixes.functions.mixDisplay();
        },
        randomMix() {
            const randomIndex = Math.floor(Math.random() * tplMixes.mixes.length);
            const randomMix = tplMixes.mixes[randomIndex];
            const streamLink = randomMix ? tplMixes.helpers.getStreamLink(randomMix) : null;

            if (!randomMix) {
                return;
            }

            if (streamLink) {
                window.open(streamLink, '_blank');
                return;
            }

            tplMixes.functions.randomMix();
        },
        navDisplay() {
            $(".tpl-page-nav").each(function (idx) {
                const navContent = idx === 0
                    ? [tplMixes.searchStatus, tplMixes.rangeSelect, tplMixes.searchBar]
                    : [
                        '<hr class="bottom-nav-hr"/>',
                        '<div class="bottom-nav-flex">',
                        tplMixes.rangeSelect,
                        '</div>',
                        '<p class="index-button"><button onclick="tplMixes.functions.showIndex()" class="range">Index</button> | <button onclick="tplMixes.functions.showTileView()" class="range">Grid view</button> | <button onclick="tplMixes.functions.randomMix()" class="range">Random</button></p>'
                    ];

                $(this).html(navContent.join(''));
            });
        },
        showTileView() {
            tplMixes.query = "";
            tplMixes.heading.text("rusty mixes grid view");
            tplMixes.nav.html("");

            const backBtn = `<p><button class="range" onclick="tplMixes.functions.exitTileView()">&lt; Back to Mixes</button></p>`;
            const gridHtml = [
                '<div class="mix-tile-grid">',
                ...tplMixes.mixes.map(mix => `
                    <div class="mix-tile">
                        <a href="#${mix.number}" class="mix-tile-link" data-mixnum="${mix.number}" title="rusty mix #${mix.number}: ${mix.title}"><img src="${mix.image}" alt="rusty mix #${mix.number} cover art"/></a>
                    </div>
                `),
                '</div>'
            ].join('');

            tplMixes.content.html([backBtn, gridHtml].join(''));

            $(".mix-tile-link").on("click", function (e) {
                e.preventDefault();
                const mixNum = $(this).data("mixnum");
                window.location.hash = `#${mixNum}`;
                tplMixes.functions.navDisplay();
                tplMixes.heading.text("rusty mixes");
                tplMixes.functions.mixDisplay();
                setTimeout(() => tplMixes.functions.scrollToHash(), 200);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        exitTileView() {
            tplMixes.functions.navDisplay();
            tplMixes.heading.text("rusty mixes");
            tplMixes.functions.mixDisplay();
        },
        highlightMatch(str, query) {
            if (!query) {
                return str;
            }

            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return str.replace(new RegExp(safeQuery, 'gi'), match => `<span class="search">${match}</span>`);
        },
        mixDisplay() {
            const query = tplMixes.query.trim().toLowerCase();
            const mixesToShow = tplMixes.helpers.getFilteredMixes();
            const formattedMixes = [
                `<hr class="no-top">`,
                tplMixes.streamSelect
            ];

            mixesToShow.forEach(mix => {
                formattedMixes.push(tplMixes.helpers.renderMixCard(mix, query));
            });

            if (query && mixesToShow.length === 0) {
                formattedMixes.push(`<p>no mixes found matching "${tplMixes.query}"</p>`);
            }

            tplMixes.content.html(formattedMixes.join(''));

            if (!query) {
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        },
        scrollToHash() {
            const hash = window.location.hash.replace('#', '');
            const mixNum = Number(hash);

            if (!hash || !mixNum) {
                return;
            }

            const targetRange = tplMixes.helpers.getRangeIdForMix(mixNum);
            if (!targetRange) {
                return;
            }

            if (tplMixes.range !== targetRange) {
                tplMixes.range = targetRange;
                tplMixes.functions.rangeSet(targetRange);
                tplMixes.helpers.scrollToMix(hash, 600);
                return;
            }

            tplMixes.helpers.scrollToMix(hash);
        }
    },
    init() {
        tplMixes.streamSelect = tplMixes.helpers.renderStreamSelect(tplMixes.stream);

        fetch('../data/mixes.json')
            .then(response => response.json())
            .then(data => {
                tplMixes.mixes = Object.keys(data).map(key => ({
                    title: key,
                    number: data[key].number,
                    tidal: data[key].tidal,
                    spotify: data[key].spotify,
                    apple: data[key].apple,
                    image: data[key].image,
                    featuring: data[key].featuring || []
                }));

                tplMixes.functions.updateRangeNav();

                if (window.location.hash === '#index') {
                    tplMixes.functions.showIndex();
                    return;
                }

                tplMixes.functions.mixDisplay();
                tplMixes.functions.scrollToHash();
                tplMixes.functions.navDisplay();
            })
            .catch(error => console.log(error));

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#index') {
                tplMixes.functions.showIndex();
                return;
            }

            tplMixes.functions.updateRangeNav();
            tplMixes.functions.navDisplay();
            tplMixes.functions.mixDisplay();
        });

        tplMixes.functions.updateQuery('');
    }
};

$(document).ready(tplMixes.init);