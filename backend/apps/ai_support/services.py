import openai
import google.generativeai as genai
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid
import json
from typing import Dict, List, Optional
import base64
from io import BytesIO
from PIL import Image
import requests

# Initialize AI clients
openai.api_key = settings.OPENAI_API_KEY
genai.configure(api_key=settings.GOOGLE_AI_API_KEY)

class AISupportService:
    """AI Support Service for handling customer complaints and generating responses"""
    
    def __init__(self, user, ticket_type, description, images=None, order=None):
        self.user = user
        self.ticket_type = ticket_type
        self.description = description
        self.images = images or []
        self.order = order
        
    def analyze_complaint(self) -> Dict:
        """Analyze the complaint using AI"""
        prompt = f"""
        Analyze this customer complaint:
        Type: {self.ticket_type}
        Description: {self.description}
        
        Please provide:
        1. Sentiment analysis (positive/neutral/negative)
        2. Urgency level (low/medium/high)
        3. Suggested resolution steps
        4. Eligibility for refund (yes/no)
        5. Eligibility for voucher (yes/no)
        6. Recommended discount percentage (0-100)
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a food delivery support AI specialist."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            # Parse analysis into structured data
            return self._parse_analysis(analysis)
            
        except Exception as e:
            print(f"AI Analysis Error: {e}")
            return self._get_default_analysis()
    
    def _parse_analysis(self, analysis_text: str) -> Dict:
        """Parse AI response into structured format"""
        # Simple parsing logic - enhance with proper NLP
        result = {
            'sentiment': 'negative',
            'urgency': 'medium',
            'resolution_steps': ['Review order details', 'Check delivery status', 'Contact restaurant'],
            'refund_eligible': False,
            'voucher_eligible': True,
            'recommended_discount': 70
        }
        
        if 'refund' in analysis_text.lower() and 'eligible' in analysis_text.lower():
            result['refund_eligible'] = True
            
        if 'voucher' in analysis_text.lower() and 'eligible' in analysis_text.lower():
            result['voucher_eligible'] = True
            
        # Extract urgency
        if 'high' in analysis_text.lower():
            result['urgency'] = 'high'
        elif 'medium' in analysis_text.lower():
            result['urgency'] = 'medium'
        else:
            result['urgency'] = 'low'
            
        return result
    
    def _get_default_analysis(self) -> Dict:
        """Return default analysis if AI fails"""
        return {
            'sentiment': 'negative',
            'urgency': 'medium',
            'resolution_steps': ['Review order details', 'Contact restaurant', 'Check delivery status'],
            'refund_eligible': False,
            'voucher_eligible': True,
            'recommended_discount': 70
        }
    
    def generate_response(self, analysis: Dict) -> str:
        """Generate AI response for the customer"""
        prompt = f"""
        Customer complaint: {self.description}
        Type: {self.ticket_type}
        
        Based on analysis:
        - Urgency: {analysis['urgency']}
        - Refund Eligible: {analysis['refund_eligible']}
        - Voucher Eligible: {analysis['voucher_eligible']}
        - Recommended Discount: {analysis['recommended_discount']}%
        
        Generate a professional, empathetic AI support response addressing:
        1. Acknowledge the issue
        2. Show understanding of their frustration
        3. Explain what's being done
        4. Provide next steps
        5. If applicable, mention the voucher with code
        6. Offer additional help options
        
        Keep it concise, friendly, and helpful. Use emojis appropriately.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a friendly, empathetic food delivery support AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Response generation error: {e}")
            return self._get_default_response()
    
    def _get_default_response(self) -> str:
        """Return default response if AI fails"""
        return f"""
        I understand you're facing an issue with your order. I'm here to help!
        
        I've analyzed your complaint and I'm working on a solution for you.
        In the meantime, please check your order details and ensure everything is correct.
        
        I'll get back to you with a resolution shortly. If you need immediate assistance, 
        you can always contact our support team directly.
        
        Thank you for your patience! 🙏
        """
    
    def generate_voucher(self, discount_percentage: int = 70) -> Dict:
        """Generate a voucher for the customer"""
        from apps.ai_support.models import Voucher
        
        code = f"FOODIE{str(uuid.uuid4())[:8].upper()}"
        valid_until = timezone.now() + timezone.timedelta(days=2)
        
        voucher = Voucher.objects.create(
            user=self.user,
            code=code,
            discount_percentage=discount_percentage,
            valid_until=valid_until
        )
        
        return {
            'code': code,
            'discount_percentage': discount_percentage,
            'valid_until': valid_until.isoformat()
        }
    
    def check_refund_eligibility(self) -> Dict:
        """Check if the order is eligible for refund"""
        if not self.order:
            return {'eligible': False, 'reason': 'No order associated'}
        
        # Check if order is delivered within last 7 days
        days_since_delivery = (timezone.now() - self.order.delivered_at).days if self.order.delivered_at else 7
        
        if days_since_delivery > 7:
            return {'eligible': False, 'reason': 'Order is older than 7 days'}
        
        # Check if order is already refunded
        if self.order.payment_status == 'refunded':
            return {'eligible': False, 'reason': 'Order already refunded'}
        
        return {
            'eligible': True,
            'reason': 'Eligible for refund',
            'amount': float(self.order.total_amount)
        }


