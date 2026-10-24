/* TEMPORARY FOOTER TEST */

import { createFooter } from "../components/footer.js";

console.log("Footer module loaded.");

const footerContainer = document.querySelector("#footer");

console.log("Footer container:", footerContainer);

if (footerContainer) {
    footerContainer.innerHTML = createFooter();
    console.log("Footer rendered successfully.");
} else {
    console.error("Footer container #footer was not found.");
}