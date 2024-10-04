import AuthenticatingConcept from "./concepts/authenticating";
import FriendingConcept from "./concepts/friending";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";
import EventTaggingwithMoodSyncingConcept from "./concepts/tagMoodSync.ts";
import InvitingConcept from "./concepts/inviting";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const tagMoodSync = new EventTaggingwithMoodSyncingConcept("tags");
export const inviting = new InvitingConcept("invites");