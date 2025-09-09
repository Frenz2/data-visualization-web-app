import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-start-button',
  imports: [CommonModule],
  templateUrl: './start-button.html',
  styleUrl: './start-button.scss'
})
export class StartButton {

  @Output() clickButton = new EventEmitter<void>();

  onClick() {
    this.clickButton.emit();
  }
}
