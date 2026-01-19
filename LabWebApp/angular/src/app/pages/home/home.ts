import { Component } from '@angular/core';
import { AiSelector } from '../../components/ai-selector/ai-selector';
import { CommonModule } from '@angular/common';
import { FileUploader } from '../../components/file-uploader/file-uploader';
import { ProcessSelector } from '../../components/process-selector/process-selector';
import { DashboardComponent } from '../../components/dashboard/dashboard/dashboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FileUploader,ProcessSelector,DashboardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  fileUploaded: File | null = null;
  transcription: string = '';
  resultOCR:string='';
  selectedProcess:string = '';
  resultChart2Text: any=null;
  isResultReady:boolean = false;

  onFileUploaded(file:File){
    this.fileUploaded=file;
  }
  onTranscriptionReceived(result:string){
    this.transcription=result;
    this.isResultReady=true;
  }
  onOcrResultReceived(result:string){
    this.resultOCR=result;
    this.isResultReady=true;
  }
  onChart2TextReceived(result: any) {
    this.resultChart2Text = result;
    this.isResultReady = true;
  }
  onProcessSelected(processName: string) {
  this.selectedProcess = processName;
  console.log('Process selected:', processName);
  }

  get uploadedImageUrl(): string | null {
    if (!this.fileUploaded) return null;
    return URL.createObjectURL(this.fileUploaded);
  }


startProcess() {

  console.log('Avvio processo:', this.selectedProcess);

  // qui potrai chiamare il microservizio corrispondente
}


}
