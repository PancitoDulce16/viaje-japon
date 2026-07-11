// Crowd Detector - Detector de Multitudes y Mejores Días
// Evita fechas problemáticas y sugiere mejores días para cada actividad

class CrowdDetector {
    constructor() {
        this.crowdDates = this.initCrowdDates();
        this.bestDays = this.initBestDays();
        this.bestTimes = this.initBestTimes();
        this.holidays = this.initJapaneseHolidays();
    }

    // FECHAS CON MULTITUDES EXTREMAS (2025-2028)
    initCrowdDates() {
        return {
            // Golden Week (1 semana más llena del año)
            "goldenWeek": [
                // 2025
                "2025-04-29", "2025-04-30", "2025-05-01", "2025-05-02",
                "2025-05-03", "2025-05-04", "2025-05-05", "2025-05-06",
                // 2026
                "2026-04-29", "2026-04-30", "2026-05-01", "2026-05-02",
                "2026-05-03", "2026-05-04", "2026-05-05", "2026-05-06",
                // 2027
                "2027-04-29", "2027-04-30", "2027-05-01", "2027-05-02",
                "2027-05-03", "2027-05-04", "2027-05-05", "2027-05-06",
                // 2028
                "2028-04-29", "2028-04-30", "2028-05-01", "2028-05-02",
                "2028-05-03", "2028-05-04", "2028-05-05", "2028-05-06"
            ],

            // Obon (Festival de verano - turismo interno masivo)
            "obon": [
                // 2025
                "2025-08-13", "2025-08-14", "2025-08-15", "2025-08-16",
                // 2026
                "2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16",
                // 2027
                "2027-08-13", "2027-08-14", "2027-08-15", "2027-08-16",
                // 2028
                "2028-08-13", "2028-08-14", "2028-08-15", "2028-08-16"
            ],

            // Sakura Peak (Flores de cerezo - turistazo)
            "sakuraPeak": [
                // Tokyo
                "2025-03-28", "2025-03-29", "2025-03-30", "2025-03-31",
                "2025-04-01", "2025-04-02", "2025-04-03", "2025-04-04", "2025-04-05",
                // Kyoto (1 semana después)
                "2025-04-05", "2025-04-06", "2025-04-07", "2025-04-08",
                "2025-04-09", "2025-04-10", "2025-04-11", "2025-04-12",

                // 2026 estimado
                "2026-03-25", "2026-03-26", "2026-03-27", "2026-03-28",
                "2026-03-29", "2026-03-30", "2026-03-31", "2026-04-01",
                "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05",
                "2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09"
            ],

            // Año Nuevo (3 días más caros/llenos)
            "newYear": [
                "2025-01-01", "2025-01-02", "2025-01-03",
                "2026-01-01", "2026-01-02", "2026-01-03",
                "2027-01-01", "2027-01-02", "2027-01-03",
                "2028-01-01", "2028-01-02", "2028-01-03"
            ],

            // Fines de semana largos (3+ días)
            "longWeekends": [
                // Coming of Age Day
                "2025-01-11", "2025-01-12", "2025-01-13",
                // Marine Day
                "2025-07-19", "2025-07-20", "2025-07-21",
                // Respect for the Aged Day + Autumn Equinox
                "2025-09-13", "2025-09-14", "2025-09-15",
                "2025-09-20", "2025-09-21", "2025-09-22", "2025-09-23"
            ]
        };
    }

