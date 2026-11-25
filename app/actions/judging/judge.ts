"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import constants from "@/constants";
import {
  project as projectTable,
  projectVisit as projectVisitTable,
} from "@/db/schema";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function getNextProject() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
    with: {
      currentlyJudgingProject: true,
      sponsorAssignment: true,
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  if (judgeInfo.track === null) {
    if (judgeInfo.sponsorAssignment) {
      // In a transaction, find the next project that is participating in this challenge, lock it, and return it. Retry if the lock fails. If n retries fail, error and inform client to try again soon.
    } else {
      throw new Error(
        "Judge does not have a track or sponsor challenge assigned.",
      );
    }
  }
  if (judgeInfo.currentlyJudgingProject) {
    return judgeInfo.currentlyJudgingProject;
  }
  // TODO: In a transaction, use the algorithm to find the next project for this judge, lock it, and return it. Retry if the lock fails. If n retries fail, error and inform client to try again soon.
}

// export async function startJudgingProject({
//   projectId,
// }: {
//   projectId: string;
// }) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//     query: { disableCookieCache: true },
//   });
//   if (!session) {
//     throw new Error("Not authenticated");
//   }
//   await hasPermissions(session, { judging: ["participate"] });
//   const judgeInfo = await db.query.judgeInfo.findFirst({
//     where: {
//       userId: session.session.userId,
//     },
//   });
//   if (!judgeInfo) {
//     throw new Error("Judge info not found");
//   }
//   if (judgeInfo.track === null) {
//     throw new Error("Judge does not have a track assigned");
//   }
//   const project = await db.query.project.findFirst({
//     where: {
//       id: projectId,
//     },
//   });
//   if (!project) {
//     throw new Error("Project not found");
//   }
//   if (project.isAbsent) {
//     throw new Error("Project is marked as absent");
//   }
//   if (project.track !== judgeInfo.track) {
//     throw new Error("Judge is not assigned to the project's track");
//   }
//   if (
//     project.currentJudgeId !== null &&
//     project.judgeLockExpiresAt &&
//     project.judgeLockExpiresAt > new Date()
//   ) {
//     throw new Error("Project is currently locked by another judge");
//   }
//   const result = await db.transaction(async (tx) => {
//     const projectResult = await tx
//       .update(projectTable)
//       .set({
//         currentJudgeId: session.session.userId,
//         judgeLockExpiresAt: new Date(Date.now() + constants.judgeLockDuration),
//       })
//       .where(
//         and(
//           eq(projectTable.id, projectId),
//           isNull(projectTable.currentJudgeId),
//         ),
//       )
//       .returning({
//         id: projectTable.id,
//         currentJudgeId: projectTable.currentJudgeId,
//         judgeLockExpiresAt: projectTable.judgeLockExpiresAt,
//       });
//     if (projectResult[0].currentJudgeId !== session.session.userId) {
//       tx.rollback();
//       return false;
//     }
//     await tx.insert(projectVisitTable).values({
//       previousProjectId: null,
//       currentProjectId: projectId,
//       judgeId: session.session.userId,
//     });
//   });
//   if (!result) {
//     throw new Error(
//       "Failed to lock project for judging. It may be locked by another judge.",
//     );
//   }
// }

