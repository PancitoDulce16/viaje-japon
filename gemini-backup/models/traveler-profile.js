// js/models/traveler-profile.js

export const travelerProfile = {
  group: {
    count: 1, // 1, '2-4', '5-8', '9+'
    type: 'solo', // 'solo', 'couple', 'family', 'friends', 'large_group'
    ages: '26-35', // '18-25', '26-35', '36-50', '51-65', '66+'
  },
  budget: {
    level: 'medium', // 'ultra_low', 'backpacker', 'medium', 'comfort', 'luxury', 'unlimited'
    perDay: 15000, // en JPY
  },
  pace: 'moderate', // 'relaxed', 'moderate', 'intense'
  interests: {
    culture: 8,
    gastronomy: 9,
    nature: 5,
    pop_culture: 3,
    shopping: 6,
    nightlife: 4,
    art: 5,
    adventure: 2,
    photography: 7,
    wellness: 4,
  },
  special_preferences: {
    avoid_crowds: 'depends', // 'yes', 'no', 'depends'
    day_person: 'morning', // 'morning', 'evening'
    dietary: 'none', // 'none', 'vegetarian', 'vegan', 'halal', 'kosher'
    reduced_mobility: false,
    first_time_japan: true,
  },
  trip_details: {
    duration: 10, // en días
    dates: {
        start: '2025-10-10',
        end: '2025-10-20',
    }
  }
};
