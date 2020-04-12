import { Component } from '@angular/core';
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ConfigService } from '../../../my-core/service/config.service';

@Component({
  selector: 'ngx-ckeditor',
  template: `
    <nb-card>
      <nb-card-header>
        CKEditor
      </nb-card-header>
      <nb-card-body>
        <ckeditor [editor]="Editor"  [config]="config"></ckeditor>
      </nb-card-body>
    </nb-card>
  `,
})
export class CKEditorComponent {
  public Editor = ClassicEditor;
  config: any;

  constructor(
    private configService: ConfigService,
  ) {
    this.config = configService.editorConfig;
  }
}
