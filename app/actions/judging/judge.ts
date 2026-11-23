"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import constants from "@/constants";
import {
  project as projectTable,
  projectVisit as projectVisitTable,
} from "@/db/schema";
import { auth, hasPermissions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

export async function startJudgingProject({
  projectId,
}: {
  projectId: string;
}) {
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
  if (judgeInfo.track === null) {
    throw new Error("Judge does not have a track assigned");
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
    throw new Error("Project is marked as absent");
  }
  if (project.track !== judgeInfo.track) {
    throw new Error("Judge is not assigned to the project's track");
  }
  if (
    project.currentJudgeId !== null &&
    project.judgeLockExpiresAt &&
    project.judgeLockExpiresAt > new Date()
  ) {
    throw new Error("Project is currently locked by another judge");
  }
  await db.transaction(async (tx) => {
    await tx.update(projectTable).set({
      currentJudgeId: session.session.userId,
      judgeLockExpiresAt: new Date(Date.now() + constants.judgeLockDuration),
    });
    await tx.insert(projectVisitTable).values({
      previousProjectId: null,
      currentProjectId: projectId,
      judgeId: session.session.userId,
    });
  });
}

export async function unlockProject({ projectId }: { projectId: string }) {
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
    await tx.update(projectTable).set({
      currentJudgeId: null,
      judgeLockExpiresAt: null,
    });
    await tx.update(projectVisitTable).set({
      status: "COMPLETED",
    });
  });
}

export async function markProjectAbsent({ projectId }: { projectId: string }) {
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
    await tx.update(projectTable).set({
      currentJudgeId: null,
      judgeLockExpiresAt: null,
      isAbsent: true,
    });
    await tx.update(projectVisitTable).set({
      status: "ABSENT",
    });
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
    const previousProject = await db.query.project.findFirst({
      where: {
        id: previousProjectId,
      },
    });
    if (!previousProject) {
      throw new Error("Previous project not found");
    }
    if (previousProject.track !== judgeInfo.track) {
      throw new Error("Judge is not assigned to the previous project's track");
    }
    if (previousProject.currentJudgeId !== session.session.userId) {
      throw new Error("Judge is not assigned to the previous project");
    }
  }
  await db.transaction(async (tx) => {
    await tx.update(projectTable).set({
      currentJudgeId: null,
      judgeLockExpiresAt: null,
    });
    await tx
      .update(projectVisitTable)
      .set({
        previousProjectId,
        rating,
        comment,
        challengeRatings,
      })
      .where(eq(projectVisitTable.currentProjectId, currentProjectId));
  });
}
