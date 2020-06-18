import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';


@Pipe({
  name: 'imgPath'
})
export class ImgPathPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '/assets/images/no-image.png';
    if (value.indexOf('data:') === 0 || value.match('^http(s)?://')?.length) return value;
    return environment.imageServer + value;
  }

}
