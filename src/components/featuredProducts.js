import { products } from "../data/products.js";
import { createProductCard } from "./productCard.js";

export function createFeaturedProducts() {

    const featuredProducts = products.filter(product => product.featured);

    return `
        <section class="featured-products section">

            <div class="container">

                <div class="section-header">

                    <span class="section-tag">
                        Featured Products
                    </span>

                    <h2 class="section-title">
                        Handcrafted Favourites
                    </h2>

                    <p class="section-description">
                        Discover our handcrafted crochet creations, thoughtfully made with premium materials and designed to add warmth, charm, and personality to everyday life.
                    </p>

                </div>

                <div class="products-grid">

                    ${featuredProducts
                        .map(product => createProductCard(product))
                        .join("")}

                </div>

            </div>

        </section>
    `;
}