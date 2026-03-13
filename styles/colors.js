// Paleta de colores profesional para aplicación ganadera
export const CattleColors = {
    // Colores principales - Paleta minimalista verde
    primary: '#0B3D2E',        // Verde oscuro principal
    secondary: '#145A32',      // Verde secundario
    accent: '#C9A227',         // Dorado para acentos
    neutral: '#F5F7F6',        // Blanco suave

    // Colores base
    white: '#FFFFFF',          // Blanco puro
    black: '#111111',         // Negro suave

    // Escala de grises
    lightGray: '#F2F4F3',     // Gris muy claro
    mediumLightGray: '#E3E7E5', // Gris claro
    mediumGray: '#7A8A84',    // Gris medio verdoso
    darkGray: '#3E4A45',      // Gris oscuro
    charcoal: '#232A27',      // Gris carbón

    // Colores de estado
    success: '#1E8E5A',       // Verde éxito
    warning: '#D4A017',       // Dorado advertencia
    error: '#D64541',         // Rojo profesional
    info: '#2F6F5E',          // Verde informativo

    // Transparencias y sombras
    overlay: 'rgba(11, 61, 46, 0.8)',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    textShadow: 'rgba(0, 0, 0, 0.16)',
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

