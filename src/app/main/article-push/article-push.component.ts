import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/doctor.model';
import { AuthService } from '../../shared/service/auth.service';
import { User } from '../../models/user.model';
import { SelectArticleTemplateComponent } from './select-article-template/select-article-template.component';
import { SelectFromHistoryComponent } from './select-from-history/select-from-history.component';
import { ArticleTemplate } from '../../models/education/article-template.model';
import { ArticlePage } from '../../models/education/article-page.model';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ConfigService } from '../../shared/service/config.service';
import { ArticlePreviewComponent } from './article-preview/article-preview.component';

@Component({
  selector: 'ngx-article-push',
  templateUrl: './article-push.component.html',
  styleUrls: ['./article-push.component.scss']
})
export class ArticlePushComponent implements OnInit {
  doctor: Doctor;
  sendees: User[];
  selectedTemplate: ArticleTemplate;
  selectedPage: ArticlePage;

  articlePage: ArticlePage;
  public Editor = ClassicEditor;
  config: any;

  constructor(
    private auth: AuthService,
    private configService: ConfigService,
    public dialog: MatDialog,
    private message: MessageService,
  ) {
    this.doctor = this.auth.getDoctor();
    this.config = configService.editorConfig;
    this.articlePage = {
      doctor: this.doctor._id
    };
  }

  ngOnInit(): void {
  }

  selectSendees() {
    this.dialog.open(SelectDoctorPatientsComponent, {
      data: {
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(results => {
        if (results?.length) {
          this.sendees = results;
        }
      }),
    ).subscribe();
  }

  selectTemplate() {
    this.dialog.open(SelectArticleTemplateComponent, {
      data: {
        departmentId: this.doctor.department
      }
    }).afterClosed().pipe(
      tap((result: ArticleTemplate) => {
        if (result) {
          this.selectedTemplate = result;
          this.articlePage = {
            ...this.articlePage,
            cat: result.cat,
            name: result.name,
            title: result.title,
            title_image: result.title_image,
            content: result.content,
            apply: false
          };
          this.selectedPage = null;
        }
      }),
    ).subscribe();
  }

  selectFromHistory() {
    this.dialog.open(SelectFromHistoryComponent, {
      data: {
        departmentId: this.doctor.department,
        doctorId: this.doctor._id
      }
    }).afterClosed().pipe(
      tap(result => {
        if (result) {
          this.selectedPage = result;
          this.articlePage = {
            ...this.articlePage,
            cat: result.cat,
            name: result.name,
            title: result.title,
            title_image: result.title_image,
            content: result.content,
            apply: false
          };
          this.selectedTemplate = null;
        }
      }),
    ).subscribe();
  }

  isReady(): boolean {
    return this.sendees?.length && !!this.articlePage?.cat;
  }

  preview() {
    // $window.open(CONFIG.baseApiUrl + 'article/' + articleId);
    this.dialog.open(ArticlePreviewComponent, {
      data: {
        article: this.articlePage,
        doctor: this.doctor.name + ' ' + this.doctor.title,
      }
    });
  }

  send() {

  }

}
