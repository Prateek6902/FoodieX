import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.apps import apps
from django.db import models
import graphviz

def generate_er_diagram():
    dot = graphviz.Digraph(comment='Food Delivery Platform ER Diagram')
    dot.attr(rankdir='TB', size='8.5,11')
    
    # Get all models
    models_list = apps.get_models()
    
    # Create nodes for each model
    for model in models_list:
        label = f"<<B>{model.__name__}</B><BR/>"
        for field in model._meta.fields:
            field_type = field.get_internal_type()
            label += f"{field.name}: {field_type}<BR/>"
        label += ">>"
        
        dot.node(model.__name__, label=label, shape='plaintext')
    
    # Create edges for relationships
    for model in models_list:
        for field in model._meta.fields:
            if isinstance(field, models.ForeignKey):
                dot.edge(model.__name__, field.related_model.__name__, label=field.name)
            elif isinstance(field, models.ManyToManyField):
                dot.edge(model.__name__, field.related_model.__name__, label=field.name, style='dashed')
    
    # Render diagram
    dot.render('food_delivery_er_diagram', format='png', view=True)
    print("ER Diagram generated: food_delivery_er_diagram.png")

if __name__ == '__main__':
    generate_er_diagram()