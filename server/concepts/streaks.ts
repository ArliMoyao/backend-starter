import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface StreakDoc extends BaseDoc {
  user: ObjectId;
  lastAttendance: Date | null;
  active: boolean;
  streakCount: number;
}

/**
 * Concept: Streaks [Streak]
 */
export default class StreaksConcept {
    public readonly streaks: DocCollection<StreakDoc>;

    /**
     * Initialize the collection for streaks
     */
    constructor(collectionName: string) {
        this.streaks = new DocCollection<StreakDoc>(collectionName);
    }


    /**
     * Action: Get a user's streak
     */
    async getStreak(user: ObjectId) {
        const streak = await this.streaks.readOne({ user });
        if (!streak) {
            throw new NotFoundError(`Streak for user ${user} not found`);
        }
        return streak;
    }
    /**
     * Action: Update a user's streak when they attend an event. If it is a consecutive event, then the streak count is also incremented by 1. 
    */

    async attendEvent(userId: ObjectId, eventDate: Date) {
        //create streak record if one does not exist for the user 
        let streak = await this.streaks.readOne({ user: userId });
        if (!streak) {
            streak = {
                _id: new ObjectId(),
                user: userId,
                lastAttendance: null,
                active: true,
                streakCount: 0,
                dateCreated: new Date(),
                dateUpdated: new Date(),
            };
            await this.streaks.createOne(streak);
        }
 
        else{ 
            //check if the event date is exactly one day after the last attendance of any event for a single user
            //update the streak 
            if (streak.lastAttendance && this.isConsecutiveDay(streak.lastAttendance, eventDate)) {
                streak.streakCount++;
            } else {
                streak.streakCount = 1;
            }

            streak.lastAttendance = eventDate;
            streak.dateUpdated = new Date();
            streak.active = true;
            //update the streak record in database
           
            await this.streaks.partialUpdateOne({ user: userId }, streak);
        }
        return {msg: "Streak updated successfully!", streak};
    }

    /**
     * Action: Reset a user's streak if missed event 
     */

    async missedEvent(userId: ObjectId) {
        //create streak record if one does not exist for the user 
        let streak = await this.streaks.readOne({ user: userId });
        if (!streak) {
            streak = {
                _id: new ObjectId(),
                user: userId,
                lastAttendance: null,
                active: true,
                streakCount: 0,
                dateCreated: new Date(),
                dateUpdated: new Date(),
            };
            await this.streaks.createOne(streak);
        }
        else {
            //reset the streak count
            streak.streakCount = 0;
            streak.active = false;
            streak.dateUpdated = new Date();
            //update the streak record in database
            await this.streaks.partialUpdateOne({ user: userId }, streak);
        }
        return {msg: "Streak updated successfully!", streak};
    }
  /**
   * Helper function to determine if two dates are consecutive days.
   */
  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays === 1;
  }

    }

