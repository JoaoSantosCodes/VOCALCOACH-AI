import { useSpring, config } from '@react-spring/web';
import { useCallback } from 'react';

interface AnimationConfig {
  tension?: number;
  friction?: number;
  duration?: number;
}

export const useAnimations = () => {
  const getHoverAnimation = useCallback((customConfig?: AnimationConfig) => {
    return useSpring({
      from: { scale: 1, y: 0 },
      config: {
        tension: customConfig?.tension || 300,
        friction: customConfig?.friction || 20,
      },
    });
  }, []);

  const getFadeInAnimation = useCallback((delay: number = 0, customConfig?: AnimationConfig) => {
    return useSpring({
      from: { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
      delay,
      config: customConfig || config.gentle,
    });
  }, []);

  const getButtonAnimation = useCallback((customConfig?: AnimationConfig) => {
    return useSpring({
      from: { scale: 1 },
      config: {
        tension: customConfig?.tension || 400,
        friction: customConfig?.friction || 20,
      },
    });
  }, []);

  const getPulseAnimation = useCallback((isActive: boolean, customConfig?: AnimationConfig) => {
    return useSpring({
      from: { scale: 1 },
      to: async (next) => {
        while (isActive) {
          await next({ scale: 1.05 });
          await next({ scale: 1 });
        }
      },
      config: {
        tension: customConfig?.tension || 300,
        friction: customConfig?.friction || 10,
        duration: customConfig?.duration || 1000,
      },
    });
  }, []);

  const getProgressAnimation = useCallback((progress: number, customConfig?: AnimationConfig) => {
    return useSpring({
      width: `${progress}%`,
      config: customConfig || config.gentle,
    });
  }, []);

  const getSlideAnimation = useCallback((direction: 'left' | 'right' | 'up' | 'down', show: boolean, customConfig?: AnimationConfig) => {
    const getTransform = () => {
      switch (direction) {
        case 'left':
          return show ? 'translateX(0)' : 'translateX(-100%)';
        case 'right':
          return show ? 'translateX(0)' : 'translateX(100%)';
        case 'up':
          return show ? 'translateY(0)' : 'translateY(-100%)';
        case 'down':
          return show ? 'translateY(0)' : 'translateY(100%)';
      }
    };

    return useSpring({
      transform: getTransform(),
      opacity: show ? 1 : 0,
      config: customConfig || config.gentle,
    });
  }, []);

  return {
    getHoverAnimation,
    getFadeInAnimation,
    getButtonAnimation,
    getPulseAnimation,
    getProgressAnimation,
    getSlideAnimation,
  };
}; 