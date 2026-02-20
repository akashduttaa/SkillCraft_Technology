// --- DOM Element References ---
const htmlElement = document.documentElement; // The root <html> element for theme toggling
const themeToggle = document.getElementById('themeToggle'); // The dark mode toggle checkbox
const currentYearSpan = document.getElementById('currentYear'); // The span for the current year in the footer

const startQuizButton = document.getElementById('startQuizButton');
const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('resultsContainer');
const restartQuizButton = document.getElementById('restartQuizButton');

const questionNumberSpan = document.getElementById('questionNumber');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const questionText = document.getElementById('questionText');
const answerOptionsDiv = document.getElementById('answerOptions');

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const submitQuizButton = document.getElementById('submitQuizButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// --- Quiz Data ---
const quizQuestions = [
    {
        question: "What does HTML stand for?",
        type: "single-select", // New property: single-select
        options: [
            "Hyper Text Markup Language",
            "Hyperlink and Text Markup Language",
            "Home Tool Markup Language",
            "Hyper Transfer Markup Language"
        ],
        correctAnswer: "Hyper Text Markup Language"
    },
    {
        question: "Which of these are programming languages? (Select all that apply)",
        type: "multi-select", // New property: multi-select
        options: [
            "Python",
            "HTML", // Not a programming language
            "Java",
            "CSS",  // Not a programming language
            "JavaScript"
        ],
        correctAnswer: ["Python", "Java", "JavaScript"] // Array for multi-select
    },
    {
        question: "The capital of France is ______.",
        type: "fill-in-the-blank", // New property: fill-in-the-blank
        correctAnswer: "Paris" // String for fill-in-the-blank
    },
    {
        question: "Which CSS property is used for changing the font size of text?",
        type: "single-select",
        options: [
            "text-size",
            "font-style",
            "font-size",
            "text-font"
        ],
        correctAnswer: "font-size"
    },
    {
        question: "What is Node.js primarily used for?",
        type: "single-select",
        options: [
            "Frontend development",
            "Database management",
            "Backend development",
            "Graphic design"
        ],
        correctAnswer: "Backend development"
    }
];

// --- Quiz State Variables ---
let currentQuestionIndex = 0;
let score = 0;
// Store user's selected answers for each question
// Initialize with nulls for single-select/fill-in-the-blank, and empty arrays for multi-select
let userAnswers = Array(quizQuestions.length).fill(null).map((_, i) => {
    return quizQuestions[i].type === 'multi-select' ? [] : null;
});

// --- Quiz Functions ---

/**
 * Displays the current question and its answer options based on question type.
 */
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    questionNumberSpan.textContent = currentQuestionIndex + 1;
    totalQuestionsSpan.textContent = quizQuestions.length;
    questionText.textContent = question.question;
    answerOptionsDiv.innerHTML = ''; // Clear previous options

    if (question.type === 'single-select') {
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.dataset.option = option; // Store option value in dataset
            
            // If user has already answered this question, mark it as selected
            if (userAnswers[currentQuestionIndex] === option) {
                button.classList.add('selected');
            }
            button.addEventListener('click', () => selectAnswer(option, button, 'single-select'));
            answerOptionsDiv.appendChild(button);
        });
    } else if (question.type === 'multi-select') {
        question.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.classList.add('multi-select-option'); // Container for checkbox and label
            div.innerHTML = `
                <input type="checkbox" id="option-${currentQuestionIndex}-${index}" value="${option}" class="mr-2 checkbox-input">
                <label for="option-${currentQuestionIndex}-${index}" class="text-lg cursor-pointer">${option}</label>
            `;
            const checkbox = div.querySelector('input[type="checkbox"]');
            
            // Check if this option was previously selected by the user
            if (Array.isArray(userAnswers[currentQuestionIndex]) && userAnswers[currentQuestionIndex].includes(option)) {
                checkbox.checked = true;
            }
            
            // Add event listener to the checkbox itself
            checkbox.addEventListener('change', () => selectAnswer(option, checkbox, 'multi-select'));
            answerOptionsDiv.appendChild(div);
        });
    } else if (question.type === 'fill-in-the-blank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('fill-in-the-blank-input'); // Class for input field styling
        input.placeholder = 'Type your answer here...';
        // Set previous answer if available
        if (userAnswers[currentQuestionIndex] !== null) {
            input.value = userAnswers[currentQuestionIndex];
        }
        // Use 'input' event for real-time updates as user types
        input.addEventListener('input', (e) => selectAnswer(e.target.value, input, 'fill-in-the-blank'));
        answerOptionsDiv.appendChild(input);
    }

    updateNavigationButtons();
}

