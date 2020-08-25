import { SharedVariableService } from './../../services/shared-variable.service';
import { ESUtilService } from './../../services/es-util.service';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Client } from "elasticsearch";
import { ESConnectionService } from './../../services/es-connection.service';
import { range, async } from 'rxjs';

import DataFrame from 'dataframe-js';
import * as fs from 'file-system';

@Component({
  selector: 'search-info',
  templateUrl: './search-info.component.html',
  styleUrls: ['./search-info.component.scss']
})

export class SearchInfoComponent implements OnInit {
  options: FormGroup;
  host: string = 'http://localhost:9200';
  snackmessage: string;
  client: Client;
  @Input()
  page: string;
  @Input()
  searchtext: string;
  @Input()
  disabledownload: boolean;
  indexselected: string;
  @Input()
  indexcountsmap: Map<string, string>;
  selectedformat: string;
  isloading: boolean = false;
  showerror: boolean = true;
  formats: string[] = ['csv', 'excel'];
  placeholder: string = `Enter Host Name.
  Ex:http://localhost:9200`;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');

  constructor(fb: FormBuilder, private _snackbar: MatSnackBar, private http: HttpClient, private esconnectionservice: ESConnectionService, private esutilservice: ESUtilService,
    private sharedvarservice: SharedVariableService,) {
    this.options = fb.group({
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl,
    })
  }

  ngOnInit() {
    this.sharedvarservice.shareindexchoosen.subscribe((data: string) => {
      this.indexselected = data;
    });
  }

  connect() {
    this.http.get(this.host).subscribe(data => {
      this.snackmessage = 'Connected';
      this.openSnackbarOnCondition(this.snackmessage);
    }, error => {
      this.snackmessage = 'Connection Error';
      this.openSnackbarOnCondition(this.snackmessage);
    });

  }

  openSnackbarOnCondition(message: string) {
    this._snackbar.open(message, 'Close', {
      duration: 2000
    });
  }

  selectformatChanged() {
    if (this.selectedformat === 'excel') {
      this._snackbar.open("Nested Object columns will be blank.Use CSV format,If needed.", 'Close', {
        duration: 4000
      });
    }
  }

  downloadData() {
    this.isloading = true;
    if (this.page === 'fromindex') {
      if (!this.indexselected) {
        this.openSnackbarOnCondition("Select the index to download data from");
        this.isloading = false;
        return;
      }
    }
    else if (this.page === 'fromsearch') {
      if (!this.searchtext) {
        this.openSnackbarOnCondition("Search text cannot be blank");
        return;
      }
      else if (!this.indexselected) {
        this.openSnackbarOnCondition("Select the index to download data from");
        return;
      }
    }
    let c: any = this.indexcountsmap.get(this.indexselected);
    let countval: number = Math.ceil(c / 10000);
    let finaldata: any[] = []
    let iddata: any[] = []
    let z: Map<string, string> = new Map<string, string>();
    this.client = this.esconnectionservice.getConnection('http://localhost:9200');

    var testloop = async () => {
      for (let i = 0; i < countval; i++) {
        let pageinfo: { [k: string]: any } = {
          "pageSize": 10000,
          "pageIndex": i
        };

        await this.esutilservice.searchData(this.searchtext, pageinfo, iddata[iddata.length - 1], this.client, this.indexselected)
          .then((data: any) => {
            data["hits"]["hits"].forEach((data: any) => {
              finaldata.push(data["_source"]);
              iddata.push(data['_id']);
            });


            finaldata.forEach(function (data) {
              Object.keys(data).forEach((val) => {
                z.set(val, '');
              })
            });

          }, (error: any) => {
            this.isloading = false;
            this.esutilservice.openDialogue(error);
          });

      }

      if (this.selectedformat === 'csv') {
        let headerstocsv = [...z.keys()];
        const df = this.esutilservice.ConvertToCSV(finaldata, headerstocsv);
        this.esutilservice.downloadFile(df, 'result');
        this.isloading = false;
      }
      else if (this.selectedformat === 'excel') {
        this.esutilservice.exportJsonAsExcelFile(finaldata, 'result');
        this.isloading = false;
      }
      const df = finaldata;
    };

    testloop();
  }

}