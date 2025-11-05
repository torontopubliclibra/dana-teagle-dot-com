let tplNow = {
    content: $(".tpl-page-text"),
    updated: "",
    date: $(".date"),
    list: [],
    movies: [],
    books: [],
    mixes: {},
    functions: {
        nowDisplay: () => {
            let formattedNow = [];
            for (let list in tplNow.list) {
                let array = [tplNow.list[list]];
                array.forEach(bullet => {
                    let item = `<p>>> ${bullet}</p>`;
                    formattedNow.push(item);
                });
            }

            formattedNow.push(`<hr><p>>> last watched (<a href="/tpl/logs#movies">see more</a>)</p>`);
            for (let list in tplNow.movies) {
                let array = [tplNow.movies[list]];
                array.forEach(movie => {
                    let item = `<p class="sub">> ${movie}</p>`;
                    formattedNow.push(item);
                });
            }

            formattedNow.push(`<p>>> last read (<a href="/tpl/logs#books">see more</a>:</p>`);
            for (let list in tplNow.books) {
                let array = [tplNow.books[list]];
                array.forEach(book => {
                    let item = `<p class="sub">> ${book}</p>`;
                    formattedNow.push(item);
                });
            }

            formattedNow.push(`<p>>> latest mixes (<a href="/tpl/mixes">see more</a>)</p>`);
            for (let mix in tplNow.mixes) {
                let object = tplNow.mixes[mix];
                let link = object["tidal"];
                formattedNow.push(`<p class="sub">> rusty mix #${object.number}: <a href="${link}" target="_blank">${object.title}</a></p>`);
            }

            tplNow.content.html(formattedNow.reduce((accumulator, log) => {
                return accumulator + log;
            }));
            tplNow.date.text(tplNow.updated);
        },
    },
    init: () => {
        fetch('../data/now.json').then(response => response.json())
        .then((data) => {
            let list = [];
            for (let object in data) {
                list.push(data[object]);
            }
            tplNow.updated = Object.keys(data)[0];
            tplNow.list = list[0];
            tplNow.functions.nowDisplay();
        })
        .catch(error => console.log(error));

        fetch('../data/logs.json').then(response => response.json())
        .then((data) => {
            let movies = [];
            let books = [];
            for (let object in data) {
                movies.push(data[object]["movies"]);
                books.push(data[object]["books"]);
            }
            tplNow.movies = movies[0].slice(0,3);
            tplNow.books = books[0].slice(0,3);
            tplNow.functions.nowDisplay();
        })
        .catch(error => console.log(error));

        fetch('../data/mixes.json').then(response => response.json())
        .then((data) => {
            let mixes = [];
            for (let object in data) {
                let mix = {
                    "title": object,
                    "number": data[object]["number"],
                    "tidal": data[object]["tidal"],
                };
                mixes.push(mix);
            }
            tplNow.mixes = mixes.slice(0,3);
            tplNow.functions.nowDisplay();
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tplNow.init();
});