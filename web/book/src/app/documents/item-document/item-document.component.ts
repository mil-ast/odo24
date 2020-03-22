import { Component, OnInit, Input } from '@angular/core';
import { DocumentsService, Document } from '../services/documents.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogUpdateDocumentComponent } from '../dialogs/dialog-update-document/dialog-update-document.component';

@Component({
  selector: 'app-item-document',
  templateUrl: './item-document.component.html',
  styleUrls: ['./item-document.component.scss']
})
export class ItemDocumentComponent implements OnInit {
  @Input() doc: Document;
  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  clickEdit(): void {
    this.dialog.open(DialogUpdateDocumentComponent, {
      data: this.doc,
    });
  }

  clickDelete() {
    
  }
}
