import peonyBag from "../assets/products/peony-bouquet-bag.jpeg";
import roseBag from "../assets/products/rose-bouquet-bag.PNG";
import colourfulBag from "../assets/products/colourful-flower-bag.jpeg";

import sunflower from "../assets/products/sunflower.jpeg";
import sunflower2 from "../assets/products/sunflower-2.jpeg";

export const products = [
    {
        id: 1,
        name: "Peony Bouquet Bag",
        category: "bags",
        price: 59.99,
        images: [peonyBag],
        badge: "Handmade",
        description:
            "A beautifully handcrafted crochet bag inspired by the delicate charm of blooming peonies. Each piece is carefully made with premium materials and thoughtful attention to detail.",
        featured: true,
        tags: ["new", "best"]
    },

    {
        id: 2,
        name: "Rose Bouquet Bag",
        category: "bags",
        price: 59.99,
        images: [roseBag],
        badge: "Handmade",
        description:
            "A timeless crochet bag featuring a romantic rose-inspired design. Handmade with care to create a unique accessory that adds warmth and personality to any outfit.",
        featured: true,
        tags: ["new"]
    },

    {
        id: 3,
        name: "Colorful Flower Bag",
        category: "bags",
        price: 44.99,
        images: [colourfulBag],
        badge: "Handmade",
        description:
            "A cheerful handmade crochet bag decorated with colorful floral details. A playful and versatile piece designed to bring a little joy to your everyday style.",
        featured: true,
        tags: ["best"]
    },

    {
        id: 4,
        name: "Two In One Sunflower Crochet",
        category: "bags",
        price: 1500,
        images: [
            sunflower,
            sunflower2
        ],
        badge: "Handmade",
        description:
            "A unique two-in-one sunflower-inspired crochet creation, carefully handcrafted with beautiful floral details. Designed to combine charm, creativity, and everyday versatility.",
        featured: true,
        tags: ["new", "best"]
    }
];