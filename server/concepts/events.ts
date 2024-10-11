
import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

// Interface for representing an Event document
export interface EventDoc extends BaseDoc {
  host: ObjectId;
  location: string;
  eventType: string;
  capacity: number;
  attendees: ObjectId[];
  status: "upcoming" | "ongoing" | "completed" | "canceled";
  createdAt: Date;
  updatedAt: Date;
}

// Concept: Events [User, Event, Location, EventType]
export default class EventsConcept {
  public readonly events: DocCollection<EventDoc>;

  /**
   * Make an instance of EventsConcept.
   */
  constructor(collectionName: string) {
    this.events = new DocCollection<EventDoc>(collectionName);
  }

  // Action: Create an event
  async createEvent(
    host: ObjectId,
    location: string,
    eventType: string,
    capacity: number
  ) {
    const newEvent: EventDoc = {
      _id: new ObjectId(),
      host,
      location,
      eventType,
      capacity,
      attendees: [],
      status: "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };

    await this.events.createOne(newEvent);
    return { msg: "Event created successfully!", event: newEvent };
  }

  // Action: Lookup event details
  async lookupEventDetails(eventId: ObjectId) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    return {
      location: event.location,
      eventType: event.eventType,
      host: event.host,
      capacity: event.capacity,
      count: event.attendees.length,
      status: event.status,
    };
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
  async updateEventDetails(
    user: ObjectId,
    eventId: ObjectId,
    location?: string,
    eventType?: string,
    capacity?: number
  ) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) {
      throw new NotFoundError(`Event ${eventId} does not exist!`);
    }

    // Check if the user is the host of the event
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError("You are not the host of this event.");
    }

    const updates: Partial<EventDoc> = {};
    if (location) updates.location = location;
    if (eventType) updates.eventType = eventType;
    if (capacity) {
      if (event.attendees.length > capacity) {
        // Remove extra users if the new capacity is less than the current attendees count
        event.attendees = event.attendees.slice(0, capacity);
      }
      updates.capacity = capacity;
    }

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
