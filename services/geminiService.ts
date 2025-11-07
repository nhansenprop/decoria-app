import { DecorationStyle } from '../types';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// Helper function to call our secure backend
const callApi = async (endpoint: string, body: object) => {
    const response = await fetch(`/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, ...body }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error en el servidor.');
    }

    return response.json();
};


export const analyzeImage = async (imageFile: File): Promise<string> => {
    const base64Image = await fileToBase64(imageFile);
    const result = await callApi('analyzeImage', { 
        image: base64Image, 
        mimeType: imageFile.type 
    });
    return result.text;
};

export const generateInitialStyles = async (originalImageFile: File): Promise<DecorationStyle[]> => {
     const base64Image = await fileToBase64(originalImageFile);
     const result = await callApi('generateInitialStyles', {
        image: base64Image,
        mimeType: originalImageFile.type
     });
     return result.styles;
};

export const editImageWithPrompt = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const base64Data = base64Image.split(',')[1];
    const result = await callApi('editImageWithPrompt', {
        image: base64Data,
        mimeType,
        prompt
    });
    return result.image;
};
