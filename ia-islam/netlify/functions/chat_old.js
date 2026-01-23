const fetch = require('node-fetch'); // nécessaire pour Netlify

export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        // Remplace TON_APP_ID_ICI par l'ID de ton application Base44
        const APP_ID = '6970b76c579f0b3ac47f48b8';
        const AGENT_NAME = 'islamic_scholar';

        // Crée la conversation
        const createConv = await fetch('https://api.base44.com/agents/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': APP_ID
            },
            body: JSON.stringify({
                agent_name: AGENT_NAME,
                metadata: {
                    name: 'Conversation Netlify'
                }
            })
        });

        const convData = await createConv.json();
        const conversationId = convData.id;

        // Envoie le message de l'utilisateur
        const sendMsg = await fetch(`https://api.base44.com/agents/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': APP_ID
            },
            body: JSON.stringify({
                role: 'user',
                content: userMessage
            })
        });

        const sendData = await sendMsg.json();

        // Retourne la réponse
        return {
            statusCode: 200,
            body: JSON.stringify(sendData)
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur lors de la communication avec l\'IA.' })
        };
    }
}
