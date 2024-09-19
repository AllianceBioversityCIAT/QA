import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { TEXTS } from '../data/texts';

@Directive({
  selector: '[globalText]',
  standalone: true
})
export class GlobalTextDirective implements OnInit {
  @Input() globalText: any = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const config = TEXTS.find(item => item.id === Number(this.globalText));
    if (config) {
      // Assign the text
      this.renderer.setProperty(this.el.nativeElement, 'innerText', config.text);

      // Assign the classes
      config.classes.forEach(cls => this.renderer.addClass(this.el.nativeElement, cls));

      // Assign the attributes
      if (!config.attributes) return;
      config.attributes.forEach(attr => {
        this.renderer.setAttribute(this.el.nativeElement, attr.name, attr.value);
      });
    }
  }
}
