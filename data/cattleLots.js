// Datos de lotes de ganado para el remate
export const cattleLots = [
    { 
        id: 1, 
        numero: "L-001", 
        raza: "Brahman", 
        peso: "450 kg", 
        preoferta: "$2,500", 
        estado: "Disponible",
        descripcion: "Toro Brahman de excelente genética, criado en pastos naturales. Ideal para reproducción y mejora de hatos.",
        caracteristicas: ["Edad: 3 años", "Genética certificada", "Vacunas al día", "Libre de enfermedades"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    { 
        id: 2, 
        numero: "L-002", 
        raza: "Angus", 
        peso: "520 kg", 
        preoferta: "$3,200", 
        estado: "Reservado",
        descripcion: "Vaca Angus de alta calidad, con excelente conformación y temperamento dócil. Perfecta para cría.",
        caracteristicas: ["Edad: 4 años", "Parida 2 veces", "Excelente madre", "Temperamento dócil"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    { 
        id: 3, 
        numero: "L-003", 
        raza: "Hereford", 
        peso: "480 kg", 
        preoferta: "$2,800", 
        estado: "Disponible",
        descripcion: "Toro Hereford de raza pura, con excelente desarrollo muscular y características raciales definidas.",
        caracteristicas: ["Edad: 2.5 años", "Raza pura", "Desarrollo muscular", "Características raciales"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    { 
        id: 4, 
        numero: "L-004", 
        raza: "Simmental", 
        peso: "510 kg", 
        preoferta: "$3,000", 
        estado: "Disponible",
        descripcion: "Vaca Simmental de doble propósito, excelente para producción de leche y carne de calidad.",
        caracteristicas: ["Edad: 3.5 años", "Doble propósito", "Alta producción", "Genética superior"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    { 
        id: 5, 
        numero: "L-005", 
        raza: "Brahman", 
        peso: "470 kg", 
        preoferta: "$2,600", 
        estado: "Disponible",
        descripcion: "Toro Brahman joven, con excelente adaptación al clima tropical y resistencia a parásitos.",
        caracteristicas: ["Edad: 2 años", "Clima tropical", "Resistente a parásitos", "Adaptación superior"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    },
    { 
        id: 6, 
        numero: "L-006", 
        raza: "Angus", 
        peso: "490 kg", 
        preoferta: "$2,900", 
        estado: "Disponible",
        descripcion: "Vaca Angus de primera calidad, con excelente conformación cárnica y genética superior.",
        caracteristicas: ["Edad: 3 años", "Conformación cárnica", "Genética superior", "Alta calidad"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    },
    { 
        id: 7, 
        numero: "L-007", 
        raza: "Simmental", 
        peso: "540 kg", 
        preoferta: "$3,500", 
        estado: "Reservado",
        descripcion: "Toro Simmental premium, con excelente desarrollo y características raciales excepcionales.",
        caracteristicas: ["Edad: 4 años", "Premium", "Desarrollo excepcional", "Características únicas"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
    },
    { 
        id: 8, 
        numero: "L-008", 
        raza: "Hereford", 
        peso: "460 kg", 
        preoferta: "$2,700", 
        estado: "Disponible",
        descripcion: "Vaca Hereford de excelente calidad, ideal para cría y producción de terneros superiores.",
        caracteristicas: ["Edad: 3 años", "Ideal para cría", "Terneros superiores", "Calidad excepcional"],
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    },
];

// URLs de video alternativas para casos de fallo
export const fallbackVideos = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
];

// Información adicional para cada raza
export const breedInfo = {
    "Brahman": {
        origen: "India",
        caracteristicas: ["Resistente al calor", "Resistente a parásitos", "Excelente adaptación tropical"],
        uso: "Carne y reproducción"
    },
    "Angus": {
        origen: "Escocia",
        caracteristicas: ["Excelente conformación cárnica", "Temperamento dócil", "Alta calidad de carne"],
        uso: "Carne premium"
    },
    "Hereford": {
        origen: "Inglaterra",
        caracteristicas: ["Raza pura", "Desarrollo muscular", "Características raciales definidas"],
        uso: "Carne y reproducción"
    },
    "Simmental": {
        origen: "Suiza",
        caracteristicas: ["Doble propósito", "Alta producción", "Genética superior"],
        uso: "Leche y carne"
    }
};
