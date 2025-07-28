document.addEventListener("DOMContentLoaded", () => {
    const popup = document.querySelector('product-popup');

    document.querySelectorAll('.hotspot-button').forEach(button => {
        button.addEventListener('click', () => {
            const productUrl = button.getAttribute('data-product-url');
            const handle = productUrl.split('/products/')[1];
            document.querySelector('product-popup').showProduct(handle);
        });
    });
});
