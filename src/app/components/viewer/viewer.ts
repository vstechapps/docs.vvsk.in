import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Item } from '../../models';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss'],
  standalone: false
})
export class Viewer {
  @Input() file: Item | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  get isPdf(): boolean {
    return this.file?.name.endsWith('.pdf') ?? false;
  }

  get isImage(): boolean {
    return !!this.file?.name.match(/\.(jpg|jpeg|png|gif)$/i);
  }

  get isVideo(): boolean {
    return !!this.file?.name.match(/\.(mp4|webm)$/i);
  }

  get downloadUrl(): string {
    return this.file?.download_url ?? '';
  }
}
