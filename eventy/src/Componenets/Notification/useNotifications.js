import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../Redux/Notif/notifSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();

  
  const { items: notifications, status, error } = useSelector(
    (state) => state.notifications
  );
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  return {
    notifications,
    isLoading: status === 'loading',
    error,
    hasWelcomeNotification: notifications.some(notif => notif.isWelcome),
  };
};