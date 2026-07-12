import { SetState } from '../types';

export default (set: SetState) => ({
  setDialogMessages: (messages: string[]) =>
    set((state: any) => ({
      dialog: {
        ...state.dialog,
        messages,
      },
    })),
  setDialogAction: (action: (() => void) | null) =>
    set((state: any) => ({
      dialog: {
        ...state.dialog,
        action,
      },
    })),
  setDialogCharacterName: (characterName: string) =>
    set((state: any) => ({
      dialog: {
        ...state.dialog,
        characterName,
      },
    })),
});