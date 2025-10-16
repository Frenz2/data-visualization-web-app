
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';
  private base = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  testBackend() {
    return this.http.get(`${this.baseUrl}/`);
  }
  
  // WHISPER
  transcribe(file: File, opts?: { model_size?: string, language?: string }): Observable<any> {
    const fd = new FormData();
    fd.append('audio', file, file.name);
    if (opts?.model_size) fd.append('model_size', opts.model_size);
    if (opts?.language) fd.append('language', opts.language);

    return this.http.post(`${this.base}/transcribe`, fd, { observe: 'body' });
    // se vuoi progress: { reportProgress: true, observe: 'events' } e poi mappi gli eventi
  }

  // OCR
  ocrImage(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('image', file, file.name);
    return this.http.post(`${this.baseUrl}/api/ocr`, fd);
  }
}
