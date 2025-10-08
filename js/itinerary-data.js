/* ===================================
   DATOS DEL ITINERARIO - 15 DÍAS EN JAPÓN
   =================================== */

   const ITINERARY_DATA = [
    {
        day: 1, 
        date: "Feb 16 - Domingo", 
        title: "Llegada a Tokyo", 
        location: "Shinjuku", 
        hotel: "Hotel Tokyo Papa Shinjuku", 
        budget: 63,
        activities: [
            {
                time: "6:30 AM", 
                icon: "✈️", 
                title: "Llegada Narita", 
                desc: "Vuelo AM58 desde Monterrey", 
                cost: 0, 
                id: "1-0"
            },
            {
                time: "8:00 AM", 
                icon: "🚆", 
                title: "Narita Express → Shinjuku", 
                desc: "Comprar Welcome Suica Card", 
                cost: 23, 
                train: {
                    from: "Narita Airport Terminal 1", 
                    to: "Shinjuku Station", 
                    line: "Narita Express (N'EX)", 
                    duration: "90 min"
                }, 
                id: "1-1"
            },
            {
                time: "10:30 AM", 
                icon: "📸", 
                title: "Shinjuku Gyoen Garden", 
                desc: "Jardín nacional, 2 horas de paseo", 
                cost: 3.5, 
                station: "Shinjuku-Gyoemmae (5 min walk)", 
                id: "1-2"
            },
            {
                time: "1:00 PM", 
                icon: "🍜", 
                title: "Ichiran Ramen", 
                desc: "¡Primer ramen japonés auténtico!", 
                cost: 9, 
                station: "Shinjuku Station área", 
                id: "1-3"
            },
            {
                time: "4:00 PM", 
                icon: "⭐", 
                title: "Tokyo Metropolitan Govt Building", 
                desc: "Vista panorámica 360° GRATIS", 
                cost: 0, 
                station: "Tochomae Station (Exit A4)", 
                id: "1-4"
            },
            {
                time: "6:00 PM", 
                icon: "🍢", 
                title: "Cena en Omoide Yokocho", 
                desc: "Yakitori en callejones nostálgicos", 
                cost: 35, 
                station: "Shinjuku West Exit", 
                id: "1-5"
            }
        ]
    },
    {
        day: 2, 
        date: "Feb 17 - Lunes", 
        title: "Kamakura Day Trip", 
        location: "Kamakura", 
        hotel: "Hotel Tokyo Papa Shinjuku", 
        budget: 72,
        activities: [
            {
                time: "9:00 AM", 
                icon: "🚆", 
                title: "JR Line → Kamakura", 
                desc: "57 minutos directo", 
                cost: 7, 
                train: {
                    from: "Shinjuku Station", 
                    to: "Kamakura Station", 
                    line: "JR Shonan-Shinjuku Line", 
                    duration: "57 min"
                }, 
                id: "2-0"
            },
            {
                time: "10:15 AM", 
                icon: "⛩️", 
                title: "Tsurugaoka Hachimangu", 
                desc: "Santuario principal de Kamakura, gratis", 
                cost: 0, 
                station: "10 min walk from Kamakura Station", 
                id: "2-1"
            },
            {
                time: "11:30 AM", 
                icon: "🏯", 
                title: "Hasedera Temple", 
                desc: "Templo en la colina con vistas al mar", 
                cost: 3, 
                station: "Hase Station (Enoden Line)", 
                id: "2-2"
            },
            {
                time: "12:45 PM", 
                icon: "🗿", 
                title: "Great Buddha (Kotoku-in)", 
                desc: "¡Buda gigante de bronce de 13.35m!", 
                cost: 2.5, 
                station: "7 min walk from Hase Station", 
                id: "2-3"
            },
            {
                time: "5:30 PM", 
                icon: "🥪", 
                title: "AGE.3 en Ginza", 
                desc: "Sándwiches fritos virales de TikTok", 
                cost: 10, 
                station: "Ginza Station (Marunouchi Line)", 
                id: "2-4"
            },
            {
                time: "8:00 PM", 
                icon: "🥩", 
                title: "Yakiniku Rikimaru", 
                desc: "All-you-can-eat BBQ japonés 90 min", 
                cost: 26, 
                station: "Ikebukuro Station (East Exit)", 
                id: "2-5"
            }
        ]
    },
    {
        day: 3, 
        date: "Feb 18 - Martes", 
        title: "Tokyo Highlights", 
        location: "Tokyo", 
        hotel: "Hotel Tokyo Papa Shinjuku", 
        budget: 70,
        activities: [
            {
                time: "9:00 AM", 
                icon: "⭐", 
                title: "Tokyo Station Character Street", 
                desc: "Pokemon, Kirby, Ghibli shops en B1F", 
                cost: 0, 
                station: "Tokyo Station (B1F First Avenue)", 
                id: "3-0"
            },
            {
                time: "11:00 AM", 
                icon: "⛩️", 
                title: "Asakusa - Sensoji Temple", 
                desc: "Templo más antiguo + Nakamise Street", 
                cost: 0, 
                station: "Asakusa Station (Exit 1)", 
                id: "3-1"
            },
            {
                time: "12:00 PM", 
                icon: "🐟", 
                title: "Taiyaki en Asakusa", 
                desc: "Naruto Taiyaki Honpo - con relleno!", 
                cost: 2.5, 
                id: "3-2"
            },
            {
                time: "12:30 PM", 
                icon: "🍣", 
                title: "Kaiten Sushi", 
                desc: "¡Sushi en cinta transportadora!", 
                cost: 18, 
                station: "Kura Sushi - múltiples ubicaciones", 
                id: "3-3"
            },
            {
                time: "2:30 PM", 
                icon: "🎮", 
                title: "Akihabara", 
                desc: "Distrito electrónico + anime paradise", 
                cost: 0, 
                station: "Akihabara Station (Electric Town Exit)", 
                id: "3-4"
            },
            {
                time: "3:30 PM", 
                icon: "☕", 
                title: "Cafe Mai:lish", 
                desc: "Steins;Gate themed maid cafe", 
                cost: 13, 
                station: "5 min walk from Akihabara", 
                id: "3-5"
            },
            {
                time: "6:00 PM", 
                icon: "🌆", 
                title: "Shibuya Sky", 
                desc: "Rooftop al aire libre en piso 47", 
                cost: 18, 
                station: "Shibuya Station (Hachiko Exit)", 
                id: "3-6"
            },
            {
                time: "7:30 PM", 
                icon: "🚶", 
                title: "Shibuya Crossing", 
                desc: "¡El cruce peatonal más famoso del mundo!", 
                cost: 0, 
                station: "Shibuya Station (Hachiko Exit)", 
                id: "3-7"
            }
        ]
    },
    {
        day: 4, 
        date: "Feb 19 - Miércoles", 
        title: "Tokyo → Kyoto", 
        location: "Kyoto", 
        hotel: "Tune Stay Kyoto", 
        budget: 133,
        activities: [
            {
                time: "9:00 AM", 
                icon: "🚄", 
                title: "Shinkansen Hikari → Kyoto", 
                desc: "2h 20min en tren bala", 
                cost: 93, 
                train: {
                    from: "Tokyo Station", 
                    to: "Kyoto Station", 
                    line: "Tokaido Shinkansen (Hikari)", 
                    platform: "Platforms 14-19", 
                    duration: "2h 20min"
                }, 
                id: "4-0"
            },
            {
                time: "11:30 AM", 
                icon: "🏨", 
                title: "Check-in Tune Stay Kyoto", 
                desc: "5 min caminando desde Kyoto Station", 
                cost: 0, 
                station: "5 min walk from Kyoto Station", 
                id: "4-1"
            },
            {
                time: "1:30 PM", 
                icon: "⛩️", 
                title: "Nishi Hongan-ji", 
                desc: "UNESCO World Heritage site, entrada gratis", 
                cost: 0, 
                station: "8 min walk from hotel", 
                id: "4-2"
            },
            {
                time: "5:00 PM", 
                icon: "👘", 
                title: "Distrito Gion", 
                desc: "Buscar geishas en calles tradicionales", 
                cost: 0, 
                station: "Gion-Shijo Station (Keihan Line)", 
                id: "4-3"
            },
            {
                time: "6:30 PM", 
                icon: "🍱", 
                title: "Cena en Pontocho", 
                desc: "Callejón tradicional junto al río Kamo", 
                cost: 35, 
                station: "Between Shijo and Sanjo", 
                id: "4-4"
            }
        ]
    },
    {
        day: 5, 
        date: "Feb 20 - Jueves", 
        title: "Nara Day Trip", 
        location: "Nara", 
        hotel: "Tune Stay Kyoto", 
        budget: 47,
        activities: [
            {
                time: "8:15 AM", 
                icon: "🚆", 
                title: "JR Nara Line → Nara", 
                desc: "45 minutos desde Kyoto", 
                cost: 5, 
                train: {
                    from: "Kyoto Station", 
                    to: "Nara Station", 
                    line: "JR Nara Line (Miyakoji Rapid)", 
                    platform: "Platforms 8-10", 
                    duration: "45 min"
                }, 
                id: "5-0"
            },
            {
                time: "9:30 AM", 
                icon: "🦌", 
                title: "Nara Park - Alimentar venados", 
                desc: "¡Los venados sagrados se inclinan!", 
                cost: 1.5, 
                station: "15 min walk from JR Nara Station", 
                id: "5-1"
            },
            {
                time: "10:30 AM", 
                icon: "🏯", 
                title: "Todai-ji Temple", 
                desc: "Gran Buda de bronce de 15 metros", 
                cost: 6, 
                station: "Inside Nara Park", 
                id: "5-2"
            },
            {
                time: "11:45 AM", 
                icon: "🏮", 
                title: "Kasuga Taisha Shrine", 
                desc: "Miles de linternas de piedra y bronce", 
                cost: 3.5, 
                station: "15 min walk through forest", 
                id: "5-3"
            },
            {
                time: "2:00 PM", 
                icon: "🍡", 
                title: "Nakatanidou Mochi", 
                desc: "¡Show de mochi golpeado a alta velocidad!", 
                cost: 1.5, 
                station: "Near Kintetsu Nara Station", 
                id: "5-4"
            },
            {
                time: "5:30 PM", 
                icon: "⛩️", 
                title: "Fushimi Inari Shrine", 
                desc: "Mil puertas torii naranjas", 
                cost: 0, 
                station: "Inari Station (JR Nara Line, 5 min from Kyoto)", 
                id: "5-5"
            },
            {
                time: "7:30 PM", 
                icon: "🍜", 
                title: "Ramen en Kyoto Station", 
                desc: "Kyoto Ramen Street - múltiples opciones", 
                cost: 11, 
                station: "Kyoto Station Ramen Street (10F)", 
                id: "5-6"
            }
        ]
    },
    {
        day: 6, 
        date: "Feb 21 - Viernes", 
        title: "Arashiyama → Osaka", 
        location: "Osaka", 
        hotel: "Toyoko Inn Osaka Namba", 
        budget: 57,
        activities: [
            {
                time: "8:00 AM", 
                icon: "🚆", 
                title: "JR → Arashiyama", 
                desc: "15 minutos desde Kyoto", 
                cost: 1.7, 
                train: {
                    from: "Kyoto Station", 
                    to: "Saga-Arashiyama Station", 
                    line: "JR Sagano Line", 
                    duration: "15 min"
                }, 
                id: "6-0"
            },
            {
                time: "8:30 AM", 
                icon: "🎋", 
                title: "Arashiyama Bamboo Grove", 
                desc: "¡Llegar temprano para evitar multitudes!", 
                cost: 0, 
                station: "10 min walk from Saga-Arashiyama", 
                id: "6-1"
            },
            {
                time: "9:30 AM", 
                icon: "🏯", 
                title: "Tenryu-ji Temple", 
                desc: "Jardín zen hermoso y tranquilo", 
                cost: 3.5, 
                station: "Near bamboo grove entrance", 
                id: "6-2"
            },
            {
                time: "2:00 PM", 
                icon: "🚆", 
                title: "Kyoto → Osaka", 
                desc: "29 minutos en JR Special Rapid", 
                cost: 4, 
                train: {
                    from: "Kyoto Station", 
                    to: "Osaka Station", 
                    line: "JR Kyoto Line (Special Rapid)", 
                    platform: "Platforms 4-7", 
                    duration: "29 min"
                }, 
                id: "6-3"
            },
            {
                time: "3:00 PM", 
                icon: "🚇", 
                title: "Osaka → Namba", 
                desc: "Metro transfer", 
                cost: 2, 
                train: {
                    from: "Osaka Station", 
                    to: "Namba Station", 
                    line: "Midosuji Line (Red Line)", 
                    duration: "10 min"
                }, 
                id: "6-4"
            },
            {
                time: "6:00 PM", 
                icon: "🐙", 
                title: "TAKOYAKI en Dotonbori", 
                desc: "Wanaka + Kukuru - los mejores!", 
                cost: 6, 
                station: "5 min walk from Namba Station", 
                id: "6-5"
            },
            {
                time: "7:00 PM", 
                icon: "🥞", 
                title: "OKONOMIYAKI", 
                desc: "¡Comida emblema de Osaka!", 
                cost: 12, 
                station: "Dotonbori area", 
                id: "6-6"
            },
            {
                time: "8:30 PM", 
                icon: "🌃", 
                title: "Dotonbori de noche", 
                desc: "Glico Running Man + luces neón", 
                cost: 0, 
                station: "Walk around Dotonbori canal", 
                id: "6-7"
            }
        ]
    },
    {
        day: 7, 
        date: "Feb 22 - Sábado", 
        title: "Osaka Aquarium", 
        location: "Osaka", 
        hotel: "Toyoko Inn Osaka Namba", 
        budget: 60,
        activities: [
            {
                time: "7:00 AM", 
                icon: "🍳", 
                title: "Desayuno gratis hotel", 
                desc: "Buffet incluido 6:30-9:00 AM", 
                cost: 0, 
                id: "7-0"
            },
            {
                time: "9:00 AM", 
                icon: "🚇", 
                title: "Namba → Osakako", 
                desc: "Transfer en Bentencho", 
                cost: 2, 
                train: {
                    from: "Namba Station", 
                    to: "Osakako Station", 
                    line: "Chuo Line (Green)", 
                    transfer: "at Bentencho", 
                    duration: "30-40 min"
                }, 
                id: "7-1"
            },
            {
                time: "9:45 AM", 
                icon: "🐋", 
                title: "Osaka Aquarium Kaiyukan", 
                desc: "¡Tiburones ballena! Pasar 2-3 horas", 
                cost: 21, 
                station: "5 min walk from Osakako Station", 
                id: "7-2"
            },
            {
                time: "3:30 PM", 
                icon: "🍢", 
                title: "Kuromon Market", 
                desc: "Mercado de comida callejera", 
                cost: 18, 
                station: "Nipponbashi Station (Exit 10)", 
                id: "7-3"
            },
            {
                time: "5:00 PM", 
                icon: "🛍️", 
                title: "Shinsaibashi Shopping", 
                desc: "600m de arcade de tiendas cubiertas", 
                cost: 0, 
                station: "Shinsaibashi Station", 
                id: "7-4"
            },
            {
                time: "7:00 PM", 
                icon: "🥩", 
                title: "Yakiniku 298 Nikuya", 
                desc: "All-you-can-eat ¡súper barato!", 
                cost: 28, 
                station: "Near Shinsaibashi", 
                id: "7-5"
            }
        ]
    },
    {
        day: 8, 
        date: "Feb 23 - Domingo", 
        title: "Osaka → Tokyo", 
        location: "Tokyo - Otsuka", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 141,
        activities: [
            {
                time: "8:30 AM", 
                icon: "🚇", 
                title: "Namba → Shin-Osaka", 
                desc: "Transfer para Shinkansen", 
                cost: 2, 
                train: {
                    from: "Namba Station", 
                    to: "Shin-Osaka Station", 
                    line: "Midosuji Line", 
                    duration: "15 min"
                }, 
                id: "8-0"
            },
            {
                time: "9:00 AM", 
                icon: "🚄", 
                title: "Shinkansen Hikari → Tokyo", 
                desc: "2h 40min regreso a Tokyo", 
                cost: 93, 
                train: {
                    from: "Shin-Osaka Station", 
                    to: "Tokyo Station", 
                    line: "Tokaido Shinkansen (Hikari)", 
                    platform: "Platforms 21-26", 
                    duration: "2h 40min"
                }, 
                id: "8-1"
            },
            {
                time: "12:00 PM", 
                icon: "🚆", 
                title: "Tokyo → Otsuka", 
                desc: "10 minutos en Yamanote Line", 
                cost: 1.2, 
                train: {
                    from: "Tokyo Station", 
                    to: "Otsuka Station", 
                    line: "JR Yamanote Line", 
                    duration: "10 min"
                }, 
                id: "8-2"
            },
            {
                time: "12:15 PM", 
                icon: "🏨", 
                title: "Check-in Hotel Apa Otsuka", 
                desc: "Justo frente a la estación", 
                cost: 0, 
                station: "Right at Otsuka Station", 
                id: "8-3"
            },
            {
                time: "2:30 PM", 
                icon: "🏙️", 
                title: "Sunshine City Observatory", 
                desc: "Piso 60, vistas 360° de Tokyo", 
                cost: 6, 
                station: "Ikebukuro Station (1 stop, 2 min from Otsuka)", 
                id: "8-4"
            },
            {
                time: "7:00 PM", 
                icon: "🍵", 
                title: "Matcha Ice Cream - Suzukien", 
                desc: "7 niveles de intensidad de matcha!", 
                cost: 5, 
                station: "Asakusa Station", 
                id: "8-5"
            }
        ]
    },
    {
        day: 9, 
        date: "Feb 24 - Lunes", 
        title: "Tokyo Libre - Harajuku", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 63,
        activities: [
            {
                time: "10:00 AM", 
                icon: "👗", 
                title: "Harajuku Takeshita Street", 
                desc: "Moda juvenil y cultura kawaii", 
                cost: 0, 
                station: "Harajuku Station (Omotesando Exit)", 
                id: "9-0"
            },
            {
                time: "11:00 AM", 
                icon: "⛩️", 
                title: "Meiji Shrine", 
                desc: "Santuario en el bosque, entrada gratis", 
                cost: 0, 
                station: "5 min walk from Harajuku", 
                id: "9-1"
            },
            {
                time: "12:00 PM", 
                icon: "🐟", 
                title: "Taiyaki original", 
                desc: "Naniwaya Sohonten (desde 1909)", 
                cost: 2.5, 
                id: "9-2"
            },
            {
                time: "4:00 PM", 
                icon: "☕", 
                title: "Artnia Square Enix Cafe", 
                desc: "Café oficial de Square Enix en Shinjuku", 
                cost: 18, 
                station: "Shinjuku East Side Square", 
                id: "9-3"
            },
            {
                time: "7:30 PM", 
                icon: "🍽️", 
                title: "Cena final yakiniku o sushi", 
                desc: "¡Lo que más te haya gustado del viaje!", 
                cost: 35, 
                id: "9-4"
            }
        ]
    },
    {
        day: 10, 
        date: "Feb 25 - Martes", 
        title: "Día Libre Tokyo", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 70,
        activities: [
            {
                time: "Todo el día", 
                icon: "🗺️", 
                title: "Actividades sugeridas", 
                desc: "Odaiba, TeamLab, compras, Tokyo Skytree, Imperial Palace Gardens", 
                cost: 70, 
                id: "10-0"
            }
        ]
    },
    {
        day: 11, 
        date: "Feb 26 - Miércoles", 
        title: "Día Libre Tokyo", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 70,
        activities: [
            {
                time: "Todo el día", 
                icon: "🗺️", 
                title: "Más exploración", 
                desc: "Tsukiji Outer Market, Roppongi Hills, cafés temáticos, DisneySea", 
                cost: 70, 
                id: "11-0"
            }
        ]
    },
    {
        day: 12, 
        date: "Feb 27 - Jueves", 
        title: "Día Libre Tokyo", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 70,
        activities: [
            {
                time: "Todo el día", 
                icon: "⛰️", 
                title: "Aventura opcional", 
                desc: "Mount Takao hiking, Nikko day trip, o más compras en Shibuya/Ginza", 
                cost: 70, 
                id: "12-0"
            }
        ]
    },
    {
        day: 13, 
        date: "Feb 28 - Viernes", 
        title: "Día Libre Tokyo", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 70,
        activities: [
            {
                time: "Todo el día", 
                icon: "🛍️", 
                title: "Último día completo", 
                desc: "Compras finales de souvenirs, lugares pendientes, fotos", 
                cost: 70, 
                id: "13-0"
            }
        ]
    },
    {
        day: 14, 
        date: "Mar 1 - Sábado", 
        title: "Preparación para salida", 
        location: "Tokyo", 
        hotel: "Hotel Apa Yamanote Otsuka", 
        budget: 56,
        activities: [
            {
                time: "Día entero", 
                icon: "📦", 
                title: "Día ligero", 
                desc: "Comprar últimos souvenirs, empacar maletas, organizar", 
                cost: 0, 
                id: "14-0"
            },
            {
                time: "6:00 PM", 
                icon: "🍜", 
                title: "Cena temprano", 
                desc: "Último ramen o comida favorita", 
                cost: 35, 
                id: "14-1"
            },
            {
                time: "10:00 PM", 
                icon: "😴", 
                title: "Dormir temprano", 
                desc: "Wake up a las 4:30 AM mañana!", 
                cost: 0, 
                id: "14-2"
            }
        ]
    },
    {
        day: 15, 
        date: "Mar 2 - Domingo", 
        title: "Regreso a Casa", 
        location: "Aeropuerto Narita", 
        hotel: "Vuelo 9:30 AM", 
        budget: 26,
        activities: [
            {
                time: "4:30 AM", 
                icon: "⏰", 
                title: "Wake up!", 
                desc: "Última verificación de equipaje y pasaportes", 
                cost: 0, 
                id: "15-0"
            },
            {
                time: "5:30 AM", 
                icon: "🚆", 
                title: "Narita Express", 
                desc: "Otsuka → Tokyo Station → Narita (90 min total)", 
                cost: 22, 
                train: {
                    from: "Otsuka → Tokyo → Narita", 
                    to: "Narita Airport Terminal 1", 
                    line: "Yamanote Line + Narita Express", 
                    duration: "90 min total"
                }, 
                id: "15-1"
            },
            {
                time: "9:30 AM", 
                icon: "✈️", 
                title: "Vuelo AM58 de regreso", 
                desc: "¡Sayonara Japón! 👋🇯🇵 Arigato gozaimasu!", 
                cost: 0, 
                id: "15-2"
            }
        ]
    }
];

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITINERARY_DATA;
}