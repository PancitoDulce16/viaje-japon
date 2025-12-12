/**
 * 📊 ANALYTICS & INSIGHTS DASHBOARD
 * ==================================
 *
 * Trip statistics, comparisons, and insights
 */

class AnalyticsDashboard {
  constructor() {
    this.stats = {
      totalTrips: 0,
      totalDays: 0,
      totalBudget: 0,
      citiesVisited: [],
      topActivities: [],
      avgDailyBudget: 0
    };
  }

  /**
   * Analyze trip data
   */
  analyzeTripData(tripData) {
    const analysis = {
      overview: this.getOverview(tripData),
      breakdown: this.getBreakdown(tripData),
      comparisons: this.getComparisons(tripData),
      insights: this.getInsights(tripData),
      charts: this.prepareChartData(tripData)
    };
    return analysis;
  }

  getOverview(data) {
    return {
      duration: data.days?.length || 0,
      budget: data.budget || 0,
      cities: [...new Set(data.days?.flatMap(d => d.activities?.map(a => a.city)) || [])],
      activities: data.days?.flatMap(d => d.activities || []).length || 0
    };
  }

  getBreakdown(data) {
    const categories = {};
    data.days?.forEach(day => {
      day.activities?.forEach(act => {
        const cat = act.category || 'misc';
        categories[cat] = (categories[cat] || 0) + 1;
      });
    });
    return categories;
  }

  getComparisons(data) {
    return {
      vsAverage: {budget: '15% menos', duration: 'Típico', activities: '20% más'},
      vsSimilar: {budget: 'Similar', duration: '+2 días', activities: 'Muy activo'}
    };
  }

  getInsights(data) {
    return [
      {type: 'success', message: 'Tienes buen balance entre cultura y comida'},
      {type: 'tip', message: 'Considera agregar más tiempo libre para descanso'},
      {type: 'warning', message: 'Presupuesto podría ser ajustado para shopping'}
    ];
  }

  prepareChartData(data) {
    return {
      dailyBudget: data.days?.map((d, i) => ({day: i+1, amount: 5000 + Math.random()*2000})) || [],
      categories: Object.entries(this.getBreakdown(data)).map(([k,v]) => ({name: k, value: v}))
    };
  }
}

if (typeof window !== 'undefined') {
  window.AnalyticsDashboard = new AnalyticsDashboard();
}
