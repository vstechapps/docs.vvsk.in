import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { Item } from '../../models';
import { FirestoreService } from '../../services/firestore';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss'],
  standalone: false
})
export class Viewer implements OnInit {
  @Input() file: Item | null = null;
  @Output() close = new EventEmitter<void>();

  user: User | null = null;

  constructor(private firestoreService: FirestoreService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.firestoreService.user$.subscribe(user => {
      this.user = user;
    });
  }

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
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
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
    if (this.user) {
      // User is logged in, proceed with download
      this.firestoreService.log('download', {
        fileName: this.file?.name,
        filePath: this.file?.path
      });

      // Trigger download
      const link = document.createElement('a');
      link.href = this.downloadUrl;
      link.target = '_blank';
      link.download = this.file?.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // User is not logged in, show signin popup
      this.showSigninPopup = true;
    }
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

  isSigningIn = false;

  async onSignin() {
    this.isSigningIn = true;
    try {
      await this.firestoreService.login();
      this.closeSigninPopup();
      // Optionally trigger download immediately after login
      this.onDownloadClick();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      this.isSigningIn = false;
    }
  }
}
