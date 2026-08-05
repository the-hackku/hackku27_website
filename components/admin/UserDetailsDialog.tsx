"use client";

import { IconLoader } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getUserById } from "@/app/actions/admin";
import LocalDateTime from "@/components/LocalDateTime";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "@/prisma/generated/browser";

interface UserDetailsDialogProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

export function UserDetailsDialog({
  userId,
  onOpenChange,
}: UserDetailsDialogProps) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          const user = await getUserById(userId);

          setUserDetails(user);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          setUserDetails(null);
        }
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <Dialog open={Boolean(userId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center">
            <IconLoader size={24} className="animate-spin mx-auto" />
          </div>
        ) : userDetails ? (
          <>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Basic Information{" "}
                    {userDetails.ParticipantInfo ? (
                      ""
                    ) : (
                      <span className="text-sm text-red-400">
                        - NOT REGISTERED
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Name"
                    value={userDetails.name || "No Name Found"}
                  />
                  <InfoItem label="Email" value={userDetails.email} />
                  <InfoItem
                    label="Role"
                    value={<Badge variant="outline">{userDetails.role}</Badge>}
                  />
                  <InfoItem
                    label="Total Check-ins"
                    value={userDetails.checkins.length}
                  />
                </CardContent>
              </Card>

              {userDetails.ParticipantInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Participant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {Object.entries(userDetails.ParticipantInfo)
                      .filter(
                        ([key, value]) =>
                          value &&
                          value !== "N/A" &&
                          !["id", "userId", "updatedAt"].includes(key),
                      )
                      .map(([key, value]) => (
                        <InfoItem key={key} label={key} value={String(value)} />
                      ))}
                  </CardContent>
                </Card>
              )}

              {userDetails.TravelReimbursement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reimbursement Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {Object.entries(userDetails.TravelReimbursement)
                      .filter(([key]) => key !== "id" && key !== "userId")
                      .map(([key, value]) => (
                        <InfoItem
                          key={key}
                          label={key}
                          value={
                            key === "createdAt" ? (
                              <LocalDateTime
                                dateString={String(value)}
                                showTime
                              />
                            ) : (
                              String(value)
                            )
                          }
                        />
                      ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Check-in History</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.checkins.length > 0 ? (
                    userDetails.checkins.map((checkin) => (
                      <div key={checkin.id} className="border p-4 rounded">
                        <InfoItem label="Event" value={checkin.event.name} />
                        <InfoItem
                          label="Date"
                          value={
                            <LocalDateTime
                              dateString={checkin.createdAt}
                              showTime
                            />
                          }
                        />
                        {checkin.event.location && (
                          <InfoItem
                            label="Location"
                            value={checkin.event.location}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No check-in history</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center">User not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
