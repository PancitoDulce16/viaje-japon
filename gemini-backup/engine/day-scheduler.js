// js/engine/day-scheduler.js

function getHaversineDistance(coords1, coords2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

/**
 * Sorts activities using a nearest neighbor greedy algorithm.
 * @param {Array<object>} activities - The list of activity objects.
 * @returns {Array<object>} The sorted list of activities.
 */
function sortActivitiesGeographically(activities) {
    if (activities.length < 2) {
        return activities;
    }

    let remaining = [...activities];
    let sorted = [];
    
    // Start with the first activity in the original list
    let current_activity = remaining.shift();
    sorted.push(current_activity);

    while (remaining.length > 0) {
        let nearest_activity = null;
        let min_distance = Infinity;
        let nearest_index = -1;

        for (let i = 0; i < remaining.length; i++) {
            const distance = getHaversineDistance(current_activity.coordinates, remaining[i].coordinates);
            if (distance < min_distance) {
                min_distance = distance;
                nearest_activity = remaining[i];
                nearest_index = i;
            }
        }
        
        if (nearest_activity) {
            current_activity = nearest_activity;
            sorted.push(current_activity);
            remaining.splice(nearest_index, 1);
        } else {
            // Should not happen if remaining is not empty
            break;
        }
    }
    
    return sorted;
}


/**
 * Organizes a list of activities into a realistic daily schedule.
 * @param {Array<object>} activities - The list of activity objects for the day.
 * @param {object} profile - The traveler's profile.
 * @returns {object} An object containing the schedule and a summary.
 */
export function scheduleDay(activities, profile) {

  const sorted_activities = sortActivitiesGeographically(activities);

  let schedule = [];
  // Start the day at 8am for morning people, 10am for evening people
  let current_time = (profile.special_preferences.day_person === 'morning') ? 8.0 : 10.0;
  
  let total_travel_time = 0;

  for (let i = 0; i < sorted_activities.length; i++) {
    const activity = sorted_activities[i];

    // Add travel time from previous activity
    if (i > 0) {
        const prev_activity = sorted_activities[i-1];
        const distance = getHaversineDistance(prev_activity.coordinates, activity.coordinates);
        // Average speed of 15 km/h for urban travel (walking + public transport)
        const travel_hours = distance / 15;
        current_time += travel_hours;
        total_travel_time += travel_hours;
    }

    // Check if the activity is open at the current time
    if (current_time < activity.opening_hours.start) {
        current_time = activity.opening_hours.start; // Wait until it opens
    }

    if(current_time >= activity.opening_hours.end) {
        // Can't visit today, it's already closed or will be by the time we start
        continue;
    }

    const activity_start_time = current_time;
    const activity_end_time = activity_start_time + (activity.duration / 60);

    // If the activity closes before we finish, we can't do it at this time
    if (activity_end_time > activity.opening_hours.end) {
        continue;
    }

    schedule.push({
      activity_id: activity.id,
      activity_name: activity.name,
      start_time: formatTime(activity_start_time),
      end_time: formatTime(activity_end_time)
    });

    // Add activity duration to current time
    current_time = activity_end_time;
    
    // Add a smaller buffer just for rest/transitions, as travel is now calculated
    current_time += 0.25; // 15 mins
  }

  // Simple check for overloaded day
    const total_activity_hours = schedule.reduce((total, item) => {
        const start = parseTime(item.start_time);
        const end = parseTime(item.end_time);
        return total + (end - start);
    }, 0);
    
  const total_day_hours = total_activity_hours + total_travel_time;

  let overload_warning = null;
  if (total_day_hours > 9) { // 9 hours including travel
      overload_warning = `Warning: Day is overloaded with ${total_day_hours.toFixed(1)} hours of activities and travel. Consider a more 'relaxed' pace.`;
      console.warn(overload_warning);
  }


  return {
      schedule: schedule,
      summary: {
          total_activity_hours: total_activity_hours.toFixed(1),
          total_travel_hours: total_travel_time.toFixed(1),
          total_day_hours: total_day_hours.toFixed(1),
          overload_warning: overload_warning
      }
  };
}


function formatTime(time_float) {
    const hours = Math.floor(time_float);
    const minutes = Math.round((time_float - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function parseTime(time_string) {
    const [hours, minutes] = time_string.split(':');
    return parseInt(hours) + (parseInt(minutes) / 60);
}
