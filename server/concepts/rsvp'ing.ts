import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError, CapacityError } from "./errors";
import { EventDoc as ImportedEventDoc } from "./events";

// RSVPing Concept
export interface RSVPDoc extends BaseDoc {
    user: ObjectId;
    event: ObjectId;
    status: boolean; // true if user has RSVP'd, false otherwise
  }
  

  // export interface LocalEventDoc extends BaseDoc {
  //   capacity: number;
  //   rsvpList: ObjectId[]; // List of users who have RSVP'd
  // }
  
  /**
   * Concept: RSVPing [RSVP, Event]
   */


    export default class RSVPConcept {
      public readonly rsvps: DocCollection<RSVPDoc>;
      //public readonly events: DocCollection<LocalEventDoc>;
    
      constructor(collectionName: string) {
        this.rsvps = new DocCollection<RSVPDoc>(collectionName);
       // this.events = new DocCollection<LocalEventDoc>("events");
      }
    


      async createRSVP(user: ObjectId, event: ObjectId, status: boolean) {
       
        status = true;
        const _id = await this.rsvps.createOne({ user, event, status });
        return { msg: "RSVP successfully created!", rsvp: await this.rsvps.readOne({ _id }) };
      }
    
      async getRSVPs() {  
        return await this.rsvps.readMany({});
      }

      async deleteRSVP(user: ObjectId, event: ObjectId, status: boolean) {
        status = false;
        const rsvp = await this.rsvps.readOne({ user, event, status });
        if (!rsvp) {
          throw new NotFoundError("RSVP not found");
        }
        await this.rsvps.deleteOne({ _id: rsvp._id });
        return { msg: "RSVP successfully deleted!" };
      }

      // async rsvpForEvent(user: ObjectId, eventId: ObjectId) {
      //   const event = await this.events.readOne({ _id: eventId });
      //   if (!event) throw new NotFoundError(`Event ${eventId} not found`);
    
      //   if (event.rsvpList.length >= event.capacity) {
      //     throw new CapacityError("Event is full");
      //   }
    
      //   const existingRSVP: RSVPDoc | null = await this.rsvps.readOne({ user, event: eventId });
      //   if (existingRSVP && existingRSVP.status) {
      //     throw new NotAllowedError(`User ${user} has already RSVP'd for event ${eventId}!`);
      //   }
    
      //   await this.events.partialUpdateOne({ _id: eventId }, { rsvpList: [...event.rsvpList, user] });
      //   await this.rsvps.createOne({ user, event: eventId, status: true });
      //   return { msg: "RSVP successfully created!" };
      // }
    }
    // //Action: RSVP to an event
    // async rsvpForEvent(user: ObjectId, eventId: ObjectId) {
    //     //find an event
    //     const event = await this.events.readOne({ _id: eventId });
    //     if (!event) throw new NotFoundError("Event ${eventId} not found");
  
    //     //check if the event is full
    //     if (event.rsvpList.length >= event.capacity) {
    //         throw new CapacityError("Event is full");
    //     }
    //     //check if the user has already RSVP'd
    //     const existingRSVP: RSVPDoc | null = await this.rsvps.readOne({ user, event: eventId });

    //     if (existingRSVP && existingRSVP.status) {
    //         throw new NotAllowedError(`User ${user} has already RSVP'd for event ${eventId}!`);
    //     }
    //       //add user to the event rsvp list and set status to true
    //         await this.events.partialUpdateOne({ _id: eventId }, { rsvpList: [...event.rsvpList, user] });
    //         await this.rsvps.createOne({ user, event: eventId, status: true });
    //         return { msg: "RSVP successfully created!" };
    //         }
            

    // //Action: Cancel RSVP to an event
    // async cancelRSVP(user: ObjectId, eventId: ObjectId) {
        
    //     //find an event
    //     const event = await this.events.readOne({ _id: eventId });
    //     if (!event) throw new NotFoundError("Event ${eventId} not found");

    //     //check if the user has already RSVPd
    //     const existingRSVP: RSVPDoc | null = await this.rsvps.readOne({ user, event: eventId });

    //     if (!existingRSVP || !existingRSVP.status) {
    //         throw new NotAllowedError(`User ${user} has not RSVP'd for event ${eventId}!`);
    //     }

    //     //remove user from the event rsvp list and set status to false
    //     await this.events.partialUpdateOne({ _id: eventId }, { rsvpList: event.rsvpList.filter((u) => u.toString() !== user.toString()) });
    //     await this.rsvps.partialUpdateOne({ user, event: eventId }, { status: false });
    //     return { msg: "RSVP successfully canceled!" };


    // }

    // //Action: Check if the user has RSVP'd for an event
    // async hasRSVPd(user: ObjectId, eventId: ObjectId) {
    //     const rsvp = await this.rsvps.readOne({ user, event: eventId });
    //     return rsvp?.status ?? false;
    // }

    // //Action: Get all users who have RSVP'd for an event
    // async getRSVPs(eventId: ObjectId) {
    //     const rsvps = await this.rsvps.readMany({ event: eventId, status: true });
    //     return rsvps.map((rsvp) => rsvp.user);
    // }

    // //Action: Get all events a user has RSVP'd for
    // async getRSVPdEvents(user: ObjectId) {
    //     const rsvps = await this.rsvps.readMany({ user, status: true });
    //     return rsvps.map((rsvp) => rsvp.event);
    // }
 
    


