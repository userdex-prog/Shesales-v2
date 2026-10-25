
/* =========================================
   WISHLIST STORAGE
========================================= */

const WISHLIST_STORAGE_KEY = "shesales-wishlist";


/* =========================================
   GET WISHLIST
========================================= */

export function getWishlist() {
    try {
        const storedWishlist = localStorage.getItem(
            WISHLIST_STORAGE_KEY
        );

        const wishlist = storedWishlist
            ? JSON.parse(storedWishlist)
            : [];

        if (!Array.isArray(wishlist)) {
            return [];
        }

        // Keep product IDs consistent.
        return [...new Set(
            wishlist
                .filter(id => id !== null && id !== undefined)
                .map(String)
        )];

    } catch (error) {
        console.error("Unable to load wishlist:", error);
        return [];
    }
}


/* =========================================
   SAVE WISHLIST
========================================= */

export function saveWishlist(wishlist) {
    const normalizedWishlist = [
        ...new Set(
            wishlist
                .filter(id => id !== null && id !== undefined)
                .map(String)
        )
    ];

    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(normalizedWishlist)
    );
}


/* =========================================
   CHECK IF PRODUCT IS IN WISHLIST
========================================= */

export function isInWishlist(productId) {
    return getWishlist().includes(String(productId));
}


/* =========================================
   ADD TO WISHLIST
========================================= */

export function addToWishlist(productId) {
    const normalizedId = String(productId);
    const wishlist = getWishlist();

    if (!wishlist.includes(normalizedId)) {
        wishlist.push(normalizedId);
        saveWishlist(wishlist);
    }

    return getWishlist();
}


/* =========================================
   REMOVE FROM WISHLIST
========================================= */

export function removeFromWishlist(productId) {
    const normalizedId = String(productId);

    const updatedWishlist = getWishlist().filter(
        id => id !== normalizedId
    );

    saveWishlist(updatedWishlist);

    return updatedWishlist;
}


/* =========================================
   TOGGLE WISHLIST
========================================= */

export function toggleWishlist(productId) {
    if (isInWishlist(productId)) {
        return removeFromWishlist(productId);
    }

    return addToWishlist(productId);
}


/* =========================================
   WISHLIST COUNT
========================================= */

export function getWishlistCount() {
    return getWishlist().length;
}

