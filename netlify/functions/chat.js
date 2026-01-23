export async function handler(event, context) {
  try {
    // Sécurité : méthode POST uniquement
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    // Parse du body
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message;

    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message manquant" })
      };
    }

    // ?? REMPLACE SI BESOIN
    const APP_ID = "6970b76c579f0b3ac47f48b8";
    const AGENT_NAME = "islamic_scholar";

    // 1?? Créer une conversation
    const convRes = await fetch(
      "https://api.base44.com/agents/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": APP_ID
        },
        body: JSON.stringify({
          agent_name: AGENT_NAME,
          metadata: { source: "netlify" }
        })
      }
    );

    if (!convRes.ok) {
      const errText = await convRes.text();
      throw new Error("Base44 conversation error: " + errText);
    }

    const convData = await convRes.json();
    const conversationId = convData.id;

    // 2?? Envoyer le message utilisateur
    const msgRes = await fetch(
      `https://api.base44.com/agents/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": APP_ID
        },
        body: JSON.stringify({
          role: "user",
          content: userMessage
        })
      }
    );

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      throw new Error("Base44 message error: " + errText);
    }

    const msgData = await msgRes.json();

    // 3?? Réponse vers le frontend
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(msgData)
    };

  } catch (error) {
    console.error("Chat function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erreur serveur",
        details: error.message
      })
    };
  }
}