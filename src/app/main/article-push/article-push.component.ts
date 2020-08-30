import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../shared/service/message.service';
import { SelectDoctorPatientsComponent } from '../../shared/components/select-doctor-patients/select-doctor-patients.component';
import { tap } from 'rxjs/operators';
import { Doctor } from '../../models/crm/doctor.model';
import { AuthService } from '../../shared/service/auth.service';
import { User } from '../../models/crm/user.model';
import { SelectArticleTemplateComponent } from './select-article-template/select-article-template.component';
import { SelectFromHistoryComponent } from './select-from-history/select-from-history.component';
import { ArticleTemplate } from '../../models/education/article-template.model';
import { ArticlePage } from '../../models/education/article-page.model';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ConfigService } from '../../shared/service/config.service';
import { ArticlePreviewComponent } from './article-preview/article-preview.component';
import { WeixinService } from '../../shared/service/weixin.service';
import { ImgPathPipe } from '../../shared/pipe/img-path.pipe';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'ngx-article-push',
  templateUrl: './article-push.component.html',
  styleUrls: ['./article-push.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private wxService: WeixinService,
    private imgPath: ImgPathPipe,
    private articleService: ArticleService,
    private cd: ChangeDetectorRef,
  ) {
    this.doctor = this.auth.doctor;
    this.config = this.configService.editorConfig;
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
          this.cd.markForCheck();
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
          // reset article page
          this.articlePage = {
            doctor: this.doctor._id,
            cat: result.cat,
            name: result.name,
            title: result.title,
            title_image: result.title_image,
            content: result.content,
          };
          this.selectedPage = null;
          this.cd.markForCheck();
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
          // reset article page
          this.articlePage = {
            doctor: this.doctor._id,
            cat: result.cat,
            name: result.name,
            title: result.title,
            title_image: result.title_image,
            content: result.content,
          };
          this.selectedTemplate = null;
          this.cd.markForCheck();
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
    // save
    this.articleService.savePage(this.articlePage).subscribe(
      (result: ArticlePage) => {
        this.articlePage = { ...result };

        this.sendees.forEach(async (sendee) => {
          // setTimeout(() => {
          if (sendee.link_id) {
            await this.wxService.sendUserMsg(sendee.link_id, this.articlePage.title,
              `${this.doctor.name + ' ' + this.doctor.title} 给您发送了一篇文章`,
              this.doctor.wechatUrl + 'article;id=' + result?._id,
              this.imgPath.transform(this.articlePage.title_image)
            ).toPromise();
          }
          // }, 300);
        });

        // close
        this.message.success('宣教材料推送成功！');
      }
    );

  }

}
