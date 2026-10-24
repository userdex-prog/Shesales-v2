/* =========================================
   CART STORAGE
========================================= */

const CART_STORAGE_KEY = "shesales-cart";


/* =========================================
   GET CART
========================================= */

export function getCart() {

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        return storedCart
            ? JSON.parse(storedCart)
            : [];

    } catch (error) {

        console.error(
            "Unable to load cart:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE CART
========================================= */

export function saveCart(cart) {

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================
   ADD TO CART
========================================= */

export function addToCart(
    productId,
    quantity = 1
) {

    const cart =
        getCart();


    const existingItem =
        cart.find(
            item =>
                item.productId === productId
        );


    if (existingItem) {

        existingItem.quantity +=
            quantity;

    } else {

        cart.push({

            productId,

            quantity

        });

    }


    saveCart(cart);


    updateCartCount();


    return cart;

}


/* =========================================
   REMOVE FROM CART
========================================= */

export function removeFromCart(productId) {
    const updatedCart = getCart().filter(
        item => String(item.productId) !== String(productId)
    );

    saveCart(updatedCart);
    updateCartCount();

    return updatedCart;
}


/* =========================================
   UPDATE QUANTITY
========================================= */

export function updateCartQuantity(productId, quantity) {
    const cart = getCart();

    const item = cart.find(
        item => String(item.productId) === String(productId)
    );

    if (!item) {
        return cart;
    }

    if (quantity <= 0) {
        return removeFromCart(productId);
    }

    item.quantity = Number(quantity);

    saveCart(cart);
    updateCartCount();

    return cart;
}

/* =========================================
   GET CART ITEM COUNT
========================================= */

export function getCartItemCount() {

    const cart =
        getCart();


    return cart.reduce(
        (
            total,
            item
        ) =>
            total +
            item.quantity,

        0
    );

}


/* =========================================
   UPDATE NAVBAR CART COUNT
========================================= */

export function updateCartCount() {

    const cartCount =
        document.querySelector(
            ".cart-count"
        );


    if (!cartCount) {

        return;

    }


    const count =
        getCartItemCount();


    cartCount.textContent =
        count;

}


/* =========================================
   CART TOTAL
========================================= */

export function getCartTotal(
    products
) {

    const cart =
        getCart();


    return cart.reduce(
        (
            total,
            item
        ) => {

            const product =
                products.find(
                    product =>
                        product.id ===
                        item.productId
                );


            if (!product) {

                return total;

            }


            return (
                total +
                product.price *
                item.quantity
            );

        },

        0
    );

}