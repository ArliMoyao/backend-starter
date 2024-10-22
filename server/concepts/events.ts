
  import { ObjectId, Db, Collection } from "mongodb";
  import DocCollection, { BaseDoc } from "../framework/doc";
  import { NotAllowedError, NotFoundError } from "./errors";
  
  // Interface for representing an Event document
  export interface EventDoc extends BaseDoc {
    host: ObjectId;
    location: string;
    eventType: string;
    capacity: number;
    moodTags: Collection<ObjectId>;
    category: string;
    date: Date;
    attendees: ObjectId[];
    status: "upcoming" | "ongoing" | "completed" | "canceled";
  }
  
  // Concept: Events [User, Event, Location, EventType]
  export default class EventsConcept {
    public readonly events: DocCollection<EventDoc>;
  
    /**
     * Make an instance of EventsConcept.
     */
    constructor(
      collectionName: string,
      private db: Db, // Inject the database instance
    ) {
      this.events = new DocCollection<EventDoc>(collectionName);
    }
  
    // Action: Create an event
    async createEvent(user: ObjectId, title: string, description: string, category: string, moodTags:ObjectId[], capacity: number, location: string, date: Date) {
      // Create the event document
      const newEvent = {
        userId: user,
        title: title,
        description: description,
        category: category,
        moodTags: moodTags,
        capacity: capacity,
        location: location,
        date: date,
        status: "upcoming", // Default status for a new event
      };
  
      // Save the event to the database
      const createdEvent = await this.db.collection("events").insertOne(newEvent);
  
      return {
        msg: "Event created",
        event: await this.db.collection("events").findOne({ _id: createdEvent.insertedId }), // Retrieve the inserted document
      };
    }

  // Action: Lookup event details
  async lookupEventDetails(eventId: ObjectId) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    return {
      host: event.host,
      location: event.location,
      category: event.category,
      date: event.date,
      moodTag: event.moodTags,
      capacity: event.capacity,
      count: event.attendees.length,
      status: event.status,
    };
  }

  async getEvents() {
    const events = await this.events.readMany({});
    return events;
  }
  //If user is the host of the given event, they can mark attendance when user attends 
  
  async markPartipantsAttendance(user: ObjectId, eventId: ObjectId, userId:ObjectId, eventDate: Date) {
  
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    // Check if the user is the host of the event
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError("You are not the host of this event.");
    }

    // Check if the user is already in the attendees list
    if (event.attendees.includes(userId)) {
      throw new NotAllowedError(`User ${userId} is already marked as attended!`);
    }

    // Add the user to the attendees list
    event.attendees.push(userId);
    await this.events.partialUpdateOne({ _id: eventId }, { attendees: event.attendees });
    return { msg: "Attendance marked successfully!" };
}

  //Update event details given the user is the host of an event 
  async updateEventDetails(user: ObjectId, eventId: ObjectId, updates: Partial<Omit<EventDoc, "_id" | "host" | "attendees" | "status">>) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    // Check if the user is the host of the event
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError("You are not the host of this event.");
    }

    // Update the event details
    await this.events.partialUpdateOne({ _id: eventId }, updates);
    return { msg: "Event details updated successfully!" };
  }
  


  // Action: Cancel an event
  async cancelEvent(user: ObjectId, eventId: ObjectId) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    // Check if the user is the host of the event
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError("You are not the host of this event.");
    }

    // Update the event status to canceled
    await this.events.partialUpdateOne(
      { _id: eventId },
      { status: "canceled" }
    );
    return { msg: "Event canceled successfully!" };
  }
}
