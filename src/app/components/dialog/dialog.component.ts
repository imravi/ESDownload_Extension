import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface DialogData {
  error: string;
}
@Component({
  selector: 'common-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class ErrorDilogComponent {
  constructor(public dialogRef: MatDialogRef<ErrorDilogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

  }

}