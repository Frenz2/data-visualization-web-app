import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-uploader.html',
  styleUrls: ['./file-uploader.scss']
})
export class FileUploader {
  @Output() fileUploaded = new EventEmitter<File>();
  @Output() transcriptionReceived = new EventEmitter<string>(); // trascrizione in output
  @Output() ocrResultReceived = new EventEmitter<string>();
  @Input() selectedProcess!: string;
  
  isDragOver = false;
  fileSelected: File | null = null;
  isLoading = false;      // per gestire loading
  transcription: string = ''; 
  fileAudioDuration: number | null = null;

  constructor(private http: HttpClient, private api: ApiService) {}

  ngOnInit(): void {
    console.log('Servizio: ',this.selectedProcess);
  }
  async onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      this.fileSelected = target.files[0];
      this.fileUploaded.emit(this.fileSelected);
      this.fileAudioDuration = await this.getAudioDuration(this.fileSelected);
    }
    
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.fileSelected = event.dataTransfer.files[0];
      this.fileUploaded.emit(this.fileSelected);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  // Chiamata al microservizio Whisper
  uploadToWhisper() {
    if (!this.fileSelected) return;

    this.isLoading = true;
    this.api.transcribe(this.fileSelected, { model_size: 'small' })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.transcription = res.text;
          this.transcriptionReceived.emit(this.transcription); 
        },
        error: (err) => {
          console.error('Errore durante la trascrizione:', err);
        }
      });
  }
  
  // Chiamata al microservizio OCR
  uploadToOCR() {
    if (!this.fileSelected) return;

    this.isLoading = true;
    this.transcription = '';

    this.api.ocrImage(this.fileSelected)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res: any) => {
          this.transcription = res.text;
          this.ocrResultReceived.emit(this.transcription); 
        },
        error: (err) => {
          console.error('Errore durante OCR:', err);
        }
      });
  }

  getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.preload = 'metadata';
      audio.src = url;

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url); // libera la memoria
        resolve(audio.duration);  // durata in secondi
      };

      audio.onerror = (error) => {
        reject(`Errore nel caricamento del file audio: ${error}`);
      };
    });
  }

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  }


}
