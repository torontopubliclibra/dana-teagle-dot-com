let tplLogs = {
    content: $(".tpl-page-text"),
    year: "2025",
    updated: "05/11/2025",
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
    functions: {
        yearSet: (year) => {
            switch(year) {
                case "2025":
                    tplLogs.yearSelect = `<p>year: <span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`
                    break;
                case "2024":
                    tplLogs.yearSelect = `<p>year: <button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <span class="year-selected">2024</span></p>`
                    break;
            }
            tplLogs.year = year;
            tplLogs.functions.logsDisplay();
            window.scroll(top);
        },
        logsDisplay: () => {
            let year = tplLogs.year;
            let yearSelect = tplLogs.yearSelect;
            let formattedLogs = [yearSelect, `<hr class="no-top"><p id="watched">>> watched (<a href="/letterboxd" target="_blank">letterboxd</a>)</p>`];

            switch(year) {
                case "2025":
                    for (let list in tplLogs.twentyFive.movies) {
                        let array = [ ...tplLogs.twentyFive.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="read">>> read (<a href="/goodreads" target="_blank">goodreads</a>)</p>`);
                    for (let list in tplLogs.twentyFive.books) {
                        let array = [ ...tplLogs.twentyFive.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    break;
                case "2024":
                    for (let list in tplLogs.twentyFour.movies) {
                        let array = [ ...tplLogs.twentyFour.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="read">>> read (<a href="/goodreads" target="_blank">goodreads</a>)</p>`);
                    for (let list in tplLogs.twentyFour.books) {
                        let array = [ ...tplLogs.twentyFour.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    break;
            }
            formattedLogs.push(`<hr>` + yearSelect);
            tplLogs.content.html(formattedLogs.reduce((accumulator, log) => {
                return accumulator + log;
            }));
            tplLogs.date.text(tplLogs.updated);
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