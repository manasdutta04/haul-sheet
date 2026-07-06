"""
Hours of Service (HOS) trip planner.

Implements a simplified, documented simulation of 49 CFR Part 395 property-carrying
driver rules (70-hour/8-day cycle, no adverse driving conditions exception), per the
assessment's stated assumptions:

  - Property-carrying driver, 70 hrs / 8 days, no adverse driving conditions
  - Fuel stop at least once every 1,000 miles
  - 1 hour allotted for pickup, 1 hour allotted for drop-off

Rules encoded:
  - 11-hour driving limit per duty day
  - 14-hour on-duty "driving window" per duty day
  - 30-minute break required after 8 cumulative hours of driving
  - 10 consecutive hours off duty required before a new duty/driving window
  - 70-hour / 8-day on-duty limit, reset by a 34-consecutive-hour restart

This is a planning tool, not a legal certification of compliance -- see README.
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional

# ---- Rule constants (all in hours unless noted) -----------------------------------
MAX_DRIVE_PER_WINDOW = 11.0
MAX_DUTY_WINDOW = 14.0
BREAK_REQUIRED_AFTER_DRIVING = 8.0
BREAK_DURATION = 0.5
MIN_OFF_DUTY = 10.0
CYCLE_LIMIT = 70.0
CYCLE_DAYS = 8
RESTART_HOURS = 34.0
FUEL_INTERVAL_MILES = 1000.0
FUEL_STOP_DURATION = 0.5
PICKUP_DURATION = 1.0
DROPOFF_DURATION = 1.0

STATUS_OFF_DUTY = "OFF_DUTY"
STATUS_SLEEPER = "SLEEPER_BERTH"
STATUS_DRIVING = "DRIVING"
STATUS_ON_DUTY = "ON_DUTY_NOT_DRIVING"


@dataclass
class Event:
    status: str
    start: datetime
    end: datetime
    label: str = ""
    location: Optional[str] = None
    miles: float = 0.0

    @property
    def hours(self) -> float:
        return (self.end - self.start).total_seconds() / 3600.0

    def to_dict(self):
        return {
            "status": self.status,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "hours": round(self.hours, 3),
            "label": self.label,
            "location": self.location,
            "miles": round(self.miles, 1),
        }


@dataclass
class DriveLeg:
    """A continuous stretch of driving, e.g. current->pickup or pickup->dropoff."""
    distance_miles: float
    duration_hours: float
    from_label: str
    to_label: str


class TripSimulator:
    def __init__(self, start_datetime: datetime, cycle_hours_used: float):
        self.clock = start_datetime
        self.cycle_hours_used = cycle_hours_used  # hours already on-duty in the rolling 8-day window
        self.drive_hours_window = 0.0   # driving hours used within current 11-hour limit
        self.duty_hours_window = 0.0    # on-duty hours used within current 14-hour window
        self.driving_since_break = 0.0  # driving hours since last 30-min break
        self.distance_since_fuel = 0.0
        self.events: list[Event] = []
        self.total_miles = 0.0

    # -- internal helpers -----------------------------------------------------------
    def _push(self, status, hours, label="", location=None, miles=0.0):
        if hours <= 1e-6:
            return
        start = self.clock
        end = start + timedelta(hours=hours)
        self.events.append(Event(status, start, end, label, location, miles))
        self.clock = end

    def _take_off_duty(self, hours, label):
        self._push(STATUS_OFF_DUTY, hours, label)
        self.drive_hours_window = 0.0
        self.duty_hours_window = 0.0
        self.driving_since_break = 0.0

    def _take_restart(self):
        self._push(STATUS_OFF_DUTY, RESTART_HOURS, "34-hour restart (resets 70-hr/8-day cycle)")
        self.drive_hours_window = 0.0
        self.duty_hours_window = 0.0
        self.driving_since_break = 0.0
        self.cycle_hours_used = 0.0

    def _non_driving_on_duty(self, hours, label, location=None):
        """Add on-duty-not-driving time (pickup, drop-off, fueling), inserting rest first if needed."""
        remaining = hours
        while remaining > 1e-6:
            room_window = MAX_DUTY_WINDOW - self.duty_hours_window
            room_cycle = CYCLE_LIMIT - self.cycle_hours_used
            if room_cycle <= 1e-6:
                self._take_restart()
                continue
            if room_window <= 1e-6:
                self._take_off_duty(MIN_OFF_DUTY, "Required 10-hour off-duty reset")
                continue
            chunk = min(remaining, room_window, room_cycle)
            self._push(STATUS_ON_DUTY, chunk, label, location)
            self.duty_hours_window += chunk
            self.cycle_hours_used += chunk
            remaining -= chunk

    def _drive(self, leg: DriveLeg):
        remaining_distance = leg.distance_miles
        remaining_duration = leg.duration_hours
        label = f"Driving: {leg.from_label} -> {leg.to_label}"
        # Guard against runaway loops on pathological inputs.
        for _ in range(2000):
            if remaining_duration <= 1e-6:
                return
            speed = remaining_distance / remaining_duration if remaining_duration > 0 else 0

            room_fuel = ((FUEL_INTERVAL_MILES - self.distance_since_fuel) / speed) if speed > 1e-6 else float("inf")
            room_break = BREAK_REQUIRED_AFTER_DRIVING - self.driving_since_break
            room_drive_window = MAX_DRIVE_PER_WINDOW - self.drive_hours_window
            room_duty_window = MAX_DUTY_WINDOW - self.duty_hours_window
            room_cycle = CYCLE_LIMIT - self.cycle_hours_used

            constraints = {
                "fuel": room_fuel,
                "break": room_break,
                "drive_window": room_drive_window,
                "duty_window": room_duty_window,
                "cycle": room_cycle,
            }
            binding, room = min(constraints.items(), key=lambda kv: kv[1])
            chunk = max(0.0, min(remaining_duration, room))

            if chunk > 1e-6:
                miles_driven = chunk * speed
                self._push(STATUS_DRIVING, chunk, label, miles=miles_driven)
                self.total_miles += miles_driven
                remaining_duration -= chunk
                remaining_distance -= miles_driven
                self.distance_since_fuel += miles_driven
                self.driving_since_break += chunk
                self.drive_hours_window += chunk
                self.duty_hours_window += chunk
                self.cycle_hours_used += chunk

            if remaining_duration <= 1e-6:
                return

            # Resolve whichever limit is now binding.
            if binding == "fuel":
                self._non_driving_on_duty(FUEL_STOP_DURATION, "Fuel stop")
                self.distance_since_fuel = 0.0
            elif binding == "break":
                self._push(STATUS_OFF_DUTY, BREAK_DURATION, "Required 30-minute break")
                self.duty_hours_window += BREAK_DURATION
                self.driving_since_break = 0.0
            elif binding == "cycle":
                self._take_restart()
            else:  # drive_window or duty_window exhausted -> daily reset
                self._take_off_duty(MIN_OFF_DUTY, "Required 10-hour off-duty rest (end of duty day)")
        raise RuntimeError("HOS simulation did not converge - check inputs")

    def run(self, leg1: DriveLeg, leg2: DriveLeg, pickup_location: str, dropoff_location: str):
        self._drive(leg1)
        self._non_driving_on_duty(PICKUP_DURATION, "Pickup", pickup_location)
        self._drive(leg2)
        self._non_driving_on_duty(DROPOFF_DURATION, "Drop-off", dropoff_location)
        return self.events


def split_events_by_day(events: list[Event]):
    """Split events that cross midnight so each daily log sheet only contains its own day."""
    days = {}
    for ev in events:
        cursor = ev.start
        while cursor < ev.end:
            day_key = cursor.date().isoformat()
            next_midnight = datetime.combine(cursor.date() + timedelta(days=1), datetime.min.time())
            segment_end = min(ev.end, next_midnight)
            days.setdefault(day_key, []).append(
                Event(ev.status, cursor, segment_end, ev.label, ev.location, 0.0)
            )
            cursor = segment_end
    return days


def build_daily_logs(events: list[Event]):
    days = split_events_by_day(events)
    logs = []
    for day_key in sorted(days.keys()):
        segs = days[day_key]
        totals = {STATUS_OFF_DUTY: 0.0, STATUS_SLEEPER: 0.0, STATUS_DRIVING: 0.0, STATUS_ON_DUTY: 0.0}
        grid_segments = []
        for s in segs:
            midnight = datetime.combine(s.start.date(), datetime.min.time())
            start_hr = (s.start - midnight).total_seconds() / 3600.0
            end_hr = (s.end - midnight).total_seconds() / 3600.0
            totals[s.status] += (end_hr - start_hr)
            grid_segments.append({
                "status": s.status,
                "start_hour": round(start_hr, 3),
                "end_hour": round(end_hr, 3),
                "label": s.label,
                "location": s.location,
            })
        remarks = [
            {"hour": round((s.start - datetime.combine(s.start.date(), datetime.min.time())).total_seconds() / 3600.0, 2),
             "text": s.location or s.label}
            for s in segs if s.location
        ]
        logs.append({
            "date": day_key,
            "segments": grid_segments,
            "totals": {k: round(v, 2) for k, v in totals.items()},
            "remarks": remarks,
        })
    return logs
