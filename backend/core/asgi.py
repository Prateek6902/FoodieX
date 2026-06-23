import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Simple ASGI application - no WebSockets for now
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
})