import { Directive, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { CcdModeChangeServiceService } from '../../ccd-services/ccd-mode-change-service/ccd-mode-change-service.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCcdModeDirective]',
  standalone: true,
})
export class CcdModeDirective implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private themeService: CcdModeChangeServiceService
  ) {}

  ngOnInit(): void {
    this.subscription = this.themeService.mode$.subscribe(mode => {
      this.applyModeClass(mode);
    });

    // Initial application
    this.applyModeClass(this.themeService.getCurrentMode());
  }

  private applyModeClass(mode: 'light' | 'dark') {
    const element = this.el.nativeElement;

    this.renderer.removeClass(element, 'dark-div');
    this.renderer.removeClass(element, 'light-div');

    if (mode === 'dark') {
      this.renderer.addClass(element, 'dark-div');
    } else {
      this.renderer.addClass(element, 'light-div');
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
