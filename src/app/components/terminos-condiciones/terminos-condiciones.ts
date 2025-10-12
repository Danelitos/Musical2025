import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './terminos-condiciones.html',
  styleUrls: ['./terminos-condiciones.scss']
})
export class TerminosCondiciones {
  constructor() {}
}
