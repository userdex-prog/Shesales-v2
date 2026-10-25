import { createNavbar } from "../components/navbar.js";
import { createAnnouncement } from "../components/announcement.js";
import { createFooter } from "../components/footer.js";
import { createProductCard } from "../components/productCard.js";

import {
getWishlist,
removeFromWishlist
} from "./wishlist.js";

import { updateCartCount } from "./cart.js";
import { products as localProducts } from "../data/products.js";
import { db } from "./firebase.js";
import { formatPrice } from "./formatPrice.js";

import {
collection,
getDocs
} from "firebase/firestore";

/* =========================================
DOM ELEMENTS
========================================= */

const header = document.querySelector("#header");
const footer = document.querySelector("footer");
const wishlistGrid = document.querySelector("#wishlistGrid");
const emptyWishlist = document.querySelector("#emptyWishlist");

/* =========================================
GLOBAL COMPONENTS
========================================= */

header.innerHTML =
createAnnouncement() +
createNavbar();

footer.innerHTML = createFooter();

/* =========================================
PRODUCT HELPERS
========================================= */

function getProductId(product) {
return String(product.id);
}

function normalizeLocalProduct(product) {
const image =
product.imageUrl ||
product.image ||
(
Array.isArray(product.images)
? product.images[0]
: ""
) ||
"";


return {
    ...product,
    id: String(product.id),
    name: String(product.name || "Untitled product"),
    price: Number(product.price) || 0,
    image,
    imageUrl: image,
    images: Array.isArray(product.images) && product.images.length
        ? product.images
        : image
            ? [image]
            : [],
    source: "local"
};


}

function normalizeFirebaseProduct(snapshot) {
const data = snapshot.data();


const image =
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
    id: String(snapshot.id),
    name: String(data.name || "Untitled product"),
    price: Number(data.price) || 0,
    image,
    imageUrl: image,
    images: image ? [image] : [],
    category: String(data.category || "gifts"),
    source: "firebase"
};


}

/* =========================================
LOAD PRODUCTS
========================================= */

let allProducts = [];

async function loadProducts() {
const local = localProducts.map(normalizeLocalProduct);


try {
    const snapshot = await getDocs(
        collection(db, "product ID")
    );

    const firebaseProducts = snapshot.docs.map(
        normalizeFirebaseProduct
    );

    /*
 * Keep local and Firebase products separately.
 * This preserves both sets of product IDs so
 * existing wishlist entries can still be matched.
 */

allProducts = [
    ...local,
    ...firebaseProducts
];

} catch (error) {
    console.error(
        "Could not load Firebase products for wishlist:",
        error
    );

    /*
     * Local products remain available if Firebase
     * cannot be reached.
     */

    allProducts = local;
}


}

/* =========================================
RENDER WISHLIST
========================================= */

function renderWishlist() {
const savedIds = getWishlist().map(String);


const savedProducts = allProducts.filter(product =>
    savedIds.includes(getProductId(product))
);

console.table(
    allProducts.map(product => ({
        id: product.id,
        name: product.name,
        source: product.source
    }))
);

if (savedProducts.length === 0) {
    wishlistGrid.innerHTML = "";
    wishlistGrid.hidden = true;
    emptyWishlist.hidden = false;
    return;
}

wishlistGrid.hidden = false;
emptyWishlist.hidden = true;

wishlistGrid.innerHTML = savedProducts.map(product => `
    <div
        class="wishlist-item"
        data-product-id="${getProductId(product)}"
    >

        ${createProductCard(product)}

        <button
            type="button"
            class="wishlist-remove-btn"
            data-remove-wishlist="${getProductId(product)}"
        >
            Remove from Wishlist
        </button>

    </div>
`).join("");

/*
 * Update heart buttons after cards are created.
 */

document.dispatchEvent(
    new Event("wishlist:updated")
);

}

/* =========================================
REMOVE BUTTONS
========================================= */

wishlistGrid.addEventListener("click", event => {
const button = event.target.closest(
"[data-remove-wishlist]"
);


if (!button) return;

const productId = button.dataset.removeWishlist;

/*
 * Local products use numeric IDs.
 * Firebase products use string document IDs.
 */

const matchingProduct = allProducts.find(
    product => getProductId(product) === productId
);

const storedId = matchingProduct
    ? matchingProduct.id
    : productId;

const currentWishlist = getWishlist();

const originalStoredId = currentWishlist.find(
    id => String(id) === productId
);

if (originalStoredId !== undefined) {
    removeFromWishlist(originalStoredId);
} else {
    removeFromWishlist(storedId);
}

renderWishlist();

});

/* =========================================
INITIALIZE
========================================= */

async function initializeWishlistPage() {
wishlistGrid.innerHTML = `         <p class="wishlist-loading">
            Loading your favourites...         </p>
    `;


wishlistGrid.hidden = false;
emptyWishlist.hidden = true;

await loadProducts();

renderWishlist();
updateCartCount();


}

initializeWishlistPage();
