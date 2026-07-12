import { SetState } from '../types';

export default (set: SetState) => ({
  setMenuItems: (items: string[]) =>
    set((state: any) => ({
      menu: {
        ...state.menu,
        items,
      },
    })),
  setMenuPosition: (position: string) =>
    set((state: any) => ({
      menu: {
        ...state.menu,
        position,
      },
    })),
  setMenuOnSelect: (onSelect: ((key: string, item: string) => void) | null) =>
    set((state: any) => ({
      menu: {
        ...state.menu,
        onSelect,
      },
    })),
});