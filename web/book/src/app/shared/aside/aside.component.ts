import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AsideService } from 'src/app/_services/aside.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit {
  private destroy: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private asideService: AsideService,
    private view: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.asideService.asideVisible.pipe(
      takeUntil(this.destroy)
    ).subscribe((isVisible: boolean) => {
      this.view.element.nativeElement.className = isVisible ? 'visible' : '';
    });
  }

  clickClose() {
    this.asideService.setAsideVisible(false);
  }
}
