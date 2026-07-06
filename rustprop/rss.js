let rssFormatter = {
    formattedRss: '',
    escapeXml: (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;'),
    getMimeType: (url) => {
        const extension = String(url || '').split('.').pop().toLowerCase();
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
        };
        return mimeTypes[extension] || 'application/octet-stream';
    },
    formatDate: (datestamp) => {
        const [day, month, year] = datestamp.split('/').map(Number);
        const fullYear = year < 100 ? 2000 + year : year;
        const date = new Date(fullYear, month - 1, day);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getUTCDay()]}, ${String(day).padStart(2, '0')} ${months[month - 1]} ${fullYear}`;
    },
    formatRss: (json) => {
        let formattedItems = '';
        json.items.slice(0, 11).forEach((item) => {
            let date = Array.isArray(item.date) ? item.date[0] : item.date;
            let formattedDate = rssFormatter.formatDate(date);
            let headline = item.headline || '';
            let imageUrl = Array.isArray(item.images) ? item.images[0] : item.images;
            let image = String(imageUrl || '').replace(/^\.\//, '');
            let imageHref = `https://www.danateagle.com/rustprop/${image}`;
            let title = rssFormatter.escapeXml(Array.isArray(item.alt) ? item.alt[0] : item.alt);
            let description = headline.replace(/\]\]>/g, ']]&gt;');
            let enclosureType = rssFormatter.getMimeType(image);
            let permalink = `https://www.danateagle.com/rustprop#${item.id}`;
            let formattedItem =
                `<item>
                <title>${title}</title>
                <link>${permalink}</link>
                <guid>${permalink}</guid>
                <pubDate>${formattedDate}</pubDate>
                <description><![CDATA[${description}]]></description>
                <enclosure url="${imageHref}" type="${enclosureType}"/>
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