
let tplLogs = {
    content: $(".tpl-page-text"),
    year: "2025",
    updated: "",
    date: $(".date"),
    twentySix: {
        movies: [],
        books: [],
    },
    twentyFive: {
        movies: [],
        books: [],
    },
    twentyFour: {
        movies: [],
        books: [],
    },
    yearSelect: `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2026')">2026</button> | <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`,
    logCategories: `<hr class="alt"><div class="tpl-categories logs"><ul><li class="link-category"><a href="#watched">watched<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#read">read<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li></ul></div>`,
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
            let movieCount = 0, bookCount = 0;
            switch(year) {
                case "2026":
                    movieCount = tplLogs.twentySix.movies[0]?.length || 0;
                    bookCount = tplLogs.twentySix.books[0]?.length || 0;
                    break;
                case "2025":
                    movieCount = tplLogs.twentyFive.movies[0]?.length || 0;
                    bookCount = tplLogs.twentyFive.books[0]?.length || 0;
                    break;
                case "2024":
                    movieCount = tplLogs.twentyFour.movies[0]?.length || 0;
                    bookCount = tplLogs.twentyFour.books[0]?.length || 0;
                    break;
            }
            let logCategories = `<hr class="alt"><div class="tpl-categories logs"><ul><li class="link-category"><a href="#watched">movies watched (${movieCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#read">books read (${bookCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li></ul></div>`;
            let toggles = tplLogs.yearSelect + logCategories;
            let formattedLogs = [toggles, `<hr class="no-top"><p id="watched">>> movies watched in ${year} (${movieCount})`];

            switch(year) {
                case "2026":
                    for (let list in tplLogs.twentySix.movies) {
                        let array = [ ...tplLogs.twentySix.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="read">>> books read in ${year} (${bookCount})`);
                    for (let list in tplLogs.twentySix.books) {
                        let array = [ ...tplLogs.twentySix.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    tplLogs.date.text(``);
                    break;
                case "2025":
                    for (let list in tplLogs.twentyFive.movies) {
                        let array = [ ...tplLogs.twentyFive.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="read">>> books read in ${year} (${bookCount})`);
                    for (let list in tplLogs.twentyFive.books) {
                        let array = [ ...tplLogs.twentyFive.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    tplLogs.date.text(` [ up to ${tplLogs.updated} ]`);
                    break;
                case "2024":
                    for (let list in tplLogs.twentyFour.movies) {
                        let array = [ ...tplLogs.twentyFour.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="read">>> books read in ${year} (${bookCount})`);
                    for (let list in tplLogs.twentyFour.books) {
                        let array = [ ...tplLogs.twentyFour.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    tplLogs.date.text("");
                    break;
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
                    };
                    tplLogs.twentySix = twentySix;

                    let twentyFive = {
                        "movies": [data["2025"] ? data["2025"]["movies"] : []],
                        "books": [data["2025"] ? data["2025"]["books"] : []],
                    };
                    tplLogs.twentyFive = twentyFive;

                    let twentyFour = {
                        "movies": [data["2024"] ? data["2024"]["movies"] : []],
                        "books": [data["2024"] ? data["2024"]["books"] : []],
                    };
                    tplLogs.twentyFour = twentyFour;
                    tplLogs.functions.logsDisplay();
                })
                .catch(error => console.log(error));

                if (window.location.hash) {
                    let hash = window.location.hash;
                    if (hash === "#watched" || hash === "#read") {
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