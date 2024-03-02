import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './progress-circle.component.html',
  styleUrl: './progress-circle.component.scss'
})
export class ProgressCircleComponent {

  size = input.required<number>();
  size$ = toObservable(this.size);

  progress = input.required<number>();
  progress$ = toObservable(this.progress);

  viewBox: string = "0 0 100 100";

  constructor(){
    this.size$.subscribe((value) => {
      this.viewBox = `0 0 ${value} ${value}`
    })
  }
}
