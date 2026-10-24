import { createNavbar } from "../components/navbar.js";
import { createAnnouncement } from "../components/announcement.js";
import { createFooter } from "../components/footer.js";
import { createProductCard } from "../components/productCard.js";

import { products as localProducts } from "../data/products.js";

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "firebase/firestore";


/* =========================================
   DOM ELEMENTS
========================================= */

const header = document.querySelector("#header");
const main = document.querySelector("#main-content");
const footer = document.querySelector("footer");


/* =========================================
   GLOBAL COMPONENTS
========================================= */

header.innerHTML =
    createAnnouncement() +
    createNavbar();

footer.innerHTML = createFooter();


/* =========================================
   MARKETPLACE STRUCTURE
========================================= */

main.innerHTML = `
    <section class="marketplace-hero">
        <div class="container">

            <h1>Handmade Collections</h1>

            <p>
                Explore unique crochet creations handcrafted
                with love and premium materials.
            </p>

        </div>
    </section>

    <section class="marketplace-products">

        <div class="container">

            <div class="marketplace-toolbar">

                <div class="marketplace-search">

                    <label
                        for="productSearch"
                        class="sr-only"
                    >
                        Search products
                    </label>

                    <input
                        type="search"
                        id="productSearch"
                        placeholder="Search products..."
                        aria-label="Search products"
                    >

                </div>

                <div class="marketplace-filters">

                    <select
                        id="categoryFilter"
                        aria-label="Filter products by category"
                    >

                        <option value="all">
                            All Collections
                        </option>

                        <option value="bags">
                            Bags
                        </option>

                        <option value="clothing">
                            Clothing
                        </option>

                        <option value="gifts">
                            Gifts
                        </option>

                    </select>

                    <select
                        id="sortProducts"
                        aria-label="Sort products"
                    >

                        <option value="featured">
                            Featured
                        </option>

                        <option value="price-low">
                            Price: Low to High
                        </option>

                        <option value="price-high">
                            Price: High to Low
                        </option>

                        <option value="name-az">
                            Name: A to Z
                        </option>

                        <option value="name-za">
                            Name: Z to A
                        </option>

                    </select>

                </div>

            </div>

            <div class="marketplace-results-bar">

                <p
                    id="productCount"
                    class="product-count"
                >
                    Loading products...
                </p>

            </div>

            <div
                class="products-grid"
                id="marketplaceGrid"
            ></div>

        </div>

    </section>
`;


/* =========================================
   MARKETPLACE ELEMENTS
========================================= */

const grid = document.querySelector("#marketplaceGrid");

const searchInput =
    document.querySelector("#productSearch");

const categoryFilter =
    document.querySelector("#categoryFilter");

const sortProducts =
    document.querySelector("#sortProducts");

const productCount =
    document.querySelector("#productCount");


/* =========================================
   FIRESTORE COLLECTION

   IMPORTANT:
   This must match the collection used
   by your admin dashboard.
========================================= */

const productsReference =
    collection(db, "product ID");


/* =========================================
   PRODUCT STATE
========================================= */

let allProducts = [];

let isLoading = true;


/* =========================================
   URL FILTER
========================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const requestedFilter =
    urlParams.get("filter");

const specialFilter =
    requestedFilter === "new" ||
    requestedFilter === "best"
        ? requestedFilter
        : null;


/* =========================================
   NORMALIZE FIREBASE PRODUCTS
========================================= */

function normalizeFirebaseProduct(documentSnapshot) {

    const data = documentSnapshot.data();

    const imageUrl =
        data.imageUrl ||
        data.image ||
        (
            Array.isArray(data.images)
                ? data.images[0]
                : ""
        ) ||
        "";

    return {
        ...data,

        id: documentSnapshot.id,

        name: String(data.name || "Untitled product"),

        price: Number(data.price) || 0,

        category: String(
            data.category || "gifts"
        ).trim().toLowerCase(),

        description: String(
            data.description || ""
        ),

        image: imageUrl,

        imageUrl: imageUrl,

        images: imageUrl
            ? [imageUrl]
            : [],

        tags: Array.isArray(data.tags)
            ? data.tags
            : [],

        featured: data.featured === true,

        stock: Number(data.stock ?? 0),

        source: "firebase"
    };

}


/* =========================================
   LOAD PRODUCTS FROM FIREBASE
========================================= */

