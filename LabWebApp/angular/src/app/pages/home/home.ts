import { Component } from '@angular/core';
import { AiSelector } from '../../components/ai-selector/ai-selector';
import { CommonModule } from '@angular/common';
import { FileUploader } from '../../components/file-uploader/file-uploader';
import { ProcessSelector } from '../../components/process-selector/process-selector';
import { StartButton } from '../../components/start-button/start-button';

@Component({
  selector: 'app-home',
  imports: [CommonModule,FileUploader,ProcessSelector,StartButton],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  fileUploaded: File | null = null;
  selectedProcess:string = '';

  onFileUploaded(file:File){
    this.fileUploaded=file;
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
