import { Component, OnInit } from '@angular/core';
import { AsideService } from '../_services/aside.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  isMobile = false;

  constructor(
    private asideService: AsideService,
  ) {
    console.log(777);
    this.isMobile = this.asideService.isMobile();
  }

  ngOnInit(): void {
  }

}
