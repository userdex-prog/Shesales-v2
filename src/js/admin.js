import { products as localProducts } from "../data/products.js";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "./firebase.js";

import {
    collection,
    getCountFromServer,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";


document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const navLinks = document.querySelectorAll(
        ".admin-nav a[data-section]"
    );

    const sections = document.querySelectorAll(
        ".admin-section"
    );

    const sectionLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    const productCountElement =
        document.getElementById("stat-products");

    const orderCountElement =
        document.getElementById("stat-orders");

    const customOrderCountElement =
        document.getElementById("stat-custom-orders");

    const revenueElement =
        document.getElementById("stat-revenue");

    const productForm =
        document.getElementById("product-form");

    const productImageInput =
        document.getElementById("product-image");

    const productImagePreview =
        document.getElementById("product-image-preview");

    const productImagePreviewMessage =
        document.getElementById("product-image-preview-message");

    const productFormPanel =
        document.getElementById("product-form-panel");

    const toggleProductFormButton =
        document.getElementById("toggle-product-form");

    const cancelProductFormButton =
        document.getElementById("cancel-product-form");

    const saveProductButton =
        document.getElementById("save-product-button");

    const productFormMessage =
        document.getElementById("product-form-message");

    const productList =
        document.getElementById("admin-product-list");

        /* =====================================================
CUSTOM ORDER ELEMENTS
===================================================== */

const customOrderForm =
document.getElementById("custom-order-form");

const customOrderFormPanel =
document.getElementById("custom-order-form-panel");

const toggleCustomOrderFormButton =
document.getElementById("toggle-custom-order-form");

const cancelCustomOrderFormButton =
document.getElementById("cancel-custom-order-form");

const saveCustomOrderButton =
document.getElementById("save-custom-order-button");

const customOrderFormMessage =
document.getElementById("custom-order-form-message");

const customOrderList =
document.getElementById("admin-custom-order-list");

let allCustomOrders = [];
let isSavingCustomOrder = false;
let isLoadingCustomOrders = false;

const allowedCustomOrderStatuses = [
"new",
"contacted",
"accepted",
"in_progress",
"completed",
"declined"
];



    /* =====================================================
       FIRESTORE COLLECTION
    ===================================================== */

    const productsReference =
        collection(db, "product ID");

        const customOrdersReference =
    collection(db, "customOrders");


    /* =====================================================
       STATE
    ===================================================== */

    let currentUser = null;
    let isSavingProduct = false;
    let isLoadingProducts = false;

    // Null means we are adding a product.
    // A document ID means we are editing that product.
    let editingProductId = null;
   
/* =====================================================
   ORDER MANAGEMENT
===================================================== */

const ordersReference = collection(db, "orders");

const ordersSection = document.getElementById("orders");

const ordersPanel = ordersSection?.querySelector(".admin-panel");

const recentOrdersContainer =
    document.querySelector("#dashboard .admin-orders");

let allOrders = [];
let isLoadingOrders = false;

const allowedOrderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];




    /* =====================================================
       HELPERS
    ===================================================== */

    function setText(element, value) {

        if (element) {
            element.textContent = value;
        }

    }


    function showFormMessage(message, type = "") {

        if (!productFormMessage) {
            return;
        }

        productFormMessage.textContent = message;
        productFormMessage.className = "admin-form-message";

        if (type) {
            productFormMessage.classList.add(type);
        }

    }


    function showProductListMessage(title, description) {

        if (!productList) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "admin-empty";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const paragraph = document.createElement("p");
        paragraph.textContent = description;

        wrapper.append(heading, paragraph);

        productList.replaceChildren(wrapper);

    }




function formatPrice(price) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(price) || 0);

}


/* =====================================================
   ORDER HELPERS
===================================================== */

function formatOrderDate(timestamp) {

    if (!timestamp) {
        return "Date unavailable";
    }

    const date = typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

}


function formatOrderStatus(status) {

    const labels = {
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled"
    };

    return labels[status] || status || "Pending";

}


function formatPaymentStatus(status) {

    const labels = {
        pending_verification: "Pending Verification",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded"
    };

    return labels[status] || status || "Pending Verification";

}


function createTextElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;

}


