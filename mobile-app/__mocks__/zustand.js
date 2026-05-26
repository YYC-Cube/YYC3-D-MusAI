export const create = (fn) => {
  let state = {};
  const listeners = new Set();
  
  const getState = () => state;
  const setState = (updater) => {
    state = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    listeners.forEach((listener) => listener(state));
  };
  
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  const api = { getState, setState, subscribe };
  state = fn(setState, getState, api);
  
  return () => state;
};
