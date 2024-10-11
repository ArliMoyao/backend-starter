import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface UpvoteDoc extends BaseDoc {
    userId: ObjectId;
    eventId: ObjectId;
  }
  
  export interface EventDoc extends BaseDoc {
    voteCount: number;
  }

  /**
 * concept: Upvoting [User, Event]
 */
export default class UpvotingConcept {
    public readonly upvotes: DocCollection<UpvoteDoc>;
    public readonly events: DocCollection<EventDoc>;
    //initialize the collections for upvotes and events

    constructor(upvoteCollectionName: string, eventCollectionName: string) {
        this.upvotes = new DocCollection<UpvoteDoc>(upvoteCollectionName);
        this.events = new DocCollection<EventDoc>(eventCollectionName);
      }

    //Action: upvote an event
    async upvote(userId: ObjectId, eventId: ObjectId) {
        // Check if the user has already upvoted this event
        const existingUpvote = await this.upvotes.readOne({ userId, eventId });
        if (existingUpvote) {
          throw new UpvoteAlreadyExistsError(userId, eventId);
        }
    
        // create the upvote record
        await this.upvotes.createOne({ userId, eventId });
    
        // increment the vote count for the event
        await this.events.partialUpdateOne({ _id: eventId }, { $inc: { voteCount: 1 } } as any);
    
        return { msg: "Upvoted successfully!" };
      }
    
      async removeUpvote(userId: ObjectId, eventId: ObjectId) {
        // check if the user has upvoted this event
        const upvote = await this.upvotes.popOne({ userId, eventId });
        if (!upvote) {
          throw new UpvoteNotFoundError(userId, eventId);
        }
    
        // decrement the vote count for the event
        await this.events.partialUpdateOne({ _id: eventId }, { $inc: { voteCount: -1 } } as any);
    
        return { msg: "Upvote removed successfully!" };
      }
    
      async checkUpvotes(eventId: ObjectId) {
        const event = await this.events.readOne({ _id: eventId });
        if (!event) {
          throw new NotFoundError(`Event ${eventId} does not exist!`);
        }
        return { voteCount: event.voteCount };
      }
    }
    
    export class UpvoteAlreadyExistsError extends NotAllowedError {
      constructor(
        public readonly userId: ObjectId,
        public readonly eventId: ObjectId,
      ) {
        super("User {0} has already upvoted event {1}!", userId, eventId);
      }
    }
    
    export class UpvoteNotFoundError extends NotFoundError {
      constructor(
        public readonly userId: ObjectId,
        public readonly eventId: ObjectId,
      ) {
        super("User {0} has not upvoted event {1}!", userId, eventId);
      }
    }    


    
