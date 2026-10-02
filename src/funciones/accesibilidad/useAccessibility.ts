import { useContext } from 'react';
import { AccessibilityContext } from './AccessibilityProvider';

export const useAccessibility = () => {
  return useContext(AccessibilityContext);
};
