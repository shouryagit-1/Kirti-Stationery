/**
 * Kirti Stationary - Product Data & Storage Management
 * Handles local catalog persistence, default seed data, and CRUD operations.
 */

const STORAGE_KEY_PRODUCTS = 'kirti_stationary_products';
const STORAGE_KEY_SETTINGS = 'kirti_stationary_settings';

const DEFAULT_SETTINGS = {
  storeName: 'Kirti Stationary',
  upiId: 'kirtistationary@upi',
  ownerName: 'Mr. Kirti',
  phone: '+91 97952 19654',
  whatsappNumber: '919795219654',
  address: 'Kirti Stationery, Dakshin lane-1, Naya Vihar Colony',
  timings: 'Mon - Sat: 9:30 AM – 9:00 PM | Sun: 10:00 AM – 2:00 PM',
  qrImage: 'assets/qr/upi-qr.svg'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Classmate Pulse Pastel Spiral Notebook (A4, 300 Pages)',
    price: 180,
    category: 'Notebooks & Registers',
    image: 'assets/images/notebook.jpg',
    description: 'Premium college and school notebook featuring high-grade 70 GSM elemental chlorine-free paper. Smooth ruled ruling with durable twin-wire spiral binding and a soft protective lavender-pink cover.',
    features: [
      '300 Ruled Pages (Single Line)',
      'High brightness 70 GSM paper prevents ink bleed',
      'Sturdy snag-free wirebound binding',
      'Tear-off micro-perforated sheets'
    ],
    inStock: true,
    badge: 'Bestseller'
  },
  {
    id: 'prod-2',
    name: 'Sarasa Clip Japanese Quick-Dry Gel Pens (Set of 10 Assorted)',
    price: 260,
    category: 'Pens & Writing',
    image: 'assets/images/pens.jpg',
    description: 'Ultra-smooth water-based pigment gel pens featuring rubber grip and flexible spring clip. Vivid, smudge-proof, and water-resistant ink ideal for students, note-taking, and journaling.',
    features: [
      '10 Vibrant Colors with 0.5mm needle point',
      'Rapid-dry smudge-proof pigment ink',
      'Comfortable rubberized ergonomic grip',
      'Spring-loaded binder push clip'
    ],
    inStock: true,
    badge: 'Popular'
  },
  {
    id: 'prod-3',
    name: 'Schmincke-Style Artist Watercolor Paint Cake Pan (24 Shades with Brush)',
    price: 340,
    category: 'Art & Craft',
    image: 'assets/images/watercolors.jpg',
    description: 'Professional grade student & artist watercolor cakes in a portable metal enameled tin. Richly pigmented, effortless blendability, non-toxic, and comes with a natural hair round artist paintbrush.',
    features: [
      '24 Rich & Vibrant cake pans',
      'Includes premium wooden round watercolor brush',
      'Durable metal travel tin with mixing palettes',
      'Conforms to child-safe non-toxic standards'
    ],
    inStock: true,
    badge: 'Art Pick'
  },
  {
    id: 'prod-4',
    name: 'Aesthetic Pastel Sticky Notes & Marker Tabs (Full Study Kit)',
    price: 140,
    category: 'School & Office',
    image: 'assets/images/stickynotes.jpg',
    description: 'Complete aesthetic study and desk set including 6 pastel square memo note pads, bookmark index tabs, and mini pastel highlighters. Sticks firmly without leaving any adhesive residue.',
    features: [
      '400 Total Pastel Sticky Sheets & Page Flags',
      'Includes dual-tip cute pocket highlighters',
      'Repositionable, residue-free clean peel',
      'Perfect for textbooks, planners, and revisions'
    ],
    inStock: true,
    badge: 'Trending'
  },
  {
    id: 'prod-5',
    name: 'Precision Metal Mathematical Geometry Instrument Box',
    price: 210,
    category: 'Geometry & Math',
    image: 'assets/images/geometry.jpg',
    description: 'Heavy-duty die-cast metal geometry set for school and technical drawing. Includes self-centering compass, divider, 15cm stainless ruler, mechanical pencil, eraser, and mini sharpener in a protective case.',
    features: [
      'Die-cast zinc compass with auto-lock grip',
      '15cm clear laser-etched stainless steel ruler',
      'Precision mechanical 0.5mm drawing pencil',
      'Shockproof metal embossed storage tin'
    ],
    inStock: true,
    badge: 'School Essential'
  },
  {
    id: 'prod-6',
    name: 'Minimalist Hardbound 2026 Daily Planner & Ribbon Journal',
    price: 390,
    category: 'Planners & Diaries',
    image: 'assets/images/planner.jpg',
    description: 'Elegantly crafted hardbound journal in signature dusty rose fabric texture with gold foil debossed lettering. Features 100 GSM fountain-pen friendly ivory paper, ribbon bookmark, and elastic closure band.',
    features: [
      'Undated daily schedule & task layout',
      'Thick 100 GSM bleed-resistant ivory sheets',
      'Satin bookmark ribbon & expandable back pocket',
      'Lays completely flat 180° for effortless writing'
    ],
    inStock: true,
    badge: 'Premium'
  },
  {
    id: 'prod-7',
    name: 'Multi-Compartment Mesh Metal Desk Organizer Caddy',
    price: 320,
    category: 'Desk Accessories',
    image: 'assets/images/organizer.jpg',
    description: 'Modern black wire mesh organizer with 6 deep divided compartments and a pull-out sliding drawer. Keeps pens, markers, scissors, paperclips, and memo pads neat and clutter-free on any study desk.',
    features: [
      '6 upright pencil/tool slots + pull-out drawer',
      'Anti-rust powder coated stainless steel wire mesh',
      'Rubber padded base protects desk surface',
      'Compact footprint: 22cm x 14cm x 13cm'
    ],
    inStock: true,
    badge: 'Office Must-have'
  }
];

