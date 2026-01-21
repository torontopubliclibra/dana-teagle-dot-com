const tplMixes = {
    nav: $(".tpl-page-nav"),
    content: $(".tpl-page-text"),
    heading: $(".tpl-page-heading"),
    mixes: [],
    range: localStorage['mixRange'] || "8",
    query: "",
    stream: "tidal",
    searchBar: `<p>search: <input type="text" id="mix-search-input" placeholder="by number, title, or artist" oninput="tplMixes.functions.updateQuery(this.value)"></p>`,
    clearSearchButton: `<button onclick="document.getElementById('mix-search-input').value=''; tplMixes.functions.updateQuery('');" class="range" id="mix-search-clear" style="display:none;padding-top:12px;">clear search</button>`,
    streamSelect: `<p style="padding-bottom:5px;">platform: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: '',
    scrollToTop: `<p style="display:none;padding-top:10px;" id="scroll-to-top"><a href="#top" onclick="window.scrollTo({top: 0, behavior: 'smooth'});return false;"><img src="/assets/icons/arrow-up.svg" alt="scroll up icon" style="width: 15px; margin-top:3px;margin-right:5px;filter: invert(1);">Back to Top</a></p>`,
    functions: {
        updateQuery(value) {
            tplMixes.query = value;
            if (value) {
                $(".range-select").css('display', 'none');
                $("#scroll-to-top").show();
                $("#mix-search-clear").show();
            } else {
                $(".range-select").css('display', 'flex');
                $("#scroll-to-top").hide();
                $("#mix-search-clear").hide();
            }
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
            if (tplMixes.mixes && tplMixes.mixes.length > 0) {
                tplMixes.mixes.forEach(mix => {
                    if (Array.isArray(mix.featuring)) {
                        mix.featuring.forEach(artist => {
                            if (typeof artist === 'string' && artist.includes(',')) {
                                artist.split(',').map(a => a.trim()).forEach(a => artistSet.add(a));
                            } else {
                                artistSet.add(artist);
                            }
                        });
                    }
                });
            }
            const artists = Array.from(artistSet).filter(Boolean).sort((a, b) => a.localeCompare(b));
            const ranges = [
                { label: 'A-F', start: 'A', end: 'F' },
                { label: 'G-L', start: 'G', end: 'L' },
                { label: 'M-R', start: 'M', end: 'R' },
                { label: 'S-Z', start: 'S', end: 'Z' },
                { label: '0-9', start: '0', end: '9', isNumber: true },
            ];
            if (typeof tplMixes.artistIndexPage !== 'number') tplMixes.artistIndexPage = 0;
            function getFirstChar(artist) {
                return (artist[0] || '').toUpperCase();
            }
            const currentRange = ranges[tplMixes.artistIndexPage];
            const filteredArtists = artists.filter(artist => {
                const ch = getFirstChar(artist);
                if (currentRange.isNumber) {
                    return ch >= '0' && ch <= '9';
                } else {
                    return ch >= currentRange.start && ch <= currentRange.end;
                }
            });
            if (!document.getElementById('artist-index-style')) {
                const style = document.createElement('style');
                style.id = 'artist-index-style';
                style.innerHTML = `
                    .artist-index {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5em 1.5em;
                        padding: 0;
                        margin: 0;
                        list-style: none;
                    }
                    .artist-index li {
                        flex: 0 1 calc(50% - 1.5em);
                        box-sizing: border-box;
                        padding: 2px 0;
                        color: #f3e8e9;
                    }
                    @media screen and (max-width: 600px) {
                        .artist-index li {
                            flex-basis: 100%;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            let html = `<p><button class="range" onclick="tplMixes.functions.exitIndex()">&lt; Back to Mixes</button></p>`;
            html += `<div style="margin-bottom:10px;">`;
            ranges.forEach((range, idx) => {
                if (idx === tplMixes.artistIndexPage) {
                    html += `<button class="range-selected" disabled>${range.label}</button> `;
                } else {
                    html += `<button class="range" onclick="tplMixes.functions.showIndexPage(${idx})">${range.label}</button> `;
                }
            });
            html += `</div><hr style="margin-top: 15px;"/>`;
            html += `<ul class="artist-index" style="max-width:100%;font-size:1rem;">`;
            filteredArtists.forEach(artist => {
                const safeArtist = artist.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                html += `<li>>> <a href="#" style="color:inherit;text-decoration:underline;cursor:pointer;" onclick="tplMixes.functions.artistIndexSearch('${safeArtist}');return false;">${artist}</a></li>`;
            });
            html += `</ul><hr/>`;
            html += tplMixes.scrollToTop;
            tplMixes.heading.text("rusty mixes artist index");
            tplMixes.nav.html("");
            tplMixes.content.html(html);
            $("#scroll-to-top").show();
            window.scrollTo({top: 0, behavior: 'smooth'});
        },
        showIndexPage(page) {
            tplMixes.artistIndexPage = page;
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
            let maxNum = 198;
            if (tplMixes.mixes && tplMixes.mixes.length > 0) {
                maxNum = Math.max(...tplMixes.mixes.map(m => Number(m.number)));
            }
            const ranges = [
                {id: "1", label: `#1-25`},
                {id: "2", label: `#26-50`},
                {id: "3", label: `#51-75`},
                {id: "4", label: `#76-100`},
                {id: "5", label: `#101-125`},
                {id: "6", label: `#126-150`},
                {id: "7", label: `#151-175`},
                {id: "8", label: `#176-${maxNum}`}
            ];
            const idx = ranges.findIndex(r => r.id === tplMixes.range);
            const label = ranges[idx] ? ranges[idx].label : "";
            const olderDisabled = idx === 0 ? 'disabled' : '';
            const newerDisabled = idx === ranges.length-1 ? 'disabled' : '';
            tplMixes.rangeSelect = `<p class="range-select" style="padding-top:10px;display:flex;align-items:center;justify-content:flex-start;gap:12px;">
                <button class="range" id="newer-btn" onclick="tplMixes.functions.newer();" ${newerDisabled}>&lt;&lt;</button> | 
                <span id="range-label">${label} / ${maxNum}</span> | 
                <button class="range" id="older-btn" onclick="tplMixes.functions.older();" ${olderDisabled}>&gt;&gt;</button>
            </p>`;
        },
        older() {
            const ranges = ["1", "2", "3", "4", "5", "6", "7", "8"];
            const idx = ranges.indexOf(tplMixes.range);
            if (idx > 0) {
                tplMixes.functions.rangeSet(ranges[idx-1]);
            }
        },
        newer() {
            const ranges = ["1", "2", "3", "4", "5", "6", "7", "8"];
            const idx = ranges.indexOf(tplMixes.range);
            if (idx < ranges.length-1) {
                tplMixes.functions.rangeSet(ranges[idx+1]);
            }
        },
        rangeSet(range) {
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            tplMixes.range = range;
            localStorage['mixRange'] = range;
            tplMixes.functions.updateRangeNav();
            tplMixes.functions.navDisplay();
            tplMixes.functions.mixDisplay();
            tplMixes.functions.scrollToHash();
        },
        streamSet(stream) {
            if (stream === "tidal") {
                tplMixes.stream = "tidal";
                tplMixes.streamSelect = `<p style="padding-bottom:5px;">platform: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`;
                localStorage['stream'] = tplMixes.stream;
            } else if (stream === "spotify") {
                tplMixes.stream = "spotify";
                tplMixes.streamSelect = `<p style="padding-bottom:5px;">platform: <button class="range" onclick="tplMixes.functions.streamSet('tidal')">tidal</button> | <span class="range-selected">spotify</span></p>`;
                localStorage['stream'] = tplMixes.stream;
            }
            tplMixes.functions.mixDisplay();
        },
        randomMix() {
            const randomIndex = Math.floor(Math.random() * tplMixes.mixes.length);
            const randomMix = tplMixes.mixes[randomIndex];
            if (randomMix) {
                let streamLink = randomMix.tidal;
                if (tplMixes.stream === "spotify" && randomMix.spotify) {
                    streamLink = randomMix.spotify;
                }
                if (streamLink) {
                    window.open(streamLink, '_blank');
                } else {
                    tplMixes.functions.randomMix();
                }
            }
        },
        navDisplay() {
            if (!document.getElementById('tpl-mixes-bottom-nav-style')) {
                const style = document.createElement('style');
                style.id = 'tpl-mixes-bottom-nav-style';
                style.innerHTML = `
                    .bottom-nav-flex { display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
                    @media screen and (max-width: 600px) {
                        .bottom-nav-flex { flex-direction: column-reverse; align-items: flex-start; margin-bottom: -15px; }
                    }
                `;
                document.head.appendChild(style);
            }
            $(".tpl-page-nav").each(function(idx) {
                let navContent;
                if (idx === 0) {
                    navContent = [tplMixes.searchBar, tplMixes.clearSearchButton, tplMixes.rangeSelect];
                } else {
                    navContent = [
                        '<hr style="margin-top: 30px;margin-bottom: 5px;border-color: rgba(243, 232, 233, 0.75);"/>',
                        '<div class="bottom-nav-flex">',
                        tplMixes.scrollToTop,
                        tplMixes.rangeSelect,
                        '</div>',
                        '<p class="index-button"><button onclick="tplMixes.functions.showIndex()" class="range">Artist Index</button> | <button onclick="tplMixes.functions.randomMix()" class="range">Random Mix</button></p>'
                    ];
                }
                $(this).html(navContent.join(''));
            });
        },
        highlightMatch(str, query) {
            if (!query) return str;
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeQuery, 'gi');
            return str.replace(regex, match => `<span class="search">${match}</span>`);
        },
        mixDisplay() {
            if (tplMixes.query === "") {
                const range = tplMixes.range;
                const streamSelect = tplMixes.streamSelect;
                const formattedMixes = [`<hr class="no-top">`, streamSelect];
                let stream = tplMixes.stream === "spotify" ? "spotify" : "tidal";
                let maxNum = 198;
                if (tplMixes.mixes && tplMixes.mixes.length > 0) {
                    maxNum = Math.max(...tplMixes.mixes.map(m => Number(m.number)));
                }
                const rangeBounds = {
                    "1": [1, 25],
                    "2": [26, 50],
                    "3": [51, 75],
                    "4": [76, 100],
                    "5": [101, 125],
                    "6": [126, 150],
                    "7": [151, 175],
                    "8": [176, maxNum]
                };
                const bounds = rangeBounds[range] || [1, 25];
                tplMixes.mixes.forEach(object => {
                    const count = Number(object.number);
                    const link = object[stream];
                    let featuringBar = '';
                    if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                        let features = object.featuring;
                        if (features.length === 1 && typeof features[0] === 'string' && features[0].includes(',')) {
                            features = features[0].split(',').map(f => f.trim());
                        }
                        featuringBar = `<div class="featuring-bar">${features.join(', ')}</div>`;
                    }
                    if (count >= bounds[0] && count <= bounds[1] && link) {
                        let details = `
                            <div class="mix-details-flex">
                                <div class="mix-image"><img src="${object.image}" alt="rusty mix #${object.number} cover art"/></div>
                                <div class="mix-info">
                                    <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>
                                    <img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">
                                </div>
                            </div>
                        `;
                        formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`);
                    } else if (count >= bounds[0] && count <= bounds[1] && !link) {
                        let details = `
                            <div class="mix-details-flex">
                                <div class="mix-image"><img src="${object.image}" alt="${object.title} cover art"/></div>
                                <div class="mix-info">
                                    <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>
                                    <img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">
                                </div>
                            </div>
                        `;
                        formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`);
                    }
                });
                tplMixes.content.html(formattedMixes.join(''));
                setTimeout(() => {
                    window.scrollTo({top: 0, behavior: 'smooth'});
                }, 100);
            } else {
                const query = tplMixes.query.toLowerCase();
                const streamSelect = tplMixes.streamSelect;
                const formattedMixes = [`<hr class="no-top">`, streamSelect];
                let stream = tplMixes.stream === "spotify" ? "spotify" : "tidal";
                const filteredMixes = tplMixes.mixes.filter(mix => {
                    const titleMatch = mix.title.toLowerCase().includes(query);
                    const numberMatch = mix.number.toString().includes(query);
                    const featuringMatch = Array.isArray(mix.featuring) && mix.featuring.some(artist => artist.toLowerCase().includes(query));
                    return titleMatch || numberMatch || featuringMatch;
                });
                filteredMixes.slice().reverse().forEach(object => {
                    const link = object[stream];
                    let featuringBar = '';
                    if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                        let features = object.featuring.map(f => tplMixes.functions.highlightMatch(f, query));
                        featuringBar = `<div class="featuring-bar">${features.join(', ')}</div>`;
                    }
                    const numberHtml = tplMixes.functions.highlightMatch(`#${object.number}`, query);
                    const titleHtml = tplMixes.functions.highlightMatch(object.title, query);
                    if (link) {
                        let details = `
                            <div class="mix-details-flex">
                                <div class="mix-image"><img src="${object.image}" alt="${object.title} cover art"/></div>
                                <div class="mix-info">
                                    <p><small>${numberHtml} &#92;</small><br/>${titleHtml}</p>
                                    <img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">
                                </div>
                            </div>
                        `;
                        formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`);
                    } else {
                        let details = `
                            <div class="mix-details-flex">
                                <div class="mix-image"><img src="${object.image}" alt="${object.title} cover art"/></div>
                                <div class="mix-info">
                                    <p><small>${numberHtml} &#92;</small><br/>${titleHtml}</p>
                                    <img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">
                                </div>
                            </div>
                        `;
                        formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`);
                    }
                });
                if (filteredMixes.length === 0) {
                    formattedMixes.push(`<p>no mixes found matching "${tplMixes.query}"</p>`);
                }
                tplMixes.content.html(formattedMixes.join(''));
            }
        },
        scrollToHash() {
            const hash = window.location.hash.replace('#', '');
            if (!hash) return;
            const mixNum = Number(hash);
            if (!mixNum) return;
            let targetRange = null;
            if (mixNum >= 176 && mixNum <= 200) {
                targetRange = "8";
            } else if (mixNum >= 151 && mixNum <= 175) {
                targetRange = "7";
            } else if (mixNum >= 126 && mixNum <= 150) {
                targetRange = "6";
            } else if (mixNum >= 101 && mixNum <= 125) {
                targetRange = "5";
            } else if (mixNum >= 76 && mixNum <= 100) {
                targetRange = "4";
            } else if (mixNum >= 51 && mixNum <= 75) {
                targetRange = "3";
            } else if (mixNum >= 26 && mixNum <= 50) {
                targetRange = "2";
            } else if (mixNum >= 1 && mixNum <= 25) {
                targetRange = "1";
            }
            if (!targetRange) return;
            if (tplMixes.range !== targetRange) {
                tplMixes.range = targetRange;
                tplMixes.functions.rangeSet(targetRange);
                let pollCount = 0;
                const maxPolls = 40;
                const pollForElement = () => {
                    const el = document.getElementById(hash);
                    if (el && el.offsetParent !== null) {
                        setTimeout(() => {
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
                        }, 250);
                    } else if (pollCount < maxPolls) {
                        pollCount++;
                        setTimeout(pollForElement, 50);
                    }
                };
                setTimeout(pollForElement, 600);
                return;
            }
            let pollCount = 0;
            const maxPolls = 40;
            const pollForElement = () => {
                const el = document.getElementById(hash);
                if (el && el.offsetParent !== null) {
                    setTimeout(() => {
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
                    }, 250);
                } else if (pollCount < maxPolls) {
                    pollCount++;
                    setTimeout(pollForElement, 50);
                }
            };
            pollForElement();
        },
    },
    init() {
        fetch('../data/mixes.json')
            .then(response => response.json())
            .then(data => {
                const mixes = Object.keys(data).map(key => {
                    const mix = {
                        title: key,
                        number: data[key].number,
                        tidal: data[key].tidal,
                        spotify: data[key].spotify,
                        image: data[key].image,
                        featuring: data[key].featuring || []
                    };
                    return mix;
                });
                tplMixes.mixes = mixes;
                tplMixes.functions.updateRangeNav();
                if (window.location.hash === '#index') {
                    tplMixes.functions.showIndex();
                } else {
                    tplMixes.functions.mixDisplay();
                    tplMixes.functions.scrollToHash();
                    tplMixes.functions.navDisplay();
                }
            })
            .catch(error => console.log(error));
        if (localStorage['stream'] === 'spotify') {
            tplMixes.functions.streamSet('spotify');
        }
        if (localStorage['mixRange']) {
            tplMixes.range = localStorage['mixRange'];
            tplMixes.functions.updateRangeNav();
        }
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#index') {
                tplMixes.functions.showIndex();
            } else {
                tplMixes.functions.updateRangeNav();
                tplMixes.functions.navDisplay();
                tplMixes.functions.mixDisplay();
            }
        });
        tplMixes.functions.updateQuery('');
    }
};

$(document).ready(tplMixes.init);