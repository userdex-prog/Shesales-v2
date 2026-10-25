import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
build: {
rollupOptions: {
input: {
home: resolve(__dirname, "index.html"),
about: resolve(__dirname, "src/pages/about.html"),
marketplace: resolve(__dirname, "src/pages/marketplace.html"),
product: resolve(__dirname, "src/pages/product.html"),
wishlist: resolve(__dirname, "src/pages/wishlist.html"),
cart: resolve(__dirname, "src/pages/cart.html"),
checkout: resolve(__dirname, "src/pages/checkout.html"),
login: resolve(__dirname, "src/pages/login.html"),
adminLogin: resolve(__dirname, "src/pages/admin-login.html"),
admin: resolve(__dirname, "src/pages/admin.html"),
policies: resolve(__dirname, "src/pages/policies.html"),
search: resolve(__dirname, "src/pages/search.html"),
importProducts: resolve(__dirname, "src/pages/import-products.html")
}
}
}
});
