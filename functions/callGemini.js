// Import the 'fetch' function if you are using a Node.js version older than 18
// For modern environments (like Netlify, Vercel), 'fetch' is usually available globally.
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Check for the correct HTTP method (POST)
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // 2. Get the API Key from environment variables.
    // This is the crucial step for security. You will set this variable in your deployment platform (Netlify, Vercel, etc.), NOT here in the code.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key not configured on the server.' }),
        };
    }

    // 3. Prepare the request to the Google Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    try {
        // 4. Parse the incoming request body from the frontend
        const requestBody = JSON.parse(event.body);

        // 5. Make the actual call to the Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), // Pass the original payload
        });

        // 6. Handle the response from the Gemini API
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch from Gemini API.', details: errorBody }),
            };
        }

        const data = await geminiResponse.json();

        // 7. Send the successful response back to the frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
