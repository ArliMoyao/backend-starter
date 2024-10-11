import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface PostOptions {
  backgroundColor?: string;
}



export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  event?: ObjectId;//id of the event the post is associated with
  action: "rsvp"| "upvote" | "cancelRsvp" | "createEvent" | "deleteEvent" | "streak"; //action associated with the type of post
  
}


export interface NotificationDoc extends BaseDoc {
  user: ObjectId;
  message: string;
  event?: ObjectId; // Reference to an event if relevant
  read: boolean; // Whether the notification has been read
}

/**
 * 
 * concept: Posting [Author]
 * 
 * this concept is responsible for creating posts that are associated with events
  for example, when a user RSVPs for an event, a post is created that says "User RSVP'd for the event."
  this concept is also responsible for fetching posts related to an event, and also creating posts for other actions that involves when user has interacted with the app (rsvp, cancel rsvp, create event, delete event, upvotes, streak (update to user's streak))
 */


export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;
  public readonly notifications: DocCollection<NotificationDoc>;


  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
    this.notifications = new DocCollection<NotificationDoc>(collectionName + "_notifications");

  }
  async createActionPost(author: ObjectId, eventId: ObjectId, action: "rsvp" | "cancelRsvp" | "createEvent" | "deleteEvent" | "streak" | "upvote") {
    let content = "";
    let message = "";

    switch (action) {
      case "upvote":
        content = "User upvoted the event.";
        message = "You have upvoted the event.";
        break;
      case "rsvp":
        content = "User RSVP'd for the event.";
        message = "You have RSVP'd for the event.";
        break;
      case "cancelRsvp":
        content = "User canceled their RSVP for the event.";
        message = "You have canceled your RSVP for the event.";
        break;
      case "createEvent":
        content = "User created a new event.";
        message = "You have created a new event.";
        break;
      case "deleteEvent":
        content = "User deleted an event.";
        message = "You have deleted an event.";
        break;
      case "streak":
        content = "User's streak has been updated.";
        message = "Your event streak has been updated.";
        break;
      default:
        throw new NotAllowedError(`Invalid action type: ${action}`);
    }
    const post: PostDoc = {
      _id: new ObjectId(),
      author,
      content,
      event: eventId,
      action,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };


    const postId = await this.posts.createOne(post);


    // Create the notification
    const notification: NotificationDoc = {
      _id: new ObjectId(),
      user: author,
      message,
      event: eventId,
      read: false,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    };

    const notificationId = await this.notifications.createOne(notification);

    return {
      msg: "Action post and notification successfully created!",
      post: await this.posts.readOne({ _id: postId }),
      notification: await this.notifications.readOne({ _id: notificationId }),
    };
  }

  //this does not have to go in here because it is already established in the events concept 
  //get posts related to an event 
  // async getPostsByEvent(eventId: ObjectId) {
  //   return await this.posts.readMany({ event: eventId });
  // }


   // Fetch posts based on action type (e.g., "streak")
   async getPostsByAction(action: "rsvp" | "cancelRsvp" | "createEvent" | "deleteEvent" | "streak" | "upvote") {
    return await this.posts.readMany({ action });
  }


  async getPosts() {
    return await this.posts.readMany({});
  
  }

  async getByAuthor(author: ObjectId) {
    // Fetch posts by author
    return await this.posts.readMany({ author });
  }

  async update(_id: ObjectId, content?: string, options?: PostOptions) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.posts.partialUpdateOne({ _id }, { content });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.posts.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}