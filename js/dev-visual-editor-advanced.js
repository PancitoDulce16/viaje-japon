// Dev Visual Editor Advanced Features
// Sliders, Undo/Redo, Presets, Grid, Animations

class DevVisualEditorAdvanced {
    constructor(visualEditor) {
        this.visualEditor = visualEditor;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.gridEnabled = false;
        this.presets = this.loadPresets();
        this.init();
    }

    init() {
        this.injectAdvancedUI();
        this.setupKeyboardShortcuts();
    }

    injectAdvancedUI() {
        const devPanel = this.visualEditor.devPanel.panel;
        const visualEditorSection = devPanel.querySelector('#dev-color-picker-panel').parentElement;

        const advancedHTML = `
            <!-- Property Sliders -->
            <div style="margin-top: 20px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <div style="color: #fff; font-size: 12px; font-weight: 600;">📏 Propiedades</div>
                    <button onclick="devVisualEditorAdvanced.toggleSliders()" id="toggle-sliders-btn" style="background: #333; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">▼</button>
                </div>
                <div id="property-sliders" style="display: none;">
                    <!-- Border Radius -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 4px;">Border Radius: <span id="radius-value">0px</span></label>
                        <input type="range" id="slider-radius" min="0" max="50" value="0" style="width: 100%;" oninput="devVisualEditorAdvanced.applySlider('border-radius', this.value + 'px')">
                    </div>
                    <!-- Opacity -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 4px;">Opacity: <span id="opacity-value">100%</span></label>
                        <input type="range" id="slider-opacity" min="0" max="100" value="100" style="width: 100%;" oninput="devVisualEditorAdvanced.applySlider('opacity', this.value / 100)">
                    </div>
                    <!-- Font Size -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 4px;">Font Size: <span id="fontsize-value">16px</span></label>
                        <input type="range" id="slider-fontsize" min="10" max="50" value="16" style="width: 100%;" oninput="devVisualEditorAdvanced.applySlider('font-size', this.value + 'px')">
                    </div>
                    <!-- Padding -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 4px;">Padding: <span id="padding-value">0px</span></label>
                        <input type="range" id="slider-padding" min="0" max="100" value="0" style="width: 100%;" oninput="devVisualEditorAdvanced.applySlider('padding', this.value + 'px')">
                    </div>
                    <!-- Shadow Blur -->
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; color: #ccc; font-size: 11px; margin-bottom: 4px;">Shadow Blur: <span id="shadow-value">0px</span></label>
                        <input type="range" id="slider-shadow" min="0" max="50" value="0" style="width: 100%;" oninput="devVisualEditorAdvanced.applyShadow(this.value)">
                    </div>
                </div>
            </div>

            <!-- Undo/Redo Controls -->
            <div style="margin-top: 12px; display: flex; gap: 6px;">
                <button onclick="devVisualEditorAdvanced.undo()" style="flex: 1; background: #2a2a2a; border: 1px solid #444; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    ⬅️ Undo (Ctrl+Z)
                </button>
                <button onclick="devVisualEditorAdvanced.redo()" style="flex: 1; background: #2a2a2a; border: 1px solid #444; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    ➡️ Redo (Ctrl+Y)
                </button>
            </div>

            <!-- Style Presets -->
            <div style="margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="color: #fff; font-size: 12px; font-weight: 600; margin-bottom: 8px;">🎭 Presets</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                    <button onclick="devVisualEditorAdvanced.applyPreset('kawaii-button')" style="background: linear-gradient(135deg, #FFB7C5, #FFE4E9); border: none; color: #4a4a4a; padding: 8px; border-radius: 12px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        🌸 Kawaii
                    </button>
                    <button onclick="devVisualEditorAdvanced.applyPreset('ninja-card')" style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); border: 1px solid #D4AF37; color: #D4AF37; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        🥷 Ninja
                    </button>
                    <button onclick="devVisualEditorAdvanced.applyPreset('glass-card')" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 12px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        💎 Glass
                    </button>
                    <button onclick="devVisualEditorAdvanced.applyPreset('neon-glow')" style="background: #000; border: 2px solid #0ff; color: #0ff; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 10px; font-weight: 600; box-shadow: 0 0 10px #0ff;">
                        ⚡ Neon
                    </button>
                </div>
                <button onclick="devVisualEditorAdvanced.saveCustomPreset()" style="width: 100%; background: #333; border: 1px solid #555; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px;">
                    💾 Guardar Preset Actual
                </button>
            </div>

            <!-- Grid & Helpers -->
            <div style="margin-top: 12px; display: flex; gap: 6px;">
                <button onclick="devVisualEditorAdvanced.toggleGrid()" id="grid-toggle-btn" style="flex: 1; background: #2a2a2a; border: 1px solid #444; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    📐 Grid: OFF
                </button>
                <button onclick="devVisualEditorAdvanced.toggleAnimationMode()" id="anim-toggle-btn" style="flex: 1; background: #2a2a2a; border: 1px solid #444; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    ✨ Anims
                </button>
            </div>

            <!-- Animation Panel -->
            <div id="animation-panel" style="display: none; margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="color: #fff; font-size: 12px; font-weight: 600; margin-bottom: 8px;">✨ Animaciones</div>
                <select id="animation-type" style="width: 100%; padding: 6px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; margin-bottom: 8px; font-size: 11px;">
                    <option value="none">Sin animación</option>
                    <optgroup label="Hover Effects">
                        <option value="hover-lift">🔝 Lift (elevar)</option>
                        <option value="hover-scale">🔍 Scale (agrandar)</option>
                        <option value="hover-glow">✨ Glow (brillo)</option>
                        <option value="hover-rotate">🔄 Rotate (rotar)</option>
                    </optgroup>
                    <optgroup label="Entrance">
                        <option value="fade-in">👻 Fade In</option>
                        <option value="slide-in">➡️ Slide In</option>
                        <option value="bounce-in">🎾 Bounce In</option>
                    </optgroup>
                    <optgroup label="Loop">
                        <option value="float">☁️ Float (flotar)</option>
                        <option value="pulse">💓 Pulse (pulsar)</option>
                        <option value="shimmer">✨ Shimmer (brillar)</option>
                    </optgroup>
                </select>
                <button onclick="devVisualEditorAdvanced.applyAnimation()" style="width: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
                    ▶️ Aplicar Animación
                </button>
            </div>
        `;

        visualEditorSection.insertAdjacentHTML('beforeend', advancedHTML);
    }

