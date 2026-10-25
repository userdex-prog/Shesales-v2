import { formatPrice } from "./formatPrice.js";
import { createNavbar } from "../components/navbar.js";
import { createAnnouncement } from "../components/announcement.js";
import { createFooter } from "../components/footer.js";
import { createProductCard } from "../components/productCard.js";
import { products as localProducts } from "../data/products.js";

import {
addToCart,
updateCartCount
} from "./cart.js";

import {
isInWishlist,
toggleWishlist
} from "./wishlist.js";

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

if (header) {
header.innerHTML = createAnnouncement() + createNavbar();
}

if (footer) {
footer.innerHTML = createFooter();
}

if (!main) {
console.error("Product page could not find #main-content.");
}

/* =========================================
PRODUCT ID
========================================= */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

/* =========================================
NORMALIZE FIREBASE PRODUCT
========================================= */

function normalizeFirebaseProduct(documentSnapshot) {
const data = documentSnapshot.data();


const images = Array.isArray(data.images)
    ? data.images.filter(image => typeof image === "string" && image.trim())
    : [];

const image =
    data.imageUrl ||
    data.image ||
    images[0] ||
    "";

return {
    ...data,
    id: documentSnapshot.id,
    name: String(data.name || "Untitled product"),
    price: Number(data.price) || 0,
    category: String(data.category || "gifts"),
    description: String(data.description || "A thoughtfully handmade creation."),
    image,
    imageUrl: image,
    images: images.length ? images : (image ? [image] : [])
};


}

/* =========================================
NORMALIZE LOCAL PRODUCT
========================================= */

function normalizeLocalProduct(product) {
const images = Array.isArray(product.images)
? product.images.filter(image => typeof image === "string" && image.trim())
: [];


const image =
    product.imageUrl ||
    product.image ||
    images[0] ||
    "";

return {
    ...product,
    price: Number(product.price) || 0,
    description: product.description || "A thoughtfully handmade creation.",
    image,
    imageUrl: image,
    images: images.length ? images : (image ? [image] : [])
};


}

/* =========================================
LOAD PRODUCTS
========================================= */

async function initializeProductPage() {
if (!main) return;


main.innerHTML = `
    <section class="product-page">
        <div class="container">
            <p>Loading product details...</p>
        </div>
    </section>
`;

let allProducts = localProducts.map(normalizeLocalProduct);

try {
    const productsReference = collection(db, "product ID");
    const snapshot = await getDocs(productsReference);

    const firebaseProducts = snapshot.docs.map(
        normalizeFirebaseProduct
    );

   /*
 * Merge Firebase and local products.
 * Preserve local Vite-imported images when available.
 */

const productMap = new Map();

firebaseProducts.forEach(product => {
    const key = String(product.name).trim().toLowerCase();

    productMap.set(key, product);
});

localProducts.forEach(localProduct => {
    const local = normalizeLocalProduct(localProduct);
    const key = String(local.name).trim().toLowerCase();

    const firebaseProduct = productMap.get(key);

    if (firebaseProduct) {
        productMap.set(key, {
            ...local,
            ...firebaseProduct,

            // Preserve the Firebase ID for product-page lookup.
            id: firebaseProduct.id,

            // Prefer the working local Vite-imported image.
            image: local.image,
            imageUrl: local.image,
            images: local.images
        });
    } else {
        productMap.set(key, local);
    }
});

allProducts = Array.from(productMap.values());
} catch (error) {
    console.error(
        "Could not load Firebase products. Using local products:",
        error
    );
}

/*
 * Match IDs as strings because Firebase IDs
 * are strings while local IDs may be numbers.
 */

console.log("All products loaded:", allProducts);
console.log("Requested product ID:", productId);

console.log(
    "Available product IDs:",
    allProducts.map(item => ({
        id: item.id,
        name: item.name
    }))
);

const requestedId = String(productId || "").trim();

const product =
    allProducts.find(
        item => String(item.id).trim() === requestedId
    ) ||
    localProducts
        .map(normalizeLocalProduct)
        .find(
            item => String(item.id).trim() === requestedId
        );

        
if (!product) {
    renderProductNotFound();
    return;
}

renderProduct(product, allProducts);


}

/* =========================================
PRODUCT NOT FOUND
========================================= */

function renderProductNotFound() {
main.innerHTML = ` <section class="product-not-found"> <div class="container"> <h1>Product Not Found</h1>


            <p>
                Sorry, we couldn't find the product
                you're looking for.
            </p>

            <a
                href="/src/pages/marketplace.html"
                class="btn btn-primary"
            >
                Back to Marketplace
            </a>
        </div>
    </section>
`;


}

/* =========================================
RENDER PRODUCT
========================================= */

