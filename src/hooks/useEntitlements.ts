import { useAuth } from '../contexts/AuthContext';
import { hasFeature as checkFeature } from '../lib/gameEngine';

export function useEntitlements() {
  const { entitlements, user, isDeveloper, developerPlan } = useAuth();

  const hasFeature = (featureName: string): boolean => {
    return checkFeature(entitlements, featureName);
  };

  return {
    entitlements,
    hasFeature,
    isDeveloper,
    activePlan: isDeveloper ? developerPlan : 'free',
    user,
  };
}
