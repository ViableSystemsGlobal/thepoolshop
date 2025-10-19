import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  MODULE_ACCESS, 
  ROLE_ABILITIES, 
  canAccessModule, 
  hasAbility as hasAbilityUtil,
  type Ability,
  type Module,
  type Role
} from '@/lib/permissions';

export interface UserAbilities {
  abilities: string[];
  hasAbility: (resource: string, action: string) => boolean;
  canAccess: (module: string) => boolean;
  loading: boolean;
}

export function useAbilities(): UserAbilities {
  const { data: session, status } = useSession();
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session?.user?.id) {
      setAbilities([]);
      setLoading(false);
      return;
    }

    const fetchAbilities = async () => {
      try {
        const response = await fetch('/api/user/abilities', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🔍 useAbilities - Fetched abilities from database:', data.abilities?.length || 0, 'abilities');
          console.log('🔍 useAbilities - Has ai_analyst.access:', data.abilities?.includes('ai_analyst.access' as any));
          console.log('🔍 useAbilities - Has agents.view:', data.abilities?.includes('agents.view' as any));
          console.log('🔍 useAbilities - Has commissions.view:', data.abilities?.includes('commissions.view' as any));
          setAbilities((data.abilities || []) as Ability[]);
        } else {
          console.error('Failed to fetch abilities:', response.status);
          // Fallback to hardcoded abilities if API fails
          const userRole = session.user.role as Role;
          const userAbilities = ROLE_ABILITIES[userRole] || [];
          console.log('🔍 useAbilities - Using fallback abilities for role:', userRole, 'count:', userAbilities.length);
          console.log('🔍 useAbilities - Fallback has ai_analyst.access:', userAbilities.includes('ai_analyst.access' as any));
          console.log('🔍 useAbilities - Fallback has agents.view:', userAbilities.includes('agents.view' as any));
          console.log('🔍 useAbilities - Fallback has commissions.view:', userAbilities.includes('commissions.view' as any));
          setAbilities([...userAbilities]);
        }
      } catch (error) {
        console.error('Error fetching abilities:', error);
        // Fallback to hardcoded abilities if API fails
        const userRole = session.user.role as Role;
        const userAbilities = ROLE_ABILITIES[userRole] || [];
        console.log('🔍 useAbilities - Using fallback abilities for role:', userRole, 'count:', userAbilities.length);
        console.log('🔍 useAbilities - Fallback has ai_analyst.access:', userAbilities.includes('ai_analyst.access' as any));
        console.log('🔍 useAbilities - Fallback has agents.view:', userAbilities.includes('agents.view' as any));
        console.log('🔍 useAbilities - Fallback has commissions.view:', userAbilities.includes('commissions.view' as any));
        setAbilities([...userAbilities]);
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, [session]);

  const hasAbility = (resource: string, action: string): boolean => {
    const ability = `${resource}.${action}` as Ability;
    return hasAbilityUtil(abilities, ability);
  };

  const canAccess = (module: string): boolean => {
    // While abilities are loading, don't hide navigation to avoid flicker
    if (loading) {
      return true;
    }
    
    const hasAccess = canAccessModule(abilities, module as Module);
    
    // Debug logging for important modules
    if (module === 'ai_analyst' || module === 'agents' || module === 'commissions') {
      console.log(`🔍 ${module} Access Check:`, {
        module,
        requiredAbilities: MODULE_ACCESS[module as Module] || [],
        userAbilities: abilities.slice(0, 10), // Show first 10 abilities
        hasAccess,
        loading
      });
    }
    
    return hasAccess;
  };

  return {
    abilities,
    hasAbility,
    canAccess,
    loading
  };
}