function createOrderCard(orderId, order) {

    const customer = order.customer || {};

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    const card = document.createElement("article");

    card.className = "admin-panel admin-order-card";

    card.dataset.orderId = orderId;


    const heading = document.createElement("div");

    heading.className = "admin-panel-header";


    const title = createTextElement(
        "h2",
        "",
        `Order #${orderId}`
    );

    const date = createTextElement(
        "p",
        "",
        formatOrderDate(order.createdAt)
    );

    heading.append(title, date);


    const customerSection = document.createElement("div");

    customerSection.className = "admin-order-customer";

    customerSection.append(
        createTextElement(
            "h3",
            "",
            customer.name || "Customer name unavailable"
        ),
        createTextElement(
            "p",
            "",
            `Email: ${customer.email || "Not provided"}`
        ),
        createTextElement(
            "p",
            "",
            `Phone: ${customer.phone || "Not provided"}`
        ),
        createTextElement(
            "p",
            "",
            `Address: ${
                [
                    customer.address,
                    customer.city,
                    customer.postalCode
                ].filter(Boolean).join(", ") || "Not provided"
            }`
        )
    );


    const itemsSection = document.createElement("div");

    itemsSection.className = "admin-order-items";

    itemsSection.append(
        createTextElement("h3", "", "Order Items")
    );


    items.forEach(item => {

        const quantity = Number(item.quantity) || 0;

        const price = Number(item.price) || 0;

        const lineTotal = Number.isFinite(Number(item.lineTotal))
            ? Number(item.lineTotal)
            : price * quantity;

        const itemRow = createTextElement(
            "p",
            "admin-order-item",
            `${item.name || "Product"} × ${quantity} — ${formatPrice(lineTotal)}`
        );

        itemsSection.append(itemRow);

    });


    const total = Number(order.total ?? order.subtotal ?? 0);

    const totalElement = createTextElement(
        "p",
        "admin-order-total",
        `Order Total: ${formatPrice(total)}`
    );


    const paymentStatus = createTextElement(
        "p",
        "admin-order-payment-status",
        `Payment: ${formatPaymentStatus(order.paymentStatus)}`
    );


    const orderStatus = createTextElement(
        "p",
        "admin-order-fulfilment-status",
        `Order Status: ${formatOrderStatus(order.orderStatus)}`
    );


    const actions = document.createElement("div");

    actions.className = "admin-order-actions";


    if (order.paymentStatus !== "paid") {

        const paidButton = document.createElement("button");

        paidButton.type = "button";

        paidButton.className = "admin-btn admin-btn-primary";

        paidButton.textContent = "Mark as Paid";

        paidButton.dataset.action = "mark-paid";

        paidButton.dataset.orderId = orderId;

        actions.append(paidButton);

    }


    const statusLabel = createTextElement(
        "label",
        "admin-order-status-label",
        "Update Order Status"
    );


    const statusSelect = document.createElement("select");

    statusSelect.className = "admin-order-status-select";

    statusSelect.dataset.orderId = orderId;

    statusSelect.setAttribute(
        "aria-label",
        `Update order status for ${orderId}`
    );


    allowedOrderStatuses.forEach(status => {

        const option = document.createElement("option");

        option.value = status;

        option.textContent = formatOrderStatus(status);

        statusSelect.append(option);

    });


    const currentStatus = allowedOrderStatuses.includes(
        order.orderStatus
    )
        ? order.orderStatus
        : "pending";

    statusSelect.value = currentStatus;


    const saveStatusButton = document.createElement("button");

    saveStatusButton.type = "button";

    saveStatusButton.className = "admin-btn admin-btn-secondary";

    saveStatusButton.textContent = "Update Status";

    saveStatusButton.dataset.action = "update-status";

    saveStatusButton.dataset.orderId = orderId;


   statusLabel.append(statusSelect);

/* =========================================
DELETE ORDER BUTTON
========================================= */

const deleteButton = document.createElement("button");

deleteButton.type = "button";

deleteButton.className = "admin-btn admin-btn-danger";

deleteButton.textContent = "Delete Order";

deleteButton.dataset.action = "delete-order";

deleteButton.dataset.orderId = orderId;

/* ADD ALL ACTIONS */

actions.append(
statusLabel,
saveStatusButton,
deleteButton
);



    const message = createTextElement(
        "p",
        "admin-order-message",
        ""
    );

    message.setAttribute("role", "status");


    card.append(
        heading,
        customerSection,
        itemsSection,
        totalElement,
        paymentStatus,
        orderStatus,
        actions,
        message
    );


    return card;

}


/* =====================================================
   LOAD ORDERS FROM FIRESTORE
===================================================== */

async function loadOrders() {

    if (isLoadingOrders || !ordersPanel) {
        return;
    }

    isLoadingOrders = true;

    ordersPanel.replaceChildren(
        createTextElement(
            "p",
            "admin-empty",
            "Loading customer orders..."
        )
    );

    try {

        const snapshot = await getDocs(ordersReference);

        allOrders = snapshot.docs.map(documentSnapshot => ({
            id: documentSnapshot.id,
            ...documentSnapshot.data()
        }));


        allOrders.sort((a, b) => {

            const aTime = a.createdAt?.toMillis?.() || 0;

            const bTime = b.createdAt?.toMillis?.() || 0;

            return bTime - aTime;

        });


        renderOrders();

        updateOrderStatistics();

    } catch (error) {

        console.error(
            "Failed to load customer orders:",
            error
        );

        ordersPanel.replaceChildren(
            createTextElement(
                "p",
                "admin-empty",
                "Unable to load orders. Check your Firestore permissions and try again."
            )
        );

    } finally {

        isLoadingOrders = false;

    }

}


/* =====================================================
   RENDER ORDER LIST AND DASHBOARD
===================================================== */

function renderOrders() {

    if (!ordersPanel) {
        return;
    }

    const heading = ordersSection.querySelector(".admin-header");

    const orderList = document.createElement("div");

    orderList.className = "admin-order-list";


    if (allOrders.length === 0) {

        orderList.append(
            createTextElement(
                "h3",
                "",
                "No orders yet"
            ),
            createTextElement(
                "p",
                "",
                "Customer orders will appear here when a customer places an order."
            )
        );

    } else {

        allOrders.forEach(order => {

            orderList.append(
                createOrderCard(order.id, order)
            );

        });

    }


    ordersPanel.replaceChildren(orderList);


   if (heading) {


let refreshButton = heading.querySelector(
    ".refresh-orders-button"
);

if (!refreshButton) {

    refreshButton = document.createElement("button");

    refreshButton.type = "button";

    refreshButton.className =
        "admin-btn admin-btn-secondary refresh-orders-button";

    refreshButton.textContent = "Refresh Orders";

    refreshButton.addEventListener("click", loadOrders);

    heading.append(refreshButton);

}


}


    renderRecentOrders();

}


