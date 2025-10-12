import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './politica-privacidad.html',
  styleUrls: ['./politica-privacidad.scss']
})
export class PoliticaPrivacidad {
  constructor() {}
}
