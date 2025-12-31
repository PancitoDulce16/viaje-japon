/**
 * 🔒 INPUT VALIDATOR SYSTEM
 * Sistema de validación robusto para todos los inputs
 */

class InputValidator {
  constructor() {
    this.rules = {
      required: (value) => value && value.trim().length > 0,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      url: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      minLength: (value, min) => value.length >= min,
      maxLength: (value, max) => value.length <= max,
      min: (value, min) => parseFloat(value) >= parseFloat(min),
      max: (value, max) => parseFloat(value) <= parseFloat(max),
      pattern: (value, pattern) => new RegExp(pattern).test(value),
      phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 9,
      date: (value) => !isNaN(Date.parse(value)),
      number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
      integer: (value) => Number.isInteger(parseFloat(value)),
      positive: (value) => parseFloat(value) > 0,
      alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
      alpha: (value) => /^[a-zA-Z]+$/.test(value),
      noSpaces: (value) => !/\s/.test(value),
      strongPassword: (value) => {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      }
    };

    this.messages = {
      required: 'Este campo es requerido',
      email: 'Email inválido',
      url: 'URL inválida',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      min: 'Valor mínimo: {min}',
      max: 'Valor máximo: {max}',
      pattern: 'Formato inválido',
      phone: 'Número de teléfono inválido',
      date: 'Fecha inválida',
      number: 'Debe ser un número',
      integer: 'Debe ser un número entero',
      positive: 'Debe ser un número positivo',
      alphanumeric: 'Solo letras y números',
      alpha: 'Solo letras',
      noSpaces: 'No se permiten espacios',
      strongPassword: 'Contraseña débil (mín 8 chars, mayús, minús, número, especial)'
    };
  }

  /**
   * Valida un input con reglas especificadas
   */
  validate(value, validations) {
    const errors = [];

    Object.entries(validations).forEach(([rule, param]) => {
      if (rule === 'required' && param) {
        if (!this.rules.required(value)) {
          errors.push(this.messages.required);
        }
      } else if (value && this.rules[rule]) {
        // Solo validar otras reglas si hay valor
        const isValid = param === true
          ? this.rules[rule](value)
          : this.rules[rule](value, param);

        if (!isValid) {
          let message = this.messages[rule];
          if (typeof param !== 'boolean') {
            message = message.replace(`{${rule}}`, param);
          }
          errors.push(message);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un formulario completo
   */
  validateForm(formElement, config = {}) {
    const results = {};
    let hasErrors = false;

    const inputs = formElement.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      if (!fieldName) return;

      const validations = config[fieldName] || {};

      // Auto-detect validations from HTML attributes
      if (input.hasAttribute('required')) {
        validations.required = true;
      }
      if (input.type === 'email') {
        validations.email = true;
      }
      if (input.type === 'url') {
        validations.url = true;
      }
      if (input.type === 'number') {
        validations.number = true;
        if (input.hasAttribute('min')) {
          validations.min = input.getAttribute('min');
        }
        if (input.hasAttribute('max')) {
          validations.max = input.getAttribute('max');
        }
      }
      if (input.hasAttribute('minlength')) {
        validations.minLength = input.getAttribute('minlength');
      }
      if (input.hasAttribute('maxlength')) {
        validations.maxLength = input.getAttribute('maxlength');
      }
      if (input.hasAttribute('pattern')) {
        validations.pattern = input.getAttribute('pattern');
      }

      const result = this.validate(input.value, validations);
      results[fieldName] = result;

      if (!result.isValid) {
        hasErrors = true;
        this.markFieldInvalid(input, result.errors[0]);
      } else {
        this.markFieldValid(input);
      }
    });

    return {
      isValid: !hasErrors,
      fields: results
    };
  }

  /**
   * Marca un campo como inválido
   */
  markFieldInvalid(input, errorMessage) {
    input.classList.add('border-red-500', 'dark:border-red-500');
    input.classList.remove('border-green-500', 'dark:border-green-500');

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.input-error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'input-error-message text-red-600 dark:text-red-400 text-sm mt-1 animate-fadeInUp';
    errorDiv.textContent = errorMessage;
    input.parentElement.appendChild(errorDiv);
  }

  /**
   * Marca un campo como válido
   */
  markFieldValid(input) {
    input.classList.remove('border-red-500', 'dark:border-red-500');
    input.classList.add('border-green-500', 'dark:border-green-500');

    // Remove error message
    const existingError = input.parentElement.querySelector('.input-error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * Limpia todas las marcas de validación
   */
  clearValidation(formElement) {
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.classList.remove('border-red-500', 'dark:border-red-500', 'border-green-500', 'dark:border-green-500');
      const errorMsg = input.parentElement.querySelector('.input-error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    });
  }

  /**
   * Sanitiza input (previene XSS)
   */
  sanitize(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  /**
   * Sanitiza HTML (más agresivo)
   */
  sanitizeHTML(html) {
    const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'];
    const div = document.createElement('div');
    div.innerHTML = html;

    const walk = (node) => {
      if (node.nodeType === 3) return; // Text node

      if (node.nodeType === 1) { // Element node
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
          node.replaceWith(...Array.from(node.childNodes));
          return;
        }

        // Remove dangerous attributes
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
        dangerousAttrs.forEach(attr => {
          node.removeAttribute(attr);
        });

        // Only allow href on <a> tags and validate it
        if (node.tagName.toLowerCase() === 'a') {
          const href = node.getAttribute('href');
          if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
            node.removeAttribute('href');
          }
        }
      }

      Array.from(node.childNodes).forEach(walk);
    };

    walk(div);
    return div.innerHTML;
  }

  /**
   * Setup validación en tiempo real
   */
  setupLiveValidation(formElement, config = {}) {
    const inputs = formElement.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      const fieldName = input.name || input.id;
      if (!fieldName) return;

      const validations = config[fieldName] || {};

      // Validate on blur
      input.addEventListener('blur', () => {
        const result = this.validate(input.value, validations);
        if (!result.isValid && input.value) {
          this.markFieldInvalid(input, result.errors[0]);
        } else if (input.value) {
          this.markFieldValid(input);
        }
      });

      // Clear error on input
      input.addEventListener('input', () => {
        if (input.classList.contains('border-red-500')) {
          input.classList.remove('border-red-500', 'dark:border-red-500');
          const errorMsg = input.parentElement.querySelector('.input-error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });
    });
  }
}

// Crear instancia global
window.InputValidator = new InputValidator();

console.log('✅ Input Validator System loaded');

export default InputValidator;
