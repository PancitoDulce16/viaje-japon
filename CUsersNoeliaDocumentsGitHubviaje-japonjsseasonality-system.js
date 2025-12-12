/**
 * 🌸 SEASONALITY SYSTEM
 * =====================
 * Cherry blossoms, festivals, seasonal recommendations
 */

class SeasonalitySystem {
  constructor() {
    this.seasons = {
      spring: {months: [3,4,5], highlights: ['Cherry Blossoms', 'Pleasant Weather', 'Golden Week']},
      summer: {months: [6,7,8], highlights: ['Festivals', 'Fireworks', 'Hot & Humid']},
      autumn: {months: [9,10,11], highlights: ['Fall Colors', 'Perfect Weather', 'Harvest Season']},
      winter: {months: [12,1,2], highlights: ['Snow', 'Onsen Season', 'New Year']}
    };

    this.cherryBlossomForecast = {
      tokyo: {peak: 'Mar 28 - Apr 5', status: 'Full Bloom'},
      kyoto: {peak: 'Apr 1 - Apr 8', status: 'Starting'},
      osaka: {peak: 'Mar 30 - Apr 6', status: 'Full Bloom'}
    };
  }

  getCurrentSeason(month = new Date().getMonth() + 1) {
    for (const [season, data] of Object.entries(this.seasons)) {
      if (data.months.includes(month)) return season;
    }
    return 'spring';
  }

  getSeasonalRecommendations(month) {
    const season = this.getCurrentSeason(month);
    const recommendations = {
      spring: ['Visit Ueno Park for hanami', 'Book hotels early (peak season)', 'Bring light jacket'],
      summer: ['Stay hydrated', 'Attend matsuri festivals', 'Use AC in konbini'],
      autumn: ['See koyo in Kyoto', 'Perfect hiking weather', 'Less crowded than spring'],
      winter: ['Try onsen in snow', 'Illuminations in Tokyo', 'Ski in Hokkaido']
    };
    return recommendations[season] || [];
  }

  getCherryBlossomStatus(city) {
    return this.cherryBlossomForecast[city.toLowerCase()] || {peak: 'Check forecast', status: 'Unknown'};
  }
}

if (typeof window !== 'undefined') {
  window.SeasonalitySystem = new SeasonalitySystem();
}
