/**
 * Guarda el correo electrónico de un usuario directamente en un Google Sheets Web App.
 * No bloquea la ejecución si falla, solo mostrará un error en la consola.
 * @param email La dirección de correo del usuario.
 */
export const saveEmailToSpreadsheet = async (email: string): Promise<void> => {
    // IMPORTANTE: Reemplaza esta URL con la URL de tu propia Web App de Google Sheets.
    const SPREADSHEET_WEB_APP_URL = 'REEMPLAZAR_CON_TU_GOOGLE_SHEET_WEB_APP_URL';

    if (SPREADSHEET_WEB_APP_URL === 'REEMPLAZAR_CON_TU_GOOGLE_SHEET_WEB_APP_URL') {
        console.warn('La URL de Google Sheets no está configurada. El correo no se guardará.');
        return;
    }

    try {
        await fetch(SPREADSHEET_WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
    } catch (error) {
        console.error('Error al conectar con el servicio para guardar correo:', error);
    }
};
