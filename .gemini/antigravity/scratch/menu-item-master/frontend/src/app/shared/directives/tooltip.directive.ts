import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[appTooltip]",
  standalone: true,
})
export class TooltipDirective {
  @Input() appTooltip: string = "";

  private tooltipElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener("mouseenter")
  onMouseEnter(): void {
    if (!this.appTooltip) {
      return;
    }

    const tooltip = this.renderer.createElement("div");

    tooltip.innerText = this.appTooltip;

    this.renderer.addClass(tooltip, "custom-tooltip");

    this.renderer.appendChild(document.body, tooltip);

    this.tooltipElement = tooltip;
    this.renderer.setStyle(tooltip, "max-width", "400px");
    this.renderer.setStyle(tooltip, 'width', 'fit-content');
    this.renderer.setStyle(tooltip, "white-space", "normal");
    this.renderer.setStyle(tooltip, "word-break", "break-word");
    this.renderer.setStyle(tooltip, "z-index", "9999");

    const rect = this.el.nativeElement.getBoundingClientRect();

    this.renderer.setStyle(tooltip, "top", `${rect.bottom + 10}px`);

    this.renderer.setStyle(tooltip, "left", `${rect.left}px`);
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  @HostListener("mouseleave")
  onMouseLeave(): void {
    this.removeTooltip();
  }

  @HostListener("click")
  onClick(): void {
    this.removeTooltip();
  }
}
