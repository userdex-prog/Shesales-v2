import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.js";

const loginForm = document.getElementById("admin-login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const errorMessage = document.getElementById("admin-login-error");

console.log("Admin login JS loaded");

if (!loginForm) {
    console.error("Admin login form was not found.");
} else {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        errorMessage.hidden = true;
        errorMessage.textContent = "";

        try {

            console.log("Attempting Firebase login...");

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            console.log("Firebase login successful.");

            window.location.href =
                "/src/pages/admin.html";

        } catch (error) {

            console.error(
                "Firebase login error:",
                error
            );

            errorMessage.textContent =
    `${error.code}: ${error.message}`;

            errorMessage.hidden = false;

        }

    });

}