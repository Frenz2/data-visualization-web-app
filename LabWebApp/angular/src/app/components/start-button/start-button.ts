import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-start-button',
  imports: [CommonModule,RouterLink],
  templateUrl: './start-button.html',
  styleUrl: './start-button.scss'
})
export class StartButton {

  @Output() clickButton = new EventEmitter<void>();

  @Input() nomeServizio?:string;

  onClick() {
    this.clickButton.emit();
  }
}
