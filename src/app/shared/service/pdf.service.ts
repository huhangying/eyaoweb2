import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { environment } from '../../../environments/environment';
import { LocalDatePipe } from '../pipe/local-date.pipe';
import { Diagnose } from '../../models/diagnose/diagnose.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private localDate: LocalDatePipe,
  ) {
    pdfMake.fonts = {
      fzytk: {
        normal: environment.fontUrl,
        bold: environment.fontUrl,
      }
    };
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  generatePdf(diagnose: Diagnose) {
    const documentDefinition = {
      pageSize: 'A4',
      defaultStyle: {
        font: 'fzytk'
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 15,
          bold: true
        },
        small: {
          fontSize: 8
        },
        block: {
          height: 200,
          minHeight: 200
        }
      },
      content: [
        {
          text: '新华医院药师门诊',
          style: 'header',
          alignment: 'center'
        },
        {
          // layout: 'lightHorizontalLines', // optional
          margin: [5, 10],
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 'auto', 100, '*'],

            body: [
              ['姓名：', '性别：', '年龄：', '日期：' + this.localDate.transform(diagnose.updatedAt)],
              ['科室：', { colSpan: 3, text: '药师：' }],
              // [{ text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4'],
              [{
                // rowSpan: 3,
                colSpan: 4,
                style: 'block',
                text: '处方：\n\n\n\n\n'
              }],
              [{
                colSpan: 4,
                style: 'block',
                // rowSpan: 3,
                text: '门诊结论：\n\n\n\n\n'
              }],
            ]
          }
        },
        // 'This is an深刻搭街坊螺丝扣的 sample PDF printed with pdfMake',
        // { text: 'This paragraph will have a bigger font', fontSize: 15 },
        // {
        //   columns: [
        //     {
        //       // auto-sized columns have their widths based on their content
        //       width: 'auto',
        //       text: 'First column'
        //     },
        //     {
        //       // star-sized columns fill the remaining space
        //       // if there's more than one star-column, available width is divided equally
        //       width: 'auto',
        //       text: 'Second column'
        //     },
        //     {
        //       // fixed width
        //       width: 'auto',
        //       text: 'Third column'
        //     },
        //     {
        //       // percentage width
        //       width: 'auto',
        //       text: 'Last column'
        //     }
        //   ],
        //   columnGap: 10
        // }
      ]
    };
    pdfMake.createPdf(documentDefinition).open();
  }
}
