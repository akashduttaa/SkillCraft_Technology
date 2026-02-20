const htmlElement = document.documentElement; // The root HTML element for theme toggling
const navbar = document.getElementById('navbar'); // The navigation bar
const themeToggle = document.getElementById('themeToggle'); // The dark mode toggle checkbox
const backToTopBtn = document.getElementById('backToTopBtn'); // The back to top button

// --- Theme Toggling Logic ---

/**
 * Applies the stored theme preference on page load.
 * Checks localStorage for 'theme' and sets the 'dark' class on <html> accordingly.
 */
function applyThemePreference() {
    // Check if a theme preference is saved in localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
        themeToggle.checked = true; // Set the toggle switch to 'checked' if dark mode is active
    } else {
        htmlElement.classList.remove('dark');
        themeToggle.checked = false; // Ensure toggle switch is 'unchecked' for light mode
    }
}


//  toggles the dark mode on/off.

function toggleDarkMode() {
    // Toggle the 'dark' class on the root HTML element
    htmlElement.classList.toggle('dark');

    if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Add event listener to the theme toggle switch
themeToggle.addEventListener('change', toggleDarkMode);


document.addEventListener('DOMContentLoaded', applyThemePreference);

document.getElementById('year').textContent = new Date().getFullYear();


// --- Navigation Bar Scroll Effect Logic ---



window.addEventListener('scroll', () => {
    // Check if the user has scrolled beyond a certain threshold (e.g., 50 pixels)
    if (window.scrollY > 50) {
        // If scrolled, add the 'scrolled' class to change its style
        navbar.classList.add('scrolled');
    } else {
        // If at the top, remove the 'scrolled' class to revert to original style
        navbar.classList.remove('scrolled');
    }

    // --- Back to Top Button Visibility Logic ---

    if (window.scrollY > 300) { // Show button after scrolling 300px down
        backToTopBtn.classList.remove('hidden');
    } else {
        backToTopBtn.classList.add('hidden');
    }
});

// --- Back to Top Button Click Logic ---



backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling animation
    });
});

//  Smooth scroll for navigation links
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default jump behavior

        const targetId = this.getAttribute('href').substring(1); // Get target section ID
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // Scroll to the target element with smooth behavior
            window.scrollTo({
                top: targetElement.offsetTop - navbar.offsetHeight, // Adjust for fixed navbar height
                behavior: 'smooth'
            });
        }
    });
});
