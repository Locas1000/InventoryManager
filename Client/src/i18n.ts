import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "Inventory Manager": "Inventory Manager",
            "Admin Panel": "Admin Panel",
            "Search": "Search inventories...",
            "Logout": "Logout",
            "Login": "Login / Register",
        }
    },
    es: {
        translation: {
            "Inventory Manager": "Gestor de Inventario",
            "Admin Panel": "Panel de Administración",
            "Search": "Buscar inventarios...",
            "Logout": "Cerrar Sesión",
            "Login": "Iniciar Sesión / Registrarse",
        }
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: "es", // Starting in Spanish as requested
    fallbackLng: "en",
    interpolation: { escapeValue: false }
});

export default i18n;