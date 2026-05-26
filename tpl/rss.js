let tplRssFormatter = {
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
        return `${days[date.getUTCDay()]}, ${String(day).padStart(2, '0')} ${months[month-1]} ${fullYear}`;
    },
    formatRss: (json) => {
        let formattedItems = '';
        json.items.slice(0, 10).forEach((item) => {
            let date = Array.isArray(item.date) ? item.date[0] : item.date;
            let formattedDate = tplRssFormatter.formatDate(date);
            let headline = item.alt || '';
            let imageUrl = item.url || '';
            let title = tplRssFormatter.escapeXml(headline);
            let description = headline.replace(/\]\]>/g, ']]&gt;');
            let enclosureType = tplRssFormatter.getMimeType(imageUrl);
            let permalink = `https://www.torontopubliclibra.com/feed#${item.id}`;
            let formattedItem =
`<item>
    <title>${title}</title>
    <link>${permalink}</link>
    <guid>${permalink}</guid>
    <pubDate>${formattedDate}</pubDate>
    <description><![CDATA[${description}]]></description>
    <enclosure url="${imageUrl}" type="${enclosureType}"/>
</item>`;
            formattedItems += formattedItem + '\n';
        });
        console.log(formattedItems);
    },
    init: () => {
        fetch('../../data/feed.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch feed.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => tplRssFormatter.formatRss(data))
            .catch(error => {
                console.error('RSS formatter error:', error);
            });
    },
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        tplRssFormatter.init();
    });
} else {
    tplRssFormatter.init();
}