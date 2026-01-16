// Using global fetch (available in Node 18+)

async function testApi(username, password) {
    console.log(`Testing API login for: ${username}`);
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

(async () => {
    await testApi('maryam', '123');
    process.exit(0);
})();