    toggleSliders() {
        const sliders = document.getElementById('property-sliders');
        const btn = document.getElementById('toggle-sliders-btn');
        if (sliders.style.display === 'none') {
            sliders.style.display = 'block';
            btn.textContent = '▲';
        } else {
            sliders.style.display = 'none';
            btn.textContent = '▼';
        }
    }

    applySlider(property, value) {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        // Actualizar display
        const displayId = property.replace('-', '') + '-value';
        const display = document.getElementById(displayId);
        if (display) {
            display.textContent = value;
        }

        // Aplicar estilo
        const selector = this.visualEditor.getElementSelector(this.visualEditor.selectedElement);
        const css = `${selector} { ${property}: ${value} !important; }`;

        // Guardar en historial
        this.saveToHistory();

        // Aplicar
        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        this.visualEditor.showStatus(`✓ ${property}: ${value}`, 'success');
    }

    applyShadow(blur) {
        if (!this.visualEditor.selectedElement) return;

        document.getElementById('shadow-value').textContent = blur + 'px';

        const selector = this.visualEditor.getElementSelector(this.visualEditor.selectedElement);
        const css = `${selector} { box-shadow: 0 4px ${blur}px rgba(0,0,0,0.3) !important; }`;

        this.saveToHistory();
        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        this.visualEditor.showStatus(`✓ Shadow: ${blur}px`, 'success');
    }

    // UNDO/REDO
    saveToHistory() {
        // Remover estados futuros si estamos en medio del historial
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Guardar estado actual
        this.history.push([...this.visualEditor.generatedCSS]);
        this.historyIndex++;

        // Limitar tamaño del historial
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.visualEditor.generatedCSS = [...this.history[this.historyIndex]];
            this.visualEditor.applyGeneratedCSS();
            this.visualEditor.showStatus('↩️ Deshacer', 'success');
        } else {
            this.visualEditor.showStatus('⚠️ No hay más cambios para deshacer', 'error');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.visualEditor.generatedCSS = [...this.history[this.historyIndex]];
            this.visualEditor.applyGeneratedCSS();
            this.visualEditor.showStatus('↪️ Rehacer', 'success');
        } else {
            this.visualEditor.showStatus('⚠️ No hay más cambios para rehacer', 'error');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z = Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            // Ctrl+Y o Ctrl+Shift+Z = Redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    // PRESETS
    applyPreset(presetName) {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        const presets = {
            'kawaii-button': {
                'background': 'linear-gradient(135deg, #FFB7C5, #FFE4E9)',
                'border-radius': '20px',
                'padding': '12px 24px',
                'border': 'none',
                'box-shadow': '0 4px 12px rgba(255, 183, 197, 0.3)',
                'color': '#4a4a4a',
                'font-weight': '600'
            },
            'ninja-card': {
                'background': 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                'border': '1px solid #D4AF37',
                'border-radius': '8px',
                'padding': '16px',
                'box-shadow': '0 4px 12px rgba(212, 175, 55, 0.3)',
                'color': '#D4AF37'
            },
            'glass-card': {
                'background': 'rgba(255, 255, 255, 0.1)',
                'backdrop-filter': 'blur(10px)',
                'border': '1px solid rgba(255, 255, 255, 0.3)',
                'border-radius': '16px',
                'padding': '20px',
                'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)'
            },
            'neon-glow': {
                'background': '#000',
                'border': '2px solid #0ff',
                'border-radius': '8px',
                'padding': '12px 24px',
                'box-shadow': '0 0 10px #0ff, inset 0 0 10px #0ff',
                'color': '#0ff'
            }
        };

        const preset = presets[presetName];
        if (!preset) return;

        this.saveToHistory();

        const selector = this.visualEditor.getElementSelector(this.visualEditor.selectedElement);
        const cssRules = Object.entries(preset).map(([prop, val]) => `${prop}: ${val}`).join('; ');
        const css = `${selector} { ${cssRules} !important; }`;

        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        this.visualEditor.showStatus(`✓ Preset "${presetName}" aplicado`, 'success');
    }

    saveCustomPreset() {
        const name = prompt('Nombre para este preset:');
        if (!name) return;

        // TODO: Guardar preset custom en localStorage
        alert('💾 Feature próximamente: Guardar presets custom');
    }

    loadPresets() {
        // TODO: Cargar de localStorage
        return {};
    }

    // GRID OVERLAY
    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        const btn = document.getElementById('grid-toggle-btn');

        if (this.gridEnabled) {
            this.showGrid();
            btn.textContent = '📐 Grid: ON';
            btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        } else {
            this.hideGrid();
            btn.textContent = '📐 Grid: OFF';
            btn.style.background = '#2a2a2a';
        }
    }

