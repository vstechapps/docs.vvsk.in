import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Github {
  private readonly baseUrl = 'https://api.github.com/repos/vstechapps/docs.vvsk.in/contents/public';

  constructor(private http: HttpClient) { }

  getContents(path: string = ''): Observable<any[]> {
    const url = path ? `${this.baseUrl}/${path}` : this.baseUrl;
    return this.http.get<any[]>(url);
  }
}
