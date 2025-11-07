
export interface Product {
  name: string;
  url: string;
}

export interface DecorationStyle {
  id: string;
  name: string;
  image: string; // base64 data URL
  description: string;
  furnitureRecs: string;
  colorRecs: string;
  products: Product[];
  originalImageMimeType: string;
}

export interface ImageData {
    file: File;
    dataUrl: string;
    mimeType: string;
}
