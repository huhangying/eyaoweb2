import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Question } from '../../../models/survey/survey-template.model';

@Component({
  selector: 'ngx-advise-questions-edit',
  templateUrl: './advise-questions-edit.component.html',
  styleUrls: ['./advise-questions-edit.component.scss']
})
export class AdviseQuestionsEditComponent implements OnInit {
  @Input() questions: Question[];
  @Input() readonly?: boolean;
  @Output() dirty = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  changeRadioSelection(question: Question, index: number) {
    if (this.readonly) return;
    // const checked = options[index].selected;
    question.options.forEach((option, i) => option.selected = i === index);
    this.markDirty();
  }

  markDirty() {
    this.dirty.emit(true);
  }
}