    // FESTIVOS JAPONESES (2025-2028)
    initJapaneseHolidays() {
        return {
            "2025": [
                { date: "2025-01-01", name: "Año Nuevo", type: "nacional" },
                { date: "2025-01-13", name: "Coming of Age Day", type: "nacional" },
                { date: "2025-02-11", name: "Foundation Day", type: "nacional" },
                { date: "2025-02-23", name: "Emperor's Birthday", type: "nacional" },
                { date: "2025-03-20", name: "Vernal Equinox", type: "nacional" },
                { date: "2025-04-29", name: "Showa Day", type: "nacional" },
                { date: "2025-05-03", name: "Constitution Day", type: "nacional" },
                { date: "2025-05-04", name: "Greenery Day", type: "nacional" },
                { date: "2025-05-05", name: "Children's Day", type: "nacional" },
                { date: "2025-07-21", name: "Marine Day", type: "nacional" },
                { date: "2025-08-11", name: "Mountain Day", type: "nacional" },
                { date: "2025-09-15", name: "Respect for the Aged Day", type: "nacional" },
                { date: "2025-09-23", name: "Autumn Equinox", type: "nacional" },
                { date: "2025-10-13", name: "Sports Day", type: "nacional" },
                { date: "2025-11-03", name: "Culture Day", type: "nacional" },
                { date: "2025-11-23", name: "Labor Thanksgiving Day", type: "nacional" }
            ],
            "2026": [
                { date: "2026-01-01", name: "Año Nuevo", type: "nacional" },
                { date: "2026-01-12", name: "Coming of Age Day", type: "nacional" },
                { date: "2026-02-11", name: "Foundation Day", type: "nacional" },
                { date: "2026-02-23", name: "Emperor's Birthday", type: "nacional" },
                { date: "2026-03-20", name: "Vernal Equinox", type: "nacional" },
                { date: "2026-04-29", name: "Showa Day", type: "nacional" },
                { date: "2026-05-03", name: "Constitution Day", type: "nacional" },
                { date: "2026-05-04", name: "Greenery Day", type: "nacional" },
                { date: "2026-05-05", name: "Children's Day", type: "nacional" },
                { date: "2026-07-20", name: "Marine Day", type: "nacional" },
                { date: "2026-08-11", name: "Mountain Day", type: "nacional" },
                { date: "2026-09-21", name: "Respect for the Aged Day", type: "nacional" },
                { date: "2026-09-22", name: "Autumn Equinox", type: "nacional" },
                { date: "2026-10-12", name: "Sports Day", type: "nacional" },
                { date: "2026-11-03", name: "Culture Day", type: "nacional" },
                { date: "2026-11-23", name: "Labor Thanksgiving Day", type: "nacional" }
            ]
        };
    }

    // MEJORES DÍAS DE LA SEMANA POR ACTIVIDAD
    initBestDays() {
        return {
            // Parques temáticos
            "Tokyo DisneySea": {
                best: ["Martes", "Miércoles", "Jueves"],
                worst: ["Sábado", "Domingo", "Lunes"],
                tip: "Martes-Jueves = 40% menos gente"
            },
            "Tokyo Disneyland": {
                best: ["Martes", "Miércoles"],
                worst: ["Sábado", "Domingo"],
                tip: "Miércoles es el día más vacío"
            },
            "Universal Studios Japan": {
                best: ["Martes", "Miércoles", "Jueves"],
                worst: ["Sábado", "Domingo"],
                tip: "Evita fines de semana (4x más lleno)"
            },
            "Sanrio Puroland": {
                best: ["Jueves", "Viernes"],
                worst: ["Sábado", "Domingo"],
                closed: ["Miércoles"],
                tip: "⚠️ CIERRA LOS MIÉRCOLES"
            },

            // Templos/Cultura
            "Fushimi Inari": {
                best: ["Lunes", "Martes", "Jueves", "Viernes"],
                worst: ["Sábado", "Domingo"],
                tip: "Llega antes 8am o después 4pm"
            },
            "Senso-ji": {
                best: ["Lunes", "Martes", "Miércoles", "Jueves"],
                worst: ["Sábado", "Domingo"],
                tip: "7am-9am = casi vacío (antes tours)"
            },
            "Kinkaku-ji": {
                best: ["Martes", "Miércoles", "Jueves"],
                worst: ["Sábado", "Domingo"],
                tip: "Primera hora (9am) mejor"
            },

            // Shopping/Urbano
            "Akihabara": {
                best: ["Lunes", "Martes", "Miércoles"],
                worst: ["Sábado", "Domingo"],
                tip: "Fines de semana = otaku parade"
            },
            "Harajuku": {
                best: ["Lunes", "Martes"],
                worst: ["Domingo"],
                tip: "Domingos = Takeshita abarrotado"
            },

            // Museos
            "teamLab Borderless": {
                best: ["Martes", "Miércoles", "Jueves"],
                worst: ["Sábado", "Domingo"],
                closed: ["Martes"],
                tip: "Reserva con anticipación"
            }
        };
    }

    // MEJORES HORARIOS DEL DÍA POR ACTIVIDAD
    initBestTimes() {
        return {
            "Fushimi Inari": {
                best: ["06:00-08:30", "16:00-18:00"],
                avoid: ["09:30-15:00"],
                critical: "Después 9:30am = infierno de tours chinos"
            },
            "Senso-ji": {
                best: ["07:00-09:00", "17:00-19:00"],
                avoid: ["10:00-16:00"],
                critical: "Tours llegan 10am-3pm"
            },
            "Tokyo Skytree": {
                best: ["09:00-10:00", "20:00-21:00"],
                avoid: ["12:00-15:00"],
                critical: "Atardecer (17:00-18:30) hermoso pero lleno"
            },
            "Shibuya Crossing": {
                best: ["07:00-09:00", "22:00-24:00"],
                avoid: ["18:00-20:00"],
                critical: "Viernes/Sábado noche = locura"
            },
            "Tsukiji Outer Market": {
                best: ["06:00-09:00"],
                avoid: ["10:00+"],
                critical: "Lo mejor se acaba antes 10am"
            },
            "TeamLab": {
                best: ["Apertura (10:00)", "Última hora"],
                avoid: ["14:00-17:00"],
                critical: "Reserva online con anticipación"
            }
        };
    }

