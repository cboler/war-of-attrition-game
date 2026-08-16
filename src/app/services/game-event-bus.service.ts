import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GameEvent } from '../core/models/game-events.model';

export type { GameEvent } from '../core/models/game-events.model';

@Injectable({ providedIn: 'root' })
export class GameEventBusService {
  private readonly eventSubject = new Subject<GameEvent>();

  readonly events$: Observable<GameEvent> = this.eventSubject.asObservable();

  emit(event: GameEvent): void {
    this.eventSubject.next(event);
  }
}
