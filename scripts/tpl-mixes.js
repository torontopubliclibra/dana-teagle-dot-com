let tplMixes = {
    content: $(".tpl-page-text"),
    mixes: {},
    range: "4",
    stream: "tidal",
    streamSelect: `<p>streaming links: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: `<p>>> <span class="range-selected">#196-151</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#150-101</button></p>`,
    functions: {
        rangeSet: (range) => {
            switch(range) {
                case "4":
                    tplMixes.range = "4";
                    tplMixes.rangeSelect = `<p>>> <span class="range-selected">#196-151</span> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#150-101</button></p>`
                    break;
                case "3":
                    tplMixes.range = "3";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#196-151</button> | <span class="range-selected">#150-101</span></p>`
                    break;
                case "2":
                    tplMixes.range = "2";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#196-151</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#150-101</button> | <span class="range-selected">#100-51</span> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#50-1</button> </p>`
                    break;
                case "1":
                    tplMixes.range = "1";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('4')">#196-151</button> | <button class="range" onclick="tplMixes.functions.rangeSet('3')">#150-101</button> | <button class="range" onclick="tplMixes.functions.rangeSet('2')">#100-51</button> | <span class="range-selected">#50-1</span> </p>`
                    break;
            }
            tplMixes.range = range;
            tplMixes.functions.mixDisplay();
        },
        streamSet: (stream) => {
            switch(stream) {
                case "tidal":
                    tplMixes.stream = "tidal";
                    tplMixes.streamSelect = `<p>streaming links: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`
                    break;
                case "spotify":
                    tplMixes.stream = "spotify";
                    tplMixes.streamSelect = `<p>streaming links: <button class="range" onclick="tplMixes.functions.streamSet('tidal')">tidal</button> | <span class="range-selected">spotify</span></p>`
                    break;
            }
            tplMixes.stream = stream;
            tplMixes.functions.mixDisplay();
        },
        mixDisplay: () => {
            let range = tplMixes.range;
            let streamSelect = tplMixes.streamSelect;
            let rangeSelect = tplMixes.rangeSelect;
            let formattedMixes = [streamSelect, `<hr>`, rangeSelect];
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

                        if (count >= 151 && count <= 200 && link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 151 && count <= 200 && !link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "3":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];

                        if (count >= 101 && count <= 150 && link ) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 101 && count <= 150 && !link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "2":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];

                        if (count >= 51 && count <= 100 && link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 51 && count <= 100 && !link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
                case "1":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);

                        if (count >= 1 && count <= 50 && link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let href = `href="${object.href}"`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${href}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 1 && count <= 50 && !link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
            }
            tplMixes.content.html(formattedMixes.reduce((accumulator, mix) => {
                return accumulator + mix;
            }));
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
                }
                mixes.push(mix);
            }
            tplMixes.mixes = mixes;
            tplMixes.functions.mixDisplay();
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tplMixes.init();
});