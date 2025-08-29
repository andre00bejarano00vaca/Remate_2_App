// Paleta de colores profesional para aplicación ganadera
export const CattleColors = {
    // Colores principales - Paleta neutra y profesional
    primary: '#2C3E50',        // Azul oscuro profesional
    secondary: '#34495E',      // Azul grisáceo
    accent: '#E67E22',         // Naranja cálido para acentos
    neutral: '#ECF0F1',        // Gris muy claro, casi blanco
    
    // Colores base
    white: '#FFFFFF',          // Blanco puro
    black: '#1A1A1A',         // Negro suave
    
    // Escala de grises profesionales
    lightGray: '#F8F9FA',     // Gris muy claro
    mediumLightGray: '#E9ECEF', // Gris claro
    mediumGray: '#6C757D',    // Gris medio
    darkGray: '#495057',      // Gris oscuro
    charcoal: '#343A40',      // Gris carbón
    
    // Colores de estado
    success: '#27AE60',       // Verde profesional
    warning: '#F39C12',       // Naranja de advertencia
    error: '#E74C3C',         // Rojo profesional
    info: '#3498DB',          // Azul informativo
    
    // Colores específicos para ganado
    cattle: '#8B4513',        // Marrón ganado
    pasture: '#228B22',       // Verde pasto
    leather: '#CD853F',       // Marrón cuero
    
    // Transparencias y sombras
    overlay: 'rgba(44, 62, 80, 0.8)',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    textShadow: 'rgba(0, 0, 0, 0.2)',
};

export const CattleTypography = {
    // Tipografías profesionales
    h1: {
        fontSize: 32,
        fontWeight: '700',
        color: CattleColors.primary,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 28,
        fontWeight: '600',
        color: CattleColors.primary,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600',
        color: CattleColors.secondary,
    },
    h4: {
        fontSize: 20,
        fontWeight: '500',
        color: CattleColors.secondary,
    },
    
    // Texto del cuerpo
    body: {
        fontSize: 16,
        color: CattleColors.black,
        lineHeight: 24,
        fontWeight: '400',
    },
    bodySmall: {
        fontSize: 14,
        color: CattleColors.mediumGray,
        lineHeight: 20,
        fontWeight: '400',
    },
    
    // Texto destacado
    highlight: {
        fontSize: 18,
        fontWeight: '600',
        color: CattleColors.accent,
    },
    
    // Texto de estado
    status: {
        fontSize: 12,
        fontWeight: '500',
        color: CattleColors.white,
    },
};

export const CattleShadows = {
    // Sombras sutiles y profesionales
    card: {
        shadowColor: CattleColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    
    button: {
        shadowColor: CattleColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    
    floating: {
        shadowColor: CattleColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
};

