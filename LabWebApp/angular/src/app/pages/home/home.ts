import { Component } from '@angular/core';
import { AiSelector } from '../../components/ai-selector/ai-selector';
import { CommonModule } from '@angular/common';
import { FileUploader } from '../../components/file-uploader/file-uploader';
import { ProcessSelector } from '../../components/process-selector/process-selector';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FileUploader,ProcessSelector],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  fileUploaded: File | null = null;
  transcription: string = '';
  resultOCR:string='';
  selectedProcess:string = '';
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
  onProcessSelected(processName: string) {
  this.selectedProcess = processName;
  console.log('Process selected:', processName);
}

startProcess() {

  console.log('Avvio processo:', this.selectedProcess);

  // qui potrai chiamare il microservizio corrispondente
}


}