class AIGeneratedContentService:
    """Service for AI-generated food descriptions and quotes"""
    
    @staticmethod
    def generate_food_description(food_name: str, cuisine: str, ingredients: List[str] = None) -> str:
        """Generate a description for a food item"""
        prompt = f"""
        Create a mouth-watering description for {food_name} ({cuisine} cuisine).
        
        {'Key ingredients: ' + ', '.join(ingredients) if ingredients else ''}
        
        Make it:
        - Appetizing and descriptive
        - Highlight key flavors and textures
        - Include cooking technique if relevant
        - Keep it between 30-50 words
        - Use food writing style
        
        Only return the description, no additional text.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional food writer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=100
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Description generation error: {e}")
            return AIGeneratedContentService._get_fallback_description(food_name)
    
    @staticmethod
    def _get_fallback_description(food_name: str) -> str:
        """Return fallback descriptions"""
        descriptions = {
            'pizza': 'Classic pizza with a crispy thin crust, topped with rich tomato sauce, fresh mozzarella, and aromatic basil leaves.',
            'burger': 'Juicy grilled patty with melted cheese, fresh lettuce, tomatoes, and secret sauce in a toasted brioche bun.',
            'sushi': 'Fresh, premium-grade fish and perfectly seasoned rice, wrapped in nori with crisp vegetables.',
            'biryani': 'Aromatic basmati rice layered with tender meat, caramelized onions, and exotic spices.',
            'pasta': 'Al dente pasta tossed in a rich, creamy sauce with fresh herbs and parmesan cheese.',
        }
        
        for key, desc in descriptions.items():
            if key in food_name.lower():
                return desc
        return f"Delicious {food_name} prepared with authentic ingredients and traditional recipes."
    
    @staticmethod
    def generate_food_quote() -> str:
        """Generate a food quote for the dashboard"""
        quotes = [
            "Good food is the foundation of genuine happiness.",
            "Food is our common ground, a universal experience.",
            "One cannot think well, love well, sleep well, if one has not dined well.",
            "The only thing I like better than talking about food is eating.",
            "Food is symbolic of love when words are inadequate.",
            "Cooking is love made visible.",
            "Great food is like great sex. The more you have, the more you want.",
            "The secret of success in life is to eat what you like.",
            "A recipe has no soul. You, as the cook, must bring soul to the recipe.",
            "Food brings people together on many different levels."
        ]
        import random
        return random.choice(quotes)


class AIFoodImageGenerator:
    """Generate food images using AI"""
    
    @staticmethod
    def generate_image(prompt: str, size: str = "512x512") -> Optional[str]:
        """Generate a food image using DALL-E"""
        try:
            enhanced_prompt = f"""
            Professional food photography of {prompt}
            High quality, studio lighting, beautiful plating, 
            garnished, appetizing, realistic, top view or 45-degree angle
            """
            
            response = openai.Image.create(
                prompt=enhanced_prompt,
                n=1,
                size=size
            )
            return response['data'][0]['url']
        except Exception as e:
            print(f"Image generation error: {e}")
            return None
    
    @staticmethod
    def get_default_food_image(food_name: str) -> str:
        """Return a default food image URL"""
        # Unsplash food images
        image_map = {
            'pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
            'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
            'sushi': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
            'pasta': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
            'biryani': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
            'tacos': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
            'desert': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
        }
        
        for key, url in image_map.items():
            if key in food_name.lower():
                return f"{url}?w=300&h=300&fit=crop"
        
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop'