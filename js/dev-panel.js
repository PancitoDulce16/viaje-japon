// Dev Panel - Panel flotante de desarrollo
// Se puede activar con Ctrl+Shift+D o desde el menú

class DevPanel {
    constructor() {
        this.isOpen = false;
        this.panel = null;
        this.liveStyle = null;
        this.init();
    }

    init() {
        // Escuchar atajo de teclado Ctrl+Shift+D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Crear panel si no existe
        this.createPanel();
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'dev-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border: 2px solid #667eea;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: move;" id="dev-panel-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">🛠️</span>
                    <h3 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">Dev Panel</h3>
                </div>
                <button onclick="devPanel.close()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
            </div>

            <div style="padding: 15px; overflow-y: auto; flex: 1;">
                <!-- Live CSS Editor -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <span style="font-size: 18px;">🎨</span>
                        <h4 style="margin: 0; color: #fff; font-size: 14px;">Live CSS Editor</h4>
                    </div>
                    <textarea id="dev-live-css" placeholder="/* CSS aquí - Se aplica instantáneamente */" style="
                        width: 100%;
                        height: 150px;
                        background: #1a1a1a;
                        border: 1px solid #444;
                        border-radius: 8px;
                        padding: 10px;
                        color: #fff;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        resize: vertical;
                    "></textarea>
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <button onclick="devPanel.applyCSS()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; flex: 1;">▶️ Aplicar</button>
                        <button onclick="devPanel.clearCSS()" style="background: #444; border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; flex: 1;">🗑️ Limpiar</button>
                        <button onclick="devPanel.copyCSS()" style="background: #444; border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">📋</button>
                    </div>
                    <div id="dev-css-status" style="margin-top: 8px; font-size: 12px;"></div>
                </div>

                <!-- Quick Fixes -->
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                        <span style="font-size: 18px;">⚡</span>
                        <h4 style="margin: 0; color: #fff; font-size: 14px;">Quick Fixes</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <button onclick="devPanel.fixWallpaperDark()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                            🌙 Fix Wallpaper Oscuro
                        </button>
                        <button onclick="devPanel.fixWallpaperLight()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                            🌸 Fix Wallpaper Claro
                        </button>
                        <button onclick="devPanel.inspectBody()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                            🔍 Inspeccionar Estilos HTML
                        </button>
                        <button onclick="devPanel.showAllCSS()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 12px; text-align: left; transition: all 0.2s;">
                            📄 Mostrar Todos los CSS
                        </button>
                    </div>
                </div>

                <!-- Inspector Output -->
                <div id="dev-inspector-output" style="display: none; background: #1a1a1a; border-radius: 8px; padding: 12px; margin-top: 10px; max-height: 200px; overflow-y: auto;">
                    <pre style="margin: 0; color: #fff; font-size: 11px; white-space: pre-wrap; word-wrap: break-word;"></pre>
                </div>
            </div>

            <div style="background: #1a1a1a; padding: 10px 15px; border-top: 1px solid #333; font-size: 11px; color: #888;">
                💡 Tip: Presiona <kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+Shift+D</kbd> para abrir/cerrar
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Hacer el panel arrastrable
        this.makeDraggable();
    }

    makeDraggable() {
        const header = this.panel.querySelector('#dev-panel-header');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - this.panel.offsetLeft;
            initialY = e.clientY - this.panel.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                this.panel.style.left = currentX + 'px';
                this.panel.style.top = currentY + 'px';
                this.panel.style.right = 'auto';
                this.panel.style.bottom = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.panel.style.display = 'flex';
        this.isOpen = true;
    }

    close() {
        this.panel.style.display = 'none';
        this.isOpen = false;
    }

    applyCSS() {
        const css = document.getElementById('dev-live-css').value;

        if (!this.liveStyle) {
            this.liveStyle = document.createElement('style');
            this.liveStyle.id = 'dev-live-style';
            document.head.appendChild(this.liveStyle);
        }

        this.liveStyle.textContent = css;
        this.showStatus('✅ CSS aplicado correctamente', 'success');
    }

