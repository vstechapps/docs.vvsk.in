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

  showSigninPopup = false;
  isMenuOpen = false;
  showToast = false;
  loading = true;

  onPdfLoadComplete() {
    this.loading = false;
  }

  showToastNotification() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onDownloadClick() {
    this.closeMenu();
    this.showSigninPopup = true;
  }

  onShareClick() {
    this.closeMenu();
    if (this.file) {
      const shareUrl = `${window.location.origin}/open?path=${encodeURIComponent(this.file.path)}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToastNotification();
      });
    }
  }

  closeSigninPopup() {
    this.showSigninPopup = false;
  }

  onSignin() {
    // TODO: Implement actual Google Sign-In
    console.log('Sign in with Google clicked');
    this.closeSigninPopup();
  }
}
