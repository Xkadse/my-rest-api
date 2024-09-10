// Add an event listener to the button with the ID 'fetchData' for the 'click' event
document.getElementById('fetchData').addEventListener('click', () => {
    // Get the value of the input field with the ID 'apiKey'
    const apiKey = document.getElementById('apiKey').value;

    // Sending the API key as a query parameter in the URL to the /success endpoint
    fetch(`/success?apiKey=${apiKey}`, {
        method: 'GET',  // Use the GET method for the request
    })
    .then(response => {
        if (response.ok) {  // Check if the response status is OK (status code 200-299)
            // If authentication is successful, redirect to the success page with the API key in the query parameter
            window.location.href = '/success?apiKey=' + apiKey;
        } else {
            // If the response is not OK, throw an error with the message 'Unauthorized'
            throw new Error('Unauthorized');
        }
    })
    .catch(error => {
        // Display the error message in the element with the ID 'response'
        document.getElementById('response').innerText = error.message;
        // Change the background color of the body to light red to indicate an error
        document.body.style.backgroundColor = "#f8d7da"; // Light red background for error
    });
});