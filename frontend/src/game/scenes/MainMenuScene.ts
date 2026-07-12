import { DOWN_DIRECTION, IDLE_FRAME, IDLE_FRAME_POSITION_KEY } from '../constants';

import { changeScene } from '../utils/sceneHelpers';
import { getSelectorData } from '../utils/utils';

import { selectHeroSetters } from '../zustand/hero/selectHeroData';
import { selectMapSetters } from '../zustand/map/selectMapData';
import { selectMenuSetters } from '../zustand/menu/selectMenu';

export const scene: any = {};

export const key = 'MainMenuScene';

export function create() {
  const mapSetters = getSelectorData(selectMapSetters) as { setMapKey: (key: string) => void };
  const menuSetters = getSelectorData(selectMenuSetters) as { setMenuItems: (items: string[]) => void; setMenuOnSelect: (fn: ((key: string, item: string) => void) | null) => void };

  menuSetters.setMenuItems(['start_game', 'exit']);
  menuSetters.setMenuOnSelect((menuKey: string) => {
    if (menuKey === 'start_game') {
      handleStartGameSelected();
    } else {
      menuSetters.setMenuItems([]);
      menuSetters.setMenuOnSelect(null);
      window.location.reload();
    }
  });

  const handleStartGameSelected = () => {
    menuSetters.setMenuItems([]);
    menuSetters.setMenuOnSelect(null);
    mapSetters.setMapKey('sample_map');
    const heroSetters = getSelectorData(selectHeroSetters) as {
      setHeroPreviousPosition: (pos: { x: number; y: number }) => void;
      setHeroFacingDirection: (direction: string) => void;
      setHeroInitialPosition: (pos: { x: number; y: number }) => void;
      setHeroInitialFrame: (frame: string) => void;
    };

    heroSetters.setHeroFacingDirection(DOWN_DIRECTION);
    heroSetters.setHeroInitialFrame(IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, DOWN_DIRECTION));
    heroSetters.setHeroInitialPosition({ x: 30, y: 42 });
    heroSetters.setHeroPreviousPosition({ x: 30, y: 42 });

    changeScene(scene, 'GameScene', {
      atlases: ['hero'],
      images: [],
      mapKey: 'sample_map',
    });
  };
}