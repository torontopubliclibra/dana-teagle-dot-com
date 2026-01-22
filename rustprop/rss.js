let rssFormatter = {
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
            let formattedDate = rssFormatter.formatDate(date);
            let headline = item.headline || '';
            let imageUrl = Array.isArray(item.images) ? item.images[0] : item.images;
            let image = imageUrl.replace(/^\.\//, '');
            let title = Array.isArray(item.alt) ? item.alt[0] : item.alt;
            if (title.includes('&')) {
                title = title.replace(/&/g, '&amp;');
            }
            let formattedItem =
            `<item>
                <title>${title}</title>
                <link>https://www.danateagle.com/rustprop/${item.id}</link>
                <guid>https://www.danateagle.com/rustprop/${item.id}</guid>
                <pubDate>${formattedDate}</pubDate>
                <description><![CDATA[<img src="https://www.danateagle.com/rustprop/images/${image}" alt="${title}"/><br/>${headline}]]></description>
            </item>`;
            formattedItems += formattedItem + '\n';
        });
        console.log(formattedItems);
    },
    init: () => {
        fetch('../data/rustprop.json')
            .then(response => response.json())
            .then(data => rssFormatter.formatRss(data));
    },
};
document.addEventListener('DOMContentLoaded', function () {
    rssFormatter.init();
});