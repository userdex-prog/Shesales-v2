

import { createAnnouncement } from "../components/announcement.js";
import { createNavbar } from "../components/navbar.js";
import { createHero } from "../components/hero.js";
import { createFooter } from "../components/footer.js";
import { createFeaturedProducts } from "../components/featuredProducts.js";
import { createBestSellers } from "../components/bestSellers.js";
import { createAbout } from "../components/about.js";
import { createWhyChoose } from "../components/whychoose.js";
import { createTestimonials } from "../components/testimonials.js";

import { createGallery } from "../components/gallery.js";

window.scrollTo(0, 0);


/* =========================================
   DOM ELEMENTS
========================================= */

const header =
    document.querySelector("#header");

const main =
    document.querySelector("#main-content");

const footer =
    document.querySelector("footer");


/* =========================================
   HEADER
========================================= */

header.innerHTML = `

    ${createAnnouncement()}

    ${createNavbar()}


`;


/* =========================================
   MAIN CONTENT
========================================= */

main.innerHTML = `

    ${createHero()}

    ${createFeaturedProducts()}

    ${createBestSellers()}

    ${createAbout()}

    ${createWhyChoose()}

    ${createTestimonials()}

   
    
    ${createGallery()}

`;

/* =========================================
   COLLECTIONS COLLAGE SLIDESHOW
========================================= */

const collageSlides =
    document.querySelectorAll(
        ".collage-slide"
    );


if (collageSlides.length > 1) {

    let currentSlide = 0;


    setInterval(() => {

        collageSlides[currentSlide]
            .classList
            .remove("active");


        currentSlide =
            (currentSlide + 1)
            % collageSlides.length;


        collageSlides[currentSlide]
            .classList
            .add("active");

    }, 4000);

}

/* =========================================
   FOOTER
========================================= */

footer.innerHTML =
    createFooter();









