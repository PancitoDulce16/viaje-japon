// js/contrast-validator.js - Validador automático de contraste WCAG

/**
 * ContrastValidator - Valida automáticamente el contraste de colores
 * según estándares WCAG AA (mínimo 4.5:1 para texto normal)
 */
export class ContrastValidator {
    constructor() {
        this.issues = [];
        this.minContrastRatio = 4.5; // WCAG AA
        this.minContrastRatioLarge = 3.0; // WCAG AA para texto grande
    }

    /**
     * Convertir color a RGB
     */
    parseColor(color) {
        // Crear elemento temporal para obtener color computado
        const temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);

        const computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);

        // Parsear rgb(r, g, b) o rgba(r, g, b, a)
        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return null;

        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }

    /**
     * Calcular luminancia relativa
     */
    getLuminance(rgb) {
        const { r, g, b } = rgb;

        const [rs, gs, bs] = [r, g, b].map(val => {
            val = val / 255;
            return val <= 0.03928
                ? val / 12.92
                : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Calcular ratio de contraste
     */
    getContrastRatio(color1, color2) {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);

        if (!rgb1 || !rgb2) return null;

        const lum1 = this.getLuminance(rgb1);
        const lum2 = this.getLuminance(rgb2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Verificar contraste de un elemento
     */
    checkElement(element) {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Si el background es transparente, buscar el padre
        let bgColor = backgroundColor;
        let parent = element.parentElement;

        while (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            if (!parent) {
                bgColor = '#ffffff'; // Default a blanco
                break;
            }
            bgColor = window.getComputedStyle(parent).backgroundColor;
            parent = parent.parentElement;
        }

        const ratio = this.getContrastRatio(color, bgColor);

        if (ratio === null) return null;

        // Determinar si es texto grande (18pt+ o 14pt+ bold)
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = styles.fontWeight;
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700);

        const minRatio = isLargeText ? this.minContrastRatioLarge : this.minContrastRatio;

        return {
            element,
            ratio: ratio.toFixed(2),
            minRequired: minRatio,
            passed: ratio >= minRatio,
            color,
            backgroundColor: bgColor,
            isLargeText
        };
    }

    /**
     * Escanear documento completo
     */
    scanDocument() {
        console.log('🔍 ContrastValidator: Escaneando contraste de colores...');

        this.issues = [];

        // Selectores críticos para verificar
        const criticalSelectors = [
            '.modal-content',
            '.tab-content',
            '.card',
            '.activity-card',
            '.btn-primary',
            '.btn-secondary',
            'input',
            'textarea',
            'select',
            '.day-btn',
            '.packing-item',
            '.attraction-card',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'div[class*="text"]',
            'button',
            'a'
        ];

        const elementsToCheck = new Set();

        // Recopilar elementos únicos
        criticalSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Solo verificar elementos visibles
                    if (el.offsetParent !== null) {
                        elementsToCheck.add(el);
                    }
                });
            } catch (e) {
                console.warn(`Invalid selector: ${selector}`);
            }
        });

        // Verificar cada elemento
        let checked = 0;
        elementsToCheck.forEach(element => {
            const result = this.checkElement(element);

            if (result && !result.passed) {
                this.issues.push({
                    element,
                    selector: this.getSelector(element),
                    ratio: result.ratio,
                    minRequired: result.minRequired,
                    color: result.color,
                    backgroundColor: result.backgroundColor,
                    isLargeText: result.isLargeText
                });
            }

            checked++;
        });

        console.log(`✅ Verificados ${checked} elementos`);

        return this.issues;
    }

    /**
     * Obtener selector CSS de un elemento
     */
    getSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }

        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                return `.${classes[0]}`;
            }
        }

        return element.tagName.toLowerCase();
    }

    /**
     * Generar reporte de problemas
     */
    generateReport() {
        if (this.issues.length === 0) {
            console.log('✅ No se encontraron problemas de contraste');
            return;
        }

        console.warn(`⚠️ Se encontraron ${this.issues.length} problemas de contraste:`);

        this.issues.forEach((issue, index) => {
            console.warn(`\n${index + 1}. ${issue.selector}`);
            console.warn(`   Ratio actual: ${issue.ratio}:1`);
            console.warn(`   Mínimo requerido: ${issue.minRequired}:1`);
            console.warn(`   Color: ${issue.color}`);
            console.warn(`   Fondo: ${issue.backgroundColor}`);
            console.warn(`   Elemento:`, issue.element);
        });

        // Mostrar alerta visual
        this.showVisualReport();
    }

    /**
     * Mostrar reporte visual
     */
    showVisualReport() {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'contrast-validator-alert';
        alertDiv.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; z-index: 99999;
                        background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
                        color: white; padding: 20px 30px; border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(245, 158, 11, 0.6);
                        max-width: 400px; font-family: system-ui;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <span style="font-size: 2rem;">👁️</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: bold;">
                            ${this.issues.length} Problema(s) de Contraste
                        </h3>
                        <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                            Algunos elementos no cumplen WCAG AA
                        </p>
                    </div>
                </div>
                <button onclick="window.contrastValidator.highlightIssues(); document.getElementById('contrast-validator-alert').remove();"
                        style="width: 100%; padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.2);
                               border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 600;
                               transition: background 0.2s;">
                    Resaltar elementos y cerrar
                </button>
            </div>
        `;
        document.body.appendChild(alertDiv);

        // Auto-cerrar después de 8 segundos
        setTimeout(() => {
            const alert = document.getElementById('contrast-validator-alert');
            if (alert) alert.remove();
        }, 8000);
    }

    /**
     * Resaltar elementos con problemas
     */
    highlightIssues() {
        this.issues.forEach(issue => {
            issue.element.style.outline = '3px dashed #f59e0b';
            issue.element.style.outlineOffset = '2px';

            // Agregar tooltip
            issue.element.title = `⚠️ Contraste insuficiente: ${issue.ratio}:1 (mínimo: ${issue.minRequired}:1)`;
        });

        console.log('🎨 Elementos con bajo contraste resaltados con borde naranja');

        // Quitar highlight después de 5 segundos
        setTimeout(() => {
            this.issues.forEach(issue => {
                issue.element.style.outline = '';
                issue.element.style.outlineOffset = '';
            });
        }, 5000);
    }

    /**
     * Validar modo oscuro específicamente
     */
    validateDarkMode() {
        const isDark = document.documentElement.classList.contains('dark');

        if (!isDark) {
            console.log('💡 Modo oscuro no activo, activando temporalmente para validar...');

            // Activar modo oscuro temporalmente
            document.documentElement.classList.add('dark');

            // Escanear
            setTimeout(() => {
                const darkIssues = this.scanDocument();

                console.log(`🌙 Modo oscuro: ${darkIssues.length} problemas encontrados`);

                // Restaurar modo original
                document.documentElement.classList.remove('dark');
            }, 500);
        } else {
            const darkIssues = this.scanDocument();
            console.log(`🌙 Modo oscuro: ${darkIssues.length} problemas encontrados`);
        }
    }
}

// Crear instancia global
export const contrastValidator = new ContrastValidator();

/**
 * Ejecutar validación automática
 */
export function runContrastValidation() {
    console.log('🎨 Iniciando validación de contraste...');

    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => {
        const issues = contrastValidator.scanDocument();
        contrastValidator.generateReport();

        // Validar también modo oscuro
        contrastValidator.validateDarkMode();

        // Guardar resultados globalmente
        window.contrastIssues = issues;

        return issues;
    }, 1000);
}

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.contrastValidator = contrastValidator;
    window.checkContrast = runContrastValidation;
}
