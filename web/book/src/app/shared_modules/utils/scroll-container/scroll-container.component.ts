import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-scroll-container',
  template: '<div class="scroll-box"><ng-content></ng-content></div>',
  styleUrls: ['./scroll-container.component.scss']
})
export class ScrollContainerComponent {
  @HostBinding('class.app-scroll-container') cssClass = true;
}
