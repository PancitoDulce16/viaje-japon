// js/engine/city-selector.js

/**
 * Selects cities to visit and the duration of the stay in each city.
 * @param {object} profile - The traveler's profile.
 * @returns {Array<object>} A list of objects, each with a city and duration.
 */
export function selectCities(profile) {
  const duration = profile.trip_details.duration;
  const interests = profile.interests;
  const first_time = profile.special_preferences.first_time_japan;

  let city_plan = [];

  // Base rule by duration
  if (duration <= 7) {
    city_plan = [{city: 'Tokyo', days: 5}, {city: 'Kyoto', days: 2}];
  } else if (duration <= 10) {
    city_plan = [{city: 'Tokyo', days: 4}, {city: 'Kyoto', days: 3}, {city: 'Osaka', days: 2}];
  } else if (duration <= 14) {
    city_plan = [{city: 'Tokyo', days: 5}, {city: 'Kyoto', days: 4}, {city: 'Osaka', days: 3}, {city: 'Hakone', days: 2}];
  } else {
    city_plan = [{city: 'Tokyo', days: 6}, {city: 'Kyoto', days: 5}, {city: 'Osaka', days: 4}, {city: 'Hiroshima', days: 2}, {city: 'Hakone', days: 3}];
  }


  // Adjust for interests (simple example)
  if (interests.gastronomy > 8) {
    // Increase days in Osaka
    const osaka = city_plan.find(c => c.city === 'Osaka');
    if (osaka) {
        osaka.days += 1;
        const tokyo = city_plan.find(c => c.city === 'Tokyo');
        if (tokyo && tokyo.days > 2) {
            tokyo.days -=1;
        }
    }
  }

    if (interests.pop_culture > 8) {
        const tokyo = city_plan.find(c => c.city === 'Tokyo');
        if (tokyo) {
            tokyo.days += 1;
            const kyoto = city_plan.find(c => c.city === 'Kyoto');
            if (kyoto && kyoto.days > 2) {
                kyoto.days -= 1;
            }
        }
    }

  // Adjust for repeat travelers
  if (!first_time) {
    // Suggest less common cities
    const hasKanazawa = city_plan.find(c => c.city === 'Kanazawa');
    if (!hasKanazawa && duration > 10) {
        const kyoto = city_plan.find(c => c.city === 'Kyoto');
        if (kyoto && kyoto.days > 3) {
            kyoto.days -= 2;
            city_plan.push({city: 'Kanazawa', days: 2});
        }
    }
  }

  return city_plan;
}
