
let tplLogs = {
    content: $(".tpl-page-text"),
    year: "2026",
    updated: "",
    date: $(".date"),
    twentySix: {
        movies: [],
        books: [],
        tv: [],
    },
    twentyFive: {
        movies: [],
        books: [],
        tv: [],
    },
    twentyFour: {
        movies: [],
        books: [],
        tv: [],
    },
    yearSelect: `<p>year: <span class="year-selected">2026</span> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`,
    logCategories: `<hr class="alt"><div class="tpl-categories logs"><ul><li class="link-category"><a href="#movies">watched<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#tv">tv<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#books">read<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li></ul></div>`,
    functions: {
        yearSet: (year) => {
            switch(year) {
                case "2026":
                    tplLogs.yearSelect = `<p>year: <span class="year-selected">2026</span> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`;
                    break;
                case "2025":
                    tplLogs.yearSelect = `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2026')">2026</button> | <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`;
                    break;
                case "2024":
                    tplLogs.yearSelect = `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2026')">2026</button> | <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <span class="year-selected">2024</span></p>`;
                    break;
            }
            tplLogs.year = year;
            tplLogs.functions.logsDisplay();
            window.scroll(top);
        },
        logsDisplay: () => {
            let year = tplLogs.year;
            let movieCount = 0, bookCount = 0, tvCount = 0;
            let yearObj;
            switch(year) {
                case "2026":
                    yearObj = tplLogs.twentySix;
                    break;
                case "2025":
                    yearObj = tplLogs.twentyFive;
                    break;
                case "2024":
                    yearObj = tplLogs.twentyFour;
                    break;
            }
            movieCount = yearObj.movies[0]?.length || 0;
            bookCount = yearObj.books[0]?.length || 0;
            tvCount = yearObj.tv && yearObj.tv[0]?.length ? yearObj.tv[0].length : 0;

            // Build navigation only for nonzero counts
            let navItems = [];
            if (movieCount > 0) {
                navItems.push(`<li class="link-category"><a href="#movies">movies watched (${movieCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            }
            if (tvCount > 0) {
                navItems.push(`<li class="link-category"><a href="#tv">television watched (${tvCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            }
            if (bookCount > 0) {
                navItems.push(`<li class="link-category"><a href="#books">books read (${bookCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li>`);
            }
            let logCategories = '';
            if (navItems.length > 0) {
                logCategories = `<hr class="alt"><div class="tpl-categories logs"><ul>${navItems.join('')}</ul></div>`;
            }
            let toggles = tplLogs.yearSelect + logCategories;
            let formattedLogs = [toggles];
            if (movieCount > 0) {
                formattedLogs.push(`<hr class="no-top"><p id="movies">>> movies watched in ${year} (${movieCount})`);
            }

            if (movieCount > 0) {
                for (let list in yearObj.movies) {
                    let array = [ ...yearObj.movies[list]];
                    array.forEach(movie => {
                        let item = `<p class="sub">> ${movie}</p>`;
                        formattedLogs.push(item);
                    });
                }
            }

            // TV section
            if (tvCount > 0) {
                formattedLogs.push(`<hr><p id="tv">>> television watched in ${year} (${tvCount})`);
                for (let list in yearObj.tv) {
                    let array = [ ...yearObj.tv[list]];
                    array.forEach(tvshow => {
                        let item = `<p class="sub">> ${tvshow}</p>`;
                        formattedLogs.push(item);
                    });
                }
            }

            if (bookCount > 0) {
                formattedLogs.push(`<hr><p id="books">>> books read in ${year} (${bookCount})`);
                for (let list in yearObj.books) {
                    let array = [ ...yearObj.books[list]];
                    array.forEach(book => {
                        let item = `<p class="sub">> ${book}</p>`;
                        formattedLogs.push(item);
                    });
                }
            }

            if (year === "2026") {
                tplLogs.date.text(` [ up to ${tplLogs.updated} ]`);
            } else {
                tplLogs.date.text("");
            }

            formattedLogs.push(`<hr>` + tplLogs.yearSelect + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
            tplLogs.content.html(formattedLogs.reduce((accumulator, log) => {
                return accumulator + log;
            }));
        },
    },
    init: () => {
        fetch('../data/now.json')
            .then(response => response.json())
            .then((nowData) => {
                tplLogs.updated = Object.keys(nowData)[0] || '';
            })
            .catch(error => console.log(error))
            .finally(() => {
                fetch('../data/logs.json').then(response => response.json())
                .then((data) => {
                    let twentySix = {
                        "movies": [data["2026"] ? data["2026"]["movies"] : []],
                        "books": [data["2026"] ? data["2026"]["books"] : []],
                        "tv": [data["2026"] && data["2026"]["tv"] ? data["2026"]["tv"] : []],
                    };
                    tplLogs.twentySix = twentySix;

                    let twentyFive = {
                        "movies": [data["2025"] ? data["2025"]["movies"] : []],
                        "books": [data["2025"] ? data["2025"]["books"] : []],
                        "tv": [data["2025"] && data["2025"]["tv"] ? data["2025"]["tv"] : []],
                    };
                    tplLogs.twentyFive = twentyFive;

                    let twentyFour = {
                        "movies": [data["2024"] ? data["2024"]["movies"] : []],
                        "books": [data["2024"] ? data["2024"]["books"] : []],
                        "tv": [data["2024"] && data["2024"]["tv"] ? data["2024"]["tv"] : []],
                    };
                    tplLogs.twentyFour = twentyFour;
                    tplLogs.functions.logsDisplay();
                })
                .catch(error => console.log(error));

                if (window.location.hash) {
                    let hash = window.location.hash;
                    if (hash === "#movies" || hash === "#books" || hash === "#tv") {
                        setTimeout(() => {
                            document.querySelector(hash).scrollIntoView();
                        }, 100);
                    }
                }
            });
    },
};
$(document).ready(() => {
    tplLogs.init();
});