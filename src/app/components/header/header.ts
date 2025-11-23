import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FirestoreService } from '../../services/firestore';
import { SearchService } from '../../services/search';
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

  constructor(
    private firestoreService: FirestoreService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.userSub = this.firestoreService.user$.subscribe(user => {
      this.user = user;
      this.cdr.detectChanges();
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

  onSearch(event: any) {
    const query = event.target.value;
    this.searchService.search(query);
  }

  get userInitial(): string {
    return this.user?.displayName ? this.user.displayName.charAt(0).toUpperCase() : 'G';
  }
}
