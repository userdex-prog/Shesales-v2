import { updateCartCount } from "../js/cart.js";
export function createNavbar() {
      const navbar = `
    <nav class="navbar">
        <div class="container navbar-container">

            <a href="/" class="logo">
                <span>She</span>Sales
            </a>

            <ul class="nav-links">

    <li>
    <a href="/#top">Home</a>
</li>

<li>
    <a href="/src/pages/marketplace.html">Marketplace</a>
</li>

<li>
    <a href="/#collections">Collections</a>
</li>

<li>
    <a href="/src/pages/about.html">
        About
    </a>
</li>


<li>
    <a href="/#contact">Contact</a>
</li>

</ul>
            <div class="nav-actions">

              <a
    href="/src/pages/search.html"
    class="icon-btn"
    aria-label="Search"
>

    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
    </svg>

</a>

              <a
    href="/src/pages/wishlist.html"
    class="icon-btn"
    aria-label="Wishlist"
>

    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path d="M12 21s-7-4.35-9-8.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9 7.5C19 16.65 12 21 12 21z"></path>
    </svg>

</a>
             <a
    href="/src/pages/cart.html"
    class="icon-btn cart-btn"
    aria-label="Cart"
>

    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>

        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>

    <span class="cart-count">
        0
    </span>

</a>

             <button
    class="menu-toggle"
    aria-label="Menu"
    aria-expanded="false"
>

    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>

</button>

            </div>

        </div>
    </nav>
    `;

  setTimeout(() => {

    updateCartCount();


    /* =========================================
       MOBILE MENU
    ========================================= */

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );

    const navLinks =
        document.querySelector(
            ".nav-links"
        );


    if (
        menuToggle &&
        navLinks
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    navLinks.classList.toggle(
                        "mobile-menu-open"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                );

            }
        );


        /* =========================================
           CLOSE MENU AFTER CLICKING LINK
        ========================================= */

        navLinks
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            navLinks.classList.remove(
                                "mobile-menu-open"
                            );

                            menuToggle.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }
                    );

                }
            );

    }

}, 0);


return navbar;

}