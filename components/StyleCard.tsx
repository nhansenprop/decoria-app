import React, { useState } from 'react';
import { DecorationStyle } from '../types';
import { ShoppingCartIcon } from './IconComponents';

interface StyleCardProps {
    style: DecorationStyle;
    onEdit: (styleId: string, prompt: string) => void;
    isLoading: boolean; // Is this specific card loading?
    isSelectedForEditing: boolean;
    onSelectForEditing: (styleId: string | null) => void;
}

const StyleCard: React.FC<StyleCardProps> = ({ style, onEdit, isLoading, isSelectedForEditing, onSelectForEditing }) => {
    const [prompt, setPrompt] = useState('');
    
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onEdit(style.id, prompt);
        }
    };
    
    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${isSelectedForEditing ? 'ring-4 ring-offset-2 ring-[#FF5100]' : 'ring-0'}`}>
            <div className="relative">
                 <img src={style.image} alt={style.name} className="w-full h-64 object-cover" />
                 {isLoading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-400 border-t-[#FF5100] rounded-full animate-spin"></div>
                        <span className="sr-only">Generando...</span>
                    </div>
                 )}
            </div>
           
            <div className="p-6">
                <h3 className="text-2xl font-bold text-[#2D2D2D]">{style.name}</h3>
                <p className="mt-2 text-gray-600 text-sm">{style.description}</p>

                <div className="mt-6">
                    <h4 className="font-semibold text-[#2D2D2D]">Mobiliario recomendado</h4>
                    <p className="text-gray-600 text-sm">{style.furnitureRecs}</p>
                </div>

                <div className="mt-4">
                    <h4 className="font-semibold text-[#2D2D2D]">Paleta de colores</h4>
                    <p className="text-gray-600 text-sm">{style.colorRecs}</p>
                </div>
                
                <div className="mt-6">
                    <h4 className="font-semibold text-[#2D2D2D]">Ideas de decoración</h4>
                    <ul className="mt-2 space-y-2">
                        {style.products.slice(0, 5).map((product, index) => (
                            <li key={index}>
                                <a 
                                    href={`https://listado.mercadolibre.com.ar/${product.name.replace(/ /g, "-")}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-[#FF5100] hover:underline text-sm font-medium"
                                >
                                    <ShoppingCartIcon className="w-4 h-4" />
                                    {product.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="mt-6">
                    {isSelectedForEditing ? (
                        <form onSubmit={handleEditSubmit}>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ej: Cambia el sofá a color azul, agrega una planta grande..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF5100] focus:border-transparent transition"
                                rows={3}
                                disabled={isLoading}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full px-4 py-2 bg-[#FF5100] text-white rounded-md font-semibold hover:bg-orange-600 disabled:bg-orange-300 transition-colors">
                                    {isLoading ? 'Generando...' : 'Generar Ajuste'}
                                </button>
                                <button type="button" onClick={() => onSelectForEditing(null)} className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100" disabled={isLoading}>
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => onSelectForEditing(style.id)}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-[#2D2D2D] text-white rounded-md font-semibold hover:bg-[#4d4d4d] transition-colors disabled:bg-gray-400"
                        >
                            Ajustar este estilo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StyleCard;
