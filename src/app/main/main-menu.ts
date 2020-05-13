import { NbMenuItem } from '@nebular/theme';
import { Params } from '@angular/router';

export function getMenuItems(role: number, queryParams: Params): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'grid-outline',
      link: '/main/dashboard',
    },
    {
      title: '医患管理',
      icon: 'people-outline',
      children: [
        {
          title: '药师',
          link: '/cms/crm/doctor',
          queryParams: queryParams,
        },
        {
          title: '药师用户组',
          link: '/cms/crm/doctor-group',
          queryParams: queryParams,
        },
        {
          title: '病患',
          link: '/cms/crm/patient',
        },
        {
          title: '病患审核',
          link: '/cms/crm/patient-audit',
        },
        {
          title: '医患关系',
          link: '/cms/crm/relationship',
          queryParams: queryParams,
        },

      ],
    },
    {
      title: '预约管理',
      icon: 'calendar-outline',
      children: [
        {
          title: '门诊开设',
          link: '/cms/reservation/schedule',
          queryParams: queryParams,
        },
        {
          title: '门诊预约',
          link: '/cms/reservation/booking',
          queryParams: queryParams,
        },
      ],
    },
  ];
}
