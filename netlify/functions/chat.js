import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { content } = JSON.parse(event.body || "{}");

    if (!content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ response: "Message manquant" }),
      };
    }

    const res = await fetch(
      "https://islam-ia.base44.app/api/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.BASE44_APP_ID,
        },
        body: JSON.stringify({
          message: content,
        }),
      }
    );

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Réponse Base44 non JSON : " + text);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        response: data.reply || "Pas de réponse",
      }),
    };
  } catch (err) {
    console.error("❌ ERREUR CHAT:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ response: "Erreur serveur" }),
    };
  }
}
