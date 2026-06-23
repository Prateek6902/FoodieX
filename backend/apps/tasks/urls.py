from django.urls import path
from . import views

urlpatterns = [
    # Task CRUD
    path('', views.TaskListView.as_view(), name='task-list'),
    path('create/', views.CreateTaskView.as_view(), name='create-task'),
    path('<uuid:task_id>/', views.TaskDetailView.as_view(), name='task-detail'),
    
    # Task Status
    path('<uuid:task_id>/update-status/', views.UpdateTaskStatusView.as_view(), name='update-task-status'),
    path('<uuid:task_id>/assign/', views.AssignTaskView.as_view(), name='assign-task'),
    
    # Comments
    path('<uuid:task_id>/comments/', views.AddTaskCommentView.as_view(), name='add-comment'),
    
    # Assignment History
    path('<uuid:task_id>/history/', views.TaskAssignmentHistoryView.as_view(), name='task-history'),
    
    # Dashboard
    path('dashboard/', views.TaskDashboardView.as_view(), name='task-dashboard'),
    
    # My Tasks
    path('my-tasks/', views.MyTasksView.as_view(), name='my-tasks'),
    
    # Notifications
    path('notifications/', views.TaskNotificationsView.as_view(), name='task-notifications'),
]