"""
Text Processing Nodes
Prompts, LLM, Text manipulation
"""

from typing import Dict, Any
from .base import BaseNode


class PromptNode(BaseNode):
    """Create and manipulate prompts"""

    NODE_ID = "prompt"
    NODE_NAME = "Prompt"
    NODE_CATEGORY = "input"
    NODE_DESCRIPTION = "Create or combine prompts"

    INPUTS = {
        'text': {'type': 'string', 'required': True, 'description': 'Main prompt text'},
        'style': {'type': 'string', 'required': False, 'description': 'Style to append'},
        'negative': {'type': 'string', 'required': False, 'default': '', 'description': 'Negative prompt'},
        'author': {'type': 'string', 'required': False, 'description': 'Author style to apply'},
    }

    OUTPUTS = {
        'prompt': {'type': 'string'},
        'negative_prompt': {'type': 'string'},
        'combined': {'type': 'object'},
    }

    def execute(self) -> Dict[str, Any]:
        text = self.inputs['text']
        style = self.inputs.get('style', '')
        negative = self.inputs.get('negative', '')
        author = self.inputs.get('author', '')

        self.log_progress(50, 'Building prompt...')

        # Combine prompt parts
        prompt_parts = [text]
        if style:
            prompt_parts.append(style)
        if author:
            # Author styles would be loaded from config
            pass

        final_prompt = ', '.join(filter(None, prompt_parts))

        self.outputs = {
            'prompt': final_prompt,
            'negative_prompt': negative,
            'combined': {
                'prompt': final_prompt,
                'negative_prompt': negative,
            }
        }

        self.log_progress(100, 'Done')
        return self.outputs


class LLMNode(BaseNode):
    """Generate text with LLM"""

    NODE_ID = "llm"
    NODE_NAME = "LLM Generate"
    NODE_CATEGORY = "text"
    NODE_DESCRIPTION = "Generate text using local or API LLM"

    INPUTS = {
        'prompt': {'type': 'string', 'required': True},
        'system_prompt': {'type': 'string', 'required': False, 'default': ''},
        'model': {'type': 'string', 'required': False, 'default': 'local',
                  'options': ['local', 'claude', 'gpt4']},
        'max_tokens': {'type': 'int', 'required': False, 'default': 1000},
        'temperature': {'type': 'float', 'required': False, 'default': 0.7},
    }

    OUTPUTS = {
        'text': {'type': 'string'},
        'tokens_used': {'type': 'int'},
    }

    def execute(self) -> Dict[str, Any]:
        prompt = self.inputs['prompt']
        system_prompt = self.inputs.get('system_prompt', '')
        model = self.inputs.get('model', 'local')
        max_tokens = self.inputs.get('max_tokens', 1000)

        self.log_progress(10, f'Generating with {model}...')

        # TODO: Implement actual LLM calls
        # For now, return placeholder
        generated_text = f"[Generated text for: {prompt[:50]}...]"

        self.outputs = {
            'text': generated_text,
            'tokens_used': len(generated_text.split()),
        }

        self.log_progress(100, 'Done')
        return self.outputs


class TextCombineNode(BaseNode):
    """Combine multiple text inputs"""

    NODE_ID = "text_combine"
    NODE_NAME = "Combine Text"
    NODE_CATEGORY = "text"
    NODE_DESCRIPTION = "Combine multiple text strings"

    INPUTS = {
        'text_1': {'type': 'string', 'required': True},
        'text_2': {'type': 'string', 'required': False, 'default': ''},
        'text_3': {'type': 'string', 'required': False, 'default': ''},
        'separator': {'type': 'string', 'required': False, 'default': ', '},
    }

    OUTPUTS = {
        'text': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        texts = [
            self.inputs.get('text_1', ''),
            self.inputs.get('text_2', ''),
            self.inputs.get('text_3', ''),
        ]
        separator = self.inputs.get('separator', ', ')

        combined = separator.join(filter(None, texts))

        self.outputs = {'text': combined}
        return self.outputs
