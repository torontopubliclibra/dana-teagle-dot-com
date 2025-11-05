let tplMixes = {
    content: $(".tpl-page-text"),
    mixes: {},
    range: "2",
    stream: "tidal",
    streamSelect: `<p>streaming links: <span class="range-selected">tidal</span> | <button class="range" onclick="tplMixes.functions.streamSet('spotify')">spotify</button></p>`,
    rangeSelect: `<p>>> <span class="range-selected">#196-101</span> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#100-1</button></p>`,
    functions: {
        rangeSet: (range) => {
            switch(range) {
                case "2":
                    tplMixes.range = "2";
                    tplMixes.rangeSelect = `<p>>> <span class="range-selected">#196-101</span> | <button class="range" onclick="tplMixes.functions.rangeSet('1')">#100-1</button></p>`
                    break;
                case "1":
                    tplMixes.range = "1";
                    tplMixes.rangeSelect = `<p>>> <button class="range" onclick="tplMixes.functions.rangeSet('2')">#196-101</button> | <span class="range-selected">#100-1</span></p>`
                    break;
            }
            tplMixes.range = range;
            tplMixes.functions.mixDisplay();
            window.scroll(top);
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

            switch(range) {
                case "2":
                    for (let mix in tplMixes.mixes) {
                        let object = tplMixes.mixes[mix];
                        let count = Number(object.number);
                        let link = object[stream];

                        if (count >= 101 && count <= 200 && link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count >= 101 && count <= 200 && !link) {
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
                        let link = object[stream];

                        if (count <= 100 && link ) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<a href="${link}" target="_blank" class="sub mix">${image}${title}</a>`)
                        } else if (count <= 100 && !link) {
                            let title = `<p><small>#${object.number} \\\\</small><br/>${object.title}</p><img src="../assets/icons/external-link.svg" class="icon disabled" alt="external link icon">`;
                            let image = `<img src="${object.image}" alt="${object.title} cover art"/>`;
                            formattedMixes.push(`<div class="sub mix disabled">${image}${title}</div>`)
                        }
                    }
                    break;
            }
            formattedMixes.push(rangeSelect);
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

        if (localStorage['stream'] === 'spotify') {
            tplMixes.functions.streamSet('spotify');
        }
    },
};
$(document).ready(() => {
    tplMixes.init();
});