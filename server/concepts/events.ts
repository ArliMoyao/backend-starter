import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

// Interface for representing an Event document
export interface EventDoc extends BaseDoc {
  host: ObjectId;
  location: string;
  title: string;
  description: string;
  capacity: number;
  moodTag: ObjectId;
  category: ObjectId;
  date: Date;
  attendees: ObjectId[];
  status: "upcoming" | "ongoing" | "completed" | "canceled";
}

/**
 * concept: Events [User, Event, Location, EventType]
 */
export default class EventsConcept {
  public readonly events: DocCollection<EventDoc>;

  /**
   * Make an instance of EventsConcept.
   */
  constructor(collectionName: string) {
    this.events = new DocCollection<EventDoc>(collectionName);
  }

  async create(user: ObjectId, title: string, description: string, category: ObjectId, moodTag: ObjectId, capacity: number, location: string, date: Date) {
    const _id = await this.events.createOne({
      host: user,
      title,
      description,
      category,
      moodTag,
      capacity,
      location,
      date,
      status: "upcoming",
      attendees: [],
    });
    return { msg: "Event successfully created!", event: await this.events.readOne({ _id }) };
  }

  async getEvents() {
    // Returns all events! You might want to page for better client performance
    return await this.events.readMany({}, { sort: { _id: -1 } });
  }

  async getByHost(host: ObjectId) {
    return await this.events.readMany({ host });
  }
  async update(_id: ObjectId, updates: Partial<Omit<EventDoc, "_id" | "host" | "attendees">>) {
    await this.events.partialUpdateOne({ _id }, updates);
    return { msg: "Event successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.events.deleteOne({ _id });
    return { msg: "Event deleted successfully!" };
  }

  async assertHostIsUser(_id: ObjectId, user: ObjectId) {
    const event = await this.events.readOne({ _id });
    if (!event) {
      throw new NotFoundError(`Event ${_id} does not exist!`);
    }
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError("You are not the host of this event.");
    }
  }

  async getEventsHostedByUser(user: ObjectId) {
    return await this.events.readMany({ host: user });
  }

  async getEventById(_id: ObjectId) {
    return await this.events.readOne({ _id });
  }
}