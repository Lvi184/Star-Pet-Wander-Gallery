import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { Conversation, Player, Message } from '../../game/engine/types';
import { useGameStore } from '../../game/engine/gameStore';
import { MessageInput } from './MessageInput';

export function Messages({
  conversation,
  inConversationWithMe,
  humanPlayer,
  scrollViewRef,
}: {
  conversation: Conversation;
  inConversationWithMe: boolean;
  humanPlayer?: Player;
  scrollViewRef: React.RefObject<HTMLDivElement>;
}) {
  const messages = useGameStore((state) => state.messages.get(conversation.id) || []);
  const playerDescriptions = useGameStore((state) => state.playerDescriptions);

  let currentlyTyping = conversation.isTyping;
  if (messages !== undefined && currentlyTyping) {
    if (messages.find((m) => m.messageUuid === currentlyTyping!.messageUuid)) {
      currentlyTyping = undefined;
    }
  }

  const currentlyTypingName =
    currentlyTyping &&
    [...playerDescriptions.values()].find((p) => p.playerId === currentlyTyping?.playerId)?.name;

  const scrollView = scrollViewRef.current;
  const isScrolledToBottom = useRef(false);

  useEffect(() => {
    if (!scrollView) return;

    const onScroll = () => {
      isScrolledToBottom.current = !!(
        scrollView && scrollView.scrollHeight - scrollView.scrollTop - 50 <= scrollView.clientHeight
      );
    };
    scrollView.addEventListener('scroll', onScroll);
    return () => scrollView.removeEventListener('scroll', onScroll);
  }, [scrollView]);

  useEffect(() => {
    if (isScrolledToBottom.current) {
      scrollViewRef.current?.scrollTo({
        top: scrollViewRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, currentlyTyping]);

  if (messages.length === 0 && !inConversationWithMe) {
    return null;
  }

  const messageNodes: { time: number; node: React.ReactNode }[] = messages.map((m) => {
    const node = (
      <div key={`text-${m.id}`} className="leading-tight mb-6">
        <div className="flex gap-4">
          <span className="uppercase flex-grow">{m.authorName}</span>
          <time dateTime={m.timestamp.toString()}>
            {new Date(m.timestamp).toLocaleString()}
          </time>
        </div>
        <div className={clsx('bubble', m.author === humanPlayer?.id && 'bubble-mine')}>
          <p className="bg-white -mx-3 -my-1">{m.text}</p>
        </div>
      </div>
    );
    return { node, time: m.timestamp };
  });

  const lastMessageTs = messages.length > 0
    ? messages.map((m) => m.timestamp).reduce((a, b) => Math.max(a, b), 0)
    : 0;

  const membershipNodes: typeof messageNodes = [];
  for (const [playerId, m] of conversation.participants) {
    const playerName = [...playerDescriptions.values()].find((p) => p.playerId === playerId)?.name;
    let started;
    if (m.status.kind === 'participating') {
      started = m.status.started;
    }
    if (started) {
      membershipNodes.push({
        node: (
          <div key={`joined-${playerId}`} className="leading-tight mb-6">
            <p className="text-brown-700 text-center">{playerName} joined the conversation.</p>
          </div>
        ),
        time: started,
      });
    }
  }

  const nodes = [...messageNodes, ...membershipNodes];
  nodes.sort((a, b) => a.time - b.time);

  return (
    <div className="chats text-base sm:text-sm">
      <div className="bg-brown-200 text-black p-2">
        {nodes.length > 0 && nodes.map((n) => n.node)}
        {currentlyTyping && currentlyTyping.playerId !== humanPlayer?.id && (
          <div key="typing" className="leading-tight mb-6">
            <div className="flex gap-4">
              <span className="uppercase flex-grow">{currentlyTypingName}</span>
              <time dateTime={currentlyTyping.since.toString()}>
                {new Date(currentlyTyping.since).toLocaleString()}
              </time>
            </div>
            <div className={clsx('bubble')}>
              <p className="bg-white -mx-3 -my-1">
                <i>typing...</i>
              </p>
            </div>
          </div>
        )}
        {humanPlayer && inConversationWithMe && (
          <MessageInput
            conversation={conversation}
            humanPlayer={humanPlayer}
          />
        )}
      </div>
    </div>
  );
}