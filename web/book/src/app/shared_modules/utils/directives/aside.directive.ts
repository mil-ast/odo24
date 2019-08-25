import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAside]',
})
export class AsideDirective {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    const el = this.elementRef.nativeElement;
    this.renderer.setStyle(el, 'font-weight', 'bold');
  }
}
