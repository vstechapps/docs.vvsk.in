import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-signin-popup',
    templateUrl: './signin-popup.html',
    styleUrls: ['./signin-popup.scss'],
    standalone: false
})
export class SigninPopup {
    @Output() close = new EventEmitter<void>();
    @Output() signin = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }

    onSignin() {
        this.signin.emit();
    }
}
