import { Component } from '@angular/core';
import { AiSelector } from '../../components/ai-selector/ai-selector';
import { CommonModule } from '@angular/common';
import { FileUploader } from '../../components/file-uploader/file-uploader';

@Component({
  selector: 'app-home',
  imports: [CommonModule,AiSelector,FileUploader],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  selectedService = '';
  fileUploaded: File | null = null;

  onServiceSelected(service: string) {
    this.selectedService = service;
  }
  onFileUploaded(file:File){
    this.fileUploaded=file;
  }
}
