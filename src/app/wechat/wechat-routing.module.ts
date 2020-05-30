import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WechatComponent } from './wechat.component';
import { EntryComponent } from './entry/entry.component';

const routes: Routes = [{
  path: '',
  component: WechatComponent,
  children: [
    {
      path: '',
      redirectTo: 'entry',
      pathMatch: 'full',
    },
    {
      path: 'entry',
      component: EntryComponent,
    },
  ]
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class WechatRoutingModule {
}
