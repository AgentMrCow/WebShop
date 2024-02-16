// @/app/(data)/data.tsx
export interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    thumbnail: string;
    description: string;
    inventory: number;
    category: string;
};

export interface Category {
    id: number;
    name: string;
    link: string;
    image: string;
}

export const products: Product[] = [
    {
        id: 1,
        name: 'Luxury Wristwatch',
        slug: 'luxury-wristwatch',
        price: 300,
        thumbnail: '/luxury_wristwatch.png',
        description: 'A sleek, modern wristwatch with a stainless steel band, large round dial, and a simple yet elegant face. Luxurious appearance, suitable for high-end online stores.',
        inventory: 5,
        category: 'Apparel'
    },
    {
        id: 2,
        name: 'Modern Vases',
        slug: 'modern-vases',
        price: 45,
        thumbnail: '/vases.png',
        description: 'Three minimalist vases of varying heights, with a smooth ceramic finish in neutral colors. Designed for modern home interiors, appealing to a broad range of customers.',
        inventory: 3,
        category: 'Furniture'
    },
    {
        id: 3,
        name: 'Artisanal Coffee Beans',
        slug: 'artisanal-coffee-beans',
        price: 15,
        thumbnail: '/coffee_beans.png',
        description: 'High-quality, artisanal coffee beans with a premium design label. The beans are spilling out slightly to showcase their quality, with a warm and inviting background.',
        inventory: 10,
        category: 'Food'
    },
    {
        id: 4,
        name: 'Wireless Charging Pad',
        slug: 'wireless-charging-pad',
        price: 60,
        thumbnail: '/wireless_charging_pad.png',
        description: 'A modern, sleek wireless charging pad, possibly with a device being charged on it. Futuristic and minimalist design, appealing to tech-savvy customers.',
        inventory: 7,
        category: 'Electronics'
    },
    {
        id: 5,
        name: 'Juniper Faux Fur Coat',
        slug: 'juniper-faux-fur-coat',
        price: 129,
        thumbnail: '/juniper_faux_fur_coat.png',
        description: 'A luxurious faux fur coat by Steve Madden, featuring a plush texture and a cozy, oversized fit. Perfect for adding a touch of glamour to any winter outfit.',
        inventory: 4,
        category: 'Apparel'
    },
    {
        id: 6,
        name: '90\'s 501 Jeans',
        slug: '90s-501-jeans',
        price: 98,
        thumbnail: '/90s_501_jeans.png',
        description: 'Classic Levi\'s 501 jeans with a vintage 90\'s cut, offering a timeless look with a high waist and straight leg. Ideal for a casual, retro-inspired style.',
        inventory: 8,
        category: 'Apparel'
    },
    {
        id: 7,
        name: 'Dream Ballet Flats',
        slug: 'dream-ballet-flats',
        price: 347, // Originally $495, assuming a sale
        thumbnail: '/dream_ballet_flats.png',
        description: 'Elegant and comfortable Dream Ballet Flats from Mansur Gavriel, made from soft leather with a minimalist design. Perfect for both casual and formal wear.',
        inventory: 6,
        category: 'Apparel'
    },
    {
        id: 8,
        name: 'Goldtone & Glass Pearls Necklace',
        slug: 'goldtone-glass-pearls-necklace',
        price: 95,
        thumbnail: '/goldtone_glass_pearls_necklace.png',
        description: 'A stunning necklace by Lele Sadoughi, featuring gold-tone links with interspersed glass pearls. A sophisticated accessory to elevate any outfit.',
        inventory: 10,
        category: 'Apparel'
    },
    {
        id: 9,
        name: 'PHOLED Television',
        slug: 'pholed-television',
        price: 1200,
        thumbnail: '/pholed_television.png',
        description: 'The next evolution in OLED technology, featuring vibrant colors and energy-efficient blue phosphorescent material, offering brighter screens and lower energy consumption.',
        inventory: 6,
        category: 'Electronics'
    },
    {
        id: 10,
        name: 'Dell CAMM Laptop',
        slug: 'dell-camm-laptop',
        price: 999,
        thumbnail: '/dell_camm_laptop.png',
        description: 'A thinner, faster laptop by Dell, utilizing Compression Attached Memory Module (CAMM) for enhanced speed and compactness, revolutionizing portable computing.',
        inventory: 8,
        category: 'Electronics'
    },
    {
        id: 11,
        name: 'Nintendo Next-Gen Console',
        slug: 'nintendo-next-gen-console',
        price: 499,
        thumbnail: '/nintendo_next_gen_console.png',
        description: 'Nintendo\'s upcoming console, promising to blend handheld and TV gaming with a new LCD screen, cartridge-based games, and enhanced performance.',
        inventory: 5,
        category: 'Electronics'
    },
    {
        id: 12,
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        price: 999,
        thumbnail: '/samsung_galaxy_s24.png',
        description: 'The latest in Samsung\'s flagship series, expected to feature a larger battery, brighter screen, and maintaining the iconic design with advanced performance upgrades.',
        inventory: 7,
        category: 'Electronics'
    },
    {
        id: 13,
        name: 'Meta Ventura VR Headset',
        slug: 'meta-ventura-vr-headset',
        price: 299,
        thumbnail: '/meta_ventura_vr.png',
        description: 'A more affordable VR headset by Meta, designed as a Quest 3 Lite with the aim to make virtual reality more accessible without sacrificing quality.',
        inventory: 10,
        category: 'Electronics'
    },
    {
        id: 14,
        name: 'Final Fantasy VII Rebirth',
        slug: 'final-fantasy-vii-rebirth',
        price: 60,
        thumbnail: '/final_fantasy_vii_rebirth.png',
        description: 'The highly anticipated sequel in the Final Fantasy VII Remake series, offering an immersive RPG experience with stunning graphics and an engaging storyline.',
        inventory: 5,
        category: 'Games'
    },
    {
        id: 15,
        name: 'Star Wars: Dark Forces Remaster',
        slug: 'star-wars-dark-forces-remaster',
        price: 40,
        thumbnail: '/star_wars_dark_forces_remaster.png',
        description: 'A remastered version of the classic Star Wars first-person shooter, featuring updated graphics and enhanced gameplay mechanics.',
        inventory: 7,
        category: 'Games'
    },
    {
        id: 16,
        name: 'Ahiflower Omega Oil for Dogs',
        slug: 'ahiflower-omega-oil-for-dogs',
        price: 39,
        thumbnail: '/ahiflower_omega_oil.png',
        description: 'A plant-based supplement by WagWell, providing essential omega oils to support joint health and coat shine in dogs, made with sustainable ingredients for eco-conscious pet owners.',
        inventory: 10,
        category: 'Pets'
    },
    {
        id: 17,
        name: 'Tavo Pets 3-in-1 Travel System',
        slug: 'tavo-pets-travel-system',
        price: 250,
        thumbnail: '/tavo_pets_travel_system.png',
        description: 'A luxurious pet travel system from Nuna\'s Tavo Pets, featuring a versatile stroller, carrier, and car seat combo, ensuring safety and comfort for your pet on the go.',
        inventory: 5,
        category: 'Pets'
    },
    {
        id: 18,
        name: 'Oncotect At-Home Dog Cancer Screening Kit',
        slug: 'oncotect-dog-cancer-screening',
        price: 120,
        thumbnail: '/oncotect_cancer_screening_kit.png',
        description: 'An innovative at-home urine test by Oncotect, designed for early detection of cancer risk factors in dogs, offering peace of mind and proactive health care for pet owners.',
        inventory: 7,
        category: 'Pets'
    },
    {
        id: 19,
        name: 'Whistle GPS Pet Tracker and Health Monitor',
        slug: 'whistle-gps-pet-tracker',
        price: 100,
        thumbnail: '/whistle_gps_tracker.png',
        description: 'A state-of-the-art GPS tracker and health monitor by Whistle, utilizing AI to provide real-time location tracking and health insights for your pet, ensuring their safety and well-being.',
        inventory: 10,
        category: 'Pets'
    },
    {
        id: 20,
        name: 'Compostable Chew Toys by Augie Bones',
        slug: 'compostable-chew-toys',
        price: 15,
        thumbnail: '/augie_bones_chew_toys.png',
        description: 'Eco-friendly and compostable chew toys by Augie Bones, made from sustainable materials to provide a guilt-free playtime for your pets while caring for the planet.',
        inventory: 15,
        category: 'Pets'
    },
    {
        id: 21,
        name: 'Tropical Sparkling Water',
        slug: 'tropical-sparkling-water',
        price: 2.50,
        thumbnail: '/tropical_sparkling_water.png',
        description: 'A refreshing single-serve, fizzy tropical sparkling water with no added sugar, salt, or synthetic ingredients, featuring exotic flavors and botanicals for a health-conscious consumer.',
        inventory: 100,
        category: 'Food'
    },
    {
        id: 22,
        name: 'Plant-Based Snack Mix',
        slug: 'plant-based-snack-mix',
        price: 5,
        thumbnail: '/plant_based_snack_mix.png',
        description: 'A nutritious mix of veggies, pulses, seeds, and nuts, offering a dense alternative to traditional snacks. Perfect for flexitarians looking to incorporate more plant-based options into their diet.',
        inventory: 75,
        category: 'Food'
    },
    {
        id: 23,
        name: 'Functional Herbal Tea',
        slug: 'functional-herbal-tea',
        price: 4,
        thumbnail: '/functional_herbal_tea.png',
        description: 'A functional beverage designed to boost digestion and enhance cognitive function, made from a blend of herbs known for their health benefits, catering to the growing trend of functional health products.',
        inventory: 50,
        category: 'Food'
    },
    {
        id: 24,
        name: 'Calabrian Chili Pepper Sauce',
        slug: 'calabrian-chili-pepper-sauce',
        price: 7,
        thumbnail: '/calabrian_chili_pepper_sauce.png',
        description: 'A versatile sauce featuring Calabrian chili peppers, ready to add a vibrant kick to pasta, meats, and snacks, responding to the increasing consumer interest in spicy and exotic flavors.',
        inventory: 60,
        category: 'Food'
    },
    {
        id: 25,
        name: 'Bubble Tea Kit',
        slug: 'bubble-tea-kit',
        price: 15,
        thumbnail: '/bubble_tea_kit.png',
        description: 'An at-home bubble tea kit providing all the essentials for making this trendy and flavorful beverage, catering to the little treat culture with an affordable and fun experience.',
        inventory: 40,
        category: 'Food'
    },
    {
        id: 26,
        name: 'Eco-Friendly Mixed Media Notebook',
        slug: 'eco-friendly-mixed-media-notebook',
        price: 12,
        thumbnail: '/eco_friendly_mixed_media_notebook.png',
        description: 'An environmentally friendly notebook designed for mixed media use, incorporating creative techniques and sustainable materials, ideal for artists and enthusiasts of tactile stationery.',
        inventory: 100,
        category: 'Tools'
    },
    {
        id: 27,
        name: 'Vintage Nostalgia Stationery Set',
        slug: 'vintage-nostalgia-stationery-set',
        price: 18,
        thumbnail: '/vintage_nostalgia_stationery_set.png',
        description: 'A stationery set featuring romantic vintage designs, bringing the flair of times gone by to your correspondence and journaling, crafted with attention to detail and a nostalgic touch.',
        inventory: 75,
        category: 'Tools'
    },
    {
        id: 28,
        name: 'Colorful Joy Art Supplies',
        slug: 'colorful-joy-art-supplies',
        price: 25,
        thumbnail: '/colorful_joy_art_supplies.png',
        description: 'Art supplies bursting with vibrant colors and lively patterns, adding a cheerful touch to your creative projects, perfect for artists and hobbyists looking to infuse joy into their work.',
        inventory: 50,
        category: 'Tools'
    },
    {
        id: 29,
        name: 'Licensed Character Sketchbook',
        slug: 'licensed-character-sketchbook',
        price: 15,
        thumbnail: '/licensed_character_sketchbook.png',
        description: 'A sketchbook featuring popular licensed characters, allowing fans to surround themselves with their idols and heroes while drawing, sketching, or journaling.',
        inventory: 60,
        category: 'Tools'
    },
    {
        id: 30,
        name: 'Ripple Credenza',
        slug: 'ripple-credenza',
        price: 950,
        thumbnail: '/ripple_credenza.png',
        description: 'A midtone blue credenza inspired by oceanic themes, featuring a sleek design that embodies the nature-influenced color trends of the season, perfect for modern and coastal interiors.',
        inventory: 5,
        category: 'Furniture'
    },
    {
        id: 31,
        name: 'Eco-Friendly Yoga Mat',
        slug: 'eco-friendly-yoga-mat',
        price: 50,
        thumbnail: '/eco_friendly_yoga_mat.png',
        description: 'A sustainable yoga mat made from natural rubber and recycled materials, featuring a non-slip surface and designed with eco-conscious consumers in mind.',
        inventory: 100,
        category: 'Sports'
    },
    {
        id: 32,
        name: 'Smart Fitness Watch',
        slug: 'smart-fitness-watch',
        price: 199,
        thumbnail: '/smart_fitness_watch.png',
        description: 'A high-tech fitness watch with heart rate monitoring, sleep tracking, and personalized workout recommendations, encouraging a healthier lifestyle through technology.',
        inventory: 50,
        category: 'Sports'
    },
    {
        id: 33,
        name: 'Portable Home Gym Kit',
        slug: 'portable-home-gym-kit',
        price: 150,
        thumbnail: '/portable_home_gym_kit.png',
        description: 'A compact and portable home gym kit that includes resistance bands, a door anchor, and a workout guide, perfect for fitness enthusiasts on the go.',
        inventory: 75,
        category: 'Sports'
    },
    {
        id: 34,
        name: 'Adventure Sports Helmet',
        slug: 'adventure-sports-helmet',
        price: 120,
        thumbnail: '/adventure_sports_helmet.png',
        description: 'A durable and lightweight helmet designed for adventure sports enthusiasts, offering superior protection and comfort for activities like mountain biking and rock climbing.',
        inventory: 60,
        category: 'Sports'
    },
    {
        id: 35,
        name: 'AI-Enhanced Skincare App',
        slug: 'ai-enhanced-skincare-app',
        price: 0.99, // in-app purchases
        thumbnail: '/ai_enhanced_skincare_app.png',
        description: 'An AI-powered app that provides personalized skincare recommendations by analyzing users’ skin types and conditions through uploaded photos. It offers tailored skincare routines, product suggestions, and tracks skin health progress over time.',
        inventory: 999, // Digital product
        category: 'Care'
    },
    {
        id: 36,
        name: 'Neuro-Glow Skincare Line',
        slug: 'neuro-glow-skincare',
        price: 60,
        thumbnail: '/neuro_glow_skincare.png',
        description: 'A skincare line that leverages the power of psychodermatology to enhance the mind-body connection. Formulated with neurocosmetic ingredients that not only improve skin health but also promote mental well-being.',
        inventory: 100,
        category: 'Care'
    },
    {
        id: 37,
        name: 'Sophisticated Simplicity Shampoo',
        slug: 'sophisticated-simplicity-shampoo',
        price: 25,
        thumbnail: '/sophisticated_simplicity_shampoo.png',
        description: 'A high-quality shampoo that embraces the "quiet beauty" trend, focusing on simplicity, quality ingredients, and proven effectiveness. Free from unnecessary additives, this shampoo is suitable for all hair types and emphasizes scalp health and hair nourishment.',
        inventory: 75,
        category: 'Care'
    },
    {
        id: 38,
        name: 'ScentGenie Fragrance Finder',
        slug: 'scentgenie-fragrance-finder',
        price: 0.99,
        thumbnail: '/scentgenie_fragrance_finder.png',
        description: 'An AI-powered fragrance recommendation tool that helps users discover new scents that match their preferences. By describing desired scents in natural language, users receive personalized fragrance suggestions, enhancing the online shopping experience.',
        inventory: 999, // Digital service
        category: 'Care'
    }
];

export const categories: Category[] = [
    {
        id: 1,
        name: 'Apparel',
        image: '/apparel.png',
        link: '/category/apparel'
    },
    {
        id: 2,
        name: 'Electronics',
        image: '/electronics.png',
        link: '/category/electronics'
    },
    {
        id: 3,
        name: 'Games',
        image: '/games.png',
        link: '/category/games'
    },
    {
        id: 4,
        name: 'Pets',
        image: '/pets.png',
        link: '/category/pets'
    },
    {
        id: 5,
        name: 'Food',
        image: '/food.png',
        link: '/category/food'
    },
    {
        id: 6,
        name: 'Tools',
        image: '/tools.png',
        link: '/category/tools'
    },
    {
        id: 7,
        name: 'Furniture',
        image: '/furniture.png',
        link: '/category/furniture'
    },
    {
        id: 8,
        name: 'Sports',
        image: '/sports.png',
        link: '/category/sports'
    },
    {
        id: 9,
        name: 'Care',
        image: '/care.png',
        link: '/category/care'
    }
];