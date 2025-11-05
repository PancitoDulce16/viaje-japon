// js/emergency-assistant.js - Asistente de Emergencias para viaje a Japón

import { Logger, escapeHTML } from './helpers.js';
import { Notifications } from './notifications.js';

/**
 * EmergencyAssistant - Información crítica para emergencias en Japón
 */
export const EmergencyAssistant = {
    // Números de emergencia en Japón
    emergencyNumbers: {
        police: {
            number: '110',
            name: 'Policía',
            description: 'Para crímenes, robos, accidentes de tráfico',
            icon: '🚔'
        },
        ambulance: {
            number: '119',
            name: 'Ambulancia/Bomberos',
            description: 'Emergencias médicas e incendios',
            icon: '🚑'
        },
        coastGuard: {
            number: '118',
            name: 'Guardia Costera',
            description: 'Emergencias marítimas',
            icon: '⛴️'
        },
        jhelp: {
            number: '0570-000-911',
            name: 'Japan Helpline',
            description: 'Asistencia en inglés 24/7 (gratuito)',
            icon: '📞'
        },
        telMed: {
            number: '#7119',
            name: 'Consulta Médica',
            description: 'Consejo médico en Tokyo (no urgente)',
            icon: '🏥'
        }
    },

    // Embajadas de países hispanohablantes en Japón
    embassies: {
        mexico: {
            name: 'Embajada de México',
            phone: '03-3581-1131',
            emergency: '080-4162-8321',
            address: '2-15-1 Nagata-cho, Chiyoda-ku, Tokyo 100-0014',
            hours: 'Lun-Vie: 9:00-17:00',
            icon: '🇲🇽'
        },
        spain: {
            name: 'Embajada de España',
            phone: '03-3583-8531',
            emergency: '090-6597-5091',
            address: '1-3-29 Roppongi, Minato-ku, Tokyo 106-0032',
            hours: 'Lun-Vie: 9:00-17:00',
            icon: '🇪🇸'
        },
        argentina: {
            name: 'Embajada de Argentina',
            phone: '03-5420-7101',
            address: '2-14-14 Moto-Azabu, Minato-ku, Tokyo 106-0046',
            hours: 'Lun-Vie: 9:00-17:00',
            icon: '🇦🇷'
        },
        chile: {
            name: 'Embajada de Chile',
            phone: '03-3452-7561',
            address: '1-4 Nihonbashi Hongokucho, Chuo-ku, Tokyo 103-0021',
            hours: 'Lun-Vie: 9:00-17:00',
            icon: '🇨🇱'
        },
        colombia: {
            name: 'Embajada de Colombia',
            phone: '03-3440-6451',
            address: '3-10-53 Kamiyoga, Setagaya-ku, Tokyo 158-0098',
            hours: 'Lun-Vie: 9:00-17:00',
            icon: '🇨🇴'
        }
    },

    // Frases de emergencia en japonés
    emergencyPhrases: {
        help: {
            japanese: '助けて！',
            romaji: 'Tasukete!',
            spanish: 'Ayuda!',
            icon: '🆘'
        },
        callPolice: {
            japanese: '警察を呼んでください',
            romaji: 'Keisatsu wo yonde kudasai',
            spanish: 'Llame a la policía por favor',
            icon: '🚔'
        },
        callAmbulance: {
            japanese: '救急車を呼んでください',
            romaji: 'Kyuukyuusha wo yonde kudasai',
            spanish: 'Llame a una ambulancia por favor',
            icon: '🚑'
        },
        needDoctor: {
            japanese: '医者が必要です',
            romaji: 'Isha ga hitsuyou desu',
            spanish: 'Necesito un médico',
            icon: '⚕️'
        },
        cantSpeak: {
            japanese: '日本語が話せません',
            romaji: 'Nihongo ga hanasemasen',
            spanish: 'No hablo japonés',
            icon: '🗣️'
        },
        whereHospital: {
            japanese: '病院はどこですか？',
            romaji: 'Byouin wa doko desu ka?',
            spanish: 'Dónde está el hospital?',
            icon: '🏥'
        },
        allergic: {
            japanese: 'アレルギーがあります',
            romaji: 'Arerugii ga arimasu',
            spanish: 'Tengo alergias',
            icon: '⚠️'
        },
        lostPassport: {
            japanese: 'パスポートを無くしました',
            romaji: 'Pasupooto wo nakushimashita',
            spanish: 'Perdí mi pasaporte',
            icon: '📄'
        },
        stolen: {
            japanese: '盗まれました',
            romaji: 'Nusumaremashita',
            spanish: 'Me robaron',
            icon: '🚨'
        },
        needTranslator: {
            japanese: '通訳が必要です',
            romaji: 'Tsuuyaku ga hitsuyou desu',
            spanish: 'Necesito un intérprete',
            icon: '🌐'
        }
    },

    // Hospitales con servicio en inglés en Tokyo
    hospitals: {
        stLuke: {
            name: "St. Luke's International Hospital",
            phone: '03-3541-5151',
            address: '9-1 Akashi-cho, Chuo-ku, Tokyo',
            services: 'Emergencias 24/7, Staff habla inglés',
            nearest: 'Tsukiji Station',
            icon: '🏥'
        },
        tokyoMedical: {
            name: 'Tokyo Medical and Surgical Clinic',
            phone: '03-3436-3028',
            address: '32 Shiba-koen Building, Minato-ku',
            services: 'Clínica ambulatoria, inglés',
            nearest: 'Kamiyacho Station',
            icon: '🏥'
        },
        nationalCenter: {
            name: 'National Center for Global Health',
            phone: '03-3202-7181',
            address: '1-21-1 Toyama, Shinjuku-ku',
            services: 'Medicina tropical, inglés',
            nearest: 'Wakamatsu-kawada Station',
            icon: '🏥'
        }
    },

    // Información de seguros médicos
    insuranceInfo: {
        title: 'Información de Seguro Médico',
        tips: [
            'Guarda copia de tu póliza en tu email',
            'Ten a mano el número de emergencia de tu seguro',
            'Solicita factura detallada en hospitales para reembolso',
            'Los hospitales en Japón requieren pago inmediato',
            'Tarjetas de crédito son aceptadas en la mayoría de hospitales'
        ]
    },

    // Información para bloqueo de tarjetas
    cardBlocking: {
        visa: {
            name: 'Visa',
            phone: '+1-303-967-1096',
            icon: '💳'
        },
        mastercard: {
            name: 'Mastercard',
            phone: '+1-636-722-7111',
            icon: '💳'
        },
        amex: {
            name: 'American Express',
            phone: '+1-336-393-1111',
            icon: '💳'
        }
    },

    // Inicializar el asistente
    init() {
        Logger.info('🚨 EmergencyAssistant: Inicializando...');
        this.render();
        this.attachEventListeners();
    },

    // Renderizar la UI del asistente
    render() {
        const container = document.getElementById('emergencyContent');
        if (!container) {
            Logger.warn('EmergencyAssistant: Container #emergencyContent no encontrado');
            return;
        }

        const html = `
            <div class="emergency-assistant">
                <!-- Header -->
                <div class="emergency-header mb-6">
                    <h2 class="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        🚨 Asistente de Emergencias
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        Información crítica para emergencias en Japón. Guarda esta página como favorito.
                    </p>
                </div>

                <!-- Emergency Numbers -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        📞 Números de Emergencia
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${this.renderEmergencyNumbers()}
                    </div>
                </div>

                <!-- Emergency Phrases -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        🗣️ Frases de Emergencia
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${this.renderEmergencyPhrases()}
                    </div>
                </div>

                <!-- Embassies -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        🏛️ Embajadas y Consulados
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${this.renderEmbassies()}
                    </div>
                </div>

                <!-- Hospitals -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        🏥 Hospitales con Servicio en Inglés (Tokyo)
                    </h3>
                    <div class="grid grid-cols-1 gap-3">
                        ${this.renderHospitals()}
                    </div>
                </div>

                <!-- Card Blocking -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        💳 Bloqueo de Tarjetas
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        ${this.renderCardBlocking()}
                    </div>
                </div>

                <!-- Insurance Tips -->
                <div class="emergency-section mb-6">
                    <h3 class="text-xl font-bold mb-3 flex items-center gap-2">
                        🛡️ Tips de Seguro Médico
                    </h3>
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                            ${this.insuranceInfo.tips.map(tip => `<li>${escapeHTML(tip)}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="emergency-actions flex flex-wrap gap-3">
                    <button id="saveEmergencyContact" class="btn-primary">
                        💾 Guardar Contacto de Emergencia
                    </button>
                    <button id="exportEmergencyInfo" class="btn-secondary">
                        📥 Exportar como PDF
                    </button>
                    <button id="shareEmergencyInfo" class="btn-secondary">
                        📤 Compartir con Grupo
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    renderEmergencyNumbers() {
        return Object.values(this.emergencyNumbers).map(num => `
            <div class="emergency-card bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="text-2xl mb-1">${num.icon}</div>
                        <h4 class="font-bold text-lg">${escapeHTML(num.name)}</h4>
                        <p class="text-3xl font-bold text-red-600 dark:text-red-400 my-2">${escapeHTML(num.number)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${escapeHTML(num.description)}</p>
                    </div>
                    <button class="call-button p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                            data-number="${escapeHTML(num.number)}"
                            title="Llamar">
                        📞
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderEmergencyPhrases() {
        return Object.values(this.emergencyPhrases).map(phrase => `
            <div class="phrase-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div class="flex items-start gap-3">
                    <div class="text-2xl">${phrase.icon}</div>
                    <div class="flex-1">
                        <p class="text-lg font-bold mb-1">${escapeHTML(phrase.spanish)}</p>
                        <p class="text-xl font-japanese mb-1">${escapeHTML(phrase.japanese)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 italic">${escapeHTML(phrase.romaji)}</p>
                    </div>
                    <button class="copy-phrase-btn p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            data-text="${escapeHTML(phrase.japanese)}"
                            title="Copiar frase">
                        📋
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderEmbassies() {
        return Object.values(this.embassies).map(embassy => `
            <div class="embassy-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-start gap-3">
                    <div class="text-3xl">${embassy.icon}</div>
                    <div class="flex-1">
                        <h4 class="font-bold text-lg mb-2">${escapeHTML(embassy.name)}</h4>
                        <p class="text-sm mb-1">
                            <span class="font-semibold">Teléfono:</span>
                            <a href="tel:${escapeHTML(embassy.phone)}" class="text-blue-600 hover:underline">
                                ${escapeHTML(embassy.phone)}
                            </a>
                        </p>
                        ${embassy.emergency ? `
                            <p class="text-sm mb-1 text-red-600 dark:text-red-400">
                                <span class="font-semibold">Emergencia:</span>
                                <a href="tel:${escapeHTML(embassy.emergency)}" class="hover:underline">
                                    ${escapeHTML(embassy.emergency)}
                                </a>
                            </p>
                        ` : ''}
                        <p class="text-sm mb-1 text-gray-600 dark:text-gray-400">
                            📍 ${escapeHTML(embassy.address)}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">
                            ${escapeHTML(embassy.hours)}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderHospitals() {
        return Object.values(this.hospitals).map(hospital => `
            <div class="hospital-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-start gap-3">
                    <div class="text-3xl">${hospital.icon}</div>
                    <div class="flex-1">
                        <h4 class="font-bold text-lg mb-2">${escapeHTML(hospital.name)}</h4>
                        <p class="text-sm mb-1">
                            <span class="font-semibold">Teléfono:</span>
                            <a href="tel:${escapeHTML(hospital.phone)}" class="text-blue-600 hover:underline">
                                ${escapeHTML(hospital.phone)}
                            </a>
                        </p>
                        <p class="text-sm mb-1 text-gray-600 dark:text-gray-400">
                            📍 ${escapeHTML(hospital.address)}
                        </p>
                        <p class="text-sm mb-1 text-green-600 dark:text-green-400">
                            ✓ ${escapeHTML(hospital.services)}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">
                            🚇 Estación más cercana: ${escapeHTML(hospital.nearest)}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderCardBlocking() {
        return Object.values(this.cardBlocking).map(card => `
            <div class="card-block bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div class="text-3xl mb-2">${card.icon}</div>
                <h4 class="font-bold mb-2">${escapeHTML(card.name)}</h4>
                <a href="tel:${escapeHTML(card.phone)}" class="text-blue-600 hover:underline font-mono text-sm">
                    ${escapeHTML(card.phone)}
                </a>
            </div>
        `).join('');
    },

    attachEventListeners() {
        // Call buttons
        document.querySelectorAll('.call-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = e.currentTarget.dataset.number;
                this.initiateCall(number);
            });
        });

        // Copy phrase buttons
        document.querySelectorAll('.copy-phrase-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const text = e.currentTarget.dataset.text;
                try {
                    await navigator.clipboard.writeText(text);
                    Notifications.success('Frase copiada al portapapeles');
                } catch (error) {
                    Notifications.error('Error al copiar frase');
                }
            });
        });

        // Save emergency contact
        const saveBtn = document.getElementById('saveEmergencyContact');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveEmergencyContact());
        }

        // Export PDF
        const exportBtn = document.getElementById('exportEmergencyInfo');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }

        // Share button
        const shareBtn = document.getElementById('shareEmergencyInfo');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareInfo());
        }
    },

    initiateCall(number) {
        if (confirm(`¿Llamar al ${number}?`)) {
            window.location.href = `tel:${number}`;
        }
    },

    saveEmergencyContact() {
        // Guardar información de contacto de emergencia del usuario
        const name = prompt('Nombre del contacto de emergencia:');
        if (!name) return;

        const phone = prompt('Teléfono del contacto de emergencia:');
        if (!phone) return;

        const contact = { name, phone, savedAt: new Date().toISOString() };
        localStorage.setItem('emergencyContact', JSON.stringify(contact));

        Notifications.success('Contacto de emergencia guardado');
    },

    async exportToPDF() {
        Notifications.info('La exportación a PDF estará disponible próximamente');
        // TODO: Implementar con biblioteca como jsPDF
    },

    shareInfo() {
        const text = `🚨 Info de Emergencias en Japón:\n\n` +
                    `Policía: 110\n` +
                    `Ambulancia: 119\n` +
                    `Japan Helpline: 0570-000-911`;

        if (navigator.share) {
            navigator.share({
                title: 'Emergencias en Japón',
                text: text
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(text);
            Notifications.success('Información copiada al portapapeles');
        }
    },

    cleanup() {
        Logger.info('🧹 EmergencyAssistant: Cleaning up...');
    }
};

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.EmergencyAssistant = EmergencyAssistant;
}
