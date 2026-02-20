// --- DOM Element References ---
// Get references to the HTML elements we'll interact with
const htmlElement = document.documentElement; // The root <html> element for theme toggling
const themeToggle = document.getElementById('themeToggle'); // The dark mode toggle checkbox
// const currentYearSpan = document.getElementById('currentYear'); // This will now be accessed inside DOMContentLoaded

const display = document.getElementById('display'); // The calculator display element
const buttons = document.querySelectorAll('.grid button'); // All calculator buttons

// --- Calculator Variables ---
let currentInput = '0'; // Stores the number currently being entered or displayed
let previousInput = ''; // Stores the first operand for an operation
let operation = null; // Stores the selected operation (+, -, *, /)
let shouldResetDisplay = false; // Flag to clear display after an operation or new number entry

// --- Calculator Functions ---

/**
 * Updates the calculator display with the currentInput or the full expression.
 * Handles display of "Error" messages.
 */
function updateDisplay() {
    if (currentInput === 'Error') {
        display.textContent = 'Error';
        return;
    }

    // If an operation is selected and we have a previous input (first operand),
    // we want to display the ongoing expression.
    if (operation !== null && previousInput !== '') {
        // If shouldResetDisplay is true, it means an operator was just pressed,
        // and we haven't started typing the second number yet. In this state,
        // currentInput still holds the value of the first operand, so we don't
        // want to show it twice. We just show "previousInput operator".
        // If shouldResetDisplay is false, it means the user has started typing
        // the second number, so we show "previousInput operator currentInput".
        display.textContent = previousInput + ' ' + operation + ' ' + (shouldResetDisplay ? '' : currentInput);
    } else {
        // If no operation is pending (e.g., initial state, after equals, after clear),
        // just display the current input (the number being typed or the result).
        display.textContent = currentInput;
    }
}

/**
 * Appends a number (digit) to the current input.
 * Handles cases where display should be reset (e.g., after an equals operation).
 * @param {string} number - The digit to append.
 */
function appendNumber(number) {
    if (currentInput === 'Error') { // If an error is displayed, clear it and start a new number
        currentInput = number;
        shouldResetDisplay = false; // Reset the flag
    } else if (shouldResetDisplay) { // If a new number should start a fresh input (e.g., after '=' or an operator)
        currentInput = number;
        shouldResetDisplay = false; // Reset the flag
    } else {
        // Prevent multiple leading zeros (e.g., "007" becomes "7"), but allow "0."
        if (currentInput === '0' && number !== '.') {
            currentInput = number; // Replace "0" with the new number
        } else {
            currentInput += number; // Append the digit
        }
    }
    updateDisplay(); // Always update display after input changes
}

/**
 * Appends a decimal point to the current input.
 * Ensures only one decimal point can be added.
 */
function appendDecimal() {
    if (currentInput.includes('.')) return; // Don't add if decimal already exists in current input

    if (currentInput === 'Error') { // If an error is displayed, clear it and start with "0."
        currentInput = '0.';
        shouldResetDisplay = false;
    } else if (shouldResetDisplay) { // If display needs reset (e.g., after an operation), start with "0."
        currentInput = '0.';
        shouldResetDisplay = false;
    } else {
        currentInput += '.'; // Add decimal point
    }
    updateDisplay(); // Always update display after input changes
}

/**
 * Sets the operation for the calculation.
 * If there's a previous input and an operation, it computes the result first.
 * @param {string} op - The operator (+, -, *, /).
 */
function chooseOperation(op) {
    if (currentInput === 'Error') return; // Do nothing if in error state
    if (currentInput === '') return; // Do nothing if current input is empty

    if (previousInput !== '') { // If there's a previous operation pending
        compute(); // Compute the result of the previous operation
    }

    operation = op; // Set the new operation
    previousInput = currentInput; // Store current input as previous operand
    currentInput = '0'; // Reset currentInput for the next number entry
    shouldResetDisplay = true; // Next number input will clear display for a new operand
    updateDisplay(); // Update display to show the operation
}

/**
 * Performs the calculation based on the chosen operation.
 */
