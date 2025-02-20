import { PerformanceMiddleware } from './performance.middleware';

describe('PerformanceMiddleware', () => {
  it('should be defined', () => {
    expect(new PerformanceMiddleware()).toBeDefined();
  });
});