function renderRecentOrders() {

    if (!recentOrdersContainer) {
        return;
    }

    recentOrdersContainer.replaceChildren();


    if (allOrders.length === 0) {

        recentOrdersContainer.append(
            createTextElement(
                "p",
                "admin-empty",
                "No customer orders yet."
            )
        );

        return;

    }


    allOrders.slice(0, 5).forEach(order => {

        const row = document.createElement("div");

        row.className = "admin-recent-order";


        row.append(
            createTextElement(
                "strong",
                "",
                order.customer?.name || "Customer"
            ),
            createTextElement(
                "span",
                "",
                formatPrice(Number(order.total ?? order.subtotal ?? 0))
            ),
            createTextElement(
                "span",
                "",
                formatPaymentStatus(order.paymentStatus)
            )
        );


        recentOrdersContainer.append(row);

    });

}


function updateOrderStatistics() {

    setText(
        orderCountElement,
        allOrders.length.toLocaleString("en-IN")
    );


    const paidRevenue = allOrders.reduce(
        (total, order) => {

            if (order.paymentStatus !== "paid") {
                return total;
            }

            const amount = Number(
                order.total ?? order.subtotal ?? 0
            );

            return total + (
                Number.isFinite(amount) ? amount : 0
            );

        },
        0
    );


    setText(
        revenueElement,
        formatPrice(paidRevenue)
    );

}


/* =====================================================
   UPDATE PAYMENT AND ORDER STATUS
===================================================== */

/* =====================================================
UPDATE PAYMENT, ORDER STATUS, AND DELETE ORDERS
===================================================== */

async function handleOrderAction(event) {


const button = event.target.closest(
    "button[data-action]"
);

if (!button) {
    return;
}

const orderId = button.dataset.orderId;

const order = allOrders.find(
    item => item.id === orderId
);

if (!order) {
    return;
}

const card = button.closest(".admin-order-card");

const message = card?.querySelector(
    ".admin-order-message"
);

const showOrderMessage = (text, type = "") => {

    if (!message) {
        return;
    }

    message.textContent = text;
    message.className = "admin-order-message";

    if (type) {
        message.classList.add(type);
    }

};


/* =========================================
   MARK ORDER AS PAID
========================================= */

if (button.dataset.action === "mark-paid") {

    if (order.paymentStatus === "paid") {

        showOrderMessage(
            "This order is already marked as paid."
        );

        return;

    }

    const confirmed = window.confirm(
        "Have you checked the owner's actual bank account and confirmed that the full payment has arrived? Only continue if the funds have been received."
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        await updateDoc(
            doc(db, "orders", orderId),
            {
                paymentStatus: "paid",
                paymentVerifiedAt: serverTimestamp()
            }
        );

        showOrderMessage(
            "Payment marked as paid.",
            "success"
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Failed to update payment status:",
            error
        );

        showOrderMessage(
            "Could not update payment status. Check Firestore permissions.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Mark as Paid";

    }

    return;

}


/* =========================================
   UPDATE ORDER STATUS
========================================= */

if (button.dataset.action === "update-status") {

    const select = card?.querySelector(
        ".admin-order-status-select"
    );

    const newStatus = select?.value;

    if (!allowedOrderStatuses.includes(newStatus)) {

        showOrderMessage(
            "Please choose a valid order status.",
            "error"
        );

        return;

    }

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        await updateDoc(
            doc(db, "orders", orderId),
            {
                orderStatus: newStatus,
                updatedAt: serverTimestamp()
            }
        );

        showOrderMessage(
            "Order status updated successfully.",
            "success"
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Failed to update order status:",
            error
        );

        showOrderMessage(
            "Could not update order status. Check Firestore permissions.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Update Status";

    }

    return;

}


/* =========================================
   DELETE REGULAR CUSTOMER ORDER
========================================= */

if (button.dataset.action === "delete-order") {

    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this customer order?"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        await deleteDoc(
            doc(db, "orders", orderId)
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Failed to delete customer order:",
            error
        );

        showOrderMessage(
            "Could not delete this order. Check Firestore permissions.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Delete Order";

    }

    return;

}



}

/* =====================================================
   CONNECT REGULAR ORDER BUTTONS
===================================================== */

ordersPanel?.addEventListener(
    "click",
    handleOrderAction
);


/* =====================================================
CUSTOM ORDER HELPERS
===================================================== */

function showCustomOrderMessage(message, type = "") {


if (!customOrderFormMessage) return;

customOrderFormMessage.textContent = message;
customOrderFormMessage.className = "admin-form-message";

if (type) {
    customOrderFormMessage.classList.add(type);
}


}

function formatCustomOrderStatus(status) {


const labels = {
    new: "New",
    contacted: "Contacted",
    accepted: "Accepted",
    in_progress: "In Progress",
    completed: "Completed",
    declined: "Declined"
};

return labels[status] || "New";


}

