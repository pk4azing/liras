import { ChangeDetectorRef, Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CdModeChangeServiceService } from '../../cd-services/cd-mode-change-service/cd-mode-change-service.service';

@Directive({
  selector: '[appCdModeDirective]'
})
export class CdModeDirectiveDirective implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private themeService: CdModeChangeServiceService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.subscription = this.themeService.mode$.subscribe(mode => {
      this.applyModeClass(mode);
    });

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
