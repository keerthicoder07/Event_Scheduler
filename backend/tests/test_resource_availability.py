
import unittest
from datetime import datetime, timedelta
import sys
import os

# Add backend directory to path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db, Resource, Event, EventResourceAllocation, check_conflict

class TestResourceAvailability(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app
        self.client = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

        # Create a test resource
        self.resource = Resource(resource_name="Test Room", resource_type="Room")
        db.session.add(self.resource)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def create_event_allocation(self, start, end):
        event = Event(
            title="Existing Event",
            start_time=start,
            end_time=end,
            description="Test"
        )
        db.session.add(event)
        db.session.commit()
        
        allocation = EventResourceAllocation(event_id=event.event_id, resource_id=self.resource.resource_id)
        db.session.add(allocation)
        db.session.commit()
        return event

    def test_allocate_immediately_after_event_ends(self):
        """Test that a new event can start at the exact same second an existing event ends."""
        # Event A: 10:00 - 11:00
        start_a = datetime(2023, 10, 27, 10, 0, 0)
        end_a = datetime(2023, 10, 27, 11, 0, 0)
        self.create_event_allocation(start_a, end_a)

        # Event B: 11:00 - 12:00
        start_b = end_a
        end_b = datetime(2023, 10, 27, 12, 0, 0)
        
        # Check conflict
        conflict, _ = check_conflict(self.resource.resource_id, start_b, end_b)
        self.assertFalse(conflict, "Should be able to book immediately after previous event ends")

    def test_allocate_immediately_before_event_starts(self):
        """Test that a new event can end at the exact same second an existing event starts."""
        # Event A: 10:00 - 11:00
        start_a = datetime(2023, 10, 27, 10, 0, 0)
        end_a = datetime(2023, 10, 27, 11, 0, 0)
        self.create_event_allocation(start_a, end_a)

        # Event C: 09:00 - 10:00
        start_c = datetime(2023, 10, 27, 9, 0, 0)
        end_c = start_a
        
        # Check conflict
        conflict, _ = check_conflict(self.resource.resource_id, start_c, end_c)
        self.assertFalse(conflict, "Should be able to book immediately before next event starts")

    def test_overlap_is_blocked(self):
        """Test that overlapping events are blocked."""
        # Event A: 10:00 - 11:00
        start_a = datetime(2023, 10, 27, 10, 0, 0)
        end_a = datetime(2023, 10, 27, 11, 0, 0)
        self.create_event_allocation(start_a, end_a)

        # Event D: 10:30 - 11:30
        start_d = datetime(2023, 10, 27, 10, 30, 0)
        end_d = datetime(2023, 10, 27, 11, 30, 0)
        
        # Check conflict
        conflict, _ = check_conflict(self.resource.resource_id, start_d, end_d)
        self.assertTrue(conflict, "Overlapping events should be blocked")

if __name__ == '__main__':
    unittest.main()