export async function unlockProject({ projectId }: { projectId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  const project = await db.query.project.findFirst({
    where: {
      id: projectId,
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  if (project.currentJudgeId !== session.session.userId) {
    throw new Error("Judge is not assigned to this project");
  }
  const projectVisit = await db.query.projectVisit.findFirst({
    where: {
      currentProjectId: projectId,
      judgeId: session.session.userId,
    },
  });
  if (!projectVisit) {
    throw new Error("Project visit not found");
  }
  if (projectVisit.status !== "BUSY") {
    throw new Error("Project visit not in a busy state");
  }
  await db.transaction(async (tx) => {
    await tx
      .update(projectTable)
      .set({
        currentJudgeId: null,
        judgeLockExpiresAt: null,
      })
      .where(eq(projectTable.id, projectId));
    await tx
      .update(projectVisitTable)
      .set({
        status: "COMPLETED",
      })
      .where(eq(projectVisitTable.currentProjectId, projectId));
  });
}

export async function markProjectAbsent({ projectId }: { projectId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  const project = await db.query.project.findFirst({
    where: {
      id: projectId,
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  if (project.isAbsent) {
    throw new Error("Project is already marked as absent");
  }
  if (project.currentJudgeId !== session.session.userId) {
    throw new Error("Judge is not assigned to this project");
  }
  const projectVisit = await db.query.projectVisit.findFirst({
    where: {
      currentProjectId: projectId,
      judgeId: session.session.userId,
    },
  });
  if (!projectVisit) {
    throw new Error("Project visit not found");
  }
  if (projectVisit.status !== "BUSY") {
    throw new Error("Project visit not in a busy state");
  }
  // TODO: Discuss whether just one judge can mark a project as absent, or if two judges need to mark it as absent before it is considered absent
  await db.transaction(async (tx) => {
    await tx
      .update(projectTable)
      .set({
        currentJudgeId: null,
        judgeLockExpiresAt: null,
        isAbsent: true,
      })
      .where(eq(projectTable.id, projectId));
    await tx
      .update(projectVisitTable)
      .set({
        status: "ABSENT",
      })
      .where(eq(projectVisitTable.currentProjectId, projectId));
  });
}

export async function judgeProject({
  previousProjectId,
  currentProjectId,
  rating,
  comment,
  challengeRatings,
}: {
  previousProjectId: string | null;
  currentProjectId: string;
  rating: number | null;
  comment: string | null;
  challengeRatings: Record<string, number> | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  if (judgeInfo.track === null) {
    throw new Error("Judge does not have a track assigned");
  }
  const currentProject = await db.query.project.findFirst({
    where: {
      id: currentProjectId,
    },
  });
  if (!currentProject) {
    throw new Error("Current project not found");
  }
  if (currentProject.currentJudgeId !== session.session.userId) {
    throw new Error("Judge is not assigned to this current project");
  }
  if (currentProject.track !== judgeInfo.track) {
    throw new Error("Judge is not assigned to the current project's track");
  }
  const projectVisit = await db.query.projectVisit.findFirst({
    where: {
      currentProjectId,
      judgeId: session.session.userId,
    },
  });
  if (!projectVisit) {
    throw new Error("Project visit not found");
  }
  if (projectVisit.status !== "BUSY") {
    throw new Error("Project visit not in a busy state");
  }
  if (previousProjectId) {
    // TODO: This should attempt to find the most recent project visit for this judge that wasn't an absent project, and ensure that the previousProjectId matches that project. This is to prevent a judge from skipping projects and judging them out of order.
    const previousProject = await db.query.projectVisit.findFirst({
      where: {
        currentProjectId: previousProjectId,
        judgeId: session.session.userId,
      },
    });
    if (!previousProject) {
      throw new Error("Previous project visit not found");
    }
    if (previousProject.status !== "COMPLETED") {
      throw new Error("Previous project visit not in a completed state");
    }
  }
  await db.transaction(async (tx) => {
    await tx
      .update(projectTable)
      .set({
        currentJudgeId: null,
        judgeLockExpiresAt: null,
      })
      .where(eq(projectTable.id, currentProjectId));
    await tx
      .update(projectVisitTable)
      .set({
        status: "COMPLETED",
        previousProjectId,
        rating,
        comment,
        challengeRatings,
      })
      .where(eq(projectVisitTable.currentProjectId, currentProjectId));
  });
}

export async function getJudgePodium() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
    with: {
      judgePodiums: {
        with: {
          project: {
            columns: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
      },
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  return judgeInfo.judgePodiums;
}

export async function generateJudgePodium() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Not authenticated");
  }
  await hasPermissions(session, { judging: ["participate"] });
  const judgeInfo = await db.query.judgeInfo.findFirst({
    where: {
      userId: session.session.userId,
    },
  });
  if (!judgeInfo) {
    throw new Error("Judge info not found");
  }
  // TODO: Implement the logic to generate a judge podium based on the judge's visits and ratings.
}
