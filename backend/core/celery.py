import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

app = Celery('food_delivery')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

app.conf.beat_schedule = {
    'send-daily-report': {
        'task': 'apps.tasks.tasks.send_daily_report',
        'schedule': crontab(hour=23, minute=30),
    },
    'update-vendor-metrics': {
        'task': 'apps.tasks.tasks.update_vendor_metrics',
        'schedule': crontab(hour=0, minute=0),
    },
    'cleanup-expired-otps': {
        'task': 'apps.tasks.tasks.cleanup_expired_otps',
        'schedule': crontab(hour='*/1', minute=0),
    },
    'process-pending-payouts': {
        'task': 'apps.tasks.tasks.process_pending_payouts',
        'schedule': crontab(day_of_week='monday', hour=10, minute=0),
    },
    'update-order-estimates': {
        'task': 'apps.tasks.tasks.update_order_estimates',
        'schedule': crontab(minute='*/15'),
    },
}