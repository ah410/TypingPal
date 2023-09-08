// Fetch the API URL and get reference to HTML elements
const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';
const quoteDisplayElement = document.getElementById('quoteDisplay');
const quoteInputElement = document.getElementById('quoteInput');
const timerElement = document.getElementById('timer');

// Declare and initialize variables
let totalCharacterCount = 0;
let correctCharacterCount = 0;
let uncorrectedErrors = 0;
let timeMin = 1;

// Declare and initialize temp variables to hold the counter of characters for each quote
let tempTotalCharacterCount = 0;
let tempCorrectCharacterCount = 0;
let tempUncorrectedErrors = 0;


// Add event listener to listen to any changes made to the input, check functionality with console.log()
quoteInputElement.addEventListener('input', () =>{
    // Get array of both the quote and user input
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    // Reset the temporary character count values after each input event listener
    tempTotalCharacterCount = 0;
    tempCorrectCharacterCount = 0;
    tempUncorrectedErrors = 0;

    // Iterate over the quote and check characters match between quote and input
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index]; // Get value of typed character
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
        }
        else if (character === characterSpan.innerText) { 
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
            tempCorrectCharacterCount++;
            tempTotalCharacterCount++;
        }
        else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            tempUncorrectedErrors++;
            tempTotalCharacterCount++;
        }
    });
});

    
// If enter key is pressed, add to the total character counts and render new quote
quoteInputElement.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        totalCharacterCount += tempTotalCharacterCount;
        correctCharacterCount += tempCorrectCharacterCount;
        uncorrectedErrors += tempUncorrectedErrors;

        renderNextQuote();

        //Logging the counts
        console.log("Total Characters: " + totalCharacterCount);
        console.log("Correct Characters: " + correctCharacterCount);
        console.log("Uncorrected Errors: " + uncorrectedErrors);
    }
});


// Use quotable api to recieve a random quote 
function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL)
        .then(response => {
            if(!response.ok) {
                // Used to handle HTTP response status codes
                throw new Error('Failed to fetch data (${response.status})');
            }
            return response.json();
        })
        .then(data => data.content)
        .catch(error => {
            // Used to handle promise errors anywhere in the chain
            console.error('Error:', error);
        });
}


async function renderNextQuote() {
    const quote = await getRandomQuote();
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });

    // Reset user text box to be empty when rendering a new quote
    quoteInputElement.value = null;
}


let startTime;
let timerInterval;
function startTimer() { 
    let initialTime = 60; // Initialize timer to 60 and set timerElement text to 60
    timerElement.innerText = initialTime;
    startTime = new Date().getTime() + (initialTime * 1000); // startTime represents the point in time when the countdown will end

    // You want to pass the function itself, updateTimer, not it's result, updateTimer().
    timerInterval = setInterval(updateTimer, 1000);
}


function updateTimer() {
    let currentTime = new Date().getTime(); // Get current time
    let remainingTime = Math.max(0, Math.ceil((startTime - currentTime) / 1000)); // remainingTime is currentTime subtracted from the point in time when the timer is supposed to end. Divide by 1000 to get seconds

    timerElement.innerText = remainingTime; // Change timer to display the remaining time

    if (remainingTime === 0) { // Once remaining time reaches 0, show the results page
        clearInterval(timerInterval);

        // Add the temp character values for each quote to the total
        totalCharacterCount += tempTotalCharacterCount;
        correctCharacterCount += tempCorrectCharacterCount;
        uncorrectedErrors += tempUncorrectedErrors;

        // WPM + Accuracy Calculation
        let grossWordsPerMinute = (totalCharacterCount/5)/timeMin;
        let netWordsPerMinute = grossWordsPerMinute - (uncorrectedErrors/timeMin);
        let accuracy = correctCharacterCount/totalCharacterCount * 100;

        const params = new URLSearchParams();
        params.set('wpm', netWordsPerMinute);
        params.set('accuracy', accuracy);
        
        window.location.href = 'results.html?' + params.toString();
    }
}

// Call startTimer() and renderNextQuote() for speed test to start
startTimer();
renderNextQuote();