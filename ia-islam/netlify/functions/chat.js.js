const fetch = require("node-fetch"); // nécessaire pour Netlify

const APP_ID = "6970b76c579f0b3ac47f48b8";
const BASE_URL = "https://api.base44.com/agents";
const AGENT_NAME = "islamic_scholar";

exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body);
    const { conversationId, message } = body;

    if (!conversationId) {
      // Création d'une nouvelle conversation
      const response = await fetch(`${BASE_URL}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": APP_ID
        },
        body: JSON.stringify({
          agent_name: AGENT_NAME,
          metadata: { name: "Nouvelle conversation" }
        })
      });

      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ conversationId: data.id })
      };
    } else {
      // Envoyer un message à la conversation existante
      const response = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": APP_ID
        },
        body: JSON.stringify({
          role: "user",
          content: message
        })
      });

      await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur serveur" })
    };
  }
};
