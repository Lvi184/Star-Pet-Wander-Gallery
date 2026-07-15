import { PixiComponent } from '@pixi/react';
import { Viewport } from 'pixi-viewport';
import { Application, IRenderer } from 'pixi.js';
import { MutableRefObject, ReactNode } from 'react';

export type ViewportProps = {
  app: Application;
  viewportRef?: MutableRefObject<Viewport | undefined>;
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
  children?: ReactNode;
};

export default PixiComponent('Viewport', {
  create(props: ViewportProps) {
    const { app, children, viewportRef, ...viewportProps } = props;
    const viewport = new Viewport({
      events: (app.renderer as IRenderer & { events: any }).events,
      passiveWheel: false,
      ...(viewportProps as unknown as object),
    });
    if (viewportRef) {
      viewportRef.current = viewport;
    }
    viewport
        .drag()
        .pinch({})
        .wheel()
        .decelerate()
        .clamp({ direction: 'all', underflow: 'center' })
        .setZoom(-10)
        .clampZoom({
          minScale: (1.04 * props.screenWidth) / (props.worldWidth / 2),
          maxScale: 3.0,
        });
    return viewport;
  },
  applyProps(viewport: Viewport, oldProps: any, newProps: any) {
    Object.keys(newProps).forEach((p) => {
      if (p !== 'app' && p !== 'viewportRef' && p !== 'children' && oldProps[p] !== newProps[p]) {
        (viewport as any)[p] = newProps[p];
      }
    });
  },
});