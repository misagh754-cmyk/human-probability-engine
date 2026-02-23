import numpy as np
import pandas as pd
import xgboost as xgb
from typing import Dict, Any, List
import networkx as nx
from core.models import FounderProfile

class SimulationEngine:
    def __init__(self, iterations: int = 10000):
        self.iterations = iterations
        self.months = 36
        
    def _pattern_match_baseline(self, profile: FounderProfile) -> float:
        """
        Uses a stubbed XGBoost logic to baseline the success probability
        based on historical similarity.
        """
        # In production: model = xgb.Booster(); model.load_model('hpe_v1.model')
        # Here we simulate the logic:
        features = [
            profile.behavioral.conscientiousness,
            profile.behavioral.risk_tolerance,
            profile.behavioral.stress_capacity,
            profile.structural.years_experience / 10,
            1.0 if profile.structural.education == "Stanford" else 0.5
        ]
        
        # Weighted sum simulation (XGBoost approximation)
        weights = np.array([0.3, 0.1, 0.2, 0.2, 0.2])
        baseline = np.dot(features, weights)
        return float(np.clip(baseline, 0.1, 0.9))

    def run_monte_carlo(self, profile: FounderProfile) -> Dict[str, Any]:
        """
        Vectorized 36-month simulation over 10,000 iterations.
        """
        baseline_success = self._pattern_match_baseline(profile)
        
        # State tensors (Iterations x Months)
        # 0: Active, 1: Success (Raised), -1: Failure (Cash/Burnout)
        states = np.zeros((self.iterations, self.months))
        
        # Probabilities influenced by traits
        monthly_growth_base = baseline_success * 0.05
        market_volatility = 0.1
        burnout_threshold = 1.0 - profile.behavioral.stress_capacity
        
        # Performance optimized simulation loop
        # We simulate month-by-month to allow dependencies
        current_status = np.zeros(self.iterations) # 0: Running, 1: Won, 2: Lost
        
        history = []
        
        for m in range(self.months):
            # Market Shock (Normal distribution)
            market_shock = np.random.normal(0, market_volatility, self.iterations)
            
            # Founders with high conscientiousness resist negative shocks better
            execution_gap = (1 - profile.behavioral.conscientiousness) * 0.02
            
            # Transition Logic
            # Random uniform for stochastic events
            rand = np.random.rand(self.iterations)
            
            # 1. Success Trigger (e.g., Raising Series A)
            success_chance = monthly_growth_base + market_shock - execution_gap
            is_success = (current_status == 0) & (rand < success_chance)
            current_status[is_success] = 1
            
            # 2. Failure Trigger (e.g., Burnout or Cash Out)
            # Higher neurotisicm + market shock -> Burnout
            failure_chance = (profile.behavioral.neuroticism * 0.03) + (burnout_threshold * 0.02) - market_shock
            is_failure = (current_status == 0) & (rand < failure_chance)
            current_status[is_failure] = 2
            
            states[:, m] = current_status

        # Calculate Probabilities
        success_final = np.sum(current_status == 1) / self.iterations
        failure_final = np.sum(current_status == 2) / self.iterations
        
        # 1st Year Failure
        failure_yr1 = np.sum(states[:, 11] == 2) / self.iterations

        # Scenario Tree Generation (High-Level DAG)
        scenario_tree = self._generate_scenario_tree(states)

        return {
            "probabilities": {
                "financial_success": float(success_final),
                "burnout_risk": float(failure_final * 0.4), # Subset of failure
                "first_year_failure": float(failure_yr1)
            },
            "scenario_tree": scenario_tree
        }

    def _generate_scenario_tree(self, states: np.ndarray) -> Dict[str, Any]:
        """
        Aggregates simulation paths into a Directed Acyclic Graph.
        """
        # Node IDs mapping
        # ROOT -> MONTH_12 -> SUCCESS/PIVOT/FAILURE
        tree: Dict[str, Any] = {
            "nodes": [
                {"id": "start", "label": "Initial Concept", "type": "root"},
                {"id": "yr1_active", "label": "Survival (Year 1)", "type": "milestone"},
                {"id": "yr1_fail", "label": "Early Dissolution", "type": "terminal"},
                {"id": "raised", "label": "Series A Secured", "type": "success"},
                {"id": "pivot", "label": "Business Model Pivot", "type": "transition"},
                {"id": "burnout", "label": "Founder Burnout", "type": "terminal"}
            ],
            "edges": []
        }
        
        # Calculate transition weights from states
        yr1_fail_rate = np.sum(states[:, 11] == 2) / self.iterations
        yr1_active_rate = 1 - yr1_fail_rate
        
        tree["edges"].append({"from": "start", "to": "yr1_active", "weight": float(yr1_active_rate)})
        tree["edges"].append({"from": "start", "to": "yr1_fail", "weight": float(yr1_fail_rate)})
        
        # Further outcomes from yr1_active
        survived_to_yr1 = states[states[:, 11] == 0]
        if len(survived_to_yr1) > 0:
            success_from_yr1 = np.sum(np.any(survived_to_yr1 == 1, axis=1)) / len(survived_to_yr1)
            tree["edges"].append({"from": "yr1_active", "to": "raised", "weight": float(success_from_yr1)})
        
        return tree
