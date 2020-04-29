import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Faq } from '../../../../models/hospital/faq.model';
import { HospitalService } from '../../../../services/hospital.service';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError } from 'rxjs/operators';
import { Message } from '../../../../my-core/enum/message.enum';

@Component({
  selector: 'ngx-faq-edit',
  templateUrl: './faq-edit.component.html',
  styleUrls: ['./faq-edit.component.scss']
})
export class FaqEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<FaqEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Faq,
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private toastr: ToastrService,
  ) {

    this.form = this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
      order: [''],
      apply: false,
    });
    if (data) {
      this.form.patchValue(data);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  update() {
    const response = this.data?._id ?
      // update
      this.hospitalService.updateFaq({ ...this.data, ...this.form.value }) :
      // create
      this.hospitalService.createFaq({ ...this.form.value });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => {
        const message = (rsp.error?.return === 'existed') ?
          Message.nameExisted :
          rsp.headers?.message || Message.defaultError;
        this.toastr.error(message);
        return EMPTY;
      })
    ).subscribe();
  }

}
