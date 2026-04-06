// frontend/src/contexts/SetupContext.js
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import SetupService from '../services/setupService';

const SetupContext = createContext();

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    status: ''
  },
  selectedItem: null,
  formMode: 'create' // 'create' or 'edit'
};

function setupReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_FORM_MODE':
      return { ...state, formMode: action.payload };
    case 'RESET_FORM':
      return { ...state, selectedItem: null, formMode: 'create' };
    default:
      return state;
  }
}

export function SetupProvider({ children, moduleType, config }) {
  const [state, dispatch] = useReducer(setupReducer, initialState);
  const service = new SetupService(moduleType);

  const fetchItems = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const params = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...state.filters
      };
      const response = await service.getAll(params);
      dispatch({ type: 'SET_ITEMS', payload: response.data.data });
      dispatch({ type: 'SET_PAGINATION', payload: response.data.pagination });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [service, state.pagination.page, state.pagination.limit, state.filters]);

  const createItem = async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await service.create(data);
      await fetchItems();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || error.message });
      return { success: false, error: error.response?.data?.error };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateItem = async (id, data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await service.update(id, data);
      await fetchItems();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || error.message });
      return { success: false, error: error.response?.data?.error };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteItem = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await service.delete(id);
      await fetchItems();
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.error || error.message });
      return { success: false, error: error.response?.data?.error };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setPage = (page) => {
    dispatch({ type: 'SET_PAGINATION', payload: { ...state.pagination, page } });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    dispatch({ type: 'SET_PAGINATION', payload: { ...state.pagination, page: 1 } });
  };

  const setSelectedItem = (item) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
    dispatch({ type: 'SET_FORM_MODE', payload: item ? 'edit' : 'create' });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const value = {
    ...state,
    config,
    moduleType,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setPage,
    setFilters,
    setSelectedItem,
    resetForm
  };

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
}