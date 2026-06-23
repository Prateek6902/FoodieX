from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import Task, TaskComment, TaskAttachment, TaskAssignmentHistory, TaskNotification
from .serializers import (
    TaskSerializer, CreateTaskSerializer, UpdateTaskStatusSerializer,
    AssignTaskSerializer, TaskCommentSerializer, TaskAttachmentSerializer,
    TaskAssignmentHistorySerializer, TaskNotificationSerializer
)
from core.permissions.role_permissions import IsAdmin, IsSuperAdmin

class TaskListView(APIView):
    """Get all tasks for the current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Admin can see all tasks, others see only their assigned tasks
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=user)
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        # Filter by priority
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            tasks = tasks.filter(priority=priority_filter)
        
        # Filter by task type
        task_type = request.query_params.get('task_type')
        if task_type:
            tasks = tasks.filter(task_type=task_type)
        
        # Filter by overdue
        overdue = request.query_params.get('overdue')
        if overdue == 'true':
            tasks = tasks.filter(due_date__lt=timezone.now()).exclude(status='COMPLETED')
        
        tasks = tasks.order_by('-priority', 'due_date')
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = tasks.count()
        tasks = tasks[offset:offset + limit]
        
        serializer = TaskSerializer(tasks, many=True)
        
        return Response({
            'success': True,
            'total': total,
            'data': serializer.data
        })

class TaskDetailView(APIView):
    """Get task details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        
        # Check permission
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN'] and task.assigned_to != request.user:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to view this task'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TaskSerializer(task)
        return Response({
            'success': True,
            'data': serializer.data
        })

