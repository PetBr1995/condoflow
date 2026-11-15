import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() recolhida: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  constructor(private router: Router, public authService: AuthService) {}

  toggleSidebar(): void {
    this.toggle.emit();
  }

  fazerLogout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
