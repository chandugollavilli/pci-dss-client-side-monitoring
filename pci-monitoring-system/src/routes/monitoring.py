from flask import Blueprint, request, jsonify
from src.models.script import Script, Alert, MonitoringEvent, db
from datetime import datetime
import json
import hashlib

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/scripts', methods=['GET'])
def get_scripts():
    """Get all authorized scripts"""
    scripts = Script.query.all()
    return jsonify([script.to_dict() for script in scripts])

@monitoring_bp.route('/scripts', methods=['POST'])
def add_script():
    """Add a new authorized script"""
    data = request.get_json()
    
    if not data or 'url' not in data or 'justification' not in data or 'page_url' not in data:
        return jsonify({'error': 'Missing required fields: url, justification, page_url'}), 400
    
    script = Script(
        url=data['url'],
        hash_value=data.get('hash_value'),
        justification=data['justification'],
        page_url=data['page_url'],
        status=data.get('status', 'authorized')
    )
    
    db.session.add(script)
    db.session.commit()
    
    return jsonify(script.to_dict()), 201

@monitoring_bp.route('/scripts/<int:script_id>', methods=['PUT'])
def update_script(script_id):
    """Update an existing script"""
    script = Script.query.get_or_404(script_id)
    data = request.get_json()
    
    if 'url' in data:
        script.url = data['url']
    if 'hash_value' in data:
        script.hash_value = data['hash_value']
    if 'justification' in data:
        script.justification = data['justification']
    if 'page_url' in data:
        script.page_url = data['page_url']
    if 'status' in data:
        script.status = data['status']
    
    script.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(script.to_dict())

@monitoring_bp.route('/scripts/<int:script_id>', methods=['DELETE'])
def delete_script(script_id):
    """Delete a script"""
    script = Script.query.get_or_404(script_id)
    db.session.delete(script)
    db.session.commit()
    
    return jsonify({'message': 'Script deleted successfully'})

@monitoring_bp.route('/events', methods=['POST'])
def report_event():
    """Receive monitoring events from client-side agent"""
    data = request.get_json()
    
    if not data or 'event_type' not in data or 'page_url' not in data:
        return jsonify({'error': 'Missing required fields: event_type, page_url'}), 400
    
    # Create monitoring event
    event = MonitoringEvent(
        event_type=data['event_type'],
        page_url=data['page_url'],
        script_url=data.get('script_url'),
        event_data=json.dumps(data.get('event_data', {}))
    )
    
    db.session.add(event)
    
    # Analyze event and potentially create alerts
    alert = analyze_event(data)
    if alert:
        db.session.add(alert)
    
    db.session.commit()
    
    response = {'status': 'received', 'event_id': event.id}
    if alert:
        response['alert_created'] = True
        response['alert_id'] = alert.id
    
    return jsonify(response)

@monitoring_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    status_filter = request.args.get('status')
    severity_filter = request.args.get('severity')
    
    query = Alert.query
    
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity_filter:
        query = query.filter(Alert.severity == severity_filter)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    return jsonify([alert.to_dict() for alert in alerts])

@monitoring_bp.route('/alerts/<int:alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    alert = Alert.query.get_or_404(alert_id)
    alert.status = 'acknowledged'
    db.session.commit()
    
    return jsonify(alert.to_dict())

@monitoring_bp.route('/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Resolve an alert"""
    alert = Alert.query.get_or_404(alert_id)
    alert.status = 'resolved'
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(alert.to_dict())

@monitoring_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    total_scripts = Script.query.count()
    authorized_scripts = Script.query.filter(Script.status == 'authorized').count()
    open_alerts = Alert.query.filter(Alert.status == 'open').count()
    critical_alerts = Alert.query.filter(Alert.severity == 'critical', Alert.status == 'open').count()
    
    recent_events = MonitoringEvent.query.order_by(MonitoringEvent.timestamp.desc()).limit(10).all()
    
    return jsonify({
        'total_scripts': total_scripts,
        'authorized_scripts': authorized_scripts,
        'open_alerts': open_alerts,
        'critical_alerts': critical_alerts,
        'recent_events': [event.to_dict() for event in recent_events]
    })

def analyze_event(event_data):
    """Analyze monitoring event and create alert if necessary"""
    event_type = event_data['event_type']
    page_url = event_data['page_url']
    script_url = event_data.get('script_url')
    
    alert = None
    
    if event_type == 'script_load':
        # Check if script is authorized
        if script_url:
            authorized_script = Script.query.filter(
                Script.url == script_url,
                Script.page_url == page_url,
                Script.status == 'authorized'
            ).first()
            
            if not authorized_script:
                alert = Alert(
                    alert_type='unauthorized_script',
                    severity='high',
                    message=f'Unauthorized script detected: {script_url}',
                    page_url=page_url,
                    script_url=script_url,
                    details=json.dumps(event_data.get('event_data', {}))
                )
    
    elif event_type == 'script_hash_mismatch':
        # Script integrity violation
        alert = Alert(
            alert_type='script_integrity_violation',
            severity='critical',
            message=f'Script integrity violation detected: {script_url}',
            page_url=page_url,
            script_url=script_url,
            details=json.dumps(event_data.get('event_data', {}))
        )
    
    elif event_type == 'suspicious_network_request':
        # Suspicious outbound request
        alert = Alert(
            alert_type='suspicious_network_activity',
            severity='high',
            message=f'Suspicious network request detected from page: {page_url}',
            page_url=page_url,
            details=json.dumps(event_data.get('event_data', {}))
        )
    
    elif event_type == 'dom_manipulation':
        # Suspicious DOM changes
        alert = Alert(
            alert_type='suspicious_dom_change',
            severity='medium',
            message=f'Suspicious DOM manipulation detected on page: {page_url}',
            page_url=page_url,
            details=json.dumps(event_data.get('event_data', {}))
        )
    
    elif event_type == 'csp_violation':
        # Content Security Policy violation
        alert = Alert(
            alert_type='csp_violation',
            severity='high',
            message=f'Content Security Policy violation: {event_data.get("event_data", {}).get("violated-directive", "unknown")}',
            page_url=page_url,
            script_url=script_url,
            details=json.dumps(event_data.get('event_data', {}))
        )
    
    return alert

