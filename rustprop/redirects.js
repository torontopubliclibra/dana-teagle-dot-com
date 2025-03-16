// app object
let redirectsFormatter = {

    formattedRedirects: ``,

    formatRedirects: () => {
        let bodyID = document.querySelector(`body`).id.substr(3);
        let items = document.querySelectorAll(`div.item`);
        let formattedItems = ``;

        if (bodyID === '1') {
            items.forEach((item) => {
                let formattedItem = `/rustprop/${item.id} /rustprop/#${item.id}`;
                formattedItems += formattedItem + `\n`;
            });
        } else {
            items.forEach((item) => {
                let formattedItem = `/rustprop/${item.id} /rustprop/${bodyID}#${item.id}`;
                formattedItems += formattedItem + `\n`;
            });
        }

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