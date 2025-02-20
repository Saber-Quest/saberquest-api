import { WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as os from 'os';
import { PerformanceMiddleware } from 'src/performance/performance.middleware';

@WebSocketGateway({ cors: true })
export class ResourceGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  private interval: NodeJS.Timeout;
  private averageInterval: NodeJS.Timeout;

  private cpuData: number[] = [];
  private memoryData: number[] = [];
  private responseTimeData: number[] = [];
  private labels: string[] = [];
  private averageCpuData: number[] = [];
  private averageMemoryData: number[] = [];

  afterInit() {
    this.startMonitoring();
  }

  private getCpuLoad(): Promise<number> {
    return new Promise((resolve) => {
      const start = os.cpus();

      setTimeout(() => {
        const end = os.cpus();
        let totalDiff = 0;
        let idleDiff = 0;

        for (let i = 0; i < start.length; i++) {
          const startCpu = start[i].times;
          const endCpu = end[i].times;

          const startTotal = Object.values(startCpu).reduce((acc, val) => acc + val, 0);
          const endTotal = Object.values(endCpu).reduce((acc, val) => acc + val, 0);

          totalDiff += endTotal - startTotal;
          idleDiff += endCpu.idle - startCpu.idle;
        }

        const cpuUsage = ((totalDiff - idleDiff) / totalDiff) * 100;
        resolve(Number(cpuUsage.toFixed(2)));
      }, 1000);
    });
  }

  private formatUptime(uptimeInSeconds: number): string {
    const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  }

  private startMonitoring() {
    this.averageInterval = setInterval(() => {
      this.addAverages();
    }, 1000)

    this.interval = setInterval(() => {
      const data = this.getSystemStats();
      this.storeData(data);
      this.server.emit('resource_update', data);
    }, 30000);
  }

  private async addAverages() {
    this.averageCpuData.push(await this.getCpuLoad())
    this.averageMemoryData.push(Number(((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)))
  }

  private storeData(data: any) {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.labels.push(now);
    this.cpuData.push(data.cpu);
    this.memoryData.push(data.memoryUsed);
    this.responseTimeData.push(data.avgResponseTime);

    if (this.labels.length > 50) {
      this.labels.shift();
      this.cpuData.shift();
      this.memoryData.shift();
      this.responseTimeData.shift();
    }
  }

  private getSystemStats() {
    const cpu = Number((this.averageCpuData.reduce((a, b) => a + b) / this.averageCpuData.length).toFixed(2));
    const memory = Number((this.averageMemoryData.reduce((a, b) => a + b) / this.averageMemoryData.length).toFixed(2));

    this.averageCpuData = [];
    this.averageMemoryData = [];

    return {
      cpu: cpu,
      memoryUsed: memory,
      avgResponseTime: PerformanceMiddleware.getAverageResponseTime(),
      processUptime: this.formatUptime(process.uptime())
    };
  }

  @SubscribeMessage('connect')
  handleConnection(client: any) {
    client.emit('resource_update', {
      cpuData: this.cpuData,
      memoryData: this.memoryData,
      responseTimeData: this.responseTimeData,
      labels: this.labels,
      processUptime: this.formatUptime(process.uptime())
    });
  }
}
