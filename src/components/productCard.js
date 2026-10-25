import { formatPrice } from "../js/formatPrice.js";

export function createProductCard(product) {
const productId = String(product.id ?? "");


const images = Array.isArray(product.images)
    ? product.images.filter(
        image => typeof image === "string" && image.trim()
    )
    : [];

const image =
    product.imageUrl ||
    product.image ||
    images[0] ||
    "";

const secondaryImage = images.find(
    item => item !== image
) || "";

const safeId = productId
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeHTML = value =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const safeName = escapeHTML(product.name || "Handmade product");
const safeImage = escapeHTML(image);
const safeSecondaryImage = escapeHTML(secondaryImage);
const safeBadge = escapeHTML(
    product.badge || product.category || "Handmade"
);

return `
    <article class="product-card" data-product-id="${safeId}">

        <div class="product-images">

            ${
                safeImage
                    ? `
                        <img
                            class="primary-image"
                            src="${safeImage}"
                            alt="${safeName}"
                            loading="lazy"
                            onerror="this.alt='Product image unavailable'; this.classList.add('image-load-error');"
                        >
                    `
                    : `
                        <div class="product-image-placeholder">
                            Image unavailable
                        </div>
                    `
            }

            ${
                safeSecondaryImage
                    ? `
                        <img
                            class="secondary-image"
                            src="${safeSecondaryImage}"
                            alt="${safeName}"
                            loading="lazy"
                            onerror="this.style.display='none';"
                        >
                    `
                    : ""
            }

            <button
                type="button"
                class="wishlist-btn"
                data-wishlist-id="${safeId}"
                aria-label="Add to wishlist"
                title="Add to wishlist"
            >
                ♡
            </button>

        </div>

        <div class="product-content">

            <span class="badge">${safeBadge}</span>

            <h3 class="product-title">${safeName}</h3>

            <p class="product-price">
                ${formatPrice(product.price)}
            </p>

            <a
                href="/src/pages/product.html?id=${encodeURIComponent(productId)}"
                class="btn btn-primary w-100"
            >
                View Product
            </a>

        </div>

    </article>
`;


}
