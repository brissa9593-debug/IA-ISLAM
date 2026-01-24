import fetch from 'node-fetch';

const APP_ID = process.env.BASE44_APP_ID;
const BASE_URL = 'https://islam-ia.base44.app';
const AGENT_NAME = 'islamic_scholar';

export async function handler(event) {
  try {
    if (!APP_ID) {
      throw new Error('APP_ID manquant');
    }

    const { content } = JSON.parse(event.body);

    // 1️⃣ Créer la conversation
    const convRes = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': APP_ID
      },
      body: JSON.stringify({
        agent_name: AGENT_NAME
      })
    });

    if (!convRes.ok) {
      const text = await convRes.text();
      throw new Error('Erreur création conversation: ' + text);
    }

    const convData = await convRes.json();
    const conversationId = convData.id;

    // 2️⃣ Envoyer le message
    const msgRes = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': APP_ID
      },
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    if (!msgRes.ok) {
      const text = await msgRes.text();
      throw new Error('Erreur message: ' + text);
    }

    const msgData = await msgRes.json();
    const response =
      msgData.messages?.[msgData.messages.length - 1]?.content ||
      'Pas de réponse';

    return {
      statusCode: 200,
      body: JSON.stringify({ response })
    };

  } catch (error) {
    console.error('❌ ERREUR CHAT:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ response: 'Erreur serveur' })
    };
  }
}
