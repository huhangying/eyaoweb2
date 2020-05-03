import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MedicineNotice } from '../../../../models/hospital/medicine-notice.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ngx-medicine-notices-edit',
  templateUrl: './medicine-notices-edit.component.html',
  styleUrls: ['./medicine-notices-edit.component.scss']
})
export class MedicineNoticesEditComponent implements OnInit {
  myNotices: MedicineNotice[];
  @Input() set notices(values:  MedicineNotice[]) {
    this.myNotices = values;
    this.loadData(this.myNotices);
  }
  @Output() valueChange = new EventEmitter<MedicineNotice[]>();
  form: FormGroup;
  displayedColumns: string[] = ['notice', 'days_to_start', 'during', 'require_confirm', 'apply', 'actions'];
  dataSource: MatTableDataSource<MedicineNotice>;
  isEdit = false;
  expanded = false;
  index: number;

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      notice: ['', Validators.required],
      days_to_start: ['', Validators.required],
      during: ['', Validators.required],
      require_confirm: [true],
      apply: [true]
    });
  }

  ngOnInit(): void {
  }

  loadData(data: MedicineNotice[]) {
    this.dataSource = new MatTableDataSource<MedicineNotice>(data);
    // this.cd.markForCheck();
    this.setExpanded(false);
    this.isEdit = false;
    this.index = undefined;

    this.valueChange.emit(data);
  }

  update() {
    const newNotice =  {...this.form.value};
    if (this.isEdit) {
      this.myNotices[this.index] = newNotice;
    } else {
      this.myNotices.unshift(newNotice);
    }
    this.loadData(this.myNotices);

  }

  edit(data: MedicineNotice, index) {
    this.form.patchValue(data);
    this.isEdit = true;
    this.index = index;
    this.setExpanded(true);
  }

  delete(index) {
    this.myNotices.splice(index, 1);
    this.loadData(this.myNotices);
  }

  cancel() {
    this.setExpanded(false);
    this.isEdit = false;
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

}