    // MÉTODO PRINCIPAL: Analizar fecha
    analyzeCrowdLevel(date, activityName = null) {
        const dateStr = this.formatDate(date);
        const dayOfWeek = this.getDayOfWeek(date);
        const result = {
            date: dateStr,
            dayOfWeek: dayOfWeek,
            crowdLevel: "normal", // normal, high, extreme
            warnings: [],
            tips: [],
            isHoliday: false,
            holidayName: null
        };

        // Verificar festivos
        const holiday = this.isHoliday(dateStr);
        if (holiday) {
            result.isHoliday = true;
            result.holidayName = holiday.name;
            result.crowdLevel = "high";
            result.warnings.push(`🎌 Festivo: ${holiday.name} - Turismo interno alto`);
        }

        // Verificar Golden Week
        if (this.crowdDates.goldenWeek.includes(dateStr)) {
            result.crowdLevel = "extreme";
            result.warnings.push("⚠️⚠️ GOLDEN WEEK - TODO 3X MÁS LLENO Y CARO");
            result.tips.push("Evita parques temáticos y atracciones populares");
            result.tips.push("Reserva todo con anticipación");
        }

        // Verificar Obon
        if (this.crowdDates.obon.includes(dateStr)) {
            result.crowdLevel = "extreme";
            result.warnings.push("⚠️ OBON - Festival de verano, turismo interno masivo");
            result.tips.push("Trenes y hoteles muy llenos");
        }

        // Verificar Sakura Peak
        if (this.crowdDates.sakuraPeak.includes(dateStr)) {
            result.crowdLevel = "high";
            result.warnings.push("🌸 SAKURA PEAK - Turismo internacional alto");
            result.tips.push("Parques con sakura estarán muy llenos");
            result.tips.push("Reserva restaurantes populares");
        }

        // Verificar Año Nuevo
        if (this.crowdDates.newYear.includes(dateStr)) {
            result.crowdLevel = "extreme";
            result.warnings.push("🎍 AÑO NUEVO - Muchas cosas cerradas, precios altos");
            result.tips.push("Templos MUY llenos (visitas tradicionales)");
            result.tips.push("Muchas tiendas cerradas 1-3 enero");
        }

        // Verificar fin de semana largo
        if (this.crowdDates.longWeekends.includes(dateStr)) {
            result.crowdLevel = "high";
            result.warnings.push("📅 Fin de semana largo - Turismo interno aumentado");
        }

        // Analizar día de la semana
        if (dayOfWeek === "Sábado" || dayOfWeek === "Domingo") {
            if (result.crowdLevel === "normal") {
                result.crowdLevel = "high";
            }
            result.tips.push("Fin de semana - Atracciones populares más llenas");
        }

        // Análisis específico por actividad
        if (activityName && this.bestDays[activityName]) {
            const activityInfo = this.bestDays[activityName];

            // Verificar si está cerrado
            if (activityInfo.closed && activityInfo.closed.includes(dayOfWeek)) {
                result.warnings.push(`❌ ${activityName} CIERRA LOS ${activityInfo.closed.join(", ")}`);
            }

            // Verificar mejor día
            if (activityInfo.best.includes(dayOfWeek)) {
                result.tips.push(`✅ ${dayOfWeek} es buen día para ${activityName}`);
            }

            // Verificar peor día
            if (activityInfo.worst.includes(dayOfWeek)) {
                result.warnings.push(`⚠️ ${dayOfWeek} es el peor día para ${activityName}`);
            }

            // Agregar tip
            if (activityInfo.tip) {
                result.tips.push(activityInfo.tip);
            }
        }

        return result;
    }

    // Analizar mejor horario para actividad
    getBestTimeForActivity(activityName) {
        if (!this.bestTimes[activityName]) {
            return null;
        }

        const timeInfo = this.bestTimes[activityName];
        return {
            activity: activityName,
            bestTimes: timeInfo.best,
            avoidTimes: timeInfo.avoid,
            criticalInfo: timeInfo.critical,
            recommendation: `Mejor: ${timeInfo.best.join(" o ")}`
        };
    }

    // Sugerir mejor día de la semana para actividad
    suggestBestDay(activityName) {
        if (!this.bestDays[activityName]) {
            return {
                activity: activityName,
                suggestion: "Cualquier día entre semana es bueno",
                bestDays: ["Lunes", "Martes", "Miércoles", "Jueves"],
                avoidDays: ["Sábado", "Domingo"]
            };
        }

        const info = this.bestDays[activityName];
        return {
            activity: activityName,
            bestDays: info.best,
            worstDays: info.worst,
            closedDays: info.closed || [],
            tip: info.tip,
            recommendation: `Mejor: ${info.best[0]} o ${info.best[1]}`
        };
    }

    // Verificar si es festivo
    isHoliday(dateStr) {
        const year = dateStr.substring(0, 4);
        const holidays = this.holidays[year] || [];
        return holidays.find(h => h.date === dateStr);
    }

    // Obtener nivel de multitudes para rango de fechas
    analyzeDateRange(startDate, endDate) {
        const results = [];
        let currentDate = window.TimeUtils?.parseDate(startDate) || new Date(startDate);
        const end = window.TimeUtils?.parseDate(endDate) || new Date(endDate);

        while (currentDate <= end) {
            results.push(this.analyzeCrowdLevel(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return results;
    }

    // UTILIDADES
    formatDate(date) {
        // parseDate interpreta 'YYYY-MM-DD' como fecha local (new Date() la
        // tomaría como UTC y correría el día en zonas horarias de América)
        const d = window.TimeUtils?.parseDate(date) || new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getDayOfWeek(date) {
        const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const d = window.TimeUtils?.parseDate(date) || new Date(date);
        return days[d.getDay()];
    }

    // Generar reporte visual para UI
    generateCrowdReport(date, activities = []) {
        const analysis = this.analyzeCrowdLevel(date);
        let html = `
            <div class="crowd-report" style="background: ${this.getCrowdColor(analysis.crowdLevel)}; padding: 16px; border-radius: 12px; margin: 12px 0;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 32px;">${this.getCrowdIcon(analysis.crowdLevel)}</div>
                    <div>
                        <div style="font-weight: 600; font-size: 18px;">${analysis.date} (${analysis.dayOfWeek})</div>
                        <div style="font-size: 14px; opacity: 0.9;">Nivel de multitudes: ${this.getCrowdLabel(analysis.crowdLevel)}</div>
                    </div>
                </div>
        `;

        // Warnings
        if (analysis.warnings.length > 0) {
            html += `<div style="margin-bottom: 12px;">`;
            analysis.warnings.forEach(warning => {
                html += `<div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 13px;">${warning}</div>`;
            });
            html += `</div>`;
        }

        // Tips
        if (analysis.tips.length > 0) {
            html += `<div style="margin-bottom: 12px;">`;
            analysis.tips.forEach(tip => {
                html += `<div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 12px;">💡 ${tip}</div>`;
            });
            html += `</div>`;
        }

        // Análisis por actividades
        if (activities.length > 0) {
            html += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">`;
            html += `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">Análisis por actividad:</div>`;

            activities.forEach(activity => {
                const activityAnalysis = this.analyzeCrowdLevel(date, activity);
                const timeInfo = this.getBestTimeForActivity(activity);

                html += `<div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; margin-bottom: 8px;">`;
                html += `<div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${activity}</div>`;

                if (timeInfo) {
                    html += `<div style="font-size: 11px; margin-bottom: 2px;">⏰ ${timeInfo.recommendation}</div>`;
                    html += `<div style="font-size: 11px; opacity: 0.8;">${timeInfo.criticalInfo}</div>`;
                }

                html += `</div>`;
            });

            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    getCrowdColor(level) {
        const colors = {
            "normal": "linear-gradient(135deg, #10b981, #059669)",
            "high": "linear-gradient(135deg, #f59e0b, #d97706)",
            "extreme": "linear-gradient(135deg, #ef4444, #dc2626)"
        };
        return colors[level];
    }

    getCrowdIcon(level) {
        const icons = {
            "normal": "✅",
            "high": "⚠️",
            "extreme": "🚨"
        };
        return icons[level];
    }

    getCrowdLabel(level) {
        const labels = {
            "normal": "Normal",
            "high": "Alto",
            "extreme": "EXTREMO"
        };
        return labels[level];
    }
}

// Exportar globalmente
window.CrowdDetector = CrowdDetector;

// Crear instancia global
if (typeof window !== 'undefined') {
    window.crowdDetector = new CrowdDetector();
    console.log('✅ Crowd Detector cargado');
}
