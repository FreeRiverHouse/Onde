#!/usr/bin/env python3
"""
FEEDBACK LOOP SYSTEM - AGENTI COLLABORATIVI ONDE
Sistema di continuous improvement tra Tech-Support e Editor Chief
"""

import json
import logging
import time
import threading
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from queue import Queue, Empty

# Import agenti
from tech_support_agent import TechSupportAgent, TechnicalIssue
from editor_chief_agent import EditorChiefAgent, ValidationResult

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FeedbackLoopEvent:
    timestamp: datetime
    event_type: str
    source_agent: str
    target_agent: str
    event_data: Dict
    priority: str
    status: str

@dataclass
class CollaborationSession:
    session_id: str
    participants: List[str]
    topic: str
    created_at: datetime
    status: str
    events: List[FeedbackLoopEvent]
    outcomes: List[Dict]

class FeedbackLoopSystem:
    """Sistema di feedback loop continuo tra agenti"""
    
    def __init__(self, workspace_path: str = "/Users/mattiapetrucciani/Onde"):
        self.workspace_path = Path(workspace_path)
        self.system_name = "Feedback Loop System"
        self.system_id = "feedback_loop_001"
        
        # Setup workspace
        self.setup_workspace()
        
        # Inizializza agenti
        self.tech_agent = TechSupportAgent(workspace_path)
        self.editor_agent = EditorChiefAgent(workspace_path)
        
        # Sistema di messaggistica
        self.message_queue = Queue()
        self.active_sessions = {}
        
        # Metriche sistema
        self.system_metrics = {
            'total_events': 0,
            'successful_collaborations': 0,
            'improvements_implemented': 0,
            'average_resolution_time': 0.0,
            'agent_satisfaction': 0.0
        }
        
        # Avvia sistema
        self.running = False
        self.background_thread = None
        
        logger.info(f"{self.system_name} inizializzato")
    
    def setup_workspace(self):
        """Setup workspace sistema feedback"""
        
        self.system_dir = self.workspace_path / 'feedback_loop'
        self.system_dir.mkdir(parents=True, exist_ok=True)
        
        # Subdirectories
        (self.system_dir / 'sessions').mkdir(exist_ok=True)
        (self.system_dir / 'events').mkdir(exist_ok=True)
        (self.system_dir / 'metrics').mkdir(exist_ok=True)
        (self.system_dir / 'improvements').mkdir(exist_ok=True)
        
        logger.info("Workspace feedback loop creato")
    
    def start_system(self):
        """Avvia sistema feedback loop"""
        
        self.running = True
        self.background_thread = threading.Thread(target=self._background_processor, daemon=True)
        self.background_thread.start()
        
        logger.info("Sistema feedback loop avviato")
    
    def stop_system(self):
        """Ferma sistema feedback loop"""
        
        self.running = False
        if self.background_thread:
            self.background_thread.join(timeout=5)
        
        logger.info("Sistema feedback loop fermato")
    
    def _background_processor(self):
        """Processore background per eventi"""
        
        while self.running:
            try:
                # Processa eventi dalla coda
                try:
                    event_data = self.message_queue.get(timeout=1.0)
                    self._process_event(event_data)
                except Empty:
                    continue
                
                # Cleanup sessioni vecchie
                self._cleanup_old_sessions()
                
                # Aggiorna metriche
                self._update_system_metrics()
                
                time.sleep(0.1)  # Prevent busy waiting
                
            except Exception as e:
                logger.error(f"Errore processore background: {e}")
    
    def initiate_technical_issue_resolution(self, document_path: str, issue_description: str) -> str:
        """Inizia risoluzione problema tecnico con feedback loop"""
        
        logger.info(f"Inizio risoluzione problema tecnico: {document_path}")
        
        # Crea sessione collaborazione
        session_id = f"session_{int(time.time())}"
        
        session = CollaborationSession(
            session_id=session_id,
            participants=['tech_support', 'editor_chief'],
            topic=f"Technical Issue Resolution: {document_path}",
            created_at=datetime.now(),
            status='active',
            events=[],
            outcomes=[]
        )
        
        self.active_sessions[session_id] = session
        
        # Evento 1: Tech Support analizza problema
        tech_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='problem_analysis',
            source_agent='tech_support',
            target_agent='editor_chief',
            event_data={
                'document_path': document_path,
                'issue_description': issue_description,
                'analysis_requested': True
            },
            priority='high',
            status='pending'
        )
        
        self._add_event_to_session(session_id, tech_event)
        self.message_queue.put(tech_event)
        
        return session_id
    
    def _process_event(self, event: FeedbackLoopEvent):
        """Processa evento singolo"""
        
        logger.info(f"Processo evento: {event.event_type} da {event.source_agent}")
        
        self.system_metrics['total_events'] += 1
        
        try:
            if event.event_type == 'problem_analysis':
                self._handle_problem_analysis(event)
            elif event.event_type == 'solution_proposed':
                self._handle_solution_proposed(event)
            elif event.event_type == 'validation_request':
                self._handle_validation_request(event)
            elif event.event_type == 'validation_result':
                self._handle_validation_result(event)
            elif event.event_type == 'implementation_request':
                self._handle_implementation_request(event)
            elif event.event_type == 'implementation_complete':
                self._handle_implementation_complete(event)
            elif event.event_type == 'testing_complete':
                self._handle_testing_complete(event)
            elif event.event_type == 'improvement_approved':
                self._handle_improvement_approved(event)
            else:
                logger.warning(f"Tipo evento non gestito: {event.event_type}")
        
        except Exception as e:
            logger.error(f"Errore processo evento {event.event_type}: {e}")
            event.status = 'error'
    
    def _handle_problem_analysis(self, event: FeedbackLoopEvent):
        """Gestisce analisi problema"""
        
        # Tech Support analizza problema
        document_path = event.event_data['document_path']
        
        # Simula analisi fallimento traduzione
        translation_failure = {
            'quality_metrics': {
                'overall_score': 0.734,
                'semantic_fidelity': 0.68,
                'structural_integrity': 0.85,
                'terminology_consistency': 0.72
            },
            'sample_text': 'Ringrazio Branko Milanović per ilir encouragem',
            'process_info': {'rules_applied': 134}
        }
        
        technical_issue = self.tech_agent.analyze_translation_failure(document_path, translation_failure)
        
        # Crea evento soluzione proposta
        solution_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='solution_proposed',
            source_agent='tech_support',
            target_agent='editor_chief',
            event_data={
                'technical_issue': {
                    'issue_type': technical_issue.issue_type,
                    'severity': technical_issue.severity,
                    'root_cause': technical_issue.root_cause,
                    'proposed_solution': technical_issue.proposed_solution
                },
                'implementation_plan': self.tech_agent.implement_solution(technical_issue)
            },
            priority='high',
            status='ready_for_validation'
        )
        
        # Aggiungi alla sessione
        session_id = self._find_session_for_event(event)
        if session_id:
            self._add_event_to_session(session_id, solution_event)
            self.message_queue.put(solution_event)
    
    def _handle_solution_proposed(self, event: FeedbackLoopEvent):
        """Gestisce soluzione proposta"""
        
        # Editor Chief riceve soluzione per validazione
        solution_data = event.event_data['technical_issue']
        implementation_data = event.event_data['implementation_plan']
        
        # Prepara dati per validazione
        validation_details = {
            'issue_type': solution_data['issue_type'],
            'root_cause': solution_data['root_cause'],
            'proposed_solution': solution_data['proposed_solution'],
            'implementation_details': implementation_data,
            'expected_improvement': 0.15,  # 15% miglioramento atteso
            'testing_required': True
        }
        
        # Richiede validazione
        validation_request_id = self.editor_agent.receive_validation_request(
            component='translation_engine',
            solution_type=solution_data['issue_type'],
            solution_details=validation_details,
            priority='high'
        )
        
        # Esegui validazione
        validation_result = self.editor_agent.validate_solution(validation_request_id)
        
        # Crea evento risultato validazione
        validation_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='validation_result',
            source_agent='editor_chief',
            target_agent='tech_support',
            event_data={
                'validation_request_id': validation_request_id,
                'approved': validation_result.approved,
                'approval_score': validation_result.approval_score,
                'feedback': validation_result.feedback,
                'concerns': validation_result.concerns,
                'recommendations': validation_result.recommendations,
                'next_steps': validation_result.next_steps
            },
            priority='high',
            status='validation_complete'
        )
        
        # Aggiungi alla sessione
        session_id = self._find_session_for_event(event)
        if session_id:
            self._add_event_to_session(session_id, validation_event)
            self.message_queue.put(validation_event)
    
    def _handle_validation_result(self, event: FeedbackLoopEvent):
        """Gestisce risultato validazione"""
        
        if event.event_data['approved']:
            # Soluzione approvata - procedi con implementazione
            implementation_event = FeedbackLoopEvent(
                timestamp=datetime.now(),
                event_type='implementation_request',
                source_agent='editor_chief',
                target_agent='tech_support',
                event_data={
                    'approval_received': True,
                    'implementation_approved': True,
                    'next_steps': event.event_data['next_steps']
                },
                priority='high',
                status='ready_for_implementation'
            )
            
            session_id = self._find_session_for_event(event)
            if session_id:
                self._add_event_to_session(session_id, implementation_event)
                self.message_queue.put(implementation_event)
        else:
            # Soluzione non approvata - richiede revisione
            revision_event = FeedbackLoopEvent(
                timestamp=datetime.now(),
                event_type='revision_required',
                source_agent='editor_chief',
                target_agent='tech_support',
                event_data={
                    'approval_received': False,
                    'feedback': event.event_data['feedback'],
                    'concerns': event.event_data['concerns'],
                    'recommendations': event.event_data['recommendations']
                },
                priority='high',
                status='revision_needed'
            )
            
            session_id = self._find_session_for_event(event)
            if session_id:
                self._add_event_to_session(session_id, revision_event)
                self.message_queue.put(revision_event)
    
    def _handle_implementation_request(self, event: FeedbackLoopEvent):
        """Gestisce richiesta implementazione"""
        
        # Tech Support implementa soluzione
        # (In questo esempio simuliamo implementazione completata)
        
        implementation_complete_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='implementation_complete',
            source_agent='tech_support',
            target_agent='editor_chief',
            event_data={
                'implementation_status': 'completed',
                'files_modified': ['expanded_rules.json', 'rule_validator.py'],
                'implementation_log': 'Soluzione implementata con successo'
            },
            priority='high',
            status='ready_for_testing'
        )
        
        session_id = self._find_session_for_event(event)
        if session_id:
            self._add_event_to_session(session_id, implementation_complete_event)
            self.message_queue.put(implementation_complete_event)
    
    def _handle_implementation_complete(self, event: FeedbackLoopEvent):
        """Gestisce implementazione completata"""
        
        # Richiede testing della soluzione
        testing_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='testing_request',
            source_agent='editor_chief',
            target_agent='tech_support',
            event_data={
                'testing_requested': True,
                'test_document': 'capussela_test_sample.docx',
                'baseline_quality': 0.734,
                'target_quality': 0.85
            },
            priority='high',
            status='testing_needed'
        )
        
        session_id = self._find_session_for_event(event)
        if session_id:
            self._add_event_to_session(session_id, testing_event)
            self.message_queue.put(testing_event)
    
    def _handle_testing_complete(self, event: FeedbackLoopEvent):
        """Gestisce testing completato"""
        
        # Simula risultati test
        test_results = {
            'test_passed': True,
            'improvement_measured': 0.156,  # 15.6% miglioramento
            'quality_before': 0.734,
            'quality_after': 0.890,
            'issues_found': ['Minor optimization needed'],
            'recommendations': ['Fine-tune parameters', 'Test on larger dataset']
        }
        
        # Crea evento miglioramento approvato
        improvement_event = FeedbackLoopEvent(
            timestamp=datetime.now(),
            event_type='improvement_approved',
            source_agent='tech_support',
            target_agent='editor_chief',
            event_data={
                'test_results': test_results,
                'improvement_confirmed': True,
                'deployment_ready': True,
                'final_recommendations': test_results['recommendations']
            },
            priority='high',
            status='improvement_ready'
        )
        
        session_id = self._find_session_for_event(event)
        if session_id:
            self._add_event_to_session(session_id, improvement_event)
            self.message_queue.put(improvement_event)
    
    def _handle_improvement_approved(self, event: FeedbackLoopEvent):
        """Gestisce miglioramento approvato"""
        
        # Completa sessione collaborazione
        session_id = self._find_session_for_event(event)
        if session_id:
            session = self.active_sessions[session_id]
            session.status = 'completed'
            
            # Aggiungi outcome
            outcome = {
                'completion_time': datetime.now(),
                'total_events': len(session.events),
                'improvement_achieved': event.event_data['test_results']['improvement_measured'],
                'success': True,
                'final_quality': event.event_data['test_results']['quality_after']
            }
            
            session.outcomes.append(outcome)
            
            # Aggiorna metriche sistema
            self.system_metrics['successful_collaborations'] += 1
            self.system_metrics['improvements_implemented'] += 1
            
            # Salva sessione completata
            self._save_session(session_id)
            
            logger.info(f"Sessione collaborazione completata: {session_id}")
    
    def _handle_validation_request(self, event: FeedbackLoopEvent):
        """Gestisce richiesta validazione"""
        # Implementato in _handle_solution_proposed
        pass
    
    def _add_event_to_session(self, session_id: str, event: FeedbackLoopEvent):
        """Aggiunge evento alla sessione"""
        
        if session_id in self.active_sessions:
            self.active_sessions[session_id].events.append(event)
            event.status = 'processed'
    
    def _find_session_for_event(self, event: FeedbackLoopEvent) -> Optional[str]:
        """Trova sessione per evento"""
        
        for session_id, session in self.active_sessions.items():
            if session.status == 'active':
                return session_id
        
        return None
    
    def _cleanup_old_sessions(self):
        """Pulizia sessioni vecchie"""
        
        cutoff_time = datetime.now() - timedelta(hours=24)
        
        old_sessions = [
            session_id for session_id, session in self.active_sessions.items()
            if session.created_at < cutoff_time and session.status != 'active'
        ]
        
        for session_id in old_sessions:
            del self.active_sessions[session_id]
            logger.info(f"Sessione vecchia rimossa: {session_id}")
    
    def _update_system_metrics(self):
        """Aggiorna metriche sistema"""
        
        # Calcola tempo medio risoluzione
        completed_sessions = [
            session for session in self.active_sessions.values()
            if session.status == 'completed' and session.outcomes
        ]
        
        if completed_sessions:
            resolution_times = []
            for session in completed_sessions:
                if session.outcomes:
                    completion_time = session.outcomes[0]['completion_time']
                    resolution_time = (completion_time - session.created_at).total_seconds()
                    resolution_times.append(resolution_time)
            
            if resolution_times:
                self.system_metrics['average_resolution_time'] = sum(resolution_times) / len(resolution_times)
        
        # Calcola satisfaction agenti (simulato)
        if self.system_metrics['successful_collaborations'] > 0:
            success_rate = self.system_metrics['successful_collaborations'] / max(self.system_metrics['total_events'], 1)
            self.system_metrics['agent_satisfaction'] = min(success_rate * 1.2, 1.0)
    
    def _save_session(self, session_id: str):
        """Salva sessione completata"""
        
        session = self.active_sessions[session_id]
        
        session_data = {
            'session_id': session.session_id,
            'participants': session.participants,
            'topic': session.topic,
            'created_at': session.created_at.isoformat(),
            'status': session.status,
            'events_count': len(session.events),
            'outcomes': session.outcomes,
            'system_generated_at': datetime.now().isoformat()
        }
        
        session_file = self.system_dir / 'sessions' / f"{session_id}.json"
        
        with open(session_file, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
    
    def get_system_status(self) -> Dict:
        """Ottieni stato sistema"""
        
        return {
            'system_info': {
                'name': self.system_name,
                'id': self.system_id,
                'running': self.running,
                'workspace': str(self.system_dir)
            },
            'active_sessions': len(self.active_sessions),
            'system_metrics': self.system_metrics,
            'agent_status': {
                'tech_support': 'active',
                'editor_chief': 'active'
            },
            'recent_activity': self._get_recent_activity()
        }
    
    def _get_recent_activity(self) -> List[Dict]:
        """Ottieni attività recente"""
        
        recent_events = []
        
        for session in self.active_sessions.values():
            if session.events:
                latest_event = session.events[-1]
                recent_events.append({
                    'session_id': session.session_id,
                    'event_type': latest_event.event_type,
                    'timestamp': latest_event.timestamp.isoformat(),
                    'status': latest_event.status
                })
        
        # Ordina per timestamp
        recent_events.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return recent_events[:5]  # Ultimi 5 eventi
    
    def generate_improvement_report(self) -> Dict:
        """Genera report miglioramenti"""
        
        completed_sessions = [
            session for session in self.active_sessions.values()
            if session.status == 'completed' and session.outcomes
        ]
        
        if not completed_sessions:
            return {
                'report_generated_at': datetime.now().isoformat(),
                'total_improvements': 0,
                'message': 'Nessun miglioramento completato ancora'
            }
        
        # Calcola statistiche miglioramenti
        total_improvements = len(completed_sessions)
        average_improvement = sum(
            outcome['improvement_achieved'] 
            for session in completed_sessions 
            for outcome in session.outcomes
        ) / total_improvements
        
        best_improvement = max(
            outcome['improvement_achieved']
            for session in completed_sessions
            for outcome in session.outcomes
        )
        
        # Tipi di problemi risolti
        problem_types = {}
        for session in completed_sessions:
            for event in session.events:
                if event.event_type == 'solution_proposed':
                    issue_type = event.event_data.get('technical_issue', {}).get('issue_type', 'unknown')
                    problem_types[issue_type] = problem_types.get(issue_type, 0) + 1
        
        report = {
            'report_generated_at': datetime.now().isoformat(),
            'summary': {
                'total_improvements': total_improvements,
                'average_improvement': average_improvement,
                'best_improvement': best_improvement,
                'success_rate': self.system_metrics['successful_collaborations'] / max(self.system_metrics['total_events'], 1)
            },
            'problem_types_solved': problem_types,
            'quality_impact': {
                'average_quality_before': 0.734,  # Baseline
                'average_quality_after': 0.734 + average_improvement,
                'quality_improvement': average_improvement
            },
            'agent_collaboration': {
                'tech_support_contributions': total_improvements,
                'editor_chief_validations': total_improvements,
                'collaboration_efficiency': self.system_metrics['agent_satisfaction']
            },
            'recommendations': [
                'Continuare collaborazione tra agenti',
                'Espandere tipi di problemi trattati',
                'Migliorare velocità risoluzione',
                'Implementare learning automatico'
            ]
        }
        
        # Salva report
        report_file = self.system_dir / 'improvements' / f'improvement_report_{int(time.time())}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report

# Sistema principale Feedback Loop
if __name__ == "__main__":
    # Inizializza sistema feedback loop
    feedback_system = FeedbackLoopSystem()
    
    print("🔄 Avvio sistema Feedback Loop...")
    feedback_system.start_system()
    
    # Simula problema tecnico
    print("🔧 Inizio risoluzione problema tecnico...")
    session_id = feedback_system.initiate_technical_issue_resolution(
        document_path="capussela_spirito_repubblicano.docx",
        issue_description="Traduzione con qualità 73.4% e testo corrotto"
    )
    
    print(f"📋 Sessione creata: {session_id}")
    
    # Attendi completamento (simulazione)
    print("⏳ Attesa completamento collaborazione...")
    time.sleep(5)  # Simula processing
    
    # Controlla stato
    status = feedback_system.get_system_status()
    print(f"📊 Stato sistema:")
    print(f"   - Sessioni attive: {status['active_sessions']}")
    print(f"   - Eventi processati: {status['system_metrics']['total_events']}")
    print(f"   - Collaborazioni riuscite: {status['system_metrics']['successful_collaborations']}")
    
    # Genera report miglioramenti
    print("📈 Generazione report miglioramenti...")
    report = feedback_system.generate_improvement_report()
    
    if report['total_improvements'] > 0:
        print(f"✅ Report generato:")
        print(f"   - Miglioramenti totali: {report['summary']['total_improvements']}")
        print(f"   - Miglioramento medio: {report['summary']['average_improvement']:.2%}")
        print(f"   - Miglioramento migliore: {report['summary']['best_improvement']:.2%}")
        print(f"   - Success rate: {report['summary']['success_rate']:.2%}")
    else:
        print("📝 Nessun miglioramento completato ancora")
    
    # Ferma sistema
    feedback_system.stop_system()
    print("🛑 Sistema feedback loop fermato")
