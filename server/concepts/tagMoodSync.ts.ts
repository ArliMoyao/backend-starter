import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface EventDoc extends BaseDoc {
  time: Date;
  location: string;
  type: string;
  tags: ObjectId[];     
  status: "upcoming" | "ongoing" | "completed" | "canceled";
  moodTags: ObjectId[];
}

// Interface for representing a tag document
export interface TagDoc extends BaseDoc {
  name: string;
}

// Interface for representing a mood document (subset of tags)
export interface MoodDoc extends BaseDoc {
  name: string;
}

// Interface for representing a user mood preference document
export interface UserMoodDoc extends BaseDoc {
  userId: ObjectId;
  mood: ObjectId;
  createdAt: Date;
  updatedAt: Date;

}

/**
 * Concept: EventTaggingwithMoodSyncing [Event, Tag, Mood]
 */
export default class EventTaggingwithMoodSyncingConcept {
  public readonly events: DocCollection<EventDoc>;
  public readonly tags: DocCollection<TagDoc>;
  public readonly moods: DocCollection<MoodDoc>;
  public readonly userMoods: DocCollection<UserMoodDoc>;

  /**
   * Initialize the collections for events, tags, moods, and user mood preferences
   */
  constructor(collectionPrefix: string) {
    this.events = new DocCollection<EventDoc>(collectionPrefix + "_events");
    this.tags = new DocCollection<TagDoc>(collectionPrefix + "_tags");
    this.moods = new DocCollection<MoodDoc>(collectionPrefix + "_moods");
    this.userMoods = new DocCollection<UserMoodDoc>(collectionPrefix + "_user_moods");
  }

  /**
   * Action to tag an event with a tag or mood
   */
  async tagEvent(eventId: ObjectId, tagId: ObjectId) {
    const event = await this.events.readOne({ _id: eventId });
    if (!event) throw new Error("Event not found");

    const tag = await this.tags.readOne({ _id: tagId });
    if (!tag) throw new Error("Tag not found");

    event.tags.push(tagId);
    await this.events.createOne(event);

    const isMood = await this.moods.readOne({ _id: tagId });
    if (isMood) {
      event.moodTags.push(tagId);
      await this.events.createOne(event);
    }

    return event;
  }

  /**
   * Action for a user to select their mood
   */
  async selectMood(userId: ObjectId, moodId: ObjectId) {
    const mood = await this.moods.readOne({ _id: moodId });
    if (!mood) throw new Error("Mood not found");

    await this.userMoods.createOne({
      userId,
      mood: moodId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { msg: "User mood updated" };
  }

  /**
   * Action to recommend events based on user's selected mood
   */
  async recommendEvents(userId: ObjectId) {
    const userMood = await this.userMoods.readOne({ userId });
    if (!userMood) throw new Error("User mood not found");

    const recommendedEvents = await this.events.readMany({
      moodTags: userMood.mood,
    });

    if (recommendedEvents.length === 0) {
      return await this.events.readMany({});
    }

    return recommendedEvents;
  }

  /**
   * Action to sync mood with event and provide alternative events if the mood does not match
   */
  async syncMoodWithEvent(userId: ObjectId, eventId: ObjectId) {
    const userMood = await this.userMoods.readOne({ userId });
    if (!userMood) throw new Error("User mood not found");

    const event = await this.events.readOne({ _id: eventId });
    if (!event) throw new Error("Event not found");

    const isSynced = event.moodTags.includes(userMood.mood);
    if (isSynced) {
      return { isSynced };
    } else {
      const alternativeEvents = await this.suggestAlternativeEvents(userMood.mood);
      return { isSynced: false, alternatives: alternativeEvents };
    }
  }

  /**
   * alternative events based on the user's mood
   */
  private async suggestAlternativeEvents(moodId: ObjectId) {
    return await this.events.readMany({
      moodTags: moodId,
    });
  }
}
