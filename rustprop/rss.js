// app object
let rssFormatter = {

    formattedRss: ``,

    formatDate: (datestamp) => {
        const [day, month, year] = datestamp.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        const date = new Date(fullYear, month - 1, day);
        return date.toUTCString();
    },

    formatRss: () => {
        let items = document.querySelectorAll(`div.item`);
        let formattedItems = ``;

        items.forEach((item, index) => {
            if (index < 11) {
                let date = item.querySelector(`.datestamp`).innerText;
                let formattedDate = rssFormatter.formatDate(date);
                let headline = item.querySelector('.headline').innerHTML;
                let url = item.querySelector('img').src;
                let image = url.substring(url.search(/images/));
                let title = item.querySelector('img').alt;

                if (title.includes(`&`)) {
                    title = title.replace(`&`, `&amp;`);
                }

                let formattedItem =
`<item>
    <title>${title}</title>
    <link>https://www.danateagle.com/rustprop/${item.id}</link>
    <guid>https://www.danateagle.com/rustprop/${item.id}</guid>
    <pubDate>${formattedDate}</pubDate>
    <description><![CDATA[<img src="https://www.danateagle.com/rustprop/images/${image}" alt="${title}"/><br/>${headline}]]></description>
</item>`;
                formattedItems += formattedItem + `\n`;
            }
        });

        console.log(formattedItems);
    },

    // app initializion
    init: () => {
        rssFormatter.formatRss();
    },
};

// initialize the app
$(document).ready(() => {
    rssFormatter.init();
});