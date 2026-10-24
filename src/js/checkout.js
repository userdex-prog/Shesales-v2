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

const cartItemsContainer =
document.querySelector("#checkout-cart-items");

const subtotalElement =
document.querySelector("#checkout-subtotal");

const totalElement =
document.querySelector("#checkout-total");

const checkoutForm =
document.querySelector("#checkout-form");

const placeOrderButton =
document.querySelector("#place-order-button");

const checkoutMessage =
document.querySelector("#checkout-message");

/* =========================================
STATE
========================================= */

let checkoutProducts = [];
let isSubmitting = false;

/* =========================================
FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {
return currencyFormatter.format(amount);
}

/* =========================================
SHOW MESSAGE
========================================= */

function showMessage(message, type = "error") {


checkoutMessage.textContent = message;

checkoutMessage.className =
    `checkout-message ${type}`;

checkoutMessage.hidden = false;


}

/* =========================================
LOAD FIREBASE PRODUCTS
========================================= */

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

    id: snapshot.id,

    name: String(
        data.name || "Untitled product"
    ),

    price: Number(data.price),

    image,

    images: image ? [image] : [],

    source: "firebase"
};


}

async function loadCheckoutProducts() {


const productMap = new Map();

/*
   Add local products first.
*/

localProducts.forEach(product => {

    productMap.set(
        String(product.id),
        {
            ...product,

            price: Number(product.price),

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
        }
    );

});


/*
   Load Firebase products.

   Firebase products take priority over local
   products with the same name.
*/

const snapshot = await getDocs(
    collection(db, PRODUCTS_COLLECTION)
);

const firebaseProducts = [];

snapshot.forEach(documentSnapshot => {

    firebaseProducts.push(
        normalizeFirebaseProduct(documentSnapshot)
    );

});


firebaseProducts.forEach(firebaseProduct => {

    const matchingEntry = Array.from(
        productMap.entries()
    ).find(([, product]) => {

        return product.name
            .trim()
            .toLowerCase() ===
            firebaseProduct.name
                .trim()
                .toLowerCase();

    });


    if (matchingEntry) {

        productMap.delete(
            matchingEntry[0]
        );

    }


    productMap.set(
        String(firebaseProduct.id),
        firebaseProduct
    );

});


checkoutProducts = Array.from(
    productMap.values()
);


}

/* =========================================
RESOLVE CART PRODUCTS
========================================= */

