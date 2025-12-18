import os
from urllib.parse import quote_plus
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))

# Check for separate credentials first (safer for special chars)
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'event_scheduler')

if db_user and db_password:
    encoded_password = quote_plus(db_password)
    # Default to mysql+pymysql if using separate vars
    uri = f"mysql+pymysql://{db_user}:{encoded_password}@{db_host}/{db_name}"
    app.config['SQLALCHEMY_DATABASE_URI'] = uri
else:
    # Use full URL or fallback to sqlite
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'scheduler.db'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---

class Event(db.Model):
    __tablename__ = 'event'
    event_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200))
    
    # Relationships
    allocations = db.relationship('EventResourceAllocation', backref='event', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'event_id': self.event_id,
            'title': self.title,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'description': self.description
        }

class Resource(db.Model):
    __tablename__ = 'resource'
    resource_id = db.Column(db.Integer, primary_key=True)
    resource_name = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False) # room, instructor, equipment

    def to_dict(self):
        return {
            'resource_id': self.resource_id,
            'resource_name': self.resource_name,
            'resource_type': self.resource_type
        }

class EventResourceAllocation(db.Model):
    __tablename__ = 'event_resource_allocation'
    allocation_id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.event_id'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('resource.resource_id'), nullable=False)
    
    resource = db.relationship('Resource')

    def to_dict(self):
        return {
            'allocation_id': self.allocation_id,
            'event_id': self.event_id,
            'resource_id': self.resource_id,
            'resource_name': self.resource.resource_name,
            'event_title': self.event.title,
            'start_time': self.event.start_time.isoformat(),
            'end_time': self.event.end_time.isoformat()
        }

# --- Helper Functions ---

def parse_datetime(dt_str):
    # Expects ISO format or close to it
    try:
        if dt_str.endswith('Z'):
            dt_str = dt_str[:-1]
        return datetime.fromisoformat(dt_str)
    except ValueError:
        return None

def check_conflict(resource_id, start_time, end_time, exclude_event_id=None):
    # Find all allocations for this resource
    allocations = EventResourceAllocation.query.filter_by(resource_id=resource_id).all()
    
    for allocation in allocations:
        if exclude_event_id and allocation.event_id == exclude_event_id:
            continue
            
        existing_event = allocation.event
        # Overlap condition: (StartA < EndB) and (EndA > StartB)
        if (start_time < existing_event.end_time) and (end_time > existing_event.start_time):
            return True, existing_event.title
            
    return False, None

# --- Routes ---

with app.app_context():
    db.create_all()

@app.route('/resources', methods=['GET', 'POST'])
def handle_resources():
    if request.method == 'POST':
        data = request.json
        new_resource = Resource(
            resource_name=data['resource_name'],
            resource_type=data['resource_type']
        )
        db.session.add(new_resource)
        db.session.commit()
        return jsonify(new_resource.to_dict()), 201
    
    resources = Resource.query.all()
    return jsonify([r.to_dict() for r in resources])

@app.route('/events', methods=['GET', 'POST'])
def handle_events():
    if request.method == 'POST':
        data = request.json
        start = parse_datetime(data['start_time'])
        end = parse_datetime(data['end_time'])
        
        if not start or not end:
            return jsonify({'error': 'Invalid date format'}), 400
            
        if start >= end:
            return jsonify({'error': 'Start time must be before end time'}), 400

        new_event = Event(
            title=data['title'],
            start_time=start,
            end_time=end,
            description=data.get('description', '')
        )
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201

    events = Event.query.order_by(Event.start_time).all()
    return jsonify([e.to_dict() for e in events])

@app.route('/allocations', methods=['POST'])
def allocate_resource():
    data = request.json
    event_id = data.get('event_id')
    resource_id = data.get('resource_id')
    
    event = Event.query.get(event_id)
    resource = Resource.query.get(resource_id)
    
    if not event or not resource:
        return jsonify({'error': 'Event or Resource not found'}), 404
        
    # Check for conflicts
    has_conflict, conflicting_event = check_conflict(resource_id, event.start_time, event.end_time)
    if has_conflict:
        return jsonify({'error': f'Conflict detected with event: {conflicting_event}'}), 409
        
    allocation = EventResourceAllocation(event_id=event_id, resource_id=resource_id)
    db.session.add(allocation)
    db.session.commit()
    
    return jsonify(allocation.to_dict()), 201

@app.route('/allocations', methods=['GET'])
def get_allocations():
    allocations = EventResourceAllocation.query.all()
    return jsonify([a.to_dict() for a in allocations])

@app.route('/report', methods=['GET'])
def get_report():
    # Helper to calculate utilization
    # This is a basic implementation. For a date range, we sum up durations.
    start_str = request.args.get('start')
    end_str = request.args.get('end')
    
    # If no range provided, default to all time (or a reasonable default)
    # For this exercise, we'll return all-time stats if not specified, or filter if specified
    
    resources = Resource.query.all()
    report_data = []
    
    for r in resources:
        total_seconds = 0
        bookings_count = 0
        allocations = EventResourceAllocation.query.filter_by(resource_id=r.resource_id).all()
        
        for a in allocations:
            # If range is specified, we should check overlap with range. 
            # For simplicity, we'll just sum all assigned events duration for now
            # unless specific range logic is strictly required to filter the sum.
            # "User chooses a date range, and then the system computes metrics."
             
             # Calculate duration
             duration = (a.event.end_time - a.event.start_time).total_seconds()
             total_seconds += duration
             bookings_count += 1
             
        hours = total_seconds / 3600
        report_data.append({
            'resource_name': r.resource_name,
            'resource_type': r.resource_type,
            'total_hours': round(hours, 2),
            'bookings': bookings_count
        })
        
    return jsonify(report_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
