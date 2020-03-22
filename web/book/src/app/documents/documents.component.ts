import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsideService } from '../_services/aside.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ReplaySubject, Observable, of } from 'rxjs';
import { startWith, switchMap, map, takeUntil } from 'rxjs/operators';
import { DocumentsService, Document } from './services/documents.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateDocumentComponent } from './dialogs/dialog-create-document/dialog-create-document.component';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnDestroy {
  isMobile = false;
  formFilter: FormGroup;
  filteredDocuments$: Observable<Document[]>;
  documents: Document[];
  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private asideService: AsideService,
    private fb: FormBuilder,
    private documentsService: DocumentsService,
    private dialog: MatDialog,
  ) {
    this.isMobile = this.asideService.isMobile();

    this.formFilter = this.fb.group({
      insurance: new FormControl(true),
      drivers_license: new FormControl(true),
    });
  }

  ngOnInit(): void {
    this.filteredDocuments$ = this.documentsService.getAll().pipe(
      switchMap((result: Document[]) => {
        this.documents = result || [];
        return this.formFilter.valueChanges.pipe(
          startWith({insurance: this.formFilter.value.insurance, drivers_license: this.formFilter.value.drivers_license}),
        );
      }),
      map((filter: {insurance: boolean, drivers_license: boolean}) => {
        return this.documents.filter(this.filterDocuments(filter));
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clickAddDocument(): void {
    this.dialog.open(DialogCreateDocumentComponent).afterClosed().subscribe((doc: Document) => {
      if (doc) {
        this.documents.unshift(doc);
        this.formFilter.updateValueAndValidity();
      }
    });
  }

  onDeleteDocument(doc: Document): void {
    const index = this.documents.findIndex((docItem: Document) => docItem === doc);
    if (index !== -1) {
      this.documents.splice(index, 1);
      this.formFilter.updateValueAndValidity();
    }
  }

  private filterDocuments(filter: {insurance: boolean, drivers_license: boolean}): (doc: Document) => boolean {
    return (doc: Document) => {
      switch (doc.doc_type_id) {
        case 1:
          return filter.drivers_license;
        case 2:
          return filter.insurance;
      }
      return false;
    };
  }
}
