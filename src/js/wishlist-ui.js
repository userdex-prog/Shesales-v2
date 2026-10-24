import {
    toggleWishlist,
    isInWishlist
} from "./wishlist.js";


/* =========================================
   UPDATE WISHLIST BUTTON
========================================= */

function updateWishlistButton(button) {

    const productId =
        Number(
            button.dataset.wishlistId
        );

    const active =
        isInWishlist(productId);


    button.classList.toggle(
        "active",
        active
    );


    button.setAttribute(
        "aria-label",
        active
            ? "Remove from wishlist"
            : "Add to wishlist"
    );

}


/* =========================================
   INITIALIZE WISHLIST BUTTONS
========================================= */

export function initializeWishlistButtons() {

    document
        .querySelectorAll(
            ".wishlist-btn"
        )
        .forEach(
            button => {

                updateWishlistButton(
                    button
                );

            }
        );

}


/* =========================================
   WISHLIST CLICK
========================================= */

document.addEventListener(
    "click",
    event => {

        const wishlistButton =
            event.target.closest(
                ".wishlist-btn"
            );


        if (!wishlistButton) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        const productId =
            Number(
                wishlistButton.dataset.wishlistId
            );


        toggleWishlist(
            productId
        );


        updateWishlistButton(
            wishlistButton
        );

    }
);
document.addEventListener(
    "wishlist:updated",
    initializeWishlistButtons
);