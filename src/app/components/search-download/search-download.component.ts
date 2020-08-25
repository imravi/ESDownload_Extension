import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ESConnectionService } from './../../services/es-connection.service';
import { ESUtilService } from './../../services/es-util.service';
import { HttpClient } from '@angular/common/http';
import { Client } from "elasticsearch";
import { SharedVariableService } from './../../services/shared-variable.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'search-download',
  templateUrl: './search-download.component.html',
  styleUrls: ['./search-download.component.scss']
})

export class SearchDownloadComponent implements OnInit, AfterViewInit {
  page: string = 'fromsearch';
  searchtext: string;
  client: Client;
  displayedColumns: string[] = [];
  setcols = new Set<string>();
  selectedindex: string;
  resultsLength: any;
  ELEMENT_DATA: any[] = [];
  indexcountsmap: Map<string, string> = new Map<string, string>();
  iddata: any[] = []
  hidetable: boolean = false;
  slideisChecked: boolean = false;
  disabledownload: boolean = false;
  isloading: boolean = false;
  indices: string[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;
  constructor(private http: HttpClient, private esconnectionservice: ESConnectionService, private esutilservice: ESUtilService, private sharedvarservice: SharedVariableService, private _snackbar: MatSnackBar) {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  ngOnInit() {

    this.client = this.esconnectionservice.getConnection('http://localhost:9200');

    this.client.cat.indices({ h: ["index"], format: "json" }).then((data) => {
      data.forEach((element: any) => {
        this.indices.push(element.index);
      });
    }, (error) => {
      this.esutilservice.openDialogue(error);
    });
  }

  private openSnackbar(message: string) {
    this._snackbar.open(message, 'Close', {
      duration: 3000
    });
  }

  getsearchdata() {
    let custompagination: { [k: string]: any } = {
      "pageSize": 10,
      "pageIndex": 0
    }
    this.isloading = true;
    this.esutilservice.searchData(this.searchtext, custompagination, null, this.client, this.selectedindex).then((data: any) => {
      this.disabledownload = true;

      this.constructResponse(data);
      if (this.paginator !== undefined) { this.paginator.pageIndex = 0; this.paginator.pageSize = 0; }
    }, (error: any) => {
      this.isloading = false;
      this.esutilservice.openDialogue(error);
    });
  }

  sliderchange() {
    if (this.slideisChecked)
      this.openSnackbar("Search will be slow!");
  }

  inputchanged() {
    this.disabledownload = false;
    if (this.hidetable) {
      this._snackbar.open("Make the search to enable Download", 'Close', {
        duration: 3000
      });
    }
  }

  onChangedPaginationdetails(event: any) {
    let searchafter = this.iddata[this.iddata.length - 1];
    this.isloading = true;
    this.esutilservice.searchData(this.searchtext, event, searchafter, this.client, this.selectedindex).then((data) => {
      this.constructResponse(data);
    }, (error) => {
      this.isloading = false;
      this.esutilservice.openDialogue(error);
    });
  }

  shareselectedindex() {
    this.sharedvarservice.setChoosenIndex(this.selectedindex);
    this.hidetable = false;
    this.disabledownload = false;
  }

  constructResponse(data: any) {
    this.resultsLength = data['hits']['total']['value'];
    this.sharedvarservice.setChoosenIndex(this.selectedindex);
    this.indexcountsmap.set(this.selectedindex, this.resultsLength);
    this.hidetable = true;
    this.ELEMENT_DATA = [];
    this.iddata = [];
    this.setcols.clear();
    data["hits"]["hits"].forEach((data: any) => {
      if (this.slideisChecked) {
        let arr: any = {};
        Object.keys(data['_source']).forEach((key: any) => {
          arr[key] = typeof data['_source'][key] === "object" ? JSON.stringify(data['_source'][key]) : data['_source'][key];
        });
        this.ELEMENT_DATA.push(arr);
      }
      else {
        this.ELEMENT_DATA.push(data["_source"]);
      }
      this.iddata.push(data['_id']);
    });
    this.ELEMENT_DATA.forEach((val) => {
      Object.keys(val).forEach((ele) => {
        this.setcols.add(ele);
      })
    });
    this.isloading = false;
    this.displayedColumns = [...this.setcols];
    this.dataSource.data = this.ELEMENT_DATA;
  }




}