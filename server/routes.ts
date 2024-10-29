import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Eventing, MoodSyncing, Notifying, RSVPing, Sessioning, Upvoting } from "./app";
//import { PostOptions } from "./concepts/posting";
//import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  //EVENTING CONCEPT
  @Router.post("/events")
  async create(session: SessionDoc, title: string, description: string, category: ObjectId, moodTag: ObjectId, capacity: number, location: string, date: Date) {
    const user = Sessioning.getUser(session);
    const create = await Eventing.create(user, title, description, category, moodTag, capacity, location, date);
    await Notifying.createNotification(user, `You have created event ${title}`);
    return { msg: create.msg, event: await Responses.event(create.event) };
  }

  //get all events
  @Router.get("/events")
  async getEvent() {
    return Eventing.getEvents();
  }

  //edit event details of a specific event
  //can only edit description, 1ocation, capacity
  @Router.patch("/events/:id")
  async updateEvent(session: SessionDoc, id: string, description?: string, location?: string, capacity?: number) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Eventing.assertHostIsUser(oid, user);
    await Notifying.createNotification(user, `You have updated event ${id}`);
    return await Eventing.update(new ObjectId(id), { description, location, capacity });
  }

  //delete a specific event
  @Router.delete("/events/:id")
  async deleteEvent(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Eventing.assertHostIsUser(oid, user);
    return await Eventing.delete(oid);
  }

  @Router.get("/events/:id")
  async getEventDetails(id: string) {
    return await Eventing.getEventById(new ObjectId(id));
  }

  @Router.get("/events/hosted-by/:username")
  async getEventsHostedByUser(username: string) {
    const user = await Authing.getUserByUsername(username);
    return await Eventing.getEventsHostedByUser(user._id);
    
  }


  //TAGGING CONCEPT(REVISIT WORKING ON)
  // //post the list of predefined categories
  // @Router.get("/categories")
  // async getCategories(req: any, res: any) {
  //   const categories: any = await Responses.categories(Tagging);
  //   res.json(categories);}

  //get list of predefined moods //not work
  // @Router.get("/moods")
  // async getMoods(req: any, res: any) {
  //     const moods: any = await Responses.moods(Tagging);
  //     res.json(moods);
  // }

  //RSVPING CONCEPT
  // //list all RSVPs
  // @Router.get("/rsvps/:userRSVPid")
  // async getRSVPsforUser() {
  //   return RSVPing.rsvps;

  // }

  // RSVPING CONCEPT
  @Router.post("/rsvps/:eventid")
  async createRSVP(session: SessionDoc, eventid: string, status: boolean) {
    const user = Sessioning.getUser(session);
    const event = await Eventing.getEventById(new ObjectId(eventid));
    await Notifying.createNotification(user, `You have RSVP'd to event ${eventid}`);

    if (!event) {
      throw new Error("Event not found");
    }

    return await RSVPing.createRSVP(user, event._id, status);
  }

  @Router.get("/rsvps")
  async getRSVPs() {
    return RSVPing.getRSVPS();
  }

  @Router.delete("/rsvps/:rsvpid")
  async deleteRSVP(session: SessionDoc, rsvpid: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(rsvpid);
    await Notifying.createNotification(user, `You have cancelled your RSVP to event ${rsvpid}`);
    return await RSVPing.deleteRSVP(oid);
  }

  // @Router.post("/tags/initialize")
  // async initializeTags() {
  //   await Tagging.initializeTags();
  //   return { msg: "Tags initialized successfully!" };
  // }

  // // Get all predefined tags
  // @Router.get("/tags")
  // async getTags() {
  //   return await Tagging.getTags();
  // }

  //UPVOTING CONCEPT
  @Router.get("/upvotes")
  async getUpvotes() {
    return Upvoting.upvotes;
  }

  @Router.post("/upvotes/:eventid")
  async upvote(session: SessionDoc, eventid: string) {
    const user = Sessioning.getUser(session);
    const eventId = new ObjectId(eventid);
    await Upvoting.createUpvote(user, eventId, 1);
    await Notifying.createNotification(user, `You have upvoted event ${eventid}`);
    return { msg: "Upvote successfully created!" };
  }

  @Router.delete("/upvotes/:upvoteid")
  async removeUpvote(session: SessionDoc, eventid: string) {
    const user = Sessioning.getUser(session);
    const eventId = new ObjectId(eventid);
    await Notifying.createNotification(user, `You have removed your upvote from event ${eventId}`);
    return await Upvoting.deleteUpvote(eventId);
  }

  // Create a notification
  @Router.post("/notifications")
  async createNotification(session: SessionDoc, message: string) {
    const user = Sessioning.getUser(session);
    return await Notifying.createNotification(user, message);
  }

  // Get notifications for a user
  @Router.get("/notifications")
  async getNotifications(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Notifying.getNotifications(user);
  }

  // Delete a notification
  @Router.delete("/notifications/:id")
  async deleteNotification(session: SessionDoc, id: string) {
    const notificationId = new ObjectId(id);
    return await Notifying.deleteNotification(notificationId);
  }

  @Router.post("/categories")
  async createMood() {
    return await MoodSyncing.insertCategories();
  }

  //   // Remove an upvote from an event
  //   @Router.delete("/upvotes/:eventid")
  //   async removeUpvote(session: SessionDoc, eventid: string) {
  //     const user = Sessioning.getUser(session);
  //     const eventId = new ObjectId(eventid);
  //     return await Upvoting.removeUpvote(user, eventId);
  //   }

  // //increment an upvote for a given event
  // @Router.patch("/upvotes/:eventid")
  // async incrementUpvote(session: SessionDoc, eventid: string) {
  //   const user = Sessioning.getUser(session);
  //   const eventId = new ObjectId(eventid);
  //   return await Upvoting.incrementUpvoteCount(eventId);
  // }

  //when user rsvp to an event (sync user auth, session, rsvp, event)
  //step 1: authenticate and validate the user
  //step 2: check event capacity is not full
  //step 3: check if user has already rsvp'd to the event
  //step 4: create a record of an rsvp for the user
  //step 4: update the event capacity
  //step 5: create a post for the user that they rsvp'd to the event

  // @Router.post("/events/:id/rsvp")
  // async rsvpToEvent(session: SessionDoc, id: string) {
  //   const user = Sessioning.getUser(session);
  //   const event = await Eventing.lookupEventDetails(new ObjectId(id));
  //   const rsvpList = await RSVPing.getRSVPs(new ObjectId(id));
  //   if (event.capacity <= rsvpList.length) {
  //     throw new Error("Event is full");
  //   }

  //   const hasRSVD = await RSVPing.hasRSVPd(user, new ObjectId(id));
  //   if (hasRSVD) {
  //     throw new Error("You have already RSVP'd to this event");
  //   }

  //   const rsvp = await RSVPing.rsvpForEvent(user, new ObjectId(id));
  //   const updatedCapacity = event.capacity - 1;
  //   await Eventing.updateEventDetails(user, new ObjectId(id), { location: event.location, capacity: updatedCapacity });
  //   //await Posting.createActionPost(user, new ObjectId(id), "rsvp");
  //   return { msg: rsvp.msg };
  // }

  // //when user cancels their rsvp
  // @Router.delete("/events/:id/rsvp")
  // async cancelRSVP(session: SessionDoc, id: string) {
  //   const user = Sessioning.getUser(session);
  //   const event = await Eventing.lookupEventDetails(new ObjectId(id));
  //   const rsvpList = await RSVPing.getRSVPs(new ObjectId(id));
  //   if (event.capacity <= rsvpList.length) {
  //     throw new Error("Event is full");
  //   }

  //   const hasRSVD = await RSVPing.hasRSVPd(user, new ObjectId(id));
  //   if (!hasRSVD) {
  //     throw new Error("You have not RSVP'd to this event");
  //   }

  //   const rsvp = await RSVPing.cancelRSVP(user, new ObjectId(id));
  //   event.capacity += 1;
  //   await Eventing.updateEventDetails(user, new ObjectId(id), { location: event.location, capacity: event.capacity });
  //   //await Posting.createActionPost(user, new ObjectId(id), "cancelRsvp");
  //   return { msg: rsvp.msg };
  // }

  //streaks concept

  //get user's streak details
  // @Router.get("/streaks/:userid")
  // async getStreaks() {
  //   return Streaks.streaks;
  // }

  // //increment a user's streak
  // @Router.patch("/streaks/increment")
  // async incrementStreak(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Streaks.attendEvent(user, new Date());
  // }

  // //mark attendance, increments user streak
  // @Router.patch("/events/:eventid/attendance")
  // async markAttendance(session: SessionDoc, eventId: string, userId: string, attended: boolean) {
  //   Sessioning.getUser(session);
  //   const streak = await Streaks.getStreak(new ObjectId(userId));

  //   if (attended) {
  //     const eventDate = new Date();
  //     const result = await Streaks.attendEvent(new ObjectId(userId), eventDate);

  //     if (!result) {
  //       console.error("Error incrementing streak");
  //     }
  //     //await Posting.createActionPost(new ObjectId(userId), new ObjectId(eventId), "streak");

  //     return { msg: streak };
  //   } else {
  //     //reset users streak
  //     const resetResult = await Streaks.missedEvent(new ObjectId(userId));

  //     if (!resetResult) {
  //       console.error("error resetting streak");
  //     }
  //     //await Posting.createActionPost(new ObjectId(userId), new ObjectId(eventId), "streak");
  //     return { msg: streak };
  //   }
  // }

  //upvoting concept

  // //get the number of upvotes for an event
  // @Router.get("/upvotes/:eventid")
  // async getUpvotes() {
  //   return Upvoting.upvotes;
  // }

  // //upvote and sync notfications
  // @Router.post("/upvotes/:eventid")
  // async upvote(session: SessionDoc, event: string) {
  //   const user = Sessioning.getUser(session);
  //   //await Posting.createActionPost(user, new ObjectId(event), "upvote");
  //   return await Upvoting.upvote(user, new ObjectId(event));
  // }

  // //remove an upvote from an event
  // @Router.delete("/upvotes/:eventid")
  // async removeUpvote(session: SessionDoc, event: string) {
  //   const user = Sessioning.getUser(session);
  //   return await Upvoting.removeUpvote(user, new ObjectId(event));
  // }

  //get the number of upvotes for an event

  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }
  // // Get posts, optionally filtering by author or action type
  // @Router.get("/posts")
  // @Router.validate(z.object({ author: z.string().optional(), action: z.string().optional() }))
  // async getPosts(author?: string, action?: string) {
  //   let posts;
  //   if (author) {
  //     const id = (await Authing.getUserByUsername(author))._id;
  //     posts = await Posting.getByAuthor(id);
  //   } else if (action) {
  //     posts = await Posting.getPostsByAction(action as "rsvp" | "upvote" | "cancelRsvp" | "createEvent" | "deleteEvent" | "streak");
  //   } else {
  //     posts = await Posting.getPosts();
  //   }
  //   return Responses.posts(posts);
  // }

  //   // Create a post associated with an action (RSVP, upvote, etc.) and optionally generate a notification
  //   @Router.post("/posts/action")
  //   @Router.validate(z.object({ content: z.string(), eventId: z.string().optional(), action: z.string() }))
  //   async createActionPost(session: SessionDoc, action: "rsvp" | "cancelRsvp" | "createEvent" | "deleteEvent" | "streak" | "upvote", eventId?: string) {
  //     const user = Sessioning.getUser(session);
  //     const eventObjectId = eventId ? new ObjectId(eventId) : undefined;
  //     const created = await Posting.createActionPost(user, eventObjectId || new ObjectId(), action);
  //     return { msg: created.msg, post: await Responses.post(created.post), notification: created.notification };
  //   }

  //     // Update a post
  //   @Router.patch("/posts/:id")
  //   @Router.validate(z.object({ content: z.string().optional(), options: z.object({ backgroundColor: z.string().optional() }).optional() }))
  //   async update(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
  //     const user = Sessioning.getUser(session);
  //     const oid = new ObjectId(id);
  //     await Posting.assertAuthorIsUser(oid, user);
  //     return await Posting.update(oid, content, options);
  //   }

  // // Delete a post
  // @Router.delete("/posts/:id")
  // async deletePost(session: SessionDoc, id: string) {
  //   const user = Sessioning.getUser(session);
  //   const oid = new ObjectId(id);
  //   await Posting.assertAuthorIsUser(oid, user);
  //   return Posting.delete(oid);
  // }

  //tagging concept

  // @Router.get("categories")
  // async getCategories(category: string) {
  //   return await Tagging.setCategories();
  // }

  // Tag an event with a category
  // @Router.post("/events/:eventId/tags")
  // @Router.validate(z.object({ tag: z.string() })) // Ensure that tag is provided as a string
  // async tagEvent(session: SessionDoc, eventId: string, tag: string) {
  //     const user = Sessioning.getUser(session); // Fetch user from session
  //     const eventObjectId = new ObjectId(eventId); // Convert eventId to ObjectId
  //     const tagObjectId = new ObjectId(tag); // Convert tag (category) to ObjectId

  //     // Call Tagging method to add the category tag to the event
  //     await Tagging.tagEvent(eventObjectId, tagObjectId);

  //     return { msg: "Tag successfully added to the event." };
  // }

  // // Remove a tag from an event
  // @Router.delete("/events/:eventId/tags")
  // @Router.validate(z.object({ tagId: z.string() })) // Validate the tagId as a string
  // async removeTagFromEvent(session: SessionDoc, eventId: string, tagId: string) {
  //     const user = Sessioning.getUser(session); // Fetch user from session
  //     const eventObjectId = new ObjectId(eventId); // Convert eventId to ObjectId
  //     const tagObjectId = new ObjectId(tagId); // Convert tagId to ObjectId

  //     // Call Tagging method to remove the tag from the event
  //     await Tagging.removeTagFromEvent(eventObjectId);

  //     return { msg: "Tag successfully removed from the event." };
  // }

  //     //set the mood for user
  //     @Router.post("/users/mood")
  //     @Router.validate(z.object({ moodId: z.string() }))
  //     async setMood(session: SessionDoc, moodId: string) {
  //       const user = Sessioning.getUser(session);
  //       const moodObjectId = new ObjectId(moodId);
  //       await Tagging.setMood(user, moodObjectId);
  //       return { msg: "User mood successfully set." };
  //     }

  //     //get moods for user
  //     @Router.get("/mood")
  //     async getAvailalbeMoods(session: SessionDoc) {
  //       const user = Sessioning.getUser(session);
  //       return await Tagging.getAvailableMoods();
  //     }

  //     //retrieve events based on the current user's mood
  //     @Router.get("/users/events-by-mood")
  //     async getEventsByMood(session: SessionDoc) {
  //       const user = Sessioning.getUser(session);
  //       const events = await Tagging.lookupEventsByMood(user);
  //       return { events };
  //     }

  //     //retrieve events based on a specific tag/category
  //     @Router.get("/events/by-category")
  //     @Router.validate(z.object({ tagId: z.string() }))
  //     async getEventsByCategory(tagId: string) {
  //       const tagObjectId = new ObjectId(tagId);
  //       const events = await Tagging.filterEventsByCategory(tagObjectId);
  //       return { events };
  //   }
  // }

  // @Router.get("/friends")
  // async getFriends(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Authing.idsToUsernames(await Friending.getFriends(user));
  // }

  // @Router.delete("/friends/:friend")
  // async removeFriend(session: SessionDoc, friend: string) {
  //   const user = Sessioning.getUser(session);
  //   const friendOid = (await Authing.getUserByUsername(friend))._id;
  //   return await Friending.removeFriend(user, friendOid);
  // }

  // @Router.get("/friend/requests")
  // async getRequests(session: SessionDoc) {
  //   const user = Sessioning.getUser(session);
  //   return await Responses.friendRequests(await Friending.getRequests(user));
  // }

  // @Router.post("/friend/requests/:to")
  // async sendFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.sendRequest(user, toOid);
  // }

  // @Router.delete("/friend/requests/:to")
  // async removeFriendRequest(session: SessionDoc, to: string) {
  //   const user = Sessioning.getUser(session);
  //   const toOid = (await Authing.getUserByUsername(to))._id;
  //   return await Friending.removeRequest(user, toOid);
  // }

  // @Router.put("/friend/accept/:from")
  // async acceptFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.acceptRequest(fromOid, user);
  // }

  // @Router.put("/friend/reject/:from")
  // async rejectFriendRequest(session: SessionDoc, from: string) {
  //   const user = Sessioning.getUser(session);
  //   const fromOid = (await Authing.getUserByUsername(from))._id;
  //   return await Friending.rejectRequest(fromOid, user);
  // }

  //   @Router.get("/posts")
  //   @Router.validate(z.object({ author: z.string().optional() }))
  //   async getPosts(author?: string) {
  //     let posts;
  //     if (author) {
  //       const id = (await Authing.getUserByUsername(author))._id;
  //       posts = await Posting.getByAuthor(id);
  //     } else {
  //       posts = await Posting.getPosts();
  //     }
  //     return Responses.posts(posts);
  //   }

  //   @Router.post("/posts")
  //   async createPost(session: SessionDoc, content: string, options?: PostOptions) {
  //     const user = Sessioning.getUser(session);
  //     const created = await Posting.create(user, content, options);
  //     return { msg: created.msg, post: await Responses.post(created.post) };
  //   }

  //   @Router.patch("/posts/:id")
  //   async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
  //     const user = Sessioning.getUser(session);
  //     const oid = new ObjectId(id);
  //     await Posting.assertAuthorIsUser(oid, user);
  //     return await Posting.update(oid, content, options);
  //   }
  //  @Router.delete("/posts/:id")
  //   async deletePost(session: SessionDoc, id: string) {
  //     const user = Sessioning.getUser(session);
  //     const oid = new ObjectId(id);
  //     await Posting.assertAuthorIsUser(oid, user);
  //     return Posting.delete(oid);
  //   }
}

/** The web app. */

export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
