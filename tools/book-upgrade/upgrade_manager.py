#!/usr/bin/env python3
"""
FreeRiver Flow - Book Upgrade Manager V1-V2
Procedura di upgrade automatizzata con loop agentici
"""

import os
import json
import git
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass

from automated_upgrade_loop import AutomatedUpgradeLoop

@dataclass
class BookBug:
    id: str
    category: str  # content, formatting, technical, translation, design
    severity: str  # low, medium, high, critical
    description: str
    location: str  # chapter/page/line
    found_by: str  # user, editor, automated
    status: str   # open, in_progress, fixed, verified
    assigned_to: str
    created_at: str
    updated_at: str

@dataclass
class BookVersion:
    version: str
    status: str  # development, testing, deployed, deprecated
    created_at: str
    bugs_fixed: int
    features_added: int
    quality_score: float

class BookUpgradeManager:
    def __init__(self, book_path: str):
        self.book_path = Path(book_path)
        self.repo = None
        self.bugs = []
        self.versions = []
        self.automated_loop = None
        
        # Initialize git repo
        try:
            self.repo = git.Repo(self.book_path)
        except:
            print("⚠️  Not a git repository - initializing...")
            self.repo = git.Repo.init(self.book_path)
        
        # Initialize automated loop
        self.automated_loop = AutomatedUpgradeLoop(book_path)
        
        # Load existing data
        self.load_bugs()
        self.load_versions()
    
    def execute_upgrade_v1_v2(self, book_name: str) -> Dict:
        """Esegue procedura di upgrade V1-V2 completa"""
        
        print(f"🚀 PROCEDURA DI UPGRADE V1-V2")
        print(f"📚 Libro: {book_name}")
        print("🔄 Loop agentici automatizzati in avvio...")
        
        # Fase 1: Setup
        self.setup_upgrade_environment()
        
        # Fase 2: Esegui loop agentici automatico
        loop_result = self.automated_loop.run_upgrade_loop(book_name)
        
        # Fase 3: Finalizzazione
        final_result = self.finalize_upgrade(loop_result, book_name)
        
        return final_result
    
    def setup_upgrade_environment(self):
        """Setup ambiente upgrade"""
        
        # Create upgrade branch
        branch_name = "upgrade/v1-v2"
        try:
            self.repo.git.checkout('-b', branch_name)
        except:
            self.repo.git.checkout(branch_name)
        
        # Tag V1 if not exists
        try:
            self.repo.git.tag('v1.0.0', force=True)
        except:
            pass
        
        print("✅ Ambiente upgrade configurato")
    
    def finalize_upgrade(self, loop_result: Dict, book_name: str) -> Dict:
        """Finalizza upgrade V1-V2"""
        
        # Create V2 tag
        self.repo.git.tag('v2.0.0', force=True)
        
        # Generate final report
        final_report = {
            "upgrade_type": "V1-V2",
            "book_name": book_name,
            "trigger": f"Fai l'upgrade del libro {book_name}",
            "result": f"Libro più fico da tutti i punti di vista",
            "loop_results": loop_result,
            "version_created": "v2.0.0",
            "upgrade_completed": datetime.now().isoformat(),
            "automated_process": True,
            "agents_used": ["Anti-Slop", "Grok Reviewer", "Quality Analyzer", "Design Enhancer", "Revenue Optimizer"]
        }
        
        # Save final report
        report_file = self.book_path / "upgrade_v1_v2_final.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, indent=2, ensure_ascii=False)
        
        print(f"🎉 UPGRADE V1-V2 COMPLETATO!")
        print(f"📚 {book_name} è ora più fico!")
        print(f"🏷️  Versione v2.0.0 creata")
        
        return final_report
    
    def start_upgrade(self, target_version: str = "2.0.0") -> Dict:
        """Inizia procedura upgrade"""
        
        print(f"🚀 Starting upgrade to {target_version}")
        
        # Create upgrade branch
        branch_name = f"upgrade/v{target_version}"
        try:
            self.repo.git.checkout('-b', branch_name)
        except:
            self.repo.git.checkout(branch_name)
        
        # Phase 1: Assessment
        assessment = self.assess_current_version()
        
        # Phase 2: Planning
        plan = self.plan_upgrade(assessment, target_version)
        
        # Phase 3: Create upgrade structure
        self.create_upgrade_structure(target_version)
        
        return {
            "status": "upgrade_started",
            "target_version": target_version,
            "branch": branch_name,
            "assessment": assessment,
            "plan": plan
        }
    
    def assess_current_version(self) -> Dict:
        """Fase 1: Assessment versione corrente"""
        
        print("🔍 Phase 1: Assessing current version...")
        
        assessment = {
            "current_version": self.get_current_version(),
            "file_count": len(list(self.book_path.rglob("*.md"))),
            "word_count": self.count_words(),
            "quality_issues": self.run_quality_checks(),
            "bugs_found": self.detect_bugs(),
            "performance_metrics": self.get_performance_metrics()
        }
        
        # Save assessment
        self.save_assessment(assessment)
        
        return assessment
    
    def plan_upgrade(self, assessment: Dict, target_version: str) -> Dict:
        """Fase 2: Planning upgrade"""
        
        print("📋 Phase 2: Planning upgrade...")
        
        plan = {
            "target_version": target_version,
            "timeline": "7_days",
            "phases": [
                {
                    "phase": "Bug Fixes",
                    "priority": "HIGH",
                    "items": self.plan_bug_fixes(assessment["bugs_found"])
                },
                {
                    "phase": "Feature Additions", 
                    "priority": "MEDIUM",
                    "items": self.plan_feature_additions()
                },
                {
                    "phase": "Quality Improvements",
                    "priority": "HIGH", 
                    "items": self.plan_quality_improvements(assessment["quality_issues"])
                },
                {
                    "phase": "Testing & QA",
                    "priority": "CRITICAL",
                    "items": self.plan_testing()
                }
            ],
            "resources_needed": self.calculate_resources(),
            "risks": self.identify_risks()
        }
        
        self.save_plan(plan)
        return plan
    
    def create_upgrade_structure(self, target_version: str):
        """Crea struttura per upgrade"""
        
        print("🏗️  Phase 3: Creating upgrade structure...")
        
        # Create directories
        upgrade_dir = self.book_path / f"upgrade-v{target_version}"
        upgrade_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (upgrade_dir / "bugs").mkdir(exist_ok=True)
        (upgrade_dir / "features").mkdir(exist_ok=True)
        (upgrade_dir / "tests").mkdir(exist_ok=True)
        (upgrade_dir / "docs").mkdir(exist_ok=True)
        
        # Create upgrade plan file
        plan_file = upgrade_dir / "UPGRADE_PLAN.md"
        with open(plan_file, 'w') as f:
            f.write(f"# Upgrade Plan v{target_version}\n\n")
            f.write(f"Started: {datetime.now().isoformat()}\n")
            f.write(f"Target: Complete upgrade in 7 days\n")
    
    def run_quality_checks(self) -> List[Dict]:
        """Esegue controlli qualità automatici"""
        
        issues = []
        
        # Check for corrupted characters
        for md_file in self.book_path.rglob("*.md"):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for common issues
                if 'â€™' in content:
                    issues.append({
                        "type": "corrupted_characters",
                        "file": str(md_file),
                        "severity": "medium",
                        "description": "Corrupted apostrophes found"
                    })
                
                # Check for external publishers
                publishers = ['Penguin', 'Random House', 'HarperCollins']
                for publisher in publishers:
                    if publisher in content:
                        issues.append({
                            "type": "external_publisher",
                            "file": str(md_file),
                            "severity": "high",
                            "description": f"Reference to {publisher}"
                        })
        
        return issues
    
    def detect_bugs(self) -> List[BookBug]:
        """Rileva bug automaticamente"""
        
        bugs = []
        
        # Run anti-slop checker
        try:
            from anti_slop_checker import AntiSlopChecker
            checker = AntiSlopChecker()
            
            for md_file in self.book_path.rglob("*.md"):
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    results = checker.check_text(content)
                    
                    for error in results.get('errors', []):
                        bug = BookBug(
                            id=f"auto-{len(bugs)}",
                            category=error.get('type', 'technical'),
                            severity='high' if error.get('type') == 'external_publisher' else 'medium',
                            description=error.get('description', ''),
                            location=f"{md_file}:{error.get('line', 0)}",
                            found_by='automated',
                            status='open',
                            assigned_to='system',
                            created_at=datetime.now().isoformat(),
                            updated_at=datetime.now().isoformat()
                        )
                        bugs.append(bug)
        
        except ImportError:
            print("⚠️  Anti-slop checker not available")
        
        return bugs
    
    def plan_bug_fixes(self, bugs: List[BookBug]) -> List[Dict]:
        """Pianifica correzione bug"""
        
        fixes = []
        
        # Group by severity
        critical_bugs = [b for b in bugs if b.severity == 'critical']
        high_bugs = [b for b in bugs if b.severity == 'high']
        medium_bugs = [b for b in bugs if b.severity == 'medium']
        
        if critical_bugs:
            fixes.append({
                "task": "Fix critical bugs",
                "priority": "URGENT",
                "items": [b.description for b in critical_bugs],
                "estimated_time": "1 day"
            })
        
        if high_bugs:
            fixes.append({
                "task": "Fix high priority bugs", 
                "priority": "HIGH",
                "items": [b.description for b in high_bugs],
                "estimated_time": "2 days"
            })
        
        if medium_bugs:
            fixes.append({
                "task": "Fix medium bugs",
                "priority": "MEDIUM", 
                "items": [b.description for b in medium_bugs],
                "estimated_time": "1 day"
            })
        
        return fixes
    
    def plan_feature_additions(self) -> List[Dict]:
        """Pianifica aggiunte features"""
        
        return [
            {
                "task": "Add PR Dashboard case study",
                "priority": "MEDIUM",
                "description": "Add real project example from Onde",
                "estimated_time": "1 day"
            },
            {
                "task": "Add Project Management section",
                "priority": "MEDIUM", 
                "description": "Include workflow examples",
                "estimated_time": "1 day"
            },
            {
                "task": "Update tools section",
                "priority": "LOW",
                "description": "Add latest AI tools",
                "estimated_time": "0.5 day"
            }
        ]
    
    def plan_quality_improvements(self, issues: List[Dict]) -> List[Dict]:
        """Pianifica miglioramenti qualità"""
        
        improvements = []
        
        for issue in issues:
            improvements.append({
                "task": f"Fix {issue['type']}",
                "priority": "HIGH" if issue['severity'] == 'high' else "MEDIUM",
                "file": issue['file'],
                "description": issue['description'],
                "estimated_time": "0.5 day"
            })
        
        return improvements
    
    def plan_testing(self) -> List[Dict]:
        """Pianifica testing"""
        
        return [
            {
                "task": "Run Anti-Slop Pipeline",
                "priority": "CRITICAL",
                "description": "Complete automated quality check",
                "estimated_time": "0.5 day"
            },
            {
                "task": "Manual Review",
                "priority": "HIGH",
                "description": "Editor Capo manual review",
                "estimated_time": "1 day"
            },
            {
                "task": "Beta Testing",
                "priority": "MEDIUM",
                "description": "User feedback collection",
                "estimated_time": "1 day"
            }
        ]
    
    def count_words(self) -> int:
        """Conta parole nel libro"""
        
        total_words = 0
        for md_file in self.book_path.rglob("*.md"):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                words = len(content.split())
                total_words += words
        
        return total_words
    
    def get_current_version(self) -> str:
        """Ottiene versione corrente"""
        
        try:
            # Try to get from git tags
            tags = self.repo.tags
            if tags:
                return str(tags[-1])
        except:
            pass
        
        return "1.0.0"
    
    def get_performance_metrics(self) -> Dict:
        """Ottiene metriche performance"""
        
        return {
            "load_time": "0.1s",  # Simulated
            "file_size": sum(f.stat().st_size for f in self.book_path.rglob("*") if f.is_file()),
            "complexity": "medium"
        }
    
    def calculate_resources(self) -> Dict:
        """Calcola risorse necessarie"""
        
        return {
            "developer_days": 5,
            "editor_days": 2,
            "tester_days": 1,
            "total_cost_estimate": "€2000"
        }
    
    def identify_risks(self) -> List[Dict]:
        """Identifica rischi"""
        
        return [
            {
                "risk": "Scope creep",
                "probability": "medium",
                "impact": "medium",
                "mitigation": "Strict scope control"
            },
            {
                "risk": "Quality issues",
                "probability": "low",
                "impact": "high", 
                "mitigation": "Extensive testing"
            }
        ]
    
    def save_assessment(self, assessment: Dict):
        """Salva assessment"""
        
        assessment_file = self.book_path / "upgrade-assessment.json"
        with open(assessment_file, 'w') as f:
            json.dump(assessment, f, indent=2)
    
    def save_plan(self, plan: Dict):
        """Salva piano upgrade"""
        
        plan_file = self.book_path / "upgrade-plan.json"
        with open(plan_file, 'w') as f:
            json.dump(plan, f, indent=2)
    
    def load_bugs(self):
        """Carica bug esistenti"""
        
        bugs_file = self.book_path / "bugs.json"
        if bugs_file.exists():
            with open(bugs_file, 'r') as f:
                bugs_data = json.load(f)
                self.bugs = [BookBug(**bug) for bug in bugs_data]
    
    def load_versions(self):
        """Carica versioni"""
        
        versions_file = self.book_path / "versions.json"
        if versions_file.exists():
            with open(versions_file, 'r') as f:
                self.versions = json.load(f)

def main():
    if len(sys.argv) != 2:
        print("Uso: python upgrade_manager.py <path_to_book>")
        sys.exit(1)
    
    book_path = sys.argv[1]
    
    if not os.path.exists(book_path):
        print(f"Errore: Directory {book_path} non trovata")
        sys.exit(1)
    
    manager = BookUpgradeManager(book_path)
    result = manager.start_upgrade("2.0.0")
    
    print("🚀 UPGRADE STARTED!")
    print(f"Target version: {result['target_version']}")
    print(f"Branch: {result['branch']}")
    print(f"Bugs found: {len(result['assessment']['bugs_found'])}")
    print(f"Quality issues: {len(result['assessment']['quality_issues'])}")

if __name__ == "__main__":
    import sys
    main()
