import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private static responseTimes: number[] = [];

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();

    res.on('finish', () => {
      const duration = process.hrtime(start);
      const durationInMs = duration[0] * 1000 + duration[1] / 1000000;
      PerformanceMiddleware.responseTimes.push(durationInMs);

      if (PerformanceMiddleware.responseTimes.length > 50) {
        PerformanceMiddleware.responseTimes.shift();
      }
    });

    next();
  }


  static getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const total = this.responseTimes.reduce((sum, time) => sum + time, 0);
    return Number((total / this.responseTimes.length).toFixed(2));
  }
}