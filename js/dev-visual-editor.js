// Dev Visual Editor - Drag & Drop + Color Picker + Inspector
// Extensión del Dev Panel para edición visual

class DevVisualEditor {
    constructor(devPanel) {
        this.devPanel = devPanel;
        this.editMode = false;
        this.colorPickerMode = false;
        this.selectedElement = null;
        this.originalStyles = new Map();
        this.generatedCSS = [];
        this.init();
    }

    init() {
        this.injectEditorUI();
    }

    injectEditorUI() {
        // Agregar botones al Dev Panel
        const quickFixesSection = this.devPanel.panel.querySelector('.dev-quick-fixes');
        if (!quickFixesSection) return;

        const editorSection = document.createElement('div');
        editorSection.style.cssText = 'margin-top: 20px;';
        editorSection.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <span style="font-size: 18px;">🎨</span>
                    <h4 style="margin: 0; color: #fff; font-size: 14px;">Visual Editor</h4>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <button id="dev-toggle-edit-mode" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                        🎯 <span id="edit-mode-text">Activar Modo Edición</span>
                    </button>
                    <button id="dev-toggle-color-picker" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                        🎨 <span id="color-mode-text">Activar Color Picker</span>
                    </button>
                    <button onclick="devVisualEditor.showGeneratedCSS()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                        📋 Copiar CSS
                    </button>
                    <button onclick="devVisualEditor.saveToFile()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s; font-weight: 600;">
                        💾 Guardar CSS a Archivo
                    </button>
                    <button onclick="devVisualEditor.clearEdits()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                        🗑️ Limpiar Cambios
                    </button>
                </div>

                <!-- Color Picker Panel -->
                <div id="dev-color-picker-panel" style="display: none; margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                    <div style="margin-bottom: 8px; color: #fff; font-size: 12px; font-weight: 600;">Elige una propiedad:</div>
                    <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
                        <button onclick="devVisualEditor.setColorProperty('background')" style="background: #333; border: 1px solid #555; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">Background</button>
                        <button onclick="devVisualEditor.setColorProperty('color')" style="background: #333; border: 1px solid #555; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">Text Color</button>
                        <button onclick="devVisualEditor.setColorProperty('border-color')" style="background: #333; border: 1px solid #555; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">Border</button>
                    </div>
                    <div style="margin-bottom: 8px;">
                        <label style="display: block; color: #fff; font-size: 11px; margin-bottom: 4px;">Color:</label>
                        <input type="color" id="dev-color-input" style="width: 100%; height: 40px; border: none; border-radius: 4px; cursor: pointer;">
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="devVisualEditor.applyColor()" style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">✓ Aplicar</button>
                        <button onclick="devVisualEditor.cancelColorPicker()" style="flex: 1; background: #444; border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">✗ Cancelar</button>
                    </div>
                </div>

                <!-- Element Inspector -->
                <div id="dev-element-inspector" style="display: none; margin-top: 12px; background: #1a1a1a; border: 1px solid #667eea; border-radius: 8px; padding: 12px;">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                        <div style="color: #667eea; font-size: 12px; font-weight: 600;">🔍 Elemento Seleccionado</div>
                        <button onclick="devVisualEditor.deselectElement()" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">✗</button>
                    </div>
                    <div id="dev-element-info" style="font-size: 11px; color: #ccc; margin-bottom: 12px;"></div>
                    <div id="dev-element-styles" style="font-size: 10px; color: #aaa; max-height: 150px; overflow-y: auto; font-family: monospace;"></div>
                </div>

                <!-- Status -->
                <div id="dev-visual-status" style="margin-top: 10px; font-size: 11px;"></div>
            </div>
        `;

        quickFixesSection.parentNode.insertBefore(editorSection, quickFixesSection.nextSibling);

        // Event listeners
        document.getElementById('dev-toggle-edit-mode').addEventListener('click', () => this.toggleEditMode());
        document.getElementById('dev-toggle-color-picker').addEventListener('click', () => this.toggleColorPicker());
        document.getElementById('dev-color-input').addEventListener('input', (e) => this.previewColor(e.target.value));
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const button = document.getElementById('edit-mode-text');

        if (this.editMode) {
            button.textContent = 'Desactivar Modo Edición';
            document.getElementById('dev-toggle-edit-mode').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.enableEditMode();
            this.showStatus('🎯 Modo Edición activado - Arrastra elementos', 'info');
        } else {
            button.textContent = 'Activar Modo Edición';
            document.getElementById('dev-toggle-edit-mode').style.background = '#2a2a2a';
            this.disableEditMode();
            this.showStatus('✓ Modo Edición desactivado', 'success');
        }
    }

    enableEditMode() {
        // Hacer todos los elementos principales draggables
        const editableSelectors = [
            '#currentTripHeader',
            '.stat-card',
            '.floating-btn',
            '.japan-header',
            '#tripStatsDashboard',
            '.tab-content',
            'img[alt*="Japitin"]'
        ];

        editableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.hasAttribute('data-original-position')) {
                    const computed = window.getComputedStyle(el);
                    el.setAttribute('data-original-position', computed.position);
                    el.setAttribute('data-original-top', computed.top);
                    el.setAttribute('data-original-left', computed.left);
                }

                el.style.cursor = 'move';
                el.style.outline = '2px dashed rgba(102, 126, 234, 0.5)';
                el.draggable = true;

                el.addEventListener('dragstart', this.handleDragStart.bind(this));
                el.addEventListener('dragend', this.handleDragEnd.bind(this));
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectElement(el);
                });
            });
        });
    }

    disableEditMode() {
        document.querySelectorAll('[draggable="true"]').forEach(el => {
            el.style.cursor = '';
            el.style.outline = '';
            el.draggable = false;
        });
    }

    handleDragStart(e) {
        const el = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', el.innerHTML);

        setTimeout(() => {
            el.style.opacity = '0.5';
        }, 0);
    }

    handleDragEnd(e) {
        const el = e.target;
        el.style.opacity = '';

        // Guardar nueva posición
        const rect = el.getBoundingClientRect();
        this.savePositionCSS(el, rect.left, rect.top);
    }

    savePositionCSS(el, left, top) {
        const selector = this.getElementSelector(el);
        const css = `${selector} { position: fixed !important; left: ${left}px !important; top: ${top}px !important; }`;
        this.generatedCSS.push(css);

        // APLICAR CSS A LA PÁGINA EN TIEMPO REAL
        this.applyGeneratedCSS();

        this.showStatus('📍 Posición guardada', 'success');
    }

    toggleColorPicker() {
        this.colorPickerMode = !this.colorPickerMode;
        const button = document.getElementById('color-mode-text');
        const panel = document.getElementById('dev-color-picker-panel');

        if (this.colorPickerMode) {
            button.textContent = 'Desactivar Color Picker';
            document.getElementById('dev-toggle-color-picker').style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            panel.style.display = 'block';
            this.enableColorPicker();
            this.showStatus('🎨 Color Picker activado - Click en elementos', 'info');
        } else {
            button.textContent = 'Activar Color Picker';
            document.getElementById('dev-toggle-color-picker').style.background = '#2a2a2a';
            panel.style.display = 'none';
            this.disableColorPicker();
            this.showStatus('✓ Color Picker desactivado', 'success');
        }
    }

    enableColorPicker() {
        document.body.style.cursor = 'crosshair';

        this.colorPickerListener = (e) => {
            const el = e.target;
            if (el.closest('#dev-panel')) return; // Ignorar el panel mismo

            e.stopPropagation();
            e.preventDefault();

            this.selectElement(el);
            this.showColorPicker(el);
        };

        document.addEventListener('click', this.colorPickerListener, true);

        // Hover effect
        this.colorPickerHover = (e) => {
            if (e.target.closest('#dev-panel')) return;
            e.target.style.outline = '2px solid rgba(245, 87, 108, 0.8)';
        };
        this.colorPickerHoverOut = (e) => {
            if (e.target.closest('#dev-panel')) return;
            if (e.target !== this.selectedElement) {
                e.target.style.outline = '';
            }
        };

        document.addEventListener('mouseover', this.colorPickerHover);
        document.addEventListener('mouseout', this.colorPickerHoverOut);
    }

    disableColorPicker() {
        document.body.style.cursor = '';
        if (this.colorPickerListener) {
            document.removeEventListener('click', this.colorPickerListener, true);
        }
        if (this.colorPickerHover) {
            document.removeEventListener('mouseover', this.colorPickerHover);
            document.removeEventListener('mouseout', this.colorPickerHoverOut);
        }

        // Limpiar outlines
        document.querySelectorAll('[style*="outline"]').forEach(el => {
            if (!el.closest('#dev-panel')) {
                el.style.outline = '';
            }
        });
    }

    showColorPicker(el) {
        const computed = window.getComputedStyle(el);
        const colorInput = document.getElementById('dev-color-input');

        if (this.colorProperty === 'background') {
            colorInput.value = this.rgbToHex(computed.backgroundColor);
        } else if (this.colorProperty === 'color') {
            colorInput.value = this.rgbToHex(computed.color);
        } else if (this.colorProperty === 'border-color') {
            colorInput.value = this.rgbToHex(computed.borderColor);
        }
    }

    setColorProperty(property) {
        this.colorProperty = property;
        this.showStatus(`🎨 Propiedad seleccionada: ${property}`, 'info');

        // Highlight button
        document.querySelectorAll('#dev-color-picker-panel button').forEach(btn => {
            btn.style.background = '#333';
        });
        event.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    previewColor(color) {
        if (!this.selectedElement || !this.colorProperty) return;

        // Guardar estilo original si no existe
        if (!this.originalStyles.has(this.selectedElement)) {
            this.originalStyles.set(this.selectedElement, {
                background: this.selectedElement.style.background,
                color: this.selectedElement.style.color,
                borderColor: this.selectedElement.style.borderColor
            });
        }

        // Aplicar preview
        if (this.colorProperty === 'background') {
            this.selectedElement.style.background = color;
        } else if (this.colorProperty === 'color') {
            this.selectedElement.style.color = color;
        } else if (this.colorProperty === 'border-color') {
            this.selectedElement.style.borderColor = color;
        }
    }

    applyColor() {
        if (!this.selectedElement || !this.colorProperty) {
            this.showStatus('⚠️ Selecciona un elemento y propiedad primero', 'error');
            return;
        }

        const color = document.getElementById('dev-color-input').value;
        const selector = this.getElementSelector(this.selectedElement);
        const css = `${selector} { ${this.colorProperty}: ${color} !important; }`;

        // DEBUG LOG
        console.log('🎨 Aplicando color:', {
            selector,
            property: this.colorProperty,
            color,
            css,
            element: this.selectedElement
        });

        this.generatedCSS.push(css);
        this.originalStyles.delete(this.selectedElement); // Confirmar cambio

        // APLICAR CSS A LA PÁGINA EN TIEMPO REAL
        this.applyGeneratedCSS();

        // Verificar que se aplicó
        const styleTag = document.getElementById('dev-visual-editor-styles');
        console.log('📝 Style tag content:', styleTag?.textContent);

        this.showStatus(`✓ Color aplicado: ${color} a ${selector}`, 'success');
    }

    applyGeneratedCSS() {
        // Crear o actualizar style tag con el CSS generado
        let styleTag = document.getElementById('dev-visual-editor-styles');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dev-visual-editor-styles';
            // Insertar AL FINAL para máxima especificidad
            document.head.appendChild(styleTag);
        }

        // Aplicar todo el CSS generado
        // Agregar comentario para debugging
        const cssContent = '/* Dev Visual Editor Styles */\n' + this.generatedCSS.join('\n');
        styleTag.textContent = cssContent;

        console.log('✅ CSS aplicado al DOM:', cssContent);
    }

    cancelColorPicker() {
        if (this.selectedElement && this.originalStyles.has(this.selectedElement)) {
            const original = this.originalStyles.get(this.selectedElement);
            this.selectedElement.style.background = original.background;
            this.selectedElement.style.color = original.color;
            this.selectedElement.style.borderColor = original.borderColor;
            this.originalStyles.delete(this.selectedElement);
        }
        this.deselectElement();
    }

    selectElement(el) {
        // Deselect previous
        if (this.selectedElement) {
            this.selectedElement.style.outline = '';
        }

        this.selectedElement = el;
        el.style.outline = '3px solid #667eea';

        // Show inspector
        const inspector = document.getElementById('dev-element-inspector');
        inspector.style.display = 'block';

        const info = document.getElementById('dev-element-info');
        const selector = this.getElementSelector(el);
        info.innerHTML = `<strong>${selector}</strong>`;

        // Show styles
        const styles = document.getElementById('dev-element-styles');
        const computed = window.getComputedStyle(el);
        styles.innerHTML = `
background: ${computed.backgroundColor}<br>
color: ${computed.color}<br>
width: ${computed.width}<br>
height: ${computed.height}<br>
padding: ${computed.padding}<br>
margin: ${computed.margin}<br>
border: ${computed.border}<br>
position: ${computed.position}
        `.trim();
    }

    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.style.outline = '';
            this.selectedElement = null;
        }
        document.getElementById('dev-element-inspector').style.display = 'none';
    }

    getElementSelector(el) {
        // Prioridad 1: ID es el más específico
        if (el.id) return `#${el.id}`;

        // Prioridad 2: Clases significativas (evitar clases de Tailwind muy genéricas)
        if (el.className && typeof el.className === 'string') {
            const classes = el.className.split(' ')
                .filter(c => c.trim())
                .filter(c => !c.startsWith('text-'))     // Ignorar clases de texto
                .filter(c => !c.startsWith('bg-'))       // Ignorar bg-
                .filter(c => !c.startsWith('from-'))     // Ignorar from-
                .filter(c => !c.startsWith('to-'))       // Ignorar to-
                .filter(c => !c.startsWith('via-'))      // Ignorar via-
                .filter(c => !c.startsWith('p-'))        // Ignorar padding
                .filter(c => !c.startsWith('pt-'))       // Ignorar padding-top
                .filter(c => !c.startsWith('pb-'))       // Ignorar padding-bottom
                .filter(c => !c.startsWith('px-'))       // Ignorar padding-x
                .filter(c => !c.startsWith('py-'))       // Ignorar padding-y
                .filter(c => !c.startsWith('m-'))        // Ignorar margin
                .filter(c => !c.startsWith('mt-'))       // Ignorar margin-top
                .filter(c => !c.startsWith('mb-'))       // Ignorar margin-bottom
                .filter(c => !c.startsWith('mx-'))       // Ignorar margin-x
                .filter(c => !c.startsWith('my-'))       // Ignorar margin-y
                .filter(c => !c.startsWith('w-'))        // Ignorar width
                .filter(c => !c.startsWith('h-'))        // Ignorar height
                .filter(c => !c.startsWith('gap-'))      // Ignorar gap
                .filter(c => !c.startsWith('space-'))    // Ignorar space
                .filter(c => !c.startsWith('rounded-'))  // Ignorar rounded
                .filter(c => !c.includes('/'));           // Ignorar opacidades como blue-500/60

            // Buscar clases significativas (como stat-card, premium-card, etc)
            const significantClasses = classes.filter(c =>
                c.includes('card') ||
                c.includes('btn') ||
                c.includes('modal') ||
                c.includes('header') ||
                c.includes('banner') ||
                c.includes('container')
            );

            if (significantClasses.length > 0) {
                // Usar SOLO la clase más importante con más especificidad
                const mainClass = significantClasses[0];

                // ESTRATEGIA MEJORADA: Combinar padre + nth-child para MÁXIMA especificidad
                const parent = el.parentElement;
                if (parent) {
                    // Contar hermanos con la misma clase significativa
                    const siblings = Array.from(parent.children).filter(child =>
                        child.classList && child.classList.contains(mainClass)
                    );

                    if (siblings.length > 1) {
                        // Hay múltiples elementos con esta clase
                        const index = siblings.indexOf(el) + 1;

                        // Si el padre tiene ID, usarlo para máxima especificidad
                        if (parent.id) {
                            return `#${parent.id} > .${mainClass}:nth-child(${Array.from(parent.children).indexOf(el) + 1})`;
                        }

                        // Si no, usar clase del padre si existe
                        const parentClasses = parent.className ?
                            parent.className.split(' ').filter(c => c.trim() && !c.startsWith('bg-') && !c.startsWith('flex'))[0] : null;

                        if (parentClasses) {
                            return `.${parentClasses} > .${mainClass}:nth-child(${Array.from(parent.children).indexOf(el) + 1})`;
                        }

                        // Último recurso: usar tagName del padre
                        return `${parent.tagName.toLowerCase()} > .${mainClass}:nth-child(${Array.from(parent.children).indexOf(el) + 1})`;
                    }

                    // Solo hay uno con esta clase, pero aún así ser específicos
                    if (parent.id) {
                        return `#${parent.id} > .${mainClass}`;
                    }
                }

                return `.${mainClass}`;
            }

            // Si no hay clases significativas pero hay clases, usar las primeras 2
            if (classes.length > 0) {
                return '.' + classes.slice(0, 2).join('.');
            }
        }

        // Prioridad 3: Tag + nth-child para más especificidad
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children);
            const index = siblings.indexOf(el) + 1;

