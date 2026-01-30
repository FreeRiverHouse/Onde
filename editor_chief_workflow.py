#!/usr/bin/env python3
"""
WORKFLOW EDITORE CAPO - SISTEMA TRADUZIONE PROFESSIONALE
Integrazione completa procedura traduzione a prova di bomba
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from pathlib import Path

from translation_engine import BombproofTranslationSystem, QualityLevel, QualityMetrics
from quality_automation import QualityAutomationSystem, QualityDashboard

# Configurazione logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EditorChiefWorkflow:
    """Workflow completo per Editore Capo Onde"""
    
    def __init__(self, workspace_path: str = "/Users/mattiapetrucciani/Onde"):
        self.workspace_path = Path(workspace_path)
        self.quality_system = QualityAutomationSystem()
        self.translation_engine = BombproofTranslationSystem()
        self.logger = logging.getLogger(__name__)
        
        # Directory workflow
        self.setup_directories()
        
        # Carica configurazione
        self.load_configuration()
    
    def setup_directories(self):
        """Setup directory workflow"""
        
        self.directories = {
            'inbox': self.workspace_path / 'inbox',
            'projects': self.workspace_path / 'projects',
            'translations': self.workspace_path / 'translations',
            'reviews': self.workspace_path / 'reviews',
            'archives': self.workspace_path / 'archives',
            'reports': self.workspace_path / 'reports'
        }
        
        for directory in self.directories.values():
            directory.mkdir(exist_ok=True)
        
        self.logger.info("Directory workflow create")
    
    def load_configuration(self):
        """Carica configurazione editore capo"""
        
        config_file = self.workspace_path / 'editor_config.json'
        
        default_config = {
            'quality_standards': {
                'minimum': 0.95,
                'professional': 0.97,
                'excellence': 0.99
            },
            'workflow_settings': {
                'auto_review': True,
                'generate_reports': True,
                'archive_completed': True,
                'notify_issues': True
            },
            'domain_specializations': {
                'philosophy': 'high',
                'economics': 'high',
                'politics': 'medium',
                'literature': 'medium',
                'technical': 'high'
            }
        }
        
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            self.config = default_config
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        
        self.logger.info("Configurazione editore capo caricata")
    
    def receive_document(self, document_path: str, priority: str = 'normal', quality_target: QualityLevel = QualityLevel.PROFESSIONAL) -> str:
        """Ricevi documento per traduzione"""
        
        # Verifica esistenza documento
        if not os.path.exists(document_path):
            raise FileNotFoundError(f"Documento non trovato: {document_path}")
        
        # Copia in inbox
        document_name = os.path.basename(document_path)
        inbox_path = self.directories['inbox'] / document_name
        
        import shutil
        shutil.copy2(document_path, inbox_path)
        
        # Crea progetto
        project_id = self.quality_system.create_translation_project(str(inbox_path), quality_target)
        
        # Registra progetto
        project_info = {
            'project_id': project_id,
            'original_document': document_path,
            'inbox_copy': str(inbox_path),
            'priority': priority,
            'quality_target': quality_target.value,
            'status': 'received',
            'created_at': datetime.now().isoformat(),
            'workflow_stage': 'inbox'
        }
        
        self.save_project_info(project_id, project_info)
        
        self.logger.info(f"Documento ricevuto: {document_name} -> Progetto: {project_id}")
        
        return project_id
    
    def save_project_info(self, project_id: str, project_info: Dict):
        """Salva informazioni progetto"""
        
        project_file = self.directories['projects'] / f"{project_id}.json"
        
        with open(project_file, 'w', encoding='utf-8') as f:
            json.dump(project_info, f, indent=2, ensure_ascii=False)
    
    def load_project_info(self, project_id: str) -> Optional[Dict]:
        """Carica informazioni progetto"""
        
        project_file = self.directories['projects'] / f"{project_id}.json"
        
        if project_file.exists():
            with open(project_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        return None
    
    def start_translation_workflow(self, project_id: str) -> Dict:
        """Avvia workflow traduzione completo"""
        
        self.logger.info(f"Inizio workflow traduzione: {project_id}")
        
        # Carica info progetto
        project_info = self.load_project_info(project_id)
        if not project_info:
            return {'success': False, 'error': 'Project not found'}
        
        # Aggiorna stato
        project_info['status'] = 'translating'
        project_info['workflow_stage'] = 'translation'
        project_info['started_at'] = datetime.now().isoformat()
        self.save_project_info(project_id, project_info)
        
        try:
            # Esegui traduzione con monitoraggio
            result = self.quality_system.execute_translation_with_monitoring(project_id)
            
            if result['success']:
                # Salva traduzione
                translation_path = self.save_translation(project_id, result)
                
                # Aggiorna info progetto
                project_info['status'] = 'translated'
                project_info['workflow_stage'] = 'review'
                project_info['translation_path'] = translation_path
                project_info['completed_at'] = datetime.now().isoformat()
                project_info['quality_metrics'] = result['project_status']['current_metrics']
                
                self.save_project_info(project_id, project_info)
                
                # Genera report automatico
                if self.config['workflow_settings']['generate_reports']:
                    report_path = self.generate_quality_report(project_id, result['quality_report'])
                    project_info['report_path'] = report_path
                
                # Auto-review se configurato
                if self.config['workflow_settings']['auto_review']:
                    review_result = self.auto_review_translation(project_id)
                    project_info['auto_review'] = review_result
                
                self.save_project_info(project_id, project_info)
                
                self.logger.info(f"Traduzione completata: {project_id}")
                
                return {
                    'success': True,
                    'project_id': project_id,
                    'translation_path': translation_path,
                    'quality_score': result['project_status']['current_metrics']['overall_score'],
                    'meets_target': result['project_status']['current_metrics']['overall_score'] >= project_info['quality_target']
                }
            else:
                project_info['status'] = 'error'
                project_info['error'] = result['error']
                self.save_project_info(project_id, project_info)
                
                return result
        
        except Exception as e:
            self.logger.error(f"Errore workflow {project_id}: {e}")
            project_info['status'] = 'error'
            project_info['error'] = str(e)
            self.save_project_info(project_id, project_info)
            
            return {'success': False, 'error': str(e)}
    
    def save_translation(self, project_id: str, result: Dict) -> str:
        """Salva traduzione completata"""
        
        project_info = self.load_project_info(project_id)
        original_name = os.path.basename(project_info['original_document'])
        
        # Nome file traduzione
        translation_name = f"translated_{project_id}_{original_name}"
        translation_path = self.directories['translations'] / translation_name
        
        # Salva traduzione (qui dovremmo estrarre il testo tradotto dal risultato)
        # Per ora simuliamo il salvataggio
        with open(translation_path, 'w', encoding='utf-8') as f:
            f.write(f"# TRADUZIONE COMPLETA - {project_id}\n\n")
            f.write(f"Documento: {original_name}\n")
            f.write(f"Qualità: {result['project_status']['current_metrics']['overall_score']:.2%}\n")
            f.write(f"Target: {project_info['quality_target']:.2%}\n\n")
            f.write("# CONTENUTO TRADOTTO\n\n")
            f.write("[Testo traduzione completa andrebbe qui]\n")
        
        self.logger.info(f"Traduzione salvata: {translation_path}")
        
        return str(translation_path)
    
    def generate_quality_report(self, project_id: str, quality_report: Dict) -> str:
        """Genera report qualità dettagliato"""
        
        project_info = self.load_project_info(project_id)
        original_name = os.path.basename(project_info['original_document'])
        
        # Nome file report
        report_name = f"quality_report_{project_id}_{original_name.replace('.', '_')}.json"
        report_path = self.directories['reports'] / report_name
        
        # Aggiungi info progetto al report
        quality_report['project_info'] = project_info
        quality_report['generated_at'] = datetime.now().isoformat()
        
        # Salva report
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(quality_report, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Report qualità generato: {report_path}")
        
        return str(report_path)
    
    def auto_review_translation(self, project_id: str) -> Dict:
        """Auto-review traduzione"""
        
        project_info = self.load_project_info(project_id)
        quality_metrics = project_info.get('quality_metrics', {})
        
        review_result = {
            'auto_review_completed': True,
            'reviewed_at': datetime.now().isoformat(),
            'issues_found': [],
            'recommendations': [],
            'approval_status': 'pending'
        }
        
        # Controlla metriche qualità
        if quality_metrics:
            if quality_metrics.get('overall_score', 0) < project_info['quality_target']:
                review_result['issues_found'].append("Qualità sotto target")
                review_result['recommendations'].append("Richiedi revisione manuale")
                review_result['approval_status'] = 'rejected'
            else:
                review_result['approval_status'] = 'approved'
        
        # Controlla alert critici
        if quality_metrics.get('critical_alerts', 0) > 0:
            review_result['issues_found'].append("Alert critici presenti")
            review_result['recommendations'].append("Rivedi problemi critici")
            review_result['approval_status'] = 'needs_review'
        
        return review_result
    
    def get_project_status(self, project_id: str) -> Optional[Dict]:
        """Ottieni stato completo progetto"""
        
        # Status da quality system
        quality_status = self.quality_system.dashboard.get_project_status(project_id)
        
        # Status da workflow
        workflow_status = self.load_project_info(project_id)
        
        if not workflow_status:
            return None
        
        # Combina status
        combined_status = {
            'workflow': workflow_status,
            'quality': quality_status
        }
        
        return combined_status
    
    def list_active_projects(self) -> List[Dict]:
        """Lista progetti attivi"""
        
        active_projects = []
        
        for project_file in self.directories['projects'].glob("*.json"):
            project_id = project_file.stem
            project_info = self.load_project_info(project_id)
            
            if project_info and project_info['status'] not in ['archived', 'completed']:
                active_projects.append({
                    'project_id': project_id,
                    'document': os.path.basename(project_info['original_document']),
                    'status': project_info['status'],
                    'stage': project_info['workflow_stage'],
                    'created_at': project_info['created_at'],
                    'priority': project_info.get('priority', 'normal')
                })
        
        return sorted(active_projects, key=lambda x: x['created_at'], reverse=True)
    
    def approve_translation(self, project_id: str, approver: str = "Editor Capo") -> Dict:
        """Approva traduzione per consegna"""
        
        project_info = self.load_project_info(project_id)
        if not project_info:
            return {'success': False, 'error': 'Project not found'}
        
        if project_info['status'] != 'translated':
            return {'success': False, 'error': 'Translation not completed'}
        
        # Aggiorna stato
        project_info['status'] = 'approved'
        project_info['workflow_stage'] = 'delivery'
        project_info['approved_by'] = approver
        project_info['approved_at'] = datetime.now().isoformat()
        
        self.save_project_info(project_id, project_info)
        
        # Prepara per consegna
        delivery_path = self.prepare_delivery(project_id)
        project_info['delivery_path'] = delivery_path
        
        # Archivia se configurato
        if self.config['workflow_settings']['archive_completed']:
            self.archive_project(project_id)
        
        self.save_project_info(project_id, project_info)
        
        self.logger.info(f"Traduzione approvata: {project_id} da {approver}")
        
        return {
            'success': True,
            'project_id': project_id,
            'delivery_path': delivery_path,
            'approved_by': approver,
            'approved_at': project_info['approved_at']
        }
    
    def prepare_delivery(self, project_id: str) -> str:
        """Prepara pacchetto consegna"""
        
        project_info = self.load_project_info(project_id)
        
        # Crea directory consegna
        delivery_dir = self.directories['translations'] / f"delivery_{project_id}"
        delivery_dir.mkdir(exist_ok=True)
        
        # Copia traduzione
        if 'translation_path' in project_info:
            import shutil
            translation_name = os.path.basename(project_info['translation_path'])
            shutil.copy2(project_info['translation_path'], delivery_dir / translation_name)
        
        # Copia report qualità
        if 'report_path' in project_info:
            report_name = os.path.basename(project_info['report_path'])
            shutil.copy2(project_info['report_path'], delivery_dir / report_name)
        
        # Crea manifesto consegna
        manifest = {
            'project_id': project_id,
            'document': os.path.basename(project_info['original_document']),
            'delivered_at': datetime.now().isoformat(),
            'quality_score': project_info.get('quality_metrics', {}).get('overall_score', 0),
            'files': [f.name for f in delivery_dir.glob("*") if f.is_file()]
        }
        
        with open(delivery_dir / "delivery_manifest.json", 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        return str(delivery_dir)
    
    def archive_project(self, project_id: str):
        """Archivia progetto completato"""
        
        project_info = self.load_project_info(project_id)
        if not project_info:
            return
        
        # Aggiorna stato
        project_info['status'] = 'archived'
        project_info['workflow_stage'] = 'completed'
        project_info['archived_at'] = datetime.now().isoformat()
        
        self.save_project_info(project_id, project_info)
        
        # Sposta in archivio
        project_file = self.directories['projects'] / f"{project_id}.json"
        archive_file = self.directories['archives'] / f"{project_id}.json"
        
        if project_file.exists():
            import shutil
            shutil.move(project_file, archive_file)
        
        self.logger.info(f"Progetto archiviato: {project_id}")
    
    def get_system_overview(self) -> Dict:
        """Ottieni overview sistema completo"""
        
        # Statistiche progetti
        active_projects = self.list_active_projects()
        
        # Statistiche qualità
        quality_status = self.quality_system.get_system_status()
        
        # Directory status
        directory_status = {}
        for name, path in self.directories.items():
            directory_status[name] = {
                'path': str(path),
                'files_count': len(list(path.glob("*"))),
                'size_mb': sum(f.stat().st_size for f in path.glob("*") if f.is_file()) / (1024 * 1024)
            }
        
        overview = {
            'system_status': 'operational',
            'editor_chief': 'Mattia Cenci',
            'workspace': str(self.workspace_path),
            'projects': {
                'active_count': len(active_projects),
                'active_projects': active_projects[:5]  # Ultimi 5
            },
            'quality_system': quality_status,
            'directories': directory_status,
            'configuration': {
                'quality_standards': self.config['quality_standards'],
                'workflow_settings': self.config['workflow_settings']
            },
            'last_updated': datetime.now().isoformat()
        }
        
        return overview

# Sistema principale Editore Capo
class EditorChiefSystem:
    """Sistema principale Editore Capo Onde"""
    
    def __init__(self):
        self.workflow = EditorChiefWorkflow()
        self.logger = logging.getLogger(__name__)
    
    def process_document(self, document_path: str, priority: str = 'normal', quality_target: QualityLevel = QualityLevel.PROFESSIONAL) -> Dict:
        """Processa documento completo - ricevi -> traduci -> approva"""
        
        self.logger.info(f"Processo completo documento: {document_path}")
        
        try:
            # 1. Ricevi documento
            project_id = self.workflow.receive_document(document_path, priority, quality_target)
            self.logger.info(f"Documento ricevuto - Progetto: {project_id}")
            
            # 2. Avvia traduzione
            translation_result = self.workflow.start_translation_workflow(project_id)
            
            if not translation_result['success']:
                return {
                    'success': False,
                    'error': f"Translation failed: {translation_result.get('error', 'Unknown error')}",
                    'project_id': project_id
                }
            
            self.logger.info(f"Traduzione completata - Qualità: {translation_result['quality_score']:.2%}")
            
            # 3. Auto-approva se qualità sufficiente
            if translation_result['meets_target']:
                approval_result = self.workflow.approve_translation(project_id)
                
                if approval_result['success']:
                    self.logger.info(f"Traduzione approvata e pronta per consegna")
                    return {
                        'success': True,
                        'project_id': project_id,
                        'quality_score': translation_result['quality_score'],
                        'delivery_path': approval_result['delivery_path'],
                        'status': 'completed'
                    }
                else:
                    return {
                        'success': False,
                        'error': f"Approval failed: {approval_result.get('error', 'Unknown error')}",
                        'project_id': project_id,
                        'quality_score': translation_result['quality_score'],
                        'status': 'needs_manual_approval'
                    }
            else:
                self.logger.warning(f"Qualità sotto target - richiede revisione manuale")
                return {
                    'success': False,
                    'error': f"Quality below target: {translation_result['quality_score']:.2%} < {quality_target.value:.2%}",
                    'project_id': project_id,
                    'quality_score': translation_result['quality_score'],
                    'status': 'needs_revision'
                }
        
        except Exception as e:
            self.logger.error(f"Errore processo documento: {e}")
            return {
                'success': False,
                'error': str(e),
                'status': 'error'
            }
    
    def get_dashboard(self) -> Dict:
        """Ottieni dashboard completa"""
        
        return self.workflow.get_system_overview()

# Esempio utilizzo completo
if __name__ == "__main__":
    # Inizializza sistema Editore Capo
    editor_system = EditorChiefSystem()
    
    # Processa documento completo
    document_path = "/Users/mattiapetrucciani/Downloads/capussela spirito repubblicano.docx"
    
    print("🚀 Inizio processo completo Editore Capo...")
    result = editor_system.process_document(
        document_path,
        priority='high',
        quality_target=QualityLevel.PROFESSIONAL
    )
    
    if result['success']:
        print(f"✅ Processo completato con successo!")
        print(f"📊 Qualità: {result['quality_score']:.2%}")
        print(f"📁 Consegna: {result['delivery_path']}")
        print(f"📋 Status: {result['status']}")
    else:
        print(f"❌ Processo fallito: {result['error']}")
        print(f"📋 Status: {result.get('status', 'unknown')}")
        if 'project_id' in result:
            print(f"🔍 Progetto ID: {result['project_id']}")
    
    # Mostra dashboard
    print(f"\n📊 Dashboard Sistema:")
    dashboard = editor_system.get_dashboard()
    
    print(f"  - Sistema: {dashboard['system_status']}")
    print(f"  - Progetti attivi: {dashboard['projects']['active_count']}")
    print(f"  - Qualità media: {dashboard['quality_system']['average_quality']:.2%}")
    print(f"  - Success rate: {dashboard['quality_system']['success_rate']:.2%}")
    
    print(f"\n📁 Directory workspace:")
    for name, info in dashboard['directories'].items():
        print(f"  - {name}: {info['files_count']} files, {info['size_mb']:.1f}MB")
