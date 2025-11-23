import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private githubService: Github,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const path = params['path'];
      if (path) {
        this.handleDeepLink(decodeURIComponent(path));
      } else {
        this.loadContents(this.githubService.DEFAULT_PATH);
      }
    });
  }

  handleDeepLink(fullPath: string) {
    // Determine parent directory to load
    const lastSlashIndex = fullPath.lastIndexOf('/');
    const parentPath = lastSlashIndex > 0 ? fullPath.substring(0, lastSlashIndex) : this.githubService.DEFAULT_PATH;

    this.loading = true;
    this.currentPath = parentPath;

    this.githubService.getContents(parentPath).subscribe({
      next: (data) => {
        this.items = data.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'dir' ? -1 : 1;
        });

        // Find and open the specific file
        const fileToOpen = this.items.find(item => item.path === fullPath);
        if (fileToOpen) {
          this.selectedFile = fileToOpen;
        }

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

  onSearch(event: any) {
    const query = event.target.value;
    if (!query) {
      this.loadContents(this.currentPath);
      return;
    }

    this.loading = true;
    this.githubService.searchFiles(query).subscribe({
      next: (response: any) => {
        // Map search results to Item format
        this.items = response.items.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: 'file', // Search API mostly returns files
          download_url: item.html_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error searching files', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getIcon(item: Item): string {
    if (item.type === 'dir') return '📁';
    if (item.name.endsWith('.pdf')) return '📄';
    if (item.name.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (item.name.match(/\.(mp4|webm)$/i)) return '🎥';
    return '📄';
  }
}
