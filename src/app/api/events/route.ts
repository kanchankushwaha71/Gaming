import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getEventById, createEvent, registerForEvent } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Sample fallback data for when database fails
const fallbackEvents = [
  {
    id: 1,
    title: "EpicEsports Community Tournament",
    date: "2023-08-15",
    time: "14:00",
    location: "Online",
    description: "Join our monthly community tournament and show your skills.",
    imageUrl: "/images/events/community-tournament.jpg",
    type: "tournament",
    isPublic: true
  },
  {
    id: 2,
    title: "Valorant Pro Workshop",
    date: "2023-09-01",
    time: "16:00",
    location: "Delhi, India",
    description: "Learn from professional Valorant players in this exclusive workshop.",
    imageUrl: "/images/events/valorant-workshop.jpg",
    type: "workshop",
    isPublic: true
  }
];

/**
 * GET events with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'date';
    const featuredParam = searchParams.get('featured') === 'true';
    
    // Get events from Supabase with parameters matching the expected types
    const events = await getEvents({
      type: typeParam ? (typeParam === 'all' ? null : typeParam) : null,
      sortBy,
      featured: featuredParam ? true : undefined
    });
    
    if (!events || events.length === 0) {
      // If no events found in the database, return the fallback data
      console.log('No events found in database, using fallback data');
      return NextResponse.json({ events: fallbackEvents, isFallback: true });
    }
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Return fallback data with a 200 status to avoid breaking the client
    // but include isFallback: true to let the client know these are sample data
    return NextResponse.json({ 
      events: fallbackEvents, 
      isFallback: true,
      error: 'Database connection error, showing sample data' 
    }, { status: 200 });
  }
}

/**
 * POST to create a new event
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body first
    const eventData = await req.json();
    
    // Clean up data to prevent schema errors
    // Handle non-existent column references by moving data to appropriate fields
    
    // Process date and convert to start_date
    if (eventData.date && typeof eventData.date === 'string') {
      try {
        const testDate = new Date(eventData.date);
        if (!isNaN(testDate.getTime())) {
          // Valid date - set start_date
          eventData.start_date = eventData.date;
        }
      } catch (e) {
        console.warn('Failed to parse date:', e);
      }
    }
    
    // Map frontend field names to database field names
    // Handle field name mismatches
    if (eventData.type && !eventData.event_type) {
      eventData.event_type = eventData.type;
      delete eventData.type;  // Remove the frontend 'type' field
    }
    
    // Remove fields that don't exist in the database schema to prevent errors
    // List of frontend-only fields that should be excluded from database operations
    const frontendOnlyFields = ['date', 'createdAt']; 
    frontendOnlyFields.forEach(field => {
      if (field in eventData) {
        delete eventData[field];
      }
    });
    
    // Log the event data being created
    console.log('Creating event with data:', JSON.stringify(eventData, null, 2));
    
    // Create event in Supabase using the server-side function
    const event = await createEvent(eventData);
    
    console.log('Event created successfully:', event.id);
    
    return NextResponse.json(
      { message: 'Event created successfully', event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);
    
    // Handle Supabase specific errors
    if (error.code === '23505') { // Unique constraint error
      return NextResponse.json(
        { 
          error: 'An event with this name already exists', 
          details: 'Please use a different event name'
        },
        { status: 400 }
      );
    }
    
    if (error.code === '23502') { // Not null violation
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to create event. Please try again later.',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH for event registration
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get the user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required to register for an event' },
        { status: 401 }
      );
    }
    
    // Parse the request body to get event ID and registration details
    const { eventId, ...registrationData } = await req.json();
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Add user data to registration
    const userData = {
      userId: session.user.id,
      email: session.user.email,
      ...registrationData
    };
    
    // Register for the event
    const registration = await registerForEvent(eventId, userData);
    
    return NextResponse.json(
      { message: 'Successfully registered for event', registration },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error registering for event:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to register for event. Please try again later.',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