/**
 * Handles the selection/input of an answer based on question type.
 * Stores the selected answer(s) and updates button/input styles.
 * @param {string|string[]} value - The selected option text or input value.
 * @param {HTMLElement} element - The HTML element that was interacted with (button, checkbox, input).
 * @param {string} type - The type of question ('single-select', 'multi-select', 'fill-in-the-blank').
 */
function selectAnswer(value, element, type) {
    console.log("Option selected:", value, "Type:", type); // Debugging: Check if this function is called

    if (type === 'single-select') {
        // Remove 'selected' class from all options for the current question
        answerOptionsDiv.querySelectorAll('.option-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        // Add 'selected' class to the clicked button
        element.classList.add('selected');
        userAnswers[currentQuestionIndex] = value; // Store the single selected answer
    } else if (type === 'multi-select') {
        // For multi-select, userAnswers[currentQuestionIndex] is an array
        let currentSelections = Array.isArray(userAnswers[currentQuestionIndex]) ? [...userAnswers[currentQuestionIndex]] : [];
        if (element.checked) { // If checkbox is checked
            if (!currentSelections.includes(value)) { // Add if not already present
                currentSelections.push(value);
            }
        } else { // If checkbox is unchecked
            currentSelections = currentSelections.filter(item => item !== value); // Remove it
        }
        userAnswers[currentQuestionIndex] = currentSelections; // Update the array of selected answers
    } else if (type === 'fill-in-the-blank') {
        userAnswers[currentQuestionIndex] = value; // Store the input field's value
    }
}

/**
 * Updates the state of navigation buttons (Previous, Next, Submit).
 */
function updateNavigationButtons() {
    // Previous button is disabled on the first question
    prevButton.disabled = currentQuestionIndex === 0;

    // Logic for Next vs. Submit button visibility
    if (currentQuestionIndex < quizQuestions.length - 1) {
        nextButton.classList.remove('hidden');
        submitQuizButton.classList.add('hidden');
        nextButton.disabled = false; // Enable next button
    } else {
        nextButton.classList.add('hidden');
        submitQuizButton.classList.remove('hidden');
        // Submit button is enabled by default if not hidden, no need for explicit disable
    }
}

/**
 * Navigates to the next question.
 */
function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

/**
 * Navigates to the previous question.
 */
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

/**
 * Calculates the final score and displays results.
 * Also provides visual feedback for correct/incorrect answers on the quiz questions.
 */
function showResults() {
    score = 0;
    quizQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;

        if (question.type === 'single-select') {
            if (userAnswer === correctAnswer) {
                score++;
            }
        } else if (question.type === 'multi-select') {
            // Sort both arrays to ensure consistent comparison regardless of selection order
            const sortedUserAnswer = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
            const sortedCorrectAnswer = [...correctAnswer].sort();
            
            // Compare stringified arrays for equality
            if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer)) {
                score++;
            }
        } else if (question.type === 'fill-in-the-blank') {
            // Case-insensitive and trim comparison for fill-in-the-blank
            if (userAnswer && String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()) {
                score++;
            }
        }
    });

    // Display results container
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scoreDisplay.textContent = `You scored ${score} out of ${quizQuestions.length}!`;

    // Optional: Provide visual feedback on answers after submission
    // This part would typically be in a separate "review answers" section
    // For simplicity, we'll just show the score. If you want to review,
    // you'd need to re-display questions with correct/incorrect highlights.
}

/**
 * Starts the quiz from the beginning.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    // Re-initialize userAnswers based on question types for a fresh start
    userAnswers = Array(quizQuestions.length).fill(null).map((_, i) => {
        return quizQuestions[i].type === 'multi-select' ? [] : null;
    });

    // Show quiz container and hide others
    startQuizButton.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden'); 
    displayQuestion(); // Display the first question
}

/**
 * Restarts the quiz after showing results.
 */
function restartQuiz() {
    startQuiz(); // Simply call startQuiz to reset everything and begin again
}

// --- Event Listeners for Quiz Controls ---
startQuizButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);
submitQuizButton.addEventListener('click', showResults);
restartQuizButton.addEventListener('click', restartQuiz);


// --- Theme Toggling Logic ---

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

    // The quiz starts hidden, waiting for the "Start Quiz" button click.
    // No initial displayQuestion() call here.
});
