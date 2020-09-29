import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: number): string {
    if (value < 1) return '';
    const num = Math.round(value) % 60;

    return `${Math.floor(value / 60)}:${num < 10 ? '0' + num : num}`;
  }

}
