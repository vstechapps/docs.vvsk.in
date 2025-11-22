import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Github } from '../../services/github';
import { Item } from '../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: false
})
export class Home implements OnInit {
  items: Item[] = [];
  currentPath: string = '';
  loading: boolean = true;
  selectedFile: Item | null = null;

  constructor(private githubService: Github, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadContents(this.githubService.DEFAULT_PATH);
  }

  loadContents(path?: string) {
    const targetPath = path || this.githubService.DEFAULT_PATH;
    this.loading = true;
    this.currentPath = targetPath;
    this.githubService.getContents(targetPath).subscribe({
      next: (data) => {
        this.items = data.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'dir' ? -1 : 1;
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching contents', err);
        alert("Error fetching contents");
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openItem(item: Item) {
    if (item.type === 'dir') {
      this.loadContents(item.path);
    } else {
      this.selectedFile = item;
    }
  }

  closeViewer() {
    this.selectedFile = null;
  }

  get breadcrumbSegments(): { name: string, path: string }[] {
    const segments: { name: string, path: string }[] = [];
    const defaultPath = this.githubService.DEFAULT_PATH;
    segments.push({ name: 'Home', path: defaultPath });

    if (this.currentPath && this.currentPath !== defaultPath) {
      const parts = this.currentPath.replace(defaultPath + '/', '').split('/');
      let currentPathBuild = defaultPath;
      parts.forEach(part => {
        currentPathBuild += '/' + part;
        segments.push({ name: part, path: currentPathBuild });
      });
    }
    return segments;
  }

  getIcon(item: Item): string {
    if (item.type === 'dir') return '📁';
    if (item.name.endsWith('.pdf')) return '📄';
    if (item.name.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (item.name.match(/\.(mp4|webm)$/i)) return '🎥';
    return '📄';
  }
}
