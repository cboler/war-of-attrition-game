import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { TableFxService } from './table-fx.service';

/** Shader-lit baize under the cards; the CSS felt beneath remains the fallback. */
@Component({
  selector: 'app-table-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.live]': 'fx.backdropLive()' },
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      transition: opacity 900ms ease;
    }
    :host(.live) {
      opacity: 1;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class TableBackdropComponent {
  protected readonly fx = inject(TableFxService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private resizeObserver: ResizeObserver | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(() => void this.boot());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.resizeObserver?.disconnect();
      this.fx.detachBackdrop();
    });
  }

  private async boot(): Promise<void> {
    const engine = await this.fx.attachBackdrop(this.canvas().nativeElement);
    if (!engine) return;
    if (this.destroyed) {
      this.fx.detachBackdrop();
      return;
    }
    this.zone.runOutsideAngular(() => {
      const resize = () => {
        const rect = this.host.nativeElement.getBoundingClientRect();
        engine.resizeBackdrop(rect.width, rect.height, window.devicePixelRatio || 1);
      };
      resize();
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.host.nativeElement);
    });
  }
}
