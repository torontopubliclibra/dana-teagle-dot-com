let tplNow = {
    content: $(".tpl-page-text"),
    updated: "",
    date: $(".date"),
    list: [],
    movies: [],
    books: [],
    tv: [],
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


            formattedNow.push(`<hr><p>>> last watched movies (<a href="/tpl/logs#movies">see more</a>)</p>`);
            for (let list in tplNow.movies) {
                let array = [tplNow.movies[list]];
                array.forEach(movie => {
                    let item = `<p class="sub">> ${movie}</p>`;
                    formattedNow.push(item);
                });
            }

            // TV section
            formattedNow.push(`<p>>> last watched television (<a href="/tpl/logs#tv">see more</a>)</p>`);
            for (let list in tplNow.tv) {
                let array = [tplNow.tv[list]];
                array.forEach(tvshow => {
                    let item = `<p class="sub">> ${tvshow}</p>`;
                    formattedNow.push(item);
                });
            }

            formattedNow.push(`<p>>> last read books (<a href="/tpl/logs#books">see more</a>)</p>`);
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
            let movies2026 = (data["2026"] && data["2026"]["movies"]) ? data["2026"]["movies"] : [];
            let books2026 = (data["2026"] && data["2026"]["books"]) ? data["2026"]["books"] : [];
            let tv2026 = (data["2026"] && data["2026"]["tv"]) ? data["2026"]["tv"] : [];

            let movies2025 = (data["2025"] && data["2025"]["movies"]) ? data["2025"]["movies"] : [];
            let books2025 = (data["2025"] && data["2025"]["books"]) ? data["2025"]["books"] : [];
            let tv2025 = (data["2025"] && data["2025"]["tv"]) ? data["2025"]["tv"] : [];

            let movies = movies2026.slice(0, 3);
            if (movies.length < 3) {
                movies = movies.concat(movies2025.slice(0, 3 - movies.length));
            }
            let books = books2026.slice(0, 3);
            if (books.length < 3) {
                books = books.concat(books2025.slice(0, 3 - books.length));
            }
            let tv = tv2026.slice(0, 3);
            if (tv.length < 3) {
                tv = tv.concat(tv2025.slice(0, 3 - tv.length));
            }

            tplNow.movies = movies;
            tplNow.books = books;
            tplNow.tv = tv;
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