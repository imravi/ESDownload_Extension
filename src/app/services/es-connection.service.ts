import { Injectable } from '@angular/core';
import { Client } from "elasticsearch";
@Injectable({
  providedIn: 'root'
})

export class ESConnectionService {
  client: Client;
  constructor() { }

  getConnection(host: string) {
    this.client = new Client({ host: host });
    return this.client;
  }
}