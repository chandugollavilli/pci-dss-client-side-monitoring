from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Script(db.Model):
    __tablename__ = 'scripts'
    
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    hash_value = db.Column(db.String(64), nullable=True)  # SHA-256 hash
    status = db.Column(db.String(20), default='authorized')  # authorized, unauthorized, pending
    justification = db.Column(db.Text, nullable=False)
    page_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'hash_value': self.hash_value,
            'status': self.status,
            'justification': self.justification,
            'page_url': self.page_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False)  # script_change, new_script, header_change, etc.
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    message = db.Column(db.Text, nullable=False)
    page_url = db.Column(db.String(500), nullable=False)
    script_url = db.Column(db.String(500), nullable=True)
    details = db.Column(db.Text, nullable=True)  # JSON string with additional details
    status = db.Column(db.String(20), default='open')  # open, acknowledged, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'message': self.message,
            'page_url': self.page_url,
            'script_url': self.script_url,
            'details': self.details,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }

class MonitoringEvent(db.Model):
    __tablename__ = 'monitoring_events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50), nullable=False)  # script_load, dom_change, network_request, etc.
    page_url = db.Column(db.String(500), nullable=False)
    script_url = db.Column(db.String(500), nullable=True)
    event_data = db.Column(db.Text, nullable=True)  # JSON string with event details
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_type': self.event_type,
            'page_url': self.page_url,
            'script_url': self.script_url,
            'event_data': self.event_data,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

