class ProductPopup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Assign DOM elements
    this.popup = this.querySelector('.popup');
    this.image = this.querySelector('#popup-image');
    this.productTitle = this.querySelector('#popup-title');
    this.price = this.querySelector('#popup-price');
    this.description = this.querySelector('#popup-description');
    this.variantSelect = this.querySelector('#popup-variant-select');
    this.addToCartBtn = this.querySelector('#popup-add-to-cart');

    // Close button
    const closeBtn = this.querySelector('.close-popup');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.popup.classList.remove('show');
      });
    }

    // Add to cart
    if (this.addToCartBtn) {
      this.addToCartBtn.addEventListener('click', () => {
        const variantId = this.variantSelect?.value;
        if (!variantId) {
          alert('Please select a variant.');
          return;
        }

        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
          })
          .then(() => {
            alert('Added to cart!');
            this.popup.classList.remove('show');
          })
          .catch(() => alert('Failed to add to cart.'));
      });
    }
  }

  showProduct(handle) {
    fetch(`/products/${handle}.js`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch product data: ${response.status}`);
        }
        return response.json();
      })
      .then(product => {
        if (this.productTitle) this.productTitle.textContent = product.title;
				this.price.textContent = window.formatMoney(product.price);
        if (this.description) this.description.innerHTML = product.description;
        if (this.image) {
          this.image.src = product.featured_image;
          this.image.alt = product.title;
        }

        if (this.variantSelect) {
          this.variantSelect.innerHTML = '';
          product.variants.forEach(variant => {
            const option = document.createElement('option');
            option.value = variant.id;
            option.textContent = variant.name;
            this.variantSelect.appendChild(option);
          });
        }

        if (this.popup) {
          this.popup.classList.add('show');
        }
      })
      .catch(error => {
        console.error('Error loading product:', error);
        alert('Could not load product details. Please try again later.');
      });
  }
}

customElements.define('product-popup', ProductPopup);
