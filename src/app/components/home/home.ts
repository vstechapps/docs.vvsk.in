import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Github } from '../../services/github';
import { SearchService } from '../../services/search';
import { Item } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: false
})
export class Home implements OnInit, OnDestroy {
  items: Item[] = [];
  currentPath: string = '';
  loading: boolean = true;
  selectedFile: Item | null = null;
  private searchSub: Subscription | null = null;
  private loadingSub: Subscription | null = null;

  constructor(
    private githubService: Github,
    private searchService: SearchService,
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

    this.searchSub = this.searchService.results$.subscribe(results => {
      if (results) {
        this.items = results;
        this.cdr.detectChanges();
      } else if (!this.loading) {
        // If search is cleared (results is null) and we are not initially loading, reload current path
        // Check if we are not already loading to avoid double fetch on init
        if (this.currentPath) {
          this.loadContents(this.currentPath);
        }
      }
    });

    this.loadingSub = this.searchService.loading$.subscribe(isLoading => {
      // Only update loading from search service if a search is active or happening
      // We don't want to overwrite local loading state if we are navigating folders
      if (isLoading) {
        this.loading = true;
        this.cdr.detectChanges();
      } else if (this.searchService.resultsValue) {
        // If search finished and we have results
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
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

    // Clear search when navigating
    // We only want to clear the search state in the service if we are manually navigating
    // But here we might be called by the search clearing itself.
    // Let's just load contents.

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
      this.searchService.clearSearch(); // Clear search when navigating into a folder
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
