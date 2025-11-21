import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models';

@Injectable({
  providedIn: 'root',
})
export class Github {
  public readonly GIT_USER = 'vstechapps';
  public readonly GIT_REPO = 'docs.vvsk.in';
  public readonly DEFAULT_PATH = 'drive';
  private readonly baseUrl = `https://api.github.com/repos/${this.GIT_USER}/${this.GIT_REPO}/contents`;


  constructor(private http: HttpClient) { }

  getContents(path: string = this.DEFAULT_PATH): Observable<Item[]> {
    const url = `${this.baseUrl}/${path}`;
    return this.http.get<Item[]>(url);
  }
}
