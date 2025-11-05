let tplLogs = {
    content: $(".tpl-page-text"),
    year: "2025",
    updated: "05/11/2025",
    date: $(".date"),
    movies: [],
    books: [],
    // yearSelect: `<p><span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`,
    functions: {
        // yearSet: (year) => {
        //     switch(year) {
        //         case "2":
        //             tplLogs.year = "2025";
        //             tplLogs.yearSelect = `<p><span class="year-selected">2025</span> | <button class="range" onclick="tplLogs.functions.yearSet('2024')">2024</button></p>`
        //             break;
        //         case "1":
        //             tplLogs.year = "2024";
        //             tplLogs.yearSelect = `<p><button class="range" onclick="tplLogs.functions.yearSet('2025')">2025</button> | <span class="year-selected">2024</span></p>`
        //             break;
        //     }
        //     tplLogs.year = year;
        //     tplLogs.functions.logsDisplay();
        //     window.scroll(top);
        // },
        logsDisplay: () => {
            let year = tplLogs.year;
            // let yearSelect = tplLogs.yearSelect;
            // let formattedLogs = [yearSelect, `<hr><p id="movies">>> movies watched in 2025 (<a href="/letterboxd" target="_blank">letterboxd</a>):</p>`];
            let formattedLogs = [`<p id="movies">>> watched in 2025 (<a href="/letterboxd" target="_blank">letterboxd</a>)</p>`];

            switch(year) {
                case "2025":
                    for (let list in tplLogs.movies) {
                        let array = [ ...tplLogs.movies[list]];
                        array.forEach(movie => {
                            let item = `<p class="sub">> ${movie}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    formattedLogs.push(`<hr><p id="books">>> read in 2025 (<a href="/goodreads" target="_blank">goodreads</a>)</p>`);
                    for (let list in tplLogs.books) {
                        let array = [ ...tplLogs.books[list]];
                        array.forEach(book => {
                            let item = `<p class="sub">> ${book}</p>`;
                            formattedLogs.push(item);
                        });
                    }
                    break;
            }
            tplLogs.content.html(formattedLogs.reduce((accumulator, log) => {
                return accumulator + log;
            }));
            tplLogs.date.text(tplLogs.updated);
        },
    },
    init: () => {
        fetch('../data/logs.json').then(response => response.json())
        .then((data) => {
            let movies = [];
            let books = [];
            for (let object in data) {
                movies.push(data[object]["movies"]);
                books.push(data[object]["books"]);
            }
            tplLogs.movies = movies;
            tplLogs.books = books;
            tplLogs.functions.logsDisplay();
        })
        .catch(error => console.log(error));

                if (window.location.hash) {
            let hash = window.location.hash;
            if (hash === "#movies" || hash === "#books") {
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