function closeCustomOrderForm() {


if (isSavingCustomOrder) return;

customOrderForm?.reset();

customOrderFormPanel?.classList.add("hidden");

showCustomOrderMessage("");

if (saveCustomOrderButton) {
    saveCustomOrderButton.disabled = false;
    saveCustomOrderButton.textContent = "Save Custom Order";
}

if (toggleCustomOrderFormButton) {
    toggleCustomOrderFormButton.textContent = "+ Add Custom Order";
}


}

function openCustomOrderForm() {


if (!currentUser || isSavingCustomOrder) return;

customOrderFormPanel?.classList.remove("hidden");

if (toggleCustomOrderFormButton) {
    toggleCustomOrderFormButton.textContent = "Form Open";
}

customOrderForm?.querySelector("input")?.focus();

customOrderFormPanel?.scrollIntoView({
    behavior: "smooth",
    block: "start"
});


}

toggleCustomOrderFormButton?.addEventListener("click", () => {


if (customOrderFormPanel?.classList.contains("hidden")) {
    openCustomOrderForm();
} else {
    closeCustomOrderForm();
}


});

cancelCustomOrderFormButton?.addEventListener(
"click",
closeCustomOrderForm
);

/* =====================================================
LOAD CUSTOM ORDERS
===================================================== */

async function loadCustomOrders() {


if (!customOrderList || isLoadingCustomOrders) return;

isLoadingCustomOrders = true;

customOrderList.replaceChildren(
    createTextElement(
        "p",
        "admin-empty",
        "Loading custom orders..."
    )
);

try {

    const snapshot = await getDocs(customOrdersReference);

    allCustomOrders = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
    }));

    allCustomOrders.sort((a, b) => {

        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;

        return bTime - aTime;

    });

    renderCustomOrders();

    setText(
        customOrderCountElement,
        allCustomOrders.length.toLocaleString("en-IN")
    );

} catch (error) {

    console.error("Failed to load custom orders:", error);

    customOrderList.replaceChildren(
        createTextElement(
            "p",
            "admin-empty",
            "Unable to load custom orders. Check Firestore permissions."
        )
    );

    setText(customOrderCountElement, "Unavailable");

} finally {

    isLoadingCustomOrders = false;

}


}

/* =====================================================
RENDER CUSTOM ORDERS
===================================================== */

function renderCustomOrders() {


if (!customOrderList) return;

if (allCustomOrders.length === 0) {

    customOrderList.replaceChildren(
        createTextElement(
            "h3",
            "",
            "No custom orders yet"
        ),
        createTextElement(
            "p",
            "",
            "Click Add Custom Order to record an agreed custom order."
        )
    );

    return;

}

const fragment = document.createDocumentFragment();

allCustomOrders.forEach(order => {

    const card = document.createElement("article");
    card.className = "admin-order-card admin-custom-order-card";

    const heading = document.createElement("div");
    heading.className = "admin-panel-header";

    heading.append(
        createTextElement(
            "h3",
            "",
            order.productName || "Custom Crochet Order"
        ),
        createTextElement(
            "p",
            "",
            `Order #${order.id}`
        )
    );

    const details = document.createElement("div");
    details.className = "admin-order-customer";

    details.append(
        createTextElement(
            "p",
            "",
            `Customer: ${order.customerName || "Not provided"}`
        ),
        createTextElement(
            "p",
            "",
            `Email: ${order.customerEmail || "Not provided"}`
        ),
        createTextElement(
            "p",
            "",
            `Agreed price: ${formatPrice(order.price)}`
        ),
        createTextElement(
            "p",
            "",
            `Created: ${formatOrderDate(order.createdAt)}`
        )
    );

    if (order.notes) {

        details.append(
            createTextElement(
                "p",
                "",
                `Notes: ${order.notes}`
            )
        );

    }

    const actions = document.createElement("div");
    actions.className = "admin-order-actions";

    const label = document.createElement("label");
    label.className = "admin-order-status-label";
    label.textContent = "Order Status ";

    const select = document.createElement("select");
    select.className = "custom-order-status-select";
    select.setAttribute(
        "aria-label",
        `Status for ${order.productName || "custom order"}`
    );

    allowedCustomOrderStatuses.forEach(status => {

        const option = document.createElement("option");
        option.value = status;
        option.textContent = formatCustomOrderStatus(status);

        select.append(option);

    });

    select.value = allowedCustomOrderStatuses.includes(order.status)
        ? order.status
        : "new";

    label.append(select);

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.className = "admin-btn admin-btn-secondary";
    updateButton.textContent = "Update Status";
    updateButton.dataset.action = "update-custom-status";
    updateButton.dataset.customOrderId = order.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "admin-btn admin-btn-danger";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete-custom-order";
    deleteButton.dataset.customOrderId = order.id;

    actions.append(label, updateButton, deleteButton);

    const message = createTextElement(
        "p",
        "admin-order-message",
        ""
    );

    message.setAttribute("role", "status");

    card.append(heading, details, actions, message);

    fragment.append(card);

});

customOrderList.replaceChildren(fragment);


}

/* =====================================================
SAVE A NEW CUSTOM ORDER
===================================================== */

