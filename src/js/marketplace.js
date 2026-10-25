
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

if (!header || !main || !footer) {
    throw new Error("Marketplace page is missing a required HTML element.");
}

/* =========================================
   GLOBAL COMPONENTS
========================================= */

header.innerHTML = createAnnouncement() + createNavbar();
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
                    <label for="productSearch" class="sr-only">
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
                        <option value="all">All Collections</option>
                        <option value="bags">Bags</option>
                        <option value="clothing">Clothing</option>
                        <option value="gifts">Gifts</option>
                    </select>

                    <select id="sortProducts" aria-label="Sort products">
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-az">Name: A to Z</option>
                        <option value="name-za">Name: Z to A</option>
                    </select>
                </div>
            </div>

            <div class="marketplace-results-bar">
                <p id="productCount" class="product-count">
                    Loading products...
                </p>
            </div>

            <div class="products-grid" id="marketplaceGrid"></div>
        </div>
    </section>
`;

/* =========================================
   MARKETPLACE ELEMENTS
========================================= */

const grid = document.querySelector("#marketplaceGrid");
const searchInput = document.querySelector("#productSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const sortProducts = document.querySelector("#sortProducts");
const productCount = document.querySelector("#productCount");

/* =========================================
   FIRESTORE COLLECTION
========================================= */

const productsReference = collection(db, "product ID");

/* =========================================
   PRODUCT STATE
========================================= */

let allProducts = [];
let isLoading = true;

/* =========================================
   URL FILTER
========================================= */

const urlParams = new URLSearchParams(window.location.search);
const requestedFilter = urlParams.get("filter");

const specialFilter =
    requestedFilter === "new" || requestedFilter === "best"
        ? requestedFilter
        : null;

/* =========================================
   NORMALIZE LOCAL PRODUCTS

   Imported Vite image paths are preferred
   for products defined in products.js.
========================================= */

function normalizeLocalProduct(product) {
    const images = Array.isArray(product.images)
        ? product.images
        : [];

    const image =
        images[0] ||
        product.imageUrl ||
        product.image ||
        "";

    return {
        ...product,
        id: String(product.id),
        name: String(product.name || "Untitled product"),
        price: Number(product.price) || 0,
        category: String(product.category || "gifts")
            .trim()
            .toLowerCase(),
        description: String(product.description || ""),
        image,
        imageUrl: image,
        images: images.length ? images : image ? [image] : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        featured: product.featured === true,
        source: "local"
    };
}

/* =========================================
   NORMALIZE FIREBASE PRODUCTS

   Firebase image URLs are retained only
   as a fallback for products without a
   matching locally imported product.
========================================= */

function normalizeFirebaseProduct(documentSnapshot) {
    const data = documentSnapshot.data();

    const images = Array.isArray(data.images)
        ? data.images
        : [];

    const image =
        images[0] ||
        data.imageUrl ||
        data.image ||
        "";

    return {
        ...data,
        id: String(documentSnapshot.id),
        name: String(data.name || "Untitled product"),
        price: Number(data.price) || 0,
        category: String(data.category || "gifts")
            .trim()
            .toLowerCase(),
        description: String(data.description || ""),
        image,
        imageUrl: image,
        images: images.length ? images : image ? [image] : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        featured: data.featured === true,
        stock: Number(data.stock ?? 0),
        source: "firebase"
    };
}

/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadMarketplaceProducts() {
    isLoading = true;

    grid.innerHTML = `
        <div class="marketplace-empty">
            <h3>Loading collections...</h3>
            <p>Please wait while we fetch our products.</p>
        </div>
    `;

    const normalizedLocalProducts = localProducts.map(
        normalizeLocalProduct
    );

    try {
        const snapshot = await getDocs(productsReference);

        const firebaseProducts = snapshot.docs.map(
            normalizeFirebaseProduct
        );

        /*
         * Start with local products.
         * This guarantees they remain available
         * even if Firebase has no matching record.
         */

        const productMap = new Map();

        normalizedLocalProducts.forEach(product => {
            const key = product.name.trim().toLowerCase();
            productMap.set(key, product);
        });

        /*
         * Merge Firebase data.
         * For matching names, keep local images
         * and imported image paths.
         */

        firebaseProducts.forEach(firebaseProduct => {
            const key = firebaseProduct.name.trim().toLowerCase();
            const localProduct = productMap.get(key);

            if (localProduct) {
                productMap.set(key, {
                    ...firebaseProduct,
                    ...localProduct,

                    // Keep the local ID and bundled images.
                    id: String(localProduct.id),
                    image: localProduct.image,
                    imageUrl: localProduct.imageUrl,
                    images: localProduct.images,

                    // Preserve useful Firebase fields when present.
                    stock: firebaseProduct.stock ?? localProduct.stock,
                    source: "local"
                });
            } else {
                // A product without a local match uses Firebase data.
                productMap.set(key, firebaseProduct);
            }
        });

        allProducts = Array.from(productMap.values());

        console.log("Marketplace products loaded:", allProducts.length);

        console.table(
            allProducts.map(product => ({
                id: product.id,
                name: product.name,
                source: product.source,
                image: product.image
            }))
        );

        console.log(
            "Products retrieved from Firebase:",
            firebaseProducts.length
        );
    } catch (error) {
        console.error("Failed to load Firebase products:", error);

        // Keep the locally imported products available.
        allProducts = normalizedLocalProducts;

        const warning = document.createElement("p");
        warning.className = "marketplace-load-warning";
        warning.textContent =
            "The online catalogue could not be loaded. Showing locally available products.";

        grid.prepend(warning);
    } finally {
        isLoading = false;
        updateMarketplace();
    }
}

/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts(items) {
    productCount.textContent =
        items.length === 1 ? "1 Product" : `${items.length} Products`;

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

    const search = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortProducts.value;

    let filteredProducts = allProducts.filter(product => {
        const name = String(product.name || "").toLowerCase();
        const description = String(product.description || "").toLowerCase();

        const nameMatch =
            name.includes(search) ||
            description.includes(search);

        const productCategory = String(product.category || "")
            .trim()
            .toLowerCase();

        const categoryMatch =
            category === "all" ||
            productCategory === category;

        return nameMatch && categoryMatch;
    });

    if (specialFilter === "new") {
        filteredProducts = filteredProducts.filter(product =>
            (product.tags || []).some(
                tag => String(tag).toLowerCase() === "new"
            )
        );
    }

    if (specialFilter === "best") {
        filteredProducts = filteredProducts.filter(product =>
            (product.tags || []).some(
                tag => String(tag).toLowerCase() === "best"
            )
        );
    }

    switch (sort) {
        case "price-low":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;

        case "price-high":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;

        case "name-az":
            filteredProducts.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "name-za":
            filteredProducts.sort((a, b) =>
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

searchInput.addEventListener("input", updateMarketplace);
categoryFilter.addEventListener("change", updateMarketplace);
sortProducts.addEventListener("change", updateMarketplace);

/* =========================================
   INITIALIZE MARKETPLACE
========================================= */

loadMarketplaceProducts();

