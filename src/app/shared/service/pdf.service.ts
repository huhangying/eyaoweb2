import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
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
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private localDate: LocalDatePipe,
    private gender: GenderPipe,
    private surveyService: SurveyService,
    private medicineService: MedicineService,
    private departmentService: HospitalService,
    private auth: AuthService,
  ) {
    const fontUrl = `http://${auth.doctor?.serverIp || environment.defaultServer}/assets/FZYTK.TTF`;
    pdfMake.fonts = {
      fzytk: {
        normal: fontUrl,
        bold: fontUrl,
      }
    };
  }

  async generatePdf(diagnose: Diagnose, doctor: any, patient: User, periods: MedicinePeriod[]) { // surveyType: number,
    // const surveyContent = await this.buildSurveyContent(diagnose.doctor, diagnose.user, surveyType, diagnose.surveys);
    const conclusion = await this.buildSurveyContent(diagnose.doctor, diagnose.user, 5, diagnose.surveys);
    const departmentName = (!doctor.department?.name) ?
      (await this.departmentService.getDepartmentById(doctor.department).toPromise())?.name :
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
        },
        non_select_item: {
          color: '#333333'
        },
        select_item: {
          // bold: true
        }
      },
      content: [
        {
          text: doctor.hospitalName + '药师门诊',
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
                text: this.buildPrescription(diagnose.prescription, periods)
              }],
              [{
                colSpan: 4,
                style: 'block',
                text: conclusion
              }],

            ]
          }
        },
      ]
    };

    // if (surveyContent?.length) {
    //   let surveyText = surveyType === 1 ? '初诊问卷\n' : '复诊问卷\n';
    //   surveyText += surveyContent + '\n';
    //   documentDefinition.content[1].table.body.push([{
    //     colSpan: 4,
    //     style: 'block',
    //     text: surveyText
    //   }]);
    // }

    pdfMake.createPdf(documentDefinition, null, pdfMake.fonts).open();
  }

  async buildSurveyContent(doctor: any, patientId: string, surveyType: number, surveyGroups: SurveyGroup[]) {
    const content = [{ text: '门诊结论:\n\n' }];

    const surveyGroup = surveyGroups.find(sg => sg.type === surveyType);
    const list = surveyGroup?.list;
    if (!list?.length) return '';
    const doctorId = doctor?._id ? doctor._id : doctor;
    const surveys = await this.surveyService.GetAllSurveysByUserTypeAndList(doctorId, patientId, surveyType, list.join('|')).toPromise();

    surveys.map((survey: Survey) => {
      // survey name
      if (surveyType !== 5) { // 门诊小结不需要
        content.push({ text: `\n**** ${survey.name} ****\n` });
      }
      survey.questions.map((question, index) => {
        // 只显示病患已经回答的问题和答案
        let isAnswered = false;
        const answers = [];
        if (question.answer_type === 3) {
          isAnswered = !!question.options[0].answer;
          answers.push({ text: '.\t   ' + question.options[0].answer + '\n' });
        } else {
          question.options.map(option => {
            if (option.selected) {
              isAnswered = true;
              answers.push({ text: `●\t${option.answer}\n`, style: 'select_item' });
            } else {
              answers.push({ text: `.\t   ${option.answer}\n`, style: 'non_select_item'});
            }
          });
        }
        if (isAnswered) {
          // index + question name
          content.push({ text: `${index + 1}. ${question.question}\n` });
          content.push(...answers);
          content.push({ text: '\n' });
        }
      });
    });
    return content;
  }

  buildPrescription(prescription: Medicine[], periods: MedicinePeriod[]) {
    const content = [{ text: '处方：\n\n' }];
    if (!prescription?.length) {
      content.push({ text: '\n' });
      return content;
    }
    prescription.map(medicine => {
      content.push({ text: `药名: ${medicine.name} (共${medicine.capacity} ${medicine.unit} X ${medicine.quantity})\n` });
      content.push({
        text: `服用方法: ${medicine.usage}, ${this.medicineService.showDosageInstruction(medicine.dosage, medicine.unit, periods)}
      ${medicine.notes ? '备注: ' + medicine.notes + '\n' : ''}\n`
      });
    });
    return content;
  }

}
