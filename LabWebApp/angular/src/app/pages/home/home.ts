import { Component } from '@angular/core';
import { AiSelector } from '../../components/ai-selector/ai-selector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule,AiSelector],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  selectedService = '';

  onServiceSelected(service: string) {
    this.selectedService = service;
  }
}
