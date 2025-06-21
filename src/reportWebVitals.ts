import { ReportHandler } from 'web-vitals';
import { WebVitalMetric } from './config/monitoring.config';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'CLS',
          value: metric.value,
          id: metric.id,
        };
        onPerfEntry(webVitalMetric);
      });
      getFID((metric) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'FID',
          value: metric.value,
          id: metric.id,
        };
        onPerfEntry(webVitalMetric);
      });
      getFCP((metric) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'FCP',
          value: metric.value,
          id: metric.id,
        };
        onPerfEntry(webVitalMetric);
      });
      getLCP((metric) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'LCP',
          value: metric.value,
          id: metric.id,
        };
        onPerfEntry(webVitalMetric);
      });
      getTTFB((metric) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'TTFB',
          value: metric.value,
          id: metric.id,
        };
        onPerfEntry(webVitalMetric);
      });
    });
  }
};

export default reportWebVitals; 