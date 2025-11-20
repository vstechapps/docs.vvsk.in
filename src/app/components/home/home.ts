import { Component, OnInit } from '@angular/core';
import { Github } from '../../services/github';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: false
})
export class Home implements OnInit {
  items: any[] = [];
  currentPath: string = '';
  loading: boolean = false;
  selectedFile: any = null;

  constructor(private githubService: Github) { }

  ngOnInit() {
    this.loadContents();
  }

  loadContents(path: string = '') {
    this.loading = true;
    this.currentPath = path;
    this.githubService.getContents(path).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching contents', err);
        this.loading = false;
      }
    });
  }

  openItem(item: any) {
    if (item.type === 'dir') {
      this.loadContents(item.path);
    } else {
      this.selectedFile = item;
    }
  }

  closeViewer() {
    this.selectedFile = null;
  }

  getIcon(item: any): string {
    if (item.type === 'dir') return '📁';
    if (item.name.endsWith('.pdf')) return '📄';
    if (item.name.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
    if (item.name.match(/\.(mp4|webm)$/i)) return '🎥';
    return '📄';
  }
}
