import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';


@Pipe({
  name: 'imgPath'
})
export class ImgPathPipe implements PipeTransform {

  transform(value: string, arg?: string): string {
    if (!value) {
      value = arg === 'person' ? '/assets/images/person.png' : '/assets/images/no-image.png';
      return `http://${environment.defaultServer}` + value;
    }
    if (value.indexOf('data:') === 0 || value.match('^http(s)?://')?.length) return value;
    return `http://${environment.defaultServer}/images/` + value;
  }

}
