import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { DecorationStyle, Product } from '../types';

// La API Key se lee desde las variables de entorno configuradas en el ambiente de despliegue.
if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper para convertir archivo a base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const base64ToGenerativePart = (base64Data: string, mimeType: string) => ({
    inlineData: { data: base64Data, mimeType },
});

interface StyleDetailsResponse {
    description: string;
    furnitureRecs: string;
    colorRecs: string;
    products: Product[];
}

const generateStyledImage = async (base64Image: string, mimeType: string, stylePrompt: string): Promise<string> => {
    const imagePart = base64ToGenerativePart(base64Image, mimeType);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: stylePrompt }, imagePart] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No se pudo generar la imagen.");
};

const getStyleDetails = async (styleName: string): Promise<StyleDetailsResponse> => {
     const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Genera una descripción para el estilo de decoración '${styleName}'. Basado en este estilo, proporciona recomendaciones de mobiliario, recomendaciones de paleta de colores, y una lista de 5 productos decorativos que se podrían encontrar en mercadolibre.com. Responde en español.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        furnitureRecs: { type: Type.STRING },
                        colorRecs: { type: Type.STRING },
                        products: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { 
                                    name: { type: Type.STRING }, 
                                    url: { type: Type.STRING, description: "URL simulada a mercadolibre.com" }
                                }
                            }
                        }
                    }
                },
            },
        });
    return JSON.parse(response.text) as StyleDetailsResponse;
};

export const analyzeImage = async (imageFile: File): Promise<string> => {
    const base64Image = await fileToBase64(imageFile);
    const imagePart = base64ToGenerativePart(base64Image, imageFile.type);

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [
            { text: "Analiza esta imagen. Entre 13 y 30 palabras, identifica el tipo de espacio (ej. sala de estar, dormitorio) y describe su estilo actual. Responde en español." },
            imagePart
        ]},
    });
    
    return response.text;
};

export const generateInitialStyles = async (originalImageFile: File): Promise<DecorationStyle[]> => {
    const base64Image = await fileToBase64(originalImageFile);
    
    const stylesToGenerate = [
        { id: 'nordico', name: 'Nórdico', prompt: 'Redecora esta habitación con un estilo nórdico (escandinavo). Prioriza la luz natural, utiliza maderas claras, textiles acogedores y una paleta de colores blancos, grises y pasteles.' },
        { id: 'moderno', name: 'Moderno', prompt: 'Redecora esta habitación con un estilo moderno. Utiliza líneas limpias, una paleta de colores neutros con toques de color audaces y mobiliario minimalista.' },
        { id: 'clasico', name: 'Clásico Contemporáneo', prompt: 'Redecora esta habitación con un estilo clásico contemporáneo. Combina elementos clásicos como molduras con mobiliario moderno y elegante. Utiliza una paleta de colores sofisticada y materiales de lujo.' },
    ];

    const results = await Promise.all(stylesToGenerate.map(async (style) => {
        const [imageDataUrl, details] = await Promise.all([
            generateStyledImage(base64Image, originalImageFile.type, style.prompt),
            getStyleDetails(style.name)
        ]);
        
        return {
            id: style.id,
            name: style.name,
            image: imageDataUrl,
            ...details,
            originalImageMimeType: originalImageFile.type,
        };
    }));
    
    return results;
};

export const editImageWithPrompt = async (base64ImageWithDataPrefix: string, mimeType: string, prompt: string): Promise<string> => {
    const base64Data = base64ImageWithDataPrefix.split(',')[1];
    if (!base64Data) {
        throw new Error("Formato de imagen base64 inválido.");
    }
    const newImage = await generateStyledImage(base64Data, mimeType, prompt);
    return newImage;
};
    return result.image;
};

