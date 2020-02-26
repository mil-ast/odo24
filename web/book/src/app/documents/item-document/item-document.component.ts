import { Component, OnInit, Input } from '@angular/core';
import { DocumentsService, Document } from '../services/documents.service';

@Component({
  selector: 'app-item-document',
  templateUrl: './item-document.component.html',
  styleUrls: ['./item-document.component.scss']
})
export class ItemDocumentComponent implements OnInit {
  @Input() doc: Document;
  constructor() { }

  ngOnInit(): void {
  }

  clickEdit() {

  }

  clickDelete() {
    
  }
}
