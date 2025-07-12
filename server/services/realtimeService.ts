import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { RedisService } from './redisService';

interface CollaborationRoom {
  roomId: string;
  dataSourceId: number;
  users: Map<string, { userId: number; username: string; color: string }>;
  cursors: Map<string, { x: number; y: number }>;
}

export class RealtimeService {
  private static instance: RealtimeService;
  private io: SocketServer;
  private redis: RedisService;
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userColors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', 
    '#EF4444', '#EC4899', '#14B8A6', '#6366F1'
  ];

  private constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5000',
        credentials: true
      }
    });

    this.redis = RedisService.getInstance();
    this.setupSocketHandlers();
  }

  static initialize(server: Server): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService(server);
    }
    return RealtimeService.instance;
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      throw new Error('RealtimeService not initialized');
    }
    return RealtimeService.instance;
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join collaboration room
      socket.on('join-room', ({ roomId, dataSourceId, userId, username }) => {
        socket.join(roomId);
        
        // Get or create room
        let room = this.rooms.get(roomId);
        if (!room) {
          room = {
            roomId,
            dataSourceId,
            users: new Map(),
            cursors: new Map()
          };
          this.rooms.set(roomId, room);
        }

        // Assign user color
        const userIndex = room.users.size % this.userColors.length;
        const userColor = this.userColors[userIndex];

        // Add user to room
        room.users.set(socket.id, { userId, username, color: userColor });

        // Notify others
        socket.to(roomId).emit('user-joined', {
          socketId: socket.id,
          userId,
          username,
          color: userColor
        });

        // Send current users to new joiner
        const currentUsers = Array.from(room.users.entries()).map(([id, user]) => ({
          socketId: id,
          ...user
        }));
        socket.emit('room-users', currentUsers);
      });

      // Handle cursor movement
      socket.on('cursor-move', ({ roomId, x, y }) => {
        const room = this.rooms.get(roomId);
        if (room) {
          room.cursors.set(socket.id, { x, y });
          socket.to(roomId).emit('cursor-update', {
            socketId: socket.id,
            x,
            y,
            user: room.users.get(socket.id)
          });
        }
      });

      // Handle cell selection
      socket.on('cell-select', ({ roomId, row, column }) => {
        socket.to(roomId).emit('cell-selected', {
          socketId: socket.id,
          row,
          column
        });
      });

      // Handle data updates
      socket.on('data-update', async ({ roomId, dataSourceId, updates }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Broadcast to other users
        socket.to(roomId).emit('data-changed', {
          socketId: socket.id,
          updates
        });

        // Store update in Redis for persistence
        const updateKey = `update:${dataSourceId}:${Date.now()}`;
        await this.redis.set(updateKey, {
          userId: room.users.get(socket.id)?.userId,
          updates,
          timestamp: new Date().toISOString()
        }, 3600); // 1 hour TTL
      });

      // Handle chart interactions
      socket.on('chart-interact', ({ roomId, chartId, interaction }) => {
        socket.to(roomId).emit('chart-interaction', {
          socketId: socket.id,
          chartId,
          interaction
        });
      });

      // Handle analysis sharing
      socket.on('share-analysis', ({ roomId, analysis }) => {
        socket.to(roomId).emit('analysis-shared', {
          socketId: socket.id,
          analysis,
          user: this.rooms.get(roomId)?.users.get(socket.id)
        });
      });

      // Handle comments
      socket.on('add-comment', async ({ roomId, dataSourceId, comment }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const user = room.users.get(socket.id);
        const commentData = {
          id: `comment-${Date.now()}-${Math.random()}`,
          userId: user?.userId,
          username: user?.username,
          text: comment.text,
          position: comment.position,
          timestamp: new Date().toISOString()
        };

        // Store comment
        const commentKey = `comments:${dataSourceId}`;
        const existingComments = await this.redis.get(commentKey) || [];
        existingComments.push(commentData);
        await this.redis.set(commentKey, existingComments);

        // Broadcast to all users in room
        this.io.to(roomId).emit('comment-added', commentData);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove from all rooms
        this.rooms.forEach((room, roomId) => {
          if (room.users.has(socket.id)) {
            room.users.delete(socket.id);
            room.cursors.delete(socket.id);
            
            // Notify others
            socket.to(roomId).emit('user-left', {
              socketId: socket.id
            });
            
            // Clean up empty rooms
            if (room.users.size === 0) {
              this.rooms.delete(roomId);
            }
          }
        });
      });
    });
  }

  // Broadcast updates to specific room
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // Send notification to specific user
  sendToUser(socketId: string, event: string, data: any) {
    this.io.to(socketId).emit(event, data);
  }

  // Get active users in a room
  getRoomUsers(roomId: string): any[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room.users.entries()).map(([socketId, user]) => ({
      socketId,
      ...user,
      cursor: room.cursors.get(socketId)
    }));
  }

  // Broadcast system notifications
  broadcastSystemNotification(notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    dataSourceId?: number;
  }) {
    this.io.emit('system-notification', notification);
  }

  // Handle real-time analytics updates
  broadcastAnalyticsUpdate(dataSourceId: number, update: any) {
    // Find all rooms for this data source
    this.rooms.forEach((room, roomId) => {
      if (room.dataSourceId === dataSourceId) {
        this.io.to(roomId).emit('analytics-update', update);
      }
    });
  }

  // Handle job status updates
  broadcastJobUpdate(jobId: string, status: any) {
    this.io.emit('job-update', { jobId, status });
  }
}