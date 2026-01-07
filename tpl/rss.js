let tplRssFormatter = {
    formattedRss: '',
    formatDate: (datestamp) => {
        const [day, month, year] = datestamp.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        const date = new Date(fullYear, month - 1, day);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getUTCDay()]}, ${String(day).padStart(2, '0')} ${months[month-1]} ${fullYear}`;
    },
    formatRss: (json) => {
        let formattedItems = '';
        json.items.slice(0, 11).forEach((item) => {
            let date = Array.isArray(item.date) ? item.date[0] : item.date;
            let formattedDate = tplRssFormatter.formatDate(date);
            let headline = item.alt || '';
            let imageUrl = item.url;
            let image = imageUrl.replace(/^\.\//, '');
            let title = item.alt || '';
            if (title.includes('&')) {
                title = title.replace(/&/g, '&amp;');
            }
            let permalink = `https://www.torontopubliclibra.com/feed#${item.id}`;
            let formattedItem =
`<item>
    <title>${title}</title>
    <link>${permalink}</link>
    <guid>${permalink}</guid>
    <pubDate>${formattedDate}</pubDate>
    <description><![CDATA[<img src="${image}" alt="${title}"/><br/>${headline}]]></description>
</item>`;
            formattedItems += formattedItem + '\n';
        });
        console.log(formattedItems);
    },
    init: () => {
        fetch('../../data/feed.json')
            .then(response => response.json())
            .then(data => tplRssFormatter.formatRss(data));
    },
};
document.addEventListener('DOMContentLoaded', function () {
    tplRssFormatter.init();
});