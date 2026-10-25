
import { getCart, saveCart } from "./cart.js";
import { products as localProducts } from "../data/products.js";
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

/* =========================================
   CONFIGURATION
========================================= */

const PRODUCTS_COLLECTION = "product ID";
const ORDERS_COLLECTION = "orders";
const MARKETPLACE_URL = "/src/pages/marketplace.html";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

/* =========================================
   DOM ELEMENTS
========================================= */

const cartItemsContainer = document.querySelector("#checkout-cart-items");
const subtotalElement = document.querySelector("#checkout-subtotal");
const totalElement = document.querySelector("#checkout-total");
const checkoutForm = document.querySelector("#checkout-form");
const placeOrderButton = document.querySelector("#place-order-button");
const checkoutMessage = document.querySelector("#checkout-message");

/* =========================================
   STATE
========================================= */

let checkoutProducts = [];
let isSubmitting = false;

/* =========================================
   HELPERS
========================================= */

function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function isUsableImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    // These URLs only work on the computer running Vite.
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

function showMessage(message, type = "error") {
    checkoutMessage.textContent = message;
    checkoutMessage.className = `checkout-message ${type}`;
    checkoutMessage.hidden = false;
}

/* =========================================
   NORMALIZE PRODUCTS
========================================= */

function normalizeLocalProduct(product) {
    const image = getProductImage(product);

    return {
        ...product,
        id: String(product.id),
        name: String(product.name || "Untitled product"),
        price: Number(product.price) || 0,
        image,
        imageUrl: image,
        images: image ? [image] : [],
        source: "local"
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
        images: image ? [image] : [],
        source: "firebase"
    };
}

/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadCheckoutProducts() {
    const localCatalogue = localProducts.map(normalizeLocalProduct);

    const localById = new Map();
    const localByName = new Map();

    localCatalogue.forEach(product => {
        localById.set(String(product.id), product);
        localByName.set(normalizeName(product.name), product);
    });

    // Begin with local products, which have Vite-bundled images.
    const productsById = new Map(localById);

    try {
        const snapshot = await getDocs(
            collection(db, PRODUCTS_COLLECTION)
        );

        snapshot.docs.forEach(documentSnapshot => {
            const firebaseProduct =
                normalizeFirebaseProduct(documentSnapshot);

            const firebaseId = String(firebaseProduct.id);
            const nameKey = normalizeName(firebaseProduct.name);

            const localMatch =
                localByName.get(nameKey) ||
                localById.get(firebaseId);

            if (localMatch) {
                const firebasePrice = Number(firebaseProduct.price);

                const mergedProduct = {
                    ...firebaseProduct,
                    ...localMatch,

                    id: String(localMatch.id),
                    firebaseId,

                    // Always preserve the local product's image.
                    image: localMatch.image,
                    imageUrl: localMatch.imageUrl,
                    images: localMatch.images,

                    // Use the Firebase price when it is valid.
                    price: Number.isFinite(firebasePrice) && firebasePrice >= 0
                        ? firebasePrice
                        : Number(localMatch.price) || 0
                };

                // Support both local and Firebase document IDs.
                productsById.set(String(localMatch.id), mergedProduct);
                productsById.set(firebaseId, mergedProduct);
            } else {
                productsById.set(firebaseId, firebaseProduct);
            }
        });
    } catch (error) {
        console.error(
            "Could not load Firebase products. Using local products:",
            error
        );

        // Continue with the local catalogue if Firebase fails.
    }

    checkoutProducts = [...new Set(productsById.values())];

    console.log(
        "Checkout product catalogue:",
        checkoutProducts.map(product => ({
            id: product.id,
            firebaseId: product.firebaseId || "",
            name: product.name,
            image: product.image
        }))
    );
}

/* =========================================
   RESOLVE CART PRODUCTS
========================================= */

function resolveCartItems() {
    const cart = getCart();
    const resolvedItems = [];

    cart.forEach(cartItem => {
        const cartId = String(cartItem.productId);

        let product = checkoutProducts.find(item =>
            String(item.id) === cartId ||
            String(item.firebaseId || "") === cartId
        );

        // Older cart items may have different IDs.
        // Match by name only if the cart actually stores a name.
        if (!product && cartItem.name) {
            product = checkoutProducts.find(item =>
                normalizeName(item.name) === normalizeName(cartItem.name)
            );
        }

        if (!product) {
            console.warn(
                "Checkout could not find cart product:",
                cartItem.productId
            );
            return;
        }

        const quantity = Number(cartItem.quantity);

        if (
            !Number.isSafeInteger(quantity) ||
            quantity < 1 ||
            quantity > 99
        ) {
            console.warn("Invalid cart quantity:", cartItem);
            return;
        }

        const price = Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
            console.warn("Invalid product price:", product);
            return;
        }

        resolvedItems.push({
            productId: String(product.id),
            name: product.name,
            image: getProductImage(product),
            price,
            quantity,
            lineTotal: price * quantity
        });
    });

    return resolvedItems;
}

/* =========================================
   CALCULATE TOTAL
========================================= */

function calculateSubtotal(items) {
    return items.reduce((total, item) => total + item.lineTotal, 0);
}

/* =========================================
   RENDER CHECKOUT
========================================= */

