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
import { JwtService } from '@nestjs/jwt';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { ServerService } from '../servers/server.service';

  @WebSocketGateway({
  cors: {
    origin: '*',
  },
  // root for chat
  namespace : '/chat'
})

export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private serverService: ServerService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');
  
  @SubscribeMessage('broadcastMessage')
  handleMessage(channelId: string, message: MessageDto): void {
    this.server.emit(`message_${channelId}`, message);
  }

  @SubscribeMessage('broadcastMessage')
  handleUpdateMessage(messageId: string, message: MessageDto): void {
    this.server.emit(`message_${messageId}`, message);
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
    this.logger.log(`Client disconnected: ${client.data.pseudo}`);
    for(let server of client.data.serverRooms) {
      this.server.to(server).emit('userLeft', client.data.pseudo);
    }
  }
  
  async handleConnection(client: Socket) {
    //* retrieve client token, decode it
    const token = client.handshake.auth.token;
    const decodedToken = new JwtService().decode(token);
    this.logger.log(`Client connected: ${decodedToken["pseudo"]}`);
    //* store client pseudo in sockat data, then create a room for him
    client.data.pseudo = decodedToken["pseudo"];
    client.join(`user_${decodedToken["userId"]}`);
    ////console.log(client.nsp.adapter.rooms.get(`user_${decodedToken["userId"]}`));
    //* get all the servers the user is a member of
    //* then join the client to their room ( rooms will be created if not already existing )
    const serverRooms = (await this.serverService.findAll(decodedToken["userId"])).map(server => `server_${server.id}`);
    client.join(serverRooms);
    client.data.serverRooms = serverRooms;
    for(let server of serverRooms) {
      this.server.to(server).emit('userJoined', {pseudo: client.data.pseudo});
    }
    //! control what happens when another client connects
    console.log("\u001b[1;33m rooms : \u001b[1;0m\n", client.nsp.adapter.rooms); 
    
  }
}