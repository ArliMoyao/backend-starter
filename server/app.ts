import AuthenticatingConcept from "./concepts/authenticating";
//import FriendingConcept from "./concepts/friending";
//import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import EventConcept from "./concepts/events";
import RSVPConcept from "./concepts/rsvp'ing";
import StreakConcept from "./concepts/streaks";
import TaggingConcept from "./concepts/tagging";
import UpvotingConcept from "./concepts/upvoting";



// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
//export const Posting = new PostingConcept("posts");
export const Eventing = new EventConcept("events");
export const RSVPing = new RSVPConcept("rsvps");
export const Streaks = new StreakConcept("streaks");
export const Tagging = new TaggingConcept("tags", "moods", "events", "users");
export const Upvoting = new UpvotingConcept("upvotes", "events");
//export const Friending = new FriendingConcept("friends");
