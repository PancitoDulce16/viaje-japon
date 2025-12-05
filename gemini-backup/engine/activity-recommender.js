// js/engine/activity-recommender.js
import { activities as ACTIVITIES_DATABASE } from '../../data/activities-database.js';

/**
 * Recommends activities for a specific day.
 * @param {string} city - The city for which to recommend activities.
 * @param {object} profile - The traveler's profile.
 * @param {Array<string>} existingActivities - A list of IDs of already planned activities.
 * @returns {Array<object>} A list of recommended activity objects.
 */
export function recommendActivitiesForDay(city, profile, existingActivities) {
  if (!ACTIVITIES_DATABASE[city]) {
    return []; // Return empty if city not in DB
  }
  const all_activities = ACTIVITIES_DATABASE[city];
  const pace = profile.pace;
  const budget_per_day = profile.budget.perDay;

  // 1. Calculate "match_score" for each activity
  all_activities.forEach(activity => {
    let score = 0;
    for (const category in profile.interests) {
      if (activity.categories.includes(category)) {
        score += profile.interests[category]; // Weight by user interest
      }
    }
    activity.match_score = score * activity.quality_rating; // Factor in quality
  });

  // 2. Filter out activities that are already planned
  let candidate_activities = all_activities.filter(act => !existingActivities.includes(act.id));

  // Add more filters based on profile
    if (profile.special_preferences.reduced_mobility) {
        candidate_activities = candidate_activities.filter(act => act.accessibility.reduced_mobility_friendly);
    }


  // 3. Sort by score
  candidate_activities.sort((a, b) => b.match_score - a.match_score);

  // 4. Select N activities based on pace
  const num_activities = (pace === 'relaxed') ? 2 : (pace === 'moderate') ? 4 : 5;
  let selected_activities = candidate_activities.slice(0, num_activities);

  // 5. Basic geographical grouping (simple version)
  // This is a placeholder for a more complex grouping logic.
  // For now, we just return the top N activities.
  // A better implementation would analyze the 'area' property.


  // 6. Validate budget
  let total_cost = selected_activities.reduce((sum, act) => sum + act.cost, 0);
  if (total_cost > budget_per_day) {
    // Replace expensive activities with cheaper alternatives
    for (let i = selected_activities.length - 1; i >= 0; i--) {
        if (total_cost <= budget_per_day) break;
        const current_activity = selected_activities[i];
        if (current_activity.cost > 0) {
            const cheaper_alternative = candidate_activities.find(
                alt => alt.cost < current_activity.cost &&
                       !selected_activities.some(sa => sa.id === alt.id) &&
                       alt.match_score > (current_activity.match_score * 0.7) // must be reasonably similar
            );
            if (cheaper_alternative) {
                total_cost -= current_activity.cost;
                total_cost += cheaper_alternative.cost;
                selected_activities[i] = cheaper_alternative;
            }
        }
    }
  }


  return selected_activities;
}
