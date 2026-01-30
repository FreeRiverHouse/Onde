#!/usr/bin/env python3
"""
SISTEMA AUTOMAZIONE QUALITÀ - EDITORE CAPO ONDE
Monitoraggio, validazione e miglioramento automatico traduzioni
"""

import json
import time
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum

from translation_engine import BombproofTranslationSystem, QualityMetrics, QualityLevel

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class QualityAlert:
    timestamp: datetime
    translation_id: str
    severity: AlertSeverity
    metric_name: str
    current_value: float
    target_value: float
    message: str
    recommendations: List[str]

@dataclass
class TranslationProject:
    id: str
    document_path: str
    status: str
    created_at: datetime
    updated_at: datetime
    quality_target: QualityLevel
    current_metrics: Optional[QualityMetrics]
    alerts: List[QualityAlert]
    feedback_history: List[Dict]

class QualityDashboard:
    """Dashboard qualità real-time"""
    
    def __init__(self):
        self.active_projects = {}
        self.alert_system = AlertSystem()
        self.metrics_tracker = MetricsTracker()
        self.learning_system = LearningSystem()
        self.logger = logging.getLogger(__name__)
    
    def create_project(self, document_path: str, quality_target: QualityLevel = QualityLevel.PROFESSIONAL) -> str:
        """Crea nuovo progetto traduzione"""
        
        project_id = f"proj_{int(time.time())}"
        
        project = TranslationProject(
            id=project_id,
            document_path=document_path,
            status="created",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            quality_target=quality_target,
            current_metrics=None,
            alerts=[],
            feedback_history=[]
        )
        
        self.active_projects[project_id] = project
        self.logger.info(f"Progetto creato: {project_id} per {document_path}")
        
        return project_id
    
    def start_translation(self, project_id: str) -> bool:
        """Avvia traduzione con monitoraggio"""
        
        if project_id not in self.active_projects:
            self.logger.error(f"Progetto {project_id} non trovato")
            return False
        
        project = self.active_projects[project_id]
        project.status = "translating"
        project.updated_at = datetime.now()
        
        try:
            # Avvia traduzione in background
            translator = BombproofTranslationSystem()
            translated_text, quality_metrics = translator.translate_document(
                project.document_path,
                project.quality_target
            )
            
            # Aggiorna progetto
            project.current_metrics = quality_metrics
            project.status = "completed"
            project.updated_at = datetime.now()
            
            # Valuta qualità
            self._evaluate_quality(project)
            
            self.logger.info(f"Traduzione completata per {project_id}: {quality_metrics.overall_score:.2%}")
            return True
            
        except Exception as e:
            self.logger.error(f"Errore traduzione {project_id}: {e}")
            project.status = "error"
            self.alert_system.send_alert(project_id, AlertSeverity.ERROR, "translation_error", 0, 0, str(e))
            return False
    
    def _evaluate_quality(self, project: TranslationProject):
        """Valuta qualità e genera alert"""
        
        if not project.current_metrics:
            return
        
        metrics = project.current_metrics
        target_score = project.quality_target.value
        
        # Controlla metriche individuali
        quality_checks = {
            'semantic_fidelity': (metrics.semantic_fidelity, 0.98),
            'structural_integrity': (metrics.structural_integrity, 0.95),
            'terminology_consistency': (metrics.terminology_consistency, 0.99),
            'cultural_appropriateness': (metrics.cultural_appropriateness, 0.95),
            'readability_score': (metrics.readability_score, 0.90),
            'style_preservation': (metrics.style_preservation, 0.85)
        }
        
        for metric_name, (current, target) in quality_checks.items():
            if current < target:
                severity = self._determine_severity(current, target)
                recommendations = self._generate_recommendations(metric_name, current, target)
                
                alert = QualityAlert(
                    timestamp=datetime.now(),
                    translation_id=project.id,
                    severity=severity,
                    metric_name=metric_name,
                    current_value=current,
                    target_value=target,
                    message=f"Metrica {metric_name} sotto target: {current:.2%} < {target:.2%}",
                    recommendations=recommendations
                )
                
                project.alerts.append(alert)
                self.alert_system.send_alert(project.id, severity, metric_name, current, target, alert.message)
    
    def _determine_severity(self, current: float, target: float) -> AlertSeverity:
        """Determina severità alert"""
        
        deficit = target - current
        
        if deficit > 0.10:
            return AlertSeverity.CRITICAL
        elif deficit > 0.05:
            return AlertSeverity.ERROR
        elif deficit > 0.02:
            return AlertSeverity.WARNING
        else:
            return AlertSeverity.INFO
    
    def _generate_recommendations(self, metric_name: str, current: float, target: float) -> List[str]:
        """Genera raccomandazioni per miglioramento"""
        
        recommendations = {
            'semantic_fidelity': [
                "Rivedi traduzione per accuratezza semantica",
                "Verifica corrispondenza concetti chiave",
                "Considera revisione manuale delle parti complesse"
            ],
            'structural_integrity': [
                "Controlla mantenimento struttura paragrafi",
                "Verifica formattazione e layout",
                "Assicura coerenza organizzativa"
            ],
            'terminology_consistency': [
                "Applica terminologia coerente in tutto il documento",
                "Crea glossario termini specifici",
                "Verifica traduzione termini tecnici"
            ],
            'cultural_appropriateness': [
                "Adatta riferimenti culturali per audience italiana",
                "Verifica appropriatezza contesto locale",
                "Considera note esplicative per riferimenti specifici"
            ],
            'readability_score': [
                "Semplifica frasi troppo lunghe",
                "Migliora connettori logici",
                "Ottimizza struttura periodi"
            ],
            'style_preservation': [
                "Mantieni tono e stile originale",
                "Adatta registro linguistico appropriato",
                "Preserva voce autoriale"
            ]
        }
        
        return recommendations.get(metric_name, ["Rivedi metrica per miglioramento"])
    
    def get_project_status(self, project_id: str) -> Optional[Dict]:
        """Ottieni stato completo progetto"""
        
        if project_id not in self.active_projects:
            return None
        
        project = self.active_projects[project_id]
        
        status = {
            'project_id': project.id,
            'document_path': project.document_path,
            'status': project.status,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'quality_target': project.quality_target.value,
            'current_metrics': asdict(project.current_metrics) if project.current_metrics else None,
            'alerts_count': len(project.alerts),
            'critical_alerts': len([a for a in project.alerts if a.severity == AlertSeverity.CRITICAL]),
            'recent_alerts': [asdict(a) for a in project.alerts[-5:]]  # Ultimi 5 alert
        }
        
        return status
    
    def get_dashboard_summary(self) -> Dict:
        """Ottieni riepilogo dashboard"""
        
        total_projects = len(self.active_projects)
        completed_projects = len([p for p in self.active_projects.values() if p.status == "completed"])
        error_projects = len([p for p in self.active_projects.values() if p.status == "error"])
        
        # Calcola qualità media
        completed_with_metrics = [p for p in self.active_projects.values() 
                               if p.status == "completed" and p.current_metrics]
        
        if completed_with_metrics:
            avg_quality = sum(p.current_metrics.overall_score for p in completed_with_metrics) / len(completed_with_metrics)
        else:
            avg_quality = 0.0
        
        # Alert recenti
        recent_alerts = []
        for project in self.active_projects.values():
            recent_alerts.extend([a for a in project.alerts 
                                 if (datetime.now() - a.timestamp).total_seconds() < 3600])  # Ultima ora
        
        return {
            'total_projects': total_projects,
            'completed_projects': completed_projects,
            'error_projects': error_projects,
            'success_rate': completed_projects / total_projects if total_projects > 0 else 0,
            'average_quality': avg_quality,
            'recent_alerts_count': len(recent_alerts),
            'critical_alerts_count': len([a for a in recent_alerts if a.severity == AlertSeverity.CRITICAL])
        }

