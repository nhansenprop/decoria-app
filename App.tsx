import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import StyleCard from './components/StyleCard';
import EmailCaptureModal from './components/EmailCaptureModal';
import { saveEmailToSpreadsheet } from './services/googleSheetsService';
import { analyzeImage, generateInitialStyles, editImageWithPrompt } from './services/geminiService';
import { ImageData, DecorationStyle } from './types';

function App() {
    const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [generatedStyles, setGeneratedStyles] = useState<DecorationStyle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const handleImageUpload = (image: ImageData) => {
        setOriginalImage(image);
        setError(null);
        setGeneratedStyles([]);
        setAnalysisResult(null);
        setIsEmailModalOpen(true);
    };
    
    const startGenerationProcess = async (email: string) => {
        if (!originalImage) return;

        // Non-blocking call to save the email via our backend
        saveEmailToSpreadsheet(email);
        setIsEmailModalOpen(false);

        try {
            setIsLoading(true);

            setLoadingMessage('Analizando tu espacio...');
            const analysis = await analyzeImage(originalImage.file);
            setAnalysisResult(analysis);

            setLoadingMessage('Generando propuestas de decoración...');
            const styles = await generateInitialStyles(originalImage.file);
            setGeneratedStyles(styles);

        } catch (e) {
            const err = e as Error;
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };


    const handleEditStyle = async (styleId: string, prompt: string) => {
        const styleToEdit = generatedStyles.find(s => s.id === styleId);
        if (!styleToEdit) return;

        setError(null);
        setIsLoading(true);
        setSelectedStyleId(styleId); // Ensure the selected style is set for loading indicator
        setLoadingMessage('Aplicando tus ajustes...');

        try {
            const newImage = await editImageWithPrompt(styleToEdit.image, styleToEdit.originalImageMimeType, prompt);

            setGeneratedStyles(prevStyles =>
                prevStyles.map(style =>
                    style.id === styleId ? { ...style, image: newImage } : style
                )
            );
        } catch (e) {
            const err = e as Error;
            setError(err.message || 'Ocurrió un error al editar la imagen.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const resetApp = () => {
        setOriginalImage(null);
        setAnalysisResult(null);
        setGeneratedStyles([]);
        setError(null);
        setIsLoading(false);
        setSelectedStyleId(null);
        setIsEmailModalOpen(false);
    };

    return (
        <div className="bg-gray-50 min-h-screen text-brand-gray">
            <Header />
            <EmailCaptureModal
                isOpen={isEmailModalOpen}
                onSubmit={startGenerationProcess}
                isProcessing={isLoading && !analysisResult} // Modal processing is only for the initial step
            />
            <main className="container mx-auto px-4 py-8">
                {isLoading && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg font-semibold text-brand-gray">{loadingMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                           <span className="text-2xl">&times;</span>
                        </button>
                    </div>
                )}
                
                {!originalImage && <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />}
                
                 {originalImage && (
                    <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold text-brand-gray">Tu Espacio</h2>
                                {analysisResult ? (
                                    <p className="mt-2 text-gray-600 text-sm">{analysisResult}</p>
                                ) : (
                                    !isLoading && !generatedStyles.length && <p className="mt-2 text-gray-600 text-sm">Análisis pendiente...</p>
                                )}
                            </div>
                            <button onClick={resetApp} className="px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto">
                                Subir otra foto
                            </button>
                        </div>
                    </div>
                )}

                {generatedStyles.length > 0 && (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-8 text-brand-gray">Aquí tienes tus propuestas</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {generatedStyles.map(style => (
                                <StyleCard
                                    key={style.id}
                                    style={style}
                                    onEdit={handleEditStyle}
                                    isLoading={isLoading && selectedStyleId === style.id}
                                    isSelectedForEditing={selectedStyleId === style.id}
                                    onSelectForEditing={isLoading ? () => {} : setSelectedStyleId}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
