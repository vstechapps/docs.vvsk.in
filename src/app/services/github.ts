import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Item } from '../models';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Github {
  public readonly GIT_USER = 'vstechapps';
  public readonly GIT_REPO = 'docs.vvsk.in';
  public readonly DEFAULT_PATH = 'drive';
  private readonly GIT_BASE_URL = `https://api.github.com/repos/${this.GIT_USER}/${this.GIT_REPO}/contents`;

  files: Item[] = [];
  private fetchedPaths = new Set<string>();

  constructor(private http: HttpClient) { }

  getContents(path: string = this.DEFAULT_PATH): Observable<Item[]> {
    const url = `${this.GIT_BASE_URL}/${path}`;
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (environment.githubToken) {
      headers['Authorization'] = `token ${environment.githubToken}`;
    }

    return this.http.get<Item[]>(url, { headers }).pipe(
      tap(items => {
        this.addFiles(items);
        if (!this.fetchedPaths.has(path)) {
          this.fetchedPaths.add(path);
          items.forEach(item => {
            if (item.type === 'dir') {
              this.getContents(item.path).subscribe();
            }
          });
        }
      })
    );
  }

  private addFiles(newItems: Item[]) {
    newItems.forEach(newItem => {
      if (!this.files.some(f => f.path === newItem.path)) {
        this.files.push(newItem);
      }
    });
  }

  search(query: string): Item[] {
    const lowerQuery = query.toLowerCase();
    return this.files.filter(file =>
      file.type === 'file' && file.name.toLowerCase().includes(lowerQuery)
    );
  }
}
