import { products } from "../data/products.js";
import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "firebase/firestore";

async function importProducts() {
const productsReference = collection(db, "product ID");


try {
    console.log("Checking existing Firebase products...");

    const existingSnapshot = await getDocs(productsReference);

    const existingNames = new Set(
        existingSnapshot.docs
            .map(document => {
                return String(
                    document.data().name || ""
                ).trim().toLowerCase();
            })
            .filter(Boolean)
    );

    let importedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        const productName = product.name.trim().toLowerCase();

        if (existingNames.has(productName)) {
            console.log(`Already exists — skipped: ${product.name}`);
            skippedCount++;
            continue;
        }

        const imageUrls = (product.images || []).map(image => {
            return new URL(image, window.location.origin).href;
        });

        await addDoc(productsReference, {
            name: product.name,
            category: product.category,
            price: product.price,
            images: imageUrls,
            imageUrl: imageUrls[0] || "",
            badge: product.badge,
            description: product.description,
            featured: product.featured,
            tags: product.tags || [],
            stock: 0,
            createdAt: serverTimestamp()
        });

        existingNames.add(productName);
        importedCount++;

        console.log(`Imported successfully: ${product.name}`);
    }

    console.log("--------------------------------");
    console.log("IMPORT FINISHED");
    console.log(`Imported: ${importedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log("--------------------------------");

    alert(
        `Import complete!\n\n` +
        `Imported: ${importedCount}\n` +
        `Skipped: ${skippedCount}\n\n` +
        `Check the browser console for details.`
    );

} catch (error) {
    console.error("Product import failed:", error);

    alert(
        "Product import failed. Check the browser console for the error."
    );
}


}

importProducts();
