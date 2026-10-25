
import peonyBag from "../assets/products/peony-bouquet-bag.jpeg";
import roseBag from "../assets/products/rose-bouquet-bag.PNG";
import colourfulBag from "../assets/products/colourful-flower-bag.jpeg";
import sunflower from "../assets/products/sunflower.jpeg";

export function createGallery() {
    return `
        <section class="gallery section" id="collections">
            <div class="container">
                <div class="section-header">
                    <span class="section-tag">Our Collections</span>

                    <h2 class="section-title">
                        Made By Hand, Made With Love
                    </h2>

                    <p class="section-description">
                        Discover our handmade crochet collection,
                        thoughtfully crafted to bring warmth,
                        creativity, and personality into everyday life.
                    </p>
                </div>

                <div class="collection-collage">
                    <div class="collage-slide active">
                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img src="${peonyBag}" alt="Peony Bouquet Bag" loading="lazy">
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img src="${roseBag}" alt="Rose Bouquet Bag" loading="lazy">
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img src="${colourfulBag}" alt="Colorful Flower Bag" loading="lazy">
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img src="${sunflower}" alt="Sunflower Crochet" loading="lazy">
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `;
}

