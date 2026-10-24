/* =========================================
   WISHLIST STORAGE
========================================= */

const WISHLIST_STORAGE_KEY = "shesales-wishlist";


/* =========================================
   GET WISHLIST
========================================= */

export function getWishlist() {

    try {

        const storedWishlist =
            localStorage.getItem(
                WISHLIST_STORAGE_KEY
            );

        return storedWishlist
            ? JSON.parse(storedWishlist)
            : [];

    } catch (error) {

        console.error(
            "Unable to load wishlist:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE WISHLIST
========================================= */

export function saveWishlist(wishlist) {

    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist)
    );

}


/* =========================================
   CHECK IF PRODUCT IS IN WISHLIST
========================================= */

export function isInWishlist(productId) {

    const wishlist =
        getWishlist();

    return wishlist.includes(productId);

}


/* =========================================
   ADD TO WISHLIST
========================================= */

export function addToWishlist(productId) {

    const wishlist =
        getWishlist();

    if (!wishlist.includes(productId)) {

        wishlist.push(productId);

        saveWishlist(wishlist);

    }

    return wishlist;

}


/* =========================================
   REMOVE FROM WISHLIST
========================================= */

export function removeFromWishlist(productId) {

    const updatedWishlist =
        getWishlist().filter(
            id =>
                id !== productId
        );

    saveWishlist(
        updatedWishlist
    );

    return updatedWishlist;

}


/* =========================================
   TOGGLE WISHLIST
========================================= */

export function toggleWishlist(productId) {

    if (
        isInWishlist(productId)
    ) {

        return removeFromWishlist(
            productId
        );

    }

    return addToWishlist(
        productId
    );

}


/* =========================================
   WISHLIST COUNT
========================================= */

export function getWishlistCount() {

    return getWishlist().length;

}