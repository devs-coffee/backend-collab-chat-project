import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { ServerService } from '../servers/server.service';
import { UserDto } from '../dtos/users/user.dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  // root for chat
  namespace : '/chat'
})

export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @Inject(forwardRef(() => ServerService))
  private readonly serverService: ServerService;
  
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');
  
  afterInit(server: Server) {
    this.logger.log('Events gateway started');
  }
  
  //@SubscribeMessage('broadcastMessage')
  handleMessage(channelId: string, message: MessageDto, serverId: string | null, users: {from: string, to: string} | null): void {
    //! cibler l'envoi d'events
    if(serverId) {
      this.server.to(`server_${serverId}`).emit(`message_${channelId}`, message);
    }
    else {
      console.log("\u001b[1;33mPrivate Message :\n\u001b[1;0m", {...users, on_channel: channelId});
      this.server.to(`user_${users!.to}`).emit(`privateMessage`, {message, channelId});
    }
    //this.server.emit(`message_${channelId}`, message);
  }

  //@SubscribeMessage('broadcastUpdateMessage')
  handleUpdateMessage(messageId: string, message: MessageDto, serverId: string | null, users: {from: string, to: string} | null): void {
    //! cibler l'envoi d'events.
    this.server.emit(`message_${messageId}`, message);
  }

  // @SubscribeMessage('private_room')
  // handleRooms(client: Socket, payload: string): void {
  //   this.server.socketsJoin('private_room');
  //   this.server.emit("joined_private_room", {message : "joined provate room"})
  // }

  @SubscribeMessage('getServerConnectedUsers')
  async handleGetServerUsers(client: Socket, payload: any): Promise<void> {
    //this.logger.log('getUsers called');
    const connectedUsers = await this.server.in(`server_${payload.serverId}`).fetchSockets();
    let idList: any[] = [];
    if(connectedUsers) {
      for(let socket of connectedUsers) {
        idList.push(socket.data.userId);
      }
    }
    this.server.to(client.id).emit('serverUserList', {userList: idList});
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data.pseudo}`);
    if(client.data.serverRooms) {
      for(let server of client.data.serverRooms) {
        this.server.to(server).emit('userLeft', {pseudo: client.data.pseudo, id: client.data.userId});
      }
    }
  }
  
  async handleConnection(client: Socket, ...args: any[]) {
    //* retrieve client token, decode it
    const token = client.handshake.auth.token;
    const decodedToken = new JwtService().decode(token);
    this.logger.log(`Client connected: ${decodedToken?.["pseudo"]}`);
    //* store client pseudo in sockat data, then create a room for him
    client.data.pseudo = decodedToken?.["pseudo"];
    client.data.userId = decodedToken?.["userId"];
    client.join(`user_${decodedToken?.["userId"]}`);
    //console.log(client.nsp.adapter.rooms.get(`user_${decodedToken["userId"]}`));
    //* get all the servers the user is a member of
    //* then join the client to their room ( rooms will be created if not already existing )
    let serverRooms = await this.serverService.findAll(decodedToken?.["userId"]);
    if(serverRooms && Array.isArray(serverRooms) && serverRooms.length > 0){
      let rooms = serverRooms.map(server => `server_${server.id}`);
      client.join(rooms);
      client.data.serverRooms = rooms;
      for(let server of rooms) {
        this.server.to(server).emit('userJoined', {pseudo: client.data.pseudo, id: client.data.userId});
      }    
    }
    //! control what happens when another client connects
    console.log("\u001b[1;33m rooms : \u001b[1;0m\n", client.nsp.adapter.rooms); 
  }

  handleJoinServer(user: UserDto, serverId:string) {
    this.logger.log('new user on server');
    this.server.to(`server_${serverId}`).emit('newMember', {user});
  }

  handleLeaveServer(user: UserDto, serverId:string) {
    this.logger.log('user has left server');
    this.server.to(`server_${serverId}`).emit('goneMember', {user});
  }
}