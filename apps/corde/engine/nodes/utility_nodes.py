"""
Utility Nodes
Load, Save, Preview, Export
"""

from typing import Dict, Any
from pathlib import Path
from datetime import datetime
from .base import BaseNode


class LoadImageNode(BaseNode):
    """Load image from file or URL"""

    NODE_ID = "load_image"
    NODE_NAME = "Load Image"
    NODE_CATEGORY = "input"
    NODE_DESCRIPTION = "Load image from file path or URL"

    INPUTS = {
        'path': {'type': 'string', 'required': True, 'description': 'File path or URL'},
    }

    OUTPUTS = {
        'image': {'type': 'image'},
        'width': {'type': 'int'},
        'height': {'type': 'int'},
        'format': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        from PIL import Image
        import requests
        from io import BytesIO

        path = self.inputs['path']
        self.log_progress(10, f'Loading: {path}')

        if path.startswith('http'):
            # Load from URL
            response = requests.get(path)
            image = Image.open(BytesIO(response.content))
        else:
            # Load from file
            image = Image.open(path)

        self.outputs = {
            'image': image,
            'width': image.width,
            'height': image.height,
            'format': image.format,
        }

        self.log_progress(100, f'Loaded {image.width}x{image.height}')
        return self.outputs


class SaveNode(BaseNode):
    """Save output to file"""

    NODE_ID = "save"
    NODE_NAME = "Save"
    NODE_CATEGORY = "output"
    NODE_DESCRIPTION = "Save image or video to file"

    INPUTS = {
        'data': {'type': 'any', 'required': True, 'description': 'Image or video to save'},
        'filename': {'type': 'string', 'required': False, 'description': 'Custom filename'},
        'format': {'type': 'string', 'required': False, 'default': 'auto',
                   'options': ['auto', 'png', 'jpg', 'mp4', 'gif']},
        'output_dir': {'type': 'string', 'required': False, 'default': './outputs'},
    }

    OUTPUTS = {
        'path': {'type': 'string'},
        'size_bytes': {'type': 'int'},
    }

    def execute(self) -> Dict[str, Any]:
        from PIL import Image
        import os

        data = self.inputs['data']
        filename = self.inputs.get('filename', '')
        fmt = self.inputs.get('format', 'auto')
        output_dir = self.inputs.get('output_dir', './outputs')

        self.log_progress(10, 'Saving...')

        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        # Determine format and filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if isinstance(data, Image.Image):
            ext = 'png' if fmt == 'auto' else fmt
            if not filename:
                filename = f'corde_{timestamp}.{ext}'
            path = Path(output_dir) / filename
            data.save(str(path))
        elif isinstance(data, str) and Path(data).exists():
            # It's a path to existing file, just return it
            path = Path(data)
        else:
            raise ValueError(f'Unknown data type: {type(data)}')

        size_bytes = os.path.getsize(str(path))

        self.outputs = {
            'path': str(path),
            'size_bytes': size_bytes,
        }

        self.log_progress(100, f'Saved to {path}')
        return self.outputs


class PreviewNode(BaseNode):
    """Preview output (display in UI)"""

    NODE_ID = "preview"
    NODE_NAME = "Preview"
    NODE_CATEGORY = "output"
    NODE_DESCRIPTION = "Preview image or video in UI"

    INPUTS = {
        'data': {'type': 'any', 'required': True},
        'label': {'type': 'string', 'required': False, 'default': 'Preview'},
    }

    OUTPUTS = {
        'preview_url': {'type': 'string'},
    }

    def execute(self) -> Dict[str, Any]:
        from PIL import Image
        import base64
        from io import BytesIO

        data = self.inputs['data']
        label = self.inputs.get('label', 'Preview')

        self.log_progress(50, f'Creating preview: {label}')

        if isinstance(data, Image.Image):
            # Convert to base64 for web display
            buffered = BytesIO()
            data.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            preview_url = f"data:image/png;base64,{img_str}"
        elif isinstance(data, str):
            # It's a path
            preview_url = data
        else:
            preview_url = None

        self.outputs = {
            'preview_url': preview_url,
        }

        self.log_progress(100, 'Preview ready')
        return self.outputs


class ExportNode(BaseNode):
    """Export in multiple formats"""

    NODE_ID = "export"
    NODE_NAME = "Export"
    NODE_CATEGORY = "output"
    NODE_DESCRIPTION = "Export in multiple formats and resolutions"

    INPUTS = {
        'input': {'type': 'any', 'required': True},
        'formats': {'type': 'list', 'required': False, 'default': ['16:9', '9:16', '1:1']},
        'output_dir': {'type': 'string', 'required': False, 'default': './outputs/export'},
    }

    OUTPUTS = {
        'paths': {'type': 'dict', 'description': 'Map of format to path'},
    }

    def execute(self) -> Dict[str, Any]:
        from PIL import Image

        data = self.inputs['input']
        formats = self.inputs.get('formats', ['16:9', '9:16', '1:1'])
        output_dir = self.inputs.get('output_dir', './outputs/export')

        self.log_progress(10, f'Exporting to {len(formats)} formats...')

        Path(output_dir).mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        paths = {}

        if isinstance(data, Image.Image):
            for i, fmt in enumerate(formats):
                progress = 10 + (80 * (i + 1) // len(formats))
                self.log_progress(progress, f'Exporting {fmt}...')

                if fmt == '16:9':
                    size = (1920, 1080)
                elif fmt == '9:16':
                    size = (1080, 1920)
                elif fmt == '1:1':
                    size = (1080, 1080)
                else:
                    continue

                # Resize and crop to fit
                resized = data.copy()
                resized.thumbnail(size, Image.Resampling.LANCZOS)

                # Create new image with padding
                new_img = Image.new('RGB', size, (0, 0, 0))
                x = (size[0] - resized.width) // 2
                y = (size[1] - resized.height) // 2
                new_img.paste(resized, (x, y))

                path = Path(output_dir) / f'{timestamp}_{fmt.replace(":", "x")}.png'
                new_img.save(str(path))
                paths[fmt] = str(path)

        self.outputs = {'paths': paths}

        self.log_progress(100, 'Export complete')
        return self.outputs