class CreateTaskView(APIView):
    """Create a new task (admin only)"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request):
        serializer = CreateTaskSerializer(data=request.data)
        if serializer.is_valid():
            from apps.users.models import User
            
            assigned_to = get_object_or_404(User, id=serializer.validated_data['assigned_to'])
            
            # Generate unique task ID
            task_id = f"TASK-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            
            task = Task.objects.create(
                task_id=task_id,
                task_type=serializer.validated_data['task_type'],
                title=serializer.validated_data['title'],
                description=serializer.validated_data['description'],
                assigned_to=assigned_to,
                assigned_by=request.user,
                priority=serializer.validated_data['priority'],
                due_date=serializer.validated_data['due_date'],
                metadata=serializer.validated_data.get('metadata', {}),
                is_recurring=serializer.validated_data.get('is_recurring', False),
                recurring_interval=serializer.validated_data.get('recurring_interval')
            )
            
            # Add dependencies
            depends_on_ids = serializer.validated_data.get('depends_on', [])
            if depends_on_ids:
                depends_on_tasks = Task.objects.filter(id__in=depends_on_ids)
                task.depends_on.add(*depends_on_tasks)
            
            # Create assignment history
            TaskAssignmentHistory.objects.create(
                task=task,
                assigned_to=assigned_to,
                assigned_by=request.user
            )
            
            # Create notification
            TaskNotification.objects.create(
                task=task,
                user=assigned_to,
                notification_type='ASSIGNED'
            )
            
            task_serializer = TaskSerializer(task)
            return Response({
                'success': True,
                'message': 'Task created successfully',
                'data': task_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UpdateTaskStatusView(APIView):
    """Update task status"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        
        # Check permission
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN'] and task.assigned_to != request.user:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to update this task'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UpdateTaskStatusSerializer(data=request.data)
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            old_status = task.status
            
            # Validate status transition
            allowed_transitions = {
                'PENDING': ['IN_PROGRESS', 'CANCELLED'],
                'IN_PROGRESS': ['COMPLETED', 'BLOCKED', 'CANCELLED'],
                'BLOCKED': ['IN_PROGRESS', 'CANCELLED'],
                'COMPLETED': [],
                'CANCELLED': [],
            }
            
            if new_status not in allowed_transitions.get(old_status, []):
                return Response({
                    'success': False,
                    'message': f'Invalid status transition from {old_status} to {new_status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update timestamps
            if new_status == 'IN_PROGRESS' and not task.started_at:
                task.started_at = timezone.now()
            elif new_status == 'COMPLETED':
                task.completed_at = timezone.now()
            
            task.status = new_status
            task.result = serializer.validated_data.get('result', {})
            task.error_message = serializer.validated_data.get('error_message')
            task.save()
            
            # Create notification
            TaskNotification.objects.create(
                task=task,
                user=task.assigned_to,
                notification_type='UPDATED'
            )
            
            return Response({
                'success': True,
                'message': f'Task status updated to {new_status}',
                'data': TaskSerializer(task).data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AssignTaskView(APIView):
    """Reassign task to another user"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        serializer = AssignTaskSerializer(data=request.data)
        
        if serializer.is_valid():
            from apps.users.models import User
            new_assigned_to = get_object_or_404(User, id=serializer.validated_data['assigned_to'])
            old_assigned_to = task.assigned_to
            
            task.assigned_to = new_assigned_to
            task.save()
            
            # Create assignment history
            TaskAssignmentHistory.objects.create(
                task=task,
                assigned_to=new_assigned_to,
                assigned_by=request.user,
                notes=serializer.validated_data.get('notes')
            )
            
            # Create notifications
            TaskNotification.objects.create(
                task=task,
                user=new_assigned_to,
                notification_type='ASSIGNED'
            )
            
            return Response({
                'success': True,
                'message': f'Task reassigned from {old_assigned_to.email} to {new_assigned_to.email}',
                'data': TaskSerializer(task).data
            })
        
        return Response({
            'success': False,
            'message': 'Validation error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AddTaskCommentView(APIView):
    """Add comment to task"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        
        # Check permission
        if request.user.role not in ['SUPER_ADMIN', 'ADMIN'] and task.assigned_to != request.user:
            return Response({
                'success': False,
                'message': 'You don\'t have permission to comment on this task'
            }, status=status.HTTP_403_FORBIDDEN)
        
        comment = request.data.get('comment')
        if not comment:
            return Response({
                'success': False,
                'message': 'Comment is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task_comment = TaskComment.objects.create(
            task=task,
            user=request.user,
            comment=comment
        )
        
        # Create notification
        TaskNotification.objects.create(
            task=task,
            user=task.assigned_to,
            notification_type='COMMENT'
        )
        
        serializer = TaskCommentSerializer(task_comment)
        return Response({
            'success': True,
            'message': 'Comment added successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class TaskDashboardView(APIView):
    """Get task dashboard statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role in ['SUPER_ADMIN', 'ADMIN']:
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(assigned_to=user)
        
        # Statistics
        total_tasks = tasks.count()
        pending_tasks = tasks.filter(status='PENDING').count()
        in_progress_tasks = tasks.filter(status='IN_PROGRESS').count()
        completed_tasks = tasks.filter(status='COMPLETED').count()
        blocked_tasks = tasks.filter(status='BLOCKED').count()
        cancelled_tasks = tasks.filter(status='CANCELLED').count()
        overdue_tasks = tasks.filter(due_date__lt=timezone.now()).exclude(status='COMPLETED').count()
        
        # Priority distribution
        high_priority = tasks.filter(priority='HIGH').count()
        medium_priority = tasks.filter(priority='MEDIUM').count()
        low_priority = tasks.filter(priority='LOW').count()
        
        # Task type distribution
        task_types = tasks.values('task_type').annotate(count=Count('id'))
        
        # Recent tasks
        recent_tasks = tasks.order_by('-created_at')[:10]
        
        # Completion rate
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return Response({
            'success': True,
            'data': {
                'summary': {
                    'total_tasks': total_tasks,
                    'pending_tasks': pending_tasks,
                    'in_progress_tasks': in_progress_tasks,
                    'completed_tasks': completed_tasks,
                    'blocked_tasks': blocked_tasks,
                    'cancelled_tasks': cancelled_tasks,
                    'overdue_tasks': overdue_tasks,
                    'completion_rate': round(completion_rate, 1)
                },
                'priority_distribution': {
                    'high': high_priority,
                    'medium': medium_priority,
                    'low': low_priority
                },
                'task_types': list(task_types),
                'recent_tasks': TaskSerializer(recent_tasks, many=True).data
            }
        })

class MyTasksView(APIView):
    """Get tasks assigned to current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        tasks = Task.objects.filter(assigned_to=request.user).order_by('-priority', 'due_date')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        serializer = TaskSerializer(tasks, many=True)
        
        return Response({
            'success': True,
            'total': tasks.count(),
            'data': serializer.data
        })

class TaskNotificationsView(APIView):
    """Get task notifications for current user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = TaskNotification.objects.filter(
            user=request.user,
            is_read=False
        ).order_by('-created_at')
        
        serializer = TaskNotificationSerializer(notifications, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        # Mark all as read
        TaskNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        
        return Response({
            'success': True,
            'message': 'All notifications marked as read'
        })

class TaskAssignmentHistoryView(APIView):
    """Get task assignment history"""
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperAdmin]
    
    def get(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        history = task.assignment_history.all()
        serializer = TaskAssignmentHistorySerializer(history, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })