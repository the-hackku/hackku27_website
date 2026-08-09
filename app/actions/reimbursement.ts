"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type {
  ParticipantInfo,
  ReimbursementInvite,
  TravelReimbursement,
  User,
} from "@/prisma/generated/client";

/**
 * Fetch users by email for group leader to add members.
 */
/**
 * Fetch users by email for group leader to add members.
 * Only returns users who have completed registration (have ParticipantInfo).
 */
export async function searchUsersByEmail(emailQuery: string) {
  if (!emailQuery) {
    return [];
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUser = await prisma.user.findUnique({
    where: { id: session?.session.userId },
    select: { email: true },
  }); // Current user's email

  if (!currentUser) {
    throw new Error("Current user not found");
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: emailQuery,
          mode: "insensitive",
          not: currentUser.email ?? undefined, // Exclude the current user from search results
        },
        ParticipantInfo: {
          isNot: null, // Ensure the user has completed registration
        },
      },
      include: {
        ParticipantInfo: true, // Include participant details
      },
      take: 10, // Limit results
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email ?? "",
      name: `${user.ParticipantInfo?.firstName ?? ""} ${
        user.ParticipantInfo?.lastName ?? ""
      }`,
      school: user.ParticipantInfo?.currentSchool ?? "Unknown",
    }));
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Search failed", {
      cause: err,
    });
  }
}

/**
 * Submit a travel reimbursement request.
 * If applying as a group, only the group leader submits the request.
 */
