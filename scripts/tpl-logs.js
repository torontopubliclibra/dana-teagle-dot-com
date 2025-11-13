let tplLogs = {
    content: $(".tpl-page-text"),
    year: "2025",
    updated: "13/11/2025",
    date: $(".date"),
    twentyFive: {
        movies: [],
        books: [],
    },
    twentyFour: {
        movies: [],
        books: [],
    },
    yearSelect: `<p>year: <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`,
    logCategories: `<hr class="alt"><div class="tpl-categories logs"><ul><li class="link-category"><a href="#watched">watched<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#read">read<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li></ul></div>`,
    functions: {
        yearSet: (year) => {
            switch(year) {
                case "2025":
                    tplLogs.yearSelect = `<p>year: <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`;
                    break;
                case "2024":
                    tplLogs.yearSelect = `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <span class="year-selected">2024</span></p>`;
                    break;
            }
            tplLogs.year = year;
            tplLogs.functions.logsDisplay();
            window.scroll(top);
        },
        logsDisplay: () => {
            let year = tplLogs.year;
            let movieCount, bookCount;
            switch(year) {
                case "2025":
                    movieCount = tplLogs.twentyFive.movies[0].length;
                    bookCount = tplLogs.twentyFive.books[0].length;
                    break;
                case "2024":
                    movieCount =  tplLogs.twentyFour.movies[0].length;
                    bookCount = tplLogs.twentyFour.books[0].length;
                    break;
            }
            let logCategories = `<hr class="alt"><div class="tpl-categories logs"><ul><li class="link-category"><a href="#watched">movies watched (${movieCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li><li class="link-category"><a href="#read">books read (${bookCount})<img src="../assets/icons/arrow-down.svg" alt="scroll down icon"></a></li></ul></div>`;
            let toggles = tplLogs.yearSelect + logCategories;
            let formattedLogs = [toggles, `<hr class="no-top"><p id="watched">>> movies watched in ${year} (${movieCount})`];

            switch(year) {
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
                    tplLogs.date.text(` [ as of  ${tplLogs.updated} ]`);
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
                    tplLogs.date.text(``);
                    break;
            }
            formattedLogs.push(`<hr>` + tplLogs.yearSelect + `<p>See also: <a href="/letterboxd" target="_blank" title="@torontolibra on Letterboxd">Letterboxd</a> | <a href="/goodreads" target="_blank" title="Dana Teagle on Goodreads">Goodreads</a></p>`);
            tplLogs.content.html(formattedLogs.reduce((accumulator, log) => {
                return accumulator + log;
            }));
        },
    },
    init: () => {
        fetch('../data/logs.json').then(response => response.json())
        .then((data) => {
            let twentyFive = {
                "movies": [data["2025"]["movies"]],
                "books": [data["2025"]["books"]],
            };
            tplLogs.twentyFive = twentyFive;

            let twentyFour = {
                "movies": [data["2024"]["movies"]],
                "books": [data["2024"]["books"]],
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
    },
};
$(document).ready(() => {
    tplLogs.init();
});