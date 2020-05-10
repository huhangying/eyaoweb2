import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropComponent } from './image-crop/image-crop.component';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'ngx-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() width: number;
  @Input() aspectRatio: number;
  @Output() imageReady = new EventEmitter<Blob>();

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  onFileChanged(event: any) {
    if (event.target.files?.length) {
      this.dialog.open(ImageCropComponent, {
        disableClose: true,
        data: {
          fileEvent: event,
          width: this.width,
          aspectRatio: this.aspectRatio
        }
      }).afterClosed().pipe(
        tap(result => {
          this.imageReady.emit(result);
        })
      ).subscribe();
    }
  }

}