export async function submitTravelReimbursement({
  transportationMethod,
  address,
  distance,
  estimatedCost,
  reason,
  groupMemberEmails,
  isGroup,
}: {
  transportationMethod: string;
  address: string;
  distance: number;
  estimatedCost: number;
  reason: string;
  groupMemberEmails?: string[];
  isGroup: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!isGroup) {
    // 🚀 **Solo Application**
    const reimbursement = await prisma.travelReimbursement.create({
      data: {
        userId: user.id,
        transportationMethod,
        address,
        distance,
        estimatedCost,
        reason,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { travelReimbursementId: reimbursement.id },
    });

    const { exportReimbursementToGoogleSheet } = await import(
      "@/scripts/googleSheetsExport"
    );
    await exportReimbursementToGoogleSheet(reimbursement);

    revalidatePath("/profile");

    return { success: true, reimbursement };
  }
  // 🚀 **Group Application**
  if (!groupMemberEmails || groupMemberEmails.length === 0) {
    throw new Error("At least one group member must be added.");
  }
  if (groupMemberEmails.length > 10) {
    throw new Error("A group can have a maximum of 10 members.");
  }

  // **Ensure users are not already linked to a reimbursement**
  const existingMembers = await prisma.user.findMany({
    where: {
      email: { in: [...groupMemberEmails, user.email] },
      travelReimbursementId: { not: null },
    },
  });

  if (existingMembers.length > 0) {
    throw new Error("Some users already have a travel reimbursement assigned.");
  }

  return await prisma.$transaction(async (prismaClient) => {
    // **Create the reimbursement entry for the group**
    const reimbursement = await prismaClient.travelReimbursement.create({
      data: {
        userId: user.id, // **Group leader**
        transportationMethod,
        address,
        distance,
        estimatedCost,
        reason,
      },
    });

    // **Assign the leader to this reimbursement immediately**
    await prismaClient.user.update({
      where: { id: user.id },
      data: { travelReimbursementId: reimbursement.id },
    });

    // **Fetch invited members**
    const members = await prismaClient.user.findMany({
      where: {
        email: { in: groupMemberEmails },
      },
    });

    // **Create invites for members**
    const invites = members.map((member) => ({
      userId: member.id,
      reimbursementId: reimbursement.id,
    }));

    await prismaClient.reimbursementInvite.createMany({ data: invites });
  });
}

/**
 * Handle group invitation responses (ACCEPT or DECLINE).
 */
export async function handleGroupInvite(
  reimbursementId: string,
  accept: boolean,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  return await prisma.$transaction(async (prismaClient) => {
    // Fetch user inside the transaction to prevent stale reads
    const user = await prismaClient.user.findUnique({
      where: { id: session.session.userId },
      select: { id: true, travelReimbursementId: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // Fetch the invite within the transaction
    const invite = await prismaClient.reimbursementInvite.findFirst({
      where: {
        userId: user.id,
        reimbursementId,
        status: "PENDING",
      },
    });

    if (!invite) {
      throw new Error("No pending invite found for this reimbursement.");
    }

    if (accept) {
      // Re-check the latest state of travelReimbursementId to prevent conflicts
      if (
        user.travelReimbursementId &&
        user.travelReimbursementId !== reimbursementId
      ) {
        throw new Error(
          "You are already part of another travel reimbursement. Leave that one first.",
        );
      }

      // Assign the reimbursement **only if still null** (after fresh fetch)
      if (!user.travelReimbursementId) {
        await prismaClient.user.update({
          where: { id: user.id, travelReimbursementId: undefined }, // Ensure idempotency
          data: { travelReimbursementId: reimbursementId },
        });
      }
    }

    // Update invite status
    await prismaClient.reimbursementInvite.update({
      where: { id: invite.id },
      data: { status: accept ? "ACCEPTED" : "DECLINED" },
    });

    return { success: true, status: accept ? "ACCEPTED" : "DECLINED" };
  });
}

export async function updateTravelReimbursement({
  reimbursementId,
  transportationMethod,
  address,
  distance,
  estimatedCost,
  reason,
  groupMemberEmails, // New parameter for updated group members
}: {
  reimbursementId: string;
  transportationMethod: string;
  address: string;
  distance: number;
  estimatedCost: number;
  reason: string;
  groupMemberEmails?: string[]; // Allow passing new members
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // **Fetch the existing reimbursement with current invites**
  const reimbursement = await prisma.travelReimbursement.findUnique({
    where: { id: reimbursementId },
    include: {
      invites: {
        include: {
          user: true, // Get user details
        },
      },
    },
  });

  if (!reimbursement) {
    throw new Error("You do not have permission to edit this reimbursement.");
  }

  // **Update reimbursement details**
  const updated = await prisma.travelReimbursement.update({
    where: { id: reimbursementId },
    data: {
      transportationMethod,
      address,
      distance,
      estimatedCost,
      reason,
    },
  });

  // **Handle inviting new group members**
  if (groupMemberEmails && groupMemberEmails.length > 0) {
    // Get existing invited emails
    const existingInviteEmails = reimbursement.invites.map(
      (invite) => invite.user.email,
    );

    // Filter out users who are already invited
    const newMembersToInvite = groupMemberEmails.filter(
      (email) => !existingInviteEmails.includes(email),
    );

    // Find users to invite (ensuring they're not already in another reimbursement)
    const usersToInvite = await prisma.user.findMany({
      where: {
        email: { in: newMembersToInvite },
        travelReimbursementId: null, // Ensure they're not part of another reimbursement
      },
      select: { id: true, email: true },
    });

    // **Create new invites only if there are new users**
    if (usersToInvite.length > 0) {
      await prisma.reimbursementInvite.createMany({
        data: usersToInvite.map((userToInvite) => ({
          userId: userToInvite.id,
          reimbursementId,
        })),
      });
    }
  }
  revalidatePath("/profile");
  return { success: true, reimbursement: updated };
}

export async function getReimbursementDetails() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
    select: {
      travelReimbursement: {
        include: {
          invites: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  ParticipantInfo: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.travelReimbursement) {
    return null;
  }

  return {
    ...user.travelReimbursement,
    isGroup: user.travelReimbursement.invites.length > 0, // Derived property
    groupMembers: user.travelReimbursement.invites.map((invite) => ({
      id: invite.user.id,
      email: invite.user.email,
      name: `${invite.user.ParticipantInfo?.firstName ?? ""} ${
        invite.user.ParticipantInfo?.lastName ?? ""
      }`,
    })),
  };
}

/**
 * User object including necessary relations.
 */
export type UserWithReimbursement = User & {
  ParticipantInfo?: ParticipantInfo | null;
  travelReimbursement?:
    | (TravelReimbursement & {
        creator?: { email: string } | null; // ✅ Ensure `creator` is included
      })
    | null;
  reimbursementInvites: (ReimbursementInvite & {
    reimbursement: {
      id: string;
      userId: string;
      creator?: { email: string } | null;
    };
  })[];
  createdReimbursement:
    | (TravelReimbursement & {
        invites: (ReimbursementInvite & {
          user: {
            email: string;
            ParticipantInfo?: { firstName: string; lastName: string } | null;
          };
        })[];
      })
    | null;
};

/**
 * Fetches the user and includes reimbursement details.
 */
export async function getUserWithReimbursement(): Promise<UserWithReimbursement | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
    include: {
      ParticipantInfo: true,
      travelReimbursement: {
        include: {
          creator: {
            select: { email: true }, // ✅ Fetch the creator's email
          },
        },
      },
      createdReimbursement: {
        // Ensure we fetch the reimbursement the user created
        include: {
          invites: {
            include: {
              user: {
                select: {
                  email: true,
                  ParticipantInfo: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
        },
      },
      reimbursementInvites: {
        include: {
          reimbursement: {
            select: {
              id: true, // ✅ Ensure we fetch the reimbursement ID
              userId: true, // ✅ Fetch the creator's user ID
              creator: {
                select: { email: true }, // ✅ Fetch the creator's email
              },
            },
          },
        },
      },
    },
  });

  return user;
}

/**
 * Get the user's reimbursement summary.
 */
export async function getUserReimbursementStatus() {
  const user = await getUserWithReimbursement();

  if (!user) {
    return {
      user: null,
      hasReimbursement: false,
      reimbursementDate: null,
      isGroupLeader: false,
      pendingInvites: [],
    };
  }

  const hasReimbursement = Boolean(user?.travelReimbursement);
  const reimbursementDate = user.travelReimbursement?.createdAt ?? null;
  const isGroupLeader = user.travelReimbursement?.userId === user.id;
  const pendingInvites = user.reimbursementInvites.filter(
    (invite) => invite.status === "PENDING",
  );

  return {
    user,
    hasReimbursement,
    reimbursementDate,
    isGroupLeader,
    pendingInvites,
  };
}

export async function deleteTravelReimbursement(reimbursementId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Ensure the user is the owner of the reimbursement
  const reimbursement = await prisma.travelReimbursement.findUnique({
    where: { id: reimbursementId },
  });

  if (!reimbursement || reimbursement.userId !== user.id) {
    throw new Error("You do not have permission to delete this reimbursement.");
  }

  // Delete reimbursement
  await prisma.travelReimbursement.delete({
    where: { id: reimbursementId },
  });

  return { success: true };
}

export async function inviteUserToReimbursement(
  reimbursementId: string,
  userId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const invitingUser = await prisma.user.findUnique({
    where: { id: session.session.userId },
    include: { travelReimbursement: true },
  });

  if (
    !invitingUser?.travelReimbursement ||
    invitingUser.travelReimbursement.id !== reimbursementId
  ) {
    throw new Error(
      "You do not have permission to invite members to this reimbursement.",
    );
  }

  const reimbursement = await prisma.travelReimbursement.findUnique({
    where: { id: reimbursementId },
    include: { invites: true, members: true },
  });

  if (!reimbursement) {
    throw new Error("Reimbursement request not found.");
  }

  // Check if the user is already invited
  const alreadyInvited = reimbursement.invites.some(
    (invite) => invite.userId === userId,
  );
  if (alreadyInvited) {
    throw new Error("User has already been invited.");
  }

  // Ensure the user isn't in another reimbursement
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { travelReimbursementId: true },
  });

  if (user?.travelReimbursementId) {
    throw new Error("User is already part of another reimbursement.");
  }

  // Create the invite
  await prisma.reimbursementInvite.create({
    data: {
      userId,
      reimbursementId,
    },
  });

  return { success: true };
}

/**
 * Fetch users who have been invited to a reimbursement request.
 */
export async function getInvitedUsers(reimbursementId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.session.userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.session.userId },
    include: { travelReimbursement: true },
  });

  if (
    !user?.travelReimbursement ||
    user.travelReimbursement.id !== reimbursementId
  ) {
    throw new Error("You do not have permission to view this reimbursement.");
  }

  // Fetch invited users
  const invitedUsers = await prisma.reimbursementInvite.findMany({
    where: { reimbursementId, status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          ParticipantInfo: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
  });

  return invitedUsers.map((invite) => ({
    id: invite.user.id,
    email: invite.user.email,
    name: `${invite.user.ParticipantInfo?.firstName ?? ""} ${
      invite.user.ParticipantInfo?.lastName ?? ""
    }`,
  }));
}