    showGrid() {
        let grid = document.getElementById('dev-grid-overlay');
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'dev-grid-overlay';
            grid.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 999999;
                background-image:
                    repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 16px),
                    repeating-linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0px, transparent 1px, transparent 16px);
                background-size: 16px 16px;
            `;
            document.body.appendChild(grid);
        }
        grid.style.display = 'block';
    }

    hideGrid() {
        const grid = document.getElementById('dev-grid-overlay');
        if (grid) grid.style.display = 'none';
    }

    // ANIMATIONS
    toggleAnimationMode() {
        const panel = document.getElementById('animation-panel');
        const btn = document.getElementById('anim-toggle-btn');

        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.style.background = 'linear-gradient(135deg, #f093fb, #f5576c)';
        } else {
            panel.style.display = 'none';
            btn.style.background = '#2a2a2a';
        }
    }

    applyAnimation() {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        const animType = document.getElementById('animation-type').value;
        if (animType === 'none') return;

        const animations = {
            'hover-lift': 'transform: translateY(-4px); transition: all 0.3s ease;',
            'hover-scale': 'transform: scale(1.05); transition: all 0.3s ease;',
            'hover-glow': 'box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); transition: all 0.3s ease;',
            'hover-rotate': 'transform: rotate(5deg); transition: all 0.3s ease;',
            'fade-in': 'animation: fadeIn 0.5s ease-in;',
            'slide-in': 'animation: slideIn 0.5s ease-out;',
            'bounce-in': 'animation: bounceIn 0.6s ease-out;',
            'float': 'animation: float 3s ease-in-out infinite;',
            'pulse': 'animation: pulse 2s ease-in-out infinite;',
            'shimmer': 'animation: shimmer 2s linear infinite;'
        };

        const animCSS = animations[animType];
        if (!animCSS) return;

        this.saveToHistory();

        const selector = this.visualEditor.getElementSelector(this.visualEditor.selectedElement);
        const isHover = animType.startsWith('hover-');
        const css = isHover ?
            `${selector}:hover { ${animCSS} !important; }` :
            `${selector} { ${animCSS} !important; }`;

        // Agregar keyframes si es necesario
        this.injectAnimationKeyframes();

        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        this.visualEditor.showStatus(`✓ Animación "${animType}" aplicada`, 'success');
    }

    injectAnimationKeyframes() {
        if (document.getElementById('dev-animation-keyframes')) return;

        const keyframes = document.createElement('style');
        keyframes.id = 'dev-animation-keyframes';
        keyframes.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
        `;
        document.head.appendChild(keyframes);
    }
}

// Inicializar cuando Visual Editor esté listo
let devVisualEditorAdvanced;
setTimeout(() => {
    if (window.devVisualEditor) {
        devVisualEditorAdvanced = new DevVisualEditorAdvanced(window.devVisualEditor);
        window.devVisualEditorAdvanced = devVisualEditorAdvanced;
        console.log('🚀 Dev Visual Editor Advanced listo!');
    } else {
        console.log('⏳ Esperando Visual Editor...');
        setTimeout(arguments.callee, 500);
    }
}, 2000);
