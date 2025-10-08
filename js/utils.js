// js/utils.js
export const AppUtils = {
  EXCHANGE_RATE: 143,

  setupCurrencyConverter() {
    const usdInput = document.getElementById('usdInput');
    const jpyInput = document.getElementById('jpyInput');
    if (!usdInput || !jpyInput) return;

    let timeout;
    usdInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const usd = parseFloat(e.target.value) || 0;
        jpyInput.value = Math.round(usd * this.EXCHANGE_RATE);
      }, 300);
    });

    jpyInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const jpy = parseFloat(e.target.value) || 0;
        usdInput.value = (jpy / this.EXCHANGE_RATE).toFixed(2);
      }, 300);
    });
  },

  quickConvert(amount) {
    document.getElementById('usdInput').value = amount;
    document.getElementById('jpyInput').value = Math.round(amount * this.EXCHANGE_RATE);
  }
};

