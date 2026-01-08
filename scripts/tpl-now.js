let tplNow = {
    content: $(".tpl-page-text"),
    updated: "",
    date: $(".date"),
    list: [],
    movies: [],
    books: [],
    tv: [],
    mixes: [],
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

            if (tplNow.feedPosts && tplNow.feedPosts.length > 0) {
                formattedNow.push(`<hr><p>>> latest feed posts (<a href='/tpl/feed'>see more</a>)</p>`);
                    let feedItems = tplNow.feedPosts.map(post => {
                        let id = post.id || post.ID || post.number;
                        let permalink = id ? `/tpl/feed#${id}` : '#';
                        let img = post.url ? `<img src=\"${post.url}\" alt=\"${post.alt ? post.alt.replace(/\"/g, '&quot;') : ''}\" style=\"max-height: 150px; display: block; margin: 0 auto;\"/>` : '';
                        let date = post.date ? `<div style=\"font-size:0.65rem;color:rgba(243,232,233,0.9);text-align:left;padding:2px 5px;width:100%;letter-spacing:0.5px;\">&gt; ${post.date}</div>` : '';
                        return `<a href=\"${permalink}\" class=\"now-feed-post\" style=\"border: solid 3px rgba(243, 232, 233, 0.5);margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;background:none;\">${img}${date}</a>`;
                    }).join('');
                    let feedContainer = `<div id=\"now-feed-scroll\" style="display:flex;gap: 15px;overflow-x:auto;white-space:nowrap;max-height:220px;max-width:700px;margin: 10px auto;padding:15px;background-image: linear-gradient(120deg, rgba(122, 145, 177, 0.1) 50%, rgba(181, 126, 155, 0.1) 100%);">${feedItems}</div>`;
                    formattedNow.push(feedContainer);
            }

                formattedNow.push(`<p>>> latest rusty mixes (<a href="/tpl/mixes">see more</a>)</p>`);
            // Container for latest mixes styled like mixes page
            let mixesItems = tplNow.mixes.map(object => {
                let link = `/tpl/mixes#${object.number}`;
                let image = object["image"] ? `<img src="${object.image}" alt="rusty mix #${object.number} cover art" style="width:50px;height:50px;margin:5px 2px;border:solid 3px rgba(255,255,255,0.5);pointer-events:none;object-fit:cover;"/>` : '';
                let title = `<p class="mix-featuring-ellipsis" style="text-align:left;min-width:calc(100% - 100px);line-height:1.25;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><small>#${object.number} &#92;&#92; ${object.title}</small></p>`;
                let featuring = '';
                if (Array.isArray(object.featuring) && object.featuring.length > 0) {
                    featuring = `<p class="mix-featuring-ellipsis" style="text-align:left;min-width:0;max-width:100%;margin:0;margin-top:5px;font-size:0.85em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${object.featuring.join(', ')}</p>`;
                }
                let icon = `<p style="padding-right:10px;">></p>`;
                return `<a href="${link}" class="sub mix" style="display:flex;max-width:700px;padding:5px 10px;gap:10px;align-items:center;justify-content:space-between;margin-bottom:10px;text-decoration:none;border:none;background-image: linear-gradient(120deg, rgba(122, 145, 177, 0.1) 50%, rgba(181, 126, 155, 0.1) 100%);margin-right:auto;margin-left:auto;cursor:pointer;transition:background-image 0.5s;">${image}<span style="display:flex;flex-direction:column;flex:1;min-width:0;">${title}${featuring}</span>${icon}</a>`;
            }).join('');
            formattedNow.push(`<div class="now-mixes-list">${mixesItems}</div>`);

            formattedNow.push(`<p>>> last watched movies (<a href="/tpl/logs#movies">see more</a>)</p>`);
            for (let list in tplNow.movies) {
                let array = [tplNow.movies[list]];
                array.forEach(movie => {
                    let item = `<p class="sub">> ${movie}</p>`;
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

            formattedNow.push(`<p>>> last watched tv (<a href="/tpl/logs#tv">see more</a>)</p>`);
            for (let list in tplNow.tv) {
                let array = [tplNow.tv[list]];
                array.forEach(tvshow => {
                    let item = `<p class="sub">> ${tvshow}</p>`;
                    formattedNow.push(item);
                });
            }

            tplNow.content.html(formattedNow.reduce((accumulator, log) => {
                return accumulator + log;
            }));
            tplNow.date.text(tplNow.updated);

            setTimeout(() => {
                $("#now-feed-scroll").off("click").on("click", function() {
                    window.location.href = "/tpl/feed";
                });
            }, 0);
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
                    "image": data[object]["image"]
                };
                if (data[object]["featuring"]) {
                    mix.featuring = data[object]["featuring"];
                }
                mixes.push(mix);
            }
            tplNow.mixes = mixes.slice(0,3);
            tplNow.functions.nowDisplay();
        })
        .catch(error => console.log(error));

        // Fetch feed.json for last 10 posts
        fetch('../data/feed.json').then(response => response.json())
        .then((data) => {
            // feed.json has { items: [...] }
            let posts = (data && data.items) ? data.items : [];
            // Use original order, show only first 8
            tplNow.feedPosts = posts.slice(0, 6);
            tplNow.functions.nowDisplay();
        })
        .catch(error => console.log(error));
    },
};
$(document).ready(() => {
    tplNow.init();
});