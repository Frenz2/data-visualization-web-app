import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-ai-selector',
  imports: [CommonModule],
  templateUrl: './ai-selector.html',
  styleUrl: './ai-selector.scss'
})
export class AiSelector {

  services = ['Whisper (STT)', 'Granite (OCR)', 'Altro servizio...'];

  @Output() serviceSelected = new EventEmitter<string>();

  onSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.serviceSelected.emit(target.value);
    console.log(target.value)

  }
}
