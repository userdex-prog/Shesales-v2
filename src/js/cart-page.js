
import { formatPrice } from "./formatPrice.js";
import { createNavbar } from "../components/navbar.js";
import { createAnnouncement } from "../components/announcement.js";
import { createFooter } from "../components/footer.js";

import {
    getCart,
    updateCartQuantity,
    removeFromCart,
    updateCartCount
} from "./cart.js";

import { products as localProducts } from "../data/products.js";
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "firebase/firestore";

const header = document.querySelector("#header");
const main = document.querySelector("#main-content");
const footer = document.querySelector("footer");

if (header) {
    header.innerHTML = createAnnouncement() + createNavbar();
}

if (footer) {
    footer.innerHTML = createFooter();
}

let allProducts = [];

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function isUsableImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    // These URLs only work on the computer running the dev server.
    if (
        value.includes("localhost") ||
        value.includes("127.0.0.1")
    ) {
        return false;
    }

    return true;
}

function getProductImage(product) {
    const candidates = [
        product?.image,
        product?.imageUrl,
        ...(Array.isArray(product?.images) ? product.images : [])
    ];

    return candidates.find(isUsableImageUrl) || "";
}

function normalizeLocalProduct(product) {
    const image = getProductImage(product);

    return {
        ...product,
        id: String(product.id),
        name: String(product.name || "Untitled product"),
        price: Number(product.price) || 0,
        category: String(product.category || "gifts"),
        image,
        imageUrl: image,
        images: image ? [image] : []
    };
}

function normalizeFirebaseProduct(snapshot) {
    const data = snapshot.data();

    const product = {
        ...data,
        id: String(snapshot.id),
        name: String(data.name || "Untitled product"),
        price: Number(data.price) || 0,
        category: String(data.category || "gifts")
    };

    const image = getProductImage(product);

    return {
        ...product,
        image,
        imageUrl: image,
        images: image ? [image] : []
    };
}

async function loadProducts() {
    if (!main) {
        console.error("Cart page could not find #main-content.");
        return;
    }

    main.innerHTML = `
        <section class="cart-page">
            <div class="container">
                <p>Loading your shopping cart...</p>
            </div>
        </section>
    `;

    const localCatalogue = localProducts.map(normalizeLocalProduct);

    // Build lookup tables from the local product catalogue.
    const localById = new Map();
    const localByName = new Map();

    localCatalogue.forEach(product => {
        localById.set(String(product.id), product);
        localByName.set(normalizeName(product.name), product);
    });

    try {
        const productsReference = collection(db, "product ID");
        const snapshot = await getDocs(productsReference);

        const firebaseProducts = snapshot.docs.map(
            normalizeFirebaseProduct
        );

        const productsById = new Map(localById);
        const productsByName = new Map(localByName);

        firebaseProducts.forEach(firebaseProduct => {
            const firebaseId = String(firebaseProduct.id);
            const nameKey = normalizeName(firebaseProduct.name);

            // Prefer matching the Firebase product to the local product
            // by name, because local images are bundled by Vite.
            const localMatch =
                localByName.get(nameKey) ||
                localById.get(firebaseId);

            if (localMatch) {
                const mergedProduct = {
                    ...firebaseProduct,
                    ...localMatch,

                    // Keep both IDs so older cart entries can still resolve.
                    id: String(localMatch.id),
                    firebaseId,

                    // Use the imported local image rather than localhost URLs.
                    image: localMatch.image,
                    imageUrl: localMatch.imageUrl,
                    images: localMatch.images,

                    // Keep the Firebase price if it is a valid number.
                    price: Number.isFinite(Number(firebaseProduct.price))
                        ? Number(firebaseProduct.price)
                        : Number(localMatch.price) || 0
                };

                productsById.set(String(localMatch.id), mergedProduct);
                productsById.set(firebaseId, mergedProduct);
                productsByName.set(nameKey, mergedProduct);
            } else {
                productsById.set(firebaseId, firebaseProduct);
                productsByName.set(nameKey, firebaseProduct);
            }
        });

        allProducts = [...new Set(productsById.values())];

        console.log(
            "Cart catalogue:",
            allProducts.map(product => ({
                id: product.id,
                firebaseId: product.firebaseId || "",
                name: product.name,
                image: product.image
            }))
        );
    } catch (error) {
        console.error(
            "Could not load Firebase products. Using local products:",
            error
        );

        allProducts = localCatalogue;
    }

    console.log("Current cart:", getCart());

    renderCart();
}

