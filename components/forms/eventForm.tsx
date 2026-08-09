"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createEvent } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TimeInput } from "../customui/TimeInput";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Event name must be at least 2 characters." }),
  date: z.enum(["2026-04-17", "2026-04-18", "2026-04-19"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  duration: z.coerce.number().min(0.5).max(12),
  location: z.string().optional(),
  description: z.string(),
  eventType: z.enum(["FOOD", "REQUIRED", "WORKSHOPS", "SPONSOR", "ACTIVITIES"]),
});

// Infer separate input and output types for Zod coercion handling
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function EventForm() {
  const router = useRouter();

  // Supply both FormInput and FormOutput generics to useForm
  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: "2026-04-17",
      startTime: "12:00",
      duration: 1,
      location: "",
      description: "",
      eventType: "FOOD",
    },
  });

  const onSubmit = async (data: FormOutput) => {
    try {
      const eventStart = createDateTime(data.date, data.startTime);
      const eventEnd = calculateEndTime(eventStart, data.duration);

      await createEvent({
        name: data.name,
        startDate: eventStart.toISOString(),
        endDate: eventEnd.toISOString(),
        location: data.location || "",
        description: data.description,
        eventType: data.eventType,
      });

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const createDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  const calculateEndTime = (startDateTime: Date, durationInHours: number) => {
    const endDateTime = new Date(startDateTime);
    const durationInMinutes = Math.round(durationInHours * 60);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationInMinutes);
    return endDateTime;
  };

  return (
    <div className="flex justify-center">
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4 text-center bg-green-400">
          Create New Event
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-1">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the event" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Type */}
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="border rounded p-2 w-full bg-background text-foreground">
                        <option value="FOOD">Food</option>
                        <option value="REQUIRED">Required</option>
                        <option value="WORKSHOPS">Workshops</option>
                        <option value="SPONSOR">Sponsor</option>
                        <option value="ACTIVITIES">Activities</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Time */}
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2026-04-17" id="friday" />
                          <FormLabel htmlFor="friday" className="text-sm font-normal cursor-pointer">
                            Friday, 17th
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2026-04-18" id="saturday" />
                          <FormLabel htmlFor="saturday" className="text-sm font-normal cursor-pointer">
                            Saturday, 18th
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2026-04-19" id="sunday" />
                          <FormLabel htmlFor="sunday" className="text-sm font-normal cursor-pointer">
                            Sunday, 19th
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Start Time and Duration */}
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <TimeInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Enter duration in hours"
                          {...field}
                          value={(field.value as string | number | null) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full">
              <Button
                className="bg-blue-600 text-white w-full rounded hover:bg-blue-700"
                type="submit"
                disabled={form.formState.isSubmitting}>
                Create Event
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}