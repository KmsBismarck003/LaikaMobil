import { useState, useEffect } from 'react';
import { getCurrentUser, subscribeAuth } from '../store/AuthStore';

export const useAuth = () => {
  const [user, setUser] = useState(getCurrentUser());
  
  useEffect(() => {
    return subscribeAuth(() => {
      setUser(getCurrentUser());
    });
  }, []);
  
  return user;
};
