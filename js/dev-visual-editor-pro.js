// Dev Visual Editor Pro - Tier 1 UX Improvements
// Mejoras profesionales de UX, shortcuts, y export/import

class DevVisualEditorPro {
    constructor(visualEditor) {
        this.visualEditor = visualEditor;
        this.copiedStyles = null;
        this.sessionKey = 'devVisualEditorSession';
        this.init();
    }

    init() {
        this.injectUI();
        this.setupKeyboardShortcuts();
        this.loadSession();
        this.enhanceSliders();
        this.addTooltips();
        console.log('✨ Dev Visual Editor Pro inicializado!');
    }

    // ============================================
    // 1. VISUAL FEEDBACK MEJORADO
    // ============================================

    injectUI() {
        // Agregar breadcrumb y botones de export al panel
        const visualEditorSection = document.querySelector('#dev-panel').querySelector('[style*="margin-bottom: 20px"]');

        if (visualEditorSection) {
            // Breadcrumb mostrando selector actual
            const breadcrumb = document.createElement('div');
            breadcrumb.id = 'dev-breadcrumb';
            breadcrumb.style.cssText = `
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 6px;
                padding: 8px 12px;
                margin-bottom: 10px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                color: #667eea;
                display: none;
                word-break: break-all;
            `;
            breadcrumb.innerHTML = '<strong>Selector:</strong> <span id="dev-current-selector">Ninguno</span>';

            // Insertar antes del Visual Editor
            visualEditorSection.insertBefore(breadcrumb, visualEditorSection.firstChild);

            // Botones de Export/Import
            const exportButtons = document.createElement('div');
            exportButtons.style.cssText = `
                display: flex;
                gap: 6px;
                margin-top: 10px;
            `;
            exportButtons.innerHTML = `
                <button onclick="devVisualEditorPro.downloadCSS()" style="background: linear-gradient(135deg, #00f260 0%, #0575e6 100%); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1; font-weight: 600;" title="Ctrl+S">
                    💾 Download CSS
                </button>
                <button onclick="devVisualEditorPro.copyAllCSS()" style="background: #444; border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;" title="Copiar todo el CSS generado">
                    📋 Copy All
                </button>
                <button onclick="devVisualEditorPro.clearAllCSS()" style="background: #d63031; border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;" title="Limpiar todo">
                    🗑️
                </button>
            `;

            // Buscar donde insertar (después del inspector)
            const inspector = document.getElementById('dev-element-inspector');
            if (inspector && inspector.parentNode) {
                inspector.parentNode.insertBefore(exportButtons, inspector.nextSibling);
            }
        }

        // Toast container para notificaciones
        const toastContainer = document.createElement('div');
        toastContainer.id = 'dev-toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2147483648;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#00f260', border: '#0575e6' },
            error: { bg: '#f5576c', border: '#d63031' },
            info: { bg: '#667eea', border: '#764ba2' },
            warning: { bg: '#f093fb', border: '#f5576c' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background: linear-gradient(135deg, ${color.bg} 0%, ${color.border} 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
            pointer-events: auto;
            max-width: 300px;
        `;

        toast.textContent = message;

        // Agregar animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        if (!document.getElementById('dev-toast-styles')) {
            style.id = 'dev-toast-styles';
            document.head.appendChild(style);
        }

        const container = document.getElementById('dev-toast-container');
        container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    updateBreadcrumb(selector) {
        const breadcrumb = document.getElementById('dev-breadcrumb');
        const selectorSpan = document.getElementById('dev-current-selector');

        if (breadcrumb && selectorSpan) {
            if (selector) {
                breadcrumb.style.display = 'block';
                selectorSpan.textContent = selector;
            } else {
                breadcrumb.style.display = 'none';
            }
        }
    }

    enhanceSliders() {
        // Mejorar sliders para preview en tiempo real (sin click en aplicar)
        setTimeout(() => {
            const sliders = document.querySelectorAll('#dev-panel input[type="range"]');
            sliders.forEach(slider => {
                slider.addEventListener('input', (e) => {
                    // Mostrar valor en tiempo real
                    const valueDisplay = e.target.nextElementSibling;
                    if (valueDisplay && valueDisplay.tagName === 'SPAN') {
                        const property = e.target.id.replace('dev-slider-', '');
                        let value = e.target.value;

                        // Formatear valor según propiedad
                        if (property === 'opacity') {
                            value = (value / 100).toFixed(2);
                            valueDisplay.textContent = `${e.target.value}%`;
                        } else if (property === 'border-radius' || property === 'font-size' ||
                                   property === 'padding' || property === 'shadow-blur') {
                            valueDisplay.textContent = `${value}px`;
                        }
                    }
                });
            });
        }, 2000); // Esperar a que se cargue el advanced editor
    }

    addTooltips() {
        // Agregar tooltips a botones importantes
        setTimeout(() => {
            const tooltipData = [
                { selector: '#dev-toggle-color-picker', text: 'Activar Color Picker - Click en elementos para cambiar colores' },
                { selector: 'button[onclick*="undo"]', text: 'Deshacer - Ctrl+Z' },
                { selector: 'button[onclick*="redo"]', text: 'Rehacer - Ctrl+Y' },
            ];

            tooltipData.forEach(({ selector, text }) => {
                const el = document.querySelector(selector);
                if (el) {
                    el.setAttribute('title', text);
                }
            });
        }, 2000);
    }

    // ============================================
    // 2. KEYBOARD SHORTCUTS
    // ============================================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorar si está escribiendo en un input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Excepto Ctrl+S que queremos que funcione siempre
                if (!(e.ctrlKey && e.key === 's')) {
                    return;
                }
            }

            // Escape - Deseleccionar elemento / Cerrar panel
            if (e.key === 'Escape') {
                e.preventDefault();
                if (this.visualEditor.selectedElement) {
                    this.visualEditor.deselectElement();
                    this.updateBreadcrumb(null);
                    this.showToast('Elemento deseleccionado', 'info');
                } else if (window.devPanel && window.devPanel.isOpen) {
                    window.devPanel.close();
                    this.showToast('Panel cerrado', 'info');
                }
            }

            // Ctrl+S - Download CSS
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.downloadCSS();
            }

            // Ctrl+C - Copy styles del elemento seleccionado
            if (e.ctrlKey && e.key === 'c' && this.visualEditor.selectedElement) {
                e.preventDefault();
                this.copyElementStyles();
            }

            // Ctrl+V - Paste styles al elemento seleccionado
            if (e.ctrlKey && e.key === 'v' && this.visualEditor.selectedElement && this.copiedStyles) {
                e.preventDefault();
                this.pasteElementStyles();
            }

            // Delete - Remover última regla CSS
            if (e.key === 'Delete' && this.visualEditor.selectedElement) {
                e.preventDefault();
                this.removeLastRule();
            }

            // Ctrl+Shift+K - Mostrar shortcuts guide
            if (e.ctrlKey && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                this.showShortcutsGuide();
            }
        });

        console.log('⌨️ Keyboard shortcuts activos!');
        console.log('   Escape = Deseleccionar/Cerrar panel');
        console.log('   Ctrl+S = Download CSS');
        console.log('   Ctrl+C = Copiar estilos');
        console.log('   Ctrl+V = Pegar estilos');
        console.log('   Delete = Remover última regla');
        console.log('   Ctrl+Shift+K = Ver guía de shortcuts');
    }

    copyElementStyles() {
        const el = this.visualEditor.selectedElement;
        const computed = window.getComputedStyle(el);

        this.copiedStyles = {
            background: computed.background,
            color: computed.color,
            borderRadius: computed.borderRadius,
            padding: computed.padding,
            margin: computed.margin,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            boxShadow: computed.boxShadow,
            border: computed.border,
        };

        this.showToast('✓ Estilos copiados al portapapeles', 'success');
        console.log('📋 Estilos copiados:', this.copiedStyles);
    }

    pasteElementStyles() {
        if (!this.copiedStyles) {
            this.showToast('⚠️ No hay estilos copiados', 'warning');
            return;
        }

        const el = this.visualEditor.selectedElement;
        const selector = this.visualEditor.getElementSelector(el);

        const cssRules = Object.entries(this.copiedStyles)
            .map(([prop, value]) => {
                // Convertir camelCase a kebab-case
                const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${kebabProp}: ${value}`;
            })
            .join('; ');