customOrderForm?.addEventListener("submit", async event => {


event.preventDefault();

if (!currentUser) {

    showCustomOrderMessage(
        "Please sign in to manage custom orders.",
        "error"
    );

    return;

}

if (isSavingCustomOrder) return;

const formData = new FormData(customOrderForm);

const customerName = String(
    formData.get("customerName") || ""
).trim();

const customerEmail = String(
    formData.get("customerEmail") || ""
).trim();

const productName = String(
    formData.get("productName") || ""
).trim();

const price = Number(formData.get("price"));

const status = String(
    formData.get("status") || "new"
);

const notes = String(
    formData.get("notes") || ""
).trim();

if (!customerName || !customerEmail || !productName) {

    showCustomOrderMessage(
        "Please complete the customer name, email, and product name.",
        "error"
    );

    return;

}

if (!Number.isFinite(price) || price < 0) {

    showCustomOrderMessage(
        "Please enter a valid agreed price.",
        "error"
    );

    return;

}

if (!allowedCustomOrderStatuses.includes(status)) {

    showCustomOrderMessage(
        "Please select a valid order status.",
        "error"
    );

    return;

}

isSavingCustomOrder = true;

if (saveCustomOrderButton) {
    saveCustomOrderButton.disabled = true;
    saveCustomOrderButton.textContent = "Saving...";
}

showCustomOrderMessage("Saving custom order to Firebase...");

try {

    await addDoc(customOrdersReference, {
        customerName,
        customerEmail,
        productName,
        price,
        status,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    showCustomOrderMessage(
        "Custom order saved successfully!",
        "success"
    );

    await loadCustomOrders();

    window.setTimeout(() => {
        closeCustomOrderForm();
    }, 700);

} catch (error) {

    console.error("Failed to save custom order:", error);

    showCustomOrderMessage(
        "Could not save the custom order. Check your Firestore rules and try again.",
        "error"
    );

} finally {

    isSavingCustomOrder = false;

    if (saveCustomOrderButton) {
        saveCustomOrderButton.disabled = false;
        saveCustomOrderButton.textContent = "Save Custom Order";
    }

}


});

/* =====================================================
UPDATE OR DELETE A CUSTOM ORDER
===================================================== */

customOrderList?.addEventListener("click", async event => {


const button = event.target.closest("button[data-action]");

if (!button) return;

if (!currentUser) {

    window.alert("Please sign in to manage custom orders.");

    return;

}

const orderId = button.dataset.customOrderId;

const card = button.closest(".admin-custom-order-card");

const message = card?.querySelector(".admin-order-message");

const showCardMessage = (text, type = "") => {

    if (!message) return;

    message.textContent = text;
    message.className = "admin-order-message";

    if (type) message.classList.add(type);

};

if (button.dataset.action === "update-custom-status") {

    const select = card?.querySelector(
        ".custom-order-status-select"
    );

    const status = select?.value;

    if (!allowedCustomOrderStatuses.includes(status)) {

        showCardMessage("Choose a valid status.", "error");

        return;

    }

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        await updateDoc(
            doc(db, "customOrders", orderId),
            {
                status,
                updatedAt: serverTimestamp()
            }
        );

        showCardMessage(
            "Custom order status updated.",
            "success"
        );

        await loadCustomOrders();

    } catch (error) {

        console.error("Failed to update custom order:", error);

        showCardMessage(
            "Could not update status. Check Firestore permissions.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Update Status";

    }

}

if (button.dataset.action === "delete-custom-order") {

    const confirmed = window.confirm(
        "Delete this custom order permanently?"
    );

    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Deleting...";

    try {

        await deleteDoc(
            doc(db, "customOrders", orderId)
        );

        await loadCustomOrders();

    } catch (error) {

        console.error("Failed to delete custom order:", error);

        showCardMessage(
            "Could not delete this custom order. Check Firestore permissions.",
            "error"
        );

        button.disabled = false;
        button.textContent = "Delete";

    }

}


});





    function setButtonLoading(
        button,
        loading,
        loadingText,
        normalText
    ) {

        if (!button) {
            return;
        }

        button.disabled = loading;

        button.textContent = loading
            ? loadingText
            : normalText;

    }


    function getFormField(name) {

        return productForm?.elements.namedItem(name) || null;

    }


    function setFormValue(name, value) {

        const field = getFormField(name);

        if (field) {
            field.value = value ?? "";
        }

    }



function normalizeProductName(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function isUsableProductImage(value) {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    try {
        const url = new URL(value.trim(), window.location.href);

        if (!["https:", "http:"].includes(url.protocol)) {
            return false;
        }

        // Reject old development-server URLs.
        if (
            ["localhost", "127.0.0.1", "::1"].includes(
                url.hostname.replace(/^\[|\]$/g, "")
            )
        ) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

function getProductImage(product) {
    const productName = normalizeProductName(product?.name);

    // Find the matching product bundled with the website.
    const localProduct = localProducts.find(item =>
        normalizeProductName(item.name) === productName
    );

    // Prefer valid Firebase image URLs.
    const firebaseCandidates = [
        ...(Array.isArray(product?.images) ? product.images : []),
        product?.imageUrl,
        product?.image
    ];

    const firebaseImage = firebaseCandidates.find(
        isUsableProductImage
    );

    if (firebaseImage) {
        return firebaseImage.trim();
    }

    // Fall back to the image imported by Vite.
    if (localProduct) {
        const localCandidates = [
            ...(Array.isArray(localProduct.images)
                ? localProduct.images
                : []),
            localProduct.imageUrl,
            localProduct.image
        ];

        const localImage = localCandidates.find(value =>
            typeof value === "string" && value.trim()
        );

        if (localImage) {
            return localImage.trim();
        }
    }

    return "";
}






    /* =====================================================
       PRODUCT COUNT
    ===================================================== */

    async function loadProductCount() {

        if (!productCountElement) {
            return;
        }

        setText(productCountElement, "Loading...");

        try {

            const snapshot =
                await getCountFromServer(productsReference);

            setText(
                productCountElement,
                snapshot.data().count.toLocaleString()
            );

            productCountElement.removeAttribute("title");

        } catch (error) {

            console.error(
                "Failed to load product count:",
                error
            );

            setText(productCountElement, "Unavailable");

            productCountElement.title =
                "Could not retrieve the product count.";

        }

    }


    /* =====================================================
       PRODUCT IMAGE PREVIEW
    ===================================================== */

    function updateImagePreview() {

        if (
            !productImageInput ||
            !productImagePreview ||
            !productImagePreviewMessage
        ) {
            return;
        }

        const imageUrl = productImageInput.value.trim();

        productImagePreview.onload = null;
        productImagePreview.onerror = null;

        if (!imageUrl) {

            productImagePreview.hidden = true;
            productImagePreview.removeAttribute("src");

            productImagePreviewMessage.hidden = false;

            productImagePreviewMessage.textContent =
                "Your image preview will appear here.";

            return;

        }

        let parsedUrl;

        try {

            parsedUrl = new URL(imageUrl);

            if (
                parsedUrl.protocol !== "https:" &&
                parsedUrl.protocol !== "http:"
            ) {
                throw new Error("Invalid image URL");
            }

        } catch {

            productImagePreview.hidden = true;
            productImagePreview.removeAttribute("src");

            productImagePreviewMessage.hidden = false;

            productImagePreviewMessage.textContent =
                "Enter a valid image URL.";

            return;

        }

        productImagePreview.hidden = true;

        productImagePreviewMessage.hidden = false;

        productImagePreviewMessage.textContent =
            "Loading image preview...";

        productImagePreview.onload = () => {

            productImagePreview.hidden = false;
            productImagePreviewMessage.hidden = true;

        };

        productImagePreview.onerror = () => {

            productImagePreview.hidden = true;

            productImagePreviewMessage.hidden = false;

            productImagePreviewMessage.textContent =
                "Image unavailable. Check that the URL points directly to an image.";

        };

        productImagePreview.src = parsedUrl.href;

    }


    productImageInput?.addEventListener(
        "input",
        updateImagePreview
    );


    /* =====================================================
       FORM OPEN / CLOSE
    ===================================================== */

    function openProductForm() {

        productFormPanel?.classList.remove("hidden");

        productForm?.querySelector("input")?.focus();

    }


    function closeProductForm() {

        if (isSavingProduct) {
            return;
        }

        editingProductId = null;

        productForm?.reset();

        productFormPanel?.classList.add("hidden");

        showFormMessage("");

        setText(saveProductButton, "Save Product");

        if (productImagePreview) {
            productImagePreview.hidden = true;
            productImagePreview.removeAttribute("src");
        }

        if (productImagePreviewMessage) {

            productImagePreviewMessage.hidden = false;

            productImagePreviewMessage.textContent =
                "Your image preview will appear here.";

        }

        if (toggleProductFormButton) {
            toggleProductFormButton.textContent = "Add Product";
        }

    }


    function startAddingProduct() {

        if (isSavingProduct) {
            return;
        }

        editingProductId = null;

        productForm?.reset();

        showFormMessage("");

        setText(saveProductButton, "Save Product");

        if (toggleProductFormButton) {
            toggleProductFormButton.textContent = "Add Product";
        }

        updateImagePreview();

        openProductForm();

    }


    function startEditingProduct(productId, product) {

        if (isSavingProduct) {
            return;
        }

        editingProductId = productId;

        productForm?.reset();

        /*
         * Populate the existing form with the selected
         * product's current information.
         */

        setFormValue("name", product.name);
        setFormValue("price", product.price);
        setFormValue("category", product.category);
        setFormValue("stock", product.stock ?? 0);
        setFormValue("badge", product.badge);

        setFormValue(
            "imageUrl",
            getProductImage(product)
        );

        setFormValue("description", product.description);

        setFormValue(
            "tags",
            Array.isArray(product.tags)
                ? product.tags.join(", ")
                : ""
        );

        const featuredCheckbox =
            document.getElementById("product-featured");

        if (featuredCheckbox) {
            featuredCheckbox.checked =
                Boolean(product.featured);
        }

        setText(saveProductButton, "Save Changes");

        if (toggleProductFormButton) {
            toggleProductFormButton.textContent = "Add Product";
        }

        showFormMessage(
            `Editing: ${product.name || "Untitled product"}`
        );

        updateImagePreview();

        openProductForm();

        productFormPanel?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    toggleProductFormButton?.addEventListener(
        "click",
        startAddingProduct
    );


    cancelProductFormButton?.addEventListener(
        "click",
        closeProductForm
    );


    /* =====================================================
       LOAD AND DISPLAY PRODUCTS
    ===================================================== */

    async function loadProducts() {

        if (!productList || isLoadingProducts) {
            return;
        }

        isLoadingProducts = true;

        showProductListMessage(
            "Loading products...",
            "Fetching your catalog from Firebase."
        );

        try {

            const snapshot = await getDocs(productsReference);

            if (snapshot.empty) {

                showProductListMessage(
                    "No products yet",
                    "Use the Add Product button to create your first product."
                );

                return;

            }

            const fragment = document.createDocumentFragment();

            snapshot.forEach(productDocument => {

                const product = productDocument.data();
                const productId = productDocument.id;

                const row = document.createElement("article");
                row.className = "admin-product-row";

                /* PRODUCT IMAGE */

                const image = document.createElement("img");

                image.className = "admin-product-image";

                image.alt = product.name
                    ? `${product.name} product image`
                    : "Product image";

                image.loading = "lazy";

                image.src = getProductImage(product);

                image.addEventListener("error", () => {

                    image.classList.add(
                        "admin-product-image-missing"
                    );

                    image.removeAttribute("src");

                    image.alt = "Image unavailable";

                });

                /* PRODUCT DETAILS */

                const details = document.createElement("div");
                details.className = "admin-product-details";

                const name = document.createElement("h3");
                name.className = "admin-product-name";

                name.textContent =
                    product.name || "Untitled product";

                const category = document.createElement("p");
                category.className = "admin-product-category";

                category.textContent =
                    product.category || "Uncategorized";

                const description = document.createElement("p");
                description.className = "admin-product-description";

                description.textContent =
                    product.description ||
                    "No description provided.";

                details.append(name, category, description);

                /* PRICE AND STOCK */

                const inventory = document.createElement("div");
                inventory.className = "admin-product-inventory";

                const price = document.createElement("strong");
                price.className = "admin-product-price";

                const numericPrice = Number(product.price);

                price.textContent = Number.isFinite(numericPrice)
                    ? formatPrice(numericPrice)
                    : "Price unavailable";

                const stock = document.createElement("span");
                stock.className = "admin-product-stock";

                stock.textContent =
                    `Stock: ${Number(product.stock ?? 0)}`;

                inventory.append(price, stock);

                /* ACTION BUTTONS */

                const actions = document.createElement("div");
                actions.className = "admin-product-actions";

                // EDIT BUTTON

                const editButton = document.createElement("button");

                editButton.type = "button";

                editButton.className =
                    "admin-btn admin-btn-secondary";

                editButton.textContent = "Edit";

                editButton.setAttribute(
                    "aria-label",
                    `Edit ${product.name || "product"}`
                );

                editButton.addEventListener("click", () => {

                    startEditingProduct(productId, product);

                });


                // DELETE BUTTON

                const deleteButton = document.createElement("button");

                deleteButton.type = "button";

                deleteButton.className =
                    "admin-btn admin-btn-danger";

                deleteButton.textContent = "Remove";

                deleteButton.setAttribute(
                    "aria-label",
                    `Remove ${product.name || "product"}`
                );

                deleteButton.addEventListener(
                    "click",
                    async () => {

                        if (!currentUser) {

                            window.alert(
                                "You must be signed in to remove products."
                            );

                            return;

                        }

                        const confirmed = window.confirm(
                            `Remove "${product.name || "this product"}" from your catalog? This cannot be undone.`
                        );

                        if (!confirmed) {
                            return;
                        }

                        deleteButton.disabled = true;
                        editButton.disabled = true;

                        deleteButton.textContent = "Removing...";

                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "product ID",
                                    productId
                                )
                            );

                            if (editingProductId === productId) {
                                closeProductForm();
                            }

                            await Promise.all([
                                loadProductCount(),
                                loadProducts()
                            ]);

                        } catch (error) {

                            console.error(
                                "Failed to remove product:",
                                error
                            );

                            window.alert(
                                "Could not remove this product. Check your Firebase permissions and try again."
                            );

                            deleteButton.disabled = false;
                            editButton.disabled = false;

                            deleteButton.textContent = "Remove";

                        }

                    }
                );

                actions.append(editButton, deleteButton);

                row.append(
                    image,
                    details,
                    inventory,
                    actions
                );

                fragment.append(row);

            });

            productList.replaceChildren(fragment);

        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            showProductListMessage(
                "Unable to load products",
                "Check your internet connection and Firestore permissions, then try again."
            );

        } finally {

            isLoadingProducts = false;

        }

    }


    /* =====================================================
       ADD OR EDIT PRODUCT
    ===================================================== */

    productForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!currentUser) {

                showFormMessage(
                    "You must be signed in to save products.",
                    "error"
                );

                return;

            }

            if (isSavingProduct) {
                return;
            }

            const formData = new FormData(productForm);

            const name = String(
                formData.get("name") || ""
            ).trim();

            const price = Number(
                formData.get("price")
            );

            const category = String(
                formData.get("category") || ""
            ).trim();

            const stock = Number(
                formData.get("stock")
            );

            const badge = String(
                formData.get("badge") || ""
            ).trim();

            const imageUrl = String(
                formData.get("imageUrl") || ""
            ).trim();

            const description = String(
                formData.get("description") || ""
            ).trim();

            const tags = String(
                formData.get("tags") || ""
            )
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);

            const featuredCheckbox =
                document.getElementById("product-featured");

            const featured =
                Boolean(featuredCheckbox?.checked);


            /* VALIDATION */

            if (
                !name ||
                !category ||
                !description ||
                !imageUrl
            ) {

                showFormMessage(
                    "Please fill in all required fields.",
                    "error"
                );

                return;

            }

            if (
                !Number.isFinite(price) ||
                price <= 0
            ) {

                showFormMessage(
                    "Enter a valid price greater than zero.",
                    "error"
                );

                return;

            }

            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                showFormMessage(
                    "Stock must be a whole number of zero or greater.",
                    "error"
                );

                return;

            }

            try {

                const parsedUrl = new URL(imageUrl);

                if (
                    parsedUrl.protocol !== "https:" &&
                    parsedUrl.protocol !== "http:"
                ) {
                    throw new Error("Invalid image URL");
                }

            } catch {

                showFormMessage(
                    "Please enter a valid HTTP or HTTPS image URL.",
                    "error"
                );

                return;

            }


            /* PREPARE PRODUCT DATA */

            const productData = {

                name,
                price,
                category,
                stock,
                badge,
                imageUrl,
                images: [imageUrl],
                description,
                tags,
                featured,
                updatedAt: serverTimestamp()

            };


            /* SAVE */

            isSavingProduct = true;

            const isEditing = Boolean(editingProductId);

            setButtonLoading(
                saveProductButton,
                true,
                isEditing ? "Saving Changes..." : "Saving...",
                isEditing ? "Save Changes" : "Save Product"
            );

            if (cancelProductFormButton) {
                cancelProductFormButton.disabled = true;
            }

            showFormMessage(
                isEditing
                    ? "Updating product in Firebase..."
                    : "Saving product to Firebase..."
            );

            try {

                if (isEditing) {

                    // Update the existing Firestore document.
                    // This preserves its document ID and createdAt.

                    await updateDoc(
                        doc(
                            db,
                            "product ID",
                            editingProductId
                        ),
                        productData
                    );

                    showFormMessage(
                        "Product updated successfully!",
                        "success"
                    );

                } else {

                    // Create a new Firestore document.

                    await addDoc(productsReference, {

                        ...productData,
                        createdAt: serverTimestamp()

                    });

                    showFormMessage(
                        "Product added successfully!",
                        "success"
                    );

                }

                /*
                 * Refresh the admin list and product count.
                 * The existing Firestore document ID remains
                 * unchanged when a product is edited.
                 */

                await Promise.all([
                    loadProductCount(),
                    loadProducts()
                ]);

                window.setTimeout(() => {

                    closeProductForm();

                }, 900);

            } catch (error) {

                console.error(
                    "Failed to save product:",
                    error
                );

                showFormMessage(
                    isEditing
                        ? "Could not update this product. Check Firebase permissions and try again."
                        : "Could not save the product. Check Firebase permissions and try again.",
                    "error"
                );

            } finally {

                isSavingProduct = false;

                setButtonLoading(
                    saveProductButton,
                    false,
                    "Saving...",
                    editingProductId
                        ? "Save Changes"
                        : "Save Product"
                );

                if (cancelProductFormButton) {
                    cancelProductFormButton.disabled = false;
                }

            }

        }
    );


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    setText(orderCountElement, "0");
    setText(customOrderCountElement, "0");
    setText(revenueElement, "Rs. 0.00");


    onAuthStateChanged(
        auth,

        async user => {

            if (!user) {

                currentUser = null;

                window.location.href =
                    "/src/pages/admin-login.html";

                return;

            }

            currentUser = user;

            console.log(
                "Admin authenticated:",
                user.email
            );

            await Promise.all([
    loadProductCount(),
    loadProducts(),
    loadOrders(),
    loadCustomOrders()
]);

        },

        error => {

            console.error(
                "Authentication state error:",
                error
            );

        }
    );


    /* =====================================================
       SECTION NAVIGATION
    ===================================================== */

    function showSection(sectionId) {

        const targetSection =
            document.getElementById(sectionId);

        if (!targetSection) {
            return;
        }

        sections.forEach(section => {

            section.classList.add("hidden");

        });

        targetSection.classList.remove("hidden");

        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.section === sectionId
            );

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function getSectionFromHash() {

        const hash =
            window.location.hash.replace("#", "");

        if (
            hash &&
            document.getElementById(hash)
        ) {
            return hash;
        }

        return "dashboard";

    }


    function navigateTo(sectionId) {

        if (!document.getElementById(sectionId)) {
            return;
        }

        if (
            window.location.hash !==
            `#${sectionId}`
        ) {

            history.pushState(
                null,
                "",
                `#${sectionId}`
            );

        }

        showSection(sectionId);

    }


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                navigateTo(link.dataset.section);

            }
        );

    });


    sectionLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");

                if (!href || !href.startsWith("#")) {
                    return;
                }

                const sectionId = href.substring(1);

                if (document.getElementById(sectionId)) {

                    event.preventDefault();

                    navigateTo(sectionId);

                }

            }
        );

    });


    window.addEventListener(
        "popstate",
        () => {
            showSection(getSectionFromHash());
        }
    );


    window.addEventListener(
        "hashchange",
        () => {
            showSection(getSectionFromHash());
        }
    );


    showSection(getSectionFromHash());

});

