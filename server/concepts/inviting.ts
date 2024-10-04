import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


export interface InvitationDoc extends BaseDoc {
  from: ObjectId;    
  to: ObjectId;      
  event: ObjectId;   
  status: 'pending' | 'accepted' | 'rejected'; 
    
}

export default class InvitingConcept {
  public readonly invitations: DocCollection<InvitationDoc>;

  //instance of Inviting
  constructor(collectionName: string) {
    this.invitations = new DocCollection<InvitationDoc>(collectionName);
  }

  // Action to create an invitation
  async invite(sender: ObjectId, recipient: ObjectId, event: ObjectId): Promise<InvitationDoc> {
    const newInvitation: InvitationDoc = {
      _id: new ObjectId(),
      from: sender,
      to: recipient,
      event: event,
      status: "pending",
      dateCreated: new Date(),
      dateUpdated: new Date()
    };


    await this.invitations.createOne(newInvitation);
    return newInvitation;
  }

  // Action to accept an invitation
  async acceptInvitation(recipient: ObjectId, invitationId: ObjectId) {
    const invitation = await this.invitations.readOne({ _id: invitationId });
    if (!invitation) {
      throw new NotFoundError(`Invitation with ID ${invitationId} not found`);
    }


    if (invitation.to.toString() === recipient.toString()) {
      // Update the invitation status to 'accepted'
      await this.invitations.partialUpdateOne({ _id: invitationId }, { $set: { status: 'accepted', updatedAt: new Date() } } as any);
      return {
        sender: invitation.from,
        event: invitation.event
      };
    } else {
      throw new NotAllowedError("Invitation recipient does not match.");
    }
  }

  // Action to reject an invitation
  async rejectInvitation(recipient: ObjectId, invitationId: ObjectId) {
    const invitation = await this.invitations.readOne({ _id: invitationId });
    if (!invitation) {
      throw new NotFoundError(`Invitation with ID ${invitationId} not found`);
    }

    if (invitation.to.toString() === recipient.toString()) {
      await this.invitations.partialUpdateOne({ _id: invitationId }, { $set: { status: 'rejected', updatedAt: new Date() } } as any);
      return invitation.event;
    } else {
      throw new NotAllowedError("Invitation recipient does not match.");
    }
  }
}
