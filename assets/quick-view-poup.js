class ProductPopup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.popup = this.querySelector('.popup');
    this.image = this.querySelector('#popup-image');
    this.productTitle = this.querySelector('#popup-title');
    this.price = this.querySelector('#popup-price');
    this.description = this.querySelector('#popup-description');
    this.addToCartBtn = this.querySelector('#popup-add-to-cart');
    this.errorMessage = this.querySelector('#popup-error-message');

    // Close button
    const closeBtn = this.querySelector('.close-popup');
    closeBtn?.addEventListener('click', () => {
      this.popup.classList.remove('show');
      this.clearError();
    });

    // Add to Cart button click handler
    this.addToCartBtn?.addEventListener('click', () => {
      this.clearError();
      const variantId = this.getSelectedVariantId();

      if (!this.selectedColor && !this.selectedSize) {
        this.showError('Please select a color and size.');
        return;
      } else if (!this.selectedColor) {
        this.showError('Please select a color.');
        return;
      } else if (!this.selectedSize) {
        this.showError('Please select a size.');
        return;
      }

      if (!variantId) {
        this.showError('Selected variant is not available.');
        return;
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
        .then(res => res.json())
        .then(() => {
          alert('Added to cart!');
          this.popup.classList.remove('show');
          window.location.href = '/cart';
        })
        .catch(() => alert('Failed to add to cart.'));
    });

    // Size dropdown elements
    this.sizeDropdown = this.querySelector('.size-dropdown');
    this.sizeSelectToggle = this.querySelector('.size-select-toggle');
    this.sizeSelectedText = this.querySelector('.size-selected-text');
    this.sizeOptionsList = this.querySelector('.size-options-list');

    // Toggle dropdown open/close
    this.sizeSelectToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.sizeOptionsList.classList.toggle('open');
      this.sizeSelectToggle.querySelector('.size-select-arrow').classList.toggle('rotated');
    });

    // Update selected size text on option click + visual highlight
    this.sizeOptionsList.addEventListener('click', (event) => {
      if (event.target.classList.contains('size-option')) {
        this.sizeSelectedText.textContent = event.target.textContent;
        this.selectedSize = event.target.textContent;

        this.sizeOptionsList.querySelectorAll('.size-option').forEach(li => li.classList.remove('selected'));
        event.target.classList.add('selected');

        this.sizeOptionsList.classList.remove('open');
        this.sizeSelectToggle.querySelector('.size-select-arrow').classList.remove('rotated');

        this.clearError();
      }
    });

    // Close dropdown if clicking outside
    document.addEventListener('click', (event) => {
      if (this.sizeDropdown && !this.sizeDropdown.contains(event.target)) {
        this.sizeOptionsList.classList.remove('open');
        this.sizeSelectToggle.querySelector('.size-select-arrow').classList.remove('rotated');
      }
    });

    // Color option click handler clears errors
    const colorContainer = this.querySelector('#color-swatch-container');
    colorContainer?.addEventListener('click', () => {
      this.clearError();
    });
  }

  showProduct(handle) {
    fetch(`/products/${handle}.js`)
      .then(res => res.json())
      .then(product => {
        this.product = product;
        this.productTitle.textContent = product.title;
        this.price.textContent = window.formatMoney(product.price);
        this.description.innerHTML = product.description;
        this.image.src = product.featured_image;
        this.image.alt = product.title;

        this.buildColorOptions(product.options);
        this.buildSizeOptions(product.options);

        this.popup.classList.add('show');
        this.clearError();
      })
      .catch(() => alert('Could not load product. Please try again.'));
  }

  getSelectedVariantId() {
    const color = this.selectedColor;
    const size = this.selectedSize;

    if (!color || !size) return null;

    // Assumes option1 = size, option2 = color; adjust if needed
    const matched = this.product.variants.find(v => v.option1 === size && v.option2 === color);

    return matched?.id || null;
  }

  buildColorOptions(options) {
    const colorContainer = this.querySelector('#color-swatch-container');
    if (!colorContainer) return;

    const colorOption = options.find(o => o.name.toLowerCase() === 'color');
    if (!colorOption) return;

    colorContainer.innerHTML = '';

    colorOption.values.forEach((color, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-btn';
      btn.textContent = color;
      btn.dataset.color = color;
      btn.style.setProperty('--swatch-color', color.toLowerCase());

      btn.addEventListener('click', () => {
        colorContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedColor = color;
        this.clearError();
      });

      colorContainer.appendChild(btn);
    });
  }

  buildSizeOptions(options) {
    const sizeOption = options.find(o => o.name.toLowerCase() === 'size');
    if (!sizeOption) return;

    this.sizeOptionsList.innerHTML = '';
    this.sizeSelectedText.textContent = 'Choose your size';
    this.selectedSize = null;

    sizeOption.values.forEach((size) => {
      const li = document.createElement('li');
      li.className = 'size-option';
      li.textContent = size;
      this.sizeOptionsList.appendChild(li);
    });

    // If only one size, select it automatically
    if (sizeOption.values.length === 1) {
      const singleSize = sizeOption.values[0];
      this.sizeSelectedText.textContent = singleSize;
      this.selectedSize = singleSize;

      // Highlight the only size option
      const onlySizeLi = this.sizeOptionsList.querySelector('li.size-option');
      if (onlySizeLi) onlySizeLi.classList.add('selected');
    }
  }

  showError(message) {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
    } else {
      alert(message);
    }
  }

  clearError() {
    if (this.errorMessage) {
      this.errorMessage.textContent = '';
      this.errorMessage.style.display = 'none';
    }
  }
}

customElements.define('product-popup', ProductPopup);
