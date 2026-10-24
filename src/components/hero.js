export function createHero() {
    return `
        <section class="hero">

            <div class="hero-decoration hero-decoration-1"></div>
            <div class="hero-decoration hero-decoration-2"></div>

            <div class="container hero-container">

                <div class="hero-content">

                    <span class="hero-tag">
                        Handmade • Premium • Crochet
                    </span>

                    <h1>
                        Handmade With Love,
                        <span>One Stitch At A Time.</span>
                    </h1>

                    <p>
                        Every crochet piece is handcrafted with care, creativity,
                        and attention to detail—made to bring warmth and joy into
                        your everyday life.
                    </p>

                    <div class="hero-buttons">

                        <a href="/src/pages/marketplace.html" class="btn btn-primary">
                            Shop Collection
                        </a>

                       <a href="/src/pages/policies.html#custom-orders" class="btn btn-outline">
    Custom Orders
</a>

    

                    </div>

                </div>

                <div class="hero-image">
<img
    src="/src/assets/products/peony-bouquet-bag.jpeg"
    alt="Handmade Peony Bouquet Crochet Bag"
>


                </div>

            </div>

        </section>
    `;
}