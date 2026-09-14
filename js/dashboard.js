/**
 * Kirti Stationary - Owner Dashboard Management Logic
 * Simple, non-technical catalog management (Add, Edit, Delete, UPI Settings).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce private owner login protection
  requireAuth();

  // Elements
  const productsTableBody = document.getElementById('products-table-body');
  const totalProductsCount = document.getElementById('stat-total-products');
  const totalCategoriesCount = document.getElementById('stat-total-categories');
  const dashboardSearch = document.getElementById('dashboard-search');
  const btnAddNew = document.getElementById('btn-add-new-product');
  const btnLogout = document.getElementById('btn-logout');
  const btnResetCatalog = document.getElementById('btn-reset-catalog');
  const btnUpiSettings = document.getElementById('btn-upi-settings');
  const toastNotice = document.getElementById('toast-notice');

  // Product Modal Elements
  const productModal = document.getElementById('product-modal');
  const productModalTitle = document.getElementById('modal-title');
  const productForm = document.getElementById('product-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const productIdInput = document.getElementById('form-product-id');
  const productNameInput = document.getElementById('form-product-name');
  const productCategoryInput = document.getElementById('form-product-category');
  const productPriceInput = document.getElementById('form-product-price');
  const productDescInput = document.getElementById('form-product-desc');
  const productImageInput = document.getElementById('form-product-image-file');
  const previewImg = document.getElementById('preview-img');
  const previewPlaceholder = document.getElementById('preview-placeholder');

  // Delete Confirmation Modal Elements
  const deleteModal = document.getElementById('delete-modal');
  const deleteProductName = document.getElementById('delete-product-name');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  let productToDeleteId = null;

  // Settings Modal Elements
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  const settingsUpiIdInput = document.getElementById('settings-upi-id');
  const settingsPhoneInput = document.getElementById('settings-phone');
  const settingsModalClose = document.getElementById('settings-modal-close');
  const settingsModalCancel = document.getElementById('settings-modal-cancel');

  let currentImageData = 'assets/images/notebook.jpg';
  let searchTerm = '';

  // Toast Notification Helper
  function showToast(message, isError = false) {
    if (!toastNotice) return;
    toastNotice.textContent = message;
    toastNotice.style.backgroundColor = isError ? '#D32F2F' : '#2E7D32';
    toastNotice.style.display = 'block';
    setTimeout(() => {
      toastNotice.style.display = 'none';
    }, 3000);
  }

  // Update Stats Counters
  function refreshStats() {
    const products = getProducts();
    if (totalProductsCount) totalProductsCount.textContent = products.length;
    if (totalCategoriesCount) {
      const cats = new Set(products.map(p => p.category).filter(Boolean));
      totalCategoriesCount.textContent = cats.size;
    }
  }

  // Render Product Rows
  function renderProductsTable() {
    const products = getProducts();
    refreshStats();

    const filtered = products.filter(p => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) ||
             (p.category && p.category.toLowerCase().includes(q)) ||
             (p.description && p.description.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 40px; color: var(--charcoal-gray);">
            No products found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = filtered.map(product => `
      <tr data-id="${escapeHtml(product.id)}">
        <td style="width: 70px;">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="table-thumb" onerror="this.src='assets/images/notebook.jpg'">
        </td>
        <td>
          <div class="table-product-title">${escapeHtml(product.name)}</div>
          <div class="table-product-desc">${escapeHtml(product.description || '')}</div>
        </td>
        <td>
          <span class="badge badge-gray">${escapeHtml(product.category || 'General')}</span>
        </td>
        <td>
          <span class="table-price-badge">${formatPrice(product.price)}</span>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-action-edit" data-id="${escapeHtml(product.id)}" title="Edit Product">
              ✏️ Edit
            </button>
            <button type="button" class="btn-action-delete" data-id="${escapeHtml(product.id)}" title="Delete Product">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Edit Handlers
    productsTableBody.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Attach Delete Handlers
    productsTableBody.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteModal(id);
      });
    });
  }

  // Open Modal to Add Product
  function openAddModal() {
    productIdInput.value = '';
    productForm.reset();
    productModalTitle.textContent = 'Add New Stationery Product';
    currentImageData = 'assets/images/notebook.jpg';
    updateImagePreview(currentImageData);
    productModal.style.display = 'flex';
    productNameInput.focus();
  }

  // Open Modal to Edit Product
  function openEditModal(id) {
    const product = getProductById(id);
    if (!product) return;

    productIdInput.value = product.id;
    productNameInput.value = product.name;
    productCategoryInput.value = product.category || 'Notebooks & Registers';
    productPriceInput.value = product.price;
    productDescInput.value = product.description || '';

    currentImageData = product.image || 'assets/images/notebook.jpg';
    updateImagePreview(currentImageData);

    productModalTitle.textContent = `Edit: ${product.name}`;
    productModal.style.display = 'flex';
    productNameInput.focus();
  }

  function closeProductModal() {
    productModal.style.display = 'none';
  }

  function updateImagePreview(src) {
    if (src) {
      previewImg.src = src;
      previewImg.style.display = 'block';
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    } else {
      previewImg.style.display = 'none';
      if (previewPlaceholder) previewPlaceholder.style.display = 'block';
    }
  }

  // Handle Photo File Upload
  if (productImageInput) {
    productImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }

      // Check size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert('Image is too large. Please select a photo under 4MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        currentImageData = loadEvt.target.result;
        updateImagePreview(currentImageData);
      };
      reader.readAsDataURL(file);
    });
  }

  // Sample photo picker buttons inside modal
  document.querySelectorAll('.sample-photo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const samplePath = btn.getAttribute('data-img');
      currentImageData = samplePath;
      updateImagePreview(samplePath);
    });
  });

  // Save / Update Form Submission
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = productNameInput.value.trim();
      const price = parseFloat(productPriceInput.value);
      const category = productCategoryInput.value;
      const description = productDescInput.value.trim();
      const editId = productIdInput.value;

      if (!name) {
        alert('Please enter a product name.');
        productNameInput.focus();
        return;
      }

      if (isNaN(price) || price < 0) {
        alert('Please enter a valid price in Rupees.');
        productPriceInput.focus();
        return;
      }

      if (editId) {
        // Update existing product
        const updated = updateProduct(editId, {
          name,
          price,
          category,
          description,
          image: currentImageData
        });

        if (updated) {
          showToast('✓ Product updated successfully!');
        } else {
          showToast('Failed to update product.', true);
        }
      } else {
        // Add new product
        addProduct({
          name,
          price,
          category,
          description,
          image: currentImageData,
          features: [
            '100% Genuine stationery product',
            'Available for immediate pickup at Kirti Stationary'
          ]
        });
        showToast('✓ New product added to store catalog!');
      }

      closeProductModal();
      renderProductsTable();
    });
  }

  // Delete Modal Operations
  function openDeleteModal(id) {
    const product = getProductById(id);
    if (!product) return;
    productToDeleteId = id;
    deleteProductName.textContent = product.name;
    deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    deleteModal.style.display = 'none';
    productToDeleteId = null;
  }

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', () => {
      if (productToDeleteId) {
        deleteProduct(productToDeleteId);
        showToast('Product removed from store.');
        closeDeleteModal();
        renderProductsTable();
      }
    });
  }

  if (btnCancelDelete) {
    btnCancelDelete.addEventListener('click', closeDeleteModal);
  }

  // UPI Settings Modal
  function openSettingsModal() {
    const settings = getStoreSettings();
    settingsUpiIdInput.value = settings.upiId || 'kirtistationary@upi';
    settingsPhoneInput.value = settings.phone || '+91 97952 19654';
    settingsModal.style.display = 'flex';
  }

  function closeSettingsModal() {
    settingsModal.style.display = 'none';
  }

  if (btnUpiSettings) {
    btnUpiSettings.addEventListener('click', openSettingsModal);
  }

  if (settingsModalClose) settingsModalClose.addEventListener('click', closeSettingsModal);
  if (settingsModalCancel) settingsModalCancel.addEventListener('click', closeSettingsModal);

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUpi = settingsUpiIdInput.value.trim();
      const newPhone = settingsPhoneInput.value.trim() || '+91 97952 19654';

      if (!newUpi) {
        alert('Please enter a valid UPI ID (e.g. yourname@upi).');
        return;
      }

      const cleanDigits = newPhone.replace(/\D/g, '');
      const waNumber = cleanDigits.length === 10 ? '91' + cleanDigits : cleanDigits;

      updateStoreSettings({
        upiId: newUpi,
        phone: newPhone,
        whatsappNumber: waNumber || '919795219654'
      });

      showToast('✓ Store settings saved successfully!');
      closeSettingsModal();
    });
  }

  // Modal Closers
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeProductModal);
  if (btnAddNew) btnAddNew.addEventListener('click', openAddModal);

  // Search Filter in Dashboard
  if (dashboardSearch) {
    dashboardSearch.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderProductsTable();
    });
  }

  // Reset to default catalog
  if (btnResetCatalog) {
    btnResetCatalog.addEventListener('click', () => {
      if (confirm('Restore the default stationery catalog? This will reset all demo products.')) {
        resetToDefaultCatalog();
        showToast('Store catalog restored to default.');
        renderProductsTable();
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of the owner dashboard?')) {
        logout();
      }
    });
  }

  // Initial Table Render
  renderProductsTable();
});

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
