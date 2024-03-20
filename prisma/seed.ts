// @/prisma/seed.ts

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Delete all existing users, categories and products
    await prisma.user.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    
    // Reset autoincrement ID counters
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name="User"');
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name="Category"');
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name="Product"');
    await prisma.$executeRawUnsafe('VACUUM');

    // Define users
    const users = [
        {
            email: "khzhang@ie.cuhk.edu.hk",
            password: "Prof_4210",
            isAdmin: true,
        },
        {
            email: "zj021@ie.cuhk.edu.hk",
            password: "Jiuqin_4210",
            isAdmin: true,
        },
        {
            email: "zy319@ie.cuhk.edu.hk",
            password: "Yutong_4210",
            isAdmin: true,
        },
        {
            email: "cl022@ie.cuhk.edu.hk",
            password: "Lin_4210",
            isAdmin: true,
        },
        {
            email: "1155174712@link.cuhk.edu.hk",
            password: "Niu_4210",
            isAdmin: false,
        },
        {
            email: "4210@security.com",
            password: "with_0_XSS",
            isAdmin: false,
        },
    ];

    // Insert new users
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
            data: {
                email: user.email,
                password: hashedPassword,
                isAdmin: user.isAdmin,
            },
        });
    }

    // Define categories
    const categories = [
        { name: 'Apparel', image: '/apparel.png', link: '/category/apparel' },
        { name: 'Electronics', image: '/electronics.png', link: '/category/electronics' },
        { name: 'Games', image: '/games.png', link: '/category/games' },
        { name: 'Pets', image: '/pets.png', link: '/category/pets' },
        { name: 'Food', image: '/food.png', link: '/category/food' },
        { name: 'Tools', image: '/tools.png', link: '/category/tools' },
        { name: 'Furniture', image: '/furniture.png', link: '/category/furniture' },
        { name: 'Sports', image: '/sports.png', link: '/category/sports' },
        { name: 'Care', image: '/care.png', link: '/category/care' },
    ];

    // Insert new categories
    for (const category of categories) {
        await prisma.category.create({
            data: category,
        });
    }

    // Define products, assuming categories have been created
    const products = [
        {
            name: 'Luxury Wristwatch',
            slug: 'luxury-wristwatch',
            price: 300,
            inventory: 5,
            description: 'A sleek, modern wristwatch with a stainless steel band, large round dial, and a simple yet elegant face. Luxurious appearance, suitable for high-end online stores.',
            categoryId: 1, // 'Apparel'
            image: '/luxury_wristwatch.png',
        },
        {
            name: 'Juniper Faux Fur Coat',
            slug: 'juniper-faux-fur-coat',
            price: 129,
            inventory: 4,
            description: 'A luxurious faux fur coat by Steve Madden, featuring a plush texture and a cozy, oversized fit. Perfect for adding a touch of glamour to any winter outfit.',
            categoryId: 1, // 'Apparel'
            image: '/juniper_faux_fur_coat.png',
        },
        {
            name: '90\'s 501 Jeans',
            slug: '90s-501-jeans',
            price: 98,
            inventory: 8,
            description: 'Classic Levi\'s 501 jeans with a vintage 90\'s cut, offering a timeless look with a high waist and straight leg. Ideal for a casual, retro-inspired style.',
            categoryId: 1, // 'Apparel'
            image: '/90s_501_jeans.png',
        },
        {
            name: 'Dream Ballet Flats',
            slug: 'dream-ballet-flats',
            price: 347,
            inventory: 6,
            description: 'Elegant and comfortable Dream Ballet Flats from Mansur Gavriel, made from soft leather with a minimalist design. Perfect for both casual and formal wear.',
            categoryId: 1, // 'Apparel'
            image: '/dream_ballet_flats.png',
        },
        {
            name: 'Goldtone & Glass Pearls Necklace',
            slug: 'goldtone-glass-pearls-necklace',
            price: 95,
            inventory: 10,
            description: 'A stunning necklace by Lele Sadoughi, featuring gold-tone links with interspersed glass pearls. A sophisticated accessory to elevate any outfit.',
            categoryId: 1, // 'Apparel'
            image: '/goldtone_glass_pearls_necklace.png',
        },
        {
            name: 'Wireless Charging Pad',
            slug: 'wireless-charging-pad',
            price: 60,
            inventory: 7,
            description: 'A modern, sleek wireless charging pad, possibly with a device being charged on it. Futuristic and minimalist design, appealing to tech-savvy customers.',
            categoryId: 2, // 'Electronics'
            image: '/wireless_charging_pad.png',
        },
        {
            name: 'PHOLED Television',
            slug: 'pholed-television',
            price: 1200,
            inventory: 6,
            description: 'The next evolution in OLED technology, featuring vibrant colors and energy-efficient blue phosphorescent material, offering brighter screens and lower energy consumption.',
            categoryId: 2, // 'Electronics'
            image: '/pholed_television.png',
        },
        {
            name: 'Dell CAMM Laptop',
            slug: 'dell-camm-laptop',
            price: 999,
            inventory: 8,
            description: 'A thinner, faster laptop by Dell, utilizing Compression Attached Memory Module (CAMM) for enhanced speed and compactness, revolutionizing portable computing.',
            categoryId: 2, // 'Electronics'
            image: '/dell_camm_laptop.png',
        },
        {
            name: 'Nintendo Next-Gen Console',
            slug: 'nintendo-next-gen-console',
            price: 499,
            inventory: 5,
            description: 'Nintendo\'s upcoming console, promising to blend handheld and TV gaming with a new LCD screen, cartridge-based games, and enhanced performance.',
            categoryId: 2, // 'Electronics'
            image: '/nintendo_next_gen_console.png',
        },
        {
            name: 'Samsung Galaxy S24',
            slug: 'samsung-galaxy-s24',
            price: 999,
            inventory: 7,
            description: 'The latest in Samsung\'s flagship series, expected to feature a larger battery, brighter screen, and maintaining the iconic design with advanced performance upgrades.',
            categoryId: 2, // 'Electronics'
            image: '/samsung_galaxy_s24.png',
        },
        {
            name: 'Meta Ventura VR Headset',
            slug: 'meta-ventura-vr-headset',
            price: 299,
            inventory: 10,
            description: 'A more affordable VR headset by Meta, designed as a Quest 3 Lite with the aim to make virtual reality more accessible without sacrificing quality.',
            categoryId: 2, // 'Electronics'
            image: '/meta_ventura_vr.png',
        },
        {
            name: 'Final Fantasy VII Rebirth',
            slug: 'final-fantasy-vii-rebirth',
            price: 60,
            inventory: 5,
            description: 'The highly anticipated sequel in the Final Fantasy VII Remake series, offering an immersive RPG experience with stunning graphics and an engaging storyline.',
            categoryId: 3, // 'Games'
            image: '/final_fantasy_vii_rebirth.png',
        },
        {
            name: 'Star Wars: Dark Forces Remaster',
            slug: 'star-wars-dark-forces-remaster',
            price: 40,
            inventory: 7,
            description: 'A remastered version of the classic Star Wars first-person shooter, featuring updated graphics and enhanced gameplay mechanics.',
            categoryId: 3, // 'Games'
            image: '/star_wars_dark_forces_remaster.png',
        },
        {
            name: "LEGO Superhero Showdown",
            slug: "lego-superhero-showdown",
            price: 50,
            inventory: 20,
            description: "Dive into the action-packed world of LEGO Superhero Showdown. Build and engage in epic battles between heroes and villains in a vibrant LEGO cityscape. Featuring a variety of minifigures with unique powers and abilities, vehicles, and command centers, this set encourages imaginative play and storytelling. Suitable for fans of all ages who love superhero adventures.",
            categoryId: 3, // 'Games'
            image: "/lego_superhero_showdown.webp",
        },
        {
            name: 'Ahiflower Omega Oil for Dogs',
            slug: 'ahiflower-omega-oil-for-dogs',
            price: 39,
            inventory: 10,
            description: 'A plant-based supplement by WagWell, providing essential omega oils to support joint health and coat shine in dogs, made with sustainable ingredients for eco-conscious pet owners.',
            categoryId: 4, // 'Pets'
            image: '/ahiflower_omega_oil.png',
        },
        {
            name: 'Tavo Pets 3-in-1 Travel System',
            slug: 'tavo-pets-travel-system',
            price: 250,
            inventory: 5,
            description: 'A luxurious pet travel system from Nuna\'s Tavo Pets, featuring a versatile stroller, carrier, and car seat combo, ensuring safety and comfort for your pet on the go.',
            categoryId: 4, // 'Pets'
            image: '/tavo_pets_travel_system.png',
        },
        {
            name: 'Oncotect At-Home Dog Cancer Screening Kit',
            slug: 'oncotect-dog-cancer-screening',
            price: 120,
            inventory: 7,
            description: 'An innovative at-home urine test by Oncotect, designed for early detection of cancer risk factors in dogs, offering peace of mind and proactive health care for pet owners.',
            categoryId: 4, // 'Pets'
            image: '/oncotect_cancer_screening_kit.png',
        },
        {
            name: 'Whistle GPS Pet Tracker and Health Monitor',
            slug: 'whistle-gps-pet-tracker',
            price: 100,
            inventory: 10,
            description: 'A state-of-the-art GPS tracker and health monitor by Whistle, utilizing AI to provide real-time location tracking and health insights for your pet, ensuring their safety and well-being.',
            categoryId: 4, // 'Pets'
            image: '/whistle_gps_tracker.png',
        },
        {
            name: 'Compostable Chew Toys by Augie Bones',
            slug: 'compostable-chew-toys',
            price: 15,
            inventory: 15,
            description: 'Eco-friendly and compostable chew toys by Augie Bones, made from sustainable materials to provide a guilt-free playtime for your pets while caring for the planet.',
            categoryId: 4, // 'Pets'
            image: '/augie_bones_chew_toys.png',
        },
        {
            name: 'Tropical Sparkling Water',
            slug: 'tropical-sparkling-water',
            price: 2.50,
            inventory: 100,
            description: 'A refreshing single-serve, fizzy tropical sparkling water with no added sugar, salt, or synthetic ingredients, featuring exotic flavors and botanicals for a health-conscious consumer.',
            categoryId: 5, // 'Food'
            image: '/tropical_sparkling_water.png',
        },
        {
            name: 'Plant-Based Snack Mix',
            slug: 'plant-based-snack-mix',
            price: 5,
            inventory: 75,
            description: 'A nutritious mix of veggies, pulses, seeds, and nuts, offering a dense alternative to traditional snacks. Perfect for flexitarians looking to incorporate more plant-based options into their diet.',
            categoryId: 5, // 'Food'
            image: '/plant_based_snack_mix.png',
        },
        {
            name: 'Functional Herbal Tea',
            slug: 'functional-herbal-tea',
            price: 4,
            inventory: 50,
            description: 'A functional beverage designed to boost digestion and enhance cognitive function, made from a blend of herbs known for their health benefits, catering to the growing trend of functional health products.',
            categoryId: 5, // 'Food'
            image: '/functional_herbal_tea.png',
        },
        {
            name: 'Calabrian Chili Pepper Sauce',
            slug: 'calabrian-chili-pepper-sauce',
            price: 7,
            inventory: 60,
            description: 'A versatile sauce featuring Calabrian chili peppers, ready to add a vibrant kick to pasta, meats, and snacks, responding to the increasing consumer interest in spicy and exotic flavors.',
            categoryId: 5, // 'Food'
            image: '/calabrian_chili_pepper_sauce.png',
        },
        {
            name: 'Bubble Tea Kit',
            slug: 'bubble-tea-kit',
            price: 15,
            inventory: 40,
            description: 'An at-home bubble tea kit providing all the essentials for making this trendy and flavorful beverage, catering to the little treat culture with an affordable and fun experience.',
            categoryId: 5, // 'Food'
            image: '/bubble_tea_kit.png',
        },
        {
            name: 'Artisanal Coffee Beans',
            slug: 'artisanal-coffee-beans',
            price: 15,
            inventory: 10,
            description: 'High-quality, artisanal coffee beans with a premium design label. The beans are spilling out slightly to showcase their quality, with a warm and inviting background.',
            categoryId: 5, // 'Food'
            image: '/coffee_beans.png',
        },
        {
            name: 'Eco-Friendly Mixed Media Notebook',
            slug: 'eco-friendly-mixed-media-notebook',
            price: 12,
            inventory: 100,
            description: 'An environmentally friendly notebook designed for mixed media use, incorporating creative techniques and sustainable materials, ideal for artists and enthusiasts of tactile stationery.',
            categoryId: 6, // 'Tools'
            image: '/eco_friendly_mixed_media_notebook.png',
        },
        {
            name: 'Vintage Nostalgia Stationery Set',
            slug: 'vintage-nostalgia-stationery-set',
            price: 18,
            inventory: 75,
            description: 'A stationery set featuring romantic vintage designs, bringing the flair of times gone by to your correspondence and journaling, crafted with attention to detail and a nostalgic touch.',
            categoryId: 6, // 'Tools'
            image: '/vintage_nostalgia_stationery_set.png',
        },
        {
            name: 'Colorful Joy Art Supplies',
            slug: 'colorful-joy-art-supplies',
            price: 25,
            inventory: 50,
            description: 'Art supplies bursting with vibrant colors and lively patterns, adding a cheerful touch to your creative projects, perfect for artists and hobbyists looking to infuse joy into their work.',
            categoryId: 6, // 'Tools'
            image: '/colorful_joy_art_supplies.png',
        },
        {
            name: 'Licensed Character Sketchbook',
            slug: 'licensed-character-sketchbook',
            price: 15,
            inventory: 60,
            description: 'A sketchbook featuring popular licensed characters, allowing fans to surround themselves with their idols and heroes while drawing, sketching, or journaling.',
            categoryId: 6, // 'Tools'
            image: '/licensed_character_sketchbook.png',
        },
        {
            name: 'Ripple Credenza',
            slug: 'ripple-credenza',
            price: 950,
            inventory: 5,
            description: 'A midtone blue credenza inspired by oceanic themes, featuring a sleek design that embodies the nature-influenced color trends of the season, perfect for modern and coastal interiors.',
            categoryId: 7, // 'Furniture'
            image: '/ripple_credenza.png',
        },
        {
            name: 'Modern Vases',
            slug: 'modern-vases',
            price: 45,
            inventory: 3,
            description: 'Three minimalist vases of varying heights, with a smooth ceramic finish in neutral colors. Designed for modern home interiors, appealing to a broad range of customers.',
            categoryId: 7, // 'Furniture'
            image: '/vases.png',
        },
        {
            name: "Mid-Century Modern Armchair",
            slug: "mid-century-modern-armchair",
            price: 250,
            inventory: 15,
            description: "Experience timeless elegance with our Mid-Century Modern Armchair. Designed with sleek lines, tapered wooden legs, and a plush, cushioned seat, this armchair combines comfort with the classic mid-century modern aesthetic. Perfect for any contemporary living space, its organic and man-made materials highlight quality craftsmanship. Add a touch of vintage charm to your home with this inviting piece.",
            categoryId: 7, // 'Furniture'
            image: "/mid_century_modern_armchair.webp",
        },
        {
            name: 'Eco-Friendly Yoga Mat',
            slug: 'eco-friendly-yoga-mat',
            price: 50,
            inventory: 100,
            description: 'A sustainable yoga mat made from natural rubber and recycled materials, featuring a non-slip surface and designed with eco-conscious consumers in mind.',
            categoryId: 8, // 'Sports'
            image: '/eco_friendly_yoga_mat.png',
        },
        {
            name: 'Smart Fitness Watch',
            slug: 'smart-fitness-watch',
            price: 199,
            inventory: 50,
            description: 'A high-tech fitness watch with heart rate monitoring, sleep tracking, and personalized workout recommendations, encouraging a healthier lifestyle through technology.',
            categoryId: 8, // 'Sports'
            image: '/smart_fitness_watch.png',
        },
        {
            name: 'Portable Home Gym Kit',
            slug: 'portable-home-gym-kit',
            price: 150,
            inventory: 75,
            description: 'A compact and portable home gym kit that includes resistance bands, a door anchor, and a workout guide, perfect for fitness enthusiasts on the go.',
            categoryId: 8, // 'Sports'
            image: '/portable_home_gym_kit.png',
        },
        {
            name: 'Adventure Sports Helmet',
            slug: 'adventure-sports-helmet',
            price: 120,
            inventory: 60,
            description: 'A durable and lightweight helmet designed for adventure sports enthusiasts, offering superior protection and comfort for activities like mountain biking and rock climbing.',
            categoryId: 8, // 'Sports'
            image: '/adventure_sports_helmet.png',
        },
        {
            name: 'AI-Enhanced Skincare App',
            slug: 'ai-enhanced-skincare-app',
            price: 0.99, // in-app purchases
            inventory: 999, // Digital product
            description: 'An AI-powered app that provides personalized skincare recommendations by analyzing users’ skin types and conditions through uploaded photos. It offers tailored skincare routines, product suggestions, and tracks skin health progress over time.',
            categoryId: 9, // 'Care'
            image: '/ai_enhanced_skincare_app.png',
        },
        {
            name: 'Neuro-Glow Skincare Line',
            slug: 'neuro-glow-skincare',
            price: 60,
            inventory: 100,
            description: 'A skincare line that leverages the power of psychodermatology to enhance the mind-body connection. Formulated with neurocosmetic ingredients that not only improve skin health but also promote mental well-being.',
            categoryId: 9, // 'Care'
            image: '/neuro_glow_skincare.png',
        },
        {
            name: 'Sophisticated Simplicity Shampoo',
            slug: 'sophisticated-simplicity-shampoo',
            price: 25,
            inventory: 75,
            description: 'A high-quality shampoo that embraces the "quiet beauty" trend, focusing on simplicity, quality ingredients, and proven effectiveness. Free from unnecessary additives, this shampoo is suitable for all hair types and emphasizes scalp health and hair nourishment.',
            categoryId: 9, // 'Care'
            image: '/sophisticated_simplicity_shampoo.png',
        },
        {
            name: 'ScentGenie Fragrance Finder',
            slug: 'scentgenie-fragrance-finder',
            price: 0.99,
            inventory: 999, // Digital service
            description: 'An AI-powered fragrance recommendation tool that helps users discover new scents that match their preferences. By describing desired scents in natural language, users receive personalized fragrance suggestions, enhancing the online shopping experience.',
            categoryId: 9, // 'Care'
            image: '/scentgenie_fragrance_finder.png',
        },

    ];

    // Insert new products
    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
