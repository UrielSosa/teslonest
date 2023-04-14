import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}


  async handleConnection ( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload:JwtPayload;
    
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );      
    } catch (e) {
      client.disconnect();
      return ;
    }

    console.log(`Clientes conectados - ${this.messagesWsService.getConnectedClients().length}`);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())  
  }
  
  handleDisconnect ( client: Socket ) {
    // console.log('Cliente desconectado', client.id);
    this.messagesWsService.removeClient(client.id);
  }

  // message-from-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient (client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!!',
    //   message: payload.message || 'No message'
    // })
    
    //! Emite a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!!',
    //   message: payload.message || 'No message'
    // })
    
    //! Emite a todos
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No message'
    })



  }


}
