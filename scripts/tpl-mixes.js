let tplMixes = {
    content: $(".tpl-page-text"),
    mixes: {},
    range: "4",
    stream: "tidal",
    streamSelect: `<p>streaming links: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: `<p>>> <span class="range-selected">#151-200</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`,
    functions: {
        rangeSet: (range) => {
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            switch(range) {
                case "4":
                    tplMixes.range = "4";
                    tplMixes.rangeSelect = `<p>>> <span class="range-selected">#151-200</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "3":
                    tplMixes.range = "3";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <span class="range-selected">#101-150</span> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "2":
                    tplMixes.range = "2";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <span class="range-selected">#51-100</span> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#1-50</button></p>`;
                    break;
                case "1":
                    tplMixes.range = "1";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#151-200</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#101-150</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#51-100</button> | <span class="range-selected">#1-50</span></p>`;
                    break;
            }
            tplMixes.range = range;
            tplMixes.functions.mixDisplay();
            tplMixes.functions.scrollToHash();
        },
        streamSet: (stream) => {
            switch(stream) {
                case "tidal":
                    tplMixes.stream = "tidal";
                    tplMixes.streamSelect = `<p>streaming links: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`
                    localStorage['stream'] = `${tplMixes.stream}`;
                    break;
                case "spotify":
                    tplMixes.stream = "spotify";
                    tplMixes.streamSelect = `<p>streaming links: <button class="range" onclick="tplMixes.functions.streamSet('tidal')">tidal</button> | <span class="range-selected">spotify</span></p>`
                    localStorage['stream'] = `${tplMixes.stream}`;
                    break;
            }
            tplMixes.stream = stream;
            tplMixes.functions.mixDisplay();
        },
        mixDisplay: () => {
            let range = tplMixes.range;
            let streamSelect = tplMixes.streamSelect;
            let rangeSelect = tplMixes.rangeSelect;
            let formattedMixes = [streamSelect, `<hr class="no-top">`, rangeSelect];
            let stream = "tidal";
            if (tplMixes.stream == "spotify") {
                stream = "spotify";
            }

            // Break up mixes by 50s using new range numbers (1-4)
            switch(range) {
                case "4":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];
                        let featuringLine = '';
                        if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                            let features = object.featuring;
                            if (features.length === 1 && typeof features[0] === 'string' && features[0].includes(',')) {
                                features = features[0].split(',').map(f => f.trim());
                            }
                            featuringLine = `<small class="featuring-ellipsis">Feat: ${features.join(', ')}</small>`;
                        }
                        // Show mixes #151-200
                        if (count >= 151 && count <= 200 && link) {
                            let title = `<p><small>#${object.number} &#92;&#92;</small><br/>${object.title}<br/>${featuringLine}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="rusty mix #${object.number} cover art"/>`;
                            formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 151 && count <= 200 && !link) {
                            let title = `<p><small>#${object.number} &#92;&#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div id="${object.number}" class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "3":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];
                        let featuringLine = '';
                        if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                            featuringLine = `<p class="featuring-ellipsis" style="margin:0 0 5px 0;font-size:0.95em;color:#b57e9b;">Feat: ${object.featuring.join(', ')}</p>`;
                        }
                        // Show mixes #101-150
                        if (count >= 101 && count <= 150 && link ) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 101 && count <= 150 && !link) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div id="${object.number}" class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "2":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];
                        let featuringLine = '';
                        if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                            featuringLine = `<p class="featuring-ellipsis" style="margin:0 0 5px 0;font-size:0.95em;color:#b57e9b;">Feat: ${object.featuring.join(', ')}</p>`;
                        }
                        // Show mixes #51-100
                        if (count >= 51 && count <= 100 && link ) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 51 && count <= 100 && !link) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div id="${object.number}" class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "1":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];
                        let featuringLine = '';
                        if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                            featuringLine = `<p class="featuring-ellipsis" style="margin:0 0 5px 0;font-size:0.95em;color:#b57e9b;">Featuring: ${object.featuring.join(', ')}</p>`;
                        }
                        // Show mixes #1-50
                        if (count >= 1 && count <= 50 && link ) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a id="${object.number}" href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 1 && count <= 50 && !link) {
                            let title = `<p><small>#${object.number} &#92;</small><br/>${object.title}</p>${featuringLine}<img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div id="${object.number}" class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
            }
            formattedMixes.push(`<hr>` + rangeSelect);
            tplMixes.content.html(formattedMixes.reduce((accumulator, mix) => {
                return accumulator + mix;
            }));
        },

        scrollToHash: () => {
            let hash = window.location.hash.replace('#', '');
            if (!hash) return;
            let mixNum = Number(hash);
            if (!mixNum) return;
            let targetRange = (mixNum >= 101 && mixNum <= 200) ? "2" : (mixNum <= 100 && mixNum >= 1 ? "1" : null);
            if (!targetRange) return;
            if (tplMixes.range !== targetRange) {
                tplMixes.range = targetRange;
                tplMixes.functions.rangeSet(targetRange);
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