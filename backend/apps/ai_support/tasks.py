# apps/ai_support/tasks.py

from celery import shared_task
from django.utils import timezone
from .models import SupportTicket, ChatMessage
from .services import AISupportService
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_support_ticket_async(ticket_id: str):
    """Process support ticket in background using AI"""
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
        
        # Initialize AI service
        ai_service = AISupportService(
            ticket.user,
            ticket.ticket_type,
            ticket.description,
            ticket.images,
            ticket.order
        )
        
        # Analyze complaint
        analysis = ai_service.analyze_complaint()
        ticket.ai_suggestions = analysis
        
        # Generate response
        response = ai_service.generate_response(analysis)
        ticket.resolution = response
        
        # Generate voucher if eligible
        if analysis.get('voucher_eligible', True):
            voucher = ai_service.generate_voucher(analysis.get('recommended_discount', 70))
            ticket.voucher_code = voucher['code']
            ticket.voucher_applied = True
        
        # Check refund eligibility
        if ticket.order and analysis.get('refund_eligible', False):
            refund_data = ai_service.check_refund_eligibility()
            if refund_data['eligible']:
                ticket.refund_amount = refund_data['amount']
        
        ticket.status = 'IN_PROGRESS'
        ticket.save()
        
        # Create AI chat message
        ChatMessage.objects.create(
            user=ticket.user,
            ticket=ticket,
            message_type='AI',
            content=response
        )
        
        logger.info(f"Successfully processed ticket {ticket_id}")
        return {'success': True, 'ticket_id': str(ticket_id)}
        
    except Exception as e:
        logger.error(f"Error processing ticket {ticket_id}: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def generate_food_descriptions_batch(food_items: list):
    """Generate descriptions for multiple food items"""
    from .services import AIGeneratedContentService
    
    results = []
    for item in food_items:
        description = AIGeneratedContentService.generate_food_description(
            item['name'],
            item.get('cuisine', ''),
            item.get('ingredients', [])
        )
        results.append({
            'id': item.get('id'),
            'name': item['name'],
            'description': description
        })
    
    return results


@shared_task
def cleanup_expired_vouchers():
    """Delete expired vouchers"""
    from .models import Voucher
    
    expired_vouchers = Voucher.objects.filter(
        valid_until__lt=timezone.now(),
        is_used=False
    )
    count = expired_vouchers.count()
    expired_vouchers.delete()
    
    logger.info(f"Deleted {count} expired vouchers")
    return {'deleted_count': count}