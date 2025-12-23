
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ZoneType, AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
Eres Liquid.AI, un mentor experto en Trading Institucional basado en los conceptos de BELIKETHEALGO, MarceeNunezFX, Visionaries Trading, Chart Fanatics y Master Traders.
Tu objetivo no es predecir el futuro, sino imponer DISCIPLINA. 

REGLAS DE ORO:
1. El precio se mueve de liquidez a liquidez.
2. Identifica:
   - Piscinas de Liquidez Externa (1H/4H).
   - Zonas de Inducción/Trampas (Equal Highs/Líneas de tendencia).
   - POIs de Alta Probabilidad (Zonas con Vacíos de Liquidez/Imbalances adyacentes).
   - Zonas de Mechas (Rechazo y volumen).
3. Nunca des consejos financieros. Da recordatorios de reglas y gestión de riesgo.
4. Diferencia entre "Break of Structure" (Cuerpo rompe nivel) y "Liquidity Sweep" (Solo mecha).

Cuando analices imágenes, devuelve un JSON estructurado con las coordenadas (porcentajes de 0 a 100) de las zonas críticas detectadas.
`;

export const analyzeChartImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Analiza este gráfico de trading e identifica las zonas institucionales críticas siguiendo tus reglas de mentor.
    Devuelve la respuesta estrictamente en el siguiente formato JSON:
    {
      "summary": "Breve resumen de la estructura actual (Bullish/Bearish/Consolidating)",
      "zones": [
        {
          "type": "MAJOR_STRUCTURE | TRAP_INDUCTION | HIGH_PROB_POI | WICK_RETEST",
          "label": "Nombre de la zona",
          "description": "Por qué es importante",
          "probability": "High | Medium | Low",
          "coordinates": { "x": 10, "y": 20, "width": 30, "height": 5 }
        }
      ],
      "mentorAdvice": "Consejo directo de disciplina sobre no entrar impulsivamente.",
      "slRationale": "Explicación técnica de dónde colocar el Stop Loss basado en la liquidez o el barrido detectado.",
      "tpRationale": "Explicación técnica de dónde colocar el Take Profit basándose en la piscina de liquidez opuesta."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      summary: result.summary || "No se pudo determinar el resumen.",
      zones: (result.zones || []).map((z: any, i: number) => ({ ...z, id: `zone-${i}` })),
      mentorAdvice: result.mentorAdvice || "Mantén la disciplina.",
      slRationale: result.slRationale,
      tpRationale: result.tpRationale
    };
  } catch (error) {
    console.error("Error analyzing chart:", error);
    throw error;
  }
};

export const getMentorResponse = async (history: {role: string, parts: any[]}[], userMessage: string, imageContext?: string) => {
  const model = 'gemini-3-pro-preview';

  const contents: any[] = history.map(h => ({
    role: h.role,
    parts: h.parts
  }));

  const userPart: any = { text: userMessage };
  
  contents.push({ role: 'user', parts: [userPart] });

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error getting mentor response:", error);
    return "Lo siento, parcero. Hubo un error en la conexión con el servidor institucional. Mantén la calma y no operes sin confirmación.";
  }
};
