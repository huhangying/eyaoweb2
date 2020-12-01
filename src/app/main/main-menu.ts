import { NbMenuItem } from '@nebular/theme';
import { Params } from '@angular/router';
import { threadId } from 'worker_threads';
import { isScheduler } from 'rxjs/internal-compatibility';

export function getMenuItems(role: number, queryParams: Params, isCs = false): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'grid-outline',
      link: '/main/dashboard',
    },
    {
      title: '药师门诊',
      icon: 'headphones-outline',
      link: '/main/diagnose',
    },
    {
      title: '病患档案',
      icon: 'search',
      link: '/main/patient-search',
    },
    {
      title: '在线咨询',
      icon: 'message-circle-outline',
      link: '/main/chat',
    },
    {
      title: '客服和咨询监管',
      icon: 'smiling-face-outline',
      link: '/main/chat',
      hidden: !isCs,
      queryParams: {...queryParams, type: 0, cs: true},
    },
    {
      title: '付费咨询设置',
      icon: 'award-outline',
      link: '/main/consult',
    },
    {
      title: '预约管理',
      icon: 'calendar-outline',
      children: [
        {
          title: '门诊开设',
          link: '/main/reservation/schedule',
          queryParams: queryParams,
        },
        {
          title: '病患预约',
          link: '/main/reservation/booking',
          queryParams: queryParams,
        },
      ],
    },
    {
      title: '医患管理',
      icon: 'people-outline',
      children: [
        {
          title: '群组管理',
          link: '/main/crm/doctor-group',
          queryParams: queryParams,
        },
        {
          title: '病患审核',
          link: '/main/crm/patient-audit',
        },
        {
          title: '医患关系',
          link: '/main/crm/relationship',
          queryParams: queryParams,
        },

      ],
    },
    {
      title: '宣教材料推送',
      icon: 'map-outline',
      link: '/main/article-push',
    },
    {
      title: '问卷发送',
      icon: 'clipboard-outline',
      link: '/main/survey-push',
    },
    {
      title: '快捷回复管理',
      icon: 'undo-outline',
      link: '/main/shortcuts',
    },
    {
      title: '微信失败消息查看',
      icon: 'alert-triangle-outline',
      link: '/main/msg-failed',
      queryParams: queryParams,
    },
  ];
}
