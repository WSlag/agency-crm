import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { navigation } from '../config/navigation';
import type { NavigationItem } from '../types/navigation';

export const useNavigation = () => {
  const { customClaims } = useAuth();
  const location = useLocation();
  
  const filteredNavigation = useMemo(() => 
    navigation.filter(item => 
      customClaims?.role && item.roles.includes(customClaims.role)
    ),
    [customClaims?.role]
  );
  
  const isActive = useCallback((path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  }, [location.pathname]);
  
  const getBreadcrumbs = useCallback(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const item = navigation.find(item => item.href === href);
      return {
        name: item?.name || path.charAt(0).toUpperCase() + path.slice(1),
        href,
        current: index === paths.length - 1
      };
    });
  }, [location.pathname]);

  return { 
    filteredNavigation, 
    isActive,
    getBreadcrumbs
  };
};
