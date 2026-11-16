"use server";

import {
  eachHourOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfHour,
} from "date-fns";
import { db } from "@/lib/db";

export async function getAnalyticsData(
  startDate: Date,
  endDate: Date,
  aggregation: "hourly" | "daily",
) {
  const users = await db.query.participantInfo.findMany({
    where: {
      createdAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
    },
    columns: { createdAt: true },
  });

  const checkins = await db.query.checkin.findMany({
    where: {
      createdAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) },
    },
    columns: { createdAt: true },
  });

  if (aggregation === "hourly") {
    const hourlyCounts: Record<
      string,
      { registrations: number; checkins: number }
    > = {};

    for (const hour of eachHourOfInterval({ start: startDate, end: endDate })) {
      const hourStr = format(hour, "yyyy-MM-dd HH:00");
      hourlyCounts[hourStr] = { registrations: 0, checkins: 0 };
    }

    for (const user of users) {
      const hourStr = format(startOfHour(user.createdAt), "yyyy-MM-dd HH:00");
      if (hourlyCounts[hourStr]) {
        hourlyCounts[hourStr].registrations++;
      }
    }

    for (const checkin of checkins) {
      const hourStr = format(
        startOfHour(checkin.createdAt),
        "yyyy-MM-dd HH:00",
      );
      if (hourlyCounts[hourStr]) {
        hourlyCounts[hourStr].checkins++;
      }
    }

    return Object.entries(hourlyCounts).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  // Fallback to daily aggregation if not hourly

  const dailyCounts: Record<
    string,
    { registrations: number; checkins: number }
  > = {};

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    dailyCounts[dateStr] = { registrations: 0, checkins: 0 };
  }

  for (const user of users) {
    const dateStr = format(user.createdAt, "yyyy-MM-dd");
    if (dailyCounts[dateStr]) {
      dailyCounts[dateStr].registrations++;
    }
  }

  for (const checkin of checkins) {
    const dateStr = format(checkin.createdAt, "yyyy-MM-dd");
    if (dailyCounts[dateStr]) {
      dailyCounts[dateStr].checkins++;
    }
  }

  return Object.entries(dailyCounts).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

export async function getEventCheckinCounts() {
  const eventsWithCheckins = await db.query.event.findMany({
    orderBy: { startDate: "asc" },
    columns: {
      id: true,
      name: true,
      startDate: true,
    },
    with: {
      checkins: {
        columns: {
          id: true,
        },
      },
    },
  });

  return eventsWithCheckins.map((event) => ({
    name: event.name,
    startTime: event.startDate,
    checkins: event.checkins.length,
  }));
}
