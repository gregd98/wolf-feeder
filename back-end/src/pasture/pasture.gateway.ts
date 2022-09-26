import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PastureSimulation } from './pasture.simulation';
import { clearInterval } from 'timers';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/wolf-simulation',
})
export class PastureGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('start-simulation')
  startSimulation(): void {
    let ended = false;
    const simulation = PastureSimulation.getInstance();
    const interval = setInterval(() => {
      if (!ended) {
        const nextValue = simulation.getNextStep();
        if (nextValue) {
          this.server.emit('next-simulation-frame', nextValue);
          if (nextValue.isLastFrame) {
            ended = true;
            clearInterval(interval);
          }
        } else {
          ended = true;
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 16);
  }
}