    clearCSS() {
        document.getElementById('dev-live-css').value = '';
        if (this.liveStyle) {
            this.liveStyle.textContent = '';
        }
        this.showStatus('🗑️ CSS limpiado', 'success');
    }

    copyCSS() {
        const css = document.getElementById('dev-live-css').value;
        navigator.clipboard.writeText(css).then(() => {
            this.showStatus('📋 CSS copiado al portapapeles', 'success');
        });
    }

    // Quick Fixes
    fixWallpaperDark() {
        const css = `
html.dark,
html[data-theme="dark"] {
    background-color: #0a0d1a !important;
    background-image: url('/images/iconos/Wallpaper/Osucuro.png') !important;
    background-size: cover !important;
    background-position: center !important;
    background-attachment: fixed !important;
    background-repeat: no-repeat !important;
}

html.dark body,
html[data-theme="dark"] body {
    background: transparent !important;
}`;
        document.getElementById('dev-live-css').value = css;
        this.applyCSS();
    }

    fixWallpaperLight() {
        const css = `
html:not(.dark):not([data-theme="dark"]) {
    background-color: #fef3f8 !important;
    background-image: url('/images/iconos/Wallpaper/Claro.png') !important;
    background-size: cover !important;
    background-position: center !important;
    background-attachment: fixed !important;
    background-repeat: no-repeat !important;
}

html:not(.dark):not([data-theme="dark"]) body {
    background: transparent !important;
}`;
        document.getElementById('dev-live-css').value = css;
        this.applyCSS();
    }

    inspectBody() {
        const html = document.documentElement;
        const body = document.body;
        const styles = window.getComputedStyle(html);

        const output = `
🔍 ESTILOS COMPUTADOS DE HTML:

Classes: ${html.className}
Dark mode: ${html.classList.contains('dark')}
Data-theme: ${html.getAttribute('data-theme')}

Background Color: ${styles.backgroundColor}
Background Image: ${styles.backgroundImage}
Background Size: ${styles.backgroundSize}
Background Position: ${styles.backgroundPosition}
Background Attachment: ${styles.backgroundAttachment}

BODY:
Background: ${window.getComputedStyle(body).background}
        `.trim();

        this.showInspector(output);
    }

    showAllCSS() {
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        const output = `
📄 ARCHIVOS CSS CARGADOS (${styles.length}):

${styles.map((s, i) => {
    if (s.tagName === 'LINK') {
        return `${i + 1}. ${s.href.split('/').pop()}`;
    } else {
        return `${i + 1}. <style> (${s.id || 'sin id'})`;
    }
}).join('\n')}
        `.trim();

        this.showInspector(output);
    }

    showInspector(text) {
        const output = document.getElementById('dev-inspector-output');
        output.style.display = 'block';
        output.querySelector('pre').textContent = text;
    }

    showStatus(message, type = 'success') {
        const status = document.getElementById('dev-css-status');
        const color = type === 'success' ? '#00f260' : '#f5576c';
        status.innerHTML = `<div style="color: ${color}; padding: 8px; background: rgba(${type === 'success' ? '0, 242, 96' : '245, 87, 108'}, 0.1); border-radius: 6px; border: 1px solid rgba(${type === 'success' ? '0, 242, 96' : '245, 87, 108'}, 0.3);">${message}</div>`;
        setTimeout(() => {
            status.innerHTML = '';
        }, 3000);
    }
}

// Inicializar Dev Panel
let devPanel;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        devPanel = new DevPanel();
        console.log('🛠️ Dev Panel listo! Presiona Ctrl+Shift+D para abrir');
    });
} else {
    devPanel = new DevPanel();
    console.log('🛠️ Dev Panel listo! Presiona Ctrl+Shift+D para abrir');
}
