document.getElementById('fetchData').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;

    fetch('/api/protected', {
        method: 'GET',
        headers: {
            'x-api-key': apiKey
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Unauthorized');
        }
    })
    .then(data => {
        document.getElementById('response').innerText = JSON.stringify(data);
    })
    .catch(error => {
        document.getElementById('response').innerText = error.message;
    });
});
