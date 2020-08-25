import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  templateUrl: 'app.component.html',
})
export class AppComponent {

  constructor(private http: HttpClient) { }

  checkconnection() {
    this.http.get("http://localhost:9200/").subscribe((data) => {
      console.log(data);
    }, (error) => {
      console.error(error);
    });

  }
}