function resolveCartItems() {


const cart = getCart();

const resolvedItems = [];

cart.forEach(cartItem => {

    const product = checkoutProducts.find(item => {

        return String(item.id) ===
            String(cartItem.productId);

    });


    if (!product) {

        console.warn(
            "Cart product could not be found:",
            cartItem.productId
        );

        return;

    }


    const quantity = Number(
        cartItem.quantity
    );


    if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
    ) {

        return;

    }


    const price = Number(product.price);


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        return;

    }


    resolvedItems.push({

        productId: String(product.id),

        name: product.name,

        image: product.image || "",

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


return items.reduce(
    (total, item) => {

        return total + item.lineTotal;

    },
    0
);


}

/* =========================================
RENDER CART
========================================= */

function renderCheckout() {

const items = resolveCartItems();

cartItemsContainer.innerHTML = "";


if (items.length === 0) {

    cartItemsContainer.innerHTML = `
        <div class="checkout-empty">
            <p>Your cart is currently empty.</p>

            <a href="${MARKETPLACE_URL}">
                Explore our collection
            </a>
        </div>
    `;

    subtotalElement.textContent =
        formatCurrency(0);

    totalElement.textContent =
        formatCurrency(0);

    placeOrderButton.disabled = true;

    return;

}


items.forEach(item => {

    const article =
        document.createElement("article");

    article.className = "checkout-item";


    const image =
        document.createElement("img");

    image.className = "checkout-item-image";

    image.alt = item.name;

    image.loading = "lazy";

    image.src = item.image || "";

    image.addEventListener("error", () => {

        image.style.visibility = "hidden";

    });


    const details =
        document.createElement("div");

    details.className = "checkout-item-details";


    const name =
        document.createElement("h3");

    name.className = "checkout-item-name";

    name.textContent = item.name;


    const quantity =
        document.createElement("p");

    quantity.className = "checkout-item-quantity";

    quantity.textContent =
        `Quantity: ${item.quantity}`;


    const price =
        document.createElement("span");

    price.className = "checkout-item-price";

    price.textContent =
        formatCurrency(item.lineTotal);


    details.append(
        name,
        quantity,
        price
    );

    article.append(
        image,
        details
    );

    cartItemsContainer.append(
        article
    );

});


const subtotal =
    calculateSubtotal(items);


subtotalElement.textContent =
    formatCurrency(subtotal);


/*
   Delivery is not yet calculated.
   We don't add an invented delivery charge.
*/

totalElement.textContent =
    formatCurrency(subtotal);


placeOrderButton.disabled = false;


}

/* =========================================
READ CUSTOMER DETAILS
========================================= */

function getCustomerDetails() {


const formData =
    new FormData(checkoutForm);

return {

    name: String(
        formData.get("customerName") || ""
    ).trim(),

    email: String(
        formData.get("customerEmail") || ""
    ).trim(),

    phone: String(
        formData.get("customerPhone") || ""
    ).trim(),

    city: String(
        formData.get("customerCity") || ""
    ).trim(),

    address: String(
        formData.get("customerAddress") || ""
    ).trim(),

    postalCode: String(
        formData.get("customerPostal") || ""
    ).trim()

};


}

/* =========================================
VALIDATE CUSTOMER DETAILS
========================================= */

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


const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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


if (isSubmitting) {

    return;

}


checkoutMessage.hidden = true;


if (!checkoutForm.reportValidity()) {

    return;

}


const customer =
    getCustomerDetails();


const validationError =
    validateCustomer(customer);


if (validationError) {

    showMessage(validationError);

    return;

}


isSubmitting = true;

placeOrderButton.disabled = true;

placeOrderButton.textContent =
    "Placing your order...";


try {

    /*
       Refresh the product data before submitting.
    */

    await loadCheckoutProducts();


    const items =
        resolveCartItems();


    if (items.length === 0) {

        throw new Error(
            "Your cart is empty or contains unavailable products. Please return to the shop."
        );

    }


    const subtotal =
        calculateSubtotal(items);


    if (
        !Number.isFinite(subtotal) ||
        subtotal <= 0
    ) {

        throw new Error(
            "The order total is invalid. Please contact the store."
        );

    }


    /*
       Store the order.

       This browser-side implementation is a starting
       point. Production orders must also be validated
       by trusted server-side code and protected by
       appropriate Firestore security rules.
    */

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


    const documentReference =
        await addDoc(
            collection(db, ORDERS_COLLECTION),
            orderData
        );


    /*
       Remove only after Firestore confirms
       that the order was saved.
    */

    saveCart([]);


    const orderReference =
        documentReference.id;


    checkoutForm.hidden = true;

    placeOrderButton.hidden = true;


    cartItemsContainer.innerHTML = `
        <div class="checkout-empty">
            <p>Your order has been submitted successfully.</p>
        </div>
    `;


    showMessage(
        `Thank you for your order! Your order reference is ${orderReference}. Your payment is pending verification. Please contact the store for verified bank transfer instructions.`,
        "success"
    );


    subtotalElement.textContent =
        formatCurrency(subtotal);

    totalElement.textContent =
        formatCurrency(subtotal);


    console.info(
        "Order created:",
        orderReference
    );


} catch (error) {

    console.error(
        "Checkout failed:",
        error
    );


    showMessage(
        error.message ||
        "We couldn't submit your order. Please try again."
    );


} finally {

    isSubmitting = false;

    if (!checkoutForm.hidden) {

        placeOrderButton.disabled = false;

        placeOrderButton.textContent =
            "Place Order";

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

    console.error(
        "Unable to initialize checkout:",
        error
    );


    cartItemsContainer.innerHTML = `
        <div class="checkout-empty">
            <p>
                We couldn't load your products.
                Please refresh the page or try again later.
            </p>
        </div>
    `;


    showMessage(
        "Unable to load the checkout. Please try again later."
    );

}


}

checkoutForm.addEventListener(
"submit",
handlePlaceOrder
);

initializeCheckout();
