import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


// Define the interfaces for Tags, Moods, and Events
export interface TagDoc extends BaseDoc {
  name: string;
}

export interface MoodDoc extends BaseDoc {
  name: string;
}

export interface EventDoc extends BaseDoc {
  tags: ObjectId[]; // References to TagDoc
  mood?: ObjectId; // Reference to MoodDoc if the event has a mood
}

export interface UserDoc extends BaseDoc {
  userMood?: ObjectId; // Reference to MoodDoc
}


/**
 * Concept: Tagging [Tag, Mood, Event]
 */

export default class TaggingConcept {
  public readonly tags: DocCollection<TagDoc>;
  public readonly moods: DocCollection<MoodDoc>;
  public readonly events: DocCollection<EventDoc>;
  public readonly users: DocCollection<UserDoc>;



  /**
   * Make an instance of Tagging.
   */
  constructor(tagCollectionName: string, moodCollectionName: string, eventCollectionName: string, userCollectionName: string) {
    this.tags = new DocCollection<TagDoc>(tagCollectionName);
    this.moods = new DocCollection<MoodDoc>(moodCollectionName);
    this.events = new DocCollection<EventDoc>(eventCollectionName);
    this.users = new DocCollection<UserDoc>(userCollectionName);
  }

  async tagEvent(userId: ObjectId, eventId: ObjectId, tagId: ObjectId) {
    //tags an event with a category if it hasnt been tagged with the same category before 
    // Find the event and tag
    const event = await this.events.readOne({ _id: eventId });
    if (!event) throw new NotFoundError(`Event ${eventId} does not exist!`);

    if (event.tags.includes(tagId)) {
      throw new NotAllowedError(`Event ${eventId} is already tagged with ${tagId}.`);
    }

    //add the tag to the events tags array
    await this.events.partialUpdateOne({ _id: eventId }, { tags: [...event.tags, tagId] });

    return { msg: "Tag added to event!" };
}

  async removeTagFromEvent(userId: ObjectId, eventId: ObjectId, tagId: ObjectId) {
    //removes a tag from an event if it has been tagged with the same category before
    //remove tag from event tags array
    // Find the event and tag
    const event = await this.events.readOne({ _id: eventId });
    if (!event) throw new NotFoundError(`Event ${eventId} does not exist!`);

    if (!event.tags.includes(tagId)) {
      throw new NotAllowedError(`Event ${eventId} is not tagged with ${tagId}.`);
    }

    //remove the tag from the events tags array
    await this.events.partialUpdateOne({ _id: eventId }, { tags: event.tags.filter((id) => id.toString() !== tagId.toString()) });

    return { msg: "Tag removed from event!" };

  }
  async setMood(userId: ObjectId, moodId: ObjectId) {
    //allows a user to select a mood from a predefined set of moods, the mood is then set for the user
    const user = await this.users.readOne({ _id: userId });
    const mood = await this.moods.readOne({ _id: moodId });

    if (!user) throw new NotFoundError(`User ${userId} does not exist!`);
    if (!mood) throw new NotFoundError(`Mood ${moodId} does not exist!`);

    // Set the user's mood
    user.userMood = moodId;
    await this.users.partialUpdateOne({ _id: userId }, { userMood: moodId });

    return { msg: "User mood set!" };
  }

  async getAvailableMoods() {
    // Return all available predefined moods
    return await this.moods.readMany({});
  }

  async lookupEventsByMood(userId: ObjectId) {
    //fetches events based on the users selected mood and displays them
    const user = await this.users.readOne({ _id: userId });
    if (!user || !user.userMood) {
      throw new NotFoundError(`User ${userId} does not have a mood set.`);
    }

    // Find events that match the user's selected mood
    const events = await this.events.readMany({ mood: user.userMood });
    return events;
  }

  async filterEventsByCategory(tagId: ObjectId) {
    //fetches events based on the selected category and displays them 
    // Find events that contain the given tag
    const events = await this.events.readMany({ tags: tagId });
    return events;
  }

}