// Initialize store in localStorage if not already present
function initStore() {
  if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
}

// Ensure store is seeded upon script loading
initStore();

/**
 * Get all products
 * @returns {Array} Array of product objects
 */
function getProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
  } catch (err) {
    console.error('Error reading products from localStorage:', err);
    return DEFAULT_PRODUCTS;
  }
}

/**
 * Get a single product by ID
 * @param {string} id 
 * @returns {Object|null} Product object or null
 */
function getProductById(id) {
  const products = getProducts();
  return products.find(p => String(p.id) === String(id)) || null;
}

/**
 * Add a new product
 * @param {Object} product 
 * @returns {Object} Added product with generated id
 */
function addProduct(product) {
  const products = getProducts();
  const newProduct = {
    id: 'prod-' + Date.now(),
    name: product.name ? product.name.trim() : 'New Stationery Item',
    price: Number(product.price) || 0,
    category: product.category || 'General Stationery',
    image: product.image || 'assets/images/notebook.jpg',
    description: product.description ? product.description.trim() : 'Quality stationery item available at Kirti Stationary.',
    features: Array.isArray(product.features) ? product.features : [],
    inStock: product.inStock !== false,
    badge: product.badge || 'New',
    createdAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  return newProduct;
}

/**
 * Update an existing product
 * @param {string} id 
 * @param {Object} updatedData 
 * @returns {boolean} Success status
 */
function updateProduct(id, updatedData) {
  const products = getProducts();
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;

  products[index] = {
    ...products[index],
    name: updatedData.name ? updatedData.name.trim() : products[index].name,
    price: Number(updatedData.price) >= 0 ? Number(updatedData.price) : products[index].price,
    category: updatedData.category || products[index].category,
    image: updatedData.image || products[index].image,
    description: updatedData.description !== undefined ? updatedData.description.trim() : products[index].description,
    features: updatedData.features || products[index].features,
    inStock: updatedData.inStock !== undefined ? updatedData.inStock : products[index].inStock,
    badge: updatedData.badge !== undefined ? updatedData.badge : products[index].badge,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  return true;
}

/**
 * Delete a product by ID
 * @param {string} id 
 * @returns {boolean} Success status
 */
function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => String(p.id) !== String(id));
  if (filtered.length === products.length) return false;

  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
  return true;
}

/**
 * Reset catalog back to factory default products
 */
function resetToDefaultCatalog() {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
}

/**
 * Get store settings
 */
function getStoreSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.phone === '+91 98765 43210') parsed.phone = DEFAULT_SETTINGS.phone;
      if (parsed.whatsappNumber === '919876543210') parsed.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
      if (parsed.address === 'Shop No. 4, Market Complex, Near Central School, Station Road') parsed.address = DEFAULT_SETTINGS.address;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update store settings
 */
function updateStoreSettings(newSettings) {
  const current = getStoreSettings();
  const merged = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));
  return merged;
}

/**
 * Format Indian Rupee currency
 * @param {number} price 
 * @returns {string} Formatted price string (e.g. "₹180")
 */
function formatPrice(price) {
  const num = Number(price) || 0;
  return '₹' + num.toLocaleString('en-IN');
}
