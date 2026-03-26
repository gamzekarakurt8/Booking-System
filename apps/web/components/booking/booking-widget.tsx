"use client";

import {
  availableSessionsResponseSchema,
  bookingResponseSchema,
  type BookingResponse,
  type SessionSlot,
} from "@booking/shared";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Instagram, Linkedin, Twitter } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { toISODateString } from "../../lib/date";
import { showToast } from "../../lib/toast";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

type BookingWidgetProps = {
  token: string;
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildMonthCells(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < start.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  return cells;
}

function formatTimeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function BookingWidget({ token }: BookingWidgetProps) {
  const tomorrow = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    return normalizeDay(value);
  }, []);

  const [timezone, setTimezone] = useState("UTC");
  const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1),
  );
  const [slots, setSlots] = useState<SessionSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SessionSlot | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingResponse | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  }, []);

  const fetchAvailableSlots = useCallback(
    async (options?: { resetSelection?: boolean; silent?: boolean }) => {
      const resetSelection = options?.resetSelection ?? false;
      const silent = options?.silent ?? false;

      if (resetSelection) {
        setSelectedSlot(null);
      }

      if (!silent) {
        setIsLoadingSlots(true);
      }

      try {
        const queryDate = toISODateString(selectedDate);
        const response = await apiRequest<undefined, ReturnType<typeof availableSessionsResponseSchema.parse>>(
          `/bookings/available?date=${queryDate}&timezone=${encodeURIComponent(timezone)}`,
          {
            token,
            schema: availableSessionsResponseSchema,
          },
        );

        setSlots(response.slots);

        setSelectedSlot((currentSelectedSlot) => {
          if (!currentSelectedSlot) {
            return currentSelectedSlot;
          }

          const stillAvailable = response.slots.some((slot) => slot.start === currentSelectedSlot.start);

          if (!stillAvailable) {
            showToast({
              message: "Selected slot is no longer available.",
              variant: "info",
            });
            return null;
          }

          return currentSelectedSlot;
        });
      } catch (requestError) {
        if (!silent) {
          setSlots([]);
          showToast({
            message: requestError instanceof Error ? requestError.message : "Unable to load sessions",
            variant: "error",
          });
        }
      } finally {
        if (!silent) {
          setIsLoadingSlots(false);
        }
      }
    },
    [selectedDate, timezone, token],
  );

  useEffect(() => {
    void fetchAvailableSlots({ resetSelection: true, silent: false });
  }, [fetchAvailableSlots]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchAvailableSlots({ resetSelection: false, silent: true });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchAvailableSlots]);

  async function handleBooking() {
    if (!selectedSlot) {
      return;
    }

    setIsBooking(true);

    try {
      const response = await apiRequest<{ sessionStart: string; timezone: string }, BookingResponse>("/bookings", {
        method: "POST",
        token,
        body: {
          sessionStart: selectedSlot.start,
          timezone,
        },
        schema: bookingResponseSchema,
      });

      setBookingConfirmation(response);
      setSelectedSlot(null);

      await fetchAvailableSlots({ resetSelection: true, silent: false });
    } catch (requestError) {
      showToast({
        message: requestError instanceof Error ? requestError.message : "Booking failed",
        variant: "error",
      });
    } finally {
      setIsBooking(false);
    }
  }

  const today = normalizeDay(new Date());
  const monthCells = useMemo(() => buildMonthCells(monthCursor), [monthCursor]);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  return (
    <section className="grid gap-5 lg:grid-cols-[440px_1fr]">
      <div className="space-y-4">
        <article className="rounded-2xl border border-[#e7e7e7] bg-[#f4f4f4] p-6 shadow-card">
          <h2 className="text-right font-serif text-4xl text-ink">Available days</h2>
          <p className="mt-1 text-right text-sm text-ink/70">
            Session duration is 60 minutes, pre-defined by the consultant.
          </p>

          <div className="mt-5 flex items-center justify-between">
            <Button
              variant="ghost"
              className="rounded-full border border-ink/20 p-2"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
              type="button"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-xl font-bold text-ink">{monthLabel}</p>
            <Button
              variant="ghost"
              className="rounded-full border border-ink/20 p-2"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
              type="button"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-ink/70">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {monthCells.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} className="h-10 rounded-xl" />;
              }

              const normalized = normalizeDay(date);
              const isPast = normalized < today;
              const isSelected = normalized.getTime() === selectedDate.getTime();

              return (
                <button
                  key={date.toISOString()}
                  className={clsx(
                    "h-10 rounded-xl text-sm font-semibold transition",
                    isSelected && "bg-[#2270d8] text-white",
                    !isSelected && !isPast && "bg-white text-ink hover:bg-[#dbe8fb]",
                    isPast && "cursor-not-allowed bg-white/45 text-ink/30",
                  )}
                  disabled={isPast}
                  onClick={() => {
                    setSelectedDate(normalized);
                    setMonthCursor(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
                  }}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e7e7e7] bg-[#f4f4f4] p-6 shadow-card">
          <h3 className="text-right font-serif text-4xl text-ink">Available times</h3>
          <p className="mt-1 text-right text-sm text-ink/70">Booking will use your current timezone.</p>
          <p className="mt-1 text-right text-xs font-medium text-ink/55">{timezone}</p>
          <p className="mt-1 text-right text-xs text-[#1767cc]">Live updates every 15 seconds.</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {isLoadingSlots ? (
              <p className="col-span-full text-sm text-ink/70">Loading slots...</p>
            ) : null}

            {!isLoadingSlots && slots.length === 0 ? (
              <p className="col-span-full text-sm text-ink/70">No sessions available for this date.</p>
            ) : null}

            {!isLoadingSlots
              ? slots.map((slot) => {
                  const isSelected = selectedSlot?.start === slot.start;

                  return (
                    <button
                      key={slot.start}
                      className={clsx(
                        "rounded-xl border px-3 py-3 text-sm font-semibold text-ink transition",
                        isSelected ? "border-[#2270d8] bg-[#2270d8] text-white" : "border-ink/25 bg-white hover:bg-[#ebf2ff]",
                      )}
                      onClick={() => setSelectedSlot(slot)}
                      type="button"
                    >
                      {formatTimeLabel(slot.start)}
                    </button>
                  );
                })
              : null}
          </div>

          <Button
            className="mt-6 w-full bg-[#1767cc] text-white hover:bg-[#1259b2]"
            disabled={!selectedSlot || isBooking}
            onClick={handleBooking}
            type="button"
          >
            {isBooking ? "Booking..." : "Book Session"}
          </Button>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-[#f4f4f4] shadow-card">
        <div className="flex flex-col gap-5 p-6 lg:flex-row-reverse lg:items-center lg:justify-between">
          <div className="mx-auto h-40 w-40 rounded-full bg-[linear-gradient(140deg,#dec8ef,#f5dde7)] p-1 lg:mx-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-5xl font-bold text-[#7d5a8c]">
              SA
            </div>
          </div>

          <div className="text-center lg:text-right">
            <h3 className="font-serif text-4xl text-ink">Sarah Ahmed</h3>
            <p className="mt-2 max-w-2xl text-sm text-ink/80">
              Founder and technology advisor with 35 years of business experience, mentoring teams across product,
              growth and digital operations.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 lg:justify-end">
              <button className="rounded-md border border-ink/20 bg-white p-2 text-ink/80" type="button" aria-label="LinkedIn">
                <Linkedin className="size-4" />
              </button>
              <button className="rounded-md border border-ink/20 bg-white p-2 text-ink/80" type="button" aria-label="Instagram">
                <Instagram className="size-4" />
              </button>
              <button className="rounded-md border border-ink/20 bg-white p-2 text-ink/80" type="button" aria-label="Twitter">
                <Twitter className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-lg font-semibold text-ink">Available for sessions</p>
          </div>
        </div>

        <div className="border-t border-[#e1e1e1] p-6 text-ink">
          <h4 className="text-xl font-semibold">Profile Overview</h4>
          <p className="mt-2 text-sm leading-7 text-ink/85">
            Specialized in digital product leadership and practical business strategy. I help founders and operators
            turn complex ideas into clear action plans with measurable outcomes.
          </p>

          <h5 className="mt-4 text-lg font-semibold">Topics I Can Help With</h5>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-ink/85">
            <li>E-commerce subscriptions</li>
            <li>Digital marketplace execution</li>
            <li>SaaS product design and launch planning</li>
            <li>Early-stage investment readiness</li>
            <li>Sustainable growth strategies</li>
            <li>Community and brand building</li>
          </ul>

          <p className="mt-5 text-sm leading-7 text-ink/85">
            I enjoy supporting ambitious founders and teams, especially those building their first scalable systems.
          </p>
        </div>
      </article>

      <Modal title="Booking confirmed" isOpen={Boolean(bookingConfirmation)} onClose={() => setBookingConfirmation(null)}>
        <p>{bookingConfirmation?.message}</p>
        <p>
          Start:{" "}
          {bookingConfirmation
            ? new Date(bookingConfirmation.booking.sessionStart).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
        <p>Duration: {bookingConfirmation?.booking.durationMinutes} minutes</p>
      </Modal>
    </section>
  );
}
