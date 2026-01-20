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
    //{ name: 'Summarize', icon: '📝', description: 'Crea un riassunto del testo' },
    //{ name: 'Text To Speech', icon: '🔊', description: 'Converti testo in voce' },
    { name: 'Whisper', icon: '🎤', description: 'Converti voce in testo' },
    { name: 'Image-To-Text', icon: '📷', description: 'Descrizione immagini' },
    { name: 'OCR', icon: '📷', description: 'Estrai testo da immagini con testo' },
    { name: 'Chart-To-Text', icon: '📊', description: 'Descrizione grafici' },
    { name: 'Text-To-Chart', icon: '📊', description: 'Traduci testo in grafici' }
  ];

  selectProcess(processName: string) {
    this.selectedProcess = processName;
    this.processSelected.emit(processName);
  }
}
