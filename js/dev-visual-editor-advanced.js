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
        // Cargar presets custom después de inyectar UI
        setTimeout(() => this.renderCustomPresets(), 100);
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #fff; font-size: 12px; font-weight: 600;">🎭 Presets</div>
                    <button onclick="devVisualEditorAdvanced.togglePresetCategories()" id="toggle-presets-btn" style="background: #333; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">▼</button>
                </div>

                <div id="preset-categories">
                    <!-- Buttons & Cards -->
                    <div style="margin-bottom: 10px;">
                        <div style="color: #999; font-size: 10px; margin-bottom: 4px;">Buttons & Cards</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="devVisualEditorAdvanced.applyPreset('kawaii-button')" style="background: linear-gradient(135deg, #FFB7C5, #FFE4E9); border: none; color: #4a4a4a; padding: 8px; border-radius: 12px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                🌸 Kawaii
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('ninja-card')" style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); border: 1px solid #D4AF37; color: #D4AF37; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                🥷 Ninja
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('glass-card')" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px; border-radius: 12px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                💎 Glass
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('gradient-modern')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; padding: 8px; border-radius: 10px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                🎨 Gradient
                            </button>
                        </div>
                    </div>

                    <!-- Effects & Badges -->
                    <div style="margin-bottom: 10px;">
                        <div style="color: #999; font-size: 10px; margin-bottom: 4px;">Effects & Badges</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button onclick="devVisualEditorAdvanced.applyPreset('neon-glow')" style="background: #000; border: 2px solid #0ff; color: #0ff; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 10px; font-weight: 600; box-shadow: 0 0 10px #0ff;">
                                ⚡ Neon
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('badge-success')" style="background: #10b981; border: none; color: white; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                ✓ Success
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('badge-warning')" style="background: #f59e0b; border: none; color: white; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                ⚠ Warning
                            </button>
                            <button onclick="devVisualEditorAdvanced.applyPreset('badge-info')" style="background: #3b82f6; border: none; color: white; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 10px; font-weight: 600;">
                                ℹ Info
                            </button>
                        </div>
                    </div>

                    <!-- Custom Presets -->
                    <div id="custom-presets-section" style="margin-bottom: 10px;">
                        <div style="color: #999; font-size: 10px; margin-bottom: 4px;">Mis Presets</div>
                        <div id="custom-presets-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <!-- Custom presets will be injected here -->
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 6px;">
                    <button onclick="devVisualEditorAdvanced.saveCustomPreset()" style="flex: 1; background: #333; border: 1px solid #555; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px;">
                        💾 Guardar
                    </button>
                    <button onclick="devVisualEditorAdvanced.managePresets()" style="flex: 1; background: #333; border: 1px solid #555; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px;">
                        ⚙️ Gestionar
                    </button>
                </div>
            </div>

            <!-- Responsive Breakpoints -->
            <div style="margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #fff; font-size: 12px; font-weight: 600;">📱 Responsive</div>
                    <button onclick="devVisualEditorAdvanced.toggleResponsive()" id="toggle-responsive-btn" style="background: #333; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">▼</button>
                </div>
                <div id="responsive-panel" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
                        <button onclick="devVisualEditorAdvanced.setViewport('mobile')" style="background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            📱 Mobile<br><span style="font-size: 8px; opacity: 0.7;">375px</span>
                        </button>
                        <button onclick="devVisualEditorAdvanced.setViewport('tablet')" style="background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            📱 Tablet<br><span style="font-size: 8px; opacity: 0.7;">768px</span>
                        </button>
                        <button onclick="devVisualEditorAdvanced.setViewport('laptop')" style="background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            💻 Laptop<br><span style="font-size: 8px; opacity: 0.7;">1024px</span>
                        </button>
                        <button onclick="devVisualEditorAdvanced.setViewport('desktop')" style="background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            🖥️ Desktop<br><span style="font-size: 8px; opacity: 0.7;">1440px</span>
                        </button>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="devVisualEditorAdvanced.setViewport('reset')" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            🔄 Reset
                        </button>
                        <button onclick="devVisualEditorAdvanced.customViewport()" style="flex: 1; background: #2a2a2a; border: 1px solid #555; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            ⚙️ Custom
                        </button>
                    </div>
                    <div id="current-viewport" style="margin-top: 8px; padding: 6px; background: #2a2a2a; border-radius: 4px; text-align: center; color: #0ff; font-size: 10px; font-family: monospace;">
                        🖥️ Full Width
                    </div>
                </div>
            </div>

            <!-- Style Conflict Detector -->
            <div style="margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #fff; font-size: 12px; font-weight: 600;">⚠️ Conflictos CSS</div>
                    <button onclick="devVisualEditorAdvanced.toggleConflicts()" id="toggle-conflicts-btn" style="background: #333; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">▼</button>
                </div>
                <div id="conflicts-panel" style="display: none;">
                    <button onclick="devVisualEditorAdvanced.detectConflicts()" style="width: 100%; background: linear-gradient(135deg, #f093fb, #f5576c); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; margin-bottom: 8px;">
                        🔍 Analizar Conflictos
                    </button>
                    <div id="conflicts-list" style="max-height: 250px; overflow-y: auto;">
                        <div style="color: #666; font-size: 10px; text-align: center; padding: 12px;">
                            Haz clic en "Analizar" para detectar conflictos
                        </div>
                    </div>
                </div>
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

            <!-- CSS Variables Editor -->
            <div style="margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="color: #fff; font-size: 12px; font-weight: 600;">🎨 Variables CSS</div>
                    <button onclick="devVisualEditorAdvanced.toggleCSSVars()" id="toggle-cssvars-btn" style="background: #333; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">▼</button>
                </div>
                <div id="css-vars-panel" style="display: none;">
                    <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                        <button onclick="devVisualEditorAdvanced.detectCSSVars()" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            🔍 Detectar
                        </button>
                        <button onclick="devVisualEditorAdvanced.addCustomCSSVar()" style="flex: 1; background: #2a2a2a; border: 1px solid #555; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                            ➕ Nueva
                        </button>
                    </div>
                    <div id="css-vars-list" style="max-height: 300px; overflow-y: auto;">
                        <!-- Variables CSS aparecerán aquí -->
                        <div style="color: #666; font-size: 10px; text-align: center; padding: 12px;">
                            Haz clic en "Detectar" para encontrar variables CSS
                        </div>
                    </div>
                </div>
            </div>

            <!-- Animation Panel -->
            <div id="animation-panel" style="display: none; margin-top: 12px; background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                <div style="color: #fff; font-size: 12px; font-weight: 600; margin-bottom: 8px;">✨ Animaciones</div>

                <!-- Animation Preview Box -->
                <div style="background: #2a2a2a; border: 1px solid #555; border-radius: 8px; padding: 16px; margin-bottom: 12px; min-height: 100px; display: flex; align-items: center; justify-content: center;">
                    <div id="animation-preview-box" style="background: linear-gradient(135deg, #667eea, #764ba2); width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                        ⭐
                    </div>
                </div>

                <select id="animation-type" onchange="devVisualEditorAdvanced.previewAnimation()" style="width: 100%; padding: 6px; background: #2a2a2a; border: 1px solid #444; color: white; border-radius: 4px; margin-bottom: 8px; font-size: 11px;">
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

                <!-- Animation Controls -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
                    <div>
                        <label style="display: block; color: #999; font-size: 10px; margin-bottom: 4px;">Duración</label>
                        <select id="animation-duration" style="width: 100%; padding: 4px; background: #2a2a2a; border: 1px solid #555; color: white; border-radius: 4px; font-size: 10px;">
                            <option value="0.3s">0.3s</option>
                            <option value="0.5s" selected>0.5s</option>
                            <option value="1s">1s</option>
                            <option value="2s">2s</option>
                            <option value="3s">3s</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; color: #999; font-size: 10px; margin-bottom: 4px;">Easing</label>
                        <select id="animation-easing" style="width: 100%; padding: 4px; background: #2a2a2a; border: 1px solid #555; color: white; border-radius: 4px; font-size: 10px;">
                            <option value="ease">Ease</option>
                            <option value="ease-in">Ease In</option>
                            <option value="ease-out">Ease Out</option>
                            <option value="ease-in-out">Ease In-Out</option>
                            <option value="linear">Linear</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; gap: 6px;">
                    <button onclick="devVisualEditorAdvanced.previewAnimation()" style="flex: 1; background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
                        👁️ Preview
                    </button>
                    <button onclick="devVisualEditorAdvanced.applyAnimation()" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600;">
                        ▶️ Aplicar
                    </button>
                </div>
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
            'gradient-modern': {
                'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'border': 'none',
                'border-radius': '10px',
                'padding': '14px 28px',
                'color': '#fff',
                'font-weight': '600',
                'box-shadow': '0 4px 15px rgba(102, 126, 234, 0.4)'
            },
            'neon-glow': {
                'background': '#000',
                'border': '2px solid #0ff',
                'border-radius': '8px',
                'padding': '12px 24px',
                'box-shadow': '0 0 10px #0ff, inset 0 0 10px #0ff',
                'color': '#0ff'
            },
            'badge-success': {
                'background': '#10b981',
                'border': 'none',
                'border-radius': '20px',
                'padding': '6px 12px',
                'color': '#fff',
                'font-size': '12px',
                'font-weight': '600'
            },
            'badge-warning': {
                'background': '#f59e0b',
                'border': 'none',
                'border-radius': '20px',
                'padding': '6px 12px',
                'color': '#fff',
                'font-size': '12px',
                'font-weight': '600'
            },
            'badge-info': {
                'background': '#3b82f6',
                'border': 'none',
                'border-radius': '20px',
                'padding': '6px 12px',
                'color': '#fff',
                'font-size': '12px',
                'font-weight': '600'
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

    togglePresetCategories() {
        const categories = document.getElementById('preset-categories');
        const btn = document.getElementById('toggle-presets-btn');
        if (categories.style.display === 'none') {
            categories.style.display = 'block';
            btn.textContent = '▲';
        } else {
            categories.style.display = 'none';
            btn.textContent = '▼';
        }
    }

    saveCustomPreset() {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        const name = prompt('Nombre para este preset:');
        if (!name) return;

        // Obtener estilos computados del elemento
        const element = this.visualEditor.selectedElement;
        const computed = window.getComputedStyle(element);

        // Guardar propiedades relevantes
        const preset = {
            'background': computed.background,
            'color': computed.color,
            'border': computed.border,
            'border-radius': computed.borderRadius,
            'padding': computed.padding,
            'font-weight': computed.fontWeight,
            'font-size': computed.fontSize,
            'box-shadow': computed.boxShadow
        };

        // Guardar en localStorage
        const customPresets = this.loadPresets();
        customPresets[name] = preset;
        localStorage.setItem('dev-custom-presets', JSON.stringify(customPresets));

        // Recargar la UI
        this.renderCustomPresets();

        this.visualEditor.showStatus(`💾 Preset "${name}" guardado`, 'success');
    }

    loadPresets() {
        try {
            const stored = localStorage.getItem('dev-custom-presets');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error loading presets:', e);
            return {};
        }
    }

    renderCustomPresets() {
        const container = document.getElementById('custom-presets-container');
        if (!container) return;

        const customPresets = this.loadPresets();
        const presetKeys = Object.keys(customPresets);

        if (presetKeys.length === 0) {
            container.innerHTML = '<div style="color: #666; font-size: 10px; text-align: center; padding: 8px;">Sin presets personalizados</div>';
            return;
        }

        container.innerHTML = presetKeys.map(name => `
            <button onclick="devVisualEditorAdvanced.applyCustomPreset('${name}')" style="background: #2a2a2a; border: 1px solid #555; color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600; position: relative;">
                ⭐ ${name}
            </button>
        `).join('');
    }

    applyCustomPreset(name) {
        const customPresets = this.loadPresets();
        const preset = customPresets[name];

        if (!preset) return;

        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        this.saveToHistory();

        const selector = this.visualEditor.getElementSelector(this.visualEditor.selectedElement);
        const cssRules = Object.entries(preset).map(([prop, val]) => `${prop}: ${val}`).join('; ');
        const css = `${selector} { ${cssRules} !important; }`;

        this.visualEditor.generatedCSS.push(css);
        this.visualEditor.applyGeneratedCSS();

        this.visualEditor.showStatus(`✓ Preset personalizado "${name}" aplicado`, 'success');
    }

    managePresets() {
        const customPresets = this.loadPresets();
        const presetKeys = Object.keys(customPresets);

        if (presetKeys.length === 0) {
            alert('No tienes presets personalizados guardados.');
            return;
        }

        const presetList = presetKeys.map((name, i) => `${i + 1}. ${name}`).join('\n');
        const toDelete = prompt(`Presets guardados:\n${presetList}\n\nEscribe el nombre del preset que quieres eliminar (o cancela):`);

        if (!toDelete) return;

        if (customPresets[toDelete]) {
            delete customPresets[toDelete];
            localStorage.setItem('dev-custom-presets', JSON.stringify(customPresets));
            this.renderCustomPresets();
            this.visualEditor.showStatus(`🗑️ Preset "${toDelete}" eliminado`, 'success');
        } else {
            alert(`❌ No se encontró el preset "${toDelete}"`);
        }
    }

    // CSS VARIABLES EDITOR
    toggleCSSVars() {
        const panel = document.getElementById('css-vars-panel');
        const btn = document.getElementById('toggle-cssvars-btn');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.textContent = '▲';
        } else {
            panel.style.display = 'none';
            btn.textContent = '▼';
        }
    }

    detectCSSVars() {
        // Obtener todas las hojas de estilo
        const allVars = new Map();

        // Buscar en :root de todas las hojas
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText === ':root' || rule.selectorText === 'html') {
                        const styles = rule.style;
                        for (let i = 0; i < styles.length; i++) {
                            const prop = styles[i];
                            if (prop.startsWith('--')) {
                                const value = styles.getPropertyValue(prop).trim();
                                allVars.set(prop, value);
                            }
                        }
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
                continue;
            }
        }

        // Buscar en estilo inline del html
        const rootStyle = getComputedStyle(document.documentElement);
        for (let i = 0; i < rootStyle.length; i++) {
            const prop = rootStyle[i];
            if (prop.startsWith('--')) {
                const value = rootStyle.getPropertyValue(prop).trim();
                allVars.set(prop, value);
            }
        }

        if (allVars.size === 0) {
            this.visualEditor.showStatus('⚠️ No se encontraron variables CSS', 'warning');
            return;
        }

        this.renderCSSVars(allVars);
        this.visualEditor.showStatus(`✓ ${allVars.size} variables CSS detectadas`, 'success');
    }

    renderCSSVars(varsMap) {
        const container = document.getElementById('css-vars-list');
        if (!container) return;

        let html = '';

        for (const [varName, varValue] of varsMap) {
            const isColor = varValue.includes('#') || varValue.includes('rgb') || varValue.includes('hsl');
            const inputType = isColor ? 'color' : 'text';
            const displayValue = isColor ? varValue : varValue;

            html += `
                <div style="margin-bottom: 8px; padding: 8px; background: #2a2a2a; border-radius: 6px; border: 1px solid #444;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <label style="color: #0ff; font-size: 10px; font-family: monospace;">${varName}</label>
                        <button onclick="devVisualEditorAdvanced.removeCSSVar('${varName}')" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 12px;">🗑️</button>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        ${isColor ? `<input type="color" value="${displayValue}" onchange="devVisualEditorAdvanced.updateCSSVar('${varName}', this.value)" style="width: 40px; height: 30px; border: none; cursor: pointer; border-radius: 4px;">` : ''}
                        <input type="text" value="${displayValue}" onchange="devVisualEditorAdvanced.updateCSSVar('${varName}', this.value)" style="flex: 1; background: #1a1a1a; border: 1px solid #555; color: white; padding: 6px; border-radius: 4px; font-size: 11px; font-family: monospace;">
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    updateCSSVar(varName, value) {
        document.documentElement.style.setProperty(varName, value);
        this.visualEditor.showStatus(`✓ ${varName} actualizada`, 'success');

        // Guardar cambios en generated CSS para poder exportar
        const css = `:root { ${varName}: ${value} !important; }`;
        this.visualEditor.generatedCSS.push(css);
    }

    removeCSSVar(varName) {
        if (!confirm(`¿Eliminar la variable ${varName}?`)) return;

        document.documentElement.style.removeProperty(varName);
        this.detectCSSVars(); // Re-renderizar
        this.visualEditor.showStatus(`🗑️ ${varName} eliminada`, 'success');
    }

    addCustomCSSVar() {
        const name = prompt('Nombre de la variable (sin --):\nEjemplo: primary-color');
        if (!name) return;

        const varName = name.startsWith('--') ? name : `--${name}`;
        const value = prompt(`Valor para ${varName}:\nEjemplo: #ff0000`);
        if (!value) return;

        document.documentElement.style.setProperty(varName, value);
        this.detectCSSVars(); // Re-renderizar
        this.visualEditor.showStatus(`✓ ${varName} creada`, 'success');

        // Guardar en generated CSS
        const css = `:root { ${varName}: ${value} !important; }`;
        this.visualEditor.generatedCSS.push(css);
    }

    // RESPONSIVE BREAKPOINTS
    toggleResponsive() {
        const panel = document.getElementById('responsive-panel');
        const btn = document.getElementById('toggle-responsive-btn');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.textContent = '▲';
        } else {
            panel.style.display = 'none';
            btn.textContent = '▼';
        }
    }

    setViewport(size) {
        const viewports = {
            'mobile': { width: '375px', icon: '📱', label: 'Mobile (375px)' },
            'tablet': { width: '768px', icon: '📱', label: 'Tablet (768px)' },
            'laptop': { width: '1024px', icon: '💻', label: 'Laptop (1024px)' },
            'desktop': { width: '1440px', icon: '🖥️', label: 'Desktop (1440px)' },
            'reset': { width: '100%', icon: '🖥️', label: 'Full Width' }
        };

        const viewport = viewports[size];
        if (!viewport) return;

        // Crear o actualizar el viewport wrapper
        let wrapper = document.getElementById('dev-viewport-wrapper');

        if (size === 'reset') {
            if (wrapper) wrapper.remove();
            document.getElementById('current-viewport').innerHTML = `${viewport.icon} ${viewport.label}`;
            this.visualEditor.showStatus('✓ Viewport reseteado', 'success');
            return;
        }

        if (!wrapper) {
            // Crear wrapper por primera vez
            wrapper = document.createElement('div');
            wrapper.id = 'dev-viewport-wrapper';
            wrapper.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 999998;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;

            const content = document.createElement('div');
            content.id = 'dev-viewport-content';
            content.style.cssText = `
                background: white;
                width: 100%;
                height: 100%;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: auto;
                position: relative;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.onclick = () => this.setViewport('reset');
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: #f87171;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                z-index: 1000000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;

            wrapper.appendChild(content);
            wrapper.appendChild(closeBtn);
            document.body.appendChild(wrapper);

            // Clonar el contenido actual
            const bodyClone = document.body.cloneNode(true);
            // Remover el wrapper del clon para evitar recursión
            const wrapperInClone = bodyClone.querySelector('#dev-viewport-wrapper');
            if (wrapperInClone) wrapperInClone.remove();

            content.innerHTML = bodyClone.innerHTML;
        }

        // Actualizar tamaño
        const content = document.getElementById('dev-viewport-content');
        if (content) {
            content.style.width = viewport.width;
            content.style.maxWidth = '100%';
        }

        // Actualizar indicator
        document.getElementById('current-viewport').innerHTML = `${viewport.icon} ${viewport.label}`;

        this.visualEditor.showStatus(`📱 Viewport: ${viewport.label}`, 'success');
    }

    customViewport() {
        const width = prompt('Ancho personalizado (ej: 500px, 50%, etc.):');
        if (!width) return;

        let wrapper = document.getElementById('dev-viewport-wrapper');
        if (!wrapper) {
            // Si no existe, crear con el tamaño custom
            this.setViewport('mobile'); // Crear la estructura
            wrapper = document.getElementById('dev-viewport-wrapper');
        }

        const content = document.getElementById('dev-viewport-content');
        if (content) {
            content.style.width = width;
            content.style.maxWidth = '100%';
        }

        document.getElementById('current-viewport').innerHTML = `⚙️ Custom (${width})`;
        this.visualEditor.showStatus(`✓ Viewport custom: ${width}`, 'success');
    }

    // STYLE CONFLICT DETECTOR
    toggleConflicts() {
        const panel = document.getElementById('conflicts-panel');
        const btn = document.getElementById('toggle-conflicts-btn');
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.textContent = '▲';
        } else {
            panel.style.display = 'none';
            btn.textContent = '▼';
        }
    }

    detectConflicts() {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        const element = this.visualEditor.selectedElement;
        const computed = window.getComputedStyle(element);
        const conflicts = [];

        // Obtener todas las reglas CSS que afectan al elemento
        const matchingRules = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText && element.matches(rule.selectorText)) {
                        matchingRules.push({
                            selector: rule.selectorText,
                            styles: rule.style,
                            specificity: this.calculateSpecificity(rule.selectorText)
                        });
                    }
                }
            } catch (e) {
                // Skip cross-origin stylesheets
                continue;
            }
        }

        // Analizar propiedades importantes
        const importantProps = ['color', 'background', 'display', 'position', 'width', 'height', 'margin', 'padding', 'font-size', 'border'];

        for (const prop of importantProps) {
            const values = new Set();
            const sources = [];

            for (const rule of matchingRules) {
                const value = rule.styles.getPropertyValue(prop);
                if (value) {
                    values.add(value);
                    sources.push({
                        selector: rule.selector,
                        value: value,
                        specificity: rule.specificity
                    });
                }
            }

            // Si hay múltiples valores diferentes, hay conflicto
            if (values.size > 1) {
                const finalValue = computed.getPropertyValue(prop);
                conflicts.push({
                    property: prop,
                    sources: sources,
                    finalValue: finalValue,
                    count: values.size
                });
            }
        }

        // Detectar !important excesivo
        const importantCount = this.visualEditor.generatedCSS.filter(css => css.includes('!important')).length;
        if (importantCount > 5) {
            conflicts.push({
                type: 'warning',
                message: `⚠️ Uso excesivo de !important (${importantCount} veces)`,
                suggestion: 'Considera usar selectores más específicos en lugar de !important'
            });
        }

        // Detectar inline styles
        if (element.style.length > 0) {
            conflicts.push({
                type: 'info',
                message: '📝 Elemento tiene estilos inline',
                suggestion: 'Los estilos inline tienen la máxima especificidad'
            });
        }

        this.renderConflicts(conflicts);

        const message = conflicts.length === 0 ?
            '✅ No se detectaron conflictos' :
            `⚠️ ${conflicts.length} conflictos detectados`;

        this.visualEditor.showStatus(message, conflicts.length === 0 ? 'success' : 'warning');
    }

    calculateSpecificity(selector) {
        // Simplified specificity calculation
        let a = 0, b = 0, c = 0;

        // IDs
        a = (selector.match(/#/g) || []).length;
        // Classes, attributes, pseudo-classes
        b = (selector.match(/\./g) || []).length +
            (selector.match(/\[/g) || []).length +
            (selector.match(/:/g) || []).length;
        // Elements and pseudo-elements
        c = (selector.match(/[a-z]/gi) || []).length;

        return [a, b, c].join('');
    }

    renderConflicts(conflicts) {
        const container = document.getElementById('conflicts-list');
        if (!container) return;

        if (conflicts.length === 0) {
            container.innerHTML = `
                <div style="color: #10b981; font-size: 11px; text-align: center; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 6px;">
                    ✅ No se encontraron conflictos de estilos
                </div>
            `;
            return;
        }

        let html = '';

        for (const conflict of conflicts) {
            if (conflict.type === 'warning' || conflict.type === 'info') {
                const color = conflict.type === 'warning' ? '#f59e0b' : '#3b82f6';
                const bgColor = conflict.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';

                html += `
                    <div style="margin-bottom: 8px; padding: 8px; background: ${bgColor}; border-left: 3px solid ${color}; border-radius: 4px;">
                        <div style="color: ${color}; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                            ${conflict.message}
                        </div>
                        <div style="color: #999; font-size: 10px;">
                            ${conflict.suggestion}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div style="margin-bottom: 8px; padding: 8px; background: #2a2a2a; border-left: 3px solid #f87171; border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="color: #f87171; font-size: 11px; font-weight: 600;">${conflict.property}</span>
                            <span style="background: #f87171; color: white; padding: 2px 6px; border-radius: 10px; font-size: 9px;">${conflict.count} reglas</span>
                        </div>
                        <div style="color: #0ff; font-size: 10px; margin-bottom: 4px;">
                            Valor final: ${conflict.finalValue}
                        </div>
                        <details style="margin-top: 4px;">
                            <summary style="color: #999; font-size: 9px; cursor: pointer;">Ver todas las reglas</summary>
                            <div style="margin-top: 4px; padding: 4px; background: #1a1a1a; border-radius: 4px;">
                                ${conflict.sources.map(s => `
                                    <div style="color: #999; font-size: 9px; font-family: monospace; margin: 2px 0;">
                                        ${s.selector} → ${s.value} <span style="opacity: 0.6;">(${s.specificity})</span>
                                    </div>
                                `).join('')}
                            </div>
                        </details>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
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

    previewAnimation() {
        const animType = document.getElementById('animation-type')?.value;
        const duration = document.getElementById('animation-duration')?.value || '0.5s';
        const easing = document.getElementById('animation-easing')?.value || 'ease';
        const previewBox = document.getElementById('animation-preview-box');

        if (!previewBox || !animType || animType === 'none') return;

        // Resetear animación
        previewBox.style.animation = 'none';
        previewBox.style.transform = 'none';
        previewBox.style.boxShadow = 'none';

        // Inyectar keyframes si es necesario
        this.injectAnimationKeyframes();

        // Aplicar animación al preview
        void previewBox.offsetWidth; // Trigger reflow

        if (animType.startsWith('hover-')) {
            // Simular hover por 2 segundos
            const hoverEffects = {
                'hover-lift': `translateY(-8px)`,
                'hover-scale': `scale(1.1)`,
                'hover-glow': `0 0 20px rgba(255, 255, 255, 0.8)`,
                'hover-rotate': `rotate(10deg)`
            };

            if (animType === 'hover-glow') {
                previewBox.style.boxShadow = hoverEffects[animType];
            } else {
                previewBox.style.transform = hoverEffects[animType];
            }
            previewBox.style.transition = `all ${duration} ${easing}`;

            setTimeout(() => {
                previewBox.style.transform = 'none';
                previewBox.style.boxShadow = 'none';
            }, parseFloat(duration) * 1000 + 500);
        } else {
            // Animaciones keyframe
            const isLoop = ['float', 'pulse', 'shimmer'].includes(animType);
            previewBox.style.animation = `${animType.replace('-', '')} ${duration} ${easing}${isLoop ? ' infinite' : ''}`;
        }
    }

    applyAnimation() {
        if (!this.visualEditor.selectedElement) {
            this.visualEditor.showStatus('⚠️ Selecciona un elemento primero', 'error');
            return;
        }

        const animType = document.getElementById('animation-type').value;
        const duration = document.getElementById('animation-duration')?.value || '0.5s';
        const easing = document.getElementById('animation-easing')?.value || 'ease';

        if (animType === 'none') return;

        const animations = {
            'hover-lift': `transform: translateY(-4px); transition: all ${duration} ${easing};`,
            'hover-scale': `transform: scale(1.05); transition: all ${duration} ${easing};`,
            'hover-glow': `box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); transition: all ${duration} ${easing};`,
            'hover-rotate': `transform: rotate(5deg); transition: all ${duration} ${easing};`,
            'fade-in': `animation: fadeIn ${duration} ${easing};`,
            'slide-in': `animation: slideIn ${duration} ${easing};`,
            'bounce-in': `animation: bounceIn ${duration} ${easing};`,
            'float': `animation: float ${duration} ${easing} infinite;`,
            'pulse': `animation: pulse ${duration} ${easing} infinite;`,
            'shimmer': `animation: shimmer ${duration} linear infinite;`
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

        this.visualEditor.showStatus(`✓ Animación "${animType}" aplicada (${duration}, ${easing})`, 'success');
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
