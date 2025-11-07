/**
 * Guarda el correo electrónico de un usuario llamando a nuestro endpoint de backend.
 * No bloquea la ejecución si falla, solo mostrará un error en la consola.
 * @param email La dirección de correo del usuario.
 */
export const saveEmailToSpreadsheet = async (email: string): Promise<void> => {
    try {
        const response = await fetch('/api/saveEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        
        if (!response.ok) {
           const errorData = await response.json();
           console.error('Error al guardar el correo:', errorData.error);
        }
    } catch (error) {
        console.error('Error al conectar con el servicio para guardar correo:', error);
    }
};
