export interface FeedLoadingState {
  readonly initial: boolean;
  readonly next: boolean;
  readonly prev: boolean;
  readonly jump: boolean;
}

export type FeedLoadingAction =
  | Readonly<{ type: 'initial:start' | 'initial:end' }>
  | Readonly<{ type: 'next:start' | 'next:end' }>
  | Readonly<{ type: 'prev:start' | 'prev:end' }>
  | Readonly<{ type: 'jump:start' | 'jump:end' }>
  | Readonly<{ type: 'reset' }>;

export function feedLoadingReducer(
  state: FeedLoadingState,
  action: FeedLoadingAction,
): FeedLoadingState {
  switch (action.type) {
    case 'initial:start':
      return { ...state, initial: true };
    case 'initial:end':
      return { ...state, initial: false };
    case 'next:start':
      return { ...state, next: true };
    case 'next:end':
      return { ...state, next: false };
    case 'prev:start':
      return { ...state, prev: true };
    case 'prev:end':
      return { ...state, prev: false };
    case 'jump:start':
      return { ...state, jump: true };
    case 'jump:end':
      return { ...state, jump: false };
    case 'reset':
      return { initial: false, next: false, prev: false, jump: false };
    default: {
      // const _exhaustive: never = action;
      return state;
    }
  }
}

export function createInitialFeedLoadingState(params: {
  readonly hasInitialEvents: boolean;
}): FeedLoadingState {
  return {
    initial: !params.hasInitialEvents,
    next: false,
    prev: false,
    jump: false,
  };
}