            // Agregar ID del padre si existe
            if (parent.id) {
                return `#${parent.id} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
            }

            return `${el.tagName.toLowerCase()}:nth-child(${index})`;
        }

        return el.tagName.toLowerCase();
    }

    showGeneratedCSS() {
        if (this.generatedCSS.length === 0) {
            this.showStatus('⚠️ No hay CSS generado todavía', 'error');
            return;
        }

        const css = this.generatedCSS.join('\n\n');
        const textarea = document.getElementById('dev-live-css');
        textarea.value = css;

        navigator.clipboard.writeText(css);
        this.showStatus('📋 CSS generado copiado al portapapeles (' + this.generatedCSS.length + ' reglas)', 'success');
    }

    saveToFile() {
        if (this.generatedCSS.length === 0) {
            this.showStatus('⚠️ No hay CSS generado todavía', 'error');
            return;
        }

        const css = this.generatedCSS.join('\n\n');
        const filename = prompt('Nombre del archivo CSS (sin extensión):', 'visual-editor-styles');
        if (!filename) return;

        // Crear comentario informativo en el archivo
        const header = `/*
 * CSS Generado por Visual Editor
 * Fecha: ${new Date().toLocaleString('es-ES')}
 * Total de reglas: ${this.generatedCSS.length}
 */

`;

        const fullCSS = header + css;

        // Crear blob y descargar
        const blob = new Blob([fullCSS], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.css`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // También copiar al portapapeles
        navigator.clipboard.writeText(fullCSS);

        // Guardar en localStorage como backup
        localStorage.setItem('visual-editor-last-css', fullCSS);
        localStorage.setItem('visual-editor-last-css-timestamp', new Date().toISOString());

        this.showStatus(`💾 Archivo "${filename}.css" guardado y descargado (${this.generatedCSS.length} reglas)`, 'success');
    }

