"""
Base Node - Abstract class for all CORDE nodes
Ultra-modular design
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import json

class BaseNode(ABC):
    """Base class for all CORDE nodes"""

    # Node metadata (override in subclass)
    NODE_ID: str = "base"
    NODE_NAME: str = "Base Node"
    NODE_CATEGORY: str = "utility"
    NODE_DESCRIPTION: str = "Base node class"

    # Input/Output definitions
    INPUTS: Dict[str, Dict] = {}
    OUTPUTS: Dict[str, Dict] = {}

    def __init__(self, node_id: str = None):
        self.id = node_id or f"{self.NODE_ID}_{id(self)}"
        self.inputs: Dict[str, Any] = {}
        self.outputs: Dict[str, Any] = {}
        self._progress: int = 0

    def set_input(self, name: str, value: Any):
        """Set an input value"""
        if name not in self.INPUTS:
            raise ValueError(f"Unknown input: {name}")
        self.inputs[name] = value

    def get_output(self, name: str) -> Any:
        """Get an output value"""
        if name not in self.OUTPUTS:
            raise ValueError(f"Unknown output: {name}")
        return self.outputs.get(name)

    def log_progress(self, progress: int, message: str = None):
        """Log progress (0-100)"""
        self._progress = progress
        output = {'node': self.id, 'progress': progress}
        if message:
            output['message'] = message
        print(json.dumps(output), flush=True)

    @abstractmethod
    def execute(self) -> Dict[str, Any]:
        """Execute the node and return outputs"""
        pass

    def validate_inputs(self) -> List[str]:
        """Validate all required inputs are present"""
        errors = []
        for name, config in self.INPUTS.items():
            if config.get('required', False) and name not in self.inputs:
                errors.append(f"Missing required input: {name}")
        return errors

    def to_dict(self) -> Dict:
        """Serialize node to dict"""
        return {
            'id': self.id,
            'type': self.NODE_ID,
            'inputs': self.inputs,
            'outputs': self.outputs,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'BaseNode':
        """Deserialize node from dict"""
        node = cls(node_id=data.get('id'))
        for name, value in data.get('inputs', {}).items():
            node.set_input(name, value)
        return node

    @classmethod
    def get_schema(cls) -> Dict:
        """Get node schema for frontend"""
        return {
            'id': cls.NODE_ID,
            'name': cls.NODE_NAME,
            'category': cls.NODE_CATEGORY,
            'description': cls.NODE_DESCRIPTION,
            'inputs': cls.INPUTS,
            'outputs': cls.OUTPUTS,
        }
