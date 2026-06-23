from django.urls import path
from . import views

urlpatterns = [
    # Contact Queries
    path('contact/', views.CreateContactQueryView.as_view(), name='create-contact'),
    path('admin/queries/', views.ContactQueryListView.as_view(), name='contact-queries'),
    path('admin/queries/<uuid:query_id>/', views.ContactQueryDetailView.as_view(), name='contact-query-detail'),
    path('admin/queries/<uuid:query_id>/reply/', views.ReplyToQueryView.as_view(), name='reply-to-query'),
    path('admin/queries/<uuid:query_id>/resolve/', views.ResolveQueryView.as_view(), name='resolve-query'),
    
    # FAQs
    path('faqs/', views.FAQListView.as_view(), name='faq-list'),
    path('faqs/<uuid:faq_id>/', views.FAQDetailView.as_view(), name='faq-detail'),
    
    # Feedback
    path('feedback/', views.CreateFeedbackView.as_view(), name='create-feedback'),
    path('feedback/list/', views.FeedbackListView.as_view(), name='feedback-list'),
]