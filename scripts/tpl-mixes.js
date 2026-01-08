let tplMixes = {
    nav: $(".tpl-page-nav"),
    content: $(".tpl-page-text"),
    mixes: {},
    range: "8",
    query: "",
    stream: "tidal",
    searchBar: `<p>search: <input type="text" id="mix-search-input" placeholder="by number, title, or artist" oninput="tplMixes.functions.updateQuery(this.value)"></p>`,
    clearSearchButton: `<button onclick="document.getElementById('mix-search-input').value=''; tplMixes.functions.updateQuery('');" class="range" id="mix-search-clear" style="display:none;padding-top:12px;">clear search</button>`,
    streamSelect: `<p style="padding-bottom:5px;">platform: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: `<p class="range-select" style="padding-top:10px;display:flex;align-items:center;justify-content:flex-start;gap:12px;"><button class="range" id="newer-btn" onclick="tplMixes.functions.newer()" style="min-width:60px;" disabled>&lt;&lt; newer</button> | <span id="range-label">#176-200</span> | <button class="range" id="older-btn" onclick="tplMixes.functions.older();" style="min-width:60px;">older &gt;&gt;</button>
    </p>`,
    scrollToTop: `<p style="display:none;padding-top:10px;" id="scroll-to-top"><a href="#top" onclick="window.scrollTo({top: 0, behavior: 'smooth'});return false;">back to top</a></p>`,
    functions: {
        updateQuery: (value) => {
            tplMixes.query = value;
            if (value) {
                $(".range-select").hide();
                $("#scroll-to-top").show();
                $("#mix-search-clear").show();
            } else {
                $(".range-select").show();
                $("#scroll-to-top").hide();
                $("#mix-search-clear").hide();
            };
            tplMixes.functions.mixDisplay();
        },
        updateRangeNav: () => {
            let ranges = [
                {id: "1", label: "#1-25"},
                {id: "2", label: "#26-50"},
                {id: "3", label: "#51-75"},
                {id: "4", label: "#76-100"},
                {id: "5", label: "#101-125"},
                {id: "6", label: "#126-150"},
                {id: "7", label: "#151-175"},
                {id: "8", label: "#176-200"}
            ];
            let idx = ranges.findIndex(r => r.id === tplMixes.range);
            let label = ranges[idx] ? ranges[idx].label : "";
            let olderDisabled = idx === 0 ? 'disabled' : '';
            let newerDisabled = idx === ranges.length-1 ? 'disabled' : '';
            tplMixes.rangeSelect = `<p class="range-select" style="padding-top:10px;display:flex;align-items:center;justify-content:flex-start;gap:12px;">
                <button class="range" id="newer-btn" onclick="tplMixes.functions.newer();" style="min-width:60px;" ${newerDisabled}>&lt;&lt; newer</button> | 
                <span id="range-label">${label}</span> | 
                <button class="range" id="older-btn" onclick="tplMixes.functions.older();" style="min-width:60px;" ${olderDisabled}>older &gt;&gt;</button>
            </p>`;
        },
        older: () => {
            let ranges = ["1", "2", "3", "4", "5", "6", "7", "8"];
            let idx = ranges.indexOf(tplMixes.range);
            if (idx > 0) {
                tplMixes.functions.rangeSet(ranges[idx-1]);
            }
        },
        newer: () => {
            let ranges = ["1", "2", "3", "4", "5", "6", "7", "8"];
            let idx = ranges.indexOf(tplMixes.range);
            if (idx < ranges.length-1) {
                tplMixes.functions.rangeSet(ranges[idx+1]);
            }
        },
        rangeSet: (range) => {
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            tplMixes.range = range;
            tplMixes.functions.updateRangeNav();
            tplMixes.functions.navDisplay();
            tplMixes.functions.mixDisplay();
            tplMixes.functions.scrollToHash();
        },
        streamSet: (stream) => {
            switch(stream) {
                case "tidal":
                    tplMixes.stream = "tidal";
                    tplMixes.streamSelect = `<p style="padding-bottom:5px;">platform: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`
                    localStorage['stream'] = `${tplMixes.stream}`;
                    break;
                case "spotify":
                    tplMixes.stream = "spotify";
                    tplMixes.streamSelect = `<p style="padding-bottom:5px;">platform: <button class="range" onclick="tplMixes.functions.streamSet('tidal')">tidal</button> | <span class="range-selected">spotify</span></p>`
                    localStorage['stream'] = `${tplMixes.stream}`;
                    break;
            }
            tplMixes.stream = stream;
            tplMixes.functions.mixDisplay();
        },
        navDisplay: () => {
            let navs = $(".tpl-page-nav");
            // Ensure responsive CSS is present
            if (!document.getElementById('tpl-mixes-bottom-nav-style')) {
                const style = document.createElement('style');
                style.id = 'tpl-mixes-bottom-nav-style';
                style.innerHTML = `
                .bottom-nav-flex { display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; }
                @media screen and (max-width: 600px) {
                    .bottom-nav-flex { flex-direction: column-reverse; align-items: flex-start; margin-bottom: -15px; }
                }`;
                document.head.appendChild(style);
            }
            navs.each(function(idx) {
                let navContent;
                if (idx === 0) {
                    navContent = [tplMixes.searchBar, tplMixes.clearSearchButton, tplMixes.rangeSelect];
                    if (tplMixes.query) {
                        navContent = [tplMixes.searchBar, tplMixes.clearSearchButton];
                    }
                } else {
                    navContent = [
                        '<hr style="margin-top: 30px;margin-bottom: 5px;border-color: rgba(243, 232, 233, 0.75);"/>',
                        '<div class="bottom-nav-flex">',
                        tplMixes.scrollToTop,
                        tplMixes.rangeSelect,
                        '</div>'
                    ];
                }
                $(this).html(navContent.reduce((accumulator, item) => accumulator + item));
            });
        },
        highlightMatch: (str, query) => {
            if (!query) return str;
            // Escape regex special chars in query
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(safeQuery, 'gi');
            return str.replace(regex, match => `<span class="search">${match}</span>`);
        },
        mixDisplay: () => {
            if (tplMixes.query === "") {
                let range = tplMixes.range;
                let streamSelect = tplMixes.streamSelect;
                let formattedMixes = [`<hr class="no-top">`, streamSelect];
                let stream = "tidal";
                if (tplMixes.stream == "spotify") {
                    stream = "spotify";
                }
                let rangeBounds = {
                    "1": [1, 25],
                    "2": [26, 50],
                    "3": [51, 75],
                    "4": [76, 100],
                    "5": [101, 125],
                    "6": [126, 150],
                    "7": [151, 175],
                    "8": [176, 200]
                };
                let bounds = rangeBounds[range] || [1, 25];
                for (let mix in tplMixes.mixes) {
                    let object = tplMixes.mixes[mix];
                    let count = Number(object.number);
                    let link = object[stream];
                    let featuringBar = '';
                    if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                        let features = object.featuring;
                        if (features.length === 1 && typeof features[0] === 'string' && features[0].includes(',')) {
                            features = features[0].split(',').map(f => f.trim());
                        }
                        featuringBar = `<div class=\"featuring-bar\">${features.join(', ')}</div>`;
                    }
                    if (count >= bounds[0] && count <= bounds[1] && link) {
                        let details = `
                            <div class=\"mix-details-flex\">\n                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"rusty mix #${object.number} cover art\"/>`}</div>\n                        <div class=\"mix-info\">\n                            <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>\n                            <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">\n                        </div>\n                    </div>\n                `;
                        formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`)
                    } else if (count >= bounds[0] && count <= bounds[1] && !link) {
                        let details = `
                            <div class=\"mix-details-flex\">\n                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>\n                        <div class=\"mix-info\">\n                            <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>\n                            <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">\n                        </div>\n                    </div>\n                `;
                        formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`)
                    }
                }
                tplMixes.content.html(formattedMixes.reduce((accumulator, mix) => {
                    return accumulator + mix;
                }));
                setTimeout(() => {
                    window.scrollTo({top: 0, behavior: 'smooth'});
                }, 100);
            } else {
                let query = tplMixes.query.toLowerCase();
                let streamSelect = tplMixes.streamSelect;
                let formattedMixes = [`<hr class=\"no-top\">`, streamSelect];
                let stream = "tidal";
                if (tplMixes.stream == "spotify") {
                    stream = "spotify";
                }
                let filteredMixes = tplMixes.mixes.filter(mix => {
                    let titleMatch = mix.title.toLowerCase().includes(query);
                    let numberMatch = mix.number.toString().includes(query);
                    let featuringMatch = Array.isArray(mix.featuring) && mix.featuring.some(artist => artist.toLowerCase().includes(query));
                    return titleMatch || numberMatch || featuringMatch;
                });

                for (let object of filteredMixes.reverse()) {
                    let link = object[stream];
                    let featuringBar = '';
                    if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                        // Highlight matches in featuring
                        let features = object.featuring.map(f => tplMixes.functions.highlightMatch(f, query));
                        featuringBar = `<div class="featuring-bar">${features.join(', ')}</div>`;
                    }
                    let numberHtml = tplMixes.functions.highlightMatch(`#${object.number}`, query);
                    let titleHtml = tplMixes.functions.highlightMatch(object.title, query);
                    if (link) {
                        let details = `
                            <div class=\"mix-details-flex\">\n                    <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>\n                    <div class=\"mix-info\">\n                        <p><small>${numberHtml} &#92;</small><br/>${titleHtml}</p>\n                        <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">\n                    </div>\n                </div>\n            `;
                        formattedMixes.push(`<a id=\"${object.number}\" href=\"${link}\" target=\"_blank\" class=\"sub mix mix-flex\">${details}${featuringBar}</a>`)
                    } else {
                        let details = `
                            <div class=\"mix-details-flex\">\n                    <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>\n                    <div class=\"mix-info\">\n                        <p><small>${numberHtml} &#92;</small><br/>${titleHtml}</p>\n                        <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">\n                    </div>\n                </div>\n            `;
                        formattedMixes.push(`<div id=\"${object.number}\" class=\"sub mix mix-flex disabled\">${details}${featuringBar}</div>`)
                    }
                }

                if (filteredMixes.length === 0) {
                    formattedMixes.push(`<p>no mixes found matching "${tplMixes.query}"</p>`);
                }

                tplMixes.content.html(formattedMixes.reduce((accumulator, mix) => {
                    return accumulator + mix;
                }));
            }
        },
        scrollToHash: () => {
            let hash = window.location.hash.replace('#', '');
            if (!hash) return;
            let mixNum = Number(hash);
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
    init: () => {
        fetch('../data/mixes.json').then(response => response.json())
        .then((data) => {
            let mixes = [];
            for (let object in data) {
                let mix = {
                    "title": object,
                    "number": data[object]["number"],
                    "tidal": data[object]["tidal"],
                    "spotify": data[object]["spotify"],
                    "image": data[object]["image"]
                };
                if (data[object]["featuring"]) {
                    mix.featuring = data[object]["featuring"];
                }
                mixes.push(mix);
            }
            tplMixes.mixes = mixes;
            tplMixes.functions.mixDisplay();
            tplMixes.functions.scrollToHash();
            tplMixes.functions.navDisplay();
        })
        .catch(error => console.log(error));

        if (localStorage['stream'] === 'spotify') {
            tplMixes.functions.streamSet('spotify');
        }

        window.addEventListener('hashchange', () => {
            tplMixes.functions.scrollToHash();
        });

        $(document).on('focus', '#mix-search-input', function() {
            if (window.matchMedia('(max-width: 600px)').matches) {
                $('header').hide();
                $('nav').hide();
            }
        });
        $(document).on('blur', '#mix-search-input', function() {
            if (window.matchMedia('(max-width: 600px)').matches) {
                $('header').show();
                $('nav').show();
            }
        });

        tplMixes.functions.updateQuery('');
    },
};
$(document).ready(() => {
    tplMixes.init();
});