class AlertSystem:
    """Sistema di alert automatico"""
    
    def __init__(self):
        self.alert_handlers = []
        self.logger = logging.getLogger(__name__)
    
    def send_alert(self, project_id: str, severity: AlertSeverity, metric: str, current: float, target: float, message: str):
        """Invia alert"""
        
        alert_data = {
            'project_id': project_id,
            'severity': severity.value,
            'metric': metric,
            'current': current,
            'target': target,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        # Log alert
        log_level = {
            AlertSeverity.INFO: logging.INFO,
            AlertSeverity.WARNING: logging.WARNING,
            AlertSeverity.ERROR: logging.ERROR,
            AlertSeverity.CRITICAL: logging.CRITICAL
        }.get(severity, logging.INFO)
        
        self.logger.log(log_level, f"ALERT [{severity.value.upper()}] {project_id}: {message}")
        
        # Notifica handler
        for handler in self.alert_handlers:
            handler.handle_alert(alert_data)
    
    def register_handler(self, handler):
        """Registra handler per alert"""
        self.alert_handlers.append(handler)

class MetricsTracker:
    """Tracker metriche qualità"""
    
    def __init__(self):
        self.metrics_history = {}
        self.logger = logging.getLogger(__name__)
    
    def track_metrics(self, project_id: str, metrics: QualityMetrics):
        """Traccia metriche nel tempo"""
        
        if project_id not in self.metrics_history:
            self.metrics_history[project_id] = []
        
        metric_entry = {
            'timestamp': datetime.now().isoformat(),
            'metrics': asdict(metrics)
        }
        
        self.metrics_history[project_id].append(metric_entry)
        
        # Mantieni solo ultimi 100 entry per progetto
        if len(self.metrics_history[project_id]) > 100:
            self.metrics_history[project_id] = self.metrics_history[project_id][-100:]
    
    def get_metrics_trend(self, project_id: str, hours: int = 24) -> Optional[Dict]:
        """Ottieni trend metriche"""
        
        if project_id not in self.metrics_history:
            return None
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        recent_metrics = [
            entry for entry in self.metrics_history[project_id]
            if datetime.fromisoformat(entry['timestamp']) > cutoff_time
        ]
        
        if not recent_metrics:
            return None
        
        # Calcola trend
        first_metrics = recent_metrics[0]['metrics']
        last_metrics = recent_metrics[-1]['metrics']
        
        trends = {}
        for metric in ['semantic_fidelity', 'structural_integrity', 'terminology_consistency', 
                      'cultural_appropriateness', 'readability_score', 'style_preservation', 'overall_score']:
            first_val = first_metrics.get(metric, 0)
            last_val = last_metrics.get(metric, 0)
            
            if first_val > 0:
                change = ((last_val - first_val) / first_val) * 100
                trends[metric] = {
                    'change_percent': change,
                    'trend': 'improving' if change > 0 else 'declining'
                }
        
        return {
            'period_hours': hours,
            'data_points': len(recent_metrics),
            'trends': trends
        }

class LearningSystem:
    """Sistema di apprendimento continuo"""
    
    def __init__(self):
        self.feedback_patterns = {}
        self.rule_improvements = {}
        self.logger = logging.getLogger(__name__)
    
    def process_feedback(self, project_id: str, human_feedback: Dict) -> Dict:
        """Processa feedback umano per miglioramento"""
        
        # Analizza pattern feedback
        patterns = self._analyze_feedback_patterns(human_feedback)
        
        # Identifica aree miglioramento
        improvement_areas = self._identify_improvement_areas(patterns)
        
        # Aggiorna regole
        updated_rules = self._update_translation_rules(improvement_areas)
        
        # Test miglioramenti
        test_results = self._test_improvements(updated_rules)
        
        # Deploy se validati
        deployed_improvements = []
        for improvement, result in zip(improvement_areas, test_results):
            if result['improvement_score'] > 0.05:
                deployed_improvements.append(improvement)
                self.logger.info(f"Deployed improvement: {improvement}")
        
        return {
            'patterns_identified': patterns,
            'improvement_areas': improvement_areas,
            'updated_rules': updated_rules,
            'test_results': test_results,
            'deployed_improvements': deployed_improvements
        }
    
    def _analyze_feedback_patterns(self, feedback: Dict) -> Dict:
        """Analizza pattern nel feedback"""
        
        patterns = {
            'correction_types': {},
            'error_categories': {},
            'improvement_suggestions': [],
            'common_issues': []
        }
        
        # Implementazione analisi feedback
        if 'corrections' in feedback:
            for correction in feedback['corrections']:
                correction_type = correction.get('type', 'unknown')
                patterns['correction_types'][correction_type] = patterns['correction_types'].get(correction_type, 0) + 1
        
        return patterns
    
    def _identify_improvement_areas(self, patterns: Dict) -> List[str]:
        """Identifica aree di miglioramento"""
        
        improvement_areas = []
        
        # Analizza tipi di correzione più comuni
        if patterns['correction_types']:
            most_common = max(patterns['correction_types'], key=patterns['correction_types'].get)
            improvement_areas.append(f"fix_{most_common}")
        
        return improvement_areas
    
    def _update_translation_rules(self, improvement_areas: List[str]) -> Dict:
        """Aggiorna regole traduzione"""
        
        updated_rules = {}
        
        for area in improvement_areas:
            if area.startswith('fix_'):
                issue_type = area[4:]  # Rimuovi 'fix_'
                updated_rules[issue_type] = self._generate_rule_for_issue(issue_type)
        
        return updated_rules
    
    def _generate_rule_for_issue(self, issue_type: str) -> Dict:
        """Genera regola per tipo di problema"""
        
        rule_templates = {
            'semantic_error': {
                'pattern': r'\b(word)\b',
                'replacement': r'corrected_\1',
                'context': 'semantic'
            },
            'grammar_error': {
                'pattern': r'\b(incorrect_grammar)\b',
                'replacement': r'correct_grammar',
                'context': 'grammar'
            },
            'terminology_inconsistency': {
                'pattern': r'\b(inconsistent_term)\b',
                'replacement': r'consistent_term',
                'context': 'terminology'
            }
        }
        
        return rule_templates.get(issue_type, {
            'pattern': r'\b(word)\b',
            'replacement': r'improved_\1',
            'context': 'general'
        })
    
    def _test_improvements(self, updated_rules: Dict) -> List[Dict]:
        """Test miglioramenti alle regole"""
        
        test_results = []
        
        for rule_name, rule in updated_rules.items():
            # Simula test regola
            test_score = self._simulate_rule_test(rule)
            
            test_results.append({
                'rule_name': rule_name,
                'improvement_score': test_score,
                'test_passed': test_score > 0.05
            })
        
        return test_results
    
    def _simulate_rule_test(self, rule: Dict) -> float:
        """Simula test di regola (implementazione base)"""
        
        # In produzione, questo testerebbe la regola su dataset reale
        # Qui simuliamo un punteggio basato sulla complessità della regola
        
        pattern_complexity = len(rule.get('pattern', ''))
        has_context = 'context' in rule
        
        # Punteggio base basato sulla complessità
        base_score = 0.1
        
        if pattern_complexity > 10:
            base_score += 0.3
        elif pattern_complexity > 5:
            base_score += 0.2
        
        if has_context:
            base_score += 0.2
        
        # Aggiungi casualità per simulazione
        import random
        random_factor = random.uniform(-0.05, 0.1)
        
        return max(0, min(1, base_score + random_factor))

class QualityReportGenerator:
    """Generatore report qualità dettagliati"""
    
    def __init__(self):
        self.dashboard = QualityDashboard()
        self.metrics_tracker = MetricsTracker()
        self.logger = logging.getLogger(__name__)
    
    def generate_comprehensive_report(self, project_id: str) -> Dict:
        """Genera report completo qualità"""
        
        project_status = self.dashboard.get_project_status(project_id)
        if not project_status:
            return {'error': 'Project not found'}
        
        metrics_trend = self.metrics_tracker.get_metrics_trend(project_id, hours=24)
        
        report = {
            'project_info': {
                'project_id': project_status['project_id'],
                'document_path': project_status['document_path'],
                'status': project_status['status'],
                'created_at': project_status['created_at'],
                'updated_at': project_status['updated_at']
            },
            'quality_assessment': {
                'target_quality': project_status['quality_target'],
                'current_quality': project_status['current_metrics']['overall_score'] if project_status['current_metrics'] else 0,
                'meets_target': project_status['current_metrics']['overall_score'] >= project_status['quality_target'] if project_status['current_metrics'] else False,
                'detailed_metrics': project_status['current_metrics']
            },
            'alerts_analysis': {
                'total_alerts': project_status['alerts_count'],
                'critical_alerts': project_status['critical_alerts'],
                'recent_alerts': project_status['recent_alerts'],
                'alert_trends': self._analyze_alert_trends(project_status['recent_alerts'])
            },
            'performance_trends': metrics_trend,
            'recommendations': self._generate_improvement_recommendations(project_status),
            'learning_insights': self._extract_learning_insights(project_id)
        }
        
        return report
    
    def _analyze_alert_trends(self, alerts: List[Dict]) -> Dict:
        """Analizza trend alert"""
        
        if not alerts:
            return {'trend': 'stable', 'analysis': 'No alerts in recent period'}
        
        severity_counts = {}
        for alert in alerts:
            severity = alert['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        most_common_severity = max(severity_counts, key=severity_counts.get)
        
        return {
            'trend': 'increasing' if len(alerts) > 5 else 'stable',
            'most_common_severity': most_common_severity,
            'severity_distribution': severity_counts,
            'analysis': f"Most alerts are {most_common_severity} severity"
        }
    
    def _generate_improvement_recommendations(self, project_status: Dict) -> List[str]:
        """Genera raccomandazioni miglioramento"""
        
        recommendations = []
        
        if not project_status['current_metrics']:
            return ["Complete translation first to generate recommendations"]
        
        metrics = project_status['current_metrics']
        
        # Analizza ogni metrica
        if metrics['semantic_fidelity'] < 0.95:
            recommendations.append("Improve semantic accuracy through manual review of complex passages")
        
        if metrics['structural_integrity'] < 0.90:
            recommendations.append("Review document structure and formatting consistency")
        
        if metrics['terminology_consistency'] < 0.95:
            recommendations.append("Create and apply terminology glossary for consistent translations")
        
        if metrics['cultural_appropriateness'] < 0.90:
            recommendations.append("Adapt cultural references for Italian audience")
        
        if metrics['readability_score'] < 0.85:
            recommendations.append("Simplify sentence structure and improve flow")
        
        if metrics['style_preservation'] < 0.80:
            recommendations.append("Review and adjust style preservation to match original tone")
        
        return recommendations
    
    def _extract_learning_insights(self, project_id: str) -> Dict:
        """Estrae insight apprendimento"""
        
        # Implementazione base - in produzione analizzerebbe dati storici
        return {
            'improvement_areas': ['semantic_accuracy', 'terminology_consistency'],
            'success_patterns': ['contextual_translation', 'post_processing'],
            'future_optimizations': ['enhanced_terminology_engine', 'cultural_adaptation']
        }

# Sistema principale automazione qualità
class QualityAutomationSystem:
    """Sistema completo automazione qualità"""
    
    def __init__(self):
        self.dashboard = QualityDashboard()
        self.report_generator = QualityReportGenerator()
        self.alert_system = AlertSystem()
        self.logger = logging.getLogger(__name__)
    
    def create_translation_project(self, document_path: str, quality_target: QualityLevel = QualityLevel.PROFESSIONAL) -> str:
        """Crea nuovo progetto con automazione qualità"""
        
        project_id = self.dashboard.create_project(document_path, quality_target)
        
        self.logger.info(f"Progetto creato con automazione qualità: {project_id}")
        return project_id
    
    def execute_translation_with_monitoring(self, project_id: str) -> Dict:
        """Esegue traduzione con monitoraggio completo"""
        
        self.logger.info(f"Inizio traduzione monitorata: {project_id}")
        
        # Avvia traduzione
        success = self.dashboard.start_translation(project_id)
        
        if success:
            project_status = self.dashboard.get_project_status(project_id)
            
            # Genera report automatico
            quality_report = self.report_generator.generate_comprehensive_report(project_id)
            
            return {
                'success': True,
                'project_id': project_id,
                'project_status': project_status,
                'quality_report': quality_report
            }
        else:
            return {
                'success': False,
                'project_id': project_id,
                'error': 'Translation failed'
            }
    
    def get_system_status(self) -> Dict:
        """Ottieni stato sistema automazione"""
        
        dashboard_summary = self.dashboard.get_dashboard_summary()
        
        return {
            'system_status': 'operational',
            'active_projects': dashboard_summary['total_projects'],
            'success_rate': dashboard_summary['success_rate'],
            'average_quality': dashboard_summary['average_quality'],
            'recent_alerts': dashboard_summary['recent_alerts_count'],
            'critical_issues': dashboard_summary['critical_alerts_count'],
            'last_updated': datetime.now().isoformat()
        }

# Esempio utilizzo
if __name__ == "__main__":
    # Inizializza sistema automazione qualità
    quality_system = QualityAutomationSystem()
    
    # Crea progetto
    project_id = quality_system.create_translation_project(
        "capussela spirito repubblicano.docx",
        QualityLevel.PROFESSIONAL
    )
    
    # Esegui traduzione con monitoraggio
    result = quality_system.execute_translation_with_monitoring(project_id)
    
    if result['success']:
        print(f"Traduzione completata con successo!")
        print(f"Qualità: {result['project_status']['current_metrics']['overall_score']:.2%}")
        print(f"Alert: {result['project_status']['alerts_count']}")
        
        # Mostra report qualità
        quality_report = result['quality_report']
        print(f"\nReport Qualità:")
        print(f"  - Target: {quality_report['quality_assessment']['target_quality']:.2%}")
        print(f"  - Attuale: {quality_report['quality_assessment']['current_quality']:.2%}")
        print(f"  - Target raggiunto: {quality_report['quality_assessment']['meets_target']}")
        print(f"  - Raccomandazioni: {len(quality_report['recommendations'])}")
    else:
        print(f"Errore durante traduzione: {result['error']}")
    
    # Stato sistema
    system_status = quality_system.get_system_status()
    print(f"\nStato Sistema:")
    print(f"  - Progetti attivi: {system_status['active_projects']}")
    print(f"  - Success rate: {system_status['success_rate']:.2%}")
    print(f"  - Qualità media: {system_status['average_quality']:.2%}")
    print(f"  - Alert recenti: {system_status['recent_alerts']}")
