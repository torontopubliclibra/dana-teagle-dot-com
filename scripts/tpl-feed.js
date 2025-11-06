let tplFeed = {
    content: $(".feed-items"),
    toggle: $(".feed-toggle"),
    range: {
        start: 0,
        end: 10,
    },
    items: [],
    visibileItems: [],
    functions: {
        feedDisplay: (start, end) => {
            let formattedFeed = [];
            let visibleItems = tplFeed.items.slice(start, end);
            tplFeed.visibileItems = visibleItems;

            for (let list in visibleItems) {
                let array = [visibleItems[list]];
                array.forEach(item => {
                    let image = `<img src="${item.url}" alt="${item.alt}" class="feed-item">`;
                    formattedFeed.push(image);
                });
            }

            tplFeed.content.html(formattedFeed.reduce((accumulator, log) => {
                return accumulator + log;
            }));

            tplFeed.functions.updateToggle();
        },
        updateToggle: () => {
            let toggleText = '<p>';
            
            // Show newer button if not at the beginning
            if (tplFeed.range.start > 0) {
                toggleText += '<button class="range" onclick="tplFeed.functions.newer()"><< newer</button>';
            } else {
                toggleText += '<span class="year-selected"><< newer</span>';
            }
            
            toggleText += ' | ';
            
            // Show older button if there are more items
            if (tplFeed.range.end < tplFeed.items.length) {
                toggleText += '<button class="range" onclick="tplFeed.functions.older()">older >></button>';
            } else {
                toggleText += '<span class="year-selected">older >></span>';
            }
            
            toggleText += '</p>';
            tplFeed.toggle.html(toggleText);
        },
        newer: () => {
            if (tplFeed.range.start > 0) {
                tplFeed.range.start -= 10;
                tplFeed.range.end -= 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scroll(top);
            }
        },
        older: () => {
            if (tplFeed.range.end < tplFeed.items.length) {
                tplFeed.range.start += 10;
                tplFeed.range.end += 10;
                tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
                window.scroll(top);
            }
        },
    },
    init: () => {
        fetch('../data/feed.json').then(response => response.json())
        .then((data) => {
            let list = [];
            for (let object in data) {
                list.push(data[object]);
            }
            tplFeed.items = list[0];
            tplFeed.functions.feedDisplay(tplFeed.range.start, tplFeed.range.end);
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tplFeed.init();
});