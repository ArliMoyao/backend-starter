import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface CategoryDoc extends BaseDoc {
  id: ObjectId;
  name: string;
}

export default class moodSyncing {
  public readonly predefinedMoods: { id: ObjectId; name: string }[];
  public readonly predefinedCategories: { id: ObjectId; name: string }[];
  public readonly categories: DocCollection<CategoryDoc>;

  /**
   * Make an instance of moodSyncing.
   */

  constructor(CollectionName: string) {
    this.categories = new DocCollection<CategoryDoc>(CollectionName);
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
      { id: new ObjectId(), name: "Happy" },
      { id: new ObjectId(), name: "Sad" },
      { id: new ObjectId(), name: "Excited" },
      { id: new ObjectId(), name: "Relaxed" },
      { id: new ObjectId(), name: "Angry" },
      { id: new ObjectId(), name: "Bored" },
      { id: new ObjectId(), name: "Anxious" },
      { id: new ObjectId(), name: "Confident" },
      { id: new ObjectId(), name: "Curious" },
      { id: new ObjectId(), name: "Inspired" },
    ];
  }

  async insertCategories() {
    const existingCategories = await this.categories.readMany({});
    if (existingCategories.length > 0) {
      return { msg: "Categories already exist!" };
    }
    await this.categories.createMany(this.predefinedCategories);
    return { msg: "Categories successfully inserted!" };
  }
}
