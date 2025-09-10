import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

interface Process {
  name: string;
  icon: string; // emoji o percorso immagine
  description: string;
}

@Component({
  selector: 'app-process-selector',
  imports: [CommonModule],
  templateUrl: './process-selector.html',
  styleUrl: './process-selector.scss'
})


export class ProcessSelector {

  @Output() processSelected = new EventEmitter<string>();

  selectedProcess?:string;

  processes: Process[] = [
    { name: 'Translate', icon: '🌐', description: 'Traduci testo in un’altra lingua' },
    { name: 'Summarize', icon: '📝', description: 'Crea un riassunto del testo' },
    { name: 'Text To Speech', icon: '🔊', description: 'Converti testo in voce' },
    { name: 'Speech To Text', icon: '🎤', description: 'Converti voce in testo' },
    { name: 'Image To Text', icon: '📷', description: 'Estrai testo da immagini' }
  ];

  selectProcess(processName: string) {
    this.selectedProcess = processName;
    this.processSelected.emit(processName);
  }
}
