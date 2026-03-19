const tplLogs = {
    content: $(".tpl-page-text"),
    year: "2026",
    updated: "",
    date: $(".date"),
    years: {
        "2026": { movies: [], books: [], tv: [] },
        "2025": { movies: [], books: [], tv: [] },
        "2024": { movies: [], books: [], tv: [] }
    },
    yearList: ["2026", "2025", "2024"],
    yearSelect: "",
    functions: {
        yearSet(year) {
            tplLogs.year = year;
            tplLogs.yearSelect = tplLogs.functions.generateYearSelect(year);
            tplLogs.functions.logsDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        generateYearSelect(selectedYear) {
            return `<p>year: ` + tplLogs.yearList.map(y =>
                y === selectedYear
                    ? `<span class="year-selected">${y}</span>`
                    : `<button class="range" onclick="tplLogs.functions.yearSet('${y}')">${y}</button>`
            ).join(" | ") + `</p>`;
        },
        logsDisplay() {
            const year = tplLogs.year;
            const yearObj = tplLogs.years[year];
            const categories = [
                { key: 'movies', label: 'movies watched', icon: 'arrow-down.svg' },
                { key: 'books', label: 'books read', icon: 'arrow-down.svg' },
                { key: 'tv', label: 'tv shows watched', icon: 'arrow-down.svg' }
            ];
            const navItems = categories
                .filter(cat => yearObj[cat.key].length > 0)
                .map(cat => `<li class="link-category"><a href="#${cat.key}">${cat.label} (${yearObj[cat.key].length})<img src="../assets/icons/${cat.icon}" alt="scroll down icon"></a></li>`);
            let logCategories = navItems.length > 0 ? `<hr class="alt"><div class="tpl-categories logs"><ul>${navItems.join('')}</ul></div>` : '';
            const toggles = tplLogs.yearSelect + logCategories;
            const formattedLogs = [toggles];
            categories.forEach((cat, idx) => {
                const count = yearObj[cat.key].length;
                if (count > 0) {
                    formattedLogs.push(`${idx === 0 ? '<hr class="no-top">' : '<hr>'}<p id="${cat.key}">>> ${cat.label} in ${year} (${count})`);
                        yearObj[cat.key].forEach(item => {
                            if (typeof item === 'object' && item !== null) {
                                let logTitle = item.log || '';
                                if (item.link) {
                                    logTitle = `<a href="${item.link}" target="_blank">${logTitle}</a>`;
                                }
                                let logStr = logTitle;
                                if (item.year) {
                                    logStr += ` (${item.year}`;
                                    if (item.rewatch) logStr += ', rewatch';
                                    logStr += ')';
                                }
                                formattedLogs.push(`<p class="sub">> ${logStr}</p>`);
                            } else {
                                formattedLogs.push(`<p class="sub">> ${item}</p>`);
                            }
                        });
                }
            });
            tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
            formattedLogs.push(`<hr>` + tplLogs.yearSelect + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
            tplLogs.content.html(formattedLogs.join(''));
        },
    },
    init() {
        tplLogs.yearSelect = tplLogs.functions.generateYearSelect(tplLogs.year);
        fetch('../data/now.json')
            .then(response => response.json())
            .then(nowData => {
                tplLogs.updated = Object.keys(nowData)[0] || '';
            })
            .catch(error => console.log(error))
            .finally(() => {
                fetch('../data/logs.json')
                    .then(response => response.json())
                    .then(data => {
                        tplLogs.yearList.forEach(year => {
                            tplLogs.years[year].movies = data[year]?.movies || [];
                            tplLogs.years[year].books = data[year]?.books || [];
                            tplLogs.years[year].tv = data[year]?.tv || [];
                        });
                        tplLogs.functions.logsDisplay();
                    })
                    .catch(error => console.log(error));

                if (window.location.hash) {
                    const hash = window.location.hash;
                    if (["#movies", "#books", "#tv"].includes(hash)) {
                        setTimeout(() => {
                            const el = document.querySelector(hash);
                            if (el) el.scrollIntoView();
                        }, 100);
                    }
                }
            });
    }
};

$(document).ready(tplLogs.init);