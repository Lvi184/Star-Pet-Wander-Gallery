import { useEffect, useState, useRef } from 'react';
import { Stage, Container } from '@pixi/react';
import PixiGame from '../../components/pixi/PixiGame';
import './MapScene.css';

export default function MapScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setWidth(rect.width);
        setHeight(rect.height);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="map-scene-container" ref={containerRef}>
      <Stage width={width} height={height} options={{ backgroundColor: 0x87ceeb }}>
        <Container>
          <PixiGame width={width} height={height} />
        </Container>
      </Stage>
    </div>
  );
}

export { MapScene };