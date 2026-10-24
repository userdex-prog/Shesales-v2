import { createNavbar } from "../components/navbar.js";
import { createAnnouncement } from "../components/announcement.js";
import { createFooter } from "../components/footer.js";
import { createProductCard } from "../components/productCard.js";

import { products } from "../data/products.js";

import { updateCartCount } from "./cart.js";


/* =========================================
   GLOBAL COMPONENTS
========================================= */

const header =
    document.querySelector("#header");

const footer =
    document.querySelector("footer");


header.innerHTML =
    createAnnouncement() +
    createNavbar();


footer.innerHTML =
    createFooter();


/* =========================================
   DOM ELEMENTS
========================================= */

const searchForm =
    document.querySelector("#searchForm");

const searchInput =
    document.querySelector("#searchInput");

const searchResults =
    document.querySelector("#searchResults");

const emptySearch =
    document.querySelector("#emptySearch");


/* =========================================
   RENDER SEARCH RESULTS
========================================= */

function renderSearchResults(query) {

    const searchTerm =
        query
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        searchResults.innerHTML =
            "";

        emptySearch.hidden =
            true;

        return;

    }


    const matchingProducts =
        products.filter(
            product => {

                const name =
                    product.name
                        .toLowerCase();

                const category =
                    product.category
                        .toLowerCase();

                const description =
                    product.description
                        .toLowerCase();


                return (
                    name.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    description.includes(searchTerm)
                );

            }
        );


    /* =========================================
       NO RESULTS
    ========================================= */

    if (
        matchingProducts.length === 0
    ) {

        searchResults.innerHTML =
            "";

        emptySearch.hidden =
            false;

        return;

    }


    /* =========================================
       SHOW RESULTS
    ========================================= */

    emptySearch.hidden =
        true;


    searchResults.innerHTML =
        matchingProducts
            .map(
                product =>
                    createProductCard(product)
            )
            .join("");

}


/* =========================================
   SEARCH SUBMIT
========================================= */

searchForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        renderSearchResults(
            searchInput.value
        );

    }
);


/* =========================================
   INITIALIZE
========================================= */

updateCartCount();