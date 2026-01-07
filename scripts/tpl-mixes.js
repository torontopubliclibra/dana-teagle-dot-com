let tplMixes = {
    nav: $(".tpl-page-nav"),
    content: $(".tpl-page-text"),
    mixes: {},
    range: "4",
    query: "",
    stream: "tidal",
    searchBar: `<p style="padding-bottom:10px;">search: <input type="text" id="mix-search-input" placeholder="by number, title, or artist" oninput="tplMixes.functions.updateQuery(this.value)"></p>`,
    streamSelect: `<p style="padding-bottom:5px;">platform: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: `<p id="range">range: <span class="range-selected">#151-200</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`,
    functions: {
        updateQuery: (value) => {
            tplMixes.query = value;
            if (value) {
                $("#range").hide();
            } else {
                $("#range").show();
            };
            tplMixes.functions.mixDisplay();
        },
        rangeSet: (range) => {
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            switch(range) {
                case "4":
                    tplMixes.range = "4";
                    tplMixes.rangeSelect = `<p id="range">range: <span class="range-selected">#151-200</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "3":
                    tplMixes.range = "3";
                    tplMixes.rangeSelect = `<p id="range">range: <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <span class="range-selected">#101-150</span> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "2":
                    tplMixes.range = "2";
                    tplMixes.rangeSelect = `<p id="range">range: <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <span class="range-selected">#51-100</span> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "1":
                    tplMixes.range = "1";
                    tplMixes.rangeSelect = `<p id="range">range: <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <span class="range-selected">#1-50</span></p>`;
                    break;
            }
            tplMixes.range = range;
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
            let navContent = [tplMixes.searchBar, tplMixes.rangeSelect];

            if (tplMixes.query) {
                // If there is a search query, do not show range buttons
                navContent = [tplMixes.searchBar];
            }

            tplMixes.nav.html(navContent.reduce((accumulator, item) => {
                return accumulator + item;
            }));
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
                switch(range) {
                    case "4":
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
                            if (count >= 151 && count <= 200 && link) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"rusty mix #${object.number} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`)
                            } else if (count >= 151 && count <= 200 && !link) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`)
                            }
                        }
                        break;
                    case "3":
                        for (let mix in tplMixes.mixes) {
                            let object = tplMixes.mixes[mix];
                            let count = Number(object.number);
                            let link = object[stream];
                            let featuringBar = '';
                            if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                                featuringBar = `<div class=\"featuring-bar\">${object.featuring.join(', ')}</div>`;
                            }
                            if (count >= 101 && count <= 150 && link ) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`)
                            } else if (count >= 101 && count <= 150 && !link) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`)
                            }
                        }
                        break;
                    case "2":
                        for (let mix in tplMixes.mixes) {
                            let object = tplMixes.mixes[mix];
                            let count = Number(object.number);
                            let link = object[stream];
                            let featuringBar = '';
                            if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                                featuringBar = `<div class=\"featuring-bar\">${object.featuring.join(', ')}</div>`;
                            }
                            if (count >= 51 && count <= 100 && link ) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`)
                            } else if (count >= 51 && count <= 100 && !link) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`)
                            }
                        }
                        break;
                    case "1":
                        for (let mix in tplMixes.mixes) {
                            let object = tplMixes.mixes[mix];
                            let count = Number(object.number);
                            let link = object[stream];
                            let featuringBar = '';
                            if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                                featuringBar = `<div class=\"featuring-bar\">${object.featuring.join(', ')}</div>`;
                            }
                            if (count >= 1 && count <= 50 && link ) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix mix-flex">${details}${featuringBar}</a>`)
                            } else if (count >= 1 && count <= 50 && !link) {
                                let details = `
                                    <div class=\"mix-details-flex\">
                                        <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>
                                        <div class=\"mix-info\">
                                            <p><small>#${object.number} &#92;</small><br/>${object.title}</p>
                                            <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">
                                        </div>
                                    </div>
                                `;
                                formattedMixes.push(`<div id="${object.number}" class="sub mix mix-flex disabled">${details}${featuringBar}</div>`)
                            }
                        }
                        break;
                }
                tplMixes.content.html(formattedMixes.reduce((accumulator, mix) => {
                    return accumulator + mix;
                }));
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

                for (let object of filteredMixes) {
                    let link = object[stream];
                    let featuringBar = '';
                    if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                        featuringBar = `<div class=\"featuring-bar\">${object.featuring.join(', ')}</div>`;
                    }
                    if (link) {
                        let details = `
                            <div class=\"mix-details-flex\">\n                    <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>\n                    <div class=\"mix-info\">\n                        <p><small>#${object.number} &#92;</small><br/>${object.title}</p>\n                        <img src=\"../assets/icons/external-link.svg\" class=\"icon\" alt=\"external link icon\">\n                    </div>\n                </div>\n            `;
                        formattedMixes.push(`<a id=\"${object.number}\" href=\"${link}\" target=\"_blank\" class=\"sub mix mix-flex\">${details}${featuringBar}</a>`)
                    } else {
                        let details = `
                            <div class=\"mix-details-flex\">\n                    <div class=\"mix-image\">${`<img src=\"${object.image}\" alt=\"${object.title} cover art\"/>`}</div>\n                    <div class=\"mix-info\">\n                        <p><small>#${object.number} &#92;</small><br/>${object.title}</p>\n                        <img src=\"../assets/icons/external-link.svg\" class=\"icon disabled\" alt=\"external link icon\">\n                    </div>\n                </div>\n            `;
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
            // Determine correct range for any mix number
            let targetRange = null;
            if (mixNum >= 151 && mixNum <= 200) {
                targetRange = "4";
            } else if (mixNum >= 101 && mixNum <= 150) {
                targetRange = "3";
            } else if (mixNum >= 51 && mixNum <= 100) {
                targetRange = "2";
            } else if (mixNum >= 1 && mixNum <= 50) {
                targetRange = "1";
            }
            if (!targetRange) return;
            // If not on the correct range, switch and then scroll after display
            if (tplMixes.range !== targetRange) {
                tplMixes.range = targetRange;
                tplMixes.functions.rangeSet(targetRange);
                // Poll for element after range switch
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
    },
};
$(document).ready(() => {
    tplMixes.init();
});