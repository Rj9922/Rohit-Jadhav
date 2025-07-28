  document.addEventListener("DOMContentLoaded", function () {
    const hamburgerBtn = document.querySelector(".hamburger");
    const dropdown = document.querySelector(".mobile-dropdown");
    const hamburgerIcon = document.querySelector(".hamburger-icon");
    const closeIcon = document.querySelector(".hamburger-close-icon");

    hamburgerBtn.addEventListener("click", function () {
      dropdown.classList.toggle("active");

      // Toggle icons
      hamburgerIcon.classList.toggle("hidden");
      closeIcon.classList.toggle("hidden");
    });
  });