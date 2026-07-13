import { useState, useEffect } from 'react';

interface DevicePerformance {
  isLowEnd: boolean;
  cores: number | null;
  memory: number | null;
}

export function useDevicePerformance(): DevicePerformance {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [cores, setCores] = useState<number | null>(null);
  const [memory, setMemory] = useState<number | null>(null);

  useEffect(() => {
    const coresAvailable = navigator.hardwareConcurrency || null;
    const memoryAvailable = (navigator as any).deviceMemory || null;

    setCores(coresAvailable);
    setMemory(memoryAvailable);

    let lowEnd = false;
    if (coresAvailable !== null && coresAvailable <= 2) {
      lowEnd = true;
    }
    if (memoryAvailable !== null && memoryAvailable < 4) {
      lowEnd = true;
    }
    setIsLowEnd(lowEnd);

    if (lowEnd) {
      document.documentElement.classList.add('low-end-device');
    } else {
      document.documentElement.classList.remove('low-end-device');
    }

    return () => {
      document.documentElement.classList.remove('low-end-device');
    };
  }, []);

  return { isLowEnd, cores, memory };
}