function renderProduct(product, allProducts) {
const images = product.images.length
? product.images
: [];


const mainImage = images[0] || "";

const relatedProducts = allProducts
    .filter(item => String(item.id) !== String(product.id))
    .slice(0, 3);

main.innerHTML = `
    <section class="product-page">
        <div class="container">
            <div class="product-layout">

                <div class="product-gallery">
                    <div class="product-main-image">
                        ${
                            mainImage
                                ? `
                                    <img
                                        id="mainProductImage"
                                        src="${mainImage}"
                                        alt="${product.name}"
                                    >
                                `
                                : `
                                    <div class="product-image-placeholder">
                                        Image unavailable
                                    </div>
                                `
                        }
                    </div>

                    ${
                        images.length > 1
                            ? `
                                <div class="product-thumbnails">
                                    ${images.map((image, index) => `
                                        <button
                                            type="button"
                                            class="product-thumbnail ${index === 0 ? "active" : ""}"
                                            data-image="${image}"
                                            aria-label="View product image ${index + 1}"
                                        >
                                            <img
                                                src="${image}"
                                                alt="${product.name} image ${index + 1}"
                                            >
                                        </button>
                                    `).join("")}
                                </div>
                            `
                            : ""
                    }
                </div>

                <div class="product-details">
                    ${
                        product.badge
                            ? `<span class="badge">${product.badge}</span>`
                            : ""
                    }

                    <p class="product-category">
                        ${product.category || ""}
                    </p>

                    <h1 class="product-name">
                        ${product.name}
                    </h1>

                    <p class="product-price">
                        ${formatPrice(product.price)}
                    </p>

                    <div class="product-divider"></div>

                    <p class="product-description">
                        ${product.description}
                    </p>

                    <div class="quantity-wrapper">
                        <span class="quantity-label">Quantity</span>

                        <div class="quantity-selector">
                            <button
                                type="button"
                                id="decreaseQuantity"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span id="quantity">1</span>

                            <button
                                type="button"
                                id="increaseQuantity"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div class="product-actions">
                        <button
                            type="button"
                            class="btn btn-primary add-to-cart-btn"
                            id="addToCart"
                        >
                            Add to Cart
                        </button>

                        <button
                            type="button"
                            class="wishlist-product-btn"
                            id="wishlistProduct"
                            aria-label="Add product to wishlist"
                        >
                            ♡
                        </button>
                    </div>

                    <div class="product-meta">
                        <div>
                            <span>Category</span>
                            <strong>${product.category || "Handmade"}</strong>
                        </div>

                        <div>
                            <span>Crafted</span>
                            <strong>Handmade with Love</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${
        relatedProducts.length
            ? `
                <section class="related-products">
                    <div class="container">
                        <div class="section-heading">
                            <p class="section-eyebrow">You May Also Like</p>
                            <h2>More Handmade Favorites</h2>
                        </div>

                        <div class="related-products-grid">
                            ${relatedProducts.map(item => createProductCard(item)).join("")}
                        </div>
                    </div>
                </section>
            `
            : ""
    }
`;

initializeProductInteractions(product);


}

/* =========================================
PRODUCT INTERACTIONS
========================================= */

function initializeProductInteractions(product) {
let quantity = 1;


const quantityDisplay = document.querySelector("#quantity");
const decreaseButton = document.querySelector("#decreaseQuantity");
const increaseButton = document.querySelector("#increaseQuantity");
const addToCartButton = document.querySelector("#addToCart");
const wishlistButton = document.querySelector("#wishlistProduct");
const mainProductImage = document.querySelector("#mainProductImage");

/* QUANTITY CONTROLS */

decreaseButton.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
    }
});

increaseButton.addEventListener("click", () => {
    quantity++;
    quantityDisplay.textContent = quantity;
});

/* IMAGE GALLERY */

document.querySelectorAll(".product-thumbnail").forEach(thumbnail => {
    thumbnail.addEventListener("click", () => {
        if (mainProductImage) {
            mainProductImage.src = thumbnail.dataset.image;
        }

        document.querySelectorAll(".product-thumbnail").forEach(item => {
            item.classList.remove("active");
        });

        thumbnail.classList.add("active");
    });
});

/* ADD TO CART */

addToCartButton.addEventListener("click", () => {
    addToCart(product.id, quantity);
    updateCartCount();

    addToCartButton.textContent = "Added to Cart";
    addToCartButton.classList.add("added");

    window.setTimeout(() => {
        addToCartButton.textContent = "Add to Cart";
        addToCartButton.classList.remove("added");
    }, 2000);
});

/* WISHLIST */

function updateWishlistButton() {
    const saved = isInWishlist(product.id);

    wishlistButton.classList.toggle("active", saved);
    wishlistButton.textContent = saved ? "♥" : "♡";

    wishlistButton.setAttribute(
        "aria-label",
        saved
            ? "Remove product from wishlist"
            : "Add product to wishlist"
    );
}

wishlistButton.addEventListener("click", () => {
    toggleWishlist(product.id);
    updateWishlistButton();
});

updateWishlistButton();
updateCartCount();


}

/* =========================================
INITIALIZE
========================================= */

initializeProductPage();
