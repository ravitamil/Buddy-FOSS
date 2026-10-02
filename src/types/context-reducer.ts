import type {BaseEntity, ContextAction, ContextState} from './context-core.types';

export const createContextReducer = <T extends BaseEntity>() => {
  return (state: ContextState<T>, action: ContextAction<T>): ContextState<T> => {
    switch (action.type) {
      case 'SET_LOADING':
        return {...state, isLoading: action.payload};

      case 'SET_ERROR':
        return {...state, error: action.payload, isLoading: false};

      case 'SET_ITEMS':
        return {
          ...state,
          items: action.payload,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
          isDirty: false,
        };

      case 'ADD_ITEM':
        return {
          ...state,
          items: [...state.items, action.payload],
          lastUpdated: new Date(),
          isDirty: true,
        };

      case 'UPDATE_ITEM':
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {...item, ...action.payload.updates, updatedAt: new Date()}
              : item,
          ),
          lastUpdated: new Date(),
          isDirty: true,
        };

      case 'DELETE_ITEM':
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload),
          lastUpdated: new Date(),
          isDirty: true,
        };

      case 'ADD_MANY_ITEMS':
        return {
          ...state,
          items: [...state.items, ...action.payload],
          lastUpdated: new Date(),
          isDirty: true,
        };

      case 'DELETE_MANY_ITEMS':
        return {
          ...state,
          items: state.items.filter((item) => !action.payload.includes(item.id)),
          lastUpdated: new Date(),
          isDirty: true,
        };

      case 'SET_DIRTY':
        return {...state, isDirty: action.payload};

      case 'RESET_STATE':
        return {
          items: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
          isDirty: false,
        };

      default:
        return state;
    }
  };
};