function renderCheckout() {
    const items = resolveCartItems();

    cartItemsContainer.innerHTML = "";

    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="checkout-empty">
                <p>Your cart is currently empty or its products are unavailable.</p>
                <a href="${MARKETPLACE_URL}">Explore our collection</a>
            </div>
        `;

        subtotalElement.textContent = formatCurrency(0);
        totalElement.textContent = formatCurrency(0);
        placeOrderButton.disabled = true;

        return;
    }

    items.forEach(item => {
        const article = document.createElement("article");
        article.className = "checkout-item";

        if (item.image) {
            const image = document.createElement("img");

            image.className = "checkout-item-image";
            image.alt = item.name;
            image.loading = "lazy";
            image.src = item.image;

            image.addEventListener("error", () => {
                image.style.display = "none";
            });

            article.appendChild(image);
        }

        const details = document.createElement("div");
        details.className = "checkout-item-details";

        const name = document.createElement("h3");
        name.className = "checkout-item-name";
        name.textContent = item.name;

        const quantity = document.createElement("p");
        quantity.className = "checkout-item-quantity";
        quantity.textContent = `Quantity: ${item.quantity}`;

        const price = document.createElement("span");
        price.className = "checkout-item-price";
        price.textContent = formatCurrency(item.lineTotal);

        details.append(name, quantity, price);
        article.appendChild(details);
        cartItemsContainer.appendChild(article);
    });

    const subtotal = calculateSubtotal(items);

    subtotalElement.textContent = formatCurrency(subtotal);
    totalElement.textContent = formatCurrency(subtotal);

    placeOrderButton.disabled = false;
}

/* =========================================
   CUSTOMER DETAILS
========================================= */

function getCustomerDetails() {
    const formData = new FormData(checkoutForm);

    return {
        name: String(formData.get("customerName") || "").trim(),
        email: String(formData.get("customerEmail") || "").trim(),
        phone: String(formData.get("customerPhone") || "").trim(),
        city: String(formData.get("customerCity") || "").trim(),
        address: String(formData.get("customerAddress") || "").trim(),
        postalCode: String(formData.get("customerPostal") || "").trim()
    };
}

function validateCustomer(customer) {
    if (
        !customer.name ||
        !customer.email ||
        !customer.phone ||
        !customer.city ||
        !customer.address ||
        !customer.postalCode
    ) {
        return "Please complete all delivery fields.";
    }

    if (
        customer.name.length > 100 ||
        customer.email.length > 254 ||
        customer.phone.length > 25 ||
        customer.city.length > 100 ||
        customer.address.length > 500 ||
        customer.postalCode.length > 20
    ) {
        return "One or more fields exceed the permitted length.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(customer.email)) {
        return "Please enter a valid email address.";
    }

    return null;
}

/* =========================================
   PLACE ORDER
========================================= */

async function handlePlaceOrder(event) {
    event.preventDefault();

    if (isSubmitting) return;

    checkoutMessage.hidden = true;

    if (!checkoutForm.reportValidity()) return;

    const customer = getCustomerDetails();
    const validationError = validateCustomer(customer);

    if (validationError) {
        showMessage(validationError);
        return;
    }

    isSubmitting = true;
    placeOrderButton.disabled = true;
    placeOrderButton.textContent = "Placing your order...";

    try {
        await loadCheckoutProducts();

        const items = resolveCartItems();

        if (items.length === 0) {
            throw new Error(
                "Your cart is empty or contains unavailable products. Please return to the shop."
            );
        }

        const subtotal = calculateSubtotal(items);

        if (!Number.isFinite(subtotal) || subtotal <= 0) {
            throw new Error("The order total is invalid.");
        }

        const orderData = {
            customer,
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                lineTotal: item.lineTotal
            })),
            currency: "INR",
            subtotal,
            deliveryCharge: null,
            total: subtotal,
            paymentMethod: "bank_transfer",
            paymentStatus: "pending_verification",
            orderStatus: "pending",
            paymentReference: "",
            createdAt: serverTimestamp()
        };

        const documentReference = await addDoc(
            collection(db, ORDERS_COLLECTION),
            orderData
        );

        // Clear the cart only after Firestore confirms the order.
        saveCart([]);

        checkoutForm.hidden = true;
        placeOrderButton.hidden = true;

        cartItemsContainer.innerHTML = `
            <div class="checkout-empty">
                <p>Your order has been submitted successfully.</p>
            </div>
        `;

        showMessage(
            `Thank you for your order! Your order reference is ${documentReference.id}. Your payment is pending verification. Please contact the store for verified bank transfer instructions.`,
            "success"
        );

        subtotalElement.textContent = formatCurrency(subtotal);
        totalElement.textContent = formatCurrency(subtotal);

        console.info("Order created:", documentReference.id);
    } catch (error) {
        console.error("Checkout failed:", error);

        showMessage(
            error.message ||
            "We couldn't submit your order. Please try again."
        );
    } finally {
        isSubmitting = false;

        if (!checkoutForm.hidden) {
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = "Place Order";
        }
    }
}

/* =========================================
   INITIALIZE CHECKOUT
========================================= */

async function initializeCheckout() {
    placeOrderButton.disabled = true;

    try {
        await loadCheckoutProducts();
        renderCheckout();
    } catch (error) {
        console.error("Unable to initialize checkout:", error);

        cartItemsContainer.innerHTML = `
            <div class="checkout-empty">
                <p>We couldn't load your products. Please refresh the page.</p>
            </div>
        `;

        showMessage(
            "Unable to load checkout. Please try again later."
        );
    }
}

checkoutForm.addEventListener("submit", handlePlaceOrder);

initializeCheckout();

