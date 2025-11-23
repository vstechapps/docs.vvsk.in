import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Github } from './github';
import { Item } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private resultsSubject = new BehaviorSubject<Item[] | null>(null);
    results$ = this.resultsSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    constructor(private githubService: Github) { }

    get resultsValue(): Item[] | null {
        return this.resultsSubject.value;
    }

    search(query: string) {
        if (!query) {
            this.resultsSubject.next(null); // Clear results to indicate no active search
            return;
        }

        this.loadingSubject.next(true);

        // Simulate async delay for better UX (optional, but good since we are filtering a potentially large array)
        setTimeout(() => {
            const results = this.githubService.search(query);
            this.resultsSubject.next(results);
            this.loadingSubject.next(false);
        }, 300);
    }

    clearSearch() {
        this.resultsSubject.next(null);
    }
}
