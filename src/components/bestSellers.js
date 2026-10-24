import { products } from "../data/products.js";
import { createProductCard } from "./productCard.js";


export function createBestSellers() {

    const featuredProducts =
        products.filter(
            product => product.featured
        );


    return `

        <section
            class="best-sellers section"
            aria-labelledby="best-sellers-title"
        >

            <div class="container">


                <div class="section-header">

                    <div class="section-header-content">

                        <span class="section-eyebrow">
                            Our Favorites
                        </span>

                        <h2 id="best-sellers-title">
                            Best Sellers
                        </h2>

                        <p>
                            Discover our most loved handmade
                            crochet pieces, thoughtfully crafted
                            to bring something special to your
                            everyday style.
                        </p>

                    </div>


                    <a
                        href="/src/pages/marketplace.html"
                        class="best-sellers-link"
                    >
                        View All Products
                    </a>

                </div>


                <div class="best-sellers-grid">

                    ${featuredProducts
                        .map(product =>
                            createProductCard(product)
                        )
                        .join("")
                    }

                </div>


            </div>

        </section>

    `;
}