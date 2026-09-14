/**
 * Kirti Stationary - Dedicated Product Page Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const ownerNavBtn = document.getElementById('owner-nav-btn');
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

  // Back button setup
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      if (document.referrer && document.referrer.includes(window.location.hostname)) {
        e.preventDefault();
        window.history.back();
      }
    });
  }

  const product = getProductById(productId);
  const settings = getStoreSettings();

  if (!product) {
    renderNotFound();
    return;
  }

  renderProductDetails(product, settings);
  renderRelatedProducts(product);
});

/**
 * Render Product Details onto the DOM
 */
function renderProductDetails(product, settings) {
  document.title = `${product.name} — Kirti Stationary`;

  // Breadcrumbs
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbCategory) breadcrumbCategory.textContent = product.category || 'Stationery';
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Media
  const mainImage = document.getElementById('product-main-image');
  if (mainImage) {
    mainImage.src = product.image || 'assets/images/notebook.jpg';
    mainImage.alt = product.name;
    mainImage.onerror = () => { mainImage.src = 'assets/images/notebook.jpg'; };
  }

  const badgeFloat = document.getElementById('product-badge-float');
  if (badgeFloat) {
    if (product.badge) {
      badgeFloat.innerHTML = `<span class="badge badge-dusty">${escapeHtml(product.badge)}</span>`;
    } else {
      badgeFloat.innerHTML = '';
    }
  }

  // Info
  const categoryTag = document.getElementById('product-category-tag');
  if (categoryTag) categoryTag.textContent = product.category || 'Stationery';

  const productTitle = document.getElementById('product-title');
  if (productTitle) productTitle.textContent = product.name;

  const productPrice = document.getElementById('product-price');
  if (productPrice) productPrice.textContent = formatPrice(product.price);

  const productDesc = document.getElementById('product-description');
  if (productDesc) productDesc.textContent = product.description || 'Quality product available at Kirti Stationary.';

  // Features list
  const featuresBox = document.getElementById('product-features-box');
  const featuresList = document.getElementById('product-features-list');
  if (featuresList && product.features && product.features.length > 0) {
    featuresList.innerHTML = product.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
    if (featuresBox) featuresBox.style.display = 'block';
  } else if (featuresBox) {
    featuresBox.style.display = 'none';
  }

  // Scan to Pay Section
  const qrImage = document.getElementById('upi-qr-image');
  if (qrImage) {
    qrImage.src = settings.qrImage || 'assets/qr/upi-qr.svg';
  }

  const scanPayAmount = document.getElementById('scan-pay-amount');
  if (scanPayAmount) scanPayAmount.textContent = formatPrice(product.price);

  const scanPayInstructionAmount = document.getElementById('scan-pay-instruction-amount');
  if (scanPayInstructionAmount) scanPayInstructionAmount.textContent = formatPrice(product.price);

  const upiIdDisplay = document.getElementById('upi-id-display');
  if (upiIdDisplay) upiIdDisplay.textContent = settings.upiId || 'kirtistationary@upi';

  // Copy UPI Button
  const btnCopyUpi = document.getElementById('btn-copy-upi');
  if (btnCopyUpi) {
    btnCopyUpi.addEventListener('click', () => {
      const upiText = settings.upiId || 'kirtistationary@upi';
      navigator.clipboard.writeText(upiText).then(() => {
        const originalText = btnCopyUpi.innerHTML;
        btnCopyUpi.innerHTML = '✓ Copied!';
        btnCopyUpi.style.backgroundColor = 'var(--dusty-pink)';
        btnCopyUpi.style.color = '#FFFFFF';
        setTimeout(() => {
          btnCopyUpi.innerHTML = originalText;
          btnCopyUpi.style.backgroundColor = '';
          btnCopyUpi.style.color = '';
        }, 2000);
      }).catch(() => {
        alert('UPI ID: ' + upiText);
      });
    });
  }

  // UPI Deep Link for Mobile (Google Pay, PhonePe, Paytm, BHIM)
  const btnUpiMobile = document.getElementById('btn-upi-mobile');
  if (btnUpiMobile) {
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId || 'kirtistationary@upi')}&pn=${encodeURIComponent(settings.storeName || 'Kirti Stationary')}&am=${encodeURIComponent(product.price)}&cu=INR&tn=${encodeURIComponent('Kirti Stationary - ' + product.name)}`;
    btnUpiMobile.href = upiUri;
  }

  // WhatsApp Payment Confirmation Button
  const btnWhatsapp = document.getElementById('btn-whatsapp');
  if (btnWhatsapp) {
    const whatsappMsg = `Hi Kirti Stationary! I am buying "${product.name}" for ${formatPrice(product.price)} via UPI. Please keep it ready for pickup at the shop counter!`;
    const whatsappUrl = `https://wa.me/${encodeURIComponent(settings.whatsappNumber || '919795219654')}?text=${encodeURIComponent(whatsappMsg)}`;
    btnWhatsapp.href = whatsappUrl;
  }

  // Floating WhatsApp Quick Action Button
  const floatingWa = document.getElementById('floating-whatsapp');
  if (floatingWa) {
    const waNumber = settings.whatsappNumber || '919795219654';
    const floatMsg = `Hi Kirti Stationary! I am interested in purchasing "${product.name}" (${formatPrice(product.price)}). Is this in stock for store counter pickup?`;
    floatingWa.href = `https://wa.me/${encodeURIComponent(waNumber)}?text=${encodeURIComponent(floatMsg)}`;
  }
}

/**
 * Render Related Stationery Products
 */
function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;

  const all = getProducts();
  const related = all
    .filter(p => String(p.id) !== String(currentProduct.id))
    .slice(0, 3);

  if (related.length === 0) {
    const section = document.getElementById('related-products-section');
    if (section) section.style.display = 'none';
    return;
  }

  container.innerHTML = related.map(item => `
    <a href="product.html?id=${encodeURIComponent(item.id)}" class="product-card">
      <div class="product-card-image-wrap">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="product-card-image" loading="lazy" onerror="this.src='assets/images/notebook.jpg'">
        ${item.badge ? `<span class="product-card-badge">${escapeHtml(item.badge)}</span>` : ''}
        ${item.category ? `<span class="product-card-category">${escapeHtml(item.category)}</span>` : ''}
      </div>
      <div class="product-card-body">
        <h3 class="product-card-title">${escapeHtml(item.name)}</h3>
        <div class="product-card-footer">
          <div class="product-card-price-block">
            <span class="price-prefix">Price</span>
            <span class="product-card-price">${formatPrice(item.price)}</span>
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
  `).join('');
}

/**
 * Render Not Found State if invalid product ID
 */
function renderNotFound() {
  const mainContainer = document.getElementById('product-detail-container');
  if (mainContainer) {
    mainContainer.innerHTML = `
      <div class="catalog-empty-state" style="max-width:600px; margin: 60px auto;">
        <div class="empty-state-icon">🔍</div>
        <h2 class="empty-state-title">Stationery Item Not Found</h2>
        <p class="empty-state-text">The requested product could not be located in our store catalog. It may have been removed or updated by the owner.</p>
        <a href="index.html" class="btn btn-primary">← Return to Store Catalog</a>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
