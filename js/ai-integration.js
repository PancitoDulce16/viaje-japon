// js/ai-integration.js - OpenAI Integration for Personalized Recommendations

import { Notifications } from './notifications.js';
import { ACTIVITIES_DATABASE } from '../data/activities-database.js';

/**
 * 🤖 AI INTEGRATION MODULE
 * Uses OpenAI to generate personalized itinerary recommendations
 */

export const AIIntegration = {
  // OpenAI Configuration
  // IMPORTANT: Set your API key in localStorage before using AI features
  // localStorage.setItem('openai_api_key', 'your-api-key-here')
  get apiKey() {
    return localStorage.getItem('openai_api_key') || '';
  },
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini', // Using GPT-4 mini for cost-effectiveness
  
  /**
   * Generate personalized itinerary recommendations using AI
   * @param {Object} params - Parameters for AI generation
   * @returns {Promise<Object>} AI-generated recommendations
   */
  async generateItineraryRecommendations(params) {
    const {
      cities = [],
      interests = [],
      days = 7,
      travelStyle = 'moderate',
      existingActivities = [],
      userPreferences = {}
    } = params;

    console.log('🤖 Generating AI recommendations with params:', params);

    try {
      // Build context from available activities database
      const availableActivitiesContext = this.buildActivitiesContext(cities);
      
      // Create the prompt
      const prompt = this.buildRecommendationPrompt({
        cities,
        interests,
        days,
        travelStyle,
        existingActivities,
        userPreferences,
        availableActivitiesContext
      });

      // Call OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // Parse and structure the response
      const recommendations = this.parseAIRecommendations(response);
      
      console.log('✅ AI Recommendations generated:', recommendations);
      
      return {
        success: true,
        recommendations,
        rawResponse: response
      };
    } catch (error) {
      console.error('❌ Error generating AI recommendations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Build context from activities database
   */
  buildActivitiesContext(cities) {
    let context = 'Available activities in selected cities:\n\n';
    
    cities.forEach(cityId => {
      const cityData = ACTIVITIES_DATABASE[cityId];
      if (cityData) {
        context += `${cityData.city}:\n`;
        const activitySample = cityData.activities.slice(0, 10); // Sample first 10
        activitySample.forEach(activity => {
          context += `- ${activity.title}: ${activity.desc} (Category: ${activity.category})\n`;
        });
        context += '\n';
      }
    });
    
    return context;
  },

  /**
   * Build the recommendation prompt for OpenAI
   */
  buildRecommendationPrompt(data) {
    const {
      cities,
      interests,
      days,
      travelStyle,
      existingActivities,
      userPreferences,
      availableActivitiesContext
    } = data;

    const cityNames = cities.map(cityId => {
      const cityData = ACTIVITIES_DATABASE[cityId];
      return cityData ? cityData.city : cityId;
    }).join(', ');

    const interestsList = interests.map(i => i).join(', ');

    return `You are an expert Japan travel planner. Generate a personalized ${days}-day itinerary for a trip to ${cityNames}.

TRAVELER PROFILE:
- Interests: ${interestsList || 'General sightseeing'}
- Travel Style: ${travelStyle} (relaxed = 2-3 activities/day, moderate = 3-4 activities/day, intense = 4-6 activities/day)
- Budget Preference: ${userPreferences.budgetLevel || 'Moderate'}
- Special Requests: ${userPreferences.specialRequests || 'None'}

${availableActivitiesContext}

REQUIREMENTS:
1. Create a day-by-day itinerary with specific activities
2. Consider travel time between locations
3. Mix popular attractions with hidden gems
4. Include food recommendations
5. Suggest optimal timing for each activity
6. Consider the traveler's interests and pace
7. Be practical with transportation (Japan Rail Pass usage, metro stations)
8. Include estimated costs in Japanese Yen
9. Suggest activities from the available database when possible, but feel free to add new ones

Please respond in the following JSON format:
{
  "summary": "Brief overview of the itinerary",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "days": [
    {
      "day": 1,
      "theme": "Day theme/focus",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "desc": "Detailed description",
          "location": "Specific location",
          "station": "Nearest metro/train station",
          "cost": 2000,
          "duration": "2 hours",
          "category": "temple|food|shopping|nature|culture|entertainment",
          "aiReasoning": "Why this activity fits the user's preferences"
        }
      ]
    }
  ],
  "transportationTips": "General transportation advice",
  "budgetSummary": "Total estimated budget breakdown"
}

Make sure the itinerary is realistic, culturally respectful, and optimized for the best travel experience in Japan.`;
  },

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt, systemMessage = 'You are an expert travel planner specializing in Japan tourism.') {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return JSON.parse(content);
    } catch (error) {
      console.error('❌ OpenAI API call failed:', error);
      throw error;
    }
  },

  /**
   * Parse AI recommendations into usable format
   */
  parseAIRecommendations(aiResponse) {
    try {
      // AI response is already structured
      return {
        summary: aiResponse.summary || 'Personalized itinerary generated by AI',
        tips: aiResponse.tips || [],
        days: aiResponse.days || [],
        transportationTips: aiResponse.transportationTips || '',
        budgetSummary: aiResponse.budgetSummary || '',
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      throw new Error('Failed to parse AI response');
    }
  },

  /**
   * Get AI suggestions for a specific day
   * @param {Object} params - Day-specific parameters
   * @returns {Promise<Array>} Suggested activities for the day
   */
  async getSuggestionsForDay(params) {
    const {
      dayNumber,
      city,
      date,
      existingActivities = [],
      userInterests = [],
      previousDays = []
    } = params;

    const prompt = `Suggest 3-5 activities for Day ${dayNumber} in ${city}, Japan.

CONTEXT:
- Date: ${date}
- User interests: ${userInterests.join(', ')}
- Existing activities today: ${existingActivities.map(a => a.title).join(', ')}
- Activities from previous days: ${previousDays.map(d => d.activities.map(a => a.title).join(', ')).join('; ')}

Provide diverse, interesting activities that:
1. Don't overlap with existing activities
2. Match the user's interests
3. Are appropriate for the time of day
4. Consider travel logistics

Respond in JSON format:
{
  "suggestions": [
    {
      "time": "14:00",
      "title": "Activity name",
      "desc": "Description",
      "location": "Location",
      "station": "Station name",
      "cost": 1500,
      "duration": "1.5 hours",
      "category": "category",
      "reason": "Why this activity is recommended"
    }
  ]
}`;

    try {
      const response = await this.callOpenAI(prompt);
      return {
        success: true,
        suggestions: response.suggestions || []
      };
    } catch (error) {
      console.error('Error getting day suggestions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get personalized activity recommendations based on user's current itinerary
   * @param {Object} currentItinerary - Current itinerary data
   * @param {Array} userInterests - User's interests
   * @returns {Promise<Object>} Personalized recommendations
   */
  async getPersonalizedSuggestions(currentItinerary, userInterests = []) {
    if (!currentItinerary || !currentItinerary.days) {
      return {
        success: false,
        error: 'No itinerary provided'
      };
    }

    const cities = [...new Set(currentItinerary.days.map(d => d.cities || []).flat().map(c => c.cityId))];
    const existingActivities = currentItinerary.days.flatMap(d => d.activities || []);

    const prompt = `Analyze this Japan itinerary and provide personalized improvement suggestions.

CURRENT ITINERARY:
${JSON.stringify(currentItinerary.days.map(d => ({
  day: d.day,
  cities: d.cities?.map(c => c.cityName),
  activities: d.activities?.map(a => a.title)
})), null, 2)}

USER INTERESTS: ${userInterests.join(', ')}

Provide:
1. Overall itinerary analysis
2. Suggested improvements for each day
3. Hidden gems to add
4. Activities that might not fit the user's interests
5. Optimal day structure suggestions

Respond in JSON:
{
  "overallAnalysis": "Analysis of the itinerary",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": [
    {
      "day": 1,
      "suggestion": "What to change",
      "reasoning": "Why this change"
    }
  ],
  "hiddenGems": [
    {
      "title": "Hidden gem name",
      "description": "Description",
      "whySpecial": "What makes it special"
    }
  ],
  "optimizationTips": ["Tip 1", "Tip 2"]
}`;

    try {
      const response = await this.callOpenAI(prompt);
      return {
        success: true,
        analysis: response
      };
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generate activity descriptions using AI
   * @param {Object} activity - Activity to enhance
   * @returns {Promise<Object>} Enhanced activity with AI-generated content
   */
  async enhanceActivityDescription(activity) {
    const prompt = `Enhance this travel activity description for Japan:

Activity: ${activity.title}
Location: ${activity.location || 'Not specified'}
Category: ${activity.category || 'general'}

Provide:
1. Engaging description (2-3 sentences)
2. Best time to visit
3. Insider tips
4. Estimated duration
5. Accessibility info

Respond in JSON:
{
  "description": "Enhanced description",
  "bestTime": "Best time to visit",
  "tips": ["Tip 1", "Tip 2"],
  "duration": "Estimated duration",
  "accessibility": "Accessibility information"
}`;

    try {
      const response = await this.callOpenAI(prompt);
      return {
        success: true,
        enhanced: {
          ...activity,
          desc: response.description,
          bestTime: response.bestTime,
          tips: response.tips,
          duration: response.duration,
          accessibility: response.accessibility,
          aiEnhanced: true
        }
      };
    } catch (error) {
      console.error('Error enhancing activity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get AI chat response for travel questions
   * @param {string} question - User's question
   * @param {Object} context - Current trip context
   * @returns {Promise<string>} AI response
   */
  async askTravelQuestion(question, context = {}) {
    const contextStr = JSON.stringify(context, null, 2);
    
    const systemMessage = `You are a knowledgeable Japan travel assistant. Answer questions about traveling in Japan with accurate, helpful, and culturally appropriate information.

Current trip context:
${contextStr}`;

    const prompt = question;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        answer: data.choices[0].message.content
      };
    } catch (error) {
      console.error('Error asking travel question:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test OpenAI connection
   */
  async testConnection() {
    try {
      const response = await this.callOpenAI('Say "Hello! AI is connected." in a friendly way.');
      console.log('✅ AI Connection successful:', response);
      return true;
    } catch (error) {
      console.error('❌ AI Connection failed:', error);
      return false;
    }
  }
};

// Export for global access
window.AIIntegration = AIIntegration;

console.log('🤖 AI Integration module loaded');

export default AIIntegration;
