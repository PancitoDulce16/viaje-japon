// js/dialogs.js - Sistema de diálogos personalizados (confirm/prompt)

export const Dialogs = {
  /**
   * Muestra un diálogo de confirmación personalizado.
   * @param {object} options - Opciones para el diálogo.
   * @param {string} options.title - Título del diálogo.
   * @param {string} options.message - Mensaje principal.
   * @param {string} [options.okText='Aceptar'] - Texto del botón de confirmación.
   * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelación.
   * @param {boolean} [options.isDestructive=false] - Si la acción es destructiva (botón rojo).
   * @returns {Promise<boolean>} - Promesa que se resuelve a `true` si se confirma, `false` si se cancela.
   */
  confirm({ title, message, okText = 'Aceptar', cancelText = 'Cancelar', isDestructive = false }) {
    return new Promise((resolve) => {
      // Remover diálogos existentes para evitar duplicados
      this.removeExisting();

      const okButtonClass = isDestructive
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white';

      const dialogHtml = `
        <div id="customDialog" class="modal active" style="z-index: 10002;">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate__animated animate__fadeInUp animate__faster">
            <h3 class="text-xl font-bold dark:text-white mb-3">${title}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
            <div class="flex justify-end gap-3">
              <button id="dialogCancelBtn" class="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-semibold">
                ${cancelText}
              </button>
              <button id="dialogOkBtn" class="px-6 py-2 ${okButtonClass} rounded-lg transition font-semibold">
                ${okText}
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', dialogHtml);
      document.body.style.overflow = 'hidden';

      const okBtn = document.getElementById('dialogOkBtn');
      const cancelBtn = document.getElementById('dialogCancelBtn');
      const dialog = document.getElementById('customDialog');

      const cleanup = (result) => {
        this.removeExisting();
        resolve(result);
      };

      okBtn.onclick = () => cleanup(true);
      cancelBtn.onclick = () => cleanup(false);
      dialog.onclick = (e) => {
        if (e.target.id === 'customDialog') {
          cleanup(false);
        }
      };
    });
  },

  /**
   * Muestra un diálogo de prompt personalizado.
   * @param {object} options - Opciones para el diálogo.
   * @param {string} options.title - Título del diálogo.
   * @param {string} options.message - Mensaje principal.
   * @param {string} [options.placeholder=''] - Placeholder para el input.
   * @param {string} [options.inputType='text'] - Tipo de input (text, email, password).
   * @param {string} [options.okText='Aceptar'] - Texto del botón de confirmación.
   * @param {string} [options.cancelText='Cancelar'] - Texto del botón de cancelación.
   * @returns {Promise<string|null>} - Promesa que se resuelve con el valor del input o `null` si se cancela.
   */
  prompt({ title, message, placeholder = '', inputType = 'text', okText = 'Aceptar', cancelText = 'Cancelar' }) {
    return new Promise((resolve) => {
      this.removeExisting();

      const dialogHtml = `
        <div id="customDialog" class="modal active" style="z-index: 10002;">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate__animated animate__fadeInUp animate__faster">
            <h3 class="text-xl font-bold dark:text-white mb-3">${title}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">${message}</p>
            <input
              id="dialogInput"
              type="${inputType}"
              placeholder="${placeholder}"
              class="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6"
            />
            <div class="flex justify-end gap-3">
              <button id="dialogCancelBtn" class="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-semibold">
                ${cancelText}
              </button>
              <button id="dialogOkBtn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold">
                ${okText}
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', dialogHtml);
      document.body.style.overflow = 'hidden';

      const okBtn = document.getElementById('dialogOkBtn');
      const cancelBtn = document.getElementById('dialogCancelBtn');
      const input = document.getElementById('dialogInput');
      const dialog = document.getElementById('customDialog');

      input.focus();

      const cleanup = (value) => {
        this.removeExisting();
        resolve(value);
      };

      okBtn.onclick = () => {
        if (input.value.trim() !== '') {
          cleanup(input.value.trim());
        }
      };
      
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          okBtn.click();
        } else if (e.key === 'Escape') {
          cleanup(null);
        }
      };

      cancelBtn.onclick = () => cleanup(null);
      dialog.onclick = (e) => {
        if (e.target.id === 'customDialog') {
          cleanup(null);
        }
      };
    });
  },

  removeExisting() {
    const existingDialog = document.getElementById('customDialog');
    if (existingDialog) {
      existingDialog.remove();
    }
    document.body.style.overflow = '';
  }
};

window.Dialogs = Dialogs;