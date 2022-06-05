import { Bot } from 'mineflayer';
import { BehaviorFollowEntity, BehaviorGetClosestEntity, BehaviorIdle, EntityFilters, NestedStateMachine, StateMachineTargets, StateTransition } from 'mineflayer-statemachine';

export function createGoToPlayerState(bot: Bot) {
  const targets: StateMachineTargets = {};
  const playerFilter = EntityFilters().PlayersOnly;

  const enter = new BehaviorIdle();
  const exit = new BehaviorIdle();

  const followPlayer = new BehaviorFollowEntity(bot as any, targets);
  const getClosestPlayer = new BehaviorGetClosestEntity(bot as any, targets, playerFilter);

  const transitions = [
    new StateTransition({
      parent: enter,
      child: getClosestPlayer,
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getClosestPlayer,
      child: followPlayer,
      shouldTransition: () => targets.entity !== undefined
    }),

    new StateTransition({
      parent: getClosestPlayer,
      child: exit,
      shouldTransition: () => targets.entity === undefined
    }),

    new StateTransition({
      parent: followPlayer,
      child: exit,
      shouldTransition: () => followPlayer.distanceToTarget() < 2
    })
  ];

  return new NestedStateMachine(transitions, enter, exit);
}
