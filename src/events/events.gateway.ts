import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
   } from '@nestjs/websockets';
   import { Logger } from '@nestjs/common';
   import { Socket, Server } from 'socket.io';
   
   @WebSocketGateway({
     cors: {
       origin: '*',
     },
     // root for chat
     namespace : '/chat'
   })

   export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
   
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('EventsGateway');
   
    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): void {
     this.server.emit('msgToClient', payload);
    }

    @SubscribeMessage('private_room')
    handleRooms(client: Socket, payload: string): void {
     this.server.socketsJoin('private_room');
     this.server.emit("joined_private_room", {message : "joined provate room"})
    }
   
    afterInit(server: Server) {
     this.logger.log('Init');
    }
   
    handleDisconnect(client: Socket) {
     this.logger.log(`Client disconnected: ${client.id}`);
    }
   
    handleConnection(client: Socket, ...args: any[]) {
      // client.handshake.auth.token to manage token
      this.logger.log(`Client connected: ${client.id}`);
    }
  }