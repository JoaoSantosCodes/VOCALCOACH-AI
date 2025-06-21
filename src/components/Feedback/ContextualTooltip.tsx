import React from 'react';
import { Box, Typography, Tooltip, TooltipProps, styled } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { useAnimations } from '../../hooks/useAnimations';

interface ContextualTooltipProps extends Omit<TooltipProps, 'children' | 'title'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactElement;
}

const AnimatedTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))`
  & .MuiTooltip-tooltip {
    background-color: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px;
    font-size: 0.875rem;
    max-width: 300px;
    margin: 8px;
  }
`;

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  title,
  description,
  icon,
  children,
  ...props
}) => {
  const { getFadeInAnimation } = useAnimations();
  const fadeAnimation = getFadeInAnimation(100);

  const tooltipContent = (
    <animated.div style={fadeAnimation}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        {icon && (
          <Box
            sx={{
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              pt: 0.5,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              mb: description ? 0.5 : 0,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.4,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>
    </animated.div>
  );

  return (
    <AnimatedTooltip
      title={tooltipContent}
      placement="top"
      arrow
      enterDelay={200}
      leaveDelay={200}
      {...props}
    >
      {children}
    </AnimatedTooltip>
  );
}; 