import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'ngx-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
  winHeight = window.innerHeight;
  imgWidth = window.innerWidth;
  maxWidth = window.innerWidth * 2;
  minWidth = window.innerWidth / 2;

  constructor(
    public dialogRef: MatDialogRef<ImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      imgPath: string;
    },
  ) { }

  ngOnInit(): void {
  }

  mouseWheelUpFunc() {
    if (this.imgWidth < this.maxWidth) {
      this.imgWidth = this.imgWidth + 10;
    }
    // console.log('mouse wheel up, image width', this.imgWidth);
  }

  mouseWheelDownFunc() {
    if (this.imgWidth > this.minWidth) {
      this.imgWidth = this.imgWidth - 10;
    }
    // console.log('mouse wheel down, image width', this.imgWidth);
  }

}
