// app object
let redirectsFormatter = {

    formattedRedirects: ``,

    formatRedirects: () => {
        let bodyID = document.querySelector(`body`).id.substr(3);
        let items = document.querySelectorAll(`div.item`);
        let formattedItems = ``;

        items.forEach((item) => {
            let id = `#` + item.id;

            let formattedItem = `/rustprop/${id} /rustprop/${bodyID}${id}`;

            formattedItems += formattedItem + `\n`;
        });

        console.log(formattedItems);
    },

    // app initializion
    init: () => {
        redirectsFormatter.formatRedirects();
    },
};

// initialize the app
$(document).ready(() => {
    redirectsFormatter.init();
});