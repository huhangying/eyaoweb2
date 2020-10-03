import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { environment } from '../../../environments/environment';
import { LocalDatePipe } from '../pipe/local-date.pipe';
import { Diagnose } from '../../models/diagnose/diagnose.model';
import { Survey } from '../../models/survey/survey.model';
import { SurveyGroup } from '../../models/survey/survey-group.model';
import { SurveyService } from '../../services/survey.service';
import { User } from '../../models/crm/user.model';
import { GenderPipe } from '../pipe/gender.pipe';
import { Medicine } from '../../models/hospital/medicine.model';
import { MedicinePeriod } from '../../models/hospital/medicine-references.model';
import { MedicineService } from '../../services/medicine.service';
import { HospitalService } from '../../services/hospital.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private localDate: LocalDatePipe,
    private gender: GenderPipe,
    private surveyService: SurveyService,
    private medicineService: MedicineService,
    private departmentService: HospitalService
  ) {
    pdfMake.fonts = {
      fzytk: {
        normal: environment.fontUrl,
        bold: environment.fontUrl,
      }
    };
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  async generatePdf(diagnose: Diagnose, doctor: any, patient: User, surveyType: number, periods: MedicinePeriod[]) {
    const surveyContent = await this.buildSurveyContent(diagnose.doctor, diagnose.user, surveyType, diagnose.surveys);
    const conclusionSurvey = await this.buildSurveyContent(diagnose.doctor, diagnose.user, 5, diagnose.surveys);
    const departmentName = (!doctor.department?.name) ?
      (await this.departmentService.getDepartmentById(doctor.department).toPromise())?.name:
      doctor.department?.name;

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
          text: '新华医院药师门诊', //todo: not hardcoded
          style: 'header',
          alignment: 'center'
        },
        {
          // layout: 'lightHorizontalLines', // optional
          margin: [5, 15, 5, 5],
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['*', 80, 80, '*'],

            body: [
              [
                '姓名：' + patient.name,
                '性别：' + this.gender.transform(patient.gender),
                '年龄：' + this.localDate.transform(patient.birthdate, 'age'),
                '日期：' + this.localDate.transform(diagnose.updatedAt)
              ],
              [
                '科室：' + departmentName,
                { colSpan: 3, text: `药师：${doctor.name} ${doctor.title}` }
              ],
              [{
                colSpan: 4,
                style: 'block',
                text: '处方：\n\n' + this.buildPrescription(diagnose.prescription, periods) + '\n'
              }],
              [{
                colSpan: 4,
                style: 'block',
                text: `门诊结论:\n
                ${conclusionSurvey}\n`
              }],

            ]
          }
        },
      ]
    };

    if (surveyContent?.length) {
      let surveyText = surveyType === 1 ? '初诊问卷\n' : '复诊问卷\n';
      surveyText += surveyContent + '\n';
      documentDefinition.content[1].table.body.push([{
        colSpan: 4,
        style: 'block',
        text: surveyText
      }]);
    }

    pdfMake.createPdf(documentDefinition).open();
  }

  async buildSurveyContent(doctor: any, patientId: string, surveyType: number, surveyGroups: SurveyGroup[]) {
    const surveyGroup = surveyGroups.find(sg => sg.type === surveyType);
    const list = surveyGroup?.list;
    if (!list?.length) return '';
    const doctorId = doctor?._id ? doctor._id : doctor;
    const surveys = await this.surveyService.GetSurveysByUserTypeAndList(doctorId, patientId, surveyType, list.join('|')).toPromise();

    let text = '';
    surveys.map((survey: Survey) => {
      // survey name
      if (surveyType !== 5) { // 门诊小结不需要
        text += `\n**** ${survey.name} ****\n`;
      }
      survey.questions.map((question, index) => {
        // 只显示病患已经回答的问题和答案
        let isAnswered = false;
        let answerText = '';
        if (question.answer_type === 3) {
          isAnswered = !!question.options[0].answer;
          answerText = '       ' + question.options[0].answer + '\n';
        } else {
          question.options.map(option => {
            if (option.selected) {
              isAnswered = true;
              answerText += `●\t${option.answer}\n`;
            } else {
              answerText += `.\t   ${option.answer}\n`;
            }
          });
        }
        if (isAnswered) {
          // index + question name
          text += `${index + 1}. ${question.question}\n`;
          text += answerText + '\n';
        }
      });
    });
    return text;
  }

  buildPrescription(prescription: Medicine[], periods: MedicinePeriod[]) {
    if (!prescription?.length) return '\n\n';
    return prescription.map(medicine => {
      return `药名: ${medicine.name} (共${medicine.capacity} ${medicine.unit} X ${medicine.quantity})
        服用方法: ${medicine.usage}, ${this.medicineService.showDosageInstruction(medicine.dosage, medicine.unit, periods)}
        ${medicine.notes ? '备注: ' + medicine.notes + '\n' : ''}\n`;
    }).join('');
  }

}
