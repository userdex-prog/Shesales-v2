export function createFooter() {
    return `
        <footer
            id="contact"
            class="footer"
        >

            <div class="container">

                <div class="footer-grid">

                    <!-- BRAND -->

                    <div class="footer-brand">

                        <a href="/" class="footer-logo">
                            <span>She</span>Sales
                        </a>

                        <p>
                            Handmade crochet creations,
                            thoughtfully crafted with love
                            and care in India.
                        </p>

                    </div>


                    <!-- SHOP -->

                    <div class="footer-column">

                        <h3>
                            Shop
                        </h3>

                        <ul>

                            <li>
                                <a href="/src/pages/marketplace.html">
                                    Marketplace
                                </a>
                            </li>
<li>
    <a href="/src/pages/marketplace.html?filter=new">
        New Arrivals
    </a>
</li>

<li>
    <a href="/src/pages/marketplace.html?filter=best">
        Best Sellers
    </a>
</li>

                        </ul>

                    </div>


                    <!-- COMPANY -->

                    <div class="footer-column">

                        <h3>
                            SheSales
                        </h3>

                        <ul>

                            <li>
                                <a href="/">
                                    Home
                                </a>
                            </li>

                            <li>
                                <a href="/src/pages/about.html">
                                    About Us
                                </a>
                            </li>

                            <li>
                               <a href="/src/pages/policies.html#contact" class="footer-link">
    Contact
</a>
                            </li>

                        </ul>

                    </div>


                    <!-- SUPPORT -->

                    <div class="footer-column">

                        <h3>
                            Support
                        </h3>

                        <ul>

                            <li>
                                <a href="/src/pages/policies.html#shipping" class="footer-link">
                                    Shipping & Delivery
                                </a>
                            </li>

                            <li>
                                <a href="/src/pages/policies.html#returns" class="footer-link">
                                    Returns & Refunds
                                </a>
                            </li>

                            <li>
                                <a href="/src/pages/policies.html#privacy" class="footer-link">
                                    Privacy Policy
                                </a>
                            </li>

                            <!-- ADMIN -->

                            <li class="footer-admin-link">
                                <a href="/src/pages/admin-login.html">
                                    Admin
                                </a>
                            </li>

                        </ul>

                    </div>

                </div>


                <!-- BOTTOM -->

                <div class="footer-bottom">

                    <p>
                        © ${new Date().getFullYear()}
                        SheSales. Handmade with love in India.
                    </p>

                    <div class="footer-socials">

                        <a
                            href="https://www.instagram.com/shesales__/"
                            aria-label="Instagram"
                        >
                            Instagram
                        </a>


                    </div>

                </div>

            </div>

        </footer>
    `;
}