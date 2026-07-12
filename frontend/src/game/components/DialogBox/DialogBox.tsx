import { useGameStore } from '../../zustand/store';
import { selectDialog, selectDialogSetters } from '../../zustand/dialog/selectDialog';

import styles from './DialogBox.module.scss';

const DialogBox = () => {
  const dialog = useGameStore(selectDialog) as {
    messages: string[];
    action: (() => void) | null;
    characterName: string;
  };
  const dialogSetters = useGameStore(selectDialogSetters) as { setDialogAction: (action: (() => void) | null) => void };

  const { messages, action, characterName } = dialog;

  if (messages.length === 0) {
    return null;
  }

  const handleClick = () => {
    if (action) {
      action();
      dialogSetters.setDialogAction(null);
    }
  };

  return (
    <div className={styles.dialogBox} onClick={handleClick}>
      <div className={styles.characterName}>{characterName}</div>
      <div className={styles.messages}>
        {messages.map((message: string, idx: number) => (
          <div key={idx} className={styles.message}>
            {message}
          </div>
        ))}
      </div>
      <div className={styles.actionHint}>点击继续...</div>
    </div>
  );
};

export default DialogBox;