async function loadMarketplaceProducts() {

    isLoading = true;

    grid.innerHTML = `
        <div class="marketplace-empty">
            <h3>Loading collections...</h3>
            <p>Please wait while we fetch our products.</p>
        </div>
    `;

    try {

        /*
         * Retrieve products from Firestore.
         */

        const snapshot =
            await getDocs(productsReference);

        const firebaseProducts = [];

        snapshot.forEach(documentSnapshot => {

            firebaseProducts.push(
                normalizeFirebaseProduct(documentSnapshot)
            );

        });


        /*
         * Preserve the products already defined
         * in src/data/products.js.
         */

        const normalizedLocalProducts =
            localProducts.map(product => ({

                ...product,

                name: String(
                    product.name || "Untitled product"
                ),

                price: Number(product.price) || 0,

                category: String(
                    product.category || "gifts"
                ).trim().toLowerCase(),

                tags: Array.isArray(product.tags)
                    ? product.tags
                    : [],

                image:
                    product.imageUrl ||
                    product.image ||
                    (
                        Array.isArray(product.images)
                            ? product.images[0]
                            : ""
                    ) ||
                    "",

                source: "local"

            }));


        /*
         * Firebase products take priority when
         * a local product has the same name.
         *
         * This prevents obvious duplicates.
         */

        const productMap = new Map();

        normalizedLocalProducts.forEach(product => {

            const key = product.name
                .trim()
                .toLowerCase();

            productMap.set(key, product);

        });

        firebaseProducts.forEach(product => {

            const key = product.name
                .trim()
                .toLowerCase();

            productMap.set(key, product);

        });


        /*
         * Firebase products are merged with
         * existing local products.
         */

        allProducts = Array.from(
            productMap.values()
        );


        console.log(
            "Marketplace products loaded:",
            allProducts.length
        );

        console.log(
            "Products retrieved from Firebase:",
            firebaseProducts.length
        );


        updateMarketplace();

    } catch (error) {

        console.error(
            "Failed to load marketplace products:",
            error
        );

        /*
         * Keep locally defined products available
         * if Firebase cannot be reached.
         */

        allProducts = localProducts.map(product => ({

            ...product,

            name: String(
                product.name || "Untitled product"
            ),

            price: Number(product.price) || 0,

            category: String(
                product.category || "gifts"
            ).trim().toLowerCase(),

            tags: Array.isArray(product.tags)
                ? product.tags
                : [],

            image:
                product.imageUrl ||
                product.image ||
                (
                    Array.isArray(product.images)
                        ? product.images[0]
                        : ""
                ) ||
                "",

            source: "local"

        }));


        updateMarketplace();

        /*
         * Display an additional warning only
         * when Firebase returned an error.
         */

        const warning =
            document.createElement("p");

        warning.className = "marketplace-load-warning";

        warning.textContent =
            "Some products may be missing because the online catalogue could not be loaded.";

        grid.prepend(warning);

    } finally {

        isLoading = false;

    }

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts(items) {

    productCount.textContent =
        items.length === 1
            ? "1 Product"
            : `${items.length} Products`;


    if (items.length === 0) {

        grid.innerHTML = `
            <div class="marketplace-empty">

                <h3>No products found</h3>

                <p>
                    Try searching for something else
                    or choose a different collection.
                </p>

            </div>
        `;

        return;

    }


    grid.innerHTML = items
        .map(product => createProductCard(product))
        .join("");

}


/* =========================================
   FILTER AND SORT PRODUCTS
========================================= */

function updateMarketplace() {

    if (isLoading && allProducts.length === 0) {
        return;
    }


    const search =
        searchInput.value.trim().toLowerCase();

    const category =
        categoryFilter.value;

    const sort =
        sortProducts.value;


    /*
     * SEARCH AND CATEGORY FILTER
     */

    let filteredProducts = allProducts.filter(product => {

        const name =
            String(product.name || "").toLowerCase();

        const description =
            String(product.description || "").toLowerCase();

        const nameMatch =
            name.includes(search) ||
            description.includes(search);

        const productCategory =
            String(product.category || "")
                .trim()
                .toLowerCase();

        const categoryMatch =
            category === "all" ||
            productCategory === category;

        return nameMatch && categoryMatch;

    });


    /*
     * NEW ARRIVALS
     */

    if (specialFilter === "new") {

        filteredProducts =
            filteredProducts.filter(product => {

                const tags = product.tags || [];

                return tags.some(tag =>
                    String(tag).toLowerCase() === "new"
                );

            });

    }


    /*
     * BEST SELLERS
     */

    if (specialFilter === "best") {

        filteredProducts =
            filteredProducts.filter(product => {

                const tags = product.tags || [];

                return tags.some(tag =>
                    String(tag).toLowerCase() === "best"
                );

            });

    }


    /*
     * SORT PRODUCTS
     */

    switch (sort) {

        case "price-low":

            filteredProducts.sort(
                (a, b) => a.price - b.price
            );

            break;


        case "price-high":

            filteredProducts.sort(
                (a, b) => b.price - a.price
            );

            break;


        case "name-az":

            filteredProducts.sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );

            break;


        case "name-za":

            filteredProducts.sort(
                (a, b) =>
                    b.name.localeCompare(a.name)
            );

            break;


        case "featured":

        default:

            filteredProducts.sort(
                (a, b) =>
                    Number(b.featured === true) -
                    Number(a.featured === true)
            );

            break;

    }


    renderProducts(filteredProducts);

}


/* =========================================
   EVENT LISTENERS
========================================= */

searchInput.addEventListener(
    "input",
    updateMarketplace
);

categoryFilter.addEventListener(
    "change",
    updateMarketplace
);

sortProducts.addEventListener(
    "change",
    updateMarketplace
);


/* =========================================
   INITIALIZE MARKETPLACE
========================================= */

loadMarketplaceProducts();