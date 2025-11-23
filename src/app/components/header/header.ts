import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from '../../services/firestore';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {
  isDropdownOpen = false;
  user: User | null = null;
  private userSub: Subscription | null = null;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.userSub = this.firestoreService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  isLoading = false;

  async onSignin() {
    this.isLoading = true;
    try {
      await this.firestoreService.login();
      this.closeDropdown();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSignout() {
    this.isLoading = true;
    try {
      await this.firestoreService.logout();
      this.closeDropdown();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      this.isLoading = false;
    }
  }

  get userInitial(): string {
    return this.user?.displayName ? this.user.displayName.charAt(0).toUpperCase() : 'G';
  }
}
