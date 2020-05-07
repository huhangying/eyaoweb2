import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf } from '@angular/core';
import { SurveyService } from '../../../../services/survey.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SurveyTemplate, Question } from '../../../../models/survey/survey-template.model';
import { MessageService } from '../../../../my-core/service/message.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '../../../../my-core/service/dialog.service';

@Component({
  selector: 'ngx-survey-template-edit',
  templateUrl: './survey-template-edit.component.html',
  styleUrls: ['./survey-template-edit.component.scss']
})
export class SurveyTemplateEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  questions: Question[];
  displayedColumns: string[] = ['order', 'question', 'answer_type', 'weight', 'apply', 'required'];
  dataSource: MatTableDataSource<Question>;

  constructor(
    public dialogRef: MatDialogRef<SurveyTemplateEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { surveyTemplate: SurveyTemplate; departmentName: string; surveyTypeName: string },
    private fb: FormBuilder,
    public dialogService: DialogService,
    private surveyService: SurveyService,
    private message: MessageService,
  ) {
    this.questions = this.data.surveyTemplate?.questions || [];
    this.loadQuestions(this.questions);
    this.form = this.fb.group({
      name: ['', Validators.required],
      availableDays: ['', Validators.required],
      apply: true,
    });
    if (data.surveyTemplate) {
      this.form.patchValue({ ...data.surveyTemplate });
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  loadQuestions(data: Question[]) {
    this.dataSource = new MatTableDataSource<Question>(data);
  }

  addQuestion() {

  }

  editQuestion(q: Question) {

  }

  deleteQuestion(q: Question) {
    this.dialogService?.deleteConfirm().pipe(
      // tap(result => {
      //   if (result) {
      //     this.surveyService.deleteById(id).pipe(
      //       tap(result => {
      //         if (result?._id) {
      //           this.loadData(this.dataSource.data.filter(item => item._id !== result._id)); // remove from list
      //           this.message.deleteSuccess();
      //         }
      //       }),
      //       catchError(err => this.message.deleteErrorHandle(err))
      //     ).subscribe();
      //   }
      // }),
    ).subscribe();
  }


  update() {
    const response = this.data.surveyTemplate?._id ?
      // update
      this.surveyService.updateById({ ...this.data.surveyTemplate, ...this.form.value }) :
      // create
      this.surveyService.create({
        ...this.form.value,
        department: this.data.surveyTemplate.department,
        type: this.data.surveyTemplate.type
      });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}
