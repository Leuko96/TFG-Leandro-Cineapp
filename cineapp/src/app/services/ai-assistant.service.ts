import { Injectable } from '@angular/core';
import { getApp } from '@angular/fire/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

export interface MovieBrief {
  title: string;
  genres?: string;
  overview?: string;
  keywords?: string;
}

export interface AiRecommendation {
  title: string;
  reason: string;
  commonPoints: string[];
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private readonly modelName = 'gemini-2.5-flash';

  async getRecommendations(movieA: MovieBrief, movieB: MovieBrief): Promise<AiRecommendation[]> {
    try {
      const app = getApp();
      const ai = getAI(app, { backend: new GoogleAIBackend() });
      const model = getGenerativeModel(ai, { model: this.modelName });
      const prompt = this.buildPrompt(movieA, movieB);
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const parsed = this.safeParse(rawText);

      if (!parsed || !Array.isArray(parsed.recommendations)) {
        throw new Error('Respuesta de la IA sin recomendaciones válidas');
      }

      const cleaned = parsed.recommendations
        .map((item: any) => ({
          title: item.title ?? item.name ?? 'Título desconocido',
          reason: item.reason ?? item.description ?? 'Sin explicación',
          commonPoints: Array.isArray(item.commonPoints)
            ? item.commonPoints
            : item.sharedElements ?? [],
        }))
        .slice(0, 10)
        .map((item: AiRecommendation) => ({
          ...item,
          commonPoints: item.commonPoints.slice(0, 4),
        }));

      if (cleaned.length === 0) {
        throw new Error('La IA no devolvió recomendaciones');
      }

      return cleaned;
    } catch (err: any) {
      console.error('IA assistant error:', err);
      throw new Error(`Error generando recomendaciones: ${err.message || 'unknown'}`);
    }
  }

  private buildPrompt(movieA: MovieBrief, movieB: MovieBrief): string {
    return `Eres un experto en cine. Debes recomendar 10 peliculas que tengan puntos en comun con dos peliculas dadas.

Película A: ${movieA.title}
- Géneros: ${movieA.genres || 'N/A'}
- Descripción: ${movieA.overview?.slice(0, 200) || 'N/A'}
- Keywords: ${movieA.keywords || 'N/A'}

Película B: ${movieB.title}
- Géneros: ${movieB.genres || 'N/A'}
- Descripción: ${movieB.overview?.slice(0, 200) || 'N/A'}
- Keywords: ${movieB.keywords || 'N/A'}

Reglas:
- Responde en espanol.
- Devuelve exactamente 10 recomendaciones.
- No repitas Pelicula A ni Pelicula B.
- Cada recomendacion debe incluir titulo, razon y 2-4 commonPoints.

Responde SOLO JSON valido (sin markdown, sin comentarios):
{
  "recommendations": [
    {
      "title": "Nombre pelicula",
      "reason": "Por que conecta con ambas peliculas",
      "commonPoints": ["punto1", "punto2", "punto3"]
    }
  ]
}`;
  }

  private safeParse(raw: string): { recommendations: AiRecommendation[] } | null {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No se encontró JSON en la respuesta');

      const cleaned = jsonMatch[0]
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (e: any) {
      console.warn('Error parseando JSON de la IA:', e.message, 'Raw:', raw);
      return null;
    }
  }
}
