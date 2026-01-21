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
    yearSelect: `<p>year: <span class="year-selected">2026</span> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`,
    functions: {
        yearSet(year) {
            tplLogs.year = year;
            tplLogs.yearSelect =
                year === "2026"
                    ? `<p>year: <span class="year-selected">2026</span> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`
                    : year === "2025"
                    ? `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2026')">2026</button> | <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`
                    : `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2026')">2026</button> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <span class="year-selected">2024</span></p>`;
            tplLogs.functions.logsDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        logsDisplay() {
            const year = tplLogs.year;
            const yearObj = tplLogs.years[year];
            const movieCount = yearObj.movies.length;
            const bookCount = yearObj.books.length;
            const tvCount = yearObj.tv.length;
            const navItems = [];
            if (movieCount > 0) navItems.push(`<li class="link-category"><a href="#movies">movies watched (${movieCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            if (bookCount > 0) navItems.push(`<li class="link-category"><a href="#books">books read (${bookCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            if (tvCount > 0) navItems.push(`<li class="link-category"><a href="#tv">tv shows watched (${tvCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            let logCategories = '';
            if (navItems.length > 0) {
                logCategories = `<hr class="alt"><div class="tpl-categories logs"><ul>${navItems.join('')}</ul></div>`;
            }
            const toggles = tplLogs.yearSelect + logCategories;
            const formattedLogs = [toggles];
            if (movieCount > 0) {
                formattedLogs.push(`<hr class="no-top"><p id="movies">>> movies watched in ${year} (${movieCount})`);
                yearObj.movies.forEach(movie => {
                    formattedLogs.push(`<p class="sub">> ${movie}</p>`);
                });
            }
            if (bookCount > 0) {
                formattedLogs.push(`<hr><p id="books">>> books read in ${year} (${bookCount})`);
                yearObj.books.forEach(book => {
                    formattedLogs.push(`<p class="sub">> ${book}</p>`);
                });
            }
            if (tvCount > 0) {
                formattedLogs.push(`<hr><p id="tv">>> tv shows watched in ${year} (${tvCount})`);
                yearObj.tv.forEach(tvshow => {
                    formattedLogs.push(`<p class="sub">> ${tvshow}</p>`);
                });
            }
            tplLogs.date.text(year === "2026" ? ` // up to ${tplLogs.updated}` : "");
            formattedLogs.push(`<hr>` + tplLogs.yearSelect + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
            tplLogs.content.html(formattedLogs.join(''));
        },
    },
    init() {
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
                        tplLogs.years["2026"].movies = data["2026"]?.movies || [];
                        tplLogs.years["2026"].books = data["2026"]?.books || [];
                        tplLogs.years["2026"].tv = data["2026"]?.tv || [];
                        tplLogs.years["2025"].movies = data["2025"]?.movies || [];
                        tplLogs.years["2025"].books = data["2025"]?.books || [];
                        tplLogs.years["2025"].tv = data["2025"]?.tv || [];
                        tplLogs.years["2024"].movies = data["2024"]?.movies || [];
                        tplLogs.years["2024"].books = data["2024"]?.books || [];
                        tplLogs.years["2024"].tv = data["2024"]?.tv || [];
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