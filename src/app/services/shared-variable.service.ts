import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SharedVariableService {
  private indexchoosen = new Subject();
  shareindexchoosen = this.indexchoosen.asObservable();
  constructor() { }

  setChoosenIndex(value: string) {
    this.indexchoosen.next(value);
  }
}