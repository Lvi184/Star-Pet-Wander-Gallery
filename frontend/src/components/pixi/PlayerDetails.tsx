import { useGameStore } from '../../game/engine/gameStore';
import { Player, Conversation, PlayerDescription } from '../../game/engine/types';
import { Messages } from './Messages';
import closeImg from '../../../public/close.svg';

export default function PlayerDetails({
  scrollViewRef,
}: {
  scrollViewRef: React.RefObject<HTMLDivElement>;
}) {
  const selectedPlayerId = useGameStore((state) => state.selectedPlayerId);
  const players = useGameStore((state) => state.players);
  const conversations = useGameStore((state) => state.conversations);
  const playerDescriptions = useGameStore((state) => state.playerDescriptions);
  const messages = useGameStore((state) => state.messages);
  const humanPlayer = useGameStore((state) => state.getHumanPlayer());
  const setSelectedPlayerId = useGameStore((state) => state.setSelectedPlayerId);
  const createConversation = useGameStore((state) => state.createConversation);
  const updateConversation = useGameStore((state) => state.updateConversation);
  const removeConversation = useGameStore((state) => state.removeConversation);

  const player = selectedPlayerId ? players.get(selectedPlayerId) : undefined;
  const playerDescription = selectedPlayerId ? playerDescriptions.get(selectedPlayerId) : undefined;

  const humanConversation = humanPlayer ? [...conversations.values()].find((c) => c.participants.has(humanPlayer.id)) : undefined;
  const playerConversation = player ? [...conversations.values()].find((c) => c.participants.has(player.id)) : undefined;

  if (humanPlayer && humanConversation) {
    const otherPlayerIds = [...humanConversation.participants.keys()].filter((p) => p !== humanPlayer.id);
    if (otherPlayerIds.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(otherPlayerIds[0]);
      return null;
    }
  }

  if (!selectedPlayerId) {
    return (
      <div className="h-full text-xl flex text-center items-center p-4">
        Click on an agent on the map to see chat history.
      </div>
    );
  }

  if (!player) {
    return null;
  }

  const isMe = humanPlayer && player.id === humanPlayer.id;

  const canInvite = !isMe && !playerConversation && humanPlayer && !humanConversation;
  const sameConversation =
    !isMe &&
    humanPlayer &&
    humanConversation &&
    playerConversation &&
    humanConversation.id === playerConversation.id;

  const humanStatus = humanPlayer && humanConversation ? humanConversation.participants.get(humanPlayer.id)?.status : undefined;
  const playerStatus = playerConversation ? playerConversation.participants.get(player.id)?.status : undefined;

  const haveInvite = sameConversation && humanStatus?.kind === 'invited';
  const waitingForAccept = sameConversation && playerStatus?.kind === 'invited';
  const waitingForNearby = sameConversation && playerStatus?.kind === 'walkingOver' && humanStatus?.kind === 'walkingOver';
  const inConversationWithMe = sameConversation && playerStatus?.kind === 'participating' && humanStatus?.kind === 'participating';

  const onStartConversation = () => {
    if (!humanPlayer || !player) return;

    const now = Date.now();
    const conversationId = Math.random().toString(36).substring(2, 11);

    const participants = new Map<string, any>();
    participants.set(humanPlayer.id, { playerId: humanPlayer.id, invited: now, status: { kind: 'walkingOver' } });
    participants.set(player.id, { playerId: player.id, invited: now, status: { kind: 'invited' } });

    createConversation({
      id: conversationId,
      creator: humanPlayer.id,
      created: now,
      numMessages: 0,
      participants,
    });
  };

  const onAcceptInvite = () => {
    if (!humanPlayer || !humanConversation) return;

    const member = humanConversation.participants.get(humanPlayer.id);
    if (member) {
      member.status = { kind: 'walkingOver' };
      updateConversation(humanConversation.id, { participants: humanConversation.participants });
    }
  };

  const onRejectInvite = () => {
    if (!humanPlayer || !humanConversation) return;
    removeConversation(humanConversation.id);
  };

  const onLeaveConversation = () => {
    if (!humanPlayer || !inConversationWithMe || !humanConversation) return;
    removeConversation(humanConversation.id);
  };

  return (
    <>
      <div className="flex gap-4">
        <div className="box w-3/4 sm:w-full mr-auto">
          <h2 className="bg-brown-700 p-2 font-display text-2xl sm:text-4xl tracking-wider shadow-solid text-center">
            {playerDescription?.name}
          </h2>
        </div>
        <button
          className="button text-white shadow-solid text-2xl cursor-pointer pointer-events-auto"
          onClick={() => setSelectedPlayerId(null)}
        >
          <h2 className="h-full bg-clay-700">
            <img className="w-4 h-4 sm:w-5 sm:h-5" src={closeImg} />
          </h2>
        </button>
      </div>

      {canInvite && (
        <button
          className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto"
          onClick={onStartConversation}
        >
          <div className="h-full bg-clay-700 text-center">
            <span>Start conversation</span>
          </div>
        </button>
      )}

      {waitingForAccept && (
        <button className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto opacity-50">
          <div className="h-full bg-clay-700 text-center">
            <span>Waiting for accept...</span>
          </div>
        </button>
      )}

      {waitingForNearby && (
        <button className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto opacity-50">
          <div className="h-full bg-clay-700 text-center">
            <span>Walking over...</span>
          </div>
        </button>
      )}

      {inConversationWithMe && (
        <button
          className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto"
          onClick={onLeaveConversation}
        >
          <div className="h-full bg-clay-700 text-center">
            <span>Leave conversation</span>
          </div>
        </button>
      )}

      {haveInvite && (
        <>
          <button
            className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto"
            onClick={onAcceptInvite}
          >
            <div className="h-full bg-clay-700 text-center">
              <span>Accept</span>
            </div>
          </button>
          <button
            className="mt-6 button text-white shadow-solid text-xl cursor-pointer pointer-events-auto"
            onClick={onRejectInvite}
          >
            <div className="h-full bg-clay-700 text-center">
              <span>Reject</span>
            </div>
          </button>
        </>
      )}

      {!playerConversation && player.activity && player.activity.until > Date.now() && (
        <div className="box flex-grow mt-6">
          <h2 className="bg-brown-700 text-base sm:text-lg text-center">
            {player.activity.description}
          </h2>
        </div>
      )}

      <div className="desc my-6">
        <p className="leading-tight -m-4 bg-brown-700 text-base sm:text-sm">
          {!isMe && playerDescription?.description}
          {isMe && <i>This is you!</i>}
          {!isMe && inConversationWithMe && (
            <>
              <br />
              <br />(<i>Conversing with you!</i>)
            </>
          )}
        </p>
      </div>

      {!isMe && playerConversation && playerStatus?.kind === 'participating' && (
        <Messages
          conversation={playerConversation}
          inConversationWithMe={inConversationWithMe ?? false}
          humanPlayer={humanPlayer}
          scrollViewRef={scrollViewRef}
        />
      )}
    </>
  );
}