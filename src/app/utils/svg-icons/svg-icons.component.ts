import { CommonModule } from '@angular/common';
import { Component, Input, input } from '@angular/core';

export enum SvgIcon {
  NOTIFICATIONS_ADD,
  NOTIFICATIONS_ON
}

@Component({
  selector: 'app-svg-icons',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './svg-icons.component.html',
  styleUrl: './svg-icons.component.scss',
  styles: ['svg { width: 100%; height: 100% }']
})
export class SvgIconsComponent {
  SvgIcon = SvgIcon;

  @Input()
  name: SvgIcon|undefined;

  @Input()
  width: number|undefined;

  @Input()
  height: number|undefined;

}
