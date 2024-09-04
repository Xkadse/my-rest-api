document.getElementById('fetchData').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    console.log('API Key Entered:', apiKey);  // Log the API key to verify it's correctly captured

    fetch('/api/protected', {
        method: 'GET',
        headers: {
            'x-api-key': apiKey
        }
    })
    .then(response => {
        console.log('Response Status:', response.status);  // Log the status code
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Unauthorized');
        }
    })
    .then(data => {
        console.log('Data:', data);  // Log the data to confirm it's received
        window.location.href = '/success';
    })
    .catch(error => {
        console.error('Error:', error);  // Log any errors
        document.getElementById('response').innerText = error.message;
        document.body.style.backgroundColor = "#f8d7da";
    });
});
