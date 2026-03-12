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
            
            "welcome_title": "Welcome to Inventory Manager",
            "latest_inventories": "Latest Inventories",
            "top_5_popular": "Top 5 Most Popular",
            "table_title": "Title",
            "table_creator": "Creator",
            "table_description": "Description",
            "table_rank": "Rank",
            "table_items": "Items",
            "no_inventories_found": "No inventories found.",
            "no_items_exist": "No items exist yet.",
            "explore_tags": "Explore Tags",
            "click_tag_search": "Click a tag to search for related inventories."
        }
    },
    es: {
        translation: {
            "Inventory Manager": "Gestor de Inventario",
            "Admin Panel": "Panel de Administración",
            "Search": "Buscar inventarios...",
            "Logout": "Cerrar Sesión",
            "Login": "Iniciar Sesión / Registrarse",
            
            "welcome_title": "Bienvenido a Gestor de Inventario",
            "latest_inventories": "Últimos Inventarios",
            "top_5_popular": "Los 5 Más Populares",
            "table_title": "Título",
            "table_creator": "Creador",
            "table_description": "Descripción",
            "table_rank": "Rango",
            "table_items": "Artículos",
            "no_inventories_found": "No se encontraron inventarios.",
            "no_items_exist": "No hay artículos todavía.",
            "explore_tags": "Explorar Etiquetas",
            "click_tag_search": "Haz clic en una etiqueta para buscar inventarios relacionados."
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