import { ErrorDilogComponent } from './../components/dialog/dialog.component';
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { WorkSheet, WorkBook } from 'xlsx/types';
import { Client } from "elasticsearch";
import { MatDialog } from '@angular/material/dialog';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const CSV_EXTENSION = '.csv';
@Injectable({
  providedIn: 'root'
})
export class ESUtilService {
  constructor(private dialogue: MatDialog) { }

  public exportJsonAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }


  ConvertToCSV(objArray: object[], headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    headerList.forEach((element: any) => {
      row += element + ',';
    });
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      headerList.forEach((element: any) => {
        if (array[i][element] == undefined)
          line += ' ' + ',';
        else {
          let a = array[i][element];
          let val: any = null;
          if (Array.isArray(a)) {
            val = "\"" + JSON.stringify(a).replace(/\"/g, "") + "\"";
          }
          else {
            val = a.replace(/\n/g, " ").includes(",") ? "\"" + a + "\"" : a;
          }

          line += val + ',';
        }

      });
      str += line + '\r\n';
    }
    return str;
  }

  downloadFile(data: any, filename = 'data', format = 'csv') {
    let csvData = data;
    let blob: any;
    let extns: string;
    blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    extns = CSV_EXTENSION;


    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + extns);
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  searchData(querystring: string, pagedetails: any, searchafter: any, client: Client, index: string): Promise<any> {
    let pagesize = pagedetails.pageSize;
    let pageindex = pagedetails.pageIndex;
    let body: { [k: string]: any } = {
      "query": {
        "query_string": {
          "query": querystring
        }
      },
      "track_total_hits": true,
      "sort": [{ "itempguid": { "order": "desc" } }],
    };
    if (pageindex !== 0) {
      body['search_after'] = [];
      body['search_after'].push(searchafter);
    }
    return client.search({
      index: index,
      body: body,
      size: pagesize
    });
  }

  openDialogue(message: string) {
    return this.dialogue.open(ErrorDilogComponent, {
      width: '800px',
      height: 'auto',
      data: {
        error: message
      }
    });
  }

}