        const css = `${selector} { ${cssRules} !important; }`;

        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        // Guardar en history del advanced editor
        if (window.devVisualEditorAdvanced) {
            window.devVisualEditorAdvanced.saveToHistory();
        }

        this.showToast('✓ Estilos pegados', 'success');
        this.saveSession();
    }

    removeLastRule() {
        if (this.visualEditor.generatedCSS.length === 0) {
            this.showToast('⚠️ No hay reglas CSS para remover', 'warning');
            return;
        }

        const removed = this.visualEditor.generatedCSS.pop();
        this.visualEditor.applyGeneratedCSS();

        this.showToast('🗑️ Regla removida', 'info');
        console.log('Regla removida:', removed);
        this.saveSession();
    }

    showShortcutsGuide() {
        const guide = `
╔════════════════════════════════════════╗
║   KEYBOARD SHORTCUTS GUIDE             ║
╚════════════════════════════════════════╝

📍 NAVEGACIÓN:
   Escape          - Deseleccionar / Cerrar panel
   Ctrl+Shift+D    - Abrir/Cerrar Dev Panel

💾 EXPORT/IMPORT:
   Ctrl+S          - Download CSS generado

✂️ COPY/PASTE:
   Ctrl+C          - Copiar estilos del elemento
   Ctrl+V          - Pegar estilos al elemento

⚡ EDICIÓN:
   Delete          - Remover última regla CSS
   Ctrl+Z          - Undo
   Ctrl+Y          - Redo

❓ AYUDA:
   Ctrl+Shift+K    - Mostrar esta guía
        `;

        console.log(guide);
        this.showToast('📖 Shortcuts guide mostrada en consola', 'info');
    }

    // ============================================
    // 3. EXPORT/IMPORT SYSTEM
    // ============================================

    downloadCSS() {
        const css = this.visualEditor.generatedCSS.join('\n\n');

        if (css.trim() === '') {
            this.showToast('⚠️ No hay CSS generado para descargar', 'warning');
            return;
        }

        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `japitin-custom-styles-${Date.now()}.css`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('💾 CSS descargado', 'success');
        console.log('📥 CSS descargado:', css);
    }

    copyAllCSS() {
        const css = this.visualEditor.generatedCSS.join('\n\n');

        if (css.trim() === '') {
            this.showToast('⚠️ No hay CSS generado para copiar', 'warning');
            return;
        }

        navigator.clipboard.writeText(css).then(() => {
            this.showToast('📋 Todo el CSS copiado al portapapeles', 'success');
            console.log('📋 CSS copiado:', css);
        });
    }

    clearAllCSS() {
        if (this.visualEditor.generatedCSS.length === 0) {
            this.showToast('⚠️ No hay CSS para limpiar', 'warning');
            return;
        }

        if (confirm('¿Estás segura de que quieres limpiar TODO el CSS generado? Esta acción no se puede deshacer.')) {
            this.visualEditor.generatedCSS = [];
            this.visualEditor.applyGeneratedCSS();

            // Limpiar history también
            if (window.devVisualEditorAdvanced) {
                window.devVisualEditorAdvanced.history = [];
                window.devVisualEditorAdvanced.historyIndex = -1;
            }

            this.showToast('🗑️ Todo el CSS limpiado', 'success');
            this.saveSession();
        }
    }

    // ============================================
    // 4. SESSION MANAGEMENT (localStorage)
    // ============================================

    saveSession() {
        const session = {
            generatedCSS: this.visualEditor.generatedCSS,
            timestamp: Date.now(),
            version: '1.0'
        };

        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            console.log('💾 Sesión guardada automáticamente');
        } catch (e) {
            console.warn('⚠️ No se pudo guardar la sesión:', e);
        }
    }

    loadSession() {
        try {
            const saved = localStorage.getItem(this.sessionKey);
            if (saved) {
                const session = JSON.parse(saved);

                // Verificar que no sea muy antigua (7 días)
                const age = Date.now() - session.timestamp;
                const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

                if (age < maxAge) {
                    this.visualEditor.generatedCSS = session.generatedCSS || [];
                    this.visualEditor.applyGeneratedCSS();

                    this.showToast(`✓ Sesión recuperada (${session.generatedCSS.length} reglas)`, 'success');
                    console.log('📂 Sesión cargada:', session);
                } else {
                    console.log('⚠️ Sesión muy antigua, ignorando');
                    localStorage.removeItem(this.sessionKey);
                }
            }
        } catch (e) {
            console.warn('⚠️ No se pudo cargar la sesión:', e);
        }
    }

    // Hook into Visual Editor methods para auto-save
    hookAutoSave() {
        const originalApplyColor = this.visualEditor.applyColor.bind(this.visualEditor);
        this.visualEditor.applyColor = () => {
            originalApplyColor();
            this.saveSession();
            this.updateBreadcrumb(this.visualEditor.getElementSelector(this.visualEditor.selectedElement));
        };

        const originalSelectElement = this.visualEditor.selectElement.bind(this.visualEditor);
        this.visualEditor.selectElement = (el) => {
            originalSelectElement(el);
            this.updateBreadcrumb(this.visualEditor.getElementSelector(el));
        };

        const originalDeselectElement = this.visualEditor.deselectElement.bind(this.visualEditor);
        this.visualEditor.deselectElement = () => {
            originalDeselectElement();
            this.updateBreadcrumb(null);
        };
    }
}

// Inicializar cuando todo esté listo
let devVisualEditorPro;

function initDevVisualEditorPro() {
    if (window.devVisualEditor) {
        devVisualEditorPro = new DevVisualEditorPro(window.devVisualEditor);
        devVisualEditorPro.hookAutoSave();
        window.devVisualEditorPro = devVisualEditorPro;
        console.log('✨ Dev Visual Editor Pro listo!');
        console.log('💡 Presiona Ctrl+Shift+K para ver todos los shortcuts');
    } else {
        console.log('⏳ Esperando a DevVisualEditor...');
        setTimeout(initDevVisualEditorPro, 500);
    }
}

// Esperar a que todo esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initDevVisualEditorPro, 2500);
    });
} else {
    setTimeout(initDevVisualEditorPro, 2500);
}
