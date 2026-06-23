import json
import logging
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'name': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)

class RequestIDFilter(logging.Filter):
    """Add request ID to log records"""
    
    def filter(self, record):
        from threading import local
        request_local = getattr(local(), 'request', None)
        if request_local:
            record.request_id = getattr(request_local, 'id', 'N/A')
        else:
            record.request_id = 'N/A'
        return True