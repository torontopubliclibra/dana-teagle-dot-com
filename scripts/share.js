// share object
let share = {

    // share links element
    shareLinks: $(".share-links"),

    // links data
    links: [{title: "", link: "", description: ""}],

    // share functions
    functions: {
        
        // displaying the projects
        linkDisplay: () => {

            // map out the links to the page
            let formattedLinks = share.links.map((link) => {

                let title = `<p class="button-label">` + link.title + ` <i class="fa fa-external-link-square" aria-hidden="true"></i></p>`;
                let href = `href="` + link.link + `"`;
                let description = ``;

                if (link.description) {
                    description = `<hr/><p class="button-description">` + link.description + `</p>`
                }

                // stitch together all the html for the project
                return `<a class="button share-link"` + href + `>` + title + description + `</a>`
            });

            // stitch the html for each of the projects together and add that the projects container
            share.shareLinks.html(formattedLinks.reduce((accumulator, link) => {
                return accumulator + link;
            }));
        },
    },
    
    // share initializion
    init: () => {

        // fetch the projects from the json file and send the response
        fetch('./data/share-links.json').then(response => response.json())
            // then with the data
            .then((data) => {

                // set the projects to an empty array
                let links = [];

                // and for each project in the data
                for (let object in data) {

                    // initialize a project object, setting the title to the object key
                    let link = {
                        "title": object,
                        "description": "",
                        "link": ""
                    }

                    // then map each property in the initial object to the new object
                    for (let property in data[object]) {
                        link[property] = data[object][property];
                    };

                    // and push each project object into the projects array
                    links.push(link);
                };

                // save the projects array to the project data
                share.links = links;

                // display the projects on the page using the default filter
                share.functions.linkDisplay();
            })
            // console log any promise errors
            .catch(error => console.log(error));
    },
};

// initialize the share
$(document).ready(() => {
    share.init();
});