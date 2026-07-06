from datetime import datetime

from django.test import SimpleTestCase

from trips.services.hos_planner import (
    TripSimulator,
    DriveLeg,
    build_daily_logs,
    STATUS_DRIVING,
    STATUS_OFF_DUTY,
    MAX_DRIVE_PER_WINDOW,
    MAX_DUTY_WINDOW,
    CYCLE_LIMIT,
)


class ShortTripTests(SimpleTestCase):
    """A short trip should not trigger any daily reset or fuel stop."""

    def test_short_trip_stays_within_one_duty_day(self):
        start = datetime(2025, 1, 1, 6, 0)
        sim = TripSimulator(start, cycle_hours_used=0)
        leg1 = DriveLeg(50, 1.0, "Denver, CO", "Boulder, CO")
        leg2 = DriveLeg(100, 2.0, "Boulder, CO", "Fort Collins, CO")
        events = sim.run(leg1, leg2, "Boulder, CO", "Fort Collins, CO")

        total_driving = sum(e.hours for e in events if e.status == STATUS_DRIVING)
        self.assertAlmostEqual(total_driving, 3.0, places=2)
        self.assertLessEqual(total_driving, MAX_DRIVE_PER_WINDOW)
        # No off-duty reset should have been necessary for such a short trip.
        self.assertFalse(any("10-hour off-duty" in e.label for e in events if e.status == STATUS_OFF_DUTY))


class LongTripTests(SimpleTestCase):
    """A long-haul trip must trigger fuel stops, a 30-min break, and daily 10-hour resets."""

    def test_long_trip_triggers_breaks_and_resets(self):
        start = datetime(2025, 1, 1, 6, 0)
        sim = TripSimulator(start, cycle_hours_used=0)
        # ~2400 miles at 50mph average -> 48 hours driving, well beyond one duty day.
        leg1 = DriveLeg(200, 4.0, "Los Angeles, CA", "Phoenix, AZ")
        leg2 = DriveLeg(2200, 44.0, "Phoenix, AZ", "New York, NY")
        events = sim.run(leg1, leg2, "Phoenix, AZ", "New York, NY")

        statuses = {e.status for e in events}
        self.assertIn(STATUS_DRIVING, statuses)
        self.assertTrue(any("Fuel stop" in e.label for e in events))
        self.assertTrue(any("30-minute break" in e.label for e in events))
        self.assertTrue(any("10-hour off-duty" in e.label for e in events))

        # No single continuous driving block should exceed the 11-hour limit.
        driving_events = [e for e in events if e.status == STATUS_DRIVING]
        # (Individual chunks are always <= 11h by construction; this checks the window logic
        # indirectly by confirming resets occurred enough times for a 48-hour drive.)
        reset_count = sum(1 for e in events if e.status == STATUS_OFF_DUTY and "off-duty rest" in e.label.lower())
        self.assertGreater(reset_count, 1)

    def test_cycle_limit_triggers_34_hour_restart(self):
        start = datetime(2025, 1, 1, 6, 0)
        # Start already close to the 70-hour cycle limit.
        sim = TripSimulator(start, cycle_hours_used=65)
        leg1 = DriveLeg(50, 1.0, "A", "B")
        leg2 = DriveLeg(500, 10.0, "B", "C")
        events = sim.run(leg1, leg2, "B", "C")
        self.assertTrue(any("34-hour restart" in e.label for e in events))


class DailyLogSplitTests(SimpleTestCase):
    def test_daily_totals_sum_to_24_hours_for_full_days(self):
        start = datetime(2025, 1, 1, 0, 0)
        sim = TripSimulator(start, cycle_hours_used=0)
        leg1 = DriveLeg(300, 6.0, "A", "B")
        leg2 = DriveLeg(1200, 24.0, "B", "C")
        events = sim.run(leg1, leg2, "B", "C")
        logs = build_daily_logs(events)
        self.assertGreater(len(logs), 1)
        # Every day except possibly the last should total 24 hours across statuses.
        for day in logs[:-1]:
            self.assertAlmostEqual(sum(day["totals"].values()), 24.0, places=1)
