import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Optional, SkipSelf, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { tap, catchError, takeUntil } from 'rxjs/operators';
import { AdviseTemplate } from '../../../../models/survey/advise-template.model';
import { Question } from '../../../../models/survey/survey-template.model';
import { AdviseService } from '../../../../services/advise.service';
import { CoreService } from '../../../../shared/service/core.service';
import { DialogService } from '../../../../shared/service/dialog.service';
import { MessageService } from '../../../../shared/service/message.service';
import { SurveyQuestionEditComponent } from '../../survey-template/survey-template-edit/survey-question-edit/survey-question-edit.component';

@Component({
  selector: 'ngx-advise-template-edit',
  templateUrl: './advise-template-edit.component.html',
  styleUrls: ['./advise-template-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdviseTemplateEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  destroy$ = new Subject<void>();
  questions: Question[];
  displayedColumns: string[] = ['order', 'question', 'answer_type', 'options', 'apply', 'required'];
  dataSource: MatTableDataSource<Question>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<AdviseTemplateEditComponent>,
    @Inject(MAT_DIALOG_DATA) @Optional() @SkipSelf() public data: { adviseTemplate: AdviseTemplate; departmentName: string; },
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private adviseService: AdviseService,
    private coreService: CoreService,
    private message: MessageService,
  ) {
    this.loadQuestions(this.data.adviseTemplate?.questions || []);
    this.form = this.fb.group({
      name: ['', Validators.required],
      order: '',
      apply: true,
    });
    if (data.adviseTemplate) {
      this.form.patchValue({ ...data.adviseTemplate });
    }
  }

  ngOnInit(): void {
    this.dialogRef.updateSize('85%');
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
    const response = this.data.adviseTemplate?._id ?
      // update
      this.adviseService.updateAdviseTemplate({
        ...this.data.adviseTemplate,
        ...this.form.value,
        questions: this.questions
      }) :
      // create
      this.adviseService.create({
        ...this.form.value,
        department: this.data.adviseTemplate.department || undefined,
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
