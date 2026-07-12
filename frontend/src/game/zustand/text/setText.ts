import { SetState } from '../types';

export default (set: SetState) => ({
  setTextTexts: (texts: { key: string; variables: Record<string, unknown>; config: Record<string, unknown> }[]) =>
    set((state: any) => ({
      text: {
        ...state.text,
        texts,
      },
    })),
});