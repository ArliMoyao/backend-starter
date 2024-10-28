import { ObjectId, UpdateFilter } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UpvoteDoc extends BaseDoc {
    userId: ObjectId;
    eventId: ObjectId;
    upVoteCount: number;
  }
  
  // export interface EventDoc extends BaseDoc {
  //   voteCount: number;
  // }

  /**
 * concept: Upvoting [User, Event]
 */
export default class UpvotingConcept {
    // public readonly upvotes: DocCollection<UpvoteDoc>;
    // public readonly events: DocCollection<EventDoc>;
    //initialize the collections for upvotes and events
    public readonly upvotes: DocCollection<UpvoteDoc>;

    constructor(collectionName: string) {
        this.upvotes = new DocCollection<UpvoteDoc>(collectionName);
      }

      async createUpvote(userId: ObjectId, eventId: ObjectId, upVoteCount: number) {
        const existingUpvote = await this.upvotes.readOne({ userId, eventId });
        if (existingUpvote) {
            throw new NotAllowedError(`User ${userId} has already upvoted this event.`);
        }
        const _id = await this.upvotes.createOne({ userId, eventId, upVoteCount });
        return { msg: "Upvote successfully created!", upvote: await this.upvotes.readOne({ _id }) };
    }


    async removeUpvote(userId: ObjectId, eventId: ObjectId) { 
        const upvote = await this.upvotes.popOne({ userId, eventId });
        if (!upvote) {
          throw new NotFoundError(`Upvote ${userId} does not exist!`);
        }
        return { msg: "Upvote removed successfully!" };
    }
    async incrementUpvoteCount(eventId: ObjectId) {
      const result = await this.upvotes.partialUpdateOne(
          { eventId },
          { $inc: { upVoteCount: 1 } } as Partial<UpvoteDoc>
      );
      if (!result) throw new NotFoundError(`Event ${eventId} does not exist for incrementing upvotes.`);
      return { msg: "Upvote count incremented successfully!" };
  }
  

   async checkUpvotes(eventId: ObjectId) {
    const upvotes = await this.upvotes.readMany({ eventId });
    return { msg: "Upvotes retrieved successfully!", upvotes };
}






    // //Action: upvote an event
    // async upvote(userId: ObjectId, eventId: ObjectId) {
    //     // Check if the user has already upvoted this event
    //     const existingUpvote = await this.upvotes.readOne({ userId, eventId });
    //     if (existingUpvote) {
    //       throw new UpvoteAlreadyExistsError(userId, eventId);
    //     }
    
    //     // create the upvote record
    //     await this.upvotes.createOne({ userId, eventId });
    
    //     // increment the vote count for the event
    //     await this.events.partialUpdateOne({ _id: eventId }, { $inc: { voteCount: 1 } } as any);
    
    //     return { msg: "Upvoted successfully!" };
    //   }
    
    //   async removeUpvote(userId: ObjectId, eventId: ObjectId) {
    //     // check if the user has upvoted this event
    //     const upvote = await this.upvotes.popOne({ userId, eventId });
    //     if (!upvote) {
    //       throw new UpvoteNotFoundError(userId, eventId);
    //     }
    
    //     // decrement the vote count for the event
    //     await this.events.partialUpdateOne({ _id: eventId }, { $inc: { voteCount: -1 } } as any);
    
    //     return { msg: "Upvote removed successfully!" };
    //   }
    
    //   async checkUpvotes(eventId: ObjectId) {
    //     const event = await this.events.readOne({ _id: eventId });
    //     if (!event) {
    //       throw new NotFoundError(`Event ${eventId} does not exist!`);
    //     }
    //     return { voteCount: event.voteCount };
    //   }
    // }
    
    // export class UpvoteAlreadyExistsError extends NotAllowedError {
    //   constructor(
    //     public readonly userId: ObjectId,
    //     public readonly eventId: ObjectId,
    //   ) {
    //     super("User {0} has already upvoted event {1}!", userId, eventId);
    //   }
    // }
    
    // export class UpvoteNotFoundError extends NotFoundError {
    //   constructor(
    //     public readonly userId: ObjectId,
    //     public readonly eventId: ObjectId,
    //   ) {
    //     super("User {0} has not upvoted event {1}!", userId, eventId);
    //   }
    }    


    
