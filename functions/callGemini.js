// Import the 'fetch' function if you are using a Node.js version older than 18
// For modern environments (like Netlify, Vercel), 'fetch' is usually available globally.
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    console.log("INFO: La función ha sido invocada.");

    // 1. Check for the correct HTTP method (POST)
    if (event.httpMethod !== 'POST') {
        console.error("ERROR: Método HTTP no permitido. Se recibió:", event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // 2. Get the API Key from environment variables.
    console.log("INFO: Intentando leer la variable de entorno GEMINI_API_KEY...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR CRÍTICO: La variable de entorno GEMINI_API_KEY no fue encontrada.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key not configured on the server.' }),
        };
    }
    
    // Log only a part of the key for security verification
    console.log("ÉXITO: La API Key fue encontrada. Comienza con:", apiKey.substring(0, 4));

    // 3. Prepare the request to the Google Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    try {
        console.log("INFO: Parseando el cuerpo de la petición...");
        const requestBody = JSON.parse(event.body);
        console.log("INFO: El cuerpo de la petición fue parseado con éxito.");

        // 5. Make the actual call to the Gemini API
        console.log("INFO: Realizando la llamada a la API de Gemini...");
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), // Pass the original payload
        });
        console.log("INFO: Se recibió respuesta de la API de Gemini con estatus:", geminiResponse.status);

        // 6. Handle the response from the Gemini API
        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            console.error('ERROR: La API de Gemini devolvió un error:', errorBody);
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch from Gemini API.', details: errorBody }),
            };
        }

        const data = await geminiResponse.json();
        console.log("ÉXITO: La respuesta de la API de Gemini fue procesada correctamente.");

        // 7. Send the successful response back to the frontend
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error('ERROR: Ocurrió un error dentro del bloque try/catch:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
};
