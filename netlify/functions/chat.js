const APP_ID = '6970b76c579f0b3ac47f48b8'; // ✅ Votre APP_ID Base44
const BASE_URL = 'https://api.base44.com/agents'; // ✅ URL correcte de l'API

export async function handler(event) {
  try {
    const { content } = JSON.parse(event.body);

    // 1️⃣ Créer une nouvelle conversation
    const convRes = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': APP_ID
      },
      body: JSON.stringify({ 
        agent_name: 'islamic_scholar',
        metadata: { name: 'Nouvelle conversation' }
      })
    });

    if (!convRes.ok) {
      const text = await convRes.text();
      throw new Error('Erreur création conversation: ' + text);
    }

    const convData = await convRes.json();
    const conversationId = convData.id;

    // 2️⃣ Envoyer le message utilisateur
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
      throw new Error('Erreur envoi message: ' + text);
    }

    // 3️⃣ Attendre la réponse de l'agent (polling)
    let attempts = 0;
    const maxAttempts = 30; // 30 secondes max
    let assistantResponse = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 sec
      
      const getConvRes = await fetch(`${BASE_URL}/conversations/${conversationId}`, {
        headers: { 'x-app-id': APP_ID }
      });
      
      const convData = await getConvRes.json();
      const messages = convData.messages || [];
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        const hasIncompleteTools = lastMessage.tool_calls?.some(
          tc => tc.status === 'running' || tc.status === 'in_progress' || tc.status === 'pending'
        );
        
        if (!hasIncompleteTools) {
          assistantResponse = lastMessage.content;
          break;
        }
      }
      
      attempts++;
    }

    if (!assistantResponse) {
      throw new Error('Pas de réponse de l\'agent après 30 secondes');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ response: assistantResponse })
    };

  } catch (error) {
    console.error('❌ ERREUR CHAT:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ response: `Erreur: ${error.message}` })
    };
  }
}