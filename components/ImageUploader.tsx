
import React, { useRef, useState, useCallback } from 'react';
import { ImageData } from '../types';
import { CameraIcon, UploadIcon } from './IconComponents';

interface ImageUploaderProps {
    onImageUpload: (image: ImageData) => void;
    isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };
    
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            onImageUpload({
                file,
                dataUrl: reader.result as string,
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const onButtonClick = (ref: React.RefObject<HTMLInputElement>) => {
        ref.current?.click();
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            processFile(event.dataTransfer.files[0]);
        }
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    if (preview) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center">
                <img src={preview} alt="Vista previa" className="rounded-lg shadow-lg max-h-[60vh] object-contain"/>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center">
             <div 
                className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#FF5100] hover:bg-orange-50 transition-colors"
                onClick={() => onButtonClick(fileInputRef)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
             >
                <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-lg font-medium text-[#2D2D2D]">
                    Arrastra una foto o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">
                    Sube una foto de tu ambiente
                </p>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
            </div>

            <div className="my-4 text-gray-500 font-semibold">O</div>
            
            <button
                onClick={() => onButtonClick(cameraInputRef)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#2D2D2D] text-white rounded-lg font-semibold hover:bg-[#4d4d4d] transition-colors disabled:bg-gray-400"
            >
                <CameraIcon className="w-6 h-6" />
                Usar la cámara
            </button>
            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" disabled={isLoading} />
        </div>
    );
};

export default ImageUploader;
