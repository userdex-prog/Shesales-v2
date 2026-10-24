const testimonials = [

    {
        name: "Sophia M.",
        role: "Happy Customer",
        quote:
            "The craftsmanship is absolutely beautiful. You can truly feel the love and attention that goes into every piece.",
        rating: 5
    },

    {
        name: "Emma R.",
        role: "Verified Customer",
        quote:
            "I ordered a crochet bag as a gift and it was even more beautiful in person. The quality and details are amazing.",
        rating: 5
    },

    {
        name: "Mia K.",
        role: "Happy Customer",
        quote:
            "Such a unique and thoughtful piece. SheSales has quickly become one of my favorite handmade brands.",
        rating: 5
    }

];


export function createTestimonials() {

    return `

        <section
            class="testimonials section"
            aria-labelledby="testimonials-title"
        >

            <div class="container">


                <div class="testimonials-header">

                    <span class="section-eyebrow">
                        Kind Words
                    </span>

                    <h2 id="testimonials-title">
                        Loved by Our Customers
                    </h2>

                    <p>
                        Every handmade piece carries a little
                        piece of our story. Here's what some of
                        our wonderful customers have to say.
                    </p>

                </div>


                <div class="testimonials-grid">

                    ${testimonials
                        .map(testimonial => `

                            <article
                                class="testimonial-card"
                            >

                                <div
                                    class="testimonial-stars"
                                    aria-label="${testimonial.rating} out of 5 stars"
                                >

                                    ${"★".repeat(
                                        testimonial.rating
                                    )}

                                </div>


                                <blockquote>

                                    "${testimonial.quote}"

                                </blockquote>


                                <div
                                    class="testimonial-author"
                                >

                                    <div
                                        class="testimonial-avatar"
                                        aria-hidden="true"
                                    >
                                        ${testimonial.name.charAt(0)}
                                    </div>


                                    <div>

                                        <h3>
                                            ${testimonial.name}
                                        </h3>

                                        <span>
                                            ${testimonial.role}
                                        </span>

                                    </div>

                                </div>

                            </article>

                        `)
                        .join("")
                    }

                </div>


            </div>

        </section>

    `;

}
