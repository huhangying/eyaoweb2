import { Component, OnInit, OnDestroy, Inject, Optional, SkipSelf, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { SurveyService } from '../../../../services/survey.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SurveyTemplate, Question } from '../../../../models/survey/survey-template.model';
import { MessageService } from '../../../../shared/service/message.service';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DialogService } from '../../../../shared/service/dialog.service';
import { SurveyQuestionEditComponent } from './survey-question-edit/survey-question-edit.component';
import { MatSort, MatSortable } from '@angular/material/sort';
import { CoreService } from '../../../../shared/service/core.service';

@Component({
  selector: 'ngx-survey-template-edit',
  templateUrl: './survey-template-edit.component.html',
  styleUrls: ['./survey-template-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyTemplateEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  questions: Question[];
  displayedColumns: string[] = ['order', 'question', 'answer_type', 'options', 'weight', 'apply', 'required'];
  dataSource: MatTableDataSource<Question>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<SurveyTemplateEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { surveyTemplate: SurveyTemplate; departmentName: string; surveyTypeName: string },
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private surveyService: SurveyService,
    private coreService: CoreService,
    private message: MessageService,
  ) {
    this.loadQuestions(this.data.surveyTemplate?.questions || []);
    this.form = this.fb.group({
      name: ['', Validators.required],
      availableDays: ['', Validators.required],
      order: '',
      apply: true,
    });
    if (data.surveyTemplate) {
      this.form.patchValue({ ...data.surveyTemplate });
    }
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('80%');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  loadQuestions(data: Question[]) {
    this.questions = this.coreService.deepClone(data);
    this.dataSource = new MatTableDataSource<Question>(this.questions);
    this.dataSource.sort = this.sort;
    this.cd.markForCheck();
  }

  addQuestion() {
    this.editQuestion(null);
  }

  editQuestion(q: Question, index = -1) {
    this.dialog.open(SurveyQuestionEditComponent, {
      data: q
    }).afterClosed().pipe(
      tap(question => {
        if (!question) return; // dialog close
        const data = [...this.dataSource.data];
        (index === -1) ?
          data.push(question) :  // new question if index = -1
          data[index] = question;
        this.loadQuestions(data);
        // this.message.updateSuccess();
      })
    ).subscribe();
  }

  deleteQuestion(index: number) {
    this.dialogService?.deleteConfirm().pipe(
      tap(result => {
        if (result) {
          const data = [...this.dataSource.data];
          data.splice(index, 1);
          this.loadQuestions(data);
          // this.message.deleteSuccess();
        }
      }),
    ).subscribe();
  }


  update() {
    // update question order
    if (this.questions.length > 1) {
      this.questions = this.questions.sort((a, b) => ((a.order || 0) > (b.order || 0)) ? 1 : -1)
        .map((item, i) => {
          item.order = i + 1;
          return item;
        });
    }
    const response = this.data.surveyTemplate?._id ?
      // update
      this.surveyService.updateSurveyTemplate({
        ...this.data.surveyTemplate,
        ...this.form.value,
        questions: this.questions
      }) :
      // create
      this.surveyService.create({
        ...this.form.value,
        department: this.data.surveyTemplate.department,
        type: this.data.surveyTemplate.type,
        questions: this.questions
      });
    response.pipe(
      tap(rsp => {
        this.dialogRef.close(rsp);
      }),
      catchError(rsp => this.message.updateErrorHandle(rsp)),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  getQuestionTypeLabel(type: number) {
    return type === 0 ? '是非题' : (
      type === 1 ? '单选题' : (
        type === 2 ? '多选题' : (
          type === 3 ? '填空' : ''
        )));
  }

}
