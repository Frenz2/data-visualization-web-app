import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule],
  templateUrl: './file-uploader.html',
  styleUrl: './file-uploader.scss'
})
export class FileUploader {
  @Output() fileUploaded = new EventEmitter<File>();
  isDragOver = false;
  fileSelected:File | null = null;

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      this.fileSelected = target.files[0];
      this.fileUploaded.emit(this.fileSelected);
    }
  }

  onDrop(event: DragEvent) {
  event.preventDefault();
  this.isDragOver = false;
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    this.fileSelected=file;
    this.fileUploaded.emit(file);
    event.dataTransfer.clearData();
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
}
