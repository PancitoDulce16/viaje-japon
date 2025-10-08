// js/utils.js

export const AppUtils = {
    EXCHANGE_RATE: 143,
    clockInterval: null,

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

        document.querySelectorAll('.quick-convert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.currentTarget.dataset.amount);
                usdInput.value = amount;
                jpyInput.value = Math.round(amount * this.EXCHANGE_RATE);
            });
        });
    },

    startClocks() {
        this.updateClocks();
        
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        this.clockInterval = setInterval(() => this.updateClocks(), 1000);
    },

    updateClocks() {
        const now = new Date();
        
        const crTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
        const crTimeStr = crTime.toLocaleTimeString('es-CR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        const jpTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
        const jpTimeStr = jpTime.toLocaleTimeString('ja-JP', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        const crElem = document.getElementById('crTime');
        const jpElem = document.getElementById('jpTime');
        
        if (crElem) crElem.textContent = crTimeStr;
        if (jpElem) jpElem.textContent = jpTimeStr;
    }
};
