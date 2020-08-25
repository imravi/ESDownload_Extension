import { ESUtilService } from './../../services/es-util.service';
import { SharedVariableService } from './../../services/shared-variable.service';
import { ESConnectionService } from './../../services/es-connection.service';
import { Indices } from './indices';
import { Component, OnInit, EventEmitter, } from '@angular/core';
import { Client } from "elasticsearch";
@Component({
  selector: 'index-download',
  templateUrl: './index-download.component.html',
  styleUrls: ['./index-download.component.scss']
})

export class IndexDownloadComponent implements OnInit {
  indexselected: string;
  client: Client;
  disabledownload: boolean = true;
  page: string = 'fromindex';
  indices: string[] = [];
  indexcountsmap = new Map();
  constructor(private esconnectionservice: ESConnectionService, private sharedvarservice: SharedVariableService, private esutilservice: ESUtilService) {
  }

  ngOnInit() {

    this.client = this.esconnectionservice.getConnection('http://localhost:9200');

    this.client.cat.indices({ h: ["index", "docs.count"], format: "json" }).then((data) => {
      data.forEach((element: any) => {
        this.indices.push(element.index);
        this.indexcountsmap.set(element.index, element['docs.count']);
      });
    }, (error) => {
      this.esutilservice.openDialogue(error);
    });


  }

  sendindex(val: string) {
    this.sharedvarservice.setChoosenIndex(val);
  }

}