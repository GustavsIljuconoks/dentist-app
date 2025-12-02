import * as React from "react";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { appointmentService } from "@/services/appointmentService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { AppointmentType } from "@/types/AppointmentType";
import { DEFAULT_DOCTOR_ID } from "@/lib/constants";

interface BookAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BookAppointmentDialog({
    open,
    onOpenChange,
}: BookAppointmentDialogProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<string>("10:00");
    const [type, setType] = useState<number | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availabilityWarning, setAvailabilityWarning] = useState<
        string | null
    >(null);
    const [appointmentType, setAppointmentType] = useState<AppointmentType[]>(
        [],
    );

    useEffect(() => {
        const fetchAppointmentType = async () => {
            try {
                const types = await appointmentService.getAppointmentTypes();
                setAppointmentType(types);
            } catch (err) {
                console.error("Failed to fetch appointment types", err);
            }
        };

        fetchAppointmentType();
    }, []);

    useEffect(() => {
        const checkAvailability = async () => {
            if (!date || !time || !type) {
                setAvailabilityWarning(null);
                return;
            }

            const [hours, minutes] = time.split(":");
            const appointmentDateTime = new Date(date);
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

            const result = await appointmentService.checkAvailability(
                DEFAULT_DOCTOR_ID,
                appointmentDateTime.toISOString(),
                type,
            );

            if (!result.available) {
                setAvailabilityWarning(
                    result.error || "Time slot not available",
                );
            } else {
                setAvailabilityWarning(null);
            }
        };

        checkAvailability();
    }, [date, time, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!date) {
            setError("Please select a date");
            return;
        }

        if (!time) {
            setError("Please select a time");
            return;
        }

        if (!type) {
            setError("Please provide a reason for the appointment");
            return;
        }

        // validate business hours
        const [hours, minutes] = time.split(":");
        const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const startTime = 9 * 60;
        const endTime = 15 * 60;

        if (timeInMinutes < startTime || timeInMinutes >= endTime) {
            setError("Appointments are only available between 9:00 AM and 3:00 PM");
            return;
        }

        // validate weekday
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            setError("Appointments are only available Monday through Friday");
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time
            const [hours, minutes] = time.split(":");
            const appointmentDateTime = new Date(date);
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

            await appointmentService.createAppointment({
                date: appointmentDateTime.toISOString(),
                type: type,
                doctorId: 1, // default doctor for now
            });

            setDate(undefined);
            setTime("10:00");
            setType(0);
            onOpenChange(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to book appointment",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Book an Appointment</DialogTitle>
                    <DialogDescription>
                        Select a date and time for your dental appointment
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="date-picker">Date</Label>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dayOfWeek = date.getDay();
                                    return date < today || dayOfWeek === 0 || dayOfWeek === 6;
                                }}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="time-picker">Time</Label>
                            <Input
                                type="time"
                                id="time-picker"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                min="09:00"
                                max="15:00"
                                className="bg-background"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="reason">Reason for Visit</Label>
                            <Select
                                value={type ? type.toString() : ""}
                                onValueChange={value => setType(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select appointment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {appointmentType.map(type => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.id.toString()}
                                        >
                                            {type.name} ({type.durationMinutes}{" "}
                                            min)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {availabilityWarning && (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                                {availabilityWarning}
                            </div>
                        )}
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !!availabilityWarning}
                        >
                            {isSubmitting ? "Booking..." : "Book Appointment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
