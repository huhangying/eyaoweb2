import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Question, QuestionOption } from '../../../../../models/survey/survey-template.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { distinctUntilChanged, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-survey-question-edit',
  templateUrl: './survey-question-edit.component.html',
  styleUrls: ['./survey-question-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyQuestionEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  isEdit: boolean;
  options: QuestionOption[];

  constructor(
    public dialogRef: MatDialogRef<SurveyQuestionEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: Question,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
  ) {
    this.isEdit = !!data;
    this.options = this.data ? [...this.data.options] : [];

    this.form = this.fb.group({
      question: ['', Validators.required],
      answer_type: ['', Validators.required],
      answer_number: 1,
      weight: 0,
      order: 0,
      required: false,
      apply: true,
    });
  }

  get answerTypeCtrl() { return this.form.get('answer_type'); }
  get answerNumberCtrl() { return this.form.get('answer_number'); }

  ngOnInit(): void {

    if (this.data) {
      this.form.patchValue({ ...this.data });
      this.cd.markForCheck();
    }

    this.answerTypeCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(type => {
        this.setOptionsByType(type);
      })
    ).subscribe();

    this.answerNumberCtrl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(numb => {
        this.setOptionsByNumber(numb);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  setOptionsByType(type: number) {
    switch (type) {
      case 0: // 是非题
        this.answerNumberCtrl.patchValue(2);
        this.options = [
          { answer: '是' },
          { answer: '否' }
        ];
        this.answerNumberCtrl.disable();
        break;

      case 1: // 单选题
      case 2: // 多选题
        if (+this.answerNumberCtrl.value < 2) { // at least 2 options
          this.answerNumberCtrl.patchValue(4); // default is 4
          this.setOptionsByNumber(4);
        } else {
          this.setOptionsByNumber(+this.answerNumberCtrl.value);
        }
        this.answerNumberCtrl.enable();
        break;

      case 3: // 填空
        this.answerNumberCtrl.patchValue(1);
        this.options = [
          { answer: '' }
        ];
        this.answerNumberCtrl.disable();
        break;
    }

  }

  setOptionsByNumber(numb: number) {
    const diff = this.options.length - numb;
    if (diff > 0) {
      // cut off
      for (let i = 0; i < diff; i++) {
        this.options.pop();
      }
    } else if (diff < 0) {
      // add temp
      for (let i = 0; i < -diff; i++) {
        this.options.push({ answer: '' });
      }
    }
    this.cd.markForCheck();
  }

  isFormInvalid() {
    return this.form.invalid || !this.options || this.options.length < 1;
  }

  update() {
    this.dialogRef.close({ ...this.form.value, options: this.options });
  }

}
