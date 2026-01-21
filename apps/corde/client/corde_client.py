#!/usr/bin/env python3
"""
CORDE Client - Remote image/video generation via API

Usage from another Mac:
    from corde_client import CordeClient

    client = CordeClient("http://192.168.1.234:3700")

    # Generate image
    job_id = client.generate_image("a cat sitting on a windowsill", author="pina-pennello")
    result = client.wait_for_job(job_id)
    client.download_output(result['output'], "cat.png")
"""

import requests
import time
import json
from pathlib import Path
from typing import Optional, Dict, Any


class CordeClient:
    """Client for CORDE API"""

    def __init__(self, base_url: str = "http://localhost:3700"):
        self.base_url = base_url.rstrip('/')
        self._check_connection()

    def _check_connection(self):
        """Verify connection to server"""
        try:
            r = requests.get(f"{self.base_url}/api/health", timeout=5)
            r.raise_for_status()
            info = r.json()
            print(f"✅ Connected to CORDE @ {self.base_url}")
            print(f"   Device: {info.get('device', 'unknown')}")
            print(f"   Host: {info.get('hostname', 'unknown')}")
        except Exception as e:
            raise ConnectionError(f"Cannot connect to CORDE API: {e}")

    def health(self) -> Dict:
        """Get server health status"""
        r = requests.get(f"{self.base_url}/api/health")
        return r.json()

    def list_templates(self) -> Dict:
        """List available generation templates"""
        r = requests.get(f"{self.base_url}/api/templates")
        return r.json()

    def list_authors(self) -> Dict:
        """List available author/illustrator styles"""
        r = requests.get(f"{self.base_url}/api/authors")
        return r.json()

    def list_jobs(self) -> list:
        """List all jobs"""
        r = requests.get(f"{self.base_url}/api/jobs")
        return r.json()

    def get_job(self, job_id: str) -> Dict:
        """Get job status"""
        r = requests.get(f"{self.base_url}/api/jobs/{job_id}")
        return r.json()

    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = "",
        author: str = "pina-pennello",
        width: int = 1024,
        height: int = 1024,
        steps: int = 30,
        guidance: float = 7.5,
        seed: Optional[int] = None,
    ) -> str:
        """
        Generate a single image.

        Args:
            prompt: Image description
            negative_prompt: What to avoid
            author: Style preset (pina-pennello, magmatic, onde-futures, luzzati)
            width, height: Image dimensions (1024x1024 default)
            steps: Inference steps (30 default)
            guidance: Guidance scale (7.5 default)
            seed: Random seed (None for random)

        Returns:
            job_id: ID to track the generation job
        """
        r = requests.post(f"{self.base_url}/api/generate/image", json={
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "author": author,
            "width": width,
            "height": height,
            "steps": steps,
            "guidance": guidance,
            "seed": seed,
        })
        r.raise_for_status()
        return r.json()["job_id"]

    def generate_video(
        self,
        poem_text: str,
        template: str = "video-poesia",
        style: str = "onde-watercolor",
        mood: str = "serene",
        duration: int = 60,
    ) -> str:
        """Generate video from poem"""
        r = requests.post(f"{self.base_url}/api/generate/video", json={
            "template": template,
            "poem_text": poem_text,
            "style": style,
            "mood": mood,
            "duration": duration,
        })
        r.raise_for_status()
        return r.json()["job_id"]

    def generate_book(
        self,
        title: str,
        theme: str,
        template: str = "libro-illustrato",
        chapters: int = 8,
        age_target: str = "3-6",
    ) -> str:
        """Generate illustrated book"""
        r = requests.post(f"{self.base_url}/api/generate/book", json={
            "template": template,
            "title": title,
            "theme": theme,
            "chapters": chapters,
            "age_target": age_target,
        })
        r.raise_for_status()
        return r.json()["job_id"]

    def wait_for_job(
        self,
        job_id: str,
        timeout: int = 600,
        poll_interval: float = 2.0,
        verbose: bool = True,
    ) -> Dict:
        """
        Wait for job to complete.

        Args:
            job_id: Job ID to wait for
            timeout: Max seconds to wait
            poll_interval: Seconds between status checks
            verbose: Print progress updates

        Returns:
            Completed job data
        """
        start = time.time()
        last_progress = -1

        while time.time() - start < timeout:
            job = self.get_job(job_id)
            status = job.get("status")
            progress = job.get("progress", 0)

            if verbose and progress != last_progress:
                print(f"  [{progress}%] {status}")
                last_progress = progress

            if status == "completed":
                return job
            elif status == "failed":
                raise Exception(f"Job failed: {job.get('error')}")

            time.sleep(poll_interval)

        raise TimeoutError(f"Job {job_id} did not complete in {timeout}s")

    def download_output(self, output_path: str, local_path: str):
        """
        Download generated file from server.

        Args:
            output_path: Server path returned in job output
            local_path: Where to save locally
        """
        filename = Path(output_path).name
        r = requests.get(f"{self.base_url}/api/output/{filename}", stream=True)
        r.raise_for_status()

        local = Path(local_path)
        local.parent.mkdir(parents=True, exist_ok=True)

        with open(local, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"✅ Downloaded: {local_path}")


# Quick test
if __name__ == "__main__":
    import sys

    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3700"

    client = CordeClient(url)
    print("\n📋 Available Authors:")
    for name, info in client.list_authors().items():
        print(f"  • {name}: {info['style']}")

    print("\n📋 Available Templates:")
    for name, info in client.list_templates().items():
        print(f"  • {name}: {info['description']}")
