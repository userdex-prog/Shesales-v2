export function createGallery() {
    return `
        <section class="gallery section" id="collections">

            <div class="container">

                <div class="section-header">

                    <span class="section-tag">
                        Our Collections
                    </span>

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
                            <img
                                src="/src/assets/products/peony-bouquet-bag.jpeg"
                                alt="Peony Bouquet Bag"
                            >
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img
                                src="/src/assets/products/rose-bouquet-bag.PNG"
                                alt="Rose Bouquet Bag"
                            >
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img
                                src="/src/assets/products/colourful-flower-bag.jpeg"
                                alt="Colorful Flower Bag"
                            >
                        </a>

                        <a href="/src/pages/marketplace.html" class="collage-item">
                            <img
                                src="/src/assets/products/sunflower.jpeg"
                                alt="Sunflower Crochet"
                            >
                        </a>

                    </div>

                </div>

            </div>

        </section>
    `;
}