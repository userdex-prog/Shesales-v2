import { formatPrice } from "../js/formatPrice.js";

export function createProductCard(product) {
const productId = String(product.id);


const image =
    product.imageUrl ||
    product.image ||
    (Array.isArray(product.images) ? product.images[0] : "") ||
    "";

const secondaryImage =
    Array.isArray(product.images) && product.images.length > 1
        ? product.images[1]
        : "";

const safeId = productId.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

return `
    <article class="product-card" data-product-id="${safeId}">

        <div class="product-images">

            <img
                class="primary-image"
                src="${image}"
                alt="${product.name}"
                loading="lazy"
                onerror="this.style.display='none';"
            >

            ${
                secondaryImage
                    ? `
                        <img
                            class="secondary-image"
                            src="${secondaryImage}"
                            alt="${product.name}"
                            loading="lazy"
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

            <span class="badge">
                ${product.badge || product.category || "Handmade"}
            </span>

            <h3 class="product-title">
                ${product.name}
            </h3>

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
