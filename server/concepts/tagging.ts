import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

// Define the interfaces for Tags, Moods, and Events
export interface TagDoc extends BaseDoc {
  userMood: ObjectId;
  eventCategory: ObjectId;
}
export interface EventDoc extends BaseDoc {
  host: ObjectId;
  location: string;
  eventType: string;
  capacity: number;
  moodTag: ObjectId;
  category: ObjectId;
  date: Date;
  status: string;
}

/**
 * Concept: Tagging [Tag, Mood, Event]
 */
export default class TaggingConcept {

  /**
   * Make an instance of Tagging.
   */
  predefinedMoods: { id: ObjectId; name: string }[];
  predefinedCategories: { id: ObjectId; name: string }[];

  constructor() {
    this.predefinedCategories = [
      { id: new ObjectId(), name: "Music & Concerts" },
      { id: new ObjectId(), name: "Fitness & Wellness" },
      { id: new ObjectId(), name: "Arts & Crafts" },
      { id: new ObjectId(), name: "Food & Drink" },
      { id: new ObjectId(), name: "Outdoor & Adventure" },
      { id: new ObjectId(), name: "Social & Networking" },
      { id: new ObjectId(), name: "Workshops & Classes" },
      { id: new ObjectId(), name: "Sports & Fitness" },
      { id: new ObjectId(), name: "Film & Theater" },
      { id: new ObjectId(), name: "Tech & Innovation" },
      { id: new ObjectId(), name: "Community & Volunteering" },
      { id: new ObjectId(), name: "Travel & Outdoor" },
      { id: new ObjectId(), name: "Health & Wellness" },
      { id: new ObjectId(), name: "Business & Professional" },
      { id: new ObjectId(), name: "Science & Tech" },
      { id: new ObjectId(), name: "Fashion & Beauty" },
      { id: new ObjectId(), name: "Home & Lifestyle" },
      { id: new ObjectId(), name: "Hobbies & Special Interest" },
      { id: new ObjectId(), name: "Government & Politics" },
      { id: new ObjectId(), name: "Other" },
    ];
    this.predefinedMoods = [
        { id: new ObjectId(), name: "Music & Concerts" },
        { id: new ObjectId(), name: "Fitness & Wellness" },
        { id: new ObjectId(), name: "Arts & Crafts" },
        { id: new ObjectId(), name: "Food & Drink" },
        { id: new ObjectId(), name: "Outdoor & Adventure" },
        { id: new ObjectId(), name: "Social & Networking" },
        { id: new ObjectId(), name: "Workshops & Classes" },
        { id: new ObjectId(), name: "Sports & Fitness" },
        { id: new ObjectId(), name: "Film & Theater" },
        { id: new ObjectId(), name: "Tech & Innovation" },
        { id: new ObjectId(), name: "Community & Volunteering" },
        { id: new ObjectId(), name: "Travel & Outdoor" },
        { id: new ObjectId(), name: "Health & Wellness" },
        { id: new ObjectId(), name: "Business & Professional" },
        { id: new ObjectId(), name: "Science & Tech" },
        { id: new ObjectId(), name: "Fashion & Beauty" },
        { id: new ObjectId(), name: "Home & Lifestyle" },
        { id: new ObjectId(), name: "Hobbies & Special Interest" },
        { id: new ObjectId(), name: "Government & Politics" },
        { id: new ObjectId(), name: "Other" },
      ];
  }

  // /**
  //  * Tags an event with a single mood tag
  //  */
  // async tagEvent(eventId: ObjectId, moodTagId: ObjectId): Promise<{ msg: string }> {
  //   const event = await this.events.readOne({ _id: eventId });
  //   if (!event) throw new NotFoundError(`Event ${eventId} does not exist!`);

  //   // Replace the existing mood tag with the new one
  //   await this.events.partialUpdateOne({ _id: eventId }, { moodTag: moodTagId });

  //   return { msg: "Mood tag added to event!" };
  // }

  /**
   * Removes the mood tag from an event
   */
  // async removeTagFromEvent(eventId: ObjectId): Promise<{ msg: string }> {
  //   const event = await this.events.readOne({ _id: eventId });
  //   if (!event) throw new NotFoundError(`Event ${eventId} does not exist!`);

  //   if (!event.moodTag) {
  //     throw new NotAllowedError(`Event ${eventId} does not have a mood tag to remove.`);
  //   }

  //   // Remove the mood tag by setting it to null
  //   await this.events.partialUpdateOne({ _id: eventId }, { moodTag: null });

  //   return { msg: "Mood tag removed from event!" };
  // }

  /**
   * Allows a user to set a mood
   */
  // async setMood(userId: ObjectId, moodId: ObjectId): Promise<{ msg: string }> {
  //   const user = await this.users.readOne({ _id: userId });
  //   const mood = this.predefinedMoods.find(m => m.id.equals(moodId));

  //   if (!user) throw new NotFoundError(`User ${userId} does not exist!`);
  //   if (!mood) throw new NotFoundError(`Mood ${moodId} does not exist!`);

  //   // Set the user's mood
  //   await this.users.partialUpdateOne({ _id: userId }, { userMood: moodId });

  //   return { msg: "User mood set!" };
  // }

  /**
   * Get all predefined moods
   */
  async setMoods(){
    return this.predefinedMoods
  }
  

  /**
   * Get all predefined categories
   */
  async setCategories(){
    return this.predefinedCategories
  }

  /**
   * retrieve a mood by its id ex use case, when user is clicking through a list of moods to filter events associated with that mood
   */

  // async getMoodById(moodId: ObjectId): Promise<{ id: ObjectId; name: string }> {
  //   const mood = this.predefinedMoods.find((m) => m.moodid.equals(moodId));
  //   if (!mood) throw new NotFoundError(`Mood ${moodId} does not exist!`);
  //   return { id: mood.moodid, name: mood.name };
  // }

  /**
   * retrieve a category by its id ex use case, when user is clicking through a list of categories to filter events associated with that category
  //  */
  // async getCategoryById(categoryId: ObjectId): Promise<{ id: ObjectId; name: string }> {
  //   const category = this.predefinedCategories.find((c) => c.id.equals(categoryId));
  //   if (!category) throw new NotFoundError(`Category ${categoryId} does not exist!`);
  //   return { id: category.id, name: category.name };

    // /**
    //  * Lookup events based on user's mood
    //  */
    // async lookupEventsByMood(userId: ObjectId): Promise<EventDoc[]> {
    //   const user = await this.users.readOne({ _id: userId });
    //   if (!user || !user.userMood) {
    //     throw new NotFoundError(`User ${userId} does not have a mood set.`);
    //   }

    //   // Find events that match the user's selected mood
    //   const events = await this.events.readMany({ moodTag: user.userMood });
    //   return events;
    // }

    // /**
    //  * Fetch events by category
    //  */
    // async filterEventsByCategory(categoryId: ObjectId): Promise<EventDoc[]> {
    //   const events = await this.events.readMany({ category: categoryId });
    //   return events;
    // }
  }

