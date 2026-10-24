import { createNavbar } from "../components/navbar.js";
import { createFooter } from "../components/footer.js";

const header = document.querySelector("#header");
const footer = document.querySelector("footer");

if (header) {
header.innerHTML = createNavbar();
}

if (footer) {
footer.innerHTML = createFooter();
}
