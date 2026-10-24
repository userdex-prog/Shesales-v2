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

function normalizeFirebaseProduct(snapshot) {
const data = snapshot.data();


const image =
    data.imageUrl ||
    data.image ||
    (Array.isArray(data.images) ? data.images[0] : "") ||
    "";

return {
    ...data,
    id: String(snapshot.id),
    name: String(data.name || "Untitled product"),
    price: Number(data.price) || 0,
    category: String(data.category || "gifts"),
    image,
    imageUrl: image,
    images: Array.isArray(data.images) && data.images.length
        ? data.images
        : image ? [image] : []
};


}

function normalizeLocalProduct(product) {
const image =
product.imageUrl ||
product.image ||
(Array.isArray(product.images) ? product.images[0] : "") ||
"";


return {
    ...product,
    id: String(product.id),
    price: Number(product.price) || 0,
    image,
    imageUrl: image,
    images: Array.isArray(product.images) && product.images.length
        ? product.images
        : image ? [image] : []
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

const localProductsNormalized = localProducts.map(normalizeLocalProduct);

try {
    const productsReference = collection(db, "product ID");
    const snapshot = await getDocs(productsReference);

    const firebaseProducts = snapshot.docs.map(normalizeFirebaseProduct);

    console.log(
    "Firebase products loaded:",
    firebaseProducts.map(product => ({
        id: product.id,
        name: product.name
    }))
);

console.log("Cart contents:", getCart());

    // Keep Firebase products and local products together.
    // Match by name so we can resolve old numeric IDs too.
    const productsById = new Map();
    const productsByName = new Map();

    localProductsNormalized.forEach(product => {
        productsById.set(String(product.id), product);
        productsByName.set(
            String(product.name).trim().toLowerCase(),
            product
        );
    });

    firebaseProducts.forEach(product => {
        const nameKey = String(product.name).trim().toLowerCase();
        const localMatch = productsByName.get(nameKey);

        productsById.set(String(product.id), product);

        if (localMatch) {
            // Preserve the local ID as an alias for existing cart items.
            productsById.set(String(localMatch.id), product);
        }

        productsByName.set(nameKey, product);
    });

    console.log(
    "Cart product lookup test:",
    ["1", "2", "3"].map(id => ({
        cartId: id,
        matchedProduct: productsById.get(id)?.name || "NOT FOUND"
    }))
);


    allProducts = Array.from(
    productsById.entries(),
    ([id, product]) => ({
        ...product,
        id: String(id)
    })
);

} catch (error) {
    console.error("Failed to load Firebase products:", error);
    allProducts = localProductsNormalized;
}

renderCart();


}

function findProduct(productId) {
    const id = String(productId);

    const product = allProducts.find(
        item => String(item.id) === id
    );

    if (!product) {
        console.error("Product not found:", id);
    }

    return product || null;
}

console.log("Cart lookup test:", {
    cartIds: getCart().map(item => item.productId),
    availableIds: allProducts.map(product => product.id),
    foundProducts: getCart().map(item => ({
        id: item.productId,
        name: findProduct(item.productId)?.name || "NOT FOUND"
    }))
});

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

const cartItems = resolvedItems.map(({ cartItem, product }) => {
    if (!product) {
        return `
            <article class="cart-item">
                <div class="cart-item-details">
                    <h2>Product unavailable</h2>
                    <p>This product could not be found in the current catalogue.</p>
                    <button type="button"
                            class="remove-item"
                            data-id="${String(cartItem.productId)}">
                        Remove
                    </button>
                </div>
            </article>
        `;
    }

    const image =
        product.imageUrl ||
        product.image ||
        product.images?.[0] ||
        "";

    const quantity = Math.max(1, Number(cartItem.quantity) || 1);
    const itemTotal = Number(product.price) * quantity;
    const productId = String(cartItem.productId);

    return `
        <article class="cart-item" data-product-id="${productId}">
            <div class="cart-item-image">
                ${
                    image
                        ? `<img src="${image}" alt="${product.name}" loading="lazy">`
                        : `<div class="cart-image-placeholder">Image unavailable</div>`
                }
            </div>

            <div class="cart-item-details">
                <span class="cart-item-category">${product.category || ""}</span>
                <h2>${product.name}</h2>
                <p class="cart-item-price">${formatPrice(product.price)}</p>

                <div class="cart-item-actions">
                    <div class="cart-quantity">
                        <button type="button"
                                class="quantity-decrease"
                                data-id="${productId}"
                                aria-label="Decrease quantity">−</button>

                        <span>${quantity}</span>

                        <button type="button"
                                class="quantity-increase"
                                data-id="${productId}"
                                aria-label="Increase quantity">+</button>
                    </div>

                    <button type="button"
                            class="remove-item"
                            data-id="${productId}">
                        Remove
                    </button>
                </div>
            </div>

            <div class="cart-item-total">${formatPrice(itemTotal)}</div>
        </article>
    `;
}).join("");

const subtotal = resolvedItems.reduce((total, { cartItem, product }) => {
    if (!product) return total;

    return total +
        Number(product.price) *
        Math.max(1, Number(cartItem.quantity) || 1);
}, 0);

main.innerHTML = `
    <section class="cart-page">
        <div class="container">
            <div class="cart-heading">
                <p class="section-eyebrow">Your Selection</p>
                <h1>Shopping Cart</h1>
            </div>

            <div class="cart-layout">
                <div class="cart-items">${cartItems}</div>

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

        const item = getCart().find(
            cartItem => String(cartItem.productId) === productId
        );

        if (!item) return;

        const quantity = Number(item.quantity) || 1;

        if (button.classList.contains("quantity-decrease")) {
            updateCartQuantity(item.productId, quantity - 1);
        } else {
            updateCartQuantity(item.productId, quantity + 1);
        }

        renderCart();
    });
});


}

loadProducts();
