from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login
from django.contrib import messages

class ForceSessionLoginView(LoginView):
    """Custom login view that ensures session is created"""
    
    def form_valid(self, form):
        """Override to force session save"""
        # Get the user
        user = form.get_user()
        
        # Login the user
        login(self.request, user)
        
        # Force session save
        self.request.session.save()
        
        # Set session expiry
        self.request.session.set_expiry(1209600)  # 2 weeks
        
        # Create a session cookie manually
        response = HttpResponseRedirect(self.get_success_url())
        
        # Ensure session cookie is set
        if self.request.session.session_key:
            response.set_cookie(
                'sessionid',
                self.request.session.session_key,
                max_age=1209600,
                httponly=True,
                path='/'
            )
        
        messages.success(self.request, f'Welcome back, {user.get_full_name() or user.email}!')
        return response
    
    def get_success_url(self):
        """Redirect to user list instead of admin index"""
        return '/admin/users/user/'