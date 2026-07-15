import clsx from 'clsx';
import { KeyboardEvent, useRef, useState } from 'react';
import { Conversation, Player } from '../../game/engine/types';
import { useGameStore } from '../../game/engine/gameStore';

export function MessageInput({
  conversation,
  humanPlayer,
}: {
  conversation: Conversation;
  humanPlayer: Player;
}) {
  const playerDescriptions = useGameStore((state) => state.playerDescriptions);
  const addMessage = useGameStore((state) => state.addMessage);
  const updateConversation = useGameStore((state) => state.updateConversation);

  const humanName = [...playerDescriptions.values()].find((p) => p.playerId === humanPlayer.id)?.name;
  const inputRef = useRef<HTMLParagraphElement>(null);
  const inflightUuid = useRef<string | undefined>();
  const currentlyTyping = conversation.isTyping;

  const onKeyDown = async (e: KeyboardEvent) => {
    e.stopPropagation();

    if (e.key !== 'Enter') {
      if (currentlyTyping || inflightUuid.current !== undefined) {
        return;
      }
      inflightUuid.current = crypto.randomUUID();
      try {
        updateConversation(conversation.id, {
          isTyping: { playerId: humanPlayer.id, messageUuid: inflightUuid.current, since: Date.now() },
        });
      } finally {
        inflightUuid.current = undefined;
      }
      return;
    }

    e.preventDefault();
    if (!inputRef.current) {
      return;
    }
    const text = inputRef.current.innerText;
    inputRef.current.innerText = '';
    if (!text.trim()) {
      return;
    }

    let messageUuid = inflightUuid.current;
    if (currentlyTyping && currentlyTyping.playerId === humanPlayer.id) {
      messageUuid = currentlyTyping.messageUuid;
    }
    messageUuid = messageUuid || crypto.randomUUID();

    const now = Date.now();

    addMessage({
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      author: humanPlayer.id,
      authorName: humanName || 'You',
      text: text.trim(),
      timestamp: now,
      messageUuid,
    });

    updateConversation(conversation.id, {
      isTyping: undefined,
      lastMessage: { author: humanPlayer.id, timestamp: now },
      numMessages: (conversation.numMessages || 0) + 1,
    });
  };

  return (
    <div className="leading-tight mb-6">
      <div className="flex gap-4">
        <span className="uppercase flex-grow">{humanName}</span>
      </div>
      <div className={clsx('bubble', 'bubble-mine')}>
        <p
          className="bg-white -mx-3 -my-1"
          ref={inputRef}
          contentEditable
          style={{ outline: 'none' }}
          tabIndex={0}
          placeholder="Type here"
          onKeyDown={(e) => onKeyDown(e)}
        />
      </div>
    </div>
  );
}