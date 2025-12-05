// js/main-generator.js

import { travelerProfile as defaultProfile } from './models/traveler-profile.js';
import { selectCities } from './engine/city-selector.js';
import { recommendActivitiesForDay } from './engine/activity-recommender.js';
import { scheduleDay } from './engine/day-scheduler.js';

/**
 * Generates a full itinerary based on a traveler's profile.
 * @param {object} profile - The traveler's profile.
 * @returns {object} The complete generated itinerary.
 */
export function generateItinerary(profile = defaultProfile) {
  console.log("Starting itinerary generation with profile:", profile);

  // 1. Select cities and days per city
  const city_plan = selectCities(profile);
  console.log("City plan:", city_plan);

  let full_itinerary = {
      profile: profile,
      city_plan: city_plan,
      daily_schedules: []
  };
  let planned_activity_ids = [];
  let day_counter = 1;

  // 2. Iterate through the city plan
  for (const city of city_plan) {
    for (let i = 0; i < city.days; i++) {

      // 3. Recommend activities for the day
      const recommended_activities = recommendActivitiesForDay(city.city, profile, planned_activity_ids);
      console.log(`Day ${day_counter} (${city.city}): Recommended activities:`, recommended_activities.map(a => a.name));

      // Add new activities to the planned list
      recommended_activities.forEach(act => planned_activity_ids.push(act.id));

      // 4. Schedule the day
      const { schedule, summary } = scheduleDay(recommended_activities, profile);
      console.log(`Day ${day_counter} (${city.city}): Scheduled activities:`, schedule);
      if(summary.overload_warning) console.warn(summary.overload_warning);

      full_itinerary.daily_schedules.push({
          day: day_counter,
          city: city.city,
          schedule: schedule,
          summary: summary
      });

      day_counter++;
    }
  }

  console.log("Finished itinerary generation.");
  return full_itinerary;
}
