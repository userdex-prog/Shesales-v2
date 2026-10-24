export function createNewsletter() {

    return `

        <section
            class="newsletter section"
            aria-labelledby="newsletter-title"
        >

            <div class="container">

                <div class="newsletter-content">

                    <span class="section-eyebrow">
                        Stay in the Loop
                    </span>

                    <h2 id="newsletter-title">
                        A Little Crochet Love,
                        Straight to Your Inbox
                    </h2>

                    <p>
                        Be the first to discover new handmade
                        pieces, special collections, and
                        behind-the-scenes moments from SheSales.
                    </p>


                    <form
                        class="newsletter-form"
                        id="newsletterForm"
                    >

                        <label
                            for="newsletterEmail"
                            class="sr-only"
                        >
                            Email address
                        </label>

                        <input
                            type="email"
                            id="newsletterEmail"
                            name="email"
                            placeholder="Enter your email address"
                            autocomplete="email"
                            required
                        >

                        <button
                            type="submit"
                            class="btn btn-primary"
                        >
                            Subscribe
                        </button>

                    </form>


                    <p
                        class="newsletter-message"
                        id="newsletterMessage"
                        aria-live="polite"
                    ></p>

                </div>

            </div>

        </section>

    `;

}