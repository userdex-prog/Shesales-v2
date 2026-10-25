
/* =========================================
   CART STORAGE
========================================= */

const CART_STORAGE_KEY = "shesales-cart";


/* =========================================
   GET CART
========================================= */

export function getCart() {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!storedCart) {
            return [];
        }

        const parsedCart = JSON.parse(storedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart
            .filter(item =>
                item &&
                item.productId !== undefined &&
                Number.isFinite(Number(item.quantity)) &&
                Number(item.quantity) > 0
            )
            .map(item => ({
                ...item,
                productId: String(item.productId),
                quantity: Math.floor(Number(item.quantity))
            }));
    } catch (error) {
        console.error("Unable to load cart:", error);
        return [];
    }
}


/* =========================================
   SAVE CART
========================================= */

export function saveCart(cart) {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

        updateCartCount();

        return true;
    } catch (error) {
        console.error("Unable to save cart:", error);
        return false;
    }
}


/* =========================================
   ADD TO CART
========================================= */

export function addToCart(productId, quantity = 1) {
    const id = String(productId);
    const amount = Math.floor(Number(quantity));

    if (!id || !Number.isFinite(amount) || amount < 1) {
        return getCart();
    }

    const cart = getCart();

    const existingItem = cart.find(
        item => String(item.productId) === id
    );

    if (existingItem) {
        existingItem.quantity += amount;
    } else {
        cart.push({
            productId: id,
            quantity: amount
        });
    }

    saveCart(cart);

    return cart;
}


/* =========================================
   REMOVE FROM CART
========================================= */

export function removeFromCart(productId) {
    const id = String(productId);

    const updatedCart = getCart().filter(
        item => String(item.productId) !== id
    );

    saveCart(updatedCart);

    return updatedCart;
}


/* =========================================
   UPDATE QUANTITY
========================================= */

export function updateCartQuantity(productId, quantity) {
    const id = String(productId);
    const amount = Math.floor(Number(quantity));

    if (!Number.isFinite(amount) || amount <= 0) {
        return removeFromCart(id);
    }

    const cart = getCart();

    const item = cart.find(
        entry => String(entry.productId) === id
    );

    if (!item) {
        return cart;
    }

    item.quantity = amount;

    saveCart(cart);

    return cart;
}


/* =========================================
   GET CART ITEM COUNT
========================================= */

export function getCartItemCount() {
    return getCart().reduce(
        (total, item) => total + item.quantity,
        0
    );
}


/* =========================================
   UPDATE NAVBAR CART COUNT
========================================= */

export function updateCartCount() {
    const cartCount = document.querySelector(".cart-count");

    if (!cartCount) {
        return;
    }

    cartCount.textContent = getCartItemCount();
}


/* =========================================
   CART TOTAL
========================================= */

export function getCartTotal(products = []) {
    const cart = getCart();

    return cart.reduce((total, item) => {
        const product = products.find(
            entry =>
                String(entry.id) === String(item.productId)
        );

        if (!product) {
            return total;
        }

        const price = Number(product.price);

        if (!Number.isFinite(price) || price < 0) {
            return total;
        }

        return total + price * item.quantity;
    }, 0);
}

