import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store';
import { socketService } from '../services/socket';

// FIXED: useSocket no longer starts a second connection.
// App.jsx is the single place that calls socketService.connect().
// Components use this hook only to subscribe to events.
export const useSocket = () => {
  return socketService;
};

// FIXED: duplicate useAsync removed. This is the only declaration.
// The deps array is now properly forwarded to the useEffect dependency list.
export const useAsync = (asyncFunction, immediate = true, deps = []) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response.data);
      setStatus('success');
      return response.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      setStatus('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { execute, status, data, error };
};

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const usePrevious = (value) => {
  const [prev, setPrev] = useState();

  useEffect(() => {
    setPrev(value);
  }, [value]);

  return prev;
};
