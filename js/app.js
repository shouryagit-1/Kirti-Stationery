/**
 * Kirti Stationary - Homepage Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryChipsContainer = document.getElementById('category-chips');
  const sortSelect = document.getElementById('sort-select');
  const catalogCount = document.getElementById('catalog-count');
  const ownerNavBtn = document.getElementById('owner-nav-btn');

  // Update Owner button text/link based on authentication state
  if (ownerNavBtn) {
    if (isAuthenticated()) {
      ownerNavBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Owner Dashboard
      `;
      ownerNavBtn.href = 'dashboard.html';
    } else {
      ownerNavBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Owner Login
      `;
      ownerNavBtn.href = 'login.html';
    }
  }

  let allProducts = getProducts();
  let currentCategory = 'All';
  let searchQuery = '';
  let currentSort = 'featured';

  // Build category filter chips dynamically
  function setupCategories() {
    if (!categoryChipsContainer) return;

    const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];

    categoryChipsContainer.innerHTML = categories.map(cat => `
      <button type="button" class="category-chip ${cat === currentCategory ? 'active' : ''}" data-category="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `).join('');

    categoryChipsContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        categoryChipsContainer.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderFilteredProducts();
      });
    });
  }

  // Filter and sort products
  function getFilteredProducts() {
    let filtered = allProducts.filter(item => {
      // Category filter
      const matchesCategory = (currentCategory === 'All') || (item.category === currentCategory);

      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (currentSort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }

  // Render product cards
  function renderFilteredProducts() {
    if (!productGrid) return;
    const items = getFilteredProducts();

    if (catalogCount) {
      catalogCount.textContent = `Showing ${items.length} of ${allProducts.length} items`;
    }

    if (items.length === 0) {
      productGrid.innerHTML = `
        <div class="catalog-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">✏️</div>
          <h3 class="empty-state-title">No Stationery Items Found</h3>
          <p class="empty-state-text">We couldn't find any products matching "${escapeHtml(searchQuery)}". Try another search or reset category filters.</p>
          <button type="button" class="btn btn-blush btn-sm" id="reset-filter-btn">View All Products</button>
        </div>
      `;

      const resetBtn = document.getElementById('reset-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          if (searchClearBtn) searchClearBtn.style.display = 'none';
          currentCategory = 'All';
          setupCategories();
          renderFilteredProducts();
        });
      }
      return;
    }

    productGrid.innerHTML = items.map(product => {
      const formattedPrice = formatPrice(product.price);
      const snippet = product.description ? escapeHtml(product.description) : '';
      const badgeHtml = product.badge ? `<span class="product-card-badge">${escapeHtml(product.badge)}</span>` : '';
      const categoryHtml = product.category ? `<span class="product-card-category">${escapeHtml(product.category)}</span>` : '';

      return `
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-card" data-id="${escapeHtml(product.id)}">
          <div class="product-card-image-wrap">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-card-image" loading="lazy" onerror="this.src='assets/images/notebook.jpg'">
            ${badgeHtml}
            ${categoryHtml}
          </div>
          <div class="product-card-body">
            <h3 class="product-card-title">${escapeHtml(product.name)}</h3>
            <p class="product-card-desc-snippet">${snippet}</p>
            <div class="product-card-footer">
              <div class="product-card-price-block">
                <span class="price-prefix">Price</span>
                <span class="product-card-price">${formattedPrice}</span>
              </div>
              <span class="product-card-btn">
                View &amp; Pay
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  // Event Listeners for Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      renderFilteredProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      renderFilteredProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderFilteredProducts();
    });
  }

  // Setup Floating WhatsApp Button
  const floatingWa = document.getElementById('floating-whatsapp');
  if (floatingWa) {
    const settings = getStoreSettings();
    const waNumber = settings.whatsappNumber || '919795219654';
    const floatMsg = 'Hi Kirti Stationary! I am browsing your online catalog and would like to inquire about stationery items.';
    floatingWa.href = `https://wa.me/${encodeURIComponent(waNumber)}?text=${encodeURIComponent(floatMsg)}`;
  }

  // Initial render
  setupCategories();
  renderFilteredProducts();
});

// Utility to escape HTML and prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
