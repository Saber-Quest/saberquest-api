import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as WebSocket from 'ws';
import { BLResponse, SSResponse, CommandData } from './challenges.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChallengesSocketService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ChallengesSocketService.name);
    private blWs: WebSocket;
    private ssWs: WebSocket;
    private reconnectInterval: NodeJS.Timeout | undefined;
    private isReconnecting = false;
    private currentPlayerIds = new Set<string>();
    private currentMapChallenge = {
        hash: '',
        id: 0
    };

    constructor(private readonly prismaService: PrismaService) { }

    setVariables() {
        const playerIds = this.prismaService.user.findMany({
            select: {
                id: true,
            },
            where: {
                doesMapChallenge: true,
            },
        });

        playerIds.then((players) => {
            players.forEach((player) => {
                this.currentPlayerIds.add(player.id);
            });

            this.logger.log(`Fetched ${this.currentPlayerIds.size} player IDs`);
        }).catch((error) => {
            this.logger.error(`Error fetching player IDs: ${error.message}`);
        });

        const mapHash = this.prismaService.mapChallenge.findFirst({
            select: {
                id: true,
                mapHash: true,
            },
            orderBy: {
                startedOn: 'desc',
            }
        });

        mapHash.then((map) => {
            if (map) {
                this.currentMapChallenge = {
                    hash: map.mapHash,
                    id: map.id
                };
            }

            this.logger.log(`Fetched map hash: ${this.currentMapChallenge.hash}`);
        }).catch((error) => {
            this.logger.error(`Error fetching map hash: ${error.message}`);
        });
    }

    onModuleInit() {
        this.connectBLWebSocket();
        this.connectSSWebSocket();
        this.setVariables();

        setInterval(() => {
            this.setVariables();
        }, 1000 * 60 * 60);
    }

    onModuleDestroy() {
        this.cleanUp();
    }

    private connectBLWebSocket() {
        try {
            this.logger.log('Attempting to connect to BeatLeader WebSocket server...');

            this.blWs = new WebSocket('wss://sockets.api.beatleader.com/scores');

            this.blWs.on('open', () => {
                this.logger.log('Connected to the BeatLeader WebSocket server');
                this.isReconnecting = false;

                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = undefined;
                }
            });

            this.blWs.on('message', (data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    this.handleBL(parsedData);
                } catch (e) {
                    this.logger.error(`Error parsing WebSocket message: ${e.message}`);
                    this.logger.debug(`Raw message: ${data}`);
                }
            });

            this.blWs.on('error', (error) => {
                this.logger.error(`WebSocket error: ${error.message}`);
            });

            this.blWs.on('close', (code, reason) => {
                this.logger.warn(`WebSocket closed: Code ${code} - ${reason || 'No reason provided'}`);

                if (!this.isReconnecting) {
                    this.setupReconnect('bl');
                }
            });

        } catch (error) {
            this.logger.error(`Failed to create WebSocket connection: ${error.message}`);

            if (!this.isReconnecting) {
                this.setupReconnect('bl');
            }
        }
    }

    private connectSSWebSocket() {
        try {
            this.logger.log('Attempting to connect to ScoreSaber WebSocket server...');
            this.ssWs = new WebSocket('wss://scoresaber.com/ws');
            this.ssWs.on('open', () => {
                this.logger.log('Connected to the ScoreSaber WebSocket server');
                this.isReconnecting = false;

                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = undefined;
                }
            });

            this.ssWs.on('message', (data) => {
                try {
                    if (!data.toString().startsWith('{')) {
                        this.logger.warn('Received non-JSON message from ScoreSaber WebSocket');
                        return;
                    }
                    const parsedData = JSON.parse(data.toString());
                    this.handleSS(parsedData);
                } catch (e) {
                    this.logger.error(`Error parsing WebSocket message: ${e.message}`);
                    this.logger.debug(`Raw message: ${data}`);
                }
            });

            this.ssWs.on('error', (error) => {
                this.logger.error(`WebSocket error: ${error.message}`);
            });

            this.ssWs.on('close', (code, reason) => {
                this.logger.warn(`WebSocket closed: Code ${code} - ${reason || 'No reason provided'}`);

                if (!this.isReconnecting) {
                    this.setupReconnect('ss');
                }
            });
        } catch (error) {
            this.logger.error(`Failed to create WebSocket connection: ${error.message}`);

            if (!this.isReconnecting) {
                this.setupReconnect('ss');
            }
        }
    }

    private setupReconnect(ws: 'bl' | 'ss') {
        if (ws === 'bl') {
            this.isReconnecting = true;
            this.logger.log('Setting up reconnection timer...');

            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
            }

            this.reconnectInterval = setInterval(() => {
                this.logger.log('Attempting to reconnect...');

                if (this.blWs) {
                    this.blWs.removeAllListeners();

                    if (this.blWs.readyState === WebSocket.OPEN || this.blWs.readyState === WebSocket.CONNECTING) {
                        this.blWs.terminate();
                    }
                }

                this.connectBLWebSocket();
            }, 5000);
        } else if (ws === 'ss') {
            this.isReconnecting = true;
            this.logger.log('Setting up reconnection timer...');

            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
            }

            this.reconnectInterval = setInterval(() => {
                this.logger.log('Attempting to reconnect...');

                if (this.ssWs) {
                    this.ssWs.removeAllListeners();

                    if (this.ssWs.readyState === WebSocket.OPEN || this.ssWs.readyState === WebSocket.CONNECTING) {
                        this.ssWs.terminate();
                    }
                }

                this.connectSSWebSocket();
            }, 5000);
        }
    }

    private cleanUp() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = undefined;
        }

        if (this.blWs) {
            this.blWs.removeAllListeners();

            if (this.blWs.readyState === WebSocket.OPEN) {
                this.blWs.close(1000, 'BeatLeader socket shutting down');
            } else if (this.blWs.readyState === WebSocket.CONNECTING) {
                this.blWs.terminate();
            }
        }

        if (this.ssWs) {
            this.ssWs.removeAllListeners();

            if (this.ssWs.readyState === WebSocket.OPEN) {
                this.ssWs.close(1000, 'ScoreSaber socket shutting down');
            } else if (this.ssWs.readyState === WebSocket.CONNECTING) {
                this.ssWs.terminate();
            }
        }
    }

    private async handleBL(data: BLResponse) {
        if (!data) {
            this.logger.warn('Received empty or invalid data from WebSocket');
            return;
        }

        if (this.currentPlayerIds.has(data.player.id) && data.leaderboard.song.hash.toUpperCase() === this.currentMapChallenge.hash.toUpperCase()) {
            const isOnLeaderboard = await this.prismaService.mapChallengeLeaderboard.findFirst({
                where: {
                    userId: data.player.id,
                    mapChallengeId: this.currentMapChallenge.id,
                },
            });

            if (!isOnLeaderboard) {
                await this.prismaService.mapChallengeLeaderboard.create({
                    data: {
                        userId: data.player.id,
                        score: data.baseScore,
                        mapChallengeId: this.currentMapChallenge.id,
                        completedOn: new Date(),
                        tier: 1
                    },
                });
                this.logger.log(`New score added for player ${data.player.id} on challenge ${this.currentMapChallenge.id}`);
            } else {
                await this.prismaService.mapChallengeLeaderboard.update({
                    where: {
                        id: isOnLeaderboard.id,
                    },
                    data: {
                        score: data.baseScore,
                        completedOn: new Date(),
                    },
                });
                this.logger.log(`Score updated for player ${data.player.id} on challenge ${this.currentMapChallenge.id}`);
            }
        }
    }

    private async handleSS(command: SSResponse) {
        if (command.commandName === 'score') {
            const data = command.commandData as CommandData;

            if (!data) {
                this.logger.warn('Received empty or invalid data from WebSocket');
                return;
            }

            if (this.currentPlayerIds.has(data.score.leaderboardPlayerInfo.id) && data.leaderboard.songHash === this.currentMapChallenge.hash.toUpperCase()) {
                const isOnLeaderboard = await this.prismaService.mapChallengeLeaderboard.findFirst({
                    where: {
                        userId: data.score.leaderboardPlayerInfo.id,
                        mapChallengeId: this.currentMapChallenge.id,
                    },
                });

                if (!isOnLeaderboard) {
                    await this.prismaService.mapChallengeLeaderboard.create({
                        data: {
                            userId: data.score.leaderboardPlayerInfo.id,
                            score: data.score.baseScore,
                            mapChallengeId: this.currentMapChallenge.id,
                            completedOn: new Date(),
                            tier: 1
                        },
                    });
                    return this.logger.log(`New score added for player ${data.score.leaderboardPlayerInfo.id} on challenge ${this.currentMapChallenge.id}`);
                } else {
                    await this.prismaService.mapChallengeLeaderboard.update({
                        where: {
                            id: isOnLeaderboard!.id,
                        },
                        data: {
                            score: data.score.baseScore,
                            completedOn: new Date(),
                        },
                    });
                    this.logger.log(`Score updated for player ${data.score.leaderboardPlayerInfo.id} on challenge ${this.currentMapChallenge.id}`);
                }
            }
        }
    }
}