    clearEdits() {
        this.generatedCSS = [];
        this.originalStyles.clear();
        this.deselectElement();

        // Reload page to reset all changes
        if (confirm('¿Recargar la página para limpiar todos los cambios?')) {
            location.reload();
        } else {
            this.showStatus('✓ Cambios limpiados', 'success');
        }
    }

    rgbToHex(rgb) {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return '#000000';

        const hex = (x) => {
            const h = parseInt(x).toString(16);
            return h.length === 1 ? '0' + h : h;
        };

        return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }

    showStatus(message, type) {
        const status = document.getElementById('dev-visual-status');
        const colors = {
            success: { text: '#00f260', bg: 'rgba(0, 242, 96, 0.1)', border: 'rgba(0, 242, 96, 0.3)' },
            error: { text: '#f5576c', bg: 'rgba(245, 87, 108, 0.1)', border: 'rgba(245, 87, 108, 0.3)' },
            info: { text: '#667eea', bg: 'rgba(102, 126, 234, 0.1)', border: 'rgba(102, 126, 234, 0.3)' }
        };

        const color = colors[type] || colors.info;
        status.innerHTML = `<div style="color: ${color.text}; padding: 8px; background: ${color.bg}; border-radius: 6px; border: 1px solid ${color.border}; font-size: 11px;">${message}</div>`;

        setTimeout(() => {
            status.innerHTML = '';
        }, 4000);
    }
}

// Inicializar Visual Editor cuando Dev Panel esté listo
let devVisualEditor;

function initVisualEditor() {
    if (window.devPanel) {
        devVisualEditor = new DevVisualEditor(window.devPanel);
        window.devVisualEditor = devVisualEditor;
        console.log('🎨 Dev Visual Editor listo!');
    } else {
        console.log('⏳ Esperando Dev Panel...');
        setTimeout(initVisualEditor, 500);
    }
}

// Intentar inicializar después de que la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initVisualEditor, 1000);
    });
} else {
    setTimeout(initVisualEditor, 1000);
}
