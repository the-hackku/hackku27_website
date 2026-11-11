import { defineRelations } from "drizzle-orm";
import {
  account,
  checkin,
  event,
  infoPageContent,
  invitation,
  member,
  organization,
  participantInfo,
  passkey,
  project,
  reimbursementInvite,
  reservationRequest,
  scanAttempt,
  session,
  themedRoom,
  themedRoomReservation,
  ticket,
  travelReimbursement,
  twoFactor,
  user,
} from "./schema";

const schema = {
  account,
  checkin,
  event,
  infoPageContent,
  invitation,
  member,
  organization,
  participantInfo,
  passkey,
  project,
  reimbursementInvite,
  reservationRequest,
  scanAttempt,
  session,
  themedRoom,
  themedRoomReservation,
  ticket,
  travelReimbursement,
  twoFactor,
  user,
};

export const relations = defineRelations(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  user: {
    accounts: r.many.account(),
    checkinsPerformed: r.many.checkin({
      alias: "checkin_adminId_user_id",
    }),
    checkins: r.many.checkin({
      alias: "checkin_userId_user_id",
    }),
    organizationsViaInvitation: r.many.organization({
      from: r.user.id.through(r.invitation.inviterId),
      to: r.organization.id.through(r.invitation.organizationId),
      alias: "user_id_organization_id_via_invitation",
    }),
    invitations: r.many.invitation(),
    organizationsViaMember: r.many.organization({
      alias: "organization_id_user_id_via_member",
    }),
    members: r.many.member(),
    organizationsCreatorId: r.one.organization({
      alias: "organization_creatorId_user_id",
    }),
    participantInfo: r.one.participantInfo(),
    passkeys: r.many.passkey(),
    organizationsViaProject: r.many.organization({
      from: r.user.id.through(r.project.creatorId),
      to: r.organization.id.through(r.project.teamId),
      alias: "user_id_organization_id_via_project",
    }),
    projects: r.one.project(),
    travelReimbursementsViaReimbursementInvite: r.many.travelReimbursement({
      alias: "travelReimbursement_id_user_id_via_reimbursementInvite",
    }),
    reimbursementInvites: r.many.reimbursementInvite(),
    scanAttemptsPerformed: r.many.scanAttempt({
      alias: "scanAttempt_adminId_user_id",
    }),
    scanAttempts: r.many.scanAttempt({
      alias: "scanAttempt_userId_user_id",
    }),
    sessions: r.many.session(),
    ticketsClaimed: r.many.ticket({
      alias: "ticket_claimedById_user_id",
    }),
    ticketsCreated: r.many.ticket({
      alias: "ticket_createdById_user_id",
    }),
    travelReimbursement: r.one.travelReimbursement({
      alias: "travelReimbursement_userId_user_id",
    }),
    twoFactors: r.many.twoFactor(),
  },
  checkin: {
    userAdmin: r.one.user({
      from: r.checkin.adminId,
      to: r.user.id,
      alias: "checkin_adminId_user_id",
    }),
    event: r.one.event({
      from: r.checkin.eventId,
      to: r.event.id,
    }),
    userUser: r.one.user({
      from: r.checkin.userId,
      to: r.user.id,
      alias: "checkin_userId_user_id",
    }),
    scanAttempts: r.many.scanAttempt(),
  },
  event: {
    checkins: r.many.checkin(),
    scanAttempts: r.many.scanAttempt(),
  },
  organization: {
    usersViaInvitation: r.many.user({
      alias: "user_id_organization_id_via_invitation",
    }),
    invitations: r.many.invitation(),
    usersViaMember: r.many.user({
      from: r.organization.id.through(r.member.organizationId),
      to: r.user.id.through(r.member.userId),
      alias: "organization_id_user_id_via_member",
    }),
    members: r.many.member(),
    user: r.one.user({
      from: r.organization.creatorId,
      to: r.user.id,
      alias: "organization_creatorId_user_id",
    }),
    usersViaProject: r.many.user({
      alias: "user_id_organization_id_via_project",
    }),
    projects: r.one.project(),
  },
  invitation: {
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
  },
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
  },
  participantInfo: {
    user: r.one.user({
      from: r.participantInfo.userId,
      to: r.user.id,
    }),
  },
  passkey: {
    user: r.one.user({
      from: r.passkey.userId,
      to: r.user.id,
    }),
  },
  project: {
    user: r.one.user({
      from: r.project.creatorId,
      to: r.user.id,
    }),
    organization: r.one.organization({
      from: r.project.teamId,
      to: r.organization.id,
    }),
  },
  travelReimbursement: {
    usersViaReimbursementInvite: r.many.user({
      from: r.travelReimbursement.id.through(
        r.reimbursementInvite.reimbursementId,
      ),
      to: r.user.id.through(r.reimbursementInvite.userId),
      alias: "travelReimbursement_id_user_id_via_reimbursementInvite",
    }),
    reimbursementInvites: r.many.reimbursementInvite(),
    user: r.one.user({
      from: r.travelReimbursement.userId,
      to: r.user.id,
      alias: "travelReimbursement_userId_user_id",
    }),
  },
  reimbursementInvite: {
    travelReimbursement: r.one.travelReimbursement({
      from: r.reimbursementInvite.reimbursementId,
      to: r.travelReimbursement.id,
    }),
    user: r.one.user({
      from: r.reimbursementInvite.userId,
      to: r.user.id,
    }),
  },
  reservationRequest: {
    themedRoom: r.one.themedRoom({
      from: r.reservationRequest.themedRoomId,
      to: r.themedRoom.id,
    }),
  },
  themedRoom: {
    reservationRequests: r.many.reservationRequest(),
  },
  scanAttempt: {
    userAdmin: r.one.user({
      from: r.scanAttempt.adminId,
      to: r.user.id,
      alias: "scanAttempt_adminId_user_id",
    }),
    checkin: r.one.checkin({
      from: r.scanAttempt.checkinId,
      to: r.checkin.id,
    }),
    event: r.one.event({
      from: r.scanAttempt.eventId,
      to: r.event.id,
    }),
    userUser: r.one.user({
      from: r.scanAttempt.userId,
      to: r.user.id,
      alias: "scanAttempt_userId_user_id",
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  ticket: {
    userClaimedById: r.one.user({
      from: r.ticket.claimedById,
      to: r.user.id,
      alias: "ticket_claimedById_user_id",
    }),
    userCreatedById: r.one.user({
      from: r.ticket.createdById,
      to: r.user.id,
      alias: "ticket_createdById_user_id",
    }),
  },
  twoFactor: {
    user: r.one.user({
      from: r.twoFactor.userId,
      to: r.user.id,
    }),
  },
}));
