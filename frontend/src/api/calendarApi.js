
export async function createGoogleCalendarEvent(accessToken, eventData) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
  
    const result = await response.json();
    console.log('Event created:', result);
    return result;
  }
  