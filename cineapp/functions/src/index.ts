/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const app = initializeApp();
const db = getFirestore(app);

setGlobalOptions({ maxInstances: 10 });



async function syncCinemaNewsBatch(): Promise<number> {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    throw new Error("API key no configurada");
  }

  const q = "q=movie OR film OR trailer OR Hollywood";
  const maxResults = "&max=10";
  const language = "&lang=en";
  const res = await fetch(`https://gnews.io/api/v4/search?` + q + language + maxResults + `&token=${apiKey}`);

  if (!res.ok) {
    throw new Error(`Error en GNews: ${res.statusText}`);
  }

  const data = await res.json();
  const filtered = data.articles.filter((article: any) =>
    article.title && article.description && article.image
  );

  const newsRef = db.collection("News");
  const batch = db.batch();

  filtered.forEach((article: any) => {
    const docRef = newsRef.doc(article.id);
    batch.set(docRef, {
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.image,
      publishedAt: new Date(article.publishedAt),
      source: {
        name: article.source.name,
        url: article.source.url
      },
      createdAt: new Date()
    });
  });

  await batch.commit();
  return filtered.length;
}

export const getCinemaNews = onRequest(async (request, response) => {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    response.status(500).send("API key no configurada");
    return;
  }

  try {
    var q = "q=movie OR film OR trailer OR Hollywood";
    var maxResults = "&max=10";
    var language = "&lang=en";
    const res = await fetch(`https://gnews.io/api/v4/search?` + q + language + maxResults + `&token=${apiKey}`);
    if (!res.ok) {
      throw new Error(`Error en la API de GNews: ${res.statusText}`);
    }

    const data = await res.json();

    const filtered = data.articles.filter((article: any) =>
      article.title && article.description && article.image
    );

    const mapped = filtered.map((article: any) => ({
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: new Date(article.publishedAt),
        source: {
          name: article.source.name,
          url: article.source.url
        },
        createdAt: new Date()
    }));
    
    response.json(mapped);

  } catch (error) {
    logger.error("Error obteniendo noticias de cine:", error);
    response.status(500).send("Error obteniendo noticias de cine");
  }
});
  export const syncCinemaNewsDaily = onSchedule("0 0 * * *", async (context: any) => {
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    logger.error("API key no configurada");
    return;
  }

  try {
    var q = "q=movie OR film OR trailer OR Hollywood";
    var maxResults = "&max=10";
    var language = "&lang=en";
    const res = await fetch(`https://gnews.io/api/v4/search?` + q + language + maxResults + `&token=${apiKey}`);
    if (!res.ok) {
      throw new Error(`Error en GNews: ${res.statusText}`);
    }

    const data = await res.json();

    const filtered = data.articles.filter((article: any) =>
      article.title && article.description && article.image
    );

    // Limpiar colección anterior
    const newsRef = db.collection("News");
    /*
    const snapshot = await newsRef.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }*/

    // Guardar nuevas noticias
    const batch = db.batch();
    filtered.forEach((article: any) => {
      const docRef = newsRef.doc(article.id);
      batch.set(docRef, {
        id: article.id,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image: article.image,
        publishedAt: new Date(article.publishedAt),
        source: {
          name: article.source.name,
          url: article.source.url
        },
        createdAt: new Date()
      });
    });

    await batch.commit();
    logger.log(`Sincronizadas ${filtered.length} noticias de cine`);

  } catch (error) {
    logger.error("Error en syncCinemaNewsDaily:", error);
  }  
});

export const syncCinemaNewsRightNow = onRequest(async (request, response) => {
  try {
    const synced = await syncCinemaNewsBatch();
    logger.log(`Sincronizadas ${synced} noticias de cine (manual)`);
    response.status(200).json({
      ok: true,
      synced,
      message: "Sincronizacion completada"
    });
  } catch (error) {
    logger.error("Error en syncCinemaNewsRightNow:", error);
    response.status(500).json({
      ok: false,
      message: "Error en sincronizacion",
      error: error instanceof Error ? error.message : "unknown"
    });
  }
});
