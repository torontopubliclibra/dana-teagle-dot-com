let tplFeed = {
    content: $(".feed-items"),
    items: [],
    functions: {
        feedDisplay: () => {
            let formattedFeed = [];

            for (let list in tplFeed.items) {
                let array = [tplFeed.items[list]];
                array.forEach(item => {
                    let image = `<img src="${item.url}" alt="${item.alt}" class="feed-item">`;
                    formattedFeed.push(image);
                });
            }

            tplFeed.content.html(formattedFeed.reduce((accumulator, log) => {
                return accumulator + log;
            }));
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
            tplFeed.functions.feedDisplay();
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tplFeed.init();
});