function compute() {
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return; // Do nothing if inputs are not valid numbers

    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            if (current === 0) { // Handle division by zero error
                currentInput = 'Error';
                operation = null;
                previousInput = '';
                updateDisplay();
                return;
            }
            computation = prev / current;
            break;
        default:
            return; // No valid operation selected
    }

    // Format computation to avoid excessive decimal places for floating point results.
    // Limits to 10 decimal places and converts back to string.
    currentInput = parseFloat(computation.toFixed(10)).toString(); 
    operation = null; // Clear operation after computation
    previousInput = ''; // Clear previous input
    shouldResetDisplay = true; // Next number input will clear display to start a new calculation
    updateDisplay();
}

/**
 * Clears the calculator display and resets all internal state.
 */
function clearCalculator() {
    currentInput = '0';
    previousInput = '';
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
}

/**
 * Deletes the last character from the current input.
 */
function deleteLast() {
    if (currentInput === 'Error') { // If in error state, clear it to "0"
        clearCalculator();
        return;
    }
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
        currentInput = '0'; // If only one digit or "-x", reset to "0"
    } else {
        currentInput = currentInput.slice(0, -1); // Remove the last character
    }
    updateDisplay();
}

/**
 * Toggles the sign of the current input (positive to negative, or vice-versa).
 */
function toggleSign() {
    if (currentInput === '0' || currentInput === 'Error') return; // Cannot toggle sign of 0 or Error
    currentInput = (parseFloat(currentInput) * -1).toString(); // Multiply by -1 to change sign
    updateDisplay();
}

/**
 * Converts the current input to a percentage.
 */
function convertToPercentage() {
    if (currentInput === 'Error') return; // Cannot convert Error to percentage
    currentInput = (parseFloat(currentInput) / 100).toString(); // Divide by 100
    updateDisplay();
}

// --- Event Listeners for Calculator Buttons ---
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent;
        const action = button.dataset.action; // Get custom 'data-action' attribute

        if (button.classList.contains('btn-number')) {
            appendNumber(buttonText);
        } else if (button.classList.contains('btn-operator')) {
            chooseOperation(buttonText);
        } else { // Handle special action buttons
            switch (action) {
                case 'clear':
                    clearCalculator();
                    break;
                case 'sign':
                    toggleSign();
                    break;
                case 'percent':
                    convertToPercentage();
                    break;
                case 'decimal':
                    appendDecimal();
                    break;
                case 'equals':
                    compute();
                    break;
                // No default needed as all action buttons are covered
            }
        }
    });
});

// --- Keyboard Input Handling ---
document.addEventListener('keydown', (e) => {
    const key = e.key; // Get the pressed key

    // Numbers (0-9)
    if (key >= '0' && key <= '9') {
        appendNumber(key);
    }
    // Operators (+, -, *, /)
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        chooseOperation(key);
    }
    // Decimal point
    else if (key === '.') {
        appendDecimal();
    }
    // Equals (Enter key or '=' key)
    else if (key === 'Enter' || key === '=') {
        e.preventDefault(); // Prevent default browser behavior (e.g., form submission)
        compute();
    }
    // Clear (Escape key)
    else if (key === 'Escape') {
        clearCalculator();
    }
    // Backspace (Delete last character)
    else if (key === 'Backspace') {
        deleteLast();
    }
});


// --- Theme Toggling Logic (Re-used from previous tasks) ---

/**
 * Applies the stored theme preference on page load.
 * Checks localStorage for 'theme' and sets the 'dark' class on <html> accordingly.
 */
function applyThemePreference() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
        themeToggle.checked = true;
    } else {
        htmlElement.classList.remove('dark');
        themeToggle.checked = false;
    }
}

/**
 * Toggles the dark mode on/off.
 * Adds/removes the 'dark' class from the <html> element and saves preference to localStorage.
 */
function toggleDarkMode() {
    htmlElement.classList.toggle('dark');

    if (htmlElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Add event listener to the theme toggle switch
themeToggle.addEventListener('change', toggleDarkMode);

// --- DOMContentLoaded Listener for Initial Setup ---
// This ensures that all HTML elements are fully loaded and parsed before JavaScript tries to access them.
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Current Year in Footer:
    const currentYearSpan = document.getElementById('currentYear'); // Get reference inside DOMContentLoaded
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Apply theme preference when the page first loads
    applyThemePreference();

    // Initial display update for the calculator (shows "0")
    updateDisplay();
});
