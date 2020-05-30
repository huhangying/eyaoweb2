import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: 'main',
    loadChildren: () => import('../app/main/main.module')
      .then(m => m.MainModule),
  },
  {
    path: 'cms',
    loadChildren: () => import('../app/cms/cms.module')
      .then(m => m.CmsModule),
    data: { app: 'cms' }
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/auth/auth.module')
      .then(m => m.AuthModule),
  },
  {
    path: 'wecha',
    // redirectTo: 'auth/404'
    loadChildren: () => import('../app/wechat/wechat.module')
      .then(m => m.WechatModule),
  },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/404' },
];

const config: ExtraOptions = {
  useHash: false,
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  // onSameUrlNavigation: 'reload',
  // enableTracing: true, // <-- debugging purposes only
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, config),
  ],
  exports: [RouterModule],

})
export class AppRoutingModule {
}