function findProduct(productId) {
    const id = String(productId);

    // First try the stored ID.
    const productById = allProducts.find(product =>
        String(product.id) === id ||
        String(product.firebaseId || "") === id
    );

    if (productById) {
        return productById;
    }

    // Older cart entries may have IDs that differ from current IDs.
    // Try matching the saved cart item's product name as a fallback.
    const cartItem = getCart().find(item =>
        String(item.productId) === id
    );

    if (cartItem?.name) {
        const name = normalizeName(cartItem.name);

        const productByName = allProducts.find(product =>
            normalizeName(product.name) === name
        );

        if (productByName) {
            return productByName;
        }
    }

    console.warn("Cart product could not be matched:", id);

    return null;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderCart() {
    if (!main) return;

    const cart = getCart();

    updateCartCount();

    if (cart.length === 0) {
        main.innerHTML = `
            <section class="cart-page">
                <div class="container">
                    <div class="empty-cart">
                        <h1>Your Cart is Empty</h1>
                        <p>
                            Discover something beautiful
                            from our handmade collection.
                        </p>
                        <a href="/src/pages/marketplace.html"
                           class="btn btn-primary">
                            Explore Marketplace
                        </a>
                    </div>
                </div>
            </section>
        `;
        return;
    }

    const resolvedItems = cart.map(cartItem => ({
        cartItem,
        product: findProduct(cartItem.productId)
    }));

    const cartItemsHTML = resolvedItems.map(({ cartItem, product }) => {
        const productId = String(cartItem.productId);
        const quantity = Math.max(1, Number(cartItem.quantity) || 1);

        if (!product) {
            return `
                <article class="cart-item">
                    <div class="cart-item-details">
                        <h2>Product unavailable</h2>
                        <p>
                            This item could not be matched to the current
                            catalogue. Remove it and add the product again
                            from the marketplace.
                        </p>
                        <button
                            type="button"
                            class="remove-item"
                            data-id="${escapeHTML(productId)}">
                            Remove
                        </button>
                    </div>
                </article>
            `;
        }

        const image = getProductImage(product);
        const name = escapeHTML(product.name);
        const category = escapeHTML(product.category);
        const itemTotal = Number(product.price) * quantity;

        return `
            <article class="cart-item"
                     data-product-id="${escapeHTML(productId)}">

                <div class="cart-item-image">
                    ${
                        image
                            ? `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${name}"
                                    loading="lazy"
                                    onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
                                >
                                <div
                                    class="cart-image-placeholder"
                                    hidden>
                                    Image unavailable
                                </div>
                            `
                            : `
                                <div class="cart-image-placeholder">
                                    Image unavailable
                                </div>
                            `
                    }
                </div>

                <div class="cart-item-details">
                    <span class="cart-item-category">${category}</span>
                    <h2>${name}</h2>
                    <p class="cart-item-price">
                        ${formatPrice(product.price)}
                    </p>

                    <div class="cart-item-actions">
                        <div class="cart-quantity">
                            <button
                                type="button"
                                class="quantity-decrease"
                                data-id="${escapeHTML(productId)}"
                                aria-label="Decrease quantity">−</button>

                            <span>${quantity}</span>

                            <button
                                type="button"
                                class="quantity-increase"
                                data-id="${escapeHTML(productId)}"
                                aria-label="Increase quantity">+</button>
                        </div>

                        <button
                            type="button"
                            class="remove-item"
                            data-id="${escapeHTML(productId)}">
                            Remove
                        </button>
                    </div>
                </div>

                <div class="cart-item-total">
                    ${formatPrice(itemTotal)}
                </div>
            </article>
        `;
    }).join("");

    const subtotal = resolvedItems.reduce(
        (total, { cartItem, product }) => {
            if (!product) return total;

            const quantity = Math.max(
                1,
                Number(cartItem.quantity) || 1
            );

            return total + Number(product.price) * quantity;
        },
        0
    );

    main.innerHTML = `
        <section class="cart-page">
            <div class="container">
                <div class="cart-heading">
                    <p class="section-eyebrow">Your Selection</p>
                    <h1>Shopping Cart</h1>
                </div>

                <div class="cart-layout">
                    <div class="cart-items">
                        ${cartItemsHTML}
                    </div>

                    <aside class="cart-summary">
                        <h2>Order Summary</h2>

                        <div class="summary-row">
                            <span>Subtotal</span>
                            <strong>${formatPrice(subtotal)}</strong>
                        </div>

                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div class="summary-divider"></div>

                        <div class="summary-total">
                            <span>Total</span>
                            <strong>${formatPrice(subtotal)}</strong>
                        </div>

                        <a href="/src/pages/checkout.html"
                           class="btn btn-primary checkout-btn">
                            Proceed to Checkout
                        </a>

                        <a href="/src/pages/marketplace.html"
                           class="continue-shopping">
                            Continue Shopping
                        </a>
                    </aside>
                </div>
            </div>
        </section>
    `;

    main.querySelectorAll(
        ".quantity-decrease, .quantity-increase, .remove-item"
    ).forEach(button => {
        button.addEventListener("click", () => {
            const productId = String(button.dataset.id);

            if (button.classList.contains("remove-item")) {
                removeFromCart(productId);
                renderCart();
                return;
            }

            const item = getCart().find(cartItem =>
                String(cartItem.productId) === productId
            );

            if (!item) return;

            const quantity = Math.max(
                1,
                Number(item.quantity) || 1
            );

            if (button.classList.contains("quantity-decrease")) {
                updateCartQuantity(
                    item.productId,
                    quantity - 1
                );
            } else {
                updateCartQuantity(
                    item.productId,
                    quantity + 1
                );
            }

            renderCart();
        });
    });
}

